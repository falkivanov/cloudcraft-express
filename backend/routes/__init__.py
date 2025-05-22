
from fastapi import APIRouter
from . import employee, scorecard

api_router = APIRouter()
api_router.include_router(employee.router)
api_router.include_router(scorecard.router)
