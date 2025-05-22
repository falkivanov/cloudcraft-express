
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import models
from db import get_db
from schemas import ScorecardResponse
import json

router = APIRouter(
    prefix="/api/v1/scorecard",
    tags=["scorecard"],
)

@router.get("/{scorecard_id}", response_model=dict)
async def get_scorecard_by_id(scorecard_id: int, db: Session = Depends(get_db)):
    """
    Gibt eine Scorecard anhand ihrer ID zurück.
    """
    scorecard = db.query(models.Scorecard).filter(models.Scorecard.id == scorecard_id).first()
    if not scorecard:
        raise HTTPException(status_code=404, detail="Scorecard nicht gefunden")
    
    # Lade assoziierte Daten
    company_kpis = db.query(models.CompanyKPI).filter(models.CompanyKPI.scorecard_id == scorecard_id).all()
    driver_kpis = db.query(models.DriverKPI).filter(models.DriverKPI.scorecard_id == scorecard_id).all()
    
    # Konvertiere Driver KPIs (metrics ist JSON-String)
    driver_kpis_parsed = []
    for driver in driver_kpis:
        driver_kpis_parsed.append({
            "name": driver.name,
            "status": "active",
            "metrics": json.loads(driver.metrics)
        })
    
    # Erstelle das Ergebnis-Objekt
    result = {
        "success": True,
        "data": {
            "week": scorecard.week,
            "year": scorecard.year,
            "location": scorecard.location,
            "overallScore": scorecard.overall_score,
            "overallStatus": scorecard.overall_status,
            "rank": scorecard.rank,
            "rankNote": scorecard.rank_note,
            "companyKPIs": [
                {
                    "name": kpi.name,
                    "value": kpi.value,
                    "target": kpi.target,
                    "status": kpi.status,
                    "category": kpi.category
                }
                for kpi in company_kpis
            ],
            "driverKPIs": driver_kpis_parsed,
            "recommendedFocusAreas": get_focus_areas(company_kpis)
        }
    }
    
    return result

@router.get("/list", response_model=dict)
async def list_scorecards(
    week: Optional[int] = None,
    year: Optional[int] = None,
    location: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Listet alle verfügbaren Scorecards auf, mit optionaler Filterung.
    """
    query = db.query(models.Scorecard)
    
    if week is not None:
        query = query.filter(models.Scorecard.week == week)
    if year is not None:
        query = query.filter(models.Scorecard.year == year)
    if location is not None:
        query = query.filter(models.Scorecard.location == location)
    
    # Sortiere nach Jahr und Woche, neueste zuerst
    query = query.order_by(models.Scorecard.year.desc(), models.Scorecard.week.desc())
    
    scorecards = query.all()
    
    result = {
        "success": True,
        "data": [
            {
                "id": sc.id,
                "week": sc.week,
                "year": sc.year,
                "location": sc.location,
                "overallScore": sc.overall_score,
                "overallStatus": sc.overall_status
            }
            for sc in scorecards
        ]
    }
    
    return result

@router.get("/week/{week}/year/{year}", response_model=dict)
async def get_scorecard_by_week_year(
    week: int,
    year: int,
    location: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Gibt eine Scorecard anhand von Woche, Jahr und optional Standort zurück.
    """
    query = db.query(models.Scorecard).filter(
        models.Scorecard.week == week,
        models.Scorecard.year == year
    )
    
    if location:
        query = query.filter(models.Scorecard.location == location)
    
    scorecard = query.first()
    
    if not scorecard:
        raise HTTPException(status_code=404, detail=f"Keine Scorecard für KW {week}/{year} gefunden")
    
    # Weiterleitung an den ID-basierten Endpunkt
    return await get_scorecard_by_id(scorecard.id, db)

# Hilfsfunktionen
def get_focus_areas(company_kpis):
    """
    Bestimmt empfohlene Fokus-Bereiche basierend auf KPIs.
    """
    focus_areas = []
    
    # Füge KPIs mit niedrigem Status hinzu
    for kpi in company_kpis:
        if kpi.status in ["poor", "fair"]:
            focus_areas.append(kpi.name)
    
    # Wenn weniger als 2 Bereiche gefunden wurden, füge die niedrigsten KPIs hinzu
    if len(focus_areas) < 2:
        sorted_kpis = sorted(company_kpis, key=lambda k: k.value)
        for kpi in sorted_kpis:
            if kpi.name not in focus_areas:
                focus_areas.append(kpi.name)
                if len(focus_areas) >= 2:
                    break
    
    return focus_areas[:3]  # Maximal 3 Fokus-Bereiche
