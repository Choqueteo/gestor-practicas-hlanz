import { useState, useEffect } from 'react';

export function useResponsive() {
  const [ancho, setAncho] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setAncho(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    esMobilLogin: ancho < 640,
    esMobil:  ancho < 740,
    esTablet: ancho < 1024,
    esDesktop: ancho >= 1024,
    ancho,
  };
}