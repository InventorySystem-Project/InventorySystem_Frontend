import { useEffect } from 'react';
import { useModal } from './useModal';

export const useGlobalAuthHandler = () => {
  const { showAlert, showWarning, showError } = useModal();
  
  useEffect(() => {
    const handleAuthError = (event) => {
      const { message, type = 'error' } = event.detail || {};
      if (message) {
        showAlert(message, 'Sesión Expirada', type);
      }
    };

    const handleConstraintError = (event) => {
      const { message, type = 'warning' } = event.detail || {};
      if (message) {
        showWarning(message, 'Restricción de Datos');
      }
    };

    const handleBusinessError = (event) => {
      const { message, type = 'error' } = event.detail || {};
      if (message) {
        showError(message, 'Error de Operación');
      }
    };
    
    // Escuchar eventos de error
    window.addEventListener('auth-error', handleAuthError);
    window.addEventListener('constraint-error', handleConstraintError);
    window.addEventListener('business-error', handleBusinessError);
    
    // Cleanup
    return () => {
      window.removeEventListener('auth-error', handleAuthError);
      window.removeEventListener('constraint-error', handleConstraintError);
      window.removeEventListener('business-error', handleBusinessError);
    };
  }, [showAlert, showWarning, showError]);
};