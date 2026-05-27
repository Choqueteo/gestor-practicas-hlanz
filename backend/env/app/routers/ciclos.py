from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.ciclo import Ciclo
from app.schemas.ciclo import CicloCrearSchema, CicloSchema
from app.dependencies import solo_admin, get_usuario_actual
from typing import List

router = APIRouter(prefix="/ciclos", tags=["Ciclos"])

@router.get("/", response_model=List[CicloSchema])
def obetener_ciclos(db: Session = Depends(get_db)):
    """Devuelve todos los ciclos"""
    return db.query(Ciclo).all()

@router.get("/{ciclo_id}", response_model=CicloSchema)
def obetener_ciclos(ciclo_id: int, db: Session = Depends(get_db)):
    """Devuelve un ciclo por su ID"""
    ciclo = db.query(Ciclo).filter(Ciclo.id == ciclo_id).first()
    if not ciclo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ciclo no encontrado"
        )
    return ciclo

@router.post("/", response_model=CicloSchema, status_code=status.HTTP_201_CREATED)
def crear_ciclo(
    datos: CicloCrearSchema,
    db: Session = Depends(get_db),
    admin=Depends(solo_admin)   # solo admins pueden crear ciclos
):
    """Crea un nuevo ciclo — solo administradores"""
    if datos.anio_fin <= datos.anio_inicio:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El año de fin debe ser mayor que el año de inicio"
        )
    
    nuevo_ciclo = Ciclo(
        nombre=datos.nombre,
        anio_inicio=datos.anio_inicio,
        anio_fin=datos.anio_fin
    )
    db.add(nuevo_ciclo)
    db.commit()
    db.refresh(nuevo_ciclo)
    return nuevo_ciclo

@router.delete("/{ciclo_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_ciclo(
    ciclo_id: int,
    db: Session = Depends(get_db),
    admin=Depends(solo_admin)   # solo admins pueden eliminar ciclos
):
    """Elimina un ciclo — solo administradores"""
    ciclo = db.query(Ciclo).filter(Ciclo.id == ciclo_id).first()
    if not ciclo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ciclo no encontrado"
        )
    db.delete(ciclo)
    db.commit()
