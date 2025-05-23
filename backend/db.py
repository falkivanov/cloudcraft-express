
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Lade Umgebungsvariablen aus .env Datei
load_dotenv()

# Konfiguration der Datenbank
# Verwende Umgebungsvariable oder Standard-Verbindungsstring für PostgreSQL
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/scorecard_db"
)

# Engine erstellen
engine = create_engine(DATABASE_URL)

# SessionLocal-Klasse erstellen
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base-Klasse erstellen, von der alle Modelle erben werden
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
