from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.alumno import Alumno
from app.models.usuario import Usuario
from app.models.asignacion import Asignacion
from app.models.empresa import Empresa
from app.schemas.alumno import AlumnoCrearSchema, AlumnoSchema, AlumnoActualizarSchema
from app.dependencies import solo_admin, get_usuario_actual
from typing import List, Optional
import bcrypt
import os
import shutil
from sqlalchemy.orm import Session, joinedload
router = APIRouter(prefix="/alumnos", tags=["Alumnos"])

@router.get("/me")
def obtener_mi_asignacion(
    usuario_actual: Usuario = Depends(get_usuario_actual),
    db: Session = Depends(get_db)
):
    """El alumno ve su propia asignación"""
    alumno = db.query(Alumno).filter(
        Alumno.usuario_id == usuario_actual.id
    ).first()

    if not alumno:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alumno no encontrado"
        )

    asignacion = db.query(Asignacion).filter(
        Asignacion.alumno_id == alumno.id
    ).first()

    if not asignacion:
        return {
            "estado": "pendiente",
            "empresa": None,
        }

    empresa = db.query(Empresa).filter(
        Empresa.id == asignacion.empresa_id
    ).first()

    return {
        "estado": asignacion.estado,
        "empresa": empresa.nombre if empresa else None,
    }

@router.get("/", response_model=List[AlumnoSchema])
def obtener_alumnos(db: Session = Depends(get_db)):
    """Devuelve todos los alumnos"""
    alumnos = db.query(Alumno).options(joinedload(Alumno.usuario)).all()
    return alumnos

@router.get("/{alumno_id}", response_model=AlumnoSchema)
def obtener_alumno(alumno_id: int, db: Session = Depends(get_db)):
    """Devuelve un alumno por su ID"""
    alumno = db.query(Alumno).filter(Alumno.id == alumno_id).first()
    if not alumno:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alumno no encontrado"
        )
    return alumno

@router.post("/", response_model=AlumnoSchema, status_code=status.HTTP_201_CREATED)
def crear_alumno(datos: AlumnoCrearSchema, db: Session = Depends(get_db)):
    """Crea un nuevo alumno"""

    #Comprobamos que le email no está ya registrado
    existe = db.query(Usuario).filter(Usuario.email == datos.email).first()
    if existe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    
    # Comprobamos que el DNI no está ya registrado
    existe_dni = db.query(Alumno).filter(Alumno.dni == datos.dni).first()
    if existe_dni:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El DNI ya está registrado"
        )

    # Generamos contraseña temporal a partir del DNI
    contrasena_temporal = f"Temp_{datos.dni}!"
    hash_contrasena = bcrypt.hashpw(
        contrasena_temporal.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    # Creamos el usuario
    nuevo_usuario = Usuario(
        nombre=datos.nombre,
        email=datos.email,
        contrasena=hash_contrasena,
        rol="alumno"
    )
    db.add(nuevo_usuario)
    db.flush() # para obtener el id sin hacer commit aún

    # Creamos el alumno vinculado al usuario
    nuevo_alumno = Alumno(
        usuario_id=nuevo_usuario.id,
        ciclo_id=datos.ciclo_id,
        telefono=datos.telefono,
        dni=datos.dni
    )
    db.add(nuevo_alumno)
    db.commit()
    db.refresh(nuevo_alumno)

    return nuevo_alumno

@router.delete("/{alumno_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_alumno(alumno_id: int, db: Session = Depends(get_db)):
    alumno = db.query(Alumno).filter(Alumno.id == alumno_id).first()
    if not alumno:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alumno no encontrado"
        )
    db.delete(alumno)
    db.commit()


from fastapi.responses import FileResponse

@router.post("/me/cv")
async def subir_cv(
    archivo: UploadFile = File(...),
    usuario_actual: Usuario = Depends(get_usuario_actual),
    db: Session = Depends(get_db)
):
    if not archivo.filename.endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se permiten archivos PDF"
        )

    alumno = db.query(Alumno).filter(
        Alumno.usuario_id == usuario_actual.id
    ).first()

    if not alumno:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alumno no encontrado"
        )

    carpeta = "uploads/cvs"
    os.makedirs(carpeta, exist_ok=True)
    ruta = f"{carpeta}/alumno_{alumno.id}.pdf"

    with open(ruta, "wb") as buffer:
        shutil.copyfileobj(archivo.file, buffer)

    # Guardamos la ruta en la base de datos
    alumno.cv_pdf_path = ruta
    db.commit()

    return {"mensaje": "CV subido correctamente", "ruta": ruta}

@router.get("/{alumno_id}/cv")
def descargar_cv(
    alumno_id: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_usuario_actual)
):
    """Descarga el CV de un alumno — solo profesores y admins"""
    if usuario_actual.rol not in ["profesor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para ver este CV"
        )

    alumno = db.query(Alumno).filter(Alumno.id == alumno_id).first()
    if not alumno:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alumno no encontrado"
        )

    if not alumno.cv_pdf_path or not os.path.exists(alumno.cv_pdf_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Este alumno no tiene CV subido"
        )

    return FileResponse(
        path=alumno.cv_pdf_path,
        media_type="application/pdf",
        filename=f"CV_{alumno_id}.pdf"
    )

@router.get("/{alumno_id}/cv/existe")
def cv_existe(
    alumno_id: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_usuario_actual)
):
    """Comprueba si un alumno tiene CV subido"""
    alumno = db.query(Alumno).filter(Alumno.id == alumno_id).first()
    if not alumno:
        return {"tiene_cv": False}
    return {
        "tiene_cv": bool(alumno.cv_pdf_path and os.path.exists(alumno.cv_pdf_path))
    }

@router.put("/me")
def actualizar_perfil(
    datos: AlumnoActualizarSchema,
    usuario_actual: Usuario = Depends(get_usuario_actual),
    db: Session = Depends(get_db)
):
    """El alumno actualiza sus datos de contacto"""
    alumno = db.query(Alumno).filter(
        Alumno.usuario_id == usuario_actual.id
    ).first()

    if not alumno:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alumno no encontrado"
        )

    if datos.telefono is not None:
        alumno.telefono = datos.telefono

    if datos.nombre is not None:
        usuario_actual.nombre = datos.nombre

    db.commit()
    return {
        "mensaje": "Perfil actualizado correctamente",
        "nombre": usuario_actual.nombre,
        "telefono": alumno.telefono
    }

from pydantic import BaseModel, EmailStr

class CambiarCredencialesSchema(BaseModel):
    email: Optional[EmailStr] = None
    password_actual: Optional[str] = None
    password_nuevo: Optional[str] = None

@router.put("/me/credenciales")
def cambiar_credenciales(
    datos: CambiarCredencialesSchema,
    usuario_actual: Usuario = Depends(get_usuario_actual),
    db: Session = Depends(get_db)
):
    """El usuario cambia su email o contraseña"""
    if datos.email:
        existe = db.query(Usuario).filter(
            Usuario.email == datos.email,
            Usuario.id != usuario_actual.id
        ).first()
        if existe:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ese email ya está en uso"
            )
        usuario_actual.email = datos.email

    if datos.password_nuevo:
        if not datos.password_actual:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Debes introducir tu contraseña actual"
            )
        if not bcrypt.checkpw(
            datos.password_actual.encode("utf-8"),
            usuario_actual.contrasena.encode("utf-8")
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La contraseña actual no es correcta"
            )
        usuario_actual.contrasena = bcrypt.hashpw(
            datos.password_nuevo.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

    db.commit()
    return {"mensaje": "Credenciales actualizadas correctamente"}

