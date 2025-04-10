import React, { useState } from 'react';
import { FaBell } from 'react-icons/fa'; // Icono de notificación
import { FaUserCircle } from 'react-icons/fa'; // Icono de perfil
import { FaPowerOff } from 'react-icons/fa'; // Icono de cerrar sesión
import { useNavigate, useLocation } from 'react-router-dom'; // Importar useNavigate y useLocation
import { IoSearchOutline } from "react-icons/io5"; // Icono de búsqueda

const TopBar = () => {
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener datos del usuario desde el localStorage
  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');  // Asegúrate de guardar el rol en el localStorage cuando el usuario inicie sesión

  // Función para generar la leyenda de navegación
  const generateBreadcrumbs = () => {
    const path = location.pathname.split('/').filter(Boolean); // Extraer las rutas del path
    const breadcrumbs = path.map((part, index) => {
      const isLast = index === path.length - 1;
      const text = part.charAt(0).toUpperCase() + part.slice(1).replace("-", " "); // Capitaliza la primera letra y reemplaza guiones por espacios
      return isLast ? (
        <span key={index}>{text}</span>
      ) : (
        <span key={index}>
          {text} &gt;{" "}
        </span>
      );
    });

    return breadcrumbs.length > 0 ? `Inicio > ${breadcrumbs.map(el => el.props.children).join('')}` : "Inicio"; // Devolver un string con todo el texto
  };

  // Ocultar el TopBar si estamos en la página de login
  if (location.pathname === '/') {
    return null; // Retorna null para no renderizar el TopBar en la pantalla de login
  }

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    localStorage.removeItem('role'); // También eliminar el rol
    navigate('/'); // Redirige al login
  };

  return (
    <div className="top-bar">
      <div className="breadcrumbs">
        {/* Renderiza la leyenda de navegación */}
        {generateBreadcrumbs()}
      </div>

      <div className="search-container">
        <input type="text" placeholder="Buscar" />
        <IoSearchOutline className="search-icon" /> {/* Icono de búsqueda dentro del campo */}
      </div>

      <div className="user-profile">
        <FaBell className="notification-icon" /> {/* Icono de notificaciones */}

        {/* Círculo de perfil con un botón */}
        <div className="profile-circle" onClick={() => setOpenUserMenu(!openUserMenu)}>
          <FaUserCircle />
        </div>

        {/* Mostrar el mini-recuerdo con la información del usuario */}
        <div className={`user-menu ${openUserMenu ? 'show' : ''}`}>
          <div className="user-info">
            <p><strong>Usuario: </strong> {username}</p>
            <p><strong>Rol: </strong> {role}</p>
          </div>
          <button onClick={handleLogout} className="logout-button">
            <FaPowerOff /> Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
