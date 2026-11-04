from contextlib import asynccontextmanager
import os

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine
from app.routes.vehicles import router as vehicles_router
from app.routes.vehicle_images import router as images_router
from app.routes.public_vehicles import router as public_router
from app.auth import require_owner
from app.routes.analytics import router as analytics_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        yield
    finally:
        engine.dispose()


app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in os.getenv(
        "FRONTEND_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
    ).split(",") if origin.strip()],
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)
app.include_router(vehicles_router, dependencies=[Depends(require_owner)])
app.include_router(images_router, dependencies=[Depends(require_owner)])
app.include_router(public_router)
app.include_router(analytics_router)


@app.middleware("http")
async def private_cache_control(request, call_next):
    response = await call_next(request)
    if request.url.path.startswith(("/vehicles", "/auth/", "/analytics")):
        response.headers["Cache-Control"] = "no-store"
    return response


@app.get("/auth/me", tags=["authentication"])
def current_owner(owner: dict = Depends(require_owner)):
    return owner


@app.get("/")
def home():
    return {"message": "Dealership API is running!"}
