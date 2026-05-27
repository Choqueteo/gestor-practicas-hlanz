from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from app.database import Base

class Asignacion(Base):
    __tablename__ = "asignaciones"

    id = Column(Integer, primary_key=True, index=True)
    alumno_id = Column(Integer, ForeignKey("alumnos.id"), nullable=False)
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    estado = Column(
        Enum("pendiente", "asignado", "rechazado"),
        default="pendiente",
        nullable=False
    )