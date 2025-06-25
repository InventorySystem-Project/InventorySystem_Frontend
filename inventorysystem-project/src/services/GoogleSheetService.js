import axios from 'axios';

// ¡ADVERTENCIA! Estas claves serán visibles en el navegador. SOLO PARA UAT.
const API_KEY = 'AIzaSyBYktNSd6rR8NznuuJzKtcmvHcOOyZgL5w'; // Tu API Key
const SPREADSHEET_ID = '1esMo2ILu_xNgcvEm6G49QBd8PNhpj_3gHWg7ZtVP04Q'; // El ID de tu hoja
const SHEET_NAME = 'InputRPA'; // El nombre de la pestaña dentro de tu hoja

export const registrarEnGoogleSheet = async (rows) => {
    console.log("1. ✅ Función 'registrarEnGoogleSheet' llamada con:", rows);

    if (!rows || rows.length === 0) {
        console.warn("Se intentó registrar en Google Sheet pero no había filas (rows) para enviar.");
        return;
    }

    const range = `${SHEET_NAME}!A:M`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}:append?valueInputOption=USER_ENTERED&key=${API_KEY}`;
    
    console.log("2. ⚙️  URL construida para la API de Google:", url);

    const payload = {
        values: rows,
    };

    console.log("3. 📦 Payload que se enviará a Google:", JSON.stringify(payload, null, 2));

    try {
        const response = await axios.post(url, payload);
        console.log('4. ✅ ÉXITO: Datos añadidos a Google Sheet. Respuesta:', response.data);
        return response.data;
    } catch (error) {
        // Este log es crucial. Capturará cualquier error de red o de la API.
        console.error('5. ❌ ERROR al escribir en Google Sheet. El objeto de error completo es:', error);
        
        if (error.response) {
            // El servidor respondió con un código de estado fuera del rango 2xx
            console.error('Data del error:', error.response.data);
            console.error('Status del error:', error.response.status);
            console.error('Headers del error:', error.response.headers);
        } else if (error.request) {
            // La petición se hizo pero no se recibió respuesta (CORS puede causar esto)
            console.error('No se recibió respuesta del servidor. Esto podría ser un error de CORS. Revisa la pestaña "Red" (Network) en las herramientas de desarrollador.', error.request);
        } else {
            // Algo más causó el error
            console.error('Error al configurar la petición:', error.message);
        }
        
        //alert('Hubo un error al guardar los datos en Google Sheets. Revisa la consola para más detalles.');
    }
};