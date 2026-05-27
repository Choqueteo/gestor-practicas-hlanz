import React, { useState } from 'react';
import api from '../services/api';
import { PageHeader, Card, Boton, MensajeError } from '../components';
import { useTheme } from '../context/ThemeContext';

export default function Importacion({ onVolver }) {
  const { colors } = useTheme();
  const estilos = getEstilos(colors);
  const [archivoCSV, setArchivoCSV] = useState(null);
  const [archivoJSON, setArchivoJSON] = useState(null);
  const [resultadoCSV, setResultadoCSV] = useState(null);
  const [resultadoJSON, setResultadoJSON] = useState(null);
  const [errorCSV, setErrorCSV] = useState('');
  const [errorJSON, setErrorJSON] = useState('');
  const [cargandoCSV, setCargandoCSV] = useState(false);
  const [cargandoJSON, setCargandoJSON] = useState(false);

  const importarCSV = async (e) => {
    e.preventDefault();
    if (!archivoCSV) return;
    setCargandoCSV(true);
    setErrorCSV('');
    setResultadoCSV(null);
    const formData = new FormData();
    formData.append('archivo', archivoCSV);
    try {
      const r = await api.post('/importar/alumnos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResultadoCSV(r.data);
    } catch (err) {
      setErrorCSV(err.response?.data?.detail || 'Error al importar el CSV');
    } finally {
      setCargandoCSV(false);
    }
  };

  const importarJSON = async (e) => {
    e.preventDefault();
    if (!archivoJSON) return;
    setCargandoJSON(true);
    setErrorJSON('');
    setResultadoJSON(null);
    const formData = new FormData();
    formData.append('archivo', archivoJSON);
    try {
      const r = await api.post('/importar/empresas', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResultadoJSON(r.data);
    } catch (err) {
      setErrorJSON(err.response?.data?.detail || 'Error al importar el JSON');
    } finally {
      setCargandoJSON(false);
    }
  };

  return (
    <div>
      <PageHeader
        titulo="Importación masiva"
        subtitulo="Sube archivos CSV o JSON para importar datos"
        boton={
          <Boton variante="secondary" onClick={onVolver}>← Volver</Boton>
        }
      />

      <div style={estilos.grid}>

        {/* CSV Alumnos */}
        <Card>
          <div style={estilos.cardTitulo}>
            <span style={estilos.cardIcon}>🎓</span>
            <div>
              <div style={estilos.cardLabel}>Importar alumnos</div>
              <div style={estilos.cardDesc}>Archivo CSV con columnas: nombre, email, dni, ciclo_id, telefono</div>
            </div>
          </div>

          <MensajeError mensaje={errorCSV} />

          <form onSubmit={importarCSV}>
            <label style={estilos.uploadZone}>
              <span style={estilos.uploadIcon}>📄</span>
              <span style={estilos.uploadLabel}>
                {archivoCSV ? `✓ ${archivoCSV.name}` : 'Haz clic para seleccionar el CSV'}
              </span>
              <span style={estilos.uploadHint}>Solo archivos .csv</span>
              <input
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={(e) => setArchivoCSV(e.target.files[0])}
              />
            </label>
            <Boton
              tipo="submit"
              disabled={cargandoCSV || !archivoCSV}
            >
              {cargandoCSV ? 'Importando...' : '📤 Importar CSV'}
            </Boton>
          </form>

          {resultadoCSV && (
            <div style={estilos.resultado}>
              <div style={estilos.resultadoFila}>
                <span>✅ Importados</span>
                <strong style={{ color: colors.green }}>{resultadoCSV.importados}</strong>
              </div>
              <div style={estilos.resultadoFila}>
                <span>⚠️ Duplicados</span>
                <strong style={{ color: colors.amber }}>{resultadoCSV.duplicados}</strong>
              </div>
              {resultadoCSV.errores?.length > 0 && (
                <div style={estilos.resultadoFila}>
                  <span>❌ Errores</span>
                  <strong style={{ color: colors.red }}>{resultadoCSV.errores.length}</strong>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* JSON Empresas */}
        <Card>
          <div style={estilos.cardTitulo}>
            <span style={estilos.cardIcon}>🏢</span>
            <div>
              <div style={estilos.cardLabel}>Importar empresas</div>
              <div style={estilos.cardDesc}>Archivo JSON con campos: cif, nombre, direccion, email, telefono</div>
            </div>
          </div>

          <MensajeError mensaje={errorJSON} />

          <form onSubmit={importarJSON}>
            <label style={estilos.uploadZone}>
              <span style={estilos.uploadIcon}>📋</span>
              <span style={estilos.uploadLabel}>
                {archivoJSON ? `✓ ${archivoJSON.name}` : 'Haz clic para seleccionar el JSON'}
              </span>
              <span style={estilos.uploadHint}>Solo archivos .json</span>
              <input
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={(e) => setArchivoJSON(e.target.files[0])}
              />
            </label>
            <Boton
              tipo="submit"
              disabled={cargandoJSON || !archivoJSON}
            >
              {cargandoJSON ? 'Importando...' : '📤 Importar JSON'}
            </Boton>
          </form>

          {resultadoJSON && (
            <div style={estilos.resultado}>
              <div style={estilos.resultadoFila}>
                <span>✅ Importadas</span>
                <strong style={{ color: colors.green }}>{resultadoJSON.importadas}</strong>
              </div>
              <div style={estilos.resultadoFila}>
                <span>⚠️ Duplicadas</span>
                <strong style={{ color: colors.amber }}>{resultadoJSON.duplicadas}</strong>
              </div>
              {resultadoJSON.errores?.length > 0 && (
                <div style={estilos.resultadoFila}>
                  <span>❌ Errores</span>
                  <strong style={{ color: colors.red }}>{resultadoJSON.errores.length}</strong>
                </div>
              )}
            </div>
          )}
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
  cardTitulo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  cardIcon: {
    fontSize: '28px',
  },
  cardLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: '2px',
  },
  cardDesc: {
    fontSize: '11px',
    color: colors.textSecondary,
  },
  uploadZone: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    border: `1px dashed ${colors.border}`,
    borderRadius: '8px',
    padding: '20px',
    cursor: 'pointer',
    marginBottom: '12px',
    textAlign: 'center',
  },
  uploadIcon: {
    fontSize: '24px',
  },
  uploadLabel: {
    fontSize: '12px',
    color: colors.textPrimary,
  },
  uploadHint: {
    fontSize: '10px',
    color: colors.textMuted,
  },
  resultado: {
    marginTop: '14px',
    background: colors.bgHover,
    borderRadius: '8px',
    padding: '12px',
  },
  resultadoFila: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: colors.textSecondary,
    padding: '4px 0',
    borderBottom: `0.5px solid ${colors.border}`,
  },
});