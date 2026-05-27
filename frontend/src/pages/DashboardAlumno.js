import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sidebar, Topbar } from '../components';
import { radius } from '../theme';
import api from '../services/api';
import SubirCV from './SubirCV';
import EditarPerfil from './EditarPerfil';
import Configuracion from './Configuracion';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Inicio',    icon: '📊' },
  { id: 'cv',        label: 'Mi CV',     icon: '📄' },
  { id: 'perfil',    label: 'Mi perfil', icon: '👤' },
];

export default function DashboardAlumno() {
  const { usuario, cerrarSesion } = useAuth();
  const { colors } = useTheme();
  const [paginaActual, setPaginaActual] = useState('dashboard');

  const iniciales = usuario.email
    ? usuario.email.slice(0, 2).toUpperCase()
    : 'AL';

  const estilos = getEstilos(colors);

  const renderContenido = () => {
    switch (paginaActual) {
      case 'configuracion': return <Configuracion onVolver={() => setPaginaActual('dashboard')} />;
      case 'cv':     return <SubirCV      onVolver={() => setPaginaActual('dashboard')} />;
      case 'perfil': return <EditarPerfil onVolver={() => setPaginaActual('dashboard')} />;
      default:       return <SeccionDashboard onIrA={setPaginaActual} />;
    }
  };

  return (
    <div style={estilos.app}>
      <Sidebar
        rol="Alumno"
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
          subtitulo="IES HLanz · Alumno"
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
  const [asignacion, setAsignacion] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const r = await api.get('/alumnos/me');
        setAsignacion(r.data);
      } catch {
        setAsignacion(null);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const estaAsignado = asignacion && asignacion.estado !== 'pendiente';

  const accesos = [
    { label: 'Mi CV',      icon: '📄', pagina: 'cv',     desc: 'Sube o actualiza tu currículum en PDF'  },
    { label: 'Mi perfil',  icon: '👤', pagina: 'perfil', desc: 'Actualiza tus datos de contacto'        },
  ];

  return (
    <div>
      <div style={estilos.bienvenida}>
        <h2 style={estilos.bienvenidaTitulo}>Mi estado de prácticas</h2>
        <p style={estilos.bienvenidaSub}>Aquí puedes ver el estado de tu asignación</p>
      </div>

      {/* Banner de estado */}
      <div style={{
        ...estilos.banner,
        borderColor: estaAsignado ? colors.green : colors.amber,
        background: estaAsignado
          ? (colors === colors ? colors.greenBg : '#d1fae5')
          : (colors === colors ? colors.amberBg : '#fef3c7'),
      }}>
        <span style={estilos.bannerIcon}>
          {cargando ? '⏳' : estaAsignado ? '✅' : '⏳'}
        </span>
        <div>
          <div style={estilos.bannerLabel}>Estado actual</div>
          <div style={estilos.bannerTitulo}>
            {cargando
              ? 'Cargando...'
              : estaAsignado
                ? asignacion.empresa || 'Empresa asignada'
                : 'Pendiente de asignación'}
          </div>
          <div style={estilos.bannerDesc}>
            {cargando
              ? ''
              : estaAsignado
                ? 'Ya tienes empresa asignada para tus prácticas'
                : 'Tu profesor todavía no te ha asignado a ninguna empresa'}
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
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

      {/* Detalles */}
      {asignacion && (
        <div style={estilos.detallesCard}>
          <div style={estilos.detallesTitulo}>Detalles de la asignación</div>
          <div style={estilos.detallesGrid}>
            <div style={estilos.detalle}>
              <div style={estilos.detalleLabel}>Estado</div>
              <div style={estilos.detalleValor}>{asignacion.estado || 'Pendiente'}</div>
            </div>
            <div style={estilos.detalle}>
              <div style={estilos.detalleLabel}>Empresa</div>
              <div style={estilos.detalleValor}>{asignacion.empresa || '—'}</div>
            </div>
          </div>
        </div>
      )}
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
        marginBottom: '12px',
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
    marginBottom: '16px',
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
  banner: {
    border: '1px solid',
    borderRadius: radius.xl,
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px',
    transition: 'all 0.3s ease',
  },
  bannerIcon: { fontSize: '36px' },
  bannerLabel: {
    fontSize: '10px',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: colors.textSecondary,
    marginBottom: '4px',
  },
  bannerTitulo: {
    fontSize: '18px',
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: '2px',
  },
  bannerDesc: {
    fontSize: '12px',
    color: colors.textSecondary,
  },
  quickGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginBottom: '16px',
  },
  detallesCard: {
    background: colors.bgSecondary,
    border: `0.5px solid ${colors.border}`,
    borderRadius: radius.lg,
    padding: '16px',
  },
  detallesTitulo: {
    fontSize: '13px',
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: '12px',
  },
  detallesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
  },
  detalle: {
    background: colors.bgHover,
    borderRadius: radius.md,
    padding: '12px',
  },
  detalleLabel: {
    fontSize: '10px',
    color: colors.textSecondary,
    marginBottom: '4px',
  },
  detalleValor: {
    fontSize: '14px',
    fontWeight: '500',
    color: colors.textPrimary,
  },
});