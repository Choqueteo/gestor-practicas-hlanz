import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  PageHeader, Card, Boton, Select,
  Tabla, FilaTabla, CeldaTabla, MensajeError, Badge
} from '../components';
// Importar colors para usarlo en el componente
import { useTheme } from '../context/ThemeContext';

export default function Asignaciones({ onVolver }) {
  const { colors } = useTheme();
  const [asignaciones, setAsignaciones] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nueva, setNueva] = useState({ alumno_id: '', empresa_id: '' });

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      const [respA, respAl, respE] = await Promise.all([
        api.get('/asignaciones/'),
        api.get('/alumnos/'),
        api.get('/empresas/')
      ]);
      setAsignaciones(respA.data);
      setAlumnos(respAl.data);
      setEmpresas(respE.data);
    } catch {
      setError('Error al cargar los datos');
    } finally {
      setCargando(false);
    }
  };

  const crear = async (e) => {
    e.preventDefault();
    try {
      await api.post('/asignaciones/', {
        alumno_id: parseInt(nueva.alumno_id),
        empresa_id: parseInt(nueva.empresa_id)
      });
      setMostrarForm(false);
      setNueva({ alumno_id: '', empresa_id: '' });
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al crear la asignación');
    }
  };

  const cambiarEstado = async (id, estadoActual) => {
    const siguiente = estadoActual === 'pendiente' ? 'asignado' : 'pendiente';
    try {
      await api.put(`/asignaciones/${id}/estado`, { estado: siguiente });
      cargarDatos();
    } catch {
      setError('Error al cambiar el estado');
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta asignación?')) return;
    try {
      await api.delete(`/asignaciones/${id}`);
      cargarDatos();
    } catch {
      setError('Error al eliminar la asignación');
    }
  };

  const getNombre = (id, lista) => {
    const item = lista.find(i => i.id === id);
    return item ? (item.usuario?.nombre || item.nombre) : `#${id}`;
  };

  return (
    <div>
      <PageHeader
        titulo="Asignaciones"
        subtitulo={`${asignaciones.length} asignaciones registradas`}
        boton={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Boton variante="secondary" onClick={onVolver}>← Volver</Boton>
            <Boton onClick={() => setMostrarForm(!mostrarForm)}>+ Nueva asignación</Boton>
          </div>
        }
      />

      <MensajeError mensaje={error} />

      {mostrarForm && (
        <Card>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
            Nueva asignación
          </p>
          <form onSubmit={crear} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <Select
                value={nueva.alumno_id}
                onChange={(e) => setNueva({ ...nueva, alumno_id: e.target.value })}
                required
              >
                <option value="">Selecciona un alumno</option>
                {alumnos.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.usuario?.nombre} — {a.usuario?.email}
                  </option>
                ))}
              </Select>
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <Select
                value={nueva.empresa_id}
                onChange={(e) => setNueva({ ...nueva, empresa_id: e.target.value })}
                required
              >
                <option value="">Selecciona una empresa</option>
                {empresas.map(e => (
                  <option key={e.id} value={e.id}>{e.nombre}</option>
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
          columnas={['Alumno', 'Empresa', 'Estado', 'Acciones']}
          vacio={cargando ? 'Cargando...' : 'No hay asignaciones todavía'}
        >
          {asignaciones.map((a) => (
            <FilaTabla key={a.id}>
              <CeldaTabla>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '28px', height: '28px', minWidth: '28px',
                    borderRadius: '50%', background: colors.orange,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', fontWeight: '500', color: '#fff'
                  }}>
                    {getNombre(a.alumno_id, alumnos).slice(0, 2).toUpperCase()}
                  </div>
                  <span>{getNombre(a.alumno_id, alumnos)}</span>
                </div>
              </CeldaTabla>
              <CeldaTabla>{getNombre(a.empresa_id, empresas)}</CeldaTabla>
              <CeldaTabla>
                <Badge tipo={a.estado === 'asignado' ? 'success' : 'warning'}>
                  {a.estado}
                </Badge>
              </CeldaTabla>
              <CeldaTabla>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <Boton
                    variante={a.estado === 'pendiente' ? 'primary' : 'secondary'}
                    onClick={() => cambiarEstado(a.id, a.estado)}
                  >
                    {a.estado === 'pendiente' ? '✓ Aceptar' : '↩ Pendiente'}
                  </Boton>
                  <Boton variante="danger" onClick={() => eliminar(a.id)}>
                    🗑
                  </Boton>
                </div>
              </CeldaTabla>
            </FilaTabla>
          ))}
        </Tabla>
      </Card>
    </div>
  );
}

