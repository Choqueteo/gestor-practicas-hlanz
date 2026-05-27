import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000',
});

// Interceptor - añade el token JWT a todas las peticionesa automáticamente
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor de respuesta — si el token expira cierra sesión automáticamente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('rol');
      localStorage.removeItem('email');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const descargarCV = async (alumno_id) => {
  const respuesta = await api.get(`/alumnos/${alumno_id}/cv`, {
    responseType: 'blob'
  });
  
  // Crea un enlace temporal y lo pulsa para descargar
  const url = window.URL.createObjectURL(new Blob([respuesta.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `CV_alumno_${alumno_id}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export default api;