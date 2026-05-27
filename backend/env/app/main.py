from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers.auth import router as auth_router
from app.routers.alumnos import router as alumnos_router
from app.routers.empresas import router as empresas_router
from app.routers.ciclos import router as ciclos_router
from app.routers.importacion import router as importacion_router
# Importamos todos los modelos para que SQLAlchemy los conozca
from app.models.usuario import Usuario
from app.models.alumno import Alumno
from app.models.empresa import Empresa
from app.models.ciclo import Ciclo
from app.routers.profesores import router as profesores_router
from app.routers.asignaciones import router as asignaciones_router


Base.metadata.create_all(bind=engine)

# Crea la aplicacioón FastAPI
app = FastAPI(
    title="Gestor de Prácticas",
    description="API para gestionar las prácticas empresas del colegio IES HLanz",
    version="1.0.0"
)

# Permite peticiones desde React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registramos los routers
app.include_router(auth_router)
app.include_router(alumnos_router)
app.include_router(empresas_router)
app.include_router(ciclos_router)
app.include_router(importacion_router)
app.include_router(profesores_router)
app.include_router(asignaciones_router)

@app.get("/")
def inicio():
    return {"mensaje": "API de Gestor de Prácticas funcionando ✅"}