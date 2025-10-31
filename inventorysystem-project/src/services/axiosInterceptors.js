import axios from 'axios';

// Interceptor para manejar errores de autenticación globalmente
const setupAxiosInterceptors = () => {
  // Interceptor para requests - agregar token automáticamente
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Interceptor para responses - manejar errores globalmente
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Manejar errores de autenticación (401)
      if (error.response?.status === 401) {
        // Token expirado o inválido
        console.warn('Token expirado o inválido - limpiando localStorage');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
        
        // Mostrar mensaje de error
        const event = new CustomEvent('auth-error', {
          detail: {
            message: 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.',
            type: 'warning'
          }
        });
        window.dispatchEvent(event);
        
        // Redirigir al login después de un breve delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
      // Manejar errores de constraint/foreign key (400)
      else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || error.message || 'Error en la operación';
        
        // Detectar errores de foreign key/constraint
        if (errorMessage.toLowerCase().includes('constraint') || 
            errorMessage.toLowerCase().includes('foreign key') ||
            errorMessage.toLowerCase().includes('referential integrity') ||
            errorMessage.toLowerCase().includes('cannot delete') ||
            errorMessage.toLowerCase().includes('violates')) {
          
          // Mostrar modal informativo sobre restricción
          const event = new CustomEvent('constraint-error', {
            detail: {
              message: 'No se puede eliminar este elemento porque está siendo utilizado por otros registros. Primero debe eliminar los registros relacionados.',
              type: 'warning'
            }
          });
          window.dispatchEvent(event);
        } else {
          // Otros errores 400 que no son de constraint
          const event = new CustomEvent('business-error', {
            detail: {
              message: errorMessage,
              type: 'error'
            }
          });
          window.dispatchEvent(event);
        }
      }
      
      return Promise.reject(error);
    }
  );
};

export default setupAxiosInterceptors;