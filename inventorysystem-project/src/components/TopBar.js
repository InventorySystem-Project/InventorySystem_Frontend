import React, { useState } from 'react';
import { FaBell } from 'react-icons/fa'; // Icono de notificación
import { FaUserCircle } from 'react-icons/fa'; // Icono de perfil
import { FaPowerOff } from 'react-icons/fa'; // Icono de cerrar sesión
import { useNavigate, useLocation } from 'react-router-dom'; // Importar useNavigate y useLocation

const TopBar = () => {
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const navigate = useNavigate(); // Inicializamos useNavigate
  const location = useLocation(); // Inicializamos useLocation

  // Ocultar el TopBar si estamos en la página de login
  if (location.pathname === '/') {
    return null; // Retorna null para no renderizar el TopBar en la pantalla de login
  }

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    navigate('/login'); // Redirige al login
  };

  return (
    <div className="top-bar">
      <div className="search-container">
        <input type="text" placeholder="Buscar por nombre" />
      </div>

      <div className="user-profile">
        <FaBell className="notification-icon" /> {/* Icono de notificaciones */}
        
        {/* Círculo de perfil con un botón */}
        <div className="profile-circle" onClick={() => setOpenUserMenu(!openUserMenu)}>
          <FaUserCircle />
        </div>
        
        {/* Mostrar el menú de usuario */}
        {openUserMenu && (
          <div className="user-menu">
            <button onClick={handleLogout}>
              <FaPowerOff /> Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;
