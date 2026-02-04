from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config import Config

DB_URL = (
    f"mysql+pymysql://{Config.DB_USER}:{Config.DB_PASSWORD}"
    f"@{Config.DB_HOST}:{Config.DB_PORT}/{Config.DB_NAME}"
)

engine = create_engine(DB_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
