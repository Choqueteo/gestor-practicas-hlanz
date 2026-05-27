import React, { useState } from 'react';
import { login } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { radius } from '../theme';
import { useResponsive } from '../hooks/useResponsive';

export default function Login() {
  const { guardarUsuario } = useAuth();
  const { colors, modoOscuro } = useTheme();
  const { esMobilLogin } = useResponsive();
  const estilos = getEstilos(colors, modoOscuro);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      const datos = await login(email, password);
      guardarUsuario({
        token: datos.token,
        rol: datos.rol,
        email: email
      });
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Email o contraseña incorrectos');
      } else {
        setError('Error al conectar con el servidor');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={estilos.wrap}>

      {!esMobilLogin && (
      /* Panel izquierdo decorativo */
      <div style={estilos.panel}>
        <div style={estilos.panelContenido}>
          <div style={estilos.panelLogo}>
            <img
              src="/logohlanz.png"
              alt="IES HLanz"
              style={{ width: '64px', height: '64px', objectFit: 'contain', borderRadius: '15%'}}
            />
          </div>
          <h1 style={estilos.panelTitulo}>IES Politécnico<br />Hermenegildo Lanz</h1>
          <p style={estilos.panelSub}>Sistema de gestión de prácticas en empresa</p>

          <div style={estilos.panelFeatures}>
            {[
              { icon: '🎓', texto: 'Gestión de alumnos y ciclos' },
              { icon: '🏢', texto: 'Seguimiento de empresas'     },
              { icon: '🔗', texto: 'Asignación de prácticas'     },
              { icon: '📄', texto: 'Gestión de currículums'      },
            ].map((f) => (
              <div key={f.texto} style={estilos.feature}>
                <span style={estilos.featureIcon}>{f.icon}</span>
                <span style={estilos.featureTexto}>{f.texto}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Decoración de fondo */}
        <div style={estilos.circulo1} aria-hidden="true" />
        <div style={estilos.circulo2} aria-hidden="true" />
      </div>)}

      {/* Panel derecho con formulario */}
      <div style={{
        ...estilos.formWrap,
        width: esMobilLogin ? '100%' : '420px',
        minWidth: esMobilLogin ? 'unset' : '420px',
      }}>
        <div style={estilos.formCard}>

          <div style={estilos.formHeader}>
            <div style={estilos.formIconWrap}>
              <span style={{ fontSize: '20px' }}>🔐</span>
            </div>
            <h2 style={estilos.formTitulo}>Iniciar sesión</h2>
            <p style={estilos.formSub}>Introduce tus credenciales para acceder</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={estilos.campo}>
              <label style={estilos.label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                style={estilos.input}
                required
              />
            </div>

            <div style={estilos.campo}>
              <label style={estilos.label}>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={estilos.input}
                required
              />
            </div>

            {error && (
              <div style={estilos.error}>{error}</div>
            )}

            <button
              type="submit"
              disabled={cargando}
              style={{
                ...estilos.boton,
                opacity: cargando ? 0.7 : 1,
                cursor: cargando ? 'not-allowed' : 'pointer',
              }}
            >
              {cargando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div style={estilos.footer}>
            IES HLanz · Gestión de Prácticas
          </div>
        </div>
      </div>
    </div>
  );
}

const getEstilos = (colors, modoOscuro) => ({
  wrap: {
    display: 'flex',
    minHeight: '100vh',
    background: colors.bgPrimary,
  },

  // Panel izquierdo
  panel: {
    flex: 1,
    background: modoOscuro
      ? 'linear-gradient(135deg, #0f1623 0%, #1a1f2e 50%, #1f1208 100%)'
      : 'linear-gradient(135deg, #fff5f0 0%, #fff 50%, #fff8f5 100%)',
    borderRight: `1px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    position: 'relative',
    overflow: 'hidden',
  },
  panelTitulo: {
    fontSize: '26px',
    fontWeight: '500',
    color: modoOscuro ? colors.textPrimary : '#111827',
    lineHeight: '1.3',
    marginBottom: '10px',
  },
  panelSub: {
    fontSize: '14px',
    color: modoOscuro ? colors.textSecondary : '#6b7280',
    marginBottom: '36px',
    lineHeight: '1.6',
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    background: modoOscuro ? 'rgba(255,255,255,0.04)' : 'rgba(232,93,36,0.06)',
    borderRadius: radius.md,
    border: `0.5px solid ${colors.border}`,
  },
  featureTexto: {
    fontSize: '13px',
    color: modoOscuro ? colors.textSecondary : '#374151',
  },
  circulo1: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: `radial-gradient(circle, ${colors.orange}${modoOscuro ? '22' : '15'} 0%, transparent 70%)`,
    top: '-80px',
    right: '-80px',
    pointerEvents: 'none',
  },
  circulo2: {
    position: 'absolute',
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    background: `radial-gradient(circle, ${colors.orange}${modoOscuro ? '15' : '10'} 0%, transparent 70%)`,
    bottom: '-40px',
    left: '-40px',
    pointerEvents: 'none',
  },

  // Panel derecho
  formWrap: {
    width: '420px',
    minWidth: '420px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 32px',
    background: colors.bgSecondary,
  },
  formCard: {
    width: '100%',
  },
  formHeader: {
    marginBottom: '28px',
  },
  formIconWrap: {
    width: '42px',
    height: '42px',
    background: `${colors.orange}22`,
    border: `1px solid ${colors.orange}44`,
    borderRadius: radius.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  formTitulo: {
    fontSize: '22px',
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: '6px',
  },
  formSub: {
    fontSize: '13px',
    color: colors.textSecondary,
  },
  campo: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    background: colors.bgPrimary,
    border: `0.5px solid ${colors.border}`,
    borderRadius: radius.md,
    color: colors.textPrimary,
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  error: {
    background: '#450a0a',
    color: '#fca5a5',
    border: '0.5px solid #7f1d1d',
    borderRadius: radius.md,
    padding: '10px 12px',
    fontSize: '13px',
    marginBottom: '16px',
  },
  boton: {
    width: '100%',
    padding: '11px',
    background: colors.orange,
    color: '#fff',
    border: 'none',
    borderRadius: radius.md,
    fontSize: '14px',
    fontWeight: '500',
    marginTop: '4px',
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
    fontSize: '11px',
    color: colors.textMuted,
  },
});