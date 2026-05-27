import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardProfesor from './pages/DashboardProfesor';
import DashboardAlumno from './pages/DashboardAlumno';

function App() {
  const { usuario } = useAuth();

  if (!usuario.token) {
    return <Login />;
  }

  if (usuario.rol === 'admin') return <DashboardAdmin />;
  if (usuario.rol === 'profesor') return <DashboardProfesor />;
  if (usuario.rol === 'alumno') return <DashboardAlumno />;

  return <Login />;
}

export default App;