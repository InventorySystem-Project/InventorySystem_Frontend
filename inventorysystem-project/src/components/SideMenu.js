import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa'; // Íconos para desplegar
import { GoPulse } from "react-icons/go";
import { FaUser } from "react-icons/fa";
import { FaUserGear } from "react-icons/fa6";
import { AiFillHome } from "react-icons/ai";
import { Home, Package, Truck, BarChart, History, LogOut, Settings, Users, FileText } from "lucide-react";

const SideMenu = () => {
  const [showRoles, setShowRoles] = useState(false);
  const [showUsers, setShowUsers] = useState(false);

  const username = localStorage.getItem('username');
  const navigate = useNavigate();

  const toggleRoles = () => setShowRoles(!showRoles);
  const toggleUsers = () => setShowUsers(!showUsers);
  const handleHomeClick = () => {
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div
      className="side-menu"

    >
      {/* Contenido principal */}
      <div>
        <h2 className="menu-heading">Menú Lateral</h2>
        <hr></hr>
        {/* Pestaña de Roles */}
        <div className="menu-item" onClick={handleHomeClick}>
  <span className="menu-icon"><Home /></span> Dashboard
</div>

{/* Pestaña de Roles */}
<div className="menu-item" onClick={toggleRoles}>
  <span className="menu-icon"><Users /></span> Roles
  {showRoles ? <FaAngleUp className="icon" /> : <FaAngleDown className="icon" />}
</div>
<div className={`sub-menu ${showRoles ? 'show' : ''}`}>
  <Link to="/roles" className="sub-menu-item"> <GoPulse /> Listar Roles</Link>
  <Link to="/roles/registrar" className="sub-menu-item"> <GoPulse /> Registrar Rol</Link>
</div>

{/* Pestaña de Usuarios */}
<div className="menu-item" onClick={toggleUsers}>
  <span className="menu-icon"><Users /></span> Usuarios
  {showUsers ? <FaAngleUp className="icon" /> : <FaAngleDown className="icon" />}
</div>
<div className={`sub-menu ${showUsers ? 'show' : ''}`}>
  <Link to="/users" className="sub-menu-item"> <GoPulse /> Listar Usuarios</Link>
  <Link to="/users/registrar" className="sub-menu-item"> <GoPulse /> Registrar Usuario</Link>
</div>

{/* Menú de Productos */}
<div className="menu-item">
  <Link to="/productos" className="menu-link">
    <span className="menu-icon"><Package /></span> Productos
  </Link>
</div>

{/* Menú de Materias Primas */}
<div className="menu-item">
  <Link to="/materias-primas" className="menu-link">
    <span className="menu-icon"><Truck /></span> Materias Primas
  </Link>
</div>

{/* Menú de Proveedores */}
<div className="menu-item">
  <Link to="/proveedores" className="menu-link">
    <span className="menu-icon"><Users /></span> Proveedores
  </Link>
</div>

{/* Menú de Órdenes de Compra */}
<div className="menu-item">
  <Link to="/orden-compras" className="menu-link">
    <span className="menu-icon"><FileText /></span> Órdenes de Compra
  </Link>
</div>

{/* Menú de Movimientos */}
<div className="menu-item">
  <Link to="/movimientos" className="menu-link">
    <span className="menu-icon"><History /></span> Movimientos
  </Link>
</div>

{/* Menú de Reportes */}
<div className="menu-item">
  <Link to="/reportes" className="menu-link">
    <span className="menu-icon"><BarChart /></span> Reportes
  </Link>
</div>


      </div>
    </div>
  );
};

export default SideMenu;
