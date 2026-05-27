import React, { createContext, useContext, useState } from 'react';
import { darkTheme, lightTheme } from '../theme';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [modoOscuro, setModoOscuro] = useState(
    localStorage.getItem('tema') !== 'claro'
  );

  const colors = modoOscuro ? darkTheme : lightTheme;

  const toggleTema = () => {
    const nuevoModo = !modoOscuro;
    setModoOscuro(nuevoModo);
    localStorage.setItem('tema', nuevoModo ? 'oscuro' : 'claro');
  };

  return (
    <ThemeContext.Provider value={{ colors, modoOscuro, toggleTema }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}