import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa'; // Íconos para desplegar
import { GoPulse } from "react-icons/go";
import { FaUser } from "react-icons/fa";
import { FaUserGear } from "react-icons/fa6";

const SideMenu = () => {
  const [showRoles, setShowRoles] = useState(false);
  const [showUsers, setShowUsers] = useState(false);

  const username = localStorage.getItem('username');
  const navigate = useNavigate();

  const toggleRoles = () => setShowRoles(!showRoles);
  const toggleUsers = () => setShowUsers(!showUsers);

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
      }}
    >
      {/* Contenido principal */}
      <div>
        <h2 className="menu-heading">Menú Lateral</h2>

        {/* Pestaña de Roles */}
        <div className="menu-item" onClick={toggleRoles}>
          <span className="menu-icon"><FaUserGear /></span> Roles
          {showRoles ? <FaAngleUp className="icon" /> : <FaAngleDown className="icon" />}
        </div>
        <div className={`sub-menu ${showRoles ? 'show' : ''}`}>
          <Link to="/roles" className="sub-menu-item"> <GoPulse /> Listar Roles</Link>
          <Link to="/roles/registrar" className="sub-menu-item"> <GoPulse /> Registrar Rol</Link>
        </div>

        {/* Pestaña de Usuarios */}
        <div className="menu-item" onClick={toggleUsers}>
          <span className="menu-icon"><FaUser /></span> Usuarios
          {showUsers ? <FaAngleUp className="icon" /> : <FaAngleDown className="icon" />}
        </div>
        <div className={`sub-menu ${showUsers ? 'show' : ''}`}>
          <Link to="/users" className="sub-menu-item"> <GoPulse /> Listar Usuarios</Link>
          <Link to="/users/registrar" className="sub-menu-item"> <GoPulse /> Registrar Usuario</Link>
        </div>
      </div>
    </div>
  );
};

export default SideMenu;
