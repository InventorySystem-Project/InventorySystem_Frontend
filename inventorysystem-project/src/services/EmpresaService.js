import axios from 'axios';

// URL base del endpoint de empresas
const API_URL = 'http://localhost:8080/empresas';

// Obtener token desde localStorage
const getAuthToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('Token no encontrado en localStorage');
        return null;
    }
    return token;
};

// Cabeceras con autorización
const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

// Listar todas las empresas
export const getEmpresas = async () => {
    try {
        const response = await axios.get(`${API_URL}/listar`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener empresas:', error.response || error.message);
        throw error;
    }
};

// Registrar nueva empresa
export const addEmpresa = async (empresa) => {
    try {
        const response = await axios.post(`${API_URL}/registrar`, empresa, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error al registrar empresa:', error.response || error.message);
        throw error;
    }
};

// Obtener una empresa por ID
export const getEmpresaById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error(`Error al obtener empresa con ID ${id}:`, error.response || error.message);
        throw error;
    }
};

// Actualizar una empresa
export const updateEmpresa = async (empresa) => {
    try {
        const response = await axios.put(`${API_URL}`, empresa, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error al actualizar empresa:', error.response || error.message);
        throw error;
    }
};

// Eliminar empresa por ID
export const deleteEmpresa = async (id) => {
    try {
        await axios.delete(`${API_URL}/${id}`, {
            headers: getAuthHeaders(),
        });
    } catch (error) {
        console.error(`Error al eliminar empresa con ID ${id}:`, error.response || error.message);
        throw error;
    }
};
