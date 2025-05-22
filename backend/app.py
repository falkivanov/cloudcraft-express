from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional, Dict, List, Any
import pdfplumber
import os
import uuid
import json
import shutil
import re
from tempfile import NamedTemporaryFile
from datetime import datetime

from sqlalchemy.orm import Session

from db import engine, SessionLocal, Base
import models
from schemas import (
    ScorecardCreate, 
    ScorecardResponse, 
    DriverKPICreate,
    DriverKPIResponse,
    CompanyKPICreate,
    CompanyKPIResponse,
    ProcessingStatus,
    FileUploadResponse,
    ExtractionResult,
    EmployeeBase
)

# Import all route modules
from routes import employee, scorecard

# Erstelle Tabellen in der Datenbank
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FinSuite API",
    description="Backend-API für die FinSuite-Anwendung",
    version="0.1.0"
)

# CORS-Konfiguration für Frontend-Kommunikation
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In der Produktion durch die tatsächliche Frontend-Domain ersetzen
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Uploads-Verzeichnis erstellen, falls es nicht existiert
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Integrate all routers
app.include_router(employee.router)
app.include_router(scorecard.router)

# Gesundheits-Endpunkt
@app.get("/health")
def health_check():
    return {"status": "ok", "version": app.version}

# Versions-Endpunkt
@app.get("/version")
def version():
    return {"version": app.version}

# Endpunkt zum Hochladen und Verarbeiten von Scorecard-PDFs
@app.post("/api/v1/scorecard/extract", response_model=FileUploadResponse)
async def upload_scorecard(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db)
):
    """
    Lade eine Scorecard-PDF hoch und starte die Extraktion der Daten.
    Gibt eine Datei-ID und einen Verarbeitungsstatus zurück.
    """
    try:
        # Generiere eindeutige ID für diesen Upload
        file_id = str(uuid.uuid4())
        processing_id = str(uuid.uuid4())
        
        # Speichere die Datei im Upload-Verzeichnis
        file_location = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
        with open(file_location, "wb") as f:
            contents = await file.read()
            f.write(contents)
            await file.seek(0)
        
        # Speichere Datei-Upload-Eintrag in der Datenbank
        file_upload = models.FileUpload(
            file_id=file_id,
            filename=file.filename,
            file_path=file_location,
            file_type="scorecard",
            upload_date=datetime.now(),
            processing_id=processing_id,
            processing_status="queued"
        )
        db.add(file_upload)
        db.commit()
        
        # Starte asynchrone Verarbeitung der PDF (direkt, nicht verzögert)
        result = await process_scorecard_pdf(file_location, file_id, processing_id, db)
        
        return {
            "success": True,
            "data": {
                "fileId": file_id,
                "filename": file.filename,
                "processingStatus": "completed" if result else "failed",
                "processingId": processing_id,
                "result": result
            }
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": f"Fehler beim Hochladen: {str(e)}"}
        )

# Endpunkt zum Extrahieren von Fahrer-KPIs aus Text
@app.post("/api/v1/scorecard/extract-drivers", response_model=ExtractionResult)
async def extract_drivers(
    request_data: Dict[str, Any],
):
    """
    Extrahiere Fahrer-KPIs aus Textinhalt.
    """
    try:
        text = request_data.get("text", "")
        page_data = request_data.get("pageData")
        
        # Extrahiere Driver-KPIs mit regulären Ausdrücken
        drivers = extract_driver_kpis_from_text(text)
        
        return {
            "success": True,
            "data": drivers
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": f"Fehler bei der Extraktion: {str(e)}"}
        )

# Endpunkt zum Extrahieren von Company-KPIs aus Text
@app.post("/api/v1/scorecard/extract-company-kpis", response_model=ExtractionResult)
async def extract_company_kpis(
    request_data: Dict[str, Any],
):
    """
    Extrahiere Company KPIs aus Textinhalt.
    """
    try:
        text = request_data.get("text", "")
        page_data = request_data.get("pageData")
        
        # Extrahiere Company-KPIs mit regulären Ausdrücken
        kpis = extract_company_kpis_from_text(text)
        
        return {
            "success": True,
            "data": kpis
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": f"Fehler bei der Extraktion: {str(e)}"}
        )

