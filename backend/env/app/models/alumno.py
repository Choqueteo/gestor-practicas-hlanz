from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Alumno(Base):
    __tablename__ = "alumnos"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    ciclo_id = Column(Integer, ForeignKey("ciclos.id"), nullable=False)
    telefono = Column(String(15), nullable=False)
    dni = Column(String(9), unique=True, nullable=False)
    cv_pdf_path = Column(String(255))

    usuario = relationship("Usuario", lazy="select")