import pytest
import requests

BASE_URL = "http://127.0.0.1:8000"

# ────────────────────────────────────────
# AUTH
# ────────────────────────────────────────

def test_login_correcto():
    """Un usuario válido debe recibir un token JWT"""
    respuesta = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "admin@test.com",
        "contrasena": "admin1234"
    })
    assert respuesta.status_code == 200
    datos = respuesta.json()
    assert "token" in datos
    assert len(datos["token"]) > 0

def test_login_password_incorrecta():
    """Contraseña incorrecta debe devolver 401"""
    respuesta = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "admin@test.com",
        "contrasena": "incorrecta"
    })
    assert respuesta.status_code == 401

def test_login_email_invalido():
    """Un email sin @ debe devolver 422"""
    respuesta = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "esto-no-es-email",
        "contrasena": "admin1234"
    })
    assert respuesta.status_code == 422

def test_login_sin_campos():
    """Sin campos debe devolver 422"""
    respuesta = requests.post(f"{BASE_URL}/auth/login", json={})
    assert respuesta.status_code == 422

# ────────────────────────────────────────
# ALUMNOS
# ────────────────────────────────────────

def test_crear_alumno_correcto():
    """Un alumno con datos válidos debe crearse correctamente"""
    respuesta = requests.post(f"{BASE_URL}/alumnos/", json={
        "nombre": "Juan Test",
        "email": "juan@test.com",
        "dni": "12345678A",
        "telefono": "600111222",
        "ciclo_id": 2
    })
    assert respuesta.status_code == 201
    datos = respuesta.json()
    assert datos["dni"] == "12345678A"
    assert datos["usuario"]["email"] == "juan@test.com"

def test_crear_alumno_email_duplicado():
    """No se puede crear un alumno con un email ya registrado"""
    respuesta = requests.post(f"{BASE_URL}/alumnos/", json={
        "nombre": "Juan Duplicado",
        "email": "juan@test.com",   # mismo email que el test anterior
        "dni": "99999999Z",
        "telefono": "600111222",
        "ciclo_id": 2
    })
    assert respuesta.status_code == 400

def test_crear_alumno_dni_duplicado():
    """No se puede crear un alumno con un DNI ya registrado"""
    respuesta = requests.post(f"{BASE_URL}/alumnos/", json={
        "nombre": "Juan Duplicado",
        "email": "otro@test.com",
        "dni": "12345678A",         # mismo DNI que el test anterior
        "telefono": "600111222",
        "ciclo_id": 2
    })
    assert respuesta.status_code == 400

def test_obtener_alumnos():
    """GET /alumnos/ debe devolver una lista"""
    respuesta = requests.get(f"{BASE_URL}/alumnos/")
    assert respuesta.status_code == 200
    assert isinstance(respuesta.json(), list)

def test_obtener_alumno_inexistente():
    """Pedir un alumno que no existe debe devolver 404"""
    respuesta = requests.get(f"{BASE_URL}/alumnos/99999")
    assert respuesta.status_code == 404

# ────────────────────────────────────────
# EMPRESAS
# ────────────────────────────────────────

def test_crear_empresa_correcta():
    """Una empresa con datos válidos debe crearse correctamente"""
    respuesta = requests.post(f"{BASE_URL}/empresas/", json={
        "cif": "B12345678",
        "nombre": "Tech Test S.L.",
        "direccion": "Calle Test 1",
        "web": "https://www.techtest.com",
        "email": "info@techtest.com",
        "telefono": "912345678",
        "persona_contacto": "Ana García"
    })
    assert respuesta.status_code == 201
    datos = respuesta.json()
    assert datos["cif"] == "B12345678"

def test_crear_empresa_cif_duplicado():
    """No se puede crear una empresa con un CIF ya registrado"""
    respuesta = requests.post(f"{BASE_URL}/empresas/", json={
        "cif": "B12345678",         # mismo CIF que el test anterior
        "nombre": "Otra Empresa",
        "direccion": "Calle Test 2",
        "email": "otra@test.com",
        "telefono": "912345679"
    })
    assert respuesta.status_code == 400

