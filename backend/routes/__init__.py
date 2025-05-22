
from fastapi import APIRouter
from . import employee, shift

api_router = APIRouter()
api_router.include_router(employee.router)
api_router.include_router(shift.router)
