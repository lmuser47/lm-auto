import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv
from supabase import ClientOptions, create_client

load_dotenv(Path(__file__).resolve().parents[1] / ".env")


@lru_cache
def get_storage_client():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SECRET_KEY")
    if not url or not key or key == "your-backend-secret-key":
        raise RuntimeError("Set SUPABASE_URL and SUPABASE_SECRET_KEY in .env.")
    return create_client(
        url,
        key,
        options=ClientOptions(auto_refresh_token=False, persist_session=False),
    ).storage


def get_vehicle_image_bucket():
    bucket = os.getenv("SUPABASE_STORAGE_BUCKET", "vehicle_img_bucket")
    return get_storage_client().from_(bucket)
