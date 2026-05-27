import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  PageHeader, Card, Boton, Input, Select,
  Tabla, FilaTabla, CeldaTabla, MensajeError, Badge
} from '../components';

export default function Profesores({ onVolver }) {
  const [profesores, setProfesores] = useState([]);
  const [ciclos, setCiclos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevo, setNuevo] = useState({ nombre: '', email: '', ciclo_id: '' });

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      const [respProfesores, respCiclos] = await Promise.all([
        api.get('/profesores/'),
        api.get('/ciclos/')
      ]);
      setProfesores(respProfesores.data);
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
      await api.post('/profesores/', {
        nombre: nuevo.nombre,
        email: nuevo.email,
        ciclo_id: parseInt(nuevo.ciclo_id)
      });
      setMostrarForm(false);
      setNuevo({ nombre: '', email: '', ciclo_id: '' });
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al crear el profesor');
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar este profesor?')) return;
    try {
      await api.delete(`/profesores/${id}`);
      cargarDatos();
    } catch {
      setError('Error al eliminar el profesor');
    }
  };

  const getNombreCiclo = (ciclo_id) => {
    const ciclo = ciclos.find(c => c.id === ciclo_id);
    return ciclo ? ciclo.nombre : `#${ciclo_id}`;
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
        titulo="Profesores"
        subtitulo={`${profesores.length} profesores registrados`}
        boton={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Boton variante="secondary" onClick={onVolver}>← Volver</Boton>
            <Boton onClick={() => setMostrarForm(!mostrarForm)}>+ Nuevo profesor</Boton>
          </div>
        }
      />

      <MensajeError mensaje={error} />

      {mostrarForm && (
        <Card>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
            Nuevo profesor
          </p>
          <form onSubmit={crear} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ flex: 2, minWidth: '150px' }}>
              <Input
                placeholder="Nombre completo"
                value={nuevo.nombre}
                onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
                required
              />
            </div>
            <div style={{ flex: 2, minWidth: '150px' }}>
              <Input
                type="email"
                placeholder="Email"
                value={nuevo.email}
                onChange={(e) => setNuevo({ ...nuevo, email: e.target.value })}
                required
              />
            </div>
            <div style={{ flex: 1, minWidth: '120px' }}>
              <Select
                value={nuevo.ciclo_id}
                onChange={(e) => setNuevo({ ...nuevo, ciclo_id: e.target.value })}
                required
              >
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
          columnas={['Profesor', 'Email', 'Ciclo', 'Contraseña temporal', 'Acciones']}
          vacio={cargando ? 'Cargando...' : 'No hay profesores todavía'}
        >
          {profesores.map((p) => (
            <FilaTabla key={p.id}>
              <CeldaTabla>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '28px', height: '28px', minWidth: '28px',
                    borderRadius: '50%', background: '#1f2937',
                    border: '0.5px solid #E85D24',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', fontWeight: '500', color: '#E85D24'
                  }}>
                    {getIniciales(p.usuario?.nombre)}
                  </div>
                  <span>{p.usuario?.nombre}</span>
                </div>
              </CeldaTabla>
              <CeldaTabla>{p.usuario?.email}</CeldaTabla>
              <CeldaTabla>
                <Badge tipo="default">{getNombreCiclo(p.ciclo_id)}</Badge>
              </CeldaTabla>
              <CeldaTabla>
                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6b7280' }}>
                  Temp_{p.usuario?.email}!
                </span>
              </CeldaTabla>
              <CeldaTabla>
                <Boton variante="danger" onClick={() => eliminar(p.id)}>
                  🗑 Eliminar
                </Boton>
              </CeldaTabla>
            </FilaTabla>
          ))}
        </Tabla>
      </Card>
    </div>
  );
}