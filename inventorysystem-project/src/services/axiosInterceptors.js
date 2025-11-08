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
    async (error) => {
      const originalRequest = error.config;
      
      // Manejar errores de autenticación (401)
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        // Intentar obtener nuevo token si existe refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          try {
            // Intentar refrescar el token
            const response = await axios.post('/auth/refresh', {
              refreshToken: refreshToken
            });
            
            if (response.data && response.data.token) {
              // Guardar nuevo token
              localStorage.setItem('token', response.data.token);
              
              // Reintentar la petición original con el nuevo token
              originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            console.error('Error al refrescar token:', refreshError);
          }
        }
        
        // Si no hay refresh token o falló el refresh, limpiar y redirigir
        console.warn('Token expirado o inválido - limpiando localStorage');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('userRole');
        
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
          window.location.href = '/';
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