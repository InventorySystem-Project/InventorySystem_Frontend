import React from 'react';
import { LogOut, X, AlertCircle } from 'lucide-react';
import './LogoutConfirmModal.css';

const LogoutConfirmModal = ({ isOpen, onConfirm, onCancel, username }) => {
  if (!isOpen) return null;

  return (
    <div className="logout-modal-overlay" onClick={onCancel}>
      <div className="logout-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="logout-modal-close" onClick={onCancel} aria-label="Cerrar">
          <X size={20} />
        </button>
        
        <div className="logout-modal-header">
          <div className="logout-modal-icon-wrapper">
            <div className="logout-modal-icon-bg">
              <LogOut size={32} />
            </div>
            <div className="logout-modal-pulse"></div>
          </div>
          <h2 className="logout-modal-title">Cerrar Sesión</h2>
        </div>

        <div className="logout-modal-body">
          <div className="logout-modal-info">
            <AlertCircle size={18} />
            <p>¿Estás seguro que deseas cerrar sesión?</p>
          </div>
          {username && (
            <div className="logout-modal-user">
              <span className="logout-modal-user-label">Usuario:</span>
              <span className="logout-modal-user-name">{username}</span>
            </div>
          )}
          <p className="logout-modal-description">
            Se cerrará tu sesión actual y tendrás que volver a iniciar sesión para acceder al sistema.
          </p>
        </div>

        <div className="logout-modal-footer">
          <button className="logout-modal-btn logout-modal-btn-cancel" onClick={onCancel}>
            <span>Cancelar</span>
          </button>
          <button className="logout-modal-btn logout-modal-btn-confirm" onClick={onConfirm}>
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmModal;
