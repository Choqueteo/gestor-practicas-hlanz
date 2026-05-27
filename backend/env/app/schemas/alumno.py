from pydantic import BaseModel, EmailStr
from typing import Optional
class UsuarioBasicoSchema(BaseModel):
    nombre: str
    email: EmailStr

    class Config:
        from_attributes = True
# Lo que se necesita para crear un alumno
class AlumnoCrearSchema(BaseModel):
    nombre: str
    email: EmailStr
    dni: str
    telefono: str
    ciclo_id: int

# Lo que se devuelve cuando pedimos info de un alumno
class AlumnoSchema(BaseModel):
    id: int
    dni: str
    telefono: str
    ciclo_id: int
    usuario: UsuarioBasicoSchema

class AlumnoActualizarSchema(BaseModel):
    nombre: Optional[str] = None
    telefono: Optional[str] = None

    class Config:
        from_attributes = True