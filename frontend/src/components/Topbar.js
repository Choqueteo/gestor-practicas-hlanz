import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Topbar({ titulo, subtitulo }) {
  const { colors, modoOscuro, toggleTema } = useTheme();

  return (
    <div style={{
      background: colors.bgSecondary,
      borderBottom: `0.5px solid ${colors.border}`,
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    }}>
      <span style={{
        width: '7px', height: '7px', minWidth: '7px',
        borderRadius: '50%', background: colors.orange,
        display: 'inline-block',
      }} />
      <span style={{ fontSize: '14px', fontWeight: '500', color: colors.textPrimary }}>
        {titulo}
      </span>
      {subtitulo && (
        <span style={{ fontSize: '11px', color: colors.textMuted, marginLeft: 'auto', marginRight: '8px' }}>
          {subtitulo}
        </span>
      )}
      <button
        onClick={toggleTema}
        title={modoOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        style={{
          background: colors.bgHover,
          border: `0.5px solid ${colors.border}`,
          borderRadius: '8px',
          padding: '5px 10px',
          fontSize: '13px',
          color: colors.textSecondary,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
        }}
      >
        {modoOscuro ? '☀️ Claro' : '🌙 Oscuro'}
      </button>
    </div>
  );
}
