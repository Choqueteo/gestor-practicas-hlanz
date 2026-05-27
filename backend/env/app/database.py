from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# Carga las variables del archivo .env
# Indicamos la ruta exacta del .env
from pathlib import Path
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# Construye la URL de conexión cons los datos del .env
DATBASE_URL = (
    f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
    f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
)

# Crea el motor de conexión a la base de datos
engine = create_engine(DATBASE_URL)

# Cada sesión es una conversación con la base de datos
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base de la que heredarán todos los modelos
Base = declarative_base()

# Función que abre y cierra la sesión automáticamente
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