# Endpunkt zum Extrahieren von Text aus PDF
@app.post("/api/v1/pdf/extract-text")
async def extract_text_from_pdf(
    file: UploadFile = File(...),
):
    """
    Extrahiere Text aus einer PDF-Datei.
    Gibt ein Dictionary mit Seitennummern als Schlüssel und Textinhalt als Werte zurück.
    """
    try:
        # Temporäre Datei zum Speichern des Uploads
        with NamedTemporaryFile(delete=False) as temp_file:
            contents = await file.read()
            temp_file.write(contents)
            temp_file_path = temp_file.name
        
        page_texts = {}
        
        # PDF mit pdfplumber öffnen und Text extrahieren
        with pdfplumber.open(temp_file_path) as pdf:
            for i, page in enumerate(pdf.pages):
                text = page.extract_text()
                if text:
                    page_texts[i + 1] = text  # Seitennummern von 1 beginnend
        
        # Temporäre Datei löschen
        os.unlink(temp_file_path)
        
        return {
            "success": True,
            "data": page_texts
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": f"Fehler bei der Textextraktion: {str(e)}"}
        )

# Endpunkt zum Extrahieren von strukturierten Daten aus PDF
@app.post("/api/v1/pdf/extract-structure")
async def extract_structure_from_pdf(
    file: UploadFile = File(...),
):
    """
    Extrahiere strukturierte Daten (Text mit Positionen) aus einer PDF-Datei.
    """
    try:
        # Temporäre Datei zum Speichern des Uploads
        with NamedTemporaryFile(delete=False) as temp_file:
            contents = await file.read()
            temp_file.write(contents)
            temp_file_path = temp_file.name
        
        page_data = {}
        
        # PDF mit pdfplumber öffnen und strukturierte Daten extrahieren
        with pdfplumber.open(temp_file_path) as pdf:
            for i, page in enumerate(pdf.pages):
                # Text mit Positionen extrahieren
                words = page.extract_words()
                chars = page.chars
                
                page_data[i + 1] = {
                    "words": words,
                    "chars": chars,
                    "width": page.width,
                    "height": page.height
                }
        
        # Temporäre Datei löschen
        os.unlink(temp_file_path)
        
        return {
            "success": True,
            "data": page_data
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": f"Fehler bei der Strukturextraktion: {str(e)}"}
        )

# Endpunkt zum Abrufen des Verarbeitungsstatus
@app.post("/api/v1/processing/status", response_model=ProcessingStatus)
async def get_processing_status(
    request_data: Dict[str, str],
    db: Session = Depends(get_db)
):
    """
    Gibt den Status einer asynchronen Verarbeitung zurück.
    """
    processing_id = request_data.get("processingId")
    
    if not processing_id:
        return JSONResponse(
            status_code=400,
            content={"success": False, "error": "Processing ID ist erforderlich"}
        )
    
    # Suche nach dem Verarbeitungsstatus in der Datenbank
    file_upload = db.query(models.FileUpload).filter(models.FileUpload.processing_id == processing_id).first()
    
    if not file_upload:
        return JSONResponse(
            status_code=404,
            content={"success": False, "error": "Verarbeitungs-ID nicht gefunden"}
        )
    
    return {
        "success": True,
        "data": {
            "status": file_upload.processing_status,
            "progress": file_upload.processing_progress,
            "message": file_upload.processing_message,
            "resultUrl": file_upload.result_url,
            "error": file_upload.error_message
        }
    }

# Hilfsfunktionen für die Extraktion

