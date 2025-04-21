import React, { useState } from 'react';
import { FaBell } from 'react-icons/fa'; // Icono de notificación
import { FaUserCircle } from 'react-icons/fa'; // Icono de perfil
import { FaPowerOff } from 'react-icons/fa'; // Icono de cerrar sesión
import { useNavigate, useLocation } from 'react-router-dom'; // Importar useNavigate y useLocation
import { IoSearchOutline } from "react-icons/io5"; // Icono de búsqueda

const TopBar = ({ isCollapsed, toggleCollapse }) => {
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');

  const generateBreadcrumbs = () => {
    const path = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = path.map((part, index) => {
      const isLast = index === path.length - 1;
      const text = part.charAt(0).toUpperCase() + part.slice(1).replace("-", " ");
      return isLast ? (
        <span key={index}>{text}</span>
      ) : (
        <span key={index}>{text} &gt; </span>
      );
    });

    return breadcrumbs.length > 0 ? `Inicio > ${breadcrumbs.map(el => el.props.children).join('')}` : "Inicio";
  };

  if (location.pathname === '/') {
    return null; // Retorna null si estamos en la página de login
  }

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/'); // Redirige al login
  };

  return (
    <div className={`top-bar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="breadcrumbs">{generateBreadcrumbs()}</div>
      <div className="search-container">
        <input type="text" placeholder="Buscar" />
        <IoSearchOutline className="search-icon" />
      </div>
      <div className="user-profile">
        <FaBell className="notification-icon" />
        <div className="profile-circle" onClick={() => setOpenUserMenu(!openUserMenu)}>
          <FaUserCircle />
        </div>
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
