import axios from 'axios';

const getProductos = async () => {
  try {
    const response = await axios.get('http://localhost:8080');  // URL del backend
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
