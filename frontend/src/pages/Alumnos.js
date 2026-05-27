import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  PageHeader, Card, Boton, Input, Select,
  Tabla, FilaTabla, CeldaTabla, MensajeError, Badge
} from '../components';
import { descargarCV } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function Alumnos({ onVolver }) {
  const [alumnos, setAlumnos] = useState([]);
  const [ciclos, setCiclos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevo, setNuevo] = useState({
    nombre: '', email: '', dni: '', telefono: '', ciclo_id: ''
  });
  const { colors } = useTheme();

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      const [respAlumnos, respCiclos] = await Promise.all([
        api.get('/alumnos/'),
        api.get('/ciclos/')
      ]);
      setAlumnos(respAlumnos.data);
      setCiclos(respCiclos.data);
    } catch {
      setError('Error al cargar los datos');
    } finally {
      setCargando(false);
    }
  };

  const crear = async (e) => {
    e.preventDefault();
    try {
      await api.post('/alumnos/', {
        nombre: nuevo.nombre,
        email: nuevo.email,
        dni: nuevo.dni,
        telefono: nuevo.telefono,
        ciclo_id: parseInt(nuevo.ciclo_id)
      });
      setMostrarForm(false);
      setNuevo({ nombre: '', email: '', dni: '', telefono: '', ciclo_id: '' });
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al crear el alumno');
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar este alumno?')) return;
    try {
      await api.delete(`/alumnos/${id}`);
      cargarDatos();
    } catch {
      setError('Error al eliminar el alumno');
    }
  };

  const getNombreCiclo = (ciclo_id) => {
    const ciclo = ciclos.find(c => c.id === ciclo_id);
    return ciclo ? ciclo.nombre : ciclo_id;
  };

  const getIniciales = (nombre) => {
    if (!nombre) return '??';
    const partes = nombre.split(' ');
    return partes.length >= 2
      ? partes[0][0] + partes[1][0]
      : nombre.slice(0, 2).toUpperCase();
  };

  return (
    <div>
      <PageHeader
        titulo="Alumnos"
        subtitulo={`${alumnos.length} alumnos registrados`}
        boton={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Boton variante="secondary" onClick={onVolver}>← Volver</Boton>
            <Boton onClick={() => setMostrarForm(!mostrarForm)}>+ Nuevo alumno</Boton>
          </div>
        }
      />

      <MensajeError mensaje={error} />

      {mostrarForm && (
        <Card>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
            Nuevo alumno
          </p>
          <form onSubmit={crear} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ flex: 2, minWidth: '150px' }}>
              <Input placeholder="Nombre completo" value={nuevo.nombre}
                onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} required />
            </div>
            <div style={{ flex: 2, minWidth: '150px' }}>
              <Input type="email" placeholder="Email" value={nuevo.email}
                onChange={(e) => setNuevo({ ...nuevo, email: e.target.value })} required />
            </div>
            <div style={{ flex: 1, minWidth: '100px' }}>
              <Input placeholder="DNI" value={nuevo.dni}
                onChange={(e) => setNuevo({ ...nuevo, dni: e.target.value })} required />
            </div>
            <div style={{ flex: 1, minWidth: '100px' }}>
              <Input placeholder="Teléfono" value={nuevo.telefono}
                onChange={(e) => setNuevo({ ...nuevo, telefono: e.target.value })} required />
            </div>
            <div style={{ flex: 1, minWidth: '120px' }}>
              <Select value={nuevo.ciclo_id}
                onChange={(e) => setNuevo({ ...nuevo, ciclo_id: e.target.value })} required>
                <option value="">Ciclo</option>
                {ciclos.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </Select>
            </div>
            <Boton tipo="submit">Guardar</Boton>
            <Boton variante="secondary" onClick={() => setMostrarForm(false)}>Cancelar</Boton>
          </form>
        </Card>
      )}

      <Card style={{ padding: 0 }}>
        <Tabla
          columnas={['Alumno', 'Email', 'DNI', 'Teléfono', 'Ciclo', 'CV', 'Acciones']}
          vacio={cargando ? 'Cargando...' : 'No hay alumnos todavía'}
        >
          {alumnos.map((a) => (
            <FilaTabla key={a.id} etiquetas={['Alumno', 'Email', 'DNI', 'Teléfono', 'Ciclo', 'CV', 'Acciones']}>
              <CeldaTabla>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '28px', height: '28px', minWidth: '28px',
                    borderRadius: '50%', background: colors.orange,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', fontWeight: '500', color: '#fff'
                  }}>
                    {getIniciales(a.usuario?.nombre)}
                  </div>
                  <span>{a.usuario?.nombre}</span>
                </div>
              </CeldaTabla>
              <CeldaTabla>{a.usuario?.email}</CeldaTabla>
              <CeldaTabla>{a.dni}</CeldaTabla>
              <CeldaTabla>{a.telefono}</CeldaTabla>
              <CeldaTabla>
                <Badge tipo="default">{getNombreCiclo(a.ciclo_id)}</Badge>
              </CeldaTabla>
              <CeldaTabla>
                <BotonCV alumnoId={a.id} colors={colors} />
              </CeldaTabla>
              <CeldaTabla>
                <Boton variante="danger" onClick={() => eliminar(a.id)}>
                  🗑 Eliminar
                </Boton>
              </CeldaTabla>
            </FilaTabla>
          ))}
        </Tabla>
      </Card>
    </div>
  );

  function BotonCV({ alumnoId, colors }) {
  const [tieneCV, setTieneCV] = useState(null);
  const [descargando, setDescargando] = useState(false);

  useEffect(() => {
    api.get(`/alumnos/${alumnoId}/cv/existe`)
      .then(r => setTieneCV(r.data.tiene_cv))
      .catch(() => setTieneCV(false));
  }, [alumnoId]);

  const handleDescargar = async () => {
    setDescargando(true);
    try {
      await descargarCV(alumnoId);
    } catch {
      // CV no disponible
    } finally {
      setDescargando(false);
    }
  };

  if (tieneCV === null) return <span style={{ fontSize: '11px', color: colors.textMuted }}>...</span>;

  if (!tieneCV) return (
    <span style={{ fontSize: '11px', color: colors.textMuted }}>Sin CV</span>
  );

  return (
    <Boton
      variante="secondary"
      onClick={handleDescargar}
      disabled={descargando}
    >
      {descargando ? '⏳' : '📄 Ver CV'}
    </Boton>
  );
  }
}