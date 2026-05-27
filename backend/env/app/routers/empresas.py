from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.empresa import Empresa
from app.schemas.empresa import EmpresaCrearSchema, EmpresaSchema
from typing import List

router = APIRouter(prefix="/empresas", tags=["Empresas"])

@router.get("/", response_model=List[EmpresaSchema])
def obtener_empresas(db: Session = Depends(get_db)):
    """Devuelve todas las empresas"""
    empresas = db.query(Empresa).all()
    return empresas

@router.get("/{empresa_id}", response_model=EmpresaSchema)
def obtener_empresa(empresa_id: int, db: Session = Depends(get_db)):
    """Deveulve una empresa por su ID"""
    empresa = db.query(Empresa).filter(Empresa.id == empresa_id).first()
    if not empresa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa no encontrada"
        )
    return empresa

@router.post("/", response_model=EmpresaSchema, status_code=status.HTTP_201_CREATED)
def crear_empresa(datos: EmpresaCrearSchema, db: Session = Depends(get_db)):
    """Crear una nueva empresa"""

    # Comprobamos que el CIF no está ya registrado
    existe = db.query(Empresa).filter(Empresa.cif == datos.cif).first()
    if existe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El CIF ya está registrado"
        )
    nueva_empresa = Empresa(
        cif=datos.cif,
        nombre=datos.nombre,
        direccion=datos.direccion,
        web=datos.web,
        email=datos.email,
        telefono=datos.telefono,
        persona_contacto=datos.persona_contacto
    )
    db.add(nueva_empresa)
    db.commit()
    db.refresh(nueva_empresa)

    return nueva_empresa

@router.delete("/{empresa_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_empresa(empresa_id: int, db: Session = Depends(get_db)):
    """Elimina una empresa por su ID"""
    empresa = db.query(Empresa).filter(Empresa.id == empresa_id).first()
    if not empresa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa no encontrada"
        )
    db.delete(empresa)
    db.commit()
