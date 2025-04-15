import axios from 'axios';

// URL de la API
const API_URL = 'http://localhost:8080/proveedores';

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
  
// Obtener todos los proveedores
export const getProveedores = async () => {
    try {
      const response = await axios.get(`${API_URL}/Listar`, {  // Cambiado a la ruta correcta
        headers: getAuthHeaders(), 
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener proveedores:', error.response || error.message);
      throw error;
    }
  };
  
  // Agregar un nuevo proveedor
  export const addProveedor = async (proveedor) => {
    try {
      const response = await axios.post(`${API_URL}/Registrar`, proveedor, {  // Cambiado a la ruta correcta
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error al agregar proveedor:', error.response || error.message);
      throw error;
    }
  };
  
  // Actualizar un proveedor existente
  export const updateProveedor = async (id, proveedor) => {
    try {
      const response = await axios.put(`${API_URL}`, proveedor, {  // Ruta PUT
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar proveedor:', error.response || error.message);
      throw error;
    }
  };
  
  // Eliminar un proveedor
  export const deleteProveedor = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`, {  // Ruta DELETE
        headers: getAuthHeaders(),
      });
    } catch (error) {
      console.error('Error al eliminar proveedor:', error.response || error.message);
      throw error;
    }
  };