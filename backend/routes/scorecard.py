
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
import pdfplumber
import re
import io
import json
from datetime import datetime
from typing import List, Optional

from db import get_db
import models
from schemas import (
    ScorecardResponse,
    DriverKPIResponse,
    CompanyKPIResponse,
    FileUploadResponse,
    ExtractionResult
)

router = APIRouter(prefix="/api/v1/scorecard", tags=["scorecard"])

# --- Parser Hilfsfunktionen ---
def parse_int(value: str):
    value = value.strip()
    if value == "-" or value == "":
        return None
    return int(value)

def parse_float(value: str):
    value = value.strip().replace("%", "").replace(",", ".")
    if value == "-" or value == "":
        return None
    return float(value)

def normalize_transporter_id(tid: str) -> str:
    if not tid.startswith("A") and len(tid) == 13:
        return "A" + tid
    return tid

def extract_week_from_filename(filename: str) -> int:
    """Verbesserte Wochenerkennung mit detailliertem Logging"""
    print(f"DEBUG: Trying to extract week from filename: {filename}")
    
    patterns = [
        r"Week[_\s-]*(\d+)",      # Week12, Week-12, Week_12, Week 12
        r"KW[_\s-]*(\d+)",        # KW12, KW-12, KW_12, KW 12
        r"W[_\s-]*(\d+)",         # W12, W-12, W_12, W 12
        r"(?:_|\s|-)(\d{1,2})(?:_|-|\s)",  # _12_ or -12- or _12- etc.
        r"CW[_\s-]*(\d+)",        # CW12, CW-12, CW_12, CW 12
        r"(\d{1,2})_(?:20\d{2})"   # 12_2023
    ]
    
    for pattern in patterns:
        match = re.search(pattern, filename, re.IGNORECASE)
        if match and match.group(1):
            week_num = int(match.group(1))
            if 1 <= week_num <= 53:
                print(f"DEBUG: Found week {week_num} using pattern: {pattern}")
                return week_num
    
    # Wenn keine Wochennummer gefunden wurde, aktuelle Woche verwenden
    current_week = datetime.now().isocalendar()[1]
    print(f"DEBUG: No week found in filename, using current week: {current_week}")
    return current_week

def determine_status_from_score(score: float) -> str:
    """Bestimmt den Status basierend auf dem Score."""
    if score >= 95:
        return "fantastic"
    elif score >= 90:
        return "great"
    elif score >= 85:
        return "good"
    elif score >= 80:
        return "fair"
    else:
        return "poor"