def test_obtener_empresas():
    """GET /empresas/ debe devolver una lista"""
    respuesta = requests.get(f"{BASE_URL}/empresas/")
    assert respuesta.status_code == 200
    assert isinstance(respuesta.json(), list)

def test_obtener_empresa_inexistente():
    """Pedir una empresa que no existe debe devolver 404"""
    respuesta = requests.get(f"{BASE_URL}/empresas/99999")
    assert respuesta.status_code == 404

# ────────────────────────────────────────
# JWT Y RUTAS PROTEGIDAS
# ────────────────────────────────────────

def obtener_token(email: str, contrasena: str) -> str:
    """Helper que hace login y devuelve el token"""
    respuesta = requests.post(f"{BASE_URL}/auth/login", json={
        "email": email,
        "contrasena": contrasena
    })
    return respuesta.json()["token"]

def test_crear_ciclo_sin_token():
    """Crear un ciclo sin token debe devolver 403"""
    respuesta = requests.post(f"{BASE_URL}/ciclos/", json={
        "nombre": "ASIR",
        "anio_inicio": 2024,
        "anio_fin" : 2026
    })
    assert respuesta.status_code == 401

def test_crear_ciclo_con_token_admin():
    """Un admin con token válido puede crear un ciclo"""
    token = obtener_token("admin@test.com", "admin1234")

    # Primero borramos el ciclo si ya existe de una ejecución anterior
    ciclos = requests.get(f"{BASE_URL}/ciclos/").json()
    for ciclo in ciclos:
        if ciclo["nombre"] == "ASIR":
            requests.delete(
                f"{BASE_URL}/ciclos/{ciclo['id']}",
                headers={"Authorization": f"Bearer {token}"}
            )

    respuesta = requests.post(
        f"{BASE_URL}/ciclos/",
        json={
            "nombre": "ASIR",
            "anio_inicio": 2024,
            "anio_fin": 2026
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert respuesta.status_code == 201
    assert respuesta.json()["nombre"] == "ASIR"

def  test_crear_ciclo_con_token_alumno():
    """Un alumno con token válido no puede crear un ciclo -- debe devolver 403"""
    # Primero creamos un alumno de prueba
    requests.post(f"{BASE_URL}/alumnos/", json={
        "nombre": "Alumno Prueba",
        "email": "alumno_prueba@test.com",
        "dni": "11111111A",
        "telefono": "600000001",
        "ciclo_id": 2
    })

    # El alumno intenta crear un ciclo
    token = obtener_token("alumno_prueba@test.com", "Temp_11111111A!")
    respuesta = requests.post(
        f"{BASE_URL}/ciclos/",
        json={
            "nombre": "Ciclo No Permitido",
            "anio_inicio": 2024,
            "anio_fin": 2026
        },
        headers={"Authorization", f"Bearer {token}"}
    )
    assert respuesta.status_code == 403

def test_crear_ciclo_con_token_alumno():
    """Un alumno con token válido no puede crear un ciclo — debe devolver 403"""
    token_admin = obtener_token("admin@test.com", "admin1234")

    # Creamos el alumno solo si no existe ya
    r = requests.post(f"{BASE_URL}/alumnos/", json={
        "nombre": "Alumno Prueba",
        "email": "alumno_prueba@test.com",
        "dni": "11111111A",
        "telefono": "600000001",
        "ciclo_id": 2
    })

    # Si da 400 es porque ya existe, no pasa nada, continuamos
    token = obtener_token("alumno_prueba@test.com", "Temp_11111111A!")
    respuesta = requests.post(
        f"{BASE_URL}/ciclos/",
        json={
            "nombre": "Ciclo No Permitido",
            "anio_inicio": 2024,
            "anio_fin": 2026
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert respuesta.status_code == 403

def test_token_invalido_es_rechazado():
    """Un token inventado debe devolver 401"""
    respuesta = requests.post(
        f"{BASE_URL}/ciclos/",
        json={
            "nombre": "Ciclo Falso",
            "anio_inicio": 2024,
            "anio_fin": 2026
        },
        headers={"Authorization": "Bearer token_inventado_que_no_vale"}
    )
    assert respuesta.status_code == 401

def test_ciclo_anio_fin_menor_que_inicio():
    """Un ciclo con año de fin menor que inicio debe devolver 400"""
    token = obtener_token("admin@test.com", "admin1234")
    respuesta = requests.post(
        f"{BASE_URL}/ciclos/",
        json={
            "nombre": "Ciclo Malo",
            "anio_inicio": 2026,
            "anio_fin": 2024      # año fin menor que inicio
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert respuesta.status_code == 400

def test_obtener_ciclos_es_publico():
    """GET /ciclos/ es acceisible sin token"""
    respuesta = requests.get(f"{BASE_URL}/ciclos/")
    assert respuesta.status_code == 200
    assert isinstance(respuesta.json(), list)

# ────────────────────────────────────────
# IMPORTACIÓN MASIVA
# ────────────────────────────────────────

CSV_VALIDO = """nombre,email,dni,ciclo_id,telefono
Pedro Sanchez,pedro@test.com,22222222B,2,600222333
Laura Garcia,laura@test.com,33333333C,2,600333444"""

CSV_EMAIL_INVALIDO = """nombre,email,dni,ciclo_id,telefono
Roto Mal,esto-no-es-email,44444444D,2,600444555"""

CSV_TELEFONO_INVALIDO = """nombre,email,dni,ciclo_id,telefono
Roto Mal,roto@test.com,55555555E,2,noestelefono"""

CSV_SIN_CICLO = """nombre,email,dni,ciclo_id,telefono
Roto Mal,roto2@test.com,66666666F,,600555666"""

JSON_VALIDO = [
    {
        "cif": "A99999999",
        "nombre": "Empresa JSON Test",
        "direccion": "Calle JSON 1",
        "web": "https://www.jsontest.com",
        "email": "info@jsontest.com",
        "telefono": "911111111",
        "persona_contacto": "Juan JSON"
    }
]

JSON_EMAIL_INVALIDO = [
    {
        "cif": "B88888888",
        "nombre": "Empresa Rota",
        "direccion": "Calle Rota 1",
        "email": "esto-no-es-email",
        "telefono": "911111112"
    }
]

def como_csv(contenido: str):
    """Convierte un string en fichero CSV para enviarlo"""
    return {"archivo": ("alumnos.csv", contenido.encode(), "text/csv")}

def como_json(contenido: list):
    """Convierte una lista en fichero JSON para enviarlo"""
    import json
    return {"archivo": ("empresas.json", json.dumps(contenido).encode(), "application/json")}

def test_importar_csv_sin_token():
    """Importar CSV sin token debe devolver 401"""
    respuesta = requests.post(
        f"{BASE_URL}/importar/alumnos",
        files=como_csv(CSV_VALIDO)
    )
    assert respuesta.status_code == 401

def test_importar_csv_valido():
    """Un CSV válido debe importar los alumnos correctamente"""
    token = obtener_token("admin@test.com", "admin1234")
    respuesta = requests.post(
        f"{BASE_URL}/importar/alumnos",
        files=como_csv(CSV_VALIDO),
        headers={"Authorization": f"Bearer {token}"}
    )
    assert respuesta.status_code == 200
    datos = respuesta.json()
    assert datos["importados"] == 2
    assert datos["duplicados"] == 0
    assert len(datos["errores"]) == 0

def test_importar_csv_duplicado():
    """Importar el mismo CSV dos veces no debe duplicar alumnos"""
    token = obtener_token("admin@test.com", "admin1234")
    respuesta = requests.post(
        f"{BASE_URL}/importar/alumnos",
        files=como_csv(CSV_VALIDO),
        headers={"Authorization": f"Bearer {token}"}
    )
    assert respuesta.status_code == 200
    assert respuesta.json()["duplicados"] == 2

def test_importar_csv_email_invalido():
    """Un CSV con email inválido debe reportar el error"""
    token = obtener_token("admin@test.com", "admin1234")
    respuesta = requests.post(
        f"{BASE_URL}/importar/alumnos",
        files=como_csv(CSV_EMAIL_INVALIDO),
        headers={"Authorization": f"Bearer {token}"}
    )
    assert respuesta.status_code == 200
    assert len(respuesta.json()["errores"]) == 1

def test_importar_csv_telefono_invalido():
    """Un CSV con teléfono inválido debe reportar el error"""
    token = obtener_token("admin@test.com", "admin1234")
    respuesta = requests.post(
        f"{BASE_URL}/importar/alumnos",
        files=como_csv(CSV_TELEFONO_INVALIDO),
        headers={"Authorization": f"Bearer {token}"}
    )
    assert respuesta.status_code == 200
    assert len(respuesta.json()["errores"]) == 1

def test_importar_archivo_no_csv():
    """Subir un archivo que no es CSV debe devolver 400"""
    token = obtener_token("admin@test.com", "admin1234")
    respuesta = requests.post(
        f"{BASE_URL}/importar/alumnos",
        files={"archivo": ("trampa.pdf", b"contenido falso", "application/pdf")},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert respuesta.status_code == 400

def test_importar_json_valido():
    """Un JSON válido debe importar las empresas correctamente"""
    token = obtener_token("admin@test.com", "admin1234")

    # Borramos si ya existe
    empresas = requests.get(f"{BASE_URL}/empresas/").json()
    for empresa in empresas:
        if empresa["cif"] == "A99999999":
            requests.delete(
                f"{BASE_URL}/empresas/{empresa['id']}",
                headers={"Authorization": f"Bearer {token}"}
            )

    respuesta = requests.post(
        f"{BASE_URL}/importar/empresas",
        files=como_json(JSON_VALIDO),
        headers={"Authorization": f"Bearer {token}"}
    )
    assert respuesta.status_code == 200
    assert respuesta.json()["importadas"] == 1

def test_importar_json_duplicado():
    """Importar el mismo JSON dos veces no debe duplicar empresas"""
    token = obtener_token("admin@test.com", "admin1234")
    respuesta = requests.post(
        f"{BASE_URL}/importar/empresas",
        files=como_json(JSON_VALIDO),
        headers={"Authorization": f"Bearer {token}"}
    )
    assert respuesta.status_code == 200
    assert respuesta.json()["duplicadas"] == 1

def test_importar_json_email_invalido():
    """Un JSON con email inválido debe reportar el error"""
    token = obtener_token("admin@test.com", "admin1234")
    respuesta = requests.post(
        f"{BASE_URL}/importar/empresas",
        files=como_json(JSON_EMAIL_INVALIDO),
        headers={"Authorization": f"Bearer {token}"}
    )
    assert respuesta.status_code == 200
    assert len(respuesta.json()["errores"]) == 1

def test_importar_archivo_no_json():
    """Subir un archivo que no es JSON debe devolver 400"""
    token = obtener_token("admin@test.com", "admin1234")
    respuesta = requests.post(
        f"{BASE_URL}/importar/empresas",
        files={"archivo": ("trampa.csv", b"nombre,email", "text/csv")},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert respuesta.status_code == 400

# ────────────────────────────────────────
# ASIGNACIONES
# ────────────────────────────────────────

def test_listar_asignaciones():
    """GET /asignaciones/ debe devolver una lista"""
    respuesta = requests.get(f"{BASE_URL}/asignaciones/")
    assert respuesta.status_code == 200
    assert isinstance(respuesta.json(), list)

def test_crear_asignacion_correcta():
    """Una asignación válida debe crearse correctamente"""
    token = obtener_token("admin@test.com", "admin1234")

    # Primero borramos si ya existe una asignación para el alumno de prueba
    asignaciones = requests.get(f"{BASE_URL}/asignaciones/").json()
    for asignacion in asignaciones:
        if asignacion["alumno_id"] == 1:
            requests.delete(
                f"{BASE_URL}/asignaciones/{asignacion['id']}",
                headers={"Authorization": f"Bearer {token}"}
            )

    # Obtenemos IDs reales de alumno y empresa
    alumnos = requests.get(f"{BASE_URL}/alumnos/").json()
    empresas = requests.get(f"{BASE_URL}/empresas/").json()

    if not alumnos or not empresas:
        return

    respuesta = requests.post(
        f"{BASE_URL}/asignaciones/",
        json={
            "alumno_id": alumnos[0]["id"],
            "empresa_id": empresas[0]["id"]
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert respuesta.status_code == 201
    datos = respuesta.json()
    assert datos["estado"] == "pendiente"
    assert datos["alumno_id"] == alumnos[0]["id"]
    assert datos["empresa_id"] == empresas[0]["id"]

def test_crear_asignacion_alumno_duplicado():
    """No se puede asignar un alumno que ya tiene asignación"""
    token = obtener_token("admin@test.com", "admin1234")
    alumnos = requests.get(f"{BASE_URL}/alumnos/").json()
    empresas = requests.get(f"{BASE_URL}/empresas/").json()

    if not alumnos or not empresas:
        return

    respuesta = requests.post(
        f"{BASE_URL}/asignaciones/",
        json={
            "alumno_id": alumnos[0]["id"],
            "empresa_id": empresas[0]["id"]
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert respuesta.status_code == 400
    assert "ya tiene una asignación" in respuesta.json()["detail"]

def test_crear_asignacion_alumno_inexistente():
    """Asignar un alumno inexistente debe devolver 404"""
    token = obtener_token("admin@test.com", "admin1234")
    empresas = requests.get(f"{BASE_URL}/empresas/").json()

    if not empresas:
        return

    respuesta = requests.post(
        f"{BASE_URL}/asignaciones/",
        json={
            "alumno_id": 99999,
            "empresa_id": empresas[0]["id"]
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert respuesta.status_code == 404

def test_crear_asignacion_empresa_inexistente():
    """Asignar a una empresa inexistente debe devolver 404"""
    token = obtener_token("admin@test.com", "admin1234")
    alumnos = requests.get(f"{BASE_URL}/alumnos/").json()

    if not alumnos:
        return

    respuesta = requests.post(
        f"{BASE_URL}/asignaciones/",
        json={
            "alumno_id": alumnos[0]["id"],
            "empresa_id": 99999
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert respuesta.status_code == 404

def test_cambiar_estado_asignacion():
    """El profesor puede cambiar el estado de una asignación"""
    token = obtener_token("admin@test.com", "admin1234")
    asignaciones = requests.get(f"{BASE_URL}/asignaciones/").json()

    if not asignaciones:
        return

    respuesta = requests.put(
        f"{BASE_URL}/asignaciones/{asignaciones[0]['id']}/estado",
        json={"estado": "asignado"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert respuesta.status_code == 200
    assert respuesta.json()["estado"] == "asignado"

def test_cambiar_estado_invalido():
    """Un estado no válido debe devolver 400"""
    token = obtener_token("admin@test.com", "admin1234")
    asignaciones = requests.get(f"{BASE_URL}/asignaciones/").json()

    if not asignaciones:
        return

    respuesta = requests.put(
        f"{BASE_URL}/asignaciones/{asignaciones[0]['id']}/estado",
        json={"estado": "estado_inventado"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert respuesta.status_code == 400

def test_crear_asignacion_sin_token():
    """Crear asignación sin token debe devolver 401"""
    respuesta = requests.post(
        f"{BASE_URL}/asignaciones/",
        json={"alumno_id": 1, "empresa_id": 1}
    )
    assert respuesta.status_code == 401


# ────────────────────────────────────────
# CV Y PERFIL DEL ALUMNO
# ────────────────────────────────────────

def test_subir_cv_correcto():
    """Un alumno autenticado puede subir su CV en PDF"""
    token = obtener_token("alumno@test.com", "alumno1234")
    respuesta = requests.post(
        f"{BASE_URL}/alumnos/me/cv",
        files={"archivo": ("cv.pdf", b"contenido pdf de prueba", "application/pdf")},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert respuesta.status_code == 200
    assert "CV subido correctamente" in respuesta.json()["mensaje"]

def test_subir_cv_archivo_no_pdf():
    """Subir un archivo que no es PDF debe devolver 400"""
    token = obtener_token("alumno@test.com", "alumno1234")
    respuesta = requests.post(
        f"{BASE_URL}/alumnos/me/cv",
        files={"archivo": ("cv.docx", b"contenido falso", "application/docx")},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert respuesta.status_code == 400

def test_subir_cv_sin_token():
    """Subir CV sin token debe devolver 401 o 403"""
    respuesta = requests.post(
        f"{BASE_URL}/alumnos/me/cv",
        files={"archivo": ("cv.pdf", b"contenido pdf", "application/pdf")}
    )
    assert respuesta.status_code in [401, 403]

def test_obtener_mi_asignacion():
    """Un alumno autenticado puede ver su asignación"""
    token = obtener_token("alumno@test.com", "alumno1234")
    respuesta = requests.get(
        f"{BASE_URL}/alumnos/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert respuesta.status_code == 200
    datos = respuesta.json()
    assert "estado" in datos

def test_obtener_mi_asignacion_sin_token():
    """Ver asignación sin token debe devolver 401 o 403"""
    respuesta = requests.get(f"{BASE_URL}/alumnos/me")
    assert respuesta.status_code in [401, 403]

def test_actualizar_perfil_correcto():
    """Un alumno puede actualizar su perfil"""
    token = obtener_token("alumno@test.com", "alumno1234")
    respuesta = requests.put(
        f"{BASE_URL}/alumnos/me",
        json={"telefono": "611222333"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert respuesta.status_code == 200
    assert respuesta.json()["telefono"] == "611222333"

def test_actualizar_perfil_sin_token():
    """Actualizar perfil sin token debe devolver 401 o 403"""
    respuesta = requests.put(
        f"{BASE_URL}/alumnos/me",
        json={"telefono": "611222333"}
    )
    assert respuesta.status_code in [401, 403]


# ────────────────────────────────────────
# PROFESORES
# ────────────────────────────────────────

def test_listar_profesores():
    """GET /profesores/ debe devolver una lista"""
    respuesta = requests.get(f"{BASE_URL}/profesores/")
    assert respuesta.status_code == 200
    assert isinstance(respuesta.json(), list)

def test_crear_profesor_correcto():
    """Un profesor con datos válidos debe crearse correctamente"""
    token = obtener_token("admin@test.com", "admin1234")
    ciclos = requests.get(f"{BASE_URL}/ciclos/").json()

    if not ciclos:
        return

    # Borramos si ya existe
    profesores = requests.get(f"{BASE_URL}/profesores/").json()
    for profesor in profesores:
        if profesor["usuario"]["email"] == "profesor_nuevo@test.com":
            requests.delete(
                f"{BASE_URL}/profesores/{profesor['id']}",
                headers={"Authorization": f"Bearer {token}"}
            )

    respuesta = requests.post(
        f"{BASE_URL}/profesores/",
        json={
            "nombre": "Profesor Nuevo",
            "email": "profesor_nuevo@test.com",
            "ciclo_id": ciclos[0]["id"]
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert respuesta.status_code == 201
    datos = respuesta.json()
    assert datos["usuario"]["email"] == "profesor_nuevo@test.com"

def test_crear_profesor_email_duplicado():
    """No se puede crear un profesor con email ya registrado"""
    token = obtener_token("admin@test.com", "admin1234")
    ciclos = requests.get(f"{BASE_URL}/ciclos/").json()

    if not ciclos:
        return

    respuesta = requests.post(
        f"{BASE_URL}/profesores/",
        json={
            "nombre": "Profesor Duplicado",
            "email": "profesor_nuevo@test.com",
            "ciclo_id": ciclos[0]["id"]
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert respuesta.status_code == 400

def test_crear_profesor_sin_token():
    """Crear profesor sin token debe devolver 401"""
    respuesta = requests.post(
        f"{BASE_URL}/profesores/",
        json={
            "nombre": "Profesor Sin Auth",
            "email": "sinauth@test.com",
            "ciclo_id": 1
        }
    )
    assert respuesta.status_code == 401