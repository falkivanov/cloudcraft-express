
from fastapi import APIRouter
from . import employee, shift, vehicle, quality

api_router = APIRouter()
api_router.include_router(employee.router)
api_router.include_router(shift.router)
api_router.include_router(vehicle.router)
api_router.include_router(quality.router)
