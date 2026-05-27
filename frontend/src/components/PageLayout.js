import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { radius } from '../theme';
import { useResponsive } from '../hooks/useResponsive';

export function PageHeader({ titulo, subtitulo, boton }) {
  const { colors } = useTheme();
  const estilos = getEstilos(colors);
  return (
    <div style={estilos.header}>
      <div>
        <h2 style={estilos.titulo}>{titulo}</h2>
        {subtitulo && <p style={estilos.subtitulo}>{subtitulo}</p>}
      </div>
      {boton && <div>{boton}</div>}
    </div>
  );
}

export function Card({ children, style }) {
  const { colors } = useTheme();
  const estilos = getEstilos(colors);
  return (
    <div style={{ ...estilos.card, ...style }}>
      {children}
    </div>
  );
}

export function Boton({ children, onClick, variante = 'primary', disabled = false, tipo = 'button' }) {
  const { colors } = useTheme();
  const estilos = getEstilos(colors);
  const [hover, setHover] = useState(false);

  const variantes = {
    primary: {
      background: hover ? colors.orangeHover : colors.orange,
      color: '#fff',
      transform: hover ? 'translateY(-1px)' : 'translateY(0)',
      boxShadow: hover ? `0 4px 12px ${colors.orange}44` : 'none',
    },
    secondary: {
      background: hover ? colors.bgHover : 'transparent',
      color: hover ? colors.textPrimary : colors.textSecondary,
      border: `0.5px solid ${colors.border}`,
      transform: hover ? 'translateY(-1px)' : 'translateY(0)',
    },
    danger: {
      background: hover ? '#450a0a' : 'transparent',
      color: hover ? colors.redHover : colors.red,
      border: `0.5px solid ${hover ? colors.red : colors.red}`,
      transform: hover ? 'translateY(-1px)' : 'translateY(0)',
    },
  };

  return (
    <button
      type={tipo}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...estilos.boton,
        ...variantes[variante],
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  );
}

export function Input({ placeholder, value, onChange, type = 'text', required }) {
  const { colors } = useTheme();
  const estilos = getEstilos(colors);
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      style={estilos.input}
    />
  );
}

export function Select({ value, onChange, children, required }) {
  const { colors } = useTheme();
  const estilos = getEstilos(colors);
  return (
    <select value={value} onChange={onChange} required={required} style={estilos.input}>
      {children}
    </select>
  );
}

export function Badge({ children, tipo = 'default' }) {
  const { colors } = useTheme();
  const estilos = getEstilos(colors);
  const tipos = {
    success: { background: colors.greenBg,  color: colors.greenText },
    warning: { background: colors.amberBg,  color: colors.amberText },
    danger:  { background: '#450a0a',        color: '#fca5a5'        },
    default: { background: colors.bgHover,  color: colors.textSecondary },
  };

  return (
    <span style={{ ...estilos.badge, ...tipos[tipo] }}>
      {children}
    </span>
  );
}

export function Tabla({ columnas, children, vacio = 'No hay datos' }) {
  const { colors } = useTheme();
  const estilos = getEstilos(colors);
  const { esMobil } = useResponsive();

  if (esMobil) {
    return (
      <div>
        {children || (
          <div style={estilos.vacio}>{vacio}</div>
        )}
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={estilos.tabla}>
        <thead>
          <tr>
            {columnas.map((col) => (
              <th key={col} style={estilos.th}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children || (
            <tr>
              <td colSpan={columnas.length} style={estilos.vacio}>{vacio}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function FilaTabla({ children, etiquetas = [] }) {
  const { colors } = useTheme();
  const { esMobil } = useResponsive();
  const [hover, setHover] = useState(false);

  if (esMobil) {
    const celdas = React.Children.toArray(children);
    return (
      <div style={{
        background: colors.bgSecondary,
        border: `0.5px solid ${colors.border}`,
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '8px',
      }}>
        {celdas.map((celda, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '4px 0',
            borderBottom: i < celdas.length - 1 ? `0.5px solid ${colors.border}` : 'none',
          }}>
            {etiquetas[i] && (
              <span style={{ fontSize: '10px', color: colors.textSecondary, marginRight: '8px', minWidth: '80px' }}>
                {etiquetas[i]}
              </span>
            )}
            {celda}
          </div>
        ))}
      </div>
    );
  }

  return (
    <tr
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderBottom: `0.5px solid ${colors.border}`,
        background: hover ? colors.bgHover : 'transparent',
        transition: 'background 0.15s',
      }}
    >
      {children}
    </tr>
  );
}

export function CeldaTabla({ children }) {
  const { colors } = useTheme();
  const estilos = getEstilos(colors);
  return <td style={estilos.td}>{children}</td>;
}

export function MensajeError({ mensaje }) {
  const { colors } = useTheme();
  const estilos = getEstilos(colors);
  if (!mensaje) return null;
  return (
    <div style={estilos.error}>{mensaje}</div>
  );
}

const getEstilos = (colors) => ({
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  titulo: {
    fontSize: '16px',
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: '2px',
  },
  subtitulo: {
    fontSize: '12px',
    color: colors.textSecondary,
  },
  card: {
    background: colors.bgSecondary,
    border: `0.5px solid ${colors.border}`,
    borderRadius: radius.lg,
    padding: '16px',
    marginBottom: '14px',
  },
  boton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    border: 'none',
    borderRadius: radius.md,
    fontSize: '12px',
    fontWeight: '500',
    transition: 'opacity 0.15s, transform 0.1s',
  },
  input: {
    width: '100%',
    padding: '8px 10px',
    background: colors.bgPrimary,
    border: `0.5px solid ${colors.border}`,
    borderRadius: radius.md,
    color: colors.textPrimary,
    fontSize: '13px',
    outline: 'none',
  },
  badge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '20px',
    fontSize: '10px',
    fontWeight: '500',
  },
  tabla: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    fontSize: '11px',
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'left',
    padding: '8px 12px',
    borderBottom: `0.5px solid ${colors.border}`,
    background: colors.bgHover,
  },
  fila: {
    borderBottom: `0.5px solid ${colors.border}`,
  },
  td: {
    fontSize: '12px',
    color: colors.textPrimary,
    padding: '10px 12px',
  },
  vacio: {
    textAlign: 'center',
    padding: '2rem',
    color: colors.textMuted,
    fontSize: '13px',
  },
  error: {
    background: '#450a0a',
    color: '#fca5a5',
    border: '0.5px solid #7f1d1d',
    borderRadius: radius.md,
    padding: '10px 12px',
    fontSize: '12px',
    marginBottom: '12px',
  },
});