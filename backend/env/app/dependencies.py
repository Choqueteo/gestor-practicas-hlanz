from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.usuario import Usuario
from dotenv import load_dotenv
from pathlib import Path
import jwt
import os

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

# Le dice a FastAPI que espere un token en la cabecera Authorization: Bearer ...
bearer_scheme = HTTPBearer()

def get_usuario_actual(
    credenciales: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
) -> Usuario:
    """Verifica el JWT y devuelve el usuario actual"""

    try:
        payload = jwt.decode(
            credenciales.credentials,
            os.getenv("SECRET_KEY"),
            algorithms=[os.getenv("ALGORITHM")]
        )
        usuario_id = payload.get("id")
        if not usuario_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El token ha expirado"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )

    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado"
        )
    return usuario


def solo_admin(usuario: Usuario = Depends(get_usuario_actual)) -> Usuario:
    """Solo permite acceso a administradores"""
    if usuario.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para realizar esta acción"
        )
    return usuario


def solo_profesor(usuario: Usuario = Depends(get_usuario_actual)) -> Usuario:
    """Solo permite acceso a profesores y admins"""
    if usuario.rol not in ["profesor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para realizar esta acción"
        )
    return usuario

