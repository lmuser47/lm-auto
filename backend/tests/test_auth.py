import os
import unittest
from unittest.mock import patch
import httpx
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from app.main import app
from app.database import get_db

OWNER = 'ef92b084-90c6-4c94-bafa-856e9ca6ee00'
OTHER = 'c6d13d4c-e6de-41eb-857b-4cdf4571bac8'


class AuthenticationTests(unittest.TestCase):
    def setUp(self):
        self.env = patch.dict(os.environ, {'OWNER_USER_ID':OWNER,'SUPABASE_URL':'https://example.supabase.co','SUPABASE_SECRET_KEY':'test-secret'})
        self.env.start()
        self.client = TestClient(app)

    def tearDown(self):
        self.env.stop(); self.client.close(); app.dependency_overrides.clear()

    def test_anonymous_cannot_access_any_management_route(self):
        for method,path in [('GET','/auth/me'),('GET','/vehicles'),('GET','/vehicles/1'),('POST','/vehicles'),('PATCH','/vehicles/1'),('DELETE','/vehicles/1'),('GET','/vehicles/1/images'),('POST','/vehicles/1/images'),('DELETE','/vehicles/1/images/1')]:
            response = self.client.request(method,path)
            self.assertEqual(response.status_code,401,(method,path,response.text))
            self.assertEqual(response.headers['www-authenticate'],'Bearer')

    def test_owner_identity_is_verified_with_supabase(self):
        with patch('app.auth.httpx.get',return_value=httpx.Response(200,json={'id':OWNER,'email':'owner@example.test'})) as get:
            response=self.client.get('/auth/me',headers={'Authorization':'Bearer valid-token'})
            self.assertEqual(response.status_code,200)
            self.assertEqual(response.json()['id'],OWNER)
            self.assertEqual(get.call_args.kwargs['headers']['Authorization'],'Bearer valid-token')
        with patch('app.auth.httpx.get',return_value=httpx.Response(200,json={'id':OTHER})):
            self.assertEqual(self.client.get('/auth/me',headers={'Authorization':'Bearer other'}).status_code,403)
        with patch('app.auth.httpx.get',return_value=httpx.Response(401,json={})):
            self.assertEqual(self.client.get('/auth/me',headers={'Authorization':'Bearer expired'}).status_code,401)
        with patch('app.auth.httpx.get',side_effect=httpx.ConnectError('unavailable')):
            self.assertEqual(self.client.get('/auth/me',headers={'Authorization':'Bearer token'}).status_code,503)
        with patch.dict(os.environ,{'OWNER_USER_ID':''}):
            self.assertEqual(self.client.get('/auth/me',headers={'Authorization':'Bearer token'}).status_code,503)

    def test_public_inventory_excludes_financials_and_non_available_cars(self):
        engine=create_engine('sqlite://',connect_args={'check_same_thread':False})
        connection=engine.connect()
        connection.execute(text("ATTACH DATABASE ':memory:' AS public"))
        connection.execute(text('CREATE TABLE public.vehicles (id INTEGER, vin TEXT, make TEXT, model TEXT, year INTEGER, mileage INTEGER, asking_price NUMERIC, description TEXT, status TEXT, purchase_price NUMERIC, sale_price NUMERIC)'))
        connection.execute(text("INSERT INTO public.vehicles VALUES (1,'TEST','Honda','Accord',2024,100,20000,'Description','available',10000,NULL),(2,'SOLD','Honda','Civic',2023,200,15000,'Sold','sold',9000,14000),(3,'PENDING','Toyota','Camry',2024,300,22000,NULL,'pending',10000,NULL)"))
        connection.execute(text('CREATE TABLE public.vehicle_images (id INTEGER, vehicle_id INTEGER, storage_path TEXT, position INTEGER, created_at TEXT)'))
        connection.commit()
        db=Session(bind=connection)
        app.dependency_overrides[get_db]=lambda: db
        try:
            response=self.client.get('/public/vehicles')
            self.assertEqual(response.status_code,200,response.text)
            self.assertEqual(len(response.json()),1)
            car=response.json()[0]
            self.assertEqual(car['id'],1)
            for field in ('purchase_price','sale_price','sold_date','bought_date'):
                self.assertNotIn(field,car)
            self.assertEqual(self.client.get('/public/vehicles/1').status_code,200)
            for vehicle_id in (2,3,999):
                self.assertEqual(self.client.get(f'/public/vehicles/{vehicle_id}').status_code,404)
            self.assertEqual(self.client.get('/public/vehicles?limit=101').status_code,422)
            self.assertEqual(self.client.get('/public/vehicles/0').status_code,422)
            response=self.client.options('/vehicles',headers={'Origin':'http://localhost:3000','Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'authorization,content-type'})
            self.assertEqual(response.status_code,200)
        finally: db.close(); connection.close(); engine.dispose()
