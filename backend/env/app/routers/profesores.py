from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.profesor import Profesor
from app.models.usuario import Usuario
from app.schemas.profesor import ProfesorCrearSchema, ProfesorSchema
from app.dependencies import solo_admin
from typing import List
import bcrypt

router = APIRouter(prefix="/profesores", tags=["Profesores"])

@router.get("/", response_model=List[ProfesorSchema])
def obtener_profesores(db: Session = Depends(get_db)):
    return db.query(Profesor).options(joinedload(Profesor.usuario)).all()

@router.post("/", response_model=ProfesorSchema, status_code=status.HTTP_201_CREATED)
def crear_profesor(
    datos: ProfesorCrearSchema,
    db: Session = Depends(get_db),
    admin=Depends(solo_admin)
):
    existe = db.query(Usuario).filter(Usuario.email == datos.email).first()
    if existe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )

    contrasena_temporal = f"Temp_{datos.email}!"
    hash_contrasena = bcrypt.hashpw(
        contrasena_temporal.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    nuevo_usuario = Usuario(
        nombre=datos.nombre,
        email=datos.email,
        contrasena=hash_contrasena,
        rol="profesor"
    )
    db.add(nuevo_usuario)
    db.flush()

    nuevo_profesor = Profesor(
        usuario_id=nuevo_usuario.id,
        ciclo_id=datos.ciclo_id
    )
    db.add(nuevo_profesor)
    db.commit()
    db.refresh(nuevo_profesor)
    return nuevo_profesor

@router.delete("/{profesor_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_profesor(
    profesor_id: int,
    db: Session = Depends(get_db),
    admin=Depends(solo_admin)
):
    profesor = db.query(Profesor).filter(Profesor.id == profesor_id).first()
    if not profesor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profesor no encontrado"
        )
    db.delete(profesor)
    db.commit()