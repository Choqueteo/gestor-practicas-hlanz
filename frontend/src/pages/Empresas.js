import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  PageHeader, Card, Boton, Input,
  Tabla, FilaTabla, CeldaTabla, MensajeError
} from '../components';
import { useTheme } from '../context/ThemeContext';

export default function Empresas({ onVolver }) {
  const { colors } = useTheme();
  const [empresas, setEmpresas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nueva, setNueva] = useState({
    cif: '', nombre: '', direccion: '', web: '',
    email: '', telefono: '', persona_contacto: ''
  });

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      const r = await api.get('/empresas/');
      setEmpresas(r.data);
    } catch {
      setError('Error al cargar las empresas');
    } finally {
      setCargando(false);
    }
  };

  const crear = async (e) => {
    e.preventDefault();
    try {
      await api.post('/empresas/', nueva);
      setMostrarForm(false);
      setNueva({ cif: '', nombre: '', direccion: '', web: '', email: '', telefono: '', persona_contacto: '' });
      cargar();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al crear la empresa');
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta empresa?')) return;
    try {
      await api.delete(`/empresas/${id}`);
      cargar();
    } catch {
      setError('Error al eliminar la empresa');
    }
  };

  const handle = (campo) => (e) => setNueva({ ...nueva, [campo]: e.target.value });

  return (
    <div>
      <PageHeader
        titulo="Empresas"
        subtitulo={`${empresas.length} empresas registradas`}
        boton={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Boton variante="secondary" onClick={onVolver}>← Volver</Boton>
            <Boton onClick={() => setMostrarForm(!mostrarForm)}>+ Nueva empresa</Boton>
          </div>
        }
      />

      <MensajeError mensaje={error} />

      {mostrarForm && (
        <Card>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
            Nueva empresa
          </p>
          <form onSubmit={crear} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '100px' }}>
              <Input placeholder="CIF" value={nueva.cif} onChange={handle('cif')} required />
            </div>
            <div style={{ flex: 2, minWidth: '150px' }}>
              <Input placeholder="Nombre" value={nueva.nombre} onChange={handle('nombre')} required />
            </div>
            <div style={{ flex: 2, minWidth: '150px' }}>
              <Input placeholder="Dirección" value={nueva.direccion} onChange={handle('direccion')} />
            </div>
            <div style={{ flex: 1, minWidth: '120px' }}>
              <Input placeholder="Web" value={nueva.web} onChange={handle('web')} />
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <Input type="email" placeholder="Email" value={nueva.email} onChange={handle('email')} required />
            </div>
            <div style={{ flex: 1, minWidth: '100px' }}>
              <Input placeholder="Teléfono" value={nueva.telefono} onChange={handle('telefono')} required />
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <Input placeholder="Persona de contacto" value={nueva.persona_contacto} onChange={handle('persona_contacto')} />
            </div>
            <Boton tipo="submit">Guardar</Boton>
            <Boton variante="secondary" onClick={() => setMostrarForm(false)}>Cancelar</Boton>
          </form>
        </Card>
      )}

      <Card style={{ padding: 0 }}>
        <Tabla
          columnas={['CIF', 'Nombre', 'Email', 'Teléfono', 'Contacto', 'Acciones']}
          vacio={cargando ? 'Cargando...' : 'No hay empresas todavía'}
        >
          {empresas.map((e) => (
            <FilaTabla key={e.id}>
              <CeldaTabla>
                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6b7280' }}>
                  {e.cif}
                </span>
              </CeldaTabla>
              <CeldaTabla>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '28px', height: '28px', minWidth: '28px',
                    borderRadius: '8px', background: '#1f2937',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px'
                  }}>
                    🏢
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: colors.textPrimary }}>{e.nombre}</div>
                    {e.web && (
                      <div style={{ fontSize: '10px', color: '#6b7280' }}>{e.web}</div>
                    )}
                  </div>
                </div>
              </CeldaTabla>
              <CeldaTabla>{e.email || '—'}</CeldaTabla>
              <CeldaTabla>{e.telefono || '—'}</CeldaTabla>
              <CeldaTabla>{e.persona_contacto || '—'}</CeldaTabla>
              <CeldaTabla>
                <Boton variante="danger" onClick={() => eliminar(e.id)}>
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