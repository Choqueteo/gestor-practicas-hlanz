from pydantic import BaseModel, EmailStr
from typing import Optional

# Lo que se necesita para crear una empresa
class EmpresaCrearSchema(BaseModel):
    cif: str
    nombre: str
    direccion: str
    web: Optional[str] = None
    email: EmailStr
    telefono: str
    persona_contacto: Optional[str] = None

# Lo que se devuelve cuando pedimos info de una empresa
class EmpresaSchema(BaseModel):
    id: int
    cif: str
    nombre: str
    direccion: str
    web: Optional[str] = None
    email: EmailStr
    telefono: str
    persona_contacto: Optional[str] = None

    class Config:
        from_attributes = True