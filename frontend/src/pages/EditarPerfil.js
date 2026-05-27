import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PageHeader, Card, Boton, Input, MensajeError } from '../components';
import { useTheme } from '../context/ThemeContext';

export default function EditarPerfil({ onVolver }) {
  const { colors } = useTheme();
  const estilos = getEstilos(colors);
  const { usuario, guardarUsuario } = useAuth();
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const guardar = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    setResultado(null);

    const datos = {};
    if (nombre)   datos.nombre   = nombre;
    if (telefono) datos.telefono = telefono;

    try {
      const r = await api.put('/alumnos/me', datos);
      setResultado(r.data);
      if (nombre) {
        guardarUsuario({ ...usuario, nombre });
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al actualizar el perfil');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div>
      <PageHeader
        titulo="Mi perfil"
        subtitulo="Actualiza tus datos de contacto"
        boton={<Boton variante="secondary" onClick={onVolver}>← Volver</Boton>}
      />

      <div style={estilos.grid}>
        <Card>
          <MensajeError mensaje={error} />

          <form onSubmit={guardar}>
            <div style={estilos.campo}>
              <label style={estilos.label}>Nombre</label>
              <Input
                placeholder="Tu nombre completo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
              <span style={estilos.hint}>Deja vacío si no quieres cambiarlo</span>
            </div>

            <div style={estilos.campo}>
              <label style={estilos.label}>Teléfono</label>
              <Input
                placeholder="600 111 222"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
              <span style={estilos.hint}>Deja vacío si no quieres cambiarlo</span>
            </div>

            {resultado && (
              <div style={estilos.exito}>
                <div>✅ {resultado.mensaje}</div>
                {resultado.nombre && (
                  <div style={estilos.exitoDetalle}>Nombre: {resultado.nombre}</div>
                )}
                {resultado.telefono && (
                  <div style={estilos.exitoDetalle}>Teléfono: {resultado.telefono}</div>
                )}
              </div>
            )}

            <Boton
              tipo="submit"
              disabled={cargando || (!nombre && !telefono)}
            >
              {cargando ? 'Guardando...' : '💾 Guardar cambios'}
            </Boton>
          </form>
        </Card>

        <Card>
          <div style={estilos.infoTitulo}>ℹ️ Tu cuenta</div>
          <div style={estilos.infoGrid}>
            <div style={estilos.infoItem}>
              <div style={estilos.infoLabel}>Email</div>
              <div style={estilos.infoValor}>{usuario.email}</div>
            </div>
            <div style={estilos.infoItem}>
              <div style={estilos.infoLabel}>Rol</div>
              <div style={{ ...estilos.infoValor, color: colors.orange }}>
                {usuario.rol}
              </div>
            </div>
          </div>
          <div style={estilos.nota}>
            Para cambiar tu email o contraseña contacta con tu profesor.
          </div>
        </Card>
      </div>
    </div>
  );
}

const getEstilos = (colors) => ({
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '14px',
  },
  campo: {
    marginBottom: '14px',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: '6px',
  },
  hint: {
    fontSize: '10px',
    color: colors.textMuted,
    marginTop: '4px',
    display: 'block',
  },
  exito: {
    padding: '12px 14px',
    background: colors.greenBg,
    color: colors.greenText,
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '14px',
  },
  exitoDetalle: {
    fontSize: '11px',
    marginTop: '4px',
    opacity: 0.8,
  },
  infoTitulo: {
    fontSize: '13px',
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: '14px',
  },
  infoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '14px',
  },
  infoItem: {
    background: colors.bgHover,
    borderRadius: '8px',
    padding: '10px 12px',
  },
  infoLabel: {
    fontSize: '10px',
    color: colors.textSecondary,
    marginBottom: '3px',
  },
  infoValor: {
    fontSize: '13px',
    color: colors.textPrimary,
    fontWeight: '500',
  },
  nota: {
    fontSize: '11px',
    color: colors.textMuted,
    padding: '10px 12px',
    background: colors.bgHover,
    borderRadius: '8px',
    lineHeight: '1.5',
  },
});