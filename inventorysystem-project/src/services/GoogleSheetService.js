import axios from 'axios';
import { environment } from '../environment/environment';
// Obtener el token JWT desde el localStorage
const getAuthToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('Token no encontrado en localStorage');
        return null;
    }
    return token;
};

const API_URL = `${environment.url}/ordenes-compra`;
// Encabezados con autorización
const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};
export const registrarEnGoogleSheet = async (rows) => {
    console.log("1. ✅ Llamando al backend para registrar en Google Sheet con:", rows);

    try {
        // Llamamos al nuevo endpoint de nuestro propio backend
        const response = await axios.post(`${API_URL}/registrar-en-sheet`, rows, {
            headers: getAuthHeaders(), // Usamos los mismos headers de autenticación
        });
        console.log("2. ✅ Respuesta del backend sobre Google Sheets:", response.data);
    } catch (error) {
        console.error("3. ❌ Error al llamar al endpoint del backend para Google Sheets:", error.response?.data || error.message);
    }
};