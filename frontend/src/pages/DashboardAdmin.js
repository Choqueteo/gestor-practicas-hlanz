import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sidebar, Topbar } from '../components';
import { radius } from '../theme';
import api from '../services/api';
import Ciclos from './Ciclos';
import Alumnos from './Alumnos';
import Empresas from './Empresas';
import Profesores from './Profesores';
import Configuracion from './Configuracion';
import { useResponsive } from '../hooks/useResponsive';

const NAV_ITEMS = [
  { id: 'dashboard',   label: 'Inicio',      icon: '📊' },
  { id: 'ciclos',      label: 'Ciclos',      icon: '📚' },
  { id: 'alumnos',     label: 'Alumnos',     icon: '🎓' },
  { id: 'empresas',    label: 'Empresas',    icon: '🏢' },
  { id: 'profesores',  label: 'Profesores',  icon: '👥' },
];

export default function DashboardAdmin() {
  const { usuario, cerrarSesion } = useAuth();
  const { colors } = useTheme();
  const [paginaActual, setPaginaActual] = useState('dashboard');

  const iniciales = usuario.email
    ? usuario.email.slice(0, 2).toUpperCase()
    : 'AD';

  const renderContenido = () => {
    switch (paginaActual) {
      case 'configuracion': return <Configuracion onVolver={() => setPaginaActual('dashboard')} />;
      case 'ciclos':     return <Ciclos     onVolver={() => setPaginaActual('dashboard')} />;
      case 'alumnos':    return <Alumnos    onVolver={() => setPaginaActual('dashboard')} />;
      case 'empresas':   return <Empresas   onVolver={() => setPaginaActual('dashboard')} />;
      case 'profesores': return <Profesores onVolver={() => setPaginaActual('dashboard')} />;
      default:           return <SeccionDashboard onIrA={setPaginaActual} />;
    }
  };

  const estilos = getEstilos(colors);

  return (
    <div style={estilos.app}>
      <Sidebar
        rol="Administrador"
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
          subtitulo="IES HLanz · Administrador"
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
  const { esTablet } = useResponsive();
  const estilos = getEstilos(colors, esTablet);
  const [stats, setStats] = useState({ alumnos: 0, empresas: 0, asignados: 0, pendientes: 0 });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarStats = async () => {
      try {
        const [respAlumnos, respEmpresas, respAsignaciones] = await Promise.all([
          api.get('/alumnos/'),
          api.get('/empresas/'),
          api.get('/asignaciones/')
        ]);
        const totalAlumnos = respAlumnos.data.length;
        const totalEmpresas = respEmpresas.data.length;
        const asignados = respAsignaciones.data.filter(a => a.estado === 'asignado').length;
        const pendientes = totalAlumnos - asignados;
        setStats({ alumnos: totalAlumnos, empresas: totalEmpresas, asignados, pendientes });
      } catch (err) {
        console.error('Error cargando stats:', err);
      } finally {
        setCargando(false);
      }
    };
    cargarStats();
  }, []);

  const statItems = [
    { label: 'Alumnos',    valor: stats.alumnos,    sub: 'DAM + DAW',   color: colors.orange },
    { label: 'Empresas',   valor: stats.empresas,   sub: 'Activas',     color: colors.orange },
    { label: 'Asignados',  valor: stats.asignados,  sub: 'Con empresa', color: colors.green  },
    { label: 'Pendientes', valor: stats.pendientes, sub: 'Sin empresa', color: colors.amber  },
  ];

  const accesos = [
    { label: 'Gestionar ciclos',     icon: '📚', pagina: 'ciclos',     desc: 'Crear y eliminar ciclos formativos' },
    { label: 'Ver alumnos',          icon: '🎓', pagina: 'alumnos',    desc: 'Gestionar alumnos del centro'       },
    { label: 'Ver empresas',         icon: '🏢', pagina: 'empresas',   desc: 'Gestionar empresas colaboradoras'   },
    { label: 'Gestionar profesores', icon: '👥', pagina: 'profesores', desc: 'Asignar profesores a ciclos'        },
  ];

  return (
    <div>
      <div style={estilos.statGrid}>
        {statItems.map((s) => (
          <div key={s.label} style={{ ...estilos.statCard, borderTopColor: s.color }}>
            <div style={{ ...estilos.statLabel, color: s.color }}>{s.label}</div>
            <div style={estilos.statVal}>{cargando ? '...' : s.valor}</div>
            <div style={estilos.statSub}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={estilos.card}>
        <div style={estilos.cardHeader}>
          <span style={estilos.cardTitle}>Accesos rápidos</span>
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

const getEstilos = (colors, esTablet) => ({
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
  statGrid: {
    display: 'grid',
    gridTemplateColumns: esTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
    gap: '12px',
    marginBottom: '16px',
  },
  statCard: {
    background: colors.bgSecondary,
    border: `0.5px solid ${colors.border}`,
    borderTop: `2px solid`,
    borderRadius: radius.lg,
    padding: '14px',
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
  statLabel: {
    fontSize: '11px',
    marginBottom: '6px',
  },
  statVal: {
    fontSize: '24px',
    fontWeight: '500',
    color: colors.textPrimary,
  },
  statSub: {
    fontSize: '10px',
    color: colors.textMuted,
    marginTop: '3px',
  },
  card: {
    background: colors.bgSecondary,
    border: `0.5px solid ${colors.border}`,
    borderRadius: radius.lg,
    padding: '14px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '14px',
  },
  cardTitle: {
    fontSize: '13px',
    fontWeight: '500',
    color: colors.textPrimary,
  },
  quickGrid: {
    display: 'grid',
    gridTemplateColumns: esTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
    gap: '10px',
  },
});