from datetime import datetime, timezone
from decimal import Decimal
import sqlite3
import unittest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from app.main import app
from app.database import get_db
from app.auth import require_owner
from test_vehicle_images import TestSession


class SalesTests(unittest.TestCase):
    def test_sale_roundtrip_and_validation(self):
        sqlite3.register_adapter(Decimal, str)
        engine = create_engine('sqlite://', connect_args={'check_same_thread': False})
        connection = engine.connect()
        connection.connection.driver_connection.create_function('NOW', 0, lambda: datetime.now(timezone.utc).isoformat())
        connection.execute(text("ATTACH DATABASE ':memory:' AS public"))
        connection.execute(text('CREATE TABLE public.vehicles (id INTEGER PRIMARY KEY, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP, vin TEXT UNIQUE, make TEXT, model TEXT, year INTEGER, mileage INTEGER, purchase_price NUMERIC, asking_price NUMERIC, bought_date DATE, status TEXT, description TEXT, sale_price NUMERIC, sold_date DATE)'))
        connection.execute(text('CREATE TABLE public.vehicle_images (id INTEGER, vehicle_id INTEGER, storage_path TEXT, position INTEGER, created_at TEXT)'))
        connection.commit()
        db = TestSession(bind=connection)
        app.dependency_overrides[get_db] = lambda: db
        app.dependency_overrides[require_owner] = lambda: {"id": "test-owner"}
        payload = dict(vin='SALESTEST', make='Honda', model='Accord', year=2020, mileage=100, purchase_price='10000', asking_price='14000')
        try:
            with TestClient(app) as c:
                created = c.post('/vehicles', json=payload)
                self.assertEqual(created.status_code, 201, created.text)
                self.assertIsNone(created.json()['sale_price'])
                self.assertEqual(c.patch('/vehicles/1', json={'status':'sold'}).status_code, 422)
                self.assertEqual(c.get('/vehicles/1').json()['status'], 'available')
                r = c.patch('/vehicles/1', json={'status':'sold','sale_price':'13500.25','sold_date':'2026-10-21'})
                self.assertEqual(r.status_code, 200, r.text)
                self.assertEqual(Decimal(r.json()['sale_price']), Decimal('13500.25'))
                self.assertEqual(Decimal(r.json()['asking_price']), Decimal('14000'))
                self.assertEqual(r.json()['sold_date'], '2026-10-21')
                self.assertEqual(c.get('/vehicles').json()[0]['sold_date'], '2026-10-21')
                self.assertEqual(c.patch('/vehicles/1',json={'description':'Updated'}).status_code,200)
                self.assertEqual(c.patch('/vehicles/1',json={'sale_price':None}).status_code,422)
                self.assertEqual(c.patch('/vehicles/1',json={'sale_price':-1}).status_code,422)
                self.assertEqual(c.patch('/vehicles/1',json={'sale_price':'1.001'}).status_code,422)
                self.assertEqual(c.patch('/vehicles/1',json={'sold_date':'invalid'}).status_code,422)
                self.assertEqual(c.patch('/vehicles/1',json={'status':'available','sale_price':None,'sold_date':None}).status_code,200)
                self.assertEqual(c.patch('/vehicles/999',json={'status':'sold'}).status_code,404)
        finally:
            app.dependency_overrides.clear(); db.close(); connection.close(); engine.dispose()
