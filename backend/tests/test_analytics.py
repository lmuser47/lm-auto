from datetime import datetime, timezone, date
from decimal import Decimal
import os
import unittest
from unittest.mock import patch
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from app.main import app
from app.database import get_db
from app.auth import require_owner


class AnalyticsTests(unittest.TestCase):
    def setUp(self):
        self.owner_env=patch.dict(os.environ,{'OWNER_USER_ID':'00000000-0000-4000-8000-000000000001'})
        self.owner_env.start()
        self.engine=create_engine('sqlite://',connect_args={'check_same_thread':False})
        self.connection=self.engine.connect()
        self.connection.execute(text("ATTACH DATABASE ':memory:' AS public"))
        self.connection.execute(text('CREATE TABLE public.vehicles (id INTEGER PRIMARY KEY, year INTEGER, make TEXT, model TEXT, status TEXT, purchase_price NUMERIC, asking_price NUMERIC, bought_date DATE, sale_price NUMERIC, sold_date DATE)'))
        self.connection.commit()
        self.db=Session(bind=self.connection)
        app.dependency_overrides[get_db]=lambda:self.db
        app.dependency_overrides[require_owner]=lambda:{'id':'owner'}
        self.client=TestClient(app)
        self.clock=patch('app.routes.analytics.datetime')
        self.clock.start().now.return_value=datetime(2026,10,22,15,tzinfo=timezone.utc)

    def tearDown(self):
        self.owner_env.stop(); self.clock.stop(); self.client.close(); app.dependency_overrides.clear()
        self.db.close(); self.connection.close(); self.engine.dispose()

    def seed(self):
        values=[
            (1,'sold','10000.10','13000.20','2026-01-01','2026-01-10'),
            (2,'sold','9000','8500','2026-02-10','2026-02-20'),
            (3,'sold','5000',None,'2026-02-01','2026-02-25'),
            (4,'sold','4000','6000',None,None),
            (5,'sold','1000','2000','2026-03-03','2026-03-01'),
            (6,'available','2000',None,'2026-01-01',None),
            (7,'pending','1000','999',None,None),
            (8,'available','1234.56',None,'2026-11-01',None),
        ]
        for ident,status,purchase,sale,bought,sold in values:
            asking={6:3000,7:2000,8:1400}.get(ident,15000)
            self.connection.execute(text("INSERT INTO public.vehicles VALUES (:id,2024,'Honda','Accord',:status,:purchase,:asking,:bought,:sale,:sold)"),dict(id=ident,status=status,purchase=purchase,asking=asking,bought=bought,sale=sale,sold=sold))
        self.connection.commit()

    def test_all_time_totals_missing_data_and_current_inventory(self):
        self.seed()
        response=self.client.get('/analytics')
        self.assertEqual(response.status_code,200,response.text)
        self.assertEqual(response.headers['cache-control'],'no-store')
        result=response.json(); sales=result['sales']; inventory=result['inventory']
        self.assertEqual(sales['cars_sold'],5); self.assertEqual(sales['priced_sales'],4)
        self.assertEqual(Decimal(sales['sales_revenue']),Decimal('29500.20'))
        self.assertEqual(Decimal(sales['gross_margin']),Decimal('5500.10'))
        self.assertEqual(sales['average_days_to_sell'],'14.3'); self.assertEqual(sales['days_to_sell_samples'],3)
        self.assertEqual(inventory['vehicles'],3); self.assertEqual(inventory['available'],2); self.assertEqual(inventory['pending'],1)
        self.assertEqual(Decimal(inventory['purchase_value']),Decimal('4234.56'))
        self.assertEqual(Decimal(inventory['asking_value']),Decimal('6400'))
        self.assertEqual(result['quality'],dict(undated_sales=1,missing_sale_prices=1,invalid_sale_dates=1,missing_purchase_dates=1,future_inventory_purchase_dates=1))
        self.assertEqual(result['aging_inventory'][0]['id'],6)
        self.assertEqual(result['aging_inventory'][0]['days_in_inventory'],(date(2026,10,22)-date(2026,1,1)).days)
        self.assertIsNone(result['aging_inventory'][-1]['days_in_inventory'])
        april=next(row for row in result['monthly'] if row['month']=='2026-04')
        self.assertEqual(april['cars_sold'],0); self.assertEqual(Decimal(april['sales_revenue']),0)

    def test_inclusive_period_and_inventory_independent_of_filter(self):
        self.seed()
        report=self.client.get('/analytics?start_date=2026-02-01&end_date=2026-02-28').json()
        self.assertEqual(report['sales']['cars_sold'],2)
        self.assertEqual(Decimal(report['sales']['sales_revenue']),Decimal('8500'))
        self.assertEqual(Decimal(report['sales']['gross_margin']),Decimal('-500'))
        self.assertEqual(report['sales']['average_days_to_sell'],'17.0')
        self.assertEqual(len(report['monthly']),1)
        self.assertEqual(Decimal(report['inventory']['purchase_value']),Decimal('4234.56'))
        day=self.client.get('/analytics?start_date=2026-02-20&end_date=2026-02-20').json()
        self.assertEqual(day['sales']['cars_sold'],1)
        self.assertEqual(self.client.get('/analytics?end_date=2026-01-31').json()['sales']['cars_sold'],1)
        self.assertEqual(self.client.get('/analytics?start_date=2026-03-01').json()['sales']['cars_sold'],1)

    def test_empty_and_invalid_periods(self):
        response=self.client.get('/analytics')
        self.assertEqual(response.status_code,200)
        data=response.json()
        self.assertEqual(data['sales']['cars_sold'],0)
        self.assertIsNone(data['sales']['average_days_to_sell'])
        self.assertEqual(data['monthly'],[]); self.assertEqual(data['aging_inventory'],[])
        for query in ('start_date=bad','start_date=2026-03-01&end_date=2026-01-01'):
            self.assertEqual(self.client.get('/analytics?'+query).status_code,422)

    def test_owner_protection(self):
        del app.dependency_overrides[require_owner]
        self.assertEqual(self.client.get('/analytics').status_code,401)
        with patch('app.auth.verified_user',return_value={'id':'c6d13d4c-e6de-41eb-857b-4cdf4571bac8'}):
            self.assertEqual(self.client.get('/analytics',headers={'Authorization':'Bearer other-user'}).status_code,403)
