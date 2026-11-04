from datetime import date, datetime
from decimal import Decimal
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Path, Query, Response
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.routes.vehicle_images import VehicleImage, images_for_vehicles

router = APIRouter(prefix="/vehicles", tags=["vehicles"])





class VehicleCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    vin: str = Field(min_length=1, max_length=17)
    make: str = Field(min_length=1, max_length=50)
    model: str = Field(min_length=1, max_length=50)
    year: int = Field(ge=1, le=32767)
    status: Literal["available", "pending", "sold"] = "available"
    bought_date: Optional[date] = None
    mileage: int = Field(ge=0)
    purchase_price: Decimal = Field(ge=0, max_digits=12, decimal_places=2, allow_inf_nan=False)
    asking_price: Decimal = Field(ge=0, max_digits=12, decimal_places=2, allow_inf_nan=False)
    description: Optional[str] = None
    sale_price: Optional[Decimal] = Field(default=None, ge=0, max_digits=12, decimal_places=2, allow_inf_nan=False)
    sold_date: Optional[date] = None

    @field_validator("vin")
    @classmethod
    def normalize_vin(cls, value: str) -> str:
        return value.upper()


class VehicleResponse(VehicleCreate):
    id: int
    created_at: datetime
    updated_at: datetime
    images: list[VehicleImage] = Field(default_factory=list)


class VehicleUpdate(VehicleCreate):
    vin: Optional[str] = Field(default=None, min_length=1, max_length=17)
    make: Optional[str] = Field(default=None, min_length=1, max_length=50)
    model: Optional[str] = Field(default=None, min_length=1, max_length=50)
    year: Optional[int] = Field(default=None, ge=1, le=32767)
    status: Optional[Literal["available", "pending", "sold"]] = None
    mileage: Optional[int] = Field(default=None, ge=0)
    purchase_price: Optional[Decimal] = Field(default=None, ge=0, max_digits=12, decimal_places=2, allow_inf_nan=False)
    asking_price: Optional[Decimal] = Field(default=None, ge=0, max_digits=12, decimal_places=2, allow_inf_nan=False)

    @field_validator("vin")
    @classmethod
    def normalize_vin(cls, value: Optional[str]) -> Optional[str]:
        return value.upper() if value is not None else None

    @model_validator(mode="after")
    def validate_changes(self):
        if not self.model_fields_set:
            raise ValueError("Provide at least one field to update.")
        for field in self.model_fields_set - {"bought_date", "description", "sale_price", "sold_date"}:
            if getattr(self, field) is None:
                raise ValueError(f"{field} cannot be null.")
        return self


@router.patch("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(
    vehicle: VehicleUpdate,
    vehicle_id: int = Path(ge=1),
    db: Session = Depends(get_db),
):
    changes = vehicle.model_dump(exclude_unset=True)
    current = db.execute(text("SELECT status, sale_price, sold_date FROM public.vehicles WHERE id = :vehicle_id"), {"vehicle_id": vehicle_id}).mappings().one_or_none()
    if current is None:
        raise HTTPException(404, "Vehicle not found.")
    validate_sale({**dict(current), **changes})
    # Column names come only from the validated model; values stay parameterized.
    assignments = ", ".join(f"{field} = :{field}" for field in changes)
    try:
        row = db.execute(
            text(
                f"UPDATE public.vehicles SET {assignments}, updated_at = NOW() "
                "WHERE id = :vehicle_id "
                "RETURNING id, created_at, updated_at, vin, make, model, year, status, bought_date, mileage, purchase_price, asking_price, description, sale_price, sold_date"
            ),
            {**changes, "vehicle_id": vehicle_id},
        ).mappings().one_or_none()
        if row is None:
            raise HTTPException(status_code=404, detail="Vehicle not found.")
        result = VehicleResponse.model_validate(dict(row))
        db.commit()
        return result
    except IntegrityError as exc:
        db.rollback()
        if getattr(exc.orig, "sqlstate", None) == "23505":
            raise HTTPException(status_code=409, detail="A vehicle with this VIN already exists.") from exc
        raise HTTPException(status_code=422, detail="Vehicle data violates a database constraint.") from exc


@router.post("", response_model=VehicleResponse, status_code=201)
def create_vehicle(vehicle: VehicleCreate, db: Session = Depends(get_db)):
    validate_sale(vehicle.model_dump())
    try:
        row = db.execute(
            text(
                "INSERT INTO public.vehicles "
                "(vin, make, model, year, status, bought_date, mileage, purchase_price, asking_price, description, sale_price, sold_date) "
                "VALUES (:vin, :make, :model, :year, :status, :bought_date, :mileage, :purchase_price, :asking_price, :description, :sale_price, :sold_date) "
                "RETURNING id, created_at, updated_at, vin, make, model, year, status, bought_date, mileage, purchase_price, asking_price, description, sale_price, sold_date"
            ),
            vehicle.model_dump(),
        ).mappings().one()
        result = VehicleResponse.model_validate(dict(row))
        db.commit()
        return result
    except IntegrityError as exc:
        db.rollback()
        if getattr(exc.orig, "sqlstate", None) == "23505":
            raise HTTPException(status_code=409, detail="A vehicle with this VIN already exists.") from exc
        raise HTTPException(status_code=422, detail="Vehicle data violates a database constraint.") from exc


@router.get("", response_model=list[VehicleResponse])
def list_vehicles(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    status: Optional[Literal["available", "pending", "sold"]] = None,
    db: Session = Depends(get_db),
):
    rows = db.execute(
        text(
            "SELECT id, created_at, updated_at, vin, make, model, year, status, bought_date, mileage, purchase_price, asking_price, description, sale_price, sold_date "
            "FROM public.vehicles "
            + ("WHERE status = :status " if status is not None else "")
            + "ORDER BY id LIMIT :limit OFFSET :offset"
        ),
        {"limit": limit, "offset": offset, "status": status},
    ).mappings().all()
    images = images_for_vehicles(db, [row["id"] for row in rows])
    return [{**dict(row), "images": images.get(row["id"], [])} for row in rows]


@router.delete("/{vehicle_id}", status_code=204, response_class=Response)
def delete_vehicle(
    vehicle_id: int = Path(ge=1),
    db: Session = Depends(get_db),
):
    try:
        deleted_id = db.execute(
            text("DELETE FROM public.vehicles WHERE id = :vehicle_id RETURNING id"),
            {"vehicle_id": vehicle_id},
        ).scalar_one_or_none()
        if deleted_id is None:
            raise HTTPException(status_code=404, detail="Vehicle not found.")
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Vehicle cannot be deleted because it is referenced by other records.",
        ) from exc
    return Response(status_code=204)


def validate_sale(vehicle):
    if vehicle["status"] == "sold" and (vehicle.get("sale_price") is None or vehicle.get("sold_date") is None):
        raise HTTPException(422, "Sale price and sale date are required when sold.")


@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(vehicle_id: int = Path(ge=1), db: Session = Depends(get_db)):
    row = db.execute(text("SELECT id, created_at, updated_at, vin, make, model, year, status, bought_date, mileage, purchase_price, asking_price, description, sale_price, sold_date FROM public.vehicles WHERE id = :vehicle_id"), {"vehicle_id": vehicle_id}).mappings().one_or_none()
    if row is None:
        raise HTTPException(404, "Vehicle not found.")
    return {**dict(row), "images": images_for_vehicles(db, [vehicle_id]).get(vehicle_id, [])}
