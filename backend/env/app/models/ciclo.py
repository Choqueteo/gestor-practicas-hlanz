from sqlalchemy import Column, Integer, String
from app.database import Base

class Ciclo(Base):
    __tablename__ = "ciclos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    anio_inicio = Column(Integer, nullable=False)
    anio_fin = Column(Integer, nullable=False)