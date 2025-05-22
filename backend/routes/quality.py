
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid
import json

from db import get_db
import models
import schemas

router = APIRouter(
    prefix="/api/v1/quality",
    tags=["quality"],
    responses={404: {"description": "Not found"}},
)

# Helper function to format date ranges
def get_date_range(time_period: str = "week"):
    today = datetime.now()
    
    if time_period == "day":
        start_date = today.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = today.replace(hour=23, minute=59, second=59, microsecond=999999)
    elif time_period == "week":
        start_date = today - timedelta(days=today.weekday())
        start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = start_date + timedelta(days=6, hours=23, minutes=59, seconds=59)
    elif time_period == "month":
        start_date = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        # Get last day of current month
        if today.month == 12:
            end_date = today.replace(day=31, hour=23, minute=59, second=59, microsecond=999999)
        else:
            next_month = today.replace(month=today.month+1, day=1)
            end_date = next_month - timedelta(days=1)
            end_date = end_date.replace(hour=23, minute=59, second=59, microsecond=999999)
    elif time_period == "quarter":
        quarter = (today.month - 1) // 3 + 1
        start_date = datetime(today.year, 3 * quarter - 2, 1)
        if quarter == 4:
            end_date = datetime(today.year, 12, 31, 23, 59, 59, 999999)
        else:
            end_date = datetime(today.year, 3 * quarter + 1, 1) - timedelta(days=1)
            end_date = end_date.replace(hour=23, minute=59, second=59, microsecond=999999)
    elif time_period == "year":
        start_date = datetime(today.year, 1, 1)
        end_date = datetime(today.year, 12, 31, 23, 59, 59, 999999)
    else:
        # Default to week
        start_date = today - timedelta(days=today.weekday())
        start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = start_date + timedelta(days=6, hours=23, minutes=59, seconds=59)
    
    return start_date, end_date