def extract_driver_kpis_from_text(text):
    """
    Extrahiere Fahrer-KPIs aus Text mit regulären Ausdrücken.
    """
    # Einfaches Muster für Fahrer-IDs (z.B. TR-001, D-1234)
    driver_pattern = r"([A-Z]+-\d{3,4}|[A-Z]-\d{4})"
    
    # Muster für Metriken (Name: Wert / Target, Status)
    metric_pattern = r"(\w+(?:\s\w+)?)\s*:\s*([\d.]+%?)\s*\/\s*([\d.]+%?)\s*,\s*(\w+)"
    
    # Suche nach Fahrer-IDs im Text
    drivers = []
    for match in re.finditer(driver_pattern, text):
        driver_id = match.group(1)
        
        # Extrahiere Text für diesen Fahrer (bis zum nächsten Fahrer oder Ende)
        start_pos = match.end()
        end_pos = len(text)
        for next_match in re.finditer(driver_pattern, text[start_pos:]):
            end_pos = start_pos + next_match.start()
            break
        
        driver_text = text[start_pos:end_pos]
        
        # Suche nach Metriken für diesen Fahrer
        metrics = []
        for metric_match in re.finditer(metric_pattern, driver_text):
            name = metric_match.group(1)
            value = metric_match.group(2)
            target = metric_match.group(3)
            status = metric_match.group(4)
            
            metrics.append({
                "name": name,
                "value": value,
                "target": target,
                "status": status.lower()
            })
        
        drivers.append({
            "name": driver_id,
            "status": "active",
            "metrics": metrics
        })
    
    return drivers

def extract_company_kpis_from_text(text):
    """
    Extrahiere Company-KPIs aus Text mit regulären Ausdrücken.
    """
    # Muster für KPIs (Name: Wert / Target, Status)
    kpi_pattern = r"(\w+(?:\s\w+)?)\s*:\s*([\d.]+%?)\s*\/\s*([\d.]+%?)\s*,\s*(\w+)"
    
    kpis = []
    for match in re.finditer(kpi_pattern, text):
        name = match.group(1)
        value_str = match.group(2)
        target_str = match.group(3)
        status = match.group(4)
        
        # Konvertiere Werte
        try:
            # Entferne % und konvertiere zu float
            value = float(value_str.replace('%', ''))
            target = float(target_str.replace('%', ''))
            unit = '%' if '%' in value_str else ''
            
            # Bestimme Kategorie basierend auf dem Namen
            category = "customer"
            if "safety" in name.lower():
                category = "safety"
            elif "compli" in name.lower():
                category = "compliance"
            elif "quality" in name.lower():
                category = "quality"
            elif "capacity" in name.lower() or "volume" in name.lower():
                category = "capacity"
            elif "standard" in name.lower() or "work" in name.lower():
                category = "standardWork"
            
            kpis.append({
                "name": name,
                "value": value,
                "target": target,
                "unit": unit,
                "status": status.lower(),
                "category": category
            })
        except ValueError:
            # Ignoriere Werte, die nicht konvertiert werden können
            continue
    
    return kpis

