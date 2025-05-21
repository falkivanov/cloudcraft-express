
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Konfiguration der SQLite-Datenbank
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

# Engine erstellen (echo=True für Debug-Ausgaben)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# SessionLocal-Klasse erstellen
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base-Klasse erstellen, von der alle Modelle erben werden
Base = declarative_base()
