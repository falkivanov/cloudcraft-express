
FROM python:3.11-slim

WORKDIR /app

# Installiere Abhängigkeiten
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Kopiere Anwendungsdateien
COPY . .

# Standardwerte für Umgebungsvariablen
ENV HOST=0.0.0.0
ENV PORT=8000
ENV UPLOAD_DIR=/app/uploads

# Erstelle Upload-Verzeichnis
RUN mkdir -p /app/uploads

# Exponiere Port
EXPOSE 8000

# Starte Anwendung
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