# Hilfsfunktion zur Verarbeitung von Scorecard-PDFs
async def process_scorecard_pdf(file_path: str, file_id: str, processing_id: str, db: Session):
    """
    Verarbeitet eine Scorecard-PDF und extrahiert Daten.
    Aktualisiert den Verarbeitungsstatus in der Datenbank.
    """
    try:
        # Aktualisiere Status auf "processing"
        file_upload = db.query(models.FileUpload).filter(models.FileUpload.processing_id == processing_id).first()
        if file_upload:
            file_upload.processing_status = "processing"
            file_upload.processing_progress = 10
            file_upload.processing_message = "Extrahiere Text aus PDF..."
            db.commit()
        
        # PDF mit pdfplumber öffnen
        with pdfplumber.open(file_path) as pdf:
            # Extrahiere Metadaten und Text
            num_pages = len(pdf.pages)
            
            # Extrahiere Text aus allen Seiten
            page_texts = {}
            for i, page in enumerate(pdf.pages):
                text = page.extract_text()
                if text:
                    page_texts[i] = text
            
            # Aktualisiere Fortschritt
            if file_upload:
                file_upload.processing_progress = 30
                file_upload.processing_message = "Extrahiere Metadaten..."
                db.commit()
            
            # Extrahiere Wochennummer aus Dateiname
            week_num = extract_week_from_filename(os.path.basename(file_path))
            
            # Aktualisiere Fortschritt
            if file_upload:
                file_upload.processing_progress = 50
                file_upload.processing_message = "Extrahiere KPIs..."
                db.commit()
            
            # Kombiniere Text für verschiedene Analysen
            combined_text = " ".join(page_texts.values())
            
            # Extrahiere Standort
            location = extract_location_from_text(combined_text) or "DSU1"
            
            # Extrahiere Overall Score
            overall_score = extract_overall_score_from_text(combined_text) or 90.0
            
            # Extrahiere Rank
            rank = extract_rank_from_text(combined_text) or 5
            
            # Extrahiere Driver KPIs
            driver_kpis = extract_driver_kpis_from_text(combined_text)
            
            # Extrahiere Company KPIs
            company_kpis = extract_company_kpis_from_text(combined_text)
            
            # Erstelle eine neue Scorecard in der Datenbank
            scorecard = models.Scorecard(
                file_id=file_id,
                week=week_num,
                year=datetime.now().year,
                location=location,
                overall_score=overall_score,
                overall_status=determine_status_from_score(overall_score),
                rank=rank,
                rank_note=generate_rank_note(rank),
                is_sample_data=False
            )
            db.add(scorecard)
            db.flush()  # Um die ID zu bekommen
            
            # Aktualisiere Fortschritt
            if file_upload:
                file_upload.processing_progress = 80
                file_upload.processing_message = "Speichere Ergebnisse..."
                db.commit()
            
            # Erstelle Company-KPIs für die Scorecard
            for kpi in company_kpis:
                company_kpi = models.CompanyKPI(
                    scorecard_id=scorecard.id,
                    name=kpi["name"],
                    value=kpi["value"],
                    target=kpi["target"],
                    status=kpi["status"],
                    category=kpi["category"]
                )
                db.add(company_kpi)
            
            # Erstelle Driver-KPIs für die Scorecard
            for i, driver in enumerate(driver_kpis):
                driver_kpi = models.DriverKPI(
                    scorecard_id=scorecard.id,
                    driver_id=f"D{10000+i}" if not isinstance(driver["name"], str) or not re.match(r"[A-Z]+-\d+", driver["name"]) else driver["name"],
                    name=driver["name"],
                    metrics=json.dumps(driver["metrics"])
                )
                db.add(driver_kpi)
            
            # Speichern
            db.commit()
            
            # Erstelle das Ergebnis-Objekt
            result = {
                "week": week_num,
                "year": datetime.now().year,
                "location": location,
                "overallScore": overall_score,
                "overallStatus": determine_status_from_score(overall_score),
                "rank": rank,
                "rankNote": generate_rank_note(rank),
                "companyKPIs": company_kpis,
                "driverKPIs": driver_kpis,
                "recommendedFocusAreas": extract_focus_areas(combined_text, company_kpis)
            }
            
            # Aktualisiere Status auf "completed"
            if file_upload:
                file_upload.processing_status = "completed"
                file_upload.processing_progress = 100
                file_upload.processing_message = "Verarbeitung abgeschlossen"
                file_upload.result_url = f"/api/v1/scorecard/{scorecard.id}"
                file_upload.result_data = json.dumps(result)
                db.commit()
            
            return result
                
    except Exception as e:
        # Bei Fehler Status auf "failed" setzen
        if file_upload and db:
            file_upload.processing_status = "failed"
            file_upload.error_message = str(e)
            db.commit()
        print(f"Error processing PDF: {e}")
        return None

