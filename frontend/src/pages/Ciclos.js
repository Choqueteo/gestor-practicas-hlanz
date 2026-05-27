import React, { useState, useEffect } from "react";
import api from "../services/api";
import {
  PageHeader, Card, Boton, Input,
  Tabla, FilaTabla, CeldaTabla, MensajeError
} from '../components';

export default function Ciclos({ onVolver }) {
  const [ciclos, setCiclos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevo, setNuevo] = useState({ nombre: '', anio_inicio: '', anio_fin: '' });

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      const r = await api.get('/ciclos/');
      setCiclos(r.data);
    } catch {
      setError('Error al cargar los ciclos');
    } finally {
      setCargando(false);
    }
  };

  const crear = async (e) => {
    e.preventDefault();
    try {
      await api.post('/ciclos/', {
        nombre: nuevo.nombre,
        anio_inicio: parseInt(nuevo.anio_inicio),
        anio_fin: parseInt(nuevo.anio_fin)
      });
      setMostrarForm(false);
      setNuevo({ nombre: '', anio_inicio: '', anio_fin: '' });
      cargar();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al crear el ciclo');
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar este ciclo?')) return;
    try {
      await api.delete(`/ciclos/${id}`);
      cargar();
    } catch {
      setError('Error al eliminar el ciclo');
    }
  };

  return (
    <div>
      <PageHeader
        titulo="Ciclos formativos"
        subtitulo="Gestiona los ciclos del centro"
        boton={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Boton variante="secondary" onClick={onVolver}>← Volver</Boton>
            <Boton onClick={() => setMostrarForm(!mostrarForm)}>+ Nuevo ciclo</Boton>
          </div>
        }
      />

      <MensajeError mensaje={error} />

      {mostrarForm && (
        <Card>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
            Nuevo ciclo
          </p>
          <form onSubmit={crear} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ flex: 2, minWidth: '150px' }}>
              <Input
                placeholder="Nombre del ciclo (ej: DAM)"
                value={nuevo.nombre}
                onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
                required
              />
            </div>
            <div style={{ flex: 1, minWidth: '100px' }}>
              <Input
                type="number"
                placeholder="Año inicio"
                value={nuevo.anio_inicio}
                onChange={(e) => setNuevo({ ...nuevo, anio_inicio: e.target.value })}
                required
              />
            </div>
            <div style={{ flex: 1, minWidth: '100px' }}>
              <Input
                type="number"
                placeholder="Año fin"
                value={nuevo.anio_fin}
                onChange={(e) => setNuevo({ ...nuevo, anio_fin: e.target.value })}
                required
              />
            </div>
            <Boton tipo="submit">Guardar</Boton>
            <Boton variante="secondary" onClick={() => setMostrarForm(false)}>Cancelar</Boton>
          </form>
        </Card>
      )}

      <Card style={{ padding: 0 }}>
        <Tabla
          columnas={['ID', 'Nombre', 'Año inicio', 'Año fin', 'Acciones']}
          vacio={cargando ? 'Cargando...' : 'No hay ciclos todavía'}
        >
          {ciclos.map((c) => (
            <FilaTabla key={c.id}>
              <CeldaTabla>#{c.id}</CeldaTabla>
              <CeldaTabla>{c.nombre}</CeldaTabla>
              <CeldaTabla>{c.anio_inicio}</CeldaTabla>
              <CeldaTabla>{c.anio_fin}</CeldaTabla>
              <CeldaTabla>
                <Boton variante="danger" onClick={() => eliminar(c.id)}>
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