from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.usuario import Usuario
from app.models.alumno import Alumno
from app.models.empresa import Empresa
from app.dependencies import solo_profesor
import csv
import json
import bcrypt
import re
import io

router = APIRouter(prefix="/importar", tags=["Importación"])

def validar_email(email: str) -> bool:
    return bool(re.match(r"[^@]+@[^@]+\.[^@]+", email))

def validar_telefono(telefono: str) -> bool:
    return str(telefono).isdigit()

@router.post("/alumnos", status_code=status.HTTP_200_OK)
def importar_alumnos(
    archivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    profesor = Depends(solo_profesor)
):
    """Importar alumnos masivamente desde un CSV - solo profesores y admins"""

    # Verificacmos que es un CSV
    if not archivo.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo debe ser un CSV"
        )
    contenido = archivo.file.read().decode("utf-8")
    lector = csv.DictReader(io.StringIO(contenido))

    importados = 0
    duplicados = 0
    errores = []

    for fila in lector:
        # Validaciones
        if not validar_email(fila.get("email", "")):
            errores.append({"fila": fila.get("email"), "motivo": "email inválido"})
            continue

        if not validar_telefono(fila.get("telefono", "")):
            errores.append({"fila": fila.get("email"), "motivo": "teléfono inválido"})
            continue

        if not fila.get("ciclo_id"):
            errores.append({"fila": fila.get("email"), "motivo": "ciclo_id vacío"})
            continue

        if not fila.get("dni"):
            errores.append({"fila": fila.get("email"), "motivo": "dni vacío"})
            continue
        
        if db.query(Usuario).filter(Usuario.email == fila["email"]).first():
            duplicados+=1
            continue

        if db.query(Alumno).filter(Alumno.dni == fila["dni"]).first():
            duplicados+=1
            continue

        try:
            # Generamos contraeña temporal
            contrasena_temporal = f"Temp_{fila["dni"]}!"
            hash_contrasena = bcrypt.hashpw(
                contrasena_temporal.encode("utf-8"),
                bcrypt.gensalt()
            ).decode("utf-8")

            nuevo_usuario = Usuario(
                nombre=fila["nombre"],
                email=fila["email"],
                contrasena=hash_contrasena,
                rol="alumno" #siempre alumno, ignoramos el CSV
            )
            db.add(nuevo_usuario)
            db.flush()

            nuevo_alumno = Alumno(
                usuario_id=nuevo_usuario.id,
                ciclo_id=int(fila["ciclo_id"]),
                telefono=fila["telefono"],
                dni=fila["dni"]
            )

            db.add(nuevo_alumno)
            db.commit()
            importados+=1

        except Exception as e:
            db.rollback()
            errores.append({"fila": fila.get("email"), "motivo": str(e)})
    
    return {
        "importados": importados,
        "duplicados": duplicados,
        "errores": errores
    }

@router.post("/empresas", status_code=status.HTTP_200_OK)
def importar_empresas(
    archivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    profesor=Depends(solo_profesor)
):
    """Importa empresas masivamente desde un JSON - solo profesores y admins"""

    # Verificamos que es un JSON
    if not archivo.filename.endswith(".json"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo debe ser un JSON"
        )
    
    try:
        contenido = archivo.file.read().decode("utf-8")
        datos = json.loads(contenido)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo no es un JSON válido"
        )
    
    if not isinstance(datos, list) or len(datos) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El JSON debe ser una lista de empresas"
        )
    
    importadas = 0
    duplicadas = 0
    errores = []

    for empresa in datos:
        # Validaciones
        if not empresa.get("nombre"):
            errores.append({"empresa": "sin nombre", "motivo": "nombre vacío"})
            continue

        if not empresa.get("cif"):
            errores.append({"empresa": empresa.get("nombre"), "motivo": "CIF vacío"})
            continue

        if not validar_email(empresa.get("email", "")):
            errores.append({"empresa": empresa.get("nombre"), "motivo": "email inválido"})
            continue

        if not validar_telefono(empresa.get("telefono", "")):
            errores.append({"empresa": empresa.get("nombre"), "motivo": "teléfono inválido"})
            continue

        # Comprobamos duplicados por CIF
        if db.query(Empresa).filter(Empresa.cif == empresa["cif"]).first():
            duplicadas += 1
            continue

        try:
            nueva_empresa = Empresa(
                cif=empresa["cif"],
                nombre=empresa["nombre"],
                direccion=empresa.get("direccion", ""),
                web=empresa.get("web"),
                email=empresa["email"],
                telefono=empresa["telefono"],
                persona_contacto=empresa.get("persona_contacto")
            )
            db.add(nueva_empresa)
            db.commit()
            importadas += 1

        except Exception as e:
            db.rollback()
            errores.append({"empresa": empresa.get("nombre"), "motivo": str(e)})

    return{
        "importadas": importadas,
        "duplicadas": duplicadas,
        "errores":errores
    }