# Scorecard statistics endpoint
@router.get("/scorecard/stats", response_model=Dict[str, Any])
def get_scorecard_statistics(
    time_period: str = Query("week", description="Time period: day, week, month, quarter, year"),
    location: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get statistics from scorecards for a specific time period.
    """
    start_date, end_date = get_date_range(time_period)
    
    # Mock response for now - in a real implementation, this would fetch data from a database
    return {
        "period": time_period,
        "location": location or "All",
        "timeRange": {
            "start": start_date.isoformat(),
            "end": end_date.isoformat()
        },
        "metrics": {
            "overallScore": 87.5,
            "rank": 3,
            "rankChange": 1,
            "categoryScores": {
                "safety": 92.1,
                "quality": 85.7,
                "customer": 88.3,
                "compliance": 90.2, 
                "capacity": 82.4,
                "standardWork": 86.9
            },
            "topDrivers": [
                {"name": "Max Mustermann", "score": 95.3},
                {"name": "Anna Schmidt", "score": 93.8},
                {"name": "Jan Weber", "score": 92.5}
            ],
            "improvementAreas": [
                "OnRoad Hours",
                "Delivered and Received",
                "Engage with Customer"
            ]
        }
    }

# Driver performance endpoint
@router.get("/drivers/performance", response_model=List[Dict[str, Any]])
def get_driver_performance(
    time_period: str = Query("week", description="Time period: day, week, month, quarter, year"),
    metric_type: Optional[str] = None,
    min_score: Optional[float] = None,
    max_score: Optional[float] = None,
    db: Session = Depends(get_db)
):
    """
    Get driver performance data filtered by various criteria.
    """
    # Mock response - in a real implementation, this would query the database
    drivers = [
        {
            "id": "1",
            "name": "Max Mustermann",
            "metrics": {
                "overall": 95.3,
                "safety": 98.0,
                "quality": 94.2,
                "customer": 96.5,
                "attendance": 92.0
            },
            "trend": "improving"
        },
        {
            "id": "2", 
            "name": "Anna Schmidt",
            "metrics": {
                "overall": 93.8,
                "safety": 95.5,
                "quality": 91.8,
                "customer": 97.2,
                "attendance": 90.5
            },
            "trend": "stable"
        },
        {
            "id": "3",
            "name": "Jan Weber",
            "metrics": {
                "overall": 92.5,
                "safety": 94.0,
                "quality": 93.5,
                "customer": 92.8,
                "attendance": 89.7
            },
            "trend": "declining"
        }
    ]
    
    # Apply filters if provided
    if metric_type and min_score is not None:
        drivers = [d for d in drivers if metric_type in d["metrics"] and d["metrics"][metric_type] >= min_score]
    
    if metric_type and max_score is not None:
        drivers = [d for d in drivers if metric_type in d["metrics"] and d["metrics"][metric_type] <= max_score]
    
    return drivers

# Customer contact compliance endpoint
@router.get("/customer-contact/compliance", response_model=Dict[str, Any])
def get_customer_contact_compliance(
    week: Optional[int] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Get customer contact compliance statistics for a specific week and year.
    """
    # If week or year not provided, use current week/year
    if not week or not year:
        today = datetime.now()
        year = today.year
        week = today.isocalendar()[1]
    
    # Mock response - in a real implementation, this would query the database
    return {
        "week": week,
        "year": year,
        "overallCompliance": 87.3,
        "totalContacts": 843,
        "totalAddresses": 965,
        "driversData": [
            {
                "name": "Max Mustermann",
                "totalAddresses": 125,
                "totalContacts": 118,
                "compliancePercentage": 94.4
            },
            {
                "name": "Anna Schmidt",
                "totalAddresses": 132,
                "totalContacts": 121,
                "compliancePercentage": 91.7
            },
            {
                "name": "Jan Weber",
                "totalAddresses": 128,
                "totalContacts": 105,
                "compliancePercentage": 82.0
            }
        ]
    }

# Quality reports filtering endpoint
@router.get("/reports/filter", response_model=List[Dict[str, Any]])
def filter_quality_reports(
    report_type: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    location: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Filter quality reports based on various criteria.
    """
    # Mock response - in a real implementation, this would query the database
    reports = [
        {
            "id": "1",
            "type": "scorecard",
            "title": "Weekly Scorecard DSU1 - Week 12",
            "date": "2025-03-24",
            "location": "DSU1",
            "summary": "Overall score: 87.5, Rank: 3rd"
        },
        {
            "id": "2",
            "type": "mentor",
            "title": "Mentor Report - Week 11",
            "date": "2025-03-17",
            "location": "DSU1",
            "summary": "12 drivers with high risk, 8 drivers improved"
        },
        {
            "id": "3",
            "type": "customer_contact",
            "title": "Customer Contact Report - Week 12",
            "date": "2025-03-24",
            "location": "DSU1",
            "summary": "87.3% compliance, 843 contacts"
        },
        {
            "id": "4",
            "type": "concessions",
            "title": "Concessions Report - Week 12",
            "date": "2025-03-24",
            "location": "DSU1",
            "summary": "18 concessions, €234.50 total value"
        }
    ]
    
    # Apply filters if provided
    if report_type:
        reports = [r for r in reports if r["type"] == report_type]
    
    if start_date:
        start = datetime.fromisoformat(start_date).date()
        reports = [r for r in reports if datetime.fromisoformat(r["date"]).date() >= start]
    
    if end_date:
        end = datetime.fromisoformat(end_date).date()
        reports = [r for r in reports if datetime.fromisoformat(r["date"]).date() <= end]
    
    if location:
        reports = [r for r in reports if r["location"] == location]
    
    if search:
        search_lower = search.lower()
        reports = [r for r in reports if 
                  search_lower in r["title"].lower() or 
                  search_lower in r["summary"].lower()]
    
    return reports

# Quality metrics trends endpoint
@router.get("/metrics/trends", response_model=Dict[str, Any])
def get_metrics_trends(
    metric_type: str,
    time_period: str = Query("week", description="Time period: day, week, month, quarter, year"),
    location: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get trends for specific quality metrics over time.
    """
    # Mock response - in a real implementation, this would query the database
    today = datetime.now()
    
    if time_period == "week":
        # Generate data points for the last 10 weeks
        dates = [(today - timedelta(weeks=i)).strftime("%Y-W%W") for i in range(10)]
        dates.reverse()
    elif time_period == "month":
        # Generate data points for the last 12 months
        dates = [(today - timedelta(days=30*i)).strftime("%Y-%m") for i in range(12)]
        dates.reverse()
    else:
        # Default to weekly
        dates = [(today - timedelta(weeks=i)).strftime("%Y-W%W") for i in range(10)]
        dates.reverse()
    
    # Example trend data based on metric type
    if metric_type == "overall_score":
        values = [85.3, 86.1, 84.7, 85.9, 87.2, 86.8, 87.5, 88.1, 87.9, 88.5]
        label = "Overall Score"
    elif metric_type == "customer_contact":
        values = [82.1, 83.5, 85.7, 84.2, 86.3, 87.1, 86.9, 87.3, 88.2, 87.8]
        label = "Customer Contact Compliance"
    elif metric_type == "safety":
        values = [92.3, 93.1, 91.8, 92.7, 93.5, 94.1, 93.8, 94.5, 95.2, 94.7]
        label = "Safety Score"
    else:
        values = [85.0, 86.0, 87.0, 86.5, 88.0, 87.5, 89.0, 88.5, 90.0, 89.5]
        label = "Quality Metric"
    
    return {
        "metric": metric_type,
        "label": label,
        "location": location or "All",
        "timePeriod": time_period,
        "data": [
            {"date": date, "value": value}
            for date, value in zip(dates, values)
        ]
    }
