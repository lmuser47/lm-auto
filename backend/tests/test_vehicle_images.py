"""Run with: .venv/bin/python -m unittest discover -s tests."""
from io import BytesIO
import unittest
from unittest.mock import patch
from fastapi.testclient import TestClient
from PIL import Image
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from app.main import app
from app.database import get_db
from app.auth import require_owner


class TestSession(Session):
    def execute(self, statement, *args, **kwargs):
        # SQLite test substitute for PostgreSQL row locking.
        if str(statement).endswith(' FOR UPDATE'):
            statement = text(str(statement).removesuffix(' FOR UPDATE'))
        return super().execute(statement, *args, **kwargs)


class Bucket:
    def __init__(self): self.files = {}; self.fail = False
    def upload(self, path, content, options):
        if self.fail: raise RuntimeError('storage unavailable')
        self.files[path] = content
    def remove(self, paths):
        if self.fail: raise RuntimeError('storage unavailable')
        for path in paths: self.files.pop(path, None)
    def get_public_url(self, path): return 'https://storage.example/' + path


class ImageTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine('sqlite://', connect_args={'check_same_thread':False})
        self.connection = self.engine.connect()
        self.connection.execute(text("ATTACH DATABASE ':memory:' AS public"))
        self.connection.execute(text('CREATE TABLE public.vehicles (id INTEGER PRIMARY KEY)'))
        self.connection.execute(text('INSERT INTO public.vehicles VALUES (1), (2)'))
        self.connection.execute(text('CREATE TABLE public.vehicle_images (id INTEGER PRIMARY KEY, vehicle_id INTEGER, storage_path TEXT, position INTEGER, created_at TEXT DEFAULT CURRENT_TIMESTAMP)'))
        self.connection.commit()
        self.db = TestSession(bind=self.connection)
        app.dependency_overrides[get_db] = lambda: self.db
        app.dependency_overrides[require_owner] = lambda: {"id": "test-owner"}
        self.bucket = Bucket()
        self.patcher = patch('app.routes.vehicle_images.get_vehicle_image_bucket', return_value=self.bucket)
        self.patcher.start()
        self.client = TestClient(app)
        image = BytesIO(); Image.new('RGB',(4,4)).save(image,format='PNG'); self.png=image.getvalue()

    def tearDown(self):
        self.client.close(); self.patcher.stop(); app.dependency_overrides.clear()
        self.db.close(); self.connection.close(); self.engine.dispose()

    def upload(self, vehicle=1, content=None):
        return self.client.post(f'/vehicles/{vehicle}/images',files={'file':('photo.png',self.png if content is None else content,'image/png')})

    def test_upload_list_delete_and_cover_order(self):
        a=self.upload(); b=self.upload()
        self.assertEqual(a.status_code,201); self.assertEqual(b.status_code,201)
        self.assertEqual(a.json()['position'],0); self.assertEqual(b.json()['position'],1)
        rows=self.client.get('/vehicles/1/images').json()
        self.assertEqual(len(rows),2)
        self.assertEqual(self.client.delete(f"/vehicles/2/images/{a.json()['id']}").status_code,404)
        r=self.client.delete(f"/vehicles/1/images/{a.json()['id']}")
        self.assertEqual(r.status_code,204); self.assertEqual(r.content,b'')
        self.assertEqual(len(self.bucket.files),1)
        self.assertEqual(self.client.get('/vehicles/1/images').json()[0]['id'],b.json()['id'])

    def test_invalid_uploads_and_missing_vehicle(self):
        self.assertEqual(self.upload(content=b'not an image').status_code,422)
        self.assertEqual(self.upload(content=b'x'*(10*1024*1024+1)).status_code,413)
        self.assertEqual(self.upload(vehicle=99).status_code,404)
        self.assertEqual(self.client.get('/vehicles/99/images').status_code,404)
        self.assertEqual(self.client.get('/vehicles/0/images').status_code,422)
        self.assertEqual(len(self.bucket.files),0)

    def test_storage_failure_preserves_metadata(self):
        self.bucket.fail=True
        self.assertEqual(self.upload().status_code,502)
        self.assertEqual(self.client.get('/vehicles/1/images').json(),[])
        self.bucket.fail=False
        image=self.upload().json()
        self.bucket.fail=True
        self.assertEqual(self.client.delete(f"/vehicles/1/images/{image['id']}").status_code,502)
        self.assertEqual(len(self.client.get('/vehicles/1/images').json()),1)

    def test_metadata_failure_cleans_uploaded_file(self):
        self.connection.execute(text('DROP TABLE public.vehicle_images')); self.connection.commit()
        with self.assertRaises(Exception): self.upload()
        self.assertEqual(self.bucket.files,{})

if __name__=='__main__': unittest.main()
