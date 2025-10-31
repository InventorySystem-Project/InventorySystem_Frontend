import axios from 'axios';
import { environment } from '../environment/environment';

// URLs base para cada sub-módulo de soporte
const API_URL_TICKETS = `${environment.url}/api/soporte/tickets`;
const API_URL_PROBLEMAS = `${environment.url}/api/soporte/problemas/errores-conocidos`;
const API_URL_CAMBIOS = `${environment.url}/api/soporte/cambios/rfc`;

// --- Funciones de Autenticación (igual que en otros servicios) ---
const getAuthToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('Token no encontrado en localStorage');
        // Podrías redirigir al login o manejar el error de otra forma
        return null;
    }
    return token;
};

const getAuthHeaders = () => {
    const token = getAuthToken();
    if (!token) {
        // Lanza un error o retorna un objeto vacío para indicar fallo
        throw new Error('Token de autenticación no disponible.');
    }
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

// --- Operaciones CRUD para Tickets de Soporte ---
export const getTickets = async (estado = null) => {
    try {
        const url = estado ? `${API_URL_TICKETS}?estado=${estado}` : `${API_URL_TICKETS}`;
        const response = await axios.get(url, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error('Error al obtener tickets:', error.response?.data || error.message);
        throw error;
    }
};

export const getTicketById = async (id) => {
    try {
        const response = await axios.get(`${API_URL_TICKETS}/${id}`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error(`Error al obtener ticket ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

export const addTicket = async (ticketData) => {
    try {
        // Asegúrate de enviar el ID del usuario que reporta
        const usuarioId = localStorage.getItem('userId'); // O la forma en que almacenes el ID del usuario logueado
        if (!usuarioId) {
             //throw new Error('No se pudo obtener el ID del usuario logueado.');
        }
        const dataToSend = { ...ticketData, usuarioReportaId: parseInt(usuarioId, 10) };

        const response = await axios.post(API_URL_TICKETS, dataToSend, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error('Error al agregar ticket:', error.response?.data || error.message);
        throw error;
    }
};

export const updateTicket = async (id, ticketData) => {
    try {
        const response = await axios.put(`${API_URL_TICKETS}/${id}`, ticketData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error(`Error al actualizar ticket ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

export const asignarTicket = async (ticketId, responsableId) => {
     try {
        const response = await axios.put(`${API_URL_TICKETS}/${ticketId}/asignar/${responsableId}`, {}, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error(`Error al asignar ticket ${ticketId}:`, error.response?.data || error.message);
        throw error;
    }
};

export const cambiarEstadoTicket = async (ticketId, nuevoEstado) => {
    try {
        const response = await axios.put(`${API_URL_TICKETS}/${ticketId}/estado`, { estado: nuevoEstado }, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error(`Error al cambiar estado del ticket ${ticketId}:`, error.response?.data || error.message);
        throw error;
    }
};

export const deleteTicket = async (id) => {
    try {
        await axios.delete(`${API_URL_TICKETS}/${id}`, { headers: getAuthHeaders() });
    } catch (error) {
        console.error(`Error al eliminar ticket ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

// --- Operaciones CRUD para Comentarios de Tickets ---
export const getComentariosPorTicket = async (ticketId) => {
    try {
        const response = await axios.get(`${API_URL_TICKETS}/${ticketId}/comentarios`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error(`Error al obtener comentarios para ticket ${ticketId}:`, error.response?.data || error.message);
        throw error;
    }
};

export const addComentario = async (ticketId, comentarioData) => {
    try {
        // Asegúrate de enviar el ID del usuario que comenta
        const usuarioId = localStorage.getItem('userId'); // O como obtengas el ID
         if (!usuarioId) {
             //throw new Error('No se pudo obtener el ID del usuario logueado.');
        }
        const dataToSend = { ...comentarioData, usuarioId: parseInt(usuarioId, 10) };

        const response = await axios.post(`${API_URL_TICKETS}/${ticketId}/comentarios`, dataToSend, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error(`Error al agregar comentario al ticket ${ticketId}:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Califica un ticket resuelto.
 * @param {number} ticketId - El ID del ticket.
 * @param {number} calificacion - El valor de la calificación (1-5).
 * @returns {Promise<Object>} - El ticket actualizado.
 */
export const calificarTicket = async (ticketId, calificacion) => {
    try {
        // Llama al nuevo endpoint PATCH con el body esperado
        const response = await axios.patch(`${API_URL_TICKETS}/${ticketId}/calificar`, { calificacion }, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error('Error al calificar el ticket:', error.response || error);
        throw error.response?.data || error;
    }
};

// --- Operaciones CRUD para Errores Conocidos (Gestión de Problemas) ---
export const getErroresConocidos = async () => {
    try {
        const response = await axios.get(API_URL_PROBLEMAS, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error('Error al obtener errores conocidos:', error.response?.data || error.message);
        throw error;
    }
};

export const addErrorConocido = async (errorData) => {
    try {
        const response = await axios.post(API_URL_PROBLEMAS, errorData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error('Error al agregar error conocido:', error.response?.data || error.message);
        throw error;
    }
};

export const updateErrorConocido = async (id, errorData) => {
    try {
        const response = await axios.put(`${API_URL_PROBLEMAS}/${id}`, errorData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error(`Error al actualizar error conocido ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

// --- Operaciones CRUD para Solicitudes de Cambio (RFCs) ---
export const getRFCs = async (tipo = null) => {
    try {
        const url = tipo ? `${API_URL_CAMBIOS}?tipo=${tipo}` : API_URL_CAMBIOS;
        const response = await axios.get(url, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error('Error al obtener RFCs:', error.response?.data || error.message);
        throw error;
    }
};

export const addRFC = async (rfcData) => {
    try {
         // Asegúrate de enviar el ID del usuario solicitante
        const usuarioId = localStorage.getItem('userId'); // O como obtengas el ID
         if (!usuarioId) {
             //throw new Error('No se pudo obtener el ID del usuario logueado.');
        }
        const dataToSend = { ...rfcData, solicitanteId: parseInt(usuarioId, 10) };
        const response = await axios.post(API_URL_CAMBIOS, dataToSend, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error('Error al agregar RFC:', error.response?.data || error.message);
        throw error;
    }
};

export const updateRFC = async (id, rfcData) => {
    try {
        const response = await axios.put(`${API_URL_CAMBIOS}/${id}`, rfcData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error(`Error al actualizar RFC ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

export const aprobarRFC = async (rfcId, aprobadorId, tipoAprobacion) => {
    try {
        const response = await axios.put(`${API_URL_CAMBIOS}/${rfcId}/aprobar`,
        { aprobadorId, tipoAprobacion }, // Datos en el cuerpo
        { headers: getAuthHeaders() }
       );
        return response.data;
    } catch (error) {
        console.error(`Error al aprobar RFC ${rfcId}:`, error.response?.data || error.message);
        throw error;
    }
};

export const cambiarEstadoRFC = async (rfcId, nuevoEstado) => {
    try {
        const response = await axios.put(`${API_URL_CAMBIOS}/${rfcId}/estado`, { estado: nuevoEstado }, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error(`Error al cambiar estado del RFC ${rfcId}:`, error.response?.data || error.message);
        throw error;
    }
};