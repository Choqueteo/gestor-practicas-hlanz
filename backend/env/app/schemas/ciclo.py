from pydantic import BaseModel

class CicloCrearSchema(BaseModel):
    nombre: str
    anio_inicio: int
    anio_fin: int

class CicloSchema(BaseModel):
    id: int
    nombre: str
    anio_inicio: int
    anio_fin: int

    class Config:
        from_attributes = True