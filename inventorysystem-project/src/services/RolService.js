import axios from 'axios';
import { environment } from '../environment/environment';

const API_URL = `${environment.url}/roles`;
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

// Obtener todos los roles
export const getRoles = async () => {
    try {
        const response = await axios.get(`${API_URL}/listar`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener roles:', error.response || error.message);
        throw error;
    }
};

// Agregar un nuevo rol
export const addRol = async (role) => {
    try {
        // Asegurarse de NO enviar el ID al crear un nuevo rol
        const { id, ...roleData } = role;
        const nuevoRol = { rol: roleData.rol };
        
        console.log('Creando nuevo rol (sin ID):', nuevoRol);
        
        const response = await axios.post(`${API_URL}/registrar`, nuevoRol, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error al agregar rol:', error.response || error.message);
        throw error;
    }
};

// Actualizar un rol existente
export const updateRol = async (id, role) => {
    try {
        // Enviar el ID en la URL (RESTful) y también en el body
        const payload = {
            rol: role.rol  // Solo enviar el campo rol en el body
        };
        
        console.log('📤 PUT /roles/' + id + ' - Payload:', payload);
        
        const response = await axios.put(`${API_URL}/${id}`, payload, {
            headers: getAuthHeaders(),
        });
        
        console.log('✅ Rol actualizado - Status:', response.status);
        return response.data;
    } catch (error) {
        console.error('❌ Error al actualizar rol:', error.response || error.message);
        throw error;
    }
};

// Eliminar un rol
export const deleteRol = async (id) => {
    try {
        await axios.delete(`${API_URL}/eliminar/${id}`, {
            headers: getAuthHeaders(),
        });
    } catch (error) {
        console.error('Error al eliminar rol:', error.response || error.message);
        throw error;
    }
};
