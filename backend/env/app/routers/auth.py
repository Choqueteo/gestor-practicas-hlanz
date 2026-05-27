from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.usuario import Usuario
from app.schemas.usuario import LoginSchema, TokenSchema
from dotenv import load_dotenv
from pathlib import Path
import bcrypt
import jwt
import os
from datetime import datetime, timedelta

load_dotenv(dotenv_path=Path(__file__).parent.parent.parent / ".env")

router = APIRouter(prefix="/auth", tags=["Autenticación"])

def crear_token(datos: dict) -> str:
    """Genera un token JWT con expiración"""
    expiracion = datetime.utcnow() + timedelta(
        minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
    )
    datos["exp"] = expiracion
    return jwt.encode(datos, os.getenv("SECRET_KEY"), algorithm=os.getenv("ALGORITHM"))

@router.post("/login", response_model=TokenSchema)
def login(credenciales: LoginSchema, db: Session = Depends(get_db)):
    """Endpoint de login -- devuelve un token JWT si las credenciales son correctas"""

    # Buscamos el usuario por email
    usuario = db.query(Usuario).filter(Usuario.email == credenciales.email).first()

    # Si no existe o la contraseña no coincide devolvemos 401
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas"
        )
    
    contrasena_correcta = bcrypt.checkpw(
        credenciales.contrasena.encode("utf-8"),
        usuario.contrasena.encode("utf-8")
    )

    if not contrasena_correcta:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas"
        )
    
    # Generamos el token con el id y el rol del usuario
    token = crear_token({"id":usuario.id, "rol":usuario.rol})

    return {"token":token, "tipo": "bearer", "rol": usuario.rol}