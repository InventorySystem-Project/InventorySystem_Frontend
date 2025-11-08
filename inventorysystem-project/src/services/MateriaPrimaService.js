import axios from 'axios';
import { environment } from '../environment/environment';

const API_URL = `${environment.url}/materia-prima`;

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

// Obtener todas las materias primas
export const getMateriasPrimas = async () => {
    try {
        const response = await axios.get(`${API_URL}/listar`, {  // Ruta para obtener lista de materias primas
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener materias primas:', error.response || error.message);
        throw error;
    }
};

// Agregar una nueva materia prima
export const addMateriaPrima = async (materiaPrima) => {
    try {
        const response = await axios.post(`${API_URL}/registrar`, materiaPrima, {  // Ruta para registrar una nueva materia prima
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error al agregar materia prima:', error.response || error.message);
        throw error;
    }
};

// Actualizar una materia prima existente
export const updateMateriaPrima = async (id, materiaPrima) => {
    try {
        // Asegurarse de incluir el ID en el objeto materiaPrima
        const materiaPrimaConId = { ...materiaPrima, id };
        // IMPORTANTE: El backend espera el ID en la URL
        const response = await axios.put(`${API_URL}/${id}`, materiaPrimaConId, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error al actualizar materia prima:', error.response || error.message);
        throw error;
    }
};

// Eliminar una materia prima
export const deleteMateriaPrima = async (id) => {
    try {
        await axios.delete(`${API_URL}/${id}`, {  // Ruta DELETE para eliminar la materia prima
            headers: getAuthHeaders(),
        });
    } catch (error) {
        console.error('Error al eliminar materia prima:', error.response || error.message);
        throw error;
    }
};
