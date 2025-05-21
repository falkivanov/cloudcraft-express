
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional, Dict, List, Any
import pdfplumber
import os
import uuid
import json
import shutil
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
        
        # Starte asynchrone Verarbeitung der PDF (in der Praxis würde hier ein Task Queue System wie Celery verwendet)
        if background_tasks:
            background_tasks.add_task(process_scorecard_pdf, file_location, file_id, processing_id, db)
        
        return {
            "success": True,
            "data": {
                "fileId": file_id,
                "filename": file.filename,
                "processingStatus": "queued",
                "processingId": processing_id
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
    db: Session = Depends(get_db)
):
    """
    Extrahiere Fahrer-KPIs aus Textinhalt.
    """
    try:
        text = request_data.get("text", "")
        page_data = request_data.get("pageData")
        
        # Hier würde die tatsächliche Extraktionslogik implementiert werden
        # In diesem Beispiel geben wir nur Beispieldaten zurück
        
        # In einer vollständigen Implementierung würden wir hier:
        # 1. Den Text nach Fahrer-KPIs durchsuchen
        # 2. Strukturierte Daten erstellen
        # 3. Die Daten zurückgeben
        
        # Dummy-Daten zur Demonstration
        example_drivers = [
            {
                "driverId": "1001",
                "name": "Max Mustermann",
                "metrics": [
                    {"name": "DNR", "value": "0.5%", "target": "1.2%", "status": "success"},
                    {"name": "Concessions", "value": "2", "target": "3", "status": "success"}
                ]
            }
        ]
        
        return {
            "success": True,
            "data": example_drivers
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
    db: Session = Depends(get_db)
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
    db: Session = Depends(get_db)
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

# Hilfsfunktion zur Verarbeitung von Scorecard-PDFs (würde in der Praxis asynchron ausgeführt)
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
            
            # Extrahiere Text aus den ersten Seiten (in einer vollständigen Implementierung würde hier mehr Logik stehen)
            page_texts = {}
            for i, page in enumerate(pdf.pages):
                if i < 3:  # Beschränke auf die ersten drei Seiten für Demonstration
                    text = page.extract_text()
                    if text:
                        page_texts[i] = text
            
            # Aktualisiere Fortschritt
            if file_upload:
                file_upload.processing_progress = 50
                file_upload.processing_message = "Analysiere Daten..."
                db.commit()
            
            # Hier würde die eigentliche Datenextraktion stattfinden
            # In diesem Beispiel erstellen wir nur Dummy-Daten
            
            # Erstelle eine neue Scorecard in der Datenbank
            week_num = extract_week_from_filename(os.path.basename(file_path))
            scorecard = models.Scorecard(
                file_id=file_id,
                week=week_num,
                year=datetime.now().year,
                location="DSU1",
                overall_score=90.5,
                overall_status="success",
                rank=3,
                rank_note="Up 2 places from last week",
                is_sample_data=False
            )
            db.add(scorecard)
            db.flush()  # Um die ID zu bekommen
            
            # Erstelle einige Beispiel-KPIs für die Scorecard
            company_kpis = [
                models.CompanyKPI(
                    scorecard_id=scorecard.id,
                    name="DNR",
                    value=0.8,
                    target=1.2,
                    status="success",
                    category="customer"
                ),
                models.CompanyKPI(
                    scorecard_id=scorecard.id,
                    name="Delivery Quality",
                    value=99.2,
                    target=98.5,
                    status="success",
                    category="quality"
                )
            ]
            db.add_all(company_kpis)
            
            # Erstelle einige Beispiel-Fahrer-KPIs
            driver_kpis = [
                models.DriverKPI(
                    scorecard_id=scorecard.id,
                    driver_id="D12345",
                    name="Max Mustermann",
                    metrics=json.dumps([
                        {"name": "DNR", "value": "0.5%", "target": "1.2%", "status": "success"},
                        {"name": "POD", "value": "98%", "target": "95%", "status": "success"}
                    ])
                ),
                models.DriverKPI(
                    scorecard_id=scorecard.id,
                    driver_id="D67890",
                    name="Anna Schmidt",
                    metrics=json.dumps([
                        {"name": "DNR", "value": "1.8%", "target": "1.2%", "status": "warning"},
                        {"name": "POD", "value": "96%", "target": "95%", "status": "success"}
                    ])
                )
            ]
            db.add_all(driver_kpis)
            
            # Speichern
            db.commit()
            
            # Aktualisiere Status auf "completed"
            if file_upload:
                file_upload.processing_status = "completed"
                file_upload.processing_progress = 100
                file_upload.processing_message = "Verarbeitung abgeschlossen"
                file_upload.result_url = f"/api/v1/scorecard/{scorecard.id}"
                db.commit()
                
    except Exception as e:
        # Bei Fehler Status auf "failed" setzen
        if file_upload and db:
            file_upload.processing_status = "failed"
            file_upload.error_message = str(e)
            db.commit()
        raise e

# Hilfsfunktion zum Extrahieren der Wochennummer aus einem Dateinamen
def extract_week_from_filename(filename: str) -> int:
    """
    Extrahiert die Wochennummer aus einem Dateinamen.
    Sucht nach Mustern wie "KW12", "Week12", etc.
    """
    import re
    
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

# Wenn die Datei direkt ausgeführt wird
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
