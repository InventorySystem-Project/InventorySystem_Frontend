import axios from 'axios';

// URL base del endpoint de almacén
const API_URL = 'http://localhost:8080/almacenes';

// Obtener token del localStorage
const getAuthToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('Token no encontrado en localStorage');
        return null;
    }
    return token;
};

// Configurar cabeceras con el token
const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};

// Listar todos los almacenes
export const getAlmacenes = async () => {
    try {
        const response = await axios.get(`${API_URL}/listar`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener almacenes:', error.response || error.message);
        throw error;
    }
};

// Agregar un nuevo almacén
export const addAlmacen = async (almacen) => {
    try {
        const response = await axios.post(`${API_URL}/registrar`, almacen, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error al agregar almacén:', error.response || error.message);
        throw error;
    }
};

// Obtener un almacén por ID
export const getAlmacenById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error(`Error al obtener almacén con ID ${id}:`, error.response || error.message);
        throw error;
    }
};

// Actualizar un almacén
export const updateAlmacen = async (almacen) => {
    try {
        const response = await axios.put(`${API_URL}`, almacen, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error al actualizar almacén:', error.response || error.message);
        throw error;
    }
};

// Eliminar un almacén
export const deleteAlmacen = async (id) => {
    try {
        await axios.delete(`${API_URL}/${id}`, {
            headers: getAuthHeaders(),
        });
    } catch (error) {
        console.error(`Error al eliminar almacén con ID ${id}:`, error.response || error.message);
        throw error;
    }
};
