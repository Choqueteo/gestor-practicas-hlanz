import React, { createContext, useState, useContext} from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState({
        token: localStorage.getItem("token") || null,
        rol: localStorage.getItem('rol') || null,
        email: localStorage.getItem('email') || null,
    });

    const guardarUsuario = (datos) => {
        localStorage.setItem('token', datos.token);
        localStorage.setItem('rol', datos.rol);
        setUsuario(datos);
    };

    const cerrarSesion = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('rol');
        localStorage.removeItem('email');
        setUsuario({ token: null, rol: null, email: null });
    };

    return (
        <AuthContext.Provider value={{ usuario, guardarUsuario, cerrarSesion }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook personalizado para usar el contexto facilmente
export function useAuth(){
    return useContext(AuthContext);
}