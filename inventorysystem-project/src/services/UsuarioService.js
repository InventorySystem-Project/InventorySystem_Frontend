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

// Obtener un usuario por ID
export const getUsuarioById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener usuario:', error.response || error.message);
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

// Actualizar un usuario existente (Endpoint PROTEGIDO - SOLO ADMIN)
export const updateUsuario = async (id, usuario) => {
    // Declarar payload fuera del try para que esté disponible en el catch
    let payload = null;
    
    try {
        // Verificar rol actual del usuario
        const currentUserRole = localStorage.getItem('userRole');
        const token = localStorage.getItem('token');
        
        console.log('═══════════════════════════════════════');
        console.log('🔐 ROL ACTUAL:', currentUserRole);
        console.log('🔑 Token presente:', token ? 'Sí' : 'No');
        console.log('⚠️ IMPORTANTE: Solo ADMIN puede actualizar usuarios');
        console.log('═══════════════════════════════════════');
        
        // Verificar si el usuario tiene rol ADMIN
        if (currentUserRole !== 'ADMIN') {
            throw new Error(`No tienes permisos para actualizar usuarios. Tu rol actual es: ${currentUserRole}. Se requiere rol ADMIN.`);
        }
        
        // El DTO en el backend espera el ID dentro del cuerpo
        payload = {
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

        // Asegurar que el ID esté como número
        payload.id = parseInt(id, 10);
        
        console.log('📤 PUT /usuarios - Payload FINAL:', payload);
        console.log('🔑 ID tipo:', typeof payload.id, 'valor:', payload.id);

        // El backend espera PUT /usuarios (sin ID en la URL, solo en el body)
        const response = await axios.put(`${API_URL}`, payload, {
            headers: getAuthHeaders(),
        });
        
        console.log('✅ Usuario actualizado correctamente');
        return response.data;
    } catch (error) {
        console.error('❌ Error al actualizar usuario:', error.message);
        console.error('❌ Status:', error.response?.status);
        console.error('❌ Error del backend:', error.response?.data);
        if (payload) {
            console.error('❌ Payload que se envió:', payload);
        }
        
        if (error.response?.status === 401) {
            throw new Error('Tu sesión no tiene permisos de ADMIN. Por favor, inicia sesión con un usuario ADMIN.');
        }
        
        if (error.response?.status === 400) {
            const backendError = error.response?.data?.error || error.response?.data?.message || 'Error de validación';
            throw new Error(`Error al actualizar usuario: ${backendError}`);
        }
        
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
