from pydantic import BaseModel, EmailStr
from typing import Literal

# Lo que recibe el endpoint de loging
class LoginSchema(BaseModel):
    email: EmailStr
    contrasena: str

# Lo que  devuelve el endopoint de login
class TokenSchema(BaseModel):
    token: str
    tipo: str = "bearer"
    rol: str

# Lo que devuelve cuando pedimos info de un usuario
class UsuarioSchema(BaseModel):
    id: int
    nombre: str
    email: EmailStr
    rol: Literal["admin", "profesor", "alumno"]

    class Config:
        from_attributes = True