# Hilfsfunktion zum Extrahieren der Wochennummer aus einem Dateinamen
def extract_week_from_filename(filename: str) -> int:
    """
    Extrahiert die Wochennummer aus einem Dateinamen.
    Sucht nach Mustern wie "KW12", "Week12", etc.
    """
    # Verschiedene Muster für Wochennummern
    patterns = [
        r"Week[_\s-]*(\d+)",      # Week12, Week-12, Week_12, Week 12
        r"KW[_\s-]*(\d+)",        # KW12, KW-12, KW_12, KW 12
        r"W[_\s-]*(\d+)",         # W12, W-12, W_12, W 12
        r"(?:_|\s|-)(\d{1,2})(?:_|-|\s)",  # _12_ or -12- or _12- etc.
        r"CW[_\s-]*(\d+)",        # CW12, CW-12, CW_12, CW 12
        r"(\d{1,2})_(?:20\d{2})"   # 12_2023
    ]
    
    for pattern in patterns:
        match = re.search(pattern, filename)
        if match and match.group(1):
            week_num = int(match.group(1))
            if 1 <= week_num <= 53:
                return week_num
    
    # Wenn keine Wochennummer gefunden wurde, aktuelle Woche verwenden
    return datetime.now().isocalendar()[1]  # Aktuelle Kalenderwoche

# Hilfsfunktionen zur Datenextraktion 

def extract_location_from_text(text: str) -> str:
    """
    Extrahiert den Standort aus dem Text.
    """
    location_patterns = [
        r"Station[:\s]+([A-Z]{3}\d)",
        r"Location[:\s]+([A-Z]{3}\d)",
        r"Standort[:\s]+([A-Z]{3}\d)",
    ]
    
    for pattern in location_patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(1)
    
    # Fallback: Suche nach bekannten Standort-Codes
    for location in ["DSU1", "DMU1", "DBO1", "DAM1", "DDU1", "DUS1"]:
        if location in text:
            return location
            
    return "DSU1"  # Default

def extract_overall_score_from_text(text: str) -> float:
    """
    Extrahiert den Overall Score aus dem Text.
    """
    score_patterns = [
        r"Overall[:\s]+(\d+\.?\d*)",
        r"Score[:\s]+(\d+\.?\d*)",
        r"Gesamtpunktzahl[:\s]+(\d+\.?\d*)",
    ]
    
    for pattern in score_patterns:
        match = re.search(pattern, text)
        if match:
            try:
                return float(match.group(1))
            except ValueError:
                continue
    
    return 90.0  # Default

def extract_rank_from_text(text: str) -> int:
    """
    Extrahiert den Rank aus dem Text.
    """
    rank_patterns = [
        r"Rank[:\s]+#?(\d+)",
        r"Platz[:\s]+#?(\d+)",
        r"Position[:\s]+#?(\d+)",
        r"#(\d+) von",
    ]
    
    for pattern in rank_patterns:
        match = re.search(pattern, text)
        if match:
            try:
                return int(match.group(1))
            except ValueError:
                continue
    
    return 5  # Default

def determine_status_from_score(score: float) -> str:
    """
    Bestimmt den Status basierend auf dem Score.
    """
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

def generate_rank_note(rank: int) -> str:
    """
    Generiert eine Notiz zum Rang.
    """
    if rank <= 3:
        return f"Top {rank}! Great job!"
    elif rank <= 10:
        return f"Rank {rank}, in the top 10"
    else:
        return f"Currently at rank {rank}"

def extract_focus_areas(text: str, company_kpis: list) -> list:
    """
    Extrahiert empfohlene Fokus-Bereiche basierend auf Text und KPIs.
    """
    focus_areas = []
    
    # Füge KPIs mit niedrigem Status hinzu
    for kpi in company_kpis:
        if kpi.get("status") in ["poor", "fair"]:
            focus_areas.append(kpi.get("name"))
    
    # Wenn weniger als 2 Bereiche gefunden wurden, füge die niedrigsten KPIs hinzu
    if len(focus_areas) < 2:
        sorted_kpis = sorted(company_kpis, key=lambda k: k.get("value", 0))
        for kpi in sorted_kpis:
            if kpi.get("name") not in focus_areas:
                focus_areas.append(kpi.get("name"))
                if len(focus_areas) >= 2:
                    break
    
    return focus_areas[:3]  # Maximal 3 Fokus-Bereiche

# Wenn die Datei direkt ausgeführt wird
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
