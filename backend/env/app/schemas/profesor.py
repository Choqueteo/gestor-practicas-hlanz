from pydantic import BaseModel, EmailStr

class UsuarioBasicoSchema(BaseModel):
    nombre: str
    email: EmailStr

    class Config:
        from_attributes = True

class ProfesorCrearSchema(BaseModel):
    nombre: str
    email: EmailStr
    ciclo_id: int

class ProfesorSchema(BaseModel):
    id: int
    ciclo_id: int
    usuario: UsuarioBasicoSchema

    class Config:
        from_attributes = True