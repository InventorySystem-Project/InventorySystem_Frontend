import axios from 'axios';
import { environment } from '../environment/environment';

const API_URL = `${environment.url}/usuarios`;

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

// Agregar un nuevo usuario (Endpoint PÚBLICO)
export const addUsuario = async (usuario) => {
    try {
        // NO LLEVA HEADERS - /registrar es público
        const response = await axios.post(`${API_URL}/registrar`, usuario);
        return response.data;
    } catch (error) {
        console.error('Error al agregar usuario:', error.response || error.message);
        throw error;
    }
};

// Actualizar un usuario existente (Endpoint PROTEGIDO)
export const updateUsuario = async (id, usuario) => {
    try {
        // El DTO en el backend espera el ID dentro del cuerpo
        const payload = {
            ...usuario,
            id: id,
            rolId: usuario.rolId || usuario.rol?.id // Asegura que se envía el rolId
        };
        
        // Asegurarse de que no enviamos objetos completos de rol o empresa
        delete payload.rol;
        if (payload.empresa) {
            payload.empresaId = payload.empresa.id;
            delete payload.empresa;
        }

        const response = await axios.put(`${API_URL}`, payload, {
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

/**
 * Nueva función para obtener solo usuarios que pueden ser responsables.
 * Incluye roles: ADMIN, SOPORTE_N1, SOPORTE_N2
 */
export const getUsuariosAsignables = async () => {
    try {
        const response = await axios.get(`${API_URL}/asignables`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener usuarios asignables:', error.response || error.message);
        throw error;
    }
};

/**
 * Actualizar contraseña de un usuario
 * El backend debe encriptar la contraseña con bcrypt
 */
export const updatePassword = async (userId, newPassword) => {
    try {
        const response = await axios.patch(`${API_URL}/${userId}/password`, 
            { password: newPassword },
            {
                headers: getAuthHeaders(),
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error al actualizar contraseña:', error.response || error.message);
        throw error;
    }
};
