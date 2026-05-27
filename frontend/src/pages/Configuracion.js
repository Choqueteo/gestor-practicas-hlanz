import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { PageHeader, Card, Boton, Input, MensajeError } from '../components';

export default function Configuracion({ onVolver }) {
  const { usuario, cerrarSesion } = useAuth();
  const { colors } = useTheme();
  const estilos = getEstilos(colors);

  const [email, setEmail] = useState('');
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNuevo, setPasswordNuevo] = useState('');
  const [passwordConfirmar, setPasswordConfirmar] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);

  const guardar = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');

    if (passwordNuevo && passwordNuevo !== passwordConfirmar) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }

    if (passwordNuevo && passwordNuevo.length < 6) {
      setError('La contraseña nueva debe tener al menos 6 caracteres');
      return;
    }

    const datos = {};
    if (email) datos.email = email;
    if (passwordNuevo) {
      datos.password_actual = passwordActual;
      datos.password_nuevo = passwordNuevo;
    }

    if (!email && !passwordNuevo) {
      setError('Rellena al menos un campo para actualizar');
      return;
    }

    setCargando(true);
    try {
      await api.put('/alumnos/me/credenciales', datos);
      setExito('Credenciales actualizadas correctamente');
      setEmail('');
      setPasswordActual('');
      setPasswordNuevo('');
      setPasswordConfirmar('');

      // Si cambió el email cerramos sesión para que vuelva a logarse
      if (email) {
        setTimeout(() => cerrarSesion(), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al actualizar las credenciales');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div>
      <PageHeader
        titulo="Configuración de cuenta"
        subtitulo="Cambia tu email o contraseña"
        boton={<Boton variante="secondary" onClick={onVolver}>← Volver</Boton>}
      />

      <div style={estilos.grid}>
        <Card>
          <div style={estilos.seccionTitulo}>📧 Cambiar email</div>
          <div style={estilos.emailActual}>
            Email actual: <strong>{usuario.email}</strong>
          </div>

          <div style={estilos.campo}>
            <label style={estilos.label}>Nuevo email</label>
            <Input
              type="email"
              placeholder="nuevo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <span style={estilos.hint}>
              Al cambiar el email se cerrará la sesión automáticamente
            </span>
          </div>
        </Card>

        <Card>
          <div style={estilos.seccionTitulo}>🔒 Cambiar contraseña</div>

          <div style={estilos.campo}>
            <label style={estilos.label}>Contraseña actual</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={passwordActual}
              onChange={(e) => setPasswordActual(e.target.value)}
            />
          </div>

          <div style={estilos.campo}>
            <label style={estilos.label}>Nueva contraseña</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={passwordNuevo}
              onChange={(e) => setPasswordNuevo(e.target.value)}
            />
          </div>

          <div style={estilos.campo}>
            <label style={estilos.label}>Confirmar nueva contraseña</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={passwordConfirmar}
              onChange={(e) => setPasswordConfirmar(e.target.value)}
            />
          </div>
        </Card>
      </div>

      {error && <MensajeError mensaje={error} />}

      {exito && (
        <div style={estilos.exito}>✅ {exito}</div>
      )}

      <Boton
        onClick={guardar}
        disabled={cargando}
      >
        {cargando ? 'Guardando...' : '💾 Guardar cambios'}
      </Boton>
    </div>
  );
}

const getEstilos = (colors) => ({
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '14px',
    marginBottom: '16px',
  },
  seccionTitulo: {
    fontSize: '13px',
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: '14px',
  },
  emailActual: {
    fontSize: '12px',
    color: colors.textSecondary,
    marginBottom: '14px',
    padding: '8px 10px',
    background: colors.bgHover,
    borderRadius: '8px',
  },
  campo: {
    marginBottom: '12px',
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
});