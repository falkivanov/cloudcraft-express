
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
    ProcessingStatus,
    FileUploadResponse,
    ExtractionResult
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

# API-Version-Endpunkt für bessere Kompatibilität
@app.get("/api/v1/health")
def api_health_check():
    return {"status": "ok", "version": app.version}

# Versions-Endpunkt
@app.get("/version")
def version():
    return {"version": app.version}

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

# Wenn die Datei direkt ausgeführt wird
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
