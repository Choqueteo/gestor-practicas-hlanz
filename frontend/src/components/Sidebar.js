import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import { radius } from '../theme';

export default function Sidebar({ rol, iniciales, nombre, items, paginaActual, onCambiarPagina, onCerrarSesion, onConfiguracion }) {
  const { colors } = useTheme();
  const estilos = getEstilos(colors);
  const [colapsado, setColapsado] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { esMobil } = useResponsive();

  
  // En móvil mostramos un botón flotante y un overlay
  if (esMobil) {
  return (
    <>
      {/* Zona sensible al hover en el borde izquierdo */}
      <div
        onMouseEnter={() => setMenuAbierto(true)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '20px',
          height: '100vh',
          zIndex: 997,
        }}
      />

      {/* Botón hamburguesa — solo visible cuando el mouse está cerca */}
      <button
        onClick={() => setMenuAbierto(true)}
        onMouseEnter={() => setMenuAbierto(true)}
        style={{
          position: 'fixed',
          top: '50%',
          left: menuAbierto ? '-50px' : '0px',
          transform: 'translateY(-50%)',
          zIndex: 999,
          background: colors.orange,
          border: 'none',
          borderRadius: '0 8px 8px 0',
          width: '22px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          color: '#fff',
          cursor: 'pointer',
          boxShadow: '2px 0 8px rgba(0,0,0,0.3)',
          transition: 'left 0.2s ease, opacity 0.2s ease',
          opacity: menuAbierto ? 0 : 1,
        }}
        aria-label="Abrir menú"
      >
        ›
      </button>

      {/* Overlay — click fuera cierra el menú */}
      {menuAbierto && (
        <div
          onClick={() => setMenuAbierto(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 998,
          }}
        />
      )}

      {/* Sidebar deslizante */}
      <aside style={{
        position: 'fixed',
        top: 0,
        left: menuAbierto ? 0 : '-220px',
        width: '200px',
        height: '100vh',
        background: colors.bgSecondary,
        borderRight: `0.5px solid ${colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        padding: '14px 10px',
        zIndex: 999,
        transition: 'left 0.25s ease',
        overflowY: 'auto',
      }}>
        <ContenidoSidebar
          colors={colors}
          items={items}
          paginaActual={paginaActual}
          onCambiarPagina={(id) => { onCambiarPagina(id); setMenuAbierto(false); }}
          onCerrarSesion={onCerrarSesion}
          iniciales={iniciales}
          nombre={nombre}
          rol={rol}
          colapsado={false}
          onConfiguracion={() => { onConfiguracion(); setMenuAbierto(false); }}
        />
      </aside>
    </>
    );
  }

  // En desktop mostramos el sidebar normal colapsable
  return (
    <aside style={{
      ...estilos.sidebar,
      width: colapsado ? '64px' : '200px',
      minWidth: colapsado ? '64px' : '200px',
    }}>
      <ContenidoSidebar
        colors={colors}
        items={items}
        paginaActual={paginaActual}
        onCambiarPagina={onCambiarPagina}
        onCerrarSesion={onCerrarSesion}
        iniciales={iniciales}
        nombre={nombre}
        rol={rol}
        colapsado={colapsado}
        onToggle={() => setColapsado(!colapsado)}
        onConfiguracion={onConfiguracion}
      />
    </aside>
  );
}

function ContenidoSidebar({ colors, items, paginaActual, onCambiarPagina, onCerrarSesion, iniciales, nombre, rol, colapsado, onToggle, onConfiguracion }) {
const [hoverUser, setHoverUser] = useState(false);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
          <div style={{
            width: '28px', height: '28px', minWidth: '28px',
            borderRadius: radius.md, overflow: 'hidden',
          }}>
            <img src="/logohlanz.png" alt="IES HLanz" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          {!colapsado && (
            <span style={{ fontSize: '12px', fontWeight: '500', color: colors.textPrimary, whiteSpace: 'nowrap' }}>
              GestorPrácticas
            </span>
          )}
        </div>
        {onToggle && (
          <button onClick={onToggle} style={{
            background: 'transparent', border: 'none',
            color: colors.textSecondary, padding: '4px',
            borderRadius: radius.sm, cursor: 'pointer', fontSize: '18px',
          }}>
            ☰
          </button>
        )}
      </div>

      {!colapsado && (
        <div style={{ fontSize: '9px', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 8px', marginBottom: '4px' }}>
          Gestión
        </div>
      )}

      <nav>
        {items.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            activo={paginaActual === item.id}
            onClick={onCambiarPagina}
            colapsado={colapsado}
            colors={colors}
          />
        ))}
      </nav>

      <div style={{ marginTop: 'auto', borderTop: `0.5px solid ${colors.border}`, paddingTop: '10px' }}>
        <div
          onClick={onConfiguracion}
          onMouseEnter={() => setHoverUser(true)}
          onMouseLeave={() => setHoverUser(false)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px', overflow: 'hidden',
            borderRadius: radius.md, cursor: 'pointer',
            background: hoverUser ? colors.bgHover : 'transparent',
            transition: 'background 0.15s',
          }}
        >
          <div style={{
            width: '30px', height: '30px', minWidth: '30px',
            borderRadius: '50%', background: colors.orange,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: '500', color: '#fff',
          }}>
            {iniciales}
          </div>
          {!colapsado && (
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: '11px', fontWeight: '500', color: colors.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nombre}</div>
              <div style={{ fontSize: '10px', color: colors.textSecondary }}>⚙️ Configuración</div>
            </div>
          )}
        </div>
        <LogoutBtn onClick={onCerrarSesion} colapsado={colapsado} colors={colors} />
      </div>
    </>
  );
}

function NavItem({ item, activo, onClick, colapsado, colors }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={() => onClick(item.id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={colapsado ? item.label : ''}
      style={{
        display: 'flex', alignItems: 'center', gap: '9px',
        width: '100%', padding: activo ? '8px 8px 8px 6px' : '8px',
        border: 'none',
        borderLeft: activo ? `2px solid ${colors.orange}` : '2px solid transparent',
        borderRadius: radius.md,
        background: activo || hover ? colors.bgHover : 'transparent',
        color: activo ? colors.orange : hover ? colors.textPrimary : colors.textSecondary,
        fontSize: '12px', marginBottom: '2px', textAlign: 'left',
        whiteSpace: 'nowrap', overflow: 'hidden', cursor: 'pointer',
        transform: hover && !activo ? 'translateX(3px)' : 'translateX(0)',
        transition: 'all 0.15s ease',
        justifyContent: colapsado ? 'center' : 'flex-start',
      }}
    >
      <span style={{ fontSize: '16px', minWidth: '16px', flexShrink: 0 }}>{item.icon}</span>
      {!colapsado && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
    </button>
  );
}

function LogoutBtn({ onClick, colapsado, colors }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '9px',
        width: '100%', padding: '7px 8px',
        border: 'none', borderRadius: radius.md,
        background: hover ? '#450a0a' : 'transparent',
        color: hover ? colors.redHover : colors.red,
        fontSize: '12px', marginTop: '3px',
        whiteSpace: 'nowrap', overflow: 'hidden', cursor: 'pointer',
        transition: 'all 0.15s ease',
        justifyContent: colapsado ? 'center' : 'flex-start',
      }}
    >
      <span style={{ fontSize: '16px', minWidth: '16px', flexShrink: 0 }}>↩</span>
      {!colapsado && <span>Cerrar sesión</span>}
    </button>
  );
}

const getEstilos = (colors) => ({
  sidebar: {
    background: colors.bgSecondary,
    borderRight: `0.5px solid ${colors.border}`,
    display: 'flex',
    flexDirection: 'column',
    padding: '14px 10px',
    transition: 'width 0.25s ease, min-width 0.25s ease',
    overflow: 'hidden',
    minHeight: '100vh',
  },
});