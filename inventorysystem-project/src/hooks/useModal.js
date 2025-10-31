import { useState } from 'react';

export const useModal = () => {
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: 'info', // 'info', 'warning', 'error', 'confirm', 'success'
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
    confirmText: 'Aceptar',
    cancelText: 'Cancelar'
  });

  const showModal = ({
    type = 'info',
    title = '',
    message = '',
    onConfirm = null,
    onCancel = null,
    confirmText = 'Aceptar',
    cancelText = 'Cancelar'
  }) => {
    setModalConfig({
      isOpen: true,
      type,
      title,
      message,
      onConfirm,
      onCancel,
      confirmText,
      cancelText
    });
  };

  const hideModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const showAlert = (message, title = 'Información', type = 'info') => {
    showModal({
      type,
      title,
      message,
      onConfirm: hideModal,
      confirmText: 'Entendido'
    });
  };

  const showConfirm = (message, onConfirm, title = 'Confirmación', confirmText = 'Confirmar', cancelText = 'Cancelar') => {
    showModal({
      type: 'confirm',
      title,
      message,
      onConfirm: () => {
        onConfirm();
        hideModal();
      },
      onCancel: hideModal,
      confirmText,
      cancelText
    });
  };

  const showError = (message, title = 'Error') => {
    showAlert(message, title, 'error');
  };

  const showSuccess = (message, title = 'Éxito') => {
    showAlert(message, title, 'success');
  };

  const showWarning = (message, title = 'Advertencia') => {
    showAlert(message, title, 'warning');
  };

  return {
    modalConfig,
    showModal,
    hideModal,
    showAlert,
    showConfirm,
    showError,
    showSuccess,
    showWarning
  };
};