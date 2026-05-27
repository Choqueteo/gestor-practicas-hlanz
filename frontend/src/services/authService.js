import api from "./api";

export const login = async (email, password) => {
    const respuesta = await api.post('/auth/login', {
        email: email, 
        contrasena: password
    });
    return respuesta.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('email');
};