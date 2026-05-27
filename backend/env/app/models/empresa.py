from sqlalchemy import Column, Integer, String
from app.database import Base

class Empresa(Base):
    __tablename__ = "empresas"

    id = Column(Integer, primary_key=True, index=True)
    cif = Column(String(9), unique=True, nullable=False)
    nombre = Column(String(150), nullable=False)
    direccion = Column(String(255), nullable=False)
    web = Column(String(255), nullable=True)
    email = Column(String(100), nullable=False)
    telefono = Column(String(15), nullable=False)
    persona_contacto = Column(String(100), nullable=True)