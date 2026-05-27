from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.asignacion import Asignacion
from app.models.alumno import Alumno
from app.models.empresa import Empresa
from app.dependencies import solo_profesor
from typing import List
from pydantic import BaseModel
from pydantic import BaseModel as PydanticBaseModel

router = APIRouter(prefix="/asignaciones", tags=["Asignaciones"])

class AsignacionCrearSchema(BaseModel):
    alumno_id: int
    empresa_id: int

class AsignacionSchema(BaseModel):
    id: int
    alumno_id: int
    empresa_id: int
    estado: str

class ActualizarEstadoSchema(PydanticBaseModel):
    estado: str

    class Config:
        from_attributes = True


@router.get("/", response_model=List[AsignacionSchema])
def obtener_asignaciones(db: Session = Depends(get_db)):
    """Devuelve todas las asignaciones"""
    return db.query(Asignacion).all()

@router.post("/", response_model=AsignacionSchema, status_code=status.HTTP_201_CREATED)
def crear_asignacion(
    datos: AsignacionCrearSchema,
    db: Session = Depends(get_db),
    profesor=Depends(solo_profesor)
):
    """Asigna un alumno a una empresa"""
    alumno = db.query(Alumno).filter(Alumno.id == datos.alumno_id).first()
    if not alumno:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alumno no encontrado"
        )

    empresa = db.query(Empresa).filter(Empresa.id == datos.empresa_id).first()
    if not empresa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa no encontrada"
        )

    existe = db.query(Asignacion).filter(
        Asignacion.alumno_id == datos.alumno_id
    ).first()
    if existe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El alumno ya tiene una asignación"
        )

    nueva = Asignacion(
        alumno_id=datos.alumno_id,
        empresa_id=datos.empresa_id,
        estado="pendiente"
    )
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva

@router.delete("/{asignacion_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_asignacion(
    asignacion_id: int,
    db: Session = Depends(get_db),
    profesor=Depends(solo_profesor)
):
    """Elimina una asignación"""
    asignacion = db.query(Asignacion).filter(
        Asignacion.id == asignacion_id
    ).first()
    if not asignacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asignación no encontrada"
        )
    db.delete(asignacion)
    db.commit()

@router.put("/{asignacion_id}/estado", response_model=AsignacionSchema)
def actualizar_estado(
    asignacion_id: int,
    datos: ActualizarEstadoSchema,
    db: Session = Depends(get_db),
    profesor=Depends(solo_profesor)
):
    """El profesor cambia el estado de una asignación"""
    if datos.estado not in ["pendiente", "asignado", "rechazado"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Estado no válido. Usa: pendiente, asignado o rechazado"
        )

    asignacion = db.query(Asignacion).filter(
        Asignacion.id == asignacion_id
    ).first()

    if not asignacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asignación no encontrada"
        )

    asignacion.estado = datos.estado
    db.commit()
    db.refresh(asignacion)
    return asignacion