# --- POST: Upload und Verarbeitung (Hauptfunktion) ---
@router.post("/extract", response_model=FileUploadResponse)
async def upload_combined_scorecard(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    """
    Lade eine Scorecard-PDF hoch und extrahiere alle Daten automatisch.
    """
    try:
        print(f"DEBUG: Processing file: {file.filename}")
        contents = await file.read()
        pdf = pdfplumber.open(io.BytesIO(contents))

        week = extract_week_from_filename(file.filename)
        year = datetime.now().year
        
        print(f"DEBUG: Extracted week: {week}, year: {year}")

        # Lösche existierende Daten für diese Woche/Jahr
        deleted_drivers = db.query(models.DriverKPI).filter(
            models.DriverKPI.week == week,
            models.DriverKPI.year == year
        ).delete()
        
        deleted_company = db.query(models.CompanyKPI).filter(
            models.CompanyKPI.week == week,
            models.CompanyKPI.year == year
        ).delete()
        
        deleted_scorecards = db.query(models.Scorecard).filter(
            models.Scorecard.week == week,
            models.Scorecard.year == year
        ).delete()

        print(f"DEBUG: Deleted existing data - Drivers: {deleted_drivers}, Company: {deleted_company}, Scorecards: {deleted_scorecards}")

        # Hole alle Mitarbeiter für ID-Mapping
        employees = db.query(models.Employee).all() if hasattr(models, 'Employee') else []
        transporter_id_map = {emp.transporter_id: emp.name for emp in employees if hasattr(emp, 'transporter_id') and emp.transporter_id}
        print(f"DEBUG: Loaded {len(transporter_id_map)} employee mappings")

        # --- Seite 3+4: Fahrerdaten ---
        driver_text = ""
        if len(pdf.pages) >= 3:
            driver_text += pdf.pages[2].extract_text()
        if len(pdf.pages) >= 4:
            driver_text += "\n" + pdf.pages[3].extract_text()

        print(f"DEBUG: Extracted driver text length: {len(driver_text)}")

        # Pattern für Fahrerdaten
        pattern_driver = r'([A-Z0-9]{13,14})[\s\n]+(\d+)[\s\n]+([\d.,%-]+)[\s\n]+(\d+)[\s\n]+([\d.,%-]+)[\s\n]+([\d.,%-]+)[\s\n]+(\d+)[\s\n]+([\d.,%-]+)'
        driver_matches = re.findall(pattern_driver, driver_text)
        print(f"DEBUG: Found {len(driver_matches)} driver matches")

        # Erstelle Scorecard-Eintrag
        scorecard = models.Scorecard(
            week=week,
            year=year,
            location="DSU1",  # Könnte aus PDF extrahiert werden
            overall_score=90.0,  # Könnte berechnet werden
            overall_status="good",
            rank=5,
            rank_note=f"Week {week} data",
            is_sample_data=False
        )
        db.add(scorecard)
        db.flush()  # Um die ID zu bekommen
        print(f"DEBUG: Created scorecard with ID: {scorecard.id}")

        driver_kpis = []
        for match in driver_matches:
            transporter_id, delivered, dcr, dnr_dpmo, pod, cc, ce, dex = match
            transporter_id = normalize_transporter_id(transporter_id)
            name = transporter_id_map.get(transporter_id, transporter_id)

            # Erstelle Driver-KPI Eintrag
            driver_kpi = models.DriverKPI(
                scorecard_id=scorecard.id,
                driver_id=transporter_id,
                name=name,
                metrics=json.dumps({
                    "delivered": parse_int(delivered),
                    "dcr": parse_float(dcr),
                    "dnr_dpmo": parse_int(dnr_dpmo),
                    "pod": parse_float(pod),
                    "cc": parse_float(cc),
                    "ce": parse_int(ce),
                    "dex": parse_float(dex)
                })
            )
            db.add(driver_kpi)
            
            # Füge zum Ergebnis hinzu
            driver_kpis.append({
                "name": name,
                "driverId": transporter_id,
                "status": "active",
                "metrics": {
                    "delivered": parse_int(delivered),
                    "dcr": parse_float(dcr),
                    "dnr_dpmo": parse_int(dnr_dpmo),
                    "pod": parse_float(pod),
                    "cc": parse_float(cc),
                    "ce": parse_int(ce),
                    "dex": parse_float(dex)
                }
            })

        print(f"DEBUG: Created {len(driver_kpis)} driver KPIs")

        # --- Seite 2: Firm KPIs ---
        firm_text = ""
        if len(pdf.pages) >= 2:
            firm_text = pdf.pages[1].extract_text()

        print(f"DEBUG: Extracted firm text length: {len(firm_text)}")

        kpi_patterns = {
            "dcr": r"Delivery Completion Rate\(DCR\)[\s:]*([\d.,]+)%",
            "dnr_dpmo": r"Delivered Not Received\(DNR DPMO\)[\s:]*([\d.,]+)",
            "lor_dpmo": r"Lost on Road \(LoR\) DPMO[\s:]*([\d.,]+)",
        }

        company_kpis = []
        for kpi_name, pattern in kpi_patterns.items():
            match = re.search(pattern, firm_text)
            if match:
                value = parse_float(match.group(1))
                if value is not None:
                    # Bestimme Kategorie und Target
                    category = "customer"
                    target = 95.0 if kpi_name == "dcr" else 100.0
                    
                    if "dpmo" in kpi_name:
                        category = "quality"
                        target = 50.0  # Niedrigere Werte sind besser für DPMO
                    
                    status = determine_status_from_score(value)
                    
                    # Erstelle Company-KPI Eintrag
                    company_kpi = models.CompanyKPI(
                        scorecard_id=scorecard.id,
                        name=kpi_name.upper().replace("_", " "),
                        value=value,
                        target=target,
                        status=status,
                        category=category
                    )
                    db.add(company_kpi)
                    
                    # Füge zum Ergebnis hinzu
                    company_kpis.append({
                        "name": kpi_name.upper().replace("_", " "),
                        "value": value,
                        "target": target,
                        "unit": "%" if kpi_name == "dcr" else "",
                        "status": status,
                        "category": category
                    })

        print(f"DEBUG: Created {len(company_kpis)} company KPIs")

        db.commit()
        print(f"DEBUG: Successfully committed data to database for week {week}/{year}")

        # Erstelle das Ergebnis im erwarteten Format
        result = {
            "week": week,
            "year": year,
            "location": "DSU1",
            "overallScore": 90.0,
            "overallStatus": "good",
            "rank": 5,
            "rankNote": f"Week {week} scorecard",
            "companyKPIs": company_kpis,
            "driverKPIs": driver_kpis,
            "recommendedFocusAreas": [kpi["name"] for kpi in company_kpis if kpi["status"] in ["poor", "fair"]][:3]
        }

        print(f"DEBUG: Returning result for week {week} with {len(driver_kpis)} drivers and {len(company_kpis)} company KPIs")

        return {
            "success": True,
            "data": result
        }

    except Exception as e:
        print(f"ERROR: Exception during processing: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler bei der Verarbeitung: {str(e)}")

# ... keep existing code (other endpoints) the same
