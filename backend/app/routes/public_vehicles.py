from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Path, Query
from pydantic import BaseModel, Field
from decimal import Decimal
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.routes.vehicle_images import VehicleImage, images_for_vehicles

router = APIRouter(prefix="/public/vehicles", tags=["public inventory"])
COLUMNS = "id, vin, make, model, year, mileage, asking_price, description"


class PublicVehicle(BaseModel):
    id: int
    vin: str
    make: str
    model: str
    year: int
    mileage: int
    asking_price: Decimal
    description: Optional[str]
    images: list[VehicleImage] = Field(default_factory=list)


@router.get("", response_model=list[PublicVehicle])
def list_public_vehicles(limit: int = Query(20, ge=1, le=100), offset: int = Query(0, ge=0), db: Session = Depends(get_db)):
    rows = db.execute(text(f"SELECT {COLUMNS} FROM public.vehicles WHERE status = 'available' ORDER BY id LIMIT :limit OFFSET :offset"),
                      {"limit": limit, "offset": offset}).mappings().all()
    images = images_for_vehicles(db, [row["id"] for row in rows])
    return [{**dict(row), "images": images.get(row["id"], [])} for row in rows]


@router.get("/{vehicle_id}", response_model=PublicVehicle)
def public_vehicle(vehicle_id: int = Path(ge=1), db: Session = Depends(get_db)):
    row = db.execute(text(f"SELECT {COLUMNS} FROM public.vehicles WHERE id = :id AND status = 'available'"),
                     {"id": vehicle_id}).mappings().one_or_none()
    if row is None:
        raise HTTPException(404, "Vehicle not found.")
    return {**dict(row), "images": images_for_vehicles(db, [vehicle_id]).get(vehicle_id, [])}
