
# FinSuite API Backend

Backend-API für die FinSuite-Anwendung mit FastAPI und SQLite.

## Installation

1. Python 3.11+ installieren

2. Virtuelle Umgebung erstellen und aktivieren:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Unter Windows: venv\Scripts\activate
   ```

3. Abhängigkeiten installieren:
   ```bash
   pip install -r requirements.txt
   ```

4. Umgebungsvariablen einrichten:
   ```bash
   cp .env.example .env
   # Ggf. .env-Datei bearbeiten
   ```

## Starten des Servers

```bash
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

Oder einfach:
```bash
python app.py
```

## API-Dokumentation

Nach dem Starten ist die API-Dokumentation verfügbar unter:

- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

## Wichtige Endpunkte

- `/health` - Gesundheitscheck der API
- `/version` - Versionsinfo
- `/api/v1/scorecard/extract` - PDF-Datei hochladen und Scorecard-Daten extrahieren
- `/api/v1/scorecard/extract-drivers` - Fahrer-KPIs aus Text extrahieren
- `/api/v1/pdf/extract-text` - Text aus PDF-Datei extrahieren
- `/api/v1/processing/status` - Status einer asynchronen Verarbeitung abfragen

## Datenbank

Die Anwendung verwendet SQLite als Datenbank (Datei: `test.db`), die beim ersten Start automatisch erstellt wird.
