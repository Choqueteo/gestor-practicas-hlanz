import React, { useState } from 'react';
import api from '../services/api';
import { PageHeader, Card, Boton, MensajeError } from '../components';
import { useTheme } from '../context/ThemeContext';

export default function SubirCV({ onVolver }) {
  const { colors } = useTheme();
  const estilos = getEstilos(colors);
  const [archivo, setArchivo] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const subir = async (e) => {
    e.preventDefault();
    if (!archivo) return;
    setCargando(true);
    setError('');
    setResultado(null);

    const formData = new FormData();
    formData.append('archivo', archivo);

    try {
      const r = await api.post('/alumnos/me/cv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResultado(r.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al subir el CV');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div>
      <PageHeader
        titulo="Mi CV"
        subtitulo="Sube tu currículum en formato PDF"
        boton={<Boton variante="secondary" onClick={onVolver}>← Volver</Boton>}
      />

      <div style={estilos.grid}>
        <Card>
          <MensajeError mensaje={error} />

          <form onSubmit={subir}>
            <label style={{
              ...estilos.uploadZone,
              borderColor: archivo ? colors.orange : colors.border,
            }}>
              <span style={estilos.uploadIcon}>{archivo ? '✅' : '📄'}</span>
              <span style={estilos.uploadLabel}>
                {archivo ? archivo.name : 'Haz clic para seleccionar tu CV'}
              </span>
              <span style={estilos.uploadHint}>Solo archivos .pdf</span>
              <input
                type="file"
                accept=".pdf"
                style={{ display: 'none' }}
                onChange={(e) => {
                  setArchivo(e.target.files[0]);
                  setResultado(null);
                  setError('');
                }}
              />
            </label>

            <Boton
              tipo="submit"
              disabled={cargando || !archivo}
            >
              {cargando ? 'Subiendo...' : '📤 Subir CV'}
            </Boton>
          </form>

          {resultado && (
            <div style={estilos.exito}>
              ✅ {resultado.mensaje}
            </div>
          )}
        </Card>

        <Card>
          <div style={estilos.consejosTitulo}>💡 Consejos para tu CV</div>
          <div style={estilos.consejosLista}>
            {[
              'Incluye tus proyectos del ciclo con una breve descripción',
              'Añade el enlace a tu GitHub si tienes proyectos subidos',
              'Máximo 2 páginas — las empresas no leen más',
              'Guárdalo con tu nombre: NombreApellido_CV.pdf',
              'Incluye tus habilidades técnicas y nivel de cada una',
            ].map((tip, i) => (
              <div key={i} style={estilos.consejo}>
                <span style={estilos.consejoIcon}>✓</span>
                <span>{tip}</span>
              </div>
            ))}
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
  uploadZone: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    border: `1px dashed`,
    borderRadius: '10px',
    padding: '32px 20px',
    cursor: 'pointer',
    marginBottom: '14px',
    textAlign: 'center',
    transition: 'border-color 0.15s',
  },
  uploadIcon: {
    fontSize: '32px',
  },
  uploadLabel: {
    fontSize: '13px',
    color: colors.textPrimary,
  },
  uploadHint: {
    fontSize: '11px',
    color: colors.textMuted,
  },
  exito: {
    marginTop: '14px',
    padding: '12px 14px',
    background: colors.greenBg,
    color: colors.greenText,
    borderRadius: '8px',
    fontSize: '13px',
  },
  consejosTitulo: {
    fontSize: '13px',
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: '14px',
  },
  consejosLista: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  consejo: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    fontSize: '12px',
    color: colors.textSecondary,
    lineHeight: '1.5',
  },
  consejoIcon: {
    color: colors.orange,
    fontWeight: '500',
    flexShrink: 0,
  },
});