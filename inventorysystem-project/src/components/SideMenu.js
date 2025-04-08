import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa'; // Íconos para desplegar

const SideMenu = () => {
  const [showRoles, setShowRoles] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);

  const username = localStorage.getItem('username');
  const navigate = useNavigate();

  const toggleRoles = () => setShowRoles(!showRoles);
  const toggleUsers = () => setShowUsers(!showUsers);
  const toggleUserMenu = () => setOpenUserMenu(!openUserMenu);

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div
      className="side-menu"
      style={{
        width: '250px',
        height: '100vh',
        background: '#134ac1',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px'
      }}
    >
      {/* Contenido principal */}
      <div>
        <h2 className="menu-heading">Menú Lateral</h2>

        {/* Pestaña de Roles */}
        <div className="menu-item" onClick={toggleRoles}>
          <span className="menu-icon">🛠</span> Roles
          {showRoles ? <FaAngleUp className="icon" /> : <FaAngleDown className="icon" />}
        </div>
        <div className={`sub-menu ${showRoles ? 'show' : ''}`}>
          <Link to="/roles" className="sub-menu-item">Listar Roles</Link>
          <Link to="/roles/registrar" className="sub-menu-item">Registrar Rol</Link>
        </div>

        {/* Pestaña de Usuarios */}
        <div className="menu-item" onClick={toggleUsers}>
          <span className="menu-icon">👤</span> Usuarios
          {showUsers ? <FaAngleUp className="icon" /> : <FaAngleDown className="icon" />}
        </div>
        <div className={`sub-menu ${showUsers ? 'show' : ''}`}>
          <Link to="/users" className="sub-menu-item">Listar Usuarios</Link>
          <Link to="/users/registrar" className="sub-menu-item">Registrar Usuario</Link>
        </div>
      </div>

      {/* Usuario logeado abajo */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
  <button
    onClick={toggleUserMenu}
    style={{
      width: '100%',
      padding: '20px',
      background: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    }}
  >
    {username || 'Usuario'}
  </button>

        {openUserMenu && (
          <button
            onClick={handleLogout}
            style={{
              marginTop: '8px',
              width: '100%',
              padding: '8px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cerrar sesión
          </button>
        )}
      </div>
    </div>
  );
};

export default SideMenu;
