import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sidebar, Topbar } from '../components';
import { radius } from '../theme';
import Importacion from './Importacion';
import Asignaciones from './Asignaciones';
import Empresas from './Empresas';
import Alumnos from './Alumnos';
import Configuracion from './Configuracion';

const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Inicio',        icon: '📊' },
  { id: 'asignaciones', label: 'Asignaciones',  icon: '🔗' },
  { id: 'alumnos',     label: 'Alumnos',     icon: '🎓' },
  { id: 'empresas',     label: 'Empresas',      icon: '🏢' },
  { id: 'importacion',  label: 'Importar',      icon: '📥' },
];

export default function DashboardProfesor() {
  const { usuario, cerrarSesion } = useAuth();
  const { colors } = useTheme();
  const [paginaActual, setPaginaActual] = useState('dashboard');

  const iniciales = usuario.email
    ? usuario.email.slice(0, 2).toUpperCase()
    : 'PR';

  const estilos = getEstilos(colors);

  const renderContenido = () => {
    switch (paginaActual) {
      case 'configuracion': return <Configuracion onVolver={() => setPaginaActual('dashboard')} />;
      case 'asignaciones': return <Asignaciones onVolver={() => setPaginaActual('dashboard')} />;
      case 'alumnos':    return <Alumnos    onVolver={() => setPaginaActual('dashboard')} />;
      case 'empresas':     return <Empresas     onVolver={() => setPaginaActual('dashboard')} />;
      case 'importacion':  return <Importacion  onVolver={() => setPaginaActual('dashboard')} />;
      default:             return <SeccionDashboard onIrA={setPaginaActual} />;
    }
  };

  return (
    <div style={estilos.app}>
      <Sidebar
        rol="Profesor"
        iniciales={iniciales}
        nombre={usuario.email}
        items={NAV_ITEMS}
        paginaActual={paginaActual}
        onCambiarPagina={setPaginaActual}
        onCerrarSesion={cerrarSesion}
        onConfiguracion={() => setPaginaActual('configuracion')}
      />
      <div style={estilos.main}>
        <Topbar
          titulo={NAV_ITEMS.find(i => i.id === paginaActual)?.label || 'Inicio'}
          subtitulo="IES HLanz · Profesor"
        />
        <div style={estilos.content} key={paginaActual}>
          {renderContenido()}
        </div>
      </div>
    </div>
  );
}

function SeccionDashboard({ onIrA }) {
  const { colors } = useTheme();
  const estilos = getEstilos(colors);

  const accesos = [
    { label: 'Ver asignaciones',  icon: '🔗', pagina: 'asignaciones', desc: 'Asignar alumnos a empresas'     },
    { label: 'Ver empresas',      icon: '🏢', pagina: 'empresas',     desc: 'Gestionar empresas disponibles' },
    { label: 'Ver alumnos',       icon: '🎓', pagina: 'alumnos',    desc: 'Gestionar alumnos del centro'},
    { label: 'Importar alumnos',  icon: '📥', pagina: 'importacion',  desc: 'Subir CSV con alumnos'          },
    { label: 'Importar empresas', icon: '📥', pagina: 'importacion',  desc: 'Subir JSON con empresas'        },
  ];

  return (
    <div>
      <div style={estilos.bienvenida}>
        <h2 style={estilos.bienvenidaTitulo}>Panel del Profesor</h2>
        <p style={estilos.bienvenidaSub}>Gestiona las prácticas de tus alumnos</p>
      </div>

      <div style={estilos.quickGrid}>
        {accesos.map((item) => (
          <QuickCard
            key={item.label}
            item={item}
            onClick={() => onIrA(item.pagina)}
            colors={colors}
          />
        ))}
      </div>
    </div>
  );
}

function QuickCard({ item, onClick, colors }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? colors.bgHover : colors.bgSecondary,
        border: `0.5px solid ${hover ? colors.orange : colors.border}`,
        borderLeft: `3px solid ${hover ? colors.orange : colors.border}`,
        borderRadius: radius.lg,
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        cursor: 'pointer',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.2s ease',
        boxShadow: hover ? `0 4px 12px ${colors.orange}22` : 'none',
      }}
    >
      <span style={{ fontSize: '24px' }}>{item.icon}</span>
      <div>
        <div style={{ fontSize: '13px', fontWeight: '500', color: colors.textPrimary, marginBottom: '3px' }}>
          {item.label}
        </div>
        <div style={{ fontSize: '11px', color: colors.textSecondary }}>
          {item.desc}
        </div>
      </div>
    </div>
  );
}

const getEstilos = (colors) => ({
  app: {
    display: 'flex',
    minHeight: '100vh',
    background: colors.bgPrimary,
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minWidth: 0,
  },
  content: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    animation: 'fadeIn 0.2s ease',
  },
  bienvenida: {
    marginBottom: '20px',
  },
  bienvenidaTitulo: {
    fontSize: '18px',
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: '4px',
  },
  bienvenidaSub: {
    fontSize: '13px',
    color: colors.textSecondary,
  },
  quickGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
});