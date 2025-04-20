import axios from 'axios';

// URL de la API
const API_URL = 'http://localhost:8080/usuarios';

// Función para obtener el token del almacenamiento local
const getAuthToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Token no encontrado en localStorage');
      return null; // Si no se encuentra el token, retorna null
    }
    return token;
};

// Configurar las cabeceras de la solicitud con el token
const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
        Authorization: `Bearer ${token}`,  // Enviar el token como Bearer
        'Content-Type': 'application/json'  // Enviar datos en formato JSON
    };
};

// Obtener todos los usuarios
export const getUsuarios = async () => {
    try {
        const response = await axios.get(`${API_URL}/listar`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener usuarios:', error.response || error.message);
        throw error;
    }
};

// Agregar un nuevo usuario
export const addUsuario = async (usuario) => {
    try {
        const response = await axios.post(`${API_URL}/registrar`, usuario, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error al agregar usuario:', error.response || error.message);
        throw error;
    }
};

// Actualizar un usuario existente
export const updateUsuario = async (id, usuario) => {
    try {
        const response = await axios.put(`${API_URL}`, usuario, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error al actualizar usuario:', error.response || error.message);
        throw error;
    }
};

// Eliminar un usuario
export const deleteUsuario = async (id) => {
    try {
        await axios.delete(`${API_URL}/${id}`, {
            headers: getAuthHeaders(),
        });
    } catch (error) {
        console.error('Error al eliminar usuario:', error.response || error.message);
        throw error;
    }
};
