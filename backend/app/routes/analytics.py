from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import Date, Numeric, text
from sqlalchemy.orm import Session

from app.auth import require_owner
from app.database import get_db

router = APIRouter(prefix='/analytics', tags=['owner analytics'], dependencies=[Depends(require_owner)])
ZERO = Decimal('0.00')


class SalesMetrics(BaseModel):
    cars_sold: int
    priced_sales: int
    sales_revenue: Decimal
    gross_margin: Decimal
    average_days_to_sell: Optional[Decimal]
    days_to_sell_samples: int


class MonthlySales(SalesMetrics):
    month: str


class InventoryMetrics(BaseModel):
    vehicles: int
    available: int
    pending: int
    purchase_value: Decimal
    asking_value: Decimal


class AgingVehicle(BaseModel):
    id: int
    year: int
    make: str
    model: str
    status: str
    bought_date: Optional[date]
    days_in_inventory: Optional[int]
    purchase_price: Decimal


class DataQuality(BaseModel):
    undated_sales: int
    missing_sale_prices: int
    invalid_sale_dates: int
    missing_purchase_dates: int
    future_inventory_purchase_dates: int


class AnalyticsResponse(BaseModel):
    start_date: Optional[date]
    end_date: Optional[date]
    as_of: date
    sales: SalesMetrics
    inventory: InventoryMetrics
    monthly: list[MonthlySales]
    aging_inventory: list[AgingVehicle]
    quality: DataQuality


def metrics(rows):
    priced = [row for row in rows if row['sale_price'] is not None]
    days = [(row['sold_date'] - row['bought_date']).days for row in rows
            if row['sold_date'] is not None and row['bought_date'] is not None
            and row['sold_date'] >= row['bought_date']]
    return SalesMetrics(
        cars_sold=len(rows), priced_sales=len(priced),
        sales_revenue=sum((row['sale_price'] for row in priced), ZERO),
        gross_margin=sum((row['sale_price'] - row['purchase_price'] for row in priced), ZERO),
        average_days_to_sell=(Decimal(sum(days)) / len(days)).quantize(Decimal('.1')) if days else None,
        days_to_sell_samples=len(days),
    )


@router.get('', response_model=AnalyticsResponse)
def analytics(start_date: Optional[date] = None, end_date: Optional[date] = None, db: Session = Depends(get_db)):
    if start_date and end_date and start_date > end_date:
        raise HTTPException(422, 'Start date must be on or before end date.')
    today = datetime.now(ZoneInfo('America/Chicago')).date()
    # One snapshot keeps inventory, sales and monthly calculations consistent.
    rows = db.execute(text(
        'SELECT id, year, make, model, status, purchase_price, asking_price, '
        'bought_date, sale_price, sold_date FROM public.vehicles'
    ).columns(purchase_price=Numeric(12, 2), asking_price=Numeric(12, 2),
              sale_price=Numeric(12, 2), bought_date=Date(), sold_date=Date())).mappings().all()
    sold = [row for row in rows if row['status'] == 'sold']
    # All-time totals include undated sales; dated reports cannot assign them a period.
    selected = [row for row in sold if
                (not start_date or (row['sold_date'] is not None and row['sold_date'] >= start_date)) and
                (not end_date or (row['sold_date'] is not None and row['sold_date'] <= end_date))]
    inventory = [row for row in rows if row['status'] in ('available', 'pending')]
    months = {}
    for row in selected:
        if row['sold_date'] is not None:
            months.setdefault(row['sold_date'].strftime('%Y-%m'), []).append(row)
    monthly = []
    if months:
        first = start_date or date.fromisoformat(min(months) + '-01')
        last = end_date or max(today, date.fromisoformat(max(months) + '-01'))
        year, month = first.year, first.month
        while (year, month) <= (last.year, last.month):
            key = f'{year:04d}-{month:02d}'
            monthly.append(MonthlySales(month=key, **metrics(months.get(key, [])).model_dump()))
            year, month = (year + 1, 1) if month == 12 else (year, month + 1)
    aging = [AgingVehicle(
        id=row['id'], year=row['year'], make=row['make'], model=row['model'], status=row['status'],
        bought_date=row['bought_date'], purchase_price=row['purchase_price'],
        days_in_inventory=(today - row['bought_date']).days if row['bought_date'] and row['bought_date'] <= today else None,
    ) for row in inventory]
    aging.sort(key=lambda row: (row.days_in_inventory is None, -(row.days_in_inventory or 0), row.id))
    return AnalyticsResponse(
        start_date=start_date, end_date=end_date, as_of=today, sales=metrics(selected),
        inventory=InventoryMetrics(vehicles=len(inventory),
            available=sum(row['status'] == 'available' for row in inventory),
            pending=sum(row['status'] == 'pending' for row in inventory),
            purchase_value=sum((row['purchase_price'] for row in inventory), ZERO),
            asking_value=sum((row['asking_price'] for row in inventory), ZERO)),
        monthly=monthly, aging_inventory=aging[:20],
        quality=DataQuality(
            undated_sales=sum(row['sold_date'] is None for row in sold),
            missing_sale_prices=sum(row['sale_price'] is None for row in selected),
            invalid_sale_dates=sum(row['sold_date'] is not None and row['bought_date'] is not None
                                   and row['sold_date'] < row['bought_date'] for row in selected),
            missing_purchase_dates=sum(row['bought_date'] is None for row in inventory),
            future_inventory_purchase_dates=sum(row['bought_date'] is not None and row['bought_date'] > today for row in inventory),
        ),
    )
