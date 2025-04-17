import axios from 'axios';

// URL base del endpoint de detalle de orden de compra
const API_URL = 'http://localhost:8080/detalle-orden-compra';

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
        'Content-Type': 'application/json'
    };
};

// Listar todos los detalles de orden de compra
export const getDetallesOrdenCompra = async () => {
    try {
        const response = await axios.get(`${API_URL}/listar`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener detalles de orden de compra:', error.response || error.message);
        throw error;
    }
};

// Agregar un nuevo detalle de orden de compra
export const addDetalleOrdenCompra = async (detalle) => {
    try {
        const response = await axios.post(`${API_URL}/registrar`, detalle, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error al agregar detalle de orden de compra:', error.response || error.message);
        throw error;
    }
};

// Obtener un detalle por ID
export const getDetalleOrdenCompraById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error(`Error al obtener detalle con ID ${id}:`, error.response || error.message);
        throw error;
    }
};

// Actualizar un detalle de orden de compra
export const updateDetalleOrdenCompra = async (detalle) => {
    try {
        const response = await axios.put(`${API_URL}`, detalle, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error al actualizar detalle de orden de compra:', error.response || error.message);
        throw error;
    }
};

// Eliminar un detalle de orden de compra
export const deleteDetalleOrdenCompra = async (id) => {
    try {
        await axios.delete(`${API_URL}/${id}`, {
            headers: getAuthHeaders(),
        });
    } catch (error) {
        console.error(`Error al eliminar detalle con ID ${id}:`, error.response || error.message);
        throw error;
    }
};
