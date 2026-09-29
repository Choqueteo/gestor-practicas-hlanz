<div align="center">

<img src="frontend/public/logohlanz.png" alt="Logo IES Hermenegildo Lanz" width="96" />

# GestorPrácticas · IES HLanz

**Aplicación web para gestionar el periodo de prácticas en empresa del alumnado del IES Politécnico Hermenegildo Lanz (Granada).**

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.136-009688?logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.14-3776AB?logo=python&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-SQLAlchemy-4479A1?logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)
![Pytest](https://img.shields.io/badge/Tests-Pytest-0A9EDC?logo=pytest&logoColor=white)

</div>

---

## 📌 Sobre el proyecto

Cada curso, el profesorado de los ciclos formativos tiene que organizar las prácticas en empresa: saber qué alumnos hay en cada ciclo, qué empresas colaboran, quién está ya colocado y quién sigue pendiente. Normalmente todo esto se lleva en hojas de cálculo sueltas y correos.

**GestorPrácticas** junta todo en una sola aplicación web con tres perfiles de usuario (**administrador**, **profesor** y **alumno**). Cada uno ve un panel distinto según sus permisos:

- El **administrador** da de alta ciclos formativos, alumnado, empresas y profesorado.
- El **profesor** asigna alumnos a empresas, controla el estado de cada asignación e importa datos de forma masiva.
- El **alumno** consulta si ya tiene empresa, sube su CV en PDF y mantiene sus datos al día.

Lo desarrollé durante mis prácticas del **1.º de DAM** (Desarrollo de Aplicaciones Multiplataforma).

## 📸 Capturas

<p align="center">
  <img src="docs/capturas/login.png" alt="Pantalla de inicio de sesión" width="90%" />
  <br><sub><b>Inicio de sesión</b></sub>
</p>

<table>
  <tr>
    <td align="center" width="50%">
      <img src="docs/capturas/admin-inicio.png" alt="Panel del administrador con estadísticas" />
      <br><sub><b>Administrador</b> · estadísticas y accesos rápidos</sub>
    </td>
    <td align="center" width="50%">
      <img src="docs/capturas/admin-menu.png" alt="Menú lateral desplegado" />
      <br><sub><b>Menú lateral</b> desplegado</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="docs/capturas/profesor-inicio.png" alt="Panel del profesor" />
      <br><sub><b>Profesor</b> · panel principal</sub>
    </td>
    <td align="center">
      <img src="docs/capturas/profesor-importar.png" alt="Importación masiva de alumnos y empresas" />
      <br><sub><b>Profesor</b> · importación masiva CSV / JSON</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="docs/capturas/alumno-inicio.png" alt="Panel del alumno con su estado de prácticas" />
      <br><sub><b>Alumno</b> · estado de su asignación</sub>
    </td>
    <td align="center">
      <img src="docs/capturas/profesor-alumnos.png" alt="Listado de alumnos" />
      <br><sub><b>Profesor</b> · listado de alumnos con ciclo y CV</sub>
    </td>
  </tr>
</table>

## ✨ Funcionalidades

### 🛠️ Administrador
- Panel de inicio con estadísticas: alumnos totales, empresas, alumnos asignados y pendientes.
- CRUD de **ciclos formativos** (con validación de año de inicio y fin).
- Gestión de **alumnos**, **empresas colaboradoras** y **profesores** (cada profesor va vinculado a un ciclo).

### 👩‍🏫 Profesor
- **Asignación de prácticas**: vincula un alumno con una empresa y cambia su estado entre `pendiente` y `asignado`.
- Consulta del alumnado y **descarga de su CV** en PDF.
- **Importación masiva**:
  - Alumnos desde **CSV** (`nombre, email, dni, ciclo_id, telefono`).
  - Empresas desde **JSON** (`cif, nombre, direccion, web, email, telefono, persona_contacto`).
  - Informe al terminar con los registros importados, los duplicados detectados y los errores de validación de cada fila.

### 🎓 Alumno
- Panel con el **estado de su asignación** y la empresa de prácticas.
- **Subida del CV** (solo se aceptan PDF).
- Edición del perfil y de los datos de contacto.

### 🔐 Común a todos los perfiles
- Inicio de sesión con **JWT** y contraseñas cifradas con **bcrypt**.
- Control de acceso por rol en cada endpoint (`401` si no hay token o no es válido, `403` si el rol no tiene permiso).
- La sesión se cierra sola cuando el token caduca.
- Cambio de email y contraseña desde *Configuración*.
- **Modo claro y oscuro**, que se guarda en el navegador.
- **Diseño responsive**: barra lateral plegable en escritorio y menú deslizante en móvil.

## 🧰 Tecnologías

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | React 19, Axios, Context API (autenticación y tema), hooks personalizados |
| **Backend** | FastAPI, Uvicorn, Pydantic (validación), SQLAlchemy (ORM) |
| **Base de datos** | MySQL / MariaDB mediante PyMySQL |
| **Seguridad** | PyJWT, bcrypt, validación de emails con `email-validator` |
| **Testing** | Pytest + Requests (tests de integración contra la API) |

## 🏗️ Arquitectura

```
┌──────────────────────┐    HTTP + JWT (Bearer)   ┌──────────────────────┐      SQLAlchemy      ┌──────────────┐
│   Frontend (React)   │ ───────────────────────▶ │   API REST FastAPI   │ ───────────────────▶ │    MySQL     │
│  localhost:3000      │ ◀─────────────────────── │   127.0.0.1:8000     │ ◀─────────────────── │              │
└──────────────────────┘          JSON            └──────────────────────┘                      └──────────────┘
                                                            │
                                                            ▼
                                                   uploads/cvs/*.pdf
```

## 📁 Estructura del repositorio

```
.
├── backend/
│   ├── requirements.txt        # Dependencias de Python
│   ├── env/
│   │   ├── .env                # Credenciales de BD y JWT (no se sube)
│   │   └── app/
│   │       ├── main.py         # Punto de entrada de FastAPI
│   │       ├── database.py     # Conexión SQLAlchemy a MySQL
│   │       ├── dependencies.py # Autenticación JWT y control de roles
│   │       ├── models/         # Modelos ORM (usuario, alumno, ciclo, empresa…)
│   │       ├── schemas/        # Esquemas Pydantic de validación
│   │       └── routers/        # Endpoints agrupados por recurso
│   ├── tests/
│   │   └── test_endpoints.py   # Tests de integración de la API
│   └── uploads/cvs/            # CV subidos por el alumnado
│
└── frontend/
    ├── public/                 # index.html, logo del centro, manifest
    └── src/
        ├── components/         # Sidebar, Topbar, PageLayout y componentes de UI
        ├── context/            # AuthContext (sesión) y ThemeContext (claro/oscuro)
        ├── hooks/              # useResponsive
        ├── pages/              # Login, paneles por rol y pantallas de gestión
        ├── services/           # Cliente Axios con interceptores JWT
        └── theme.js            # Paleta de colores y radios
```

## 🔌 Endpoints principales de la API

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| `POST` | `/auth/login` | Inicia sesión y devuelve el token JWT y el rol | Público |
| `GET` / `POST` / `DELETE` | `/ciclos/` | Listar, crear y eliminar ciclos | Lectura pública · escritura admin |
| `GET` / `POST` / `DELETE` | `/alumnos/` | Gestión del alumnado | Admin / profesor |
| `GET` / `PUT` | `/alumnos/me` | Estado de la asignación y perfil del alumno | Alumno |
| `POST` | `/alumnos/me/cv` | Subir el CV (PDF) | Alumno |
| `PUT` | `/alumnos/me/credenciales` | Cambiar email o contraseña | Usuario autenticado |
| `GET` | `/alumnos/{id}/cv` | Descargar el CV de un alumno | Admin / profesor |
| `GET` / `POST` / `DELETE` | `/empresas/` | Gestión de empresas | Admin / profesor |
| `GET` / `POST` / `DELETE` | `/profesores/` | Gestión del profesorado | Admin |
| `GET` / `POST` / `DELETE` | `/asignaciones/` | Asignaciones alumno ↔ empresa | Profesor / admin |
| `PUT` | `/asignaciones/{id}/estado` | Cambiar el estado (`pendiente` / `asignado`) | Profesor / admin |
| `POST` | `/importar/alumnos` | Importación masiva desde CSV | Profesor / admin |
| `POST` | `/importar/empresas` | Importación masiva desde JSON | Profesor / admin |

> Con el backend en marcha, FastAPI genera la documentación interactiva en **`http://127.0.0.1:8000/docs`**.

## 🚀 Puesta en marcha

### Requisitos
- Python 3.12 o superior
- Node.js 18 o superior y npm
- MySQL o MariaDB

### 1. Clonar el repositorio
```bash
git clone https://github.com/Choqueteo/gestor-practicas-hlanz.git
cd gestor-practicas-hlanz
```

### 2. Base de datos
Levanta un servidor MariaDB/MySQL y crea la base de datos `gestor_practicas`. Por ejemplo, con Docker:
```bash
docker run -d --name mariadb -p 3306:3306 \
  -e MARIADB_ROOT_PASSWORD=tu_password \
  -e MARIADB_DATABASE=gestor_practicas \
  mariadb:latest
```
Las tablas se crean solas la primera vez que arranca el backend.

### 3. Backend
Crea el archivo `backend/env/.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=gestor_practicas

SECRET_KEY=una_clave_secreta_larga
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```
Instala las dependencias y arranca la API desde `backend/env`:
```bash
cd backend/env
python -m venv .
# Windows
Scripts\activate
# Linux / macOS
source bin/activate

pip install -r ../requirements.txt
uvicorn app.main:app --reload
```
La API se queda escuchando en `http://127.0.0.1:8000`.

### 4. Frontend
```bash
cd frontend
npm install
npm start
```
La aplicación se abre en `http://localhost:3000`.

## 🧪 Tests

Los tests de integración cubren autenticación, permisos por rol, validaciones, duplicados, importación masiva, asignaciones y subida de CV. Se lanzan contra la API en marcha:

```bash
cd backend
pytest -v
```

## 🗺️ Próximas mejoras

- [ ] Configurar la URL de la API con variables de entorno (`REACT_APP_API_URL`).
- [ ] Añadir más estados al seguimiento de las prácticas (en curso, finalizada, evaluada).
- [ ] Notificar por email al alumno cuando se le asigne empresa.
- [ ] Exportar informes en PDF o Excel.
- [ ] Desplegar con Docker.

## 👤 Autor

**Cristian Aceituno** · Estudiante de 1.º de DAM en el IES Politécnico Hermenegildo Lanz (Granada)

[![GitHub](https://img.shields.io/badge/GitHub-Choqueteo-181717?logo=github)](https://github.com/Choqueteo)

---

<div align="center">
<sub>Proyecto desarrollado con fines formativos durante el periodo de prácticas del ciclo DAM.</sub>
</div>
