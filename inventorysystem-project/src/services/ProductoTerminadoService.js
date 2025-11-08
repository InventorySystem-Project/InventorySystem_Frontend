import axios from 'axios';
import { environment } from '../environment/environment';

const API_URL = `${environment.url}/productos-terminados`;
// Función para obtener el token del almacenamiento local
// Obtener el token desde el localStorage
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

// Obtener todos los productos terminados
export const getProductosTerminados = async () => {
    try {
        const response = await axios.get(`${API_URL}/listar`, {  // Cambiado a la ruta correcta
            headers: getAuthHeaders(), 
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener productos:', error.response || error.message);
        throw error;
    }
};

// Agregar un nuevo producto terminado
export const addProductoTerminado = async (producto) => {
    try {
        const response = await axios.post(`${API_URL}/registrar`, producto, {  // Cambiado a la ruta correcta
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error al agregar producto:', error.response || error.message);
        throw error;
    }
};

// Actualizar un producto terminado existente
export const updateProductoTerminado = async (id, producto) => {
    try {
        // Asegurarse de incluir el ID en el objeto producto
        const productoConId = { ...producto, id };
        // IMPORTANTE: El backend espera el ID en la URL
        const response = await axios.put(`${API_URL}/${id}`, productoConId, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error al actualizar producto:', error.response || error.message);
        throw error;
    }
};

// Eliminar un producto terminado
export const deleteProductoTerminado = async (id) => {
    try {
        await axios.delete(`${API_URL}/${id}`, {  // Ruta DELETE
            headers: getAuthHeaders(),
        });
    } catch (error) {
        console.error('Error al eliminar producto:', error.response || error.message);
        throw error;
    }
};
