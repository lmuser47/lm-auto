from datetime import datetime
from io import BytesIO
import warnings
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Path, Response, UploadFile
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.storage import get_vehicle_image_bucket

router = APIRouter(prefix="/vehicles/{vehicle_id}/images", tags=["vehicle images"])
MAX_BYTES = 10 * 1024 * 1024
FORMATS = {"JPEG": ("jpg", "image/jpeg"), "PNG": ("png", "image/png"), "WEBP": ("webp", "image/webp")}


class VehicleImage(BaseModel):
    id: int
    vehicle_id: int
    position: int
    created_at: datetime
    url: str


def image_response(row, bucket):
    return VehicleImage(**{key: row[key] for key in ("id", "vehicle_id", "position", "created_at")},
                        url=bucket.get_public_url(row["storage_path"]))


def images_for_vehicles(db, vehicle_ids):
    if not vehicle_ids:
        return {}
    from sqlalchemy import bindparam
    rows = db.execute(text(
        "SELECT id, vehicle_id, storage_path, position, created_at FROM public.vehicle_images "
        "WHERE vehicle_id IN :ids ORDER BY position, id"
    ).bindparams(bindparam("ids", expanding=True)), {"ids": vehicle_ids}).mappings().all()
    grouped = {}
    if rows:
        bucket = get_vehicle_image_bucket()
        for row in rows:
            grouped.setdefault(row["vehicle_id"], []).append(image_response(row, bucket))
    return grouped


def require_vehicle(db, vehicle_id, lock=False):
    query = "SELECT id FROM public.vehicles WHERE id = :id" + (" FOR UPDATE" if lock else "")
    if db.execute(text(query), {"id": vehicle_id}).scalar_one_or_none() is None:
        raise HTTPException(404, "Vehicle not found.")


@router.get("", response_model=list[VehicleImage])
def list_images(vehicle_id: int = Path(ge=1), db: Session = Depends(get_db)):
    require_vehicle(db, vehicle_id)
    return images_for_vehicles(db, [vehicle_id]).get(vehicle_id, [])


@router.post("", response_model=VehicleImage, status_code=201)
def upload_image(vehicle_id: int = Path(ge=1), file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        content = file.file.read(MAX_BYTES + 1)
    finally:
        file.file.close()
    if len(content) > MAX_BYTES:
        raise HTTPException(413, "Image must be 10 MB or smaller.")
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(BytesIO(content)) as image:
                image_format = image.format
                if image_format not in FORMATS:
                    raise HTTPException(422, "Use JPEG, PNG, or WebP images.")
                image.verify()
    except (UnidentifiedImageError, OSError, SyntaxError, Image.DecompressionBombWarning, Image.DecompressionBombError):
        raise HTTPException(422, "Invalid or excessively large image.")
    require_vehicle(db, vehicle_id, lock=True)
    extension, mime = FORMATS[image_format]
    path = f"vehicles/{vehicle_id}/{uuid4().hex}.{extension}"
    bucket = get_vehicle_image_bucket()
    try:
        bucket.upload(path, content, {"content-type": mime, "upsert": "false"})
    except Exception as exc:
        db.rollback()
        raise HTTPException(502, "Image storage upload failed. Please retry.") from exc
    try:
        row = db.execute(text(
            "INSERT INTO public.vehicle_images (vehicle_id, storage_path, position) "
            "VALUES (:vehicle_id, :path, (SELECT COALESCE(MAX(position), -1) + 1 "
            "FROM public.vehicle_images WHERE vehicle_id = :vehicle_id)) "
            "RETURNING id, vehicle_id, storage_path, position, created_at"
        ), {"vehicle_id": vehicle_id, "path": path}).mappings().one()
        result = image_response(row, bucket)
        db.commit()
        return result
    except Exception:
        db.rollback()
        try:
            bucket.remove([path])
        except Exception:
            import logging
            logging.getLogger(__name__).error("Image metadata save failed; storage cleanup requires retry.")
        raise


@router.delete("/{image_id}", status_code=204, response_class=Response)
def delete_image(vehicle_id: int = Path(ge=1), image_id: int = Path(ge=1), db: Session = Depends(get_db)):
    require_vehicle(db, vehicle_id, lock=True)
    row = db.execute(text(
        "SELECT storage_path FROM public.vehicle_images WHERE id = :id AND vehicle_id = :vehicle_id"
    ), {"id": image_id, "vehicle_id": vehicle_id}).mappings().one_or_none()
    if row is None:
        raise HTTPException(404, "Vehicle image not found.")
    try:
        get_vehicle_image_bucket().remove([row["storage_path"]])
    except Exception as exc:
        db.rollback()
        raise HTTPException(502, "Image storage deletion failed. Please retry.") from exc
    db.execute(text("DELETE FROM public.vehicle_images WHERE id = :id"), {"id": image_id})
    db.commit()
    return Response(status_code=204)
