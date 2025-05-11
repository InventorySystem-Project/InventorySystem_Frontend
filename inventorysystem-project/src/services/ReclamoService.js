import axios from 'axios';
import { environment } from '../environment/environment';

const API_URL = `${environment.url}/reclamo`;

// Obtener el token JWT desde el localStorage
const getAuthToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('Token no encontrado en localStorage');
        return null;
    }
    return token;
};

// Encabezados con autorización
const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

// Listar todos los reclamos
export const getReclamos = async () => {
    try {
        const response = await axios.get(`${API_URL}/listar`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener reclamos:', error.response || error.message);
        throw error;
    }
};

// Registrar nuevo reclamo
export const addReclamo = async (reclamo) => {
    try {
        const response = await axios.post(`${API_URL}/registrar`, reclamo, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error al registrar reclamo:', error.response || error.message);
        throw error;
    }
};

// Obtener reclamo por ID
export const getReclamoById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error(`Error al obtener reclamo con ID ${id}:`, error.response || error.message);
        throw error;
    }
};

// Modificar reclamo (PUT)
export const updateReclamo = async (reclamo) => {
    try {
        const response = await axios.put(`${API_URL}`, reclamo, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error al modificar reclamo:', error.response || error.message);
        throw error;
    }
};

// Eliminar reclamo por ID
export const deleteReclamo = async (id) => {
    try {
        await axios.delete(`${API_URL}/${id}`, {
            headers: getAuthHeaders(),
        });
    } catch (error) {
        console.error(`Error al eliminar reclamo con ID ${id}:`, error.response || error.message);
        throw error;
    }
};