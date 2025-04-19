import axios from 'axios';

// URL de la API
const API_URL = 'http://localhost:8080/movimientos-materia-prima';

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

// Obtener todos los movimientos de inventario
export const getMovimientosInventarioMP = async () => {
    try {
        const response = await axios.get(`${API_URL}/listar`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener movimientos de inventario:', error.response || error.message);
        throw error;
    }
};

// Registrar un nuevo movimiento de inventario
export const addMovimientoInventarioMP = async (movimiento) => {
    try {
        const response = await axios.post(`${API_URL}/registrar`, movimiento, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error al agregar movimiento de inventario:', error.response || error.message);
        throw error;
    }
};

// Actualizar un movimiento de inventario existente
export const updateMovimientoInventarioMP = async (movimiento) => {
    try {
        const response = await axios.put(`${API_URL}`, movimiento, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error al actualizar movimiento de inventario:', error.response || error.message);
        throw error;
    }
};

// Eliminar un movimiento de inventario
export const deleteMovimientoInventarioMP = async (id) => {
    try {
        await axios.delete(`${API_URL}/${id}`, {
            headers: getAuthHeaders(),
        });
    } catch (error) {
        console.error('Error al eliminar movimiento de inventario:', error.response || error.message);
        throw error;
    }
};

// Obtener un movimiento de inventario por ID
export const getMovimientoInventarioById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener movimiento de inventario por ID:', error.response || error.message);
        throw error;
    }
};
