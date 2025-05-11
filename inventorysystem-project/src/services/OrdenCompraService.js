import axios from 'axios';
import { environment } from '../environment/environment';

const API_URL = `${environment.url}/ordenes-compra`;

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

// Listar todas las órdenes de compra
export const getOrdenesCompra = async () => {
    try {
        const response = await axios.get(`${API_URL}/listar`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener órdenes de compra:', error.response || error.message);
        throw error;
    }
};

// Registrar nueva orden de compra
export const addOrdenCompra = async (ordenCompra) => {
    try {
        const response = await axios.post(`${API_URL}/registrar`, ordenCompra, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error al registrar orden de compra:', error.response || error.message);
        throw error;
    }
};

// Obtener orden de compra por ID
export const getOrdenCompraById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error(`Error al obtener orden de compra con ID ${id}:`, error.response || error.message);
        throw error;
    }
};

// Modificar orden de compra (PUT)
export const updateOrdenCompra = async (ordenCompra) => {
    try {
        const response = await axios.put(`${API_URL}`, ordenCompra, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error al modificar orden de compra:', error.response || error.message);
        throw error;
    }
};

// Eliminar orden de compra por ID
export const deleteOrdenCompra = async (id) => {
    try {
        await axios.delete(`${API_URL}/${id}`, {
            headers: getAuthHeaders(),
        });
    } catch (error) {
        console.error(`Error al eliminar orden de compra con ID ${id}:`, error.response || error.message);
        throw error;
    }
};
