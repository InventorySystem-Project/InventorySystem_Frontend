import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home,
  UserCog,
  User,
  Package,
  Truck,
  Users,
  FileText,
  Building,
  History,
  BarChart3,
  LogOut
} from "lucide-react";

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


        {/* 


            <div className="menu-item" onClick={toggleRoles}>
              <span className="menu-icon"><Users /></span> Roles
              {showRoles ? <FaAngleUp className="icon" /> : <FaAngleDown className="icon" />}
            </div>
            <div className={`sub-menu ${showRoles ? 'show' : ''}`}>
              <Link to="/roles" className="sub-menu-item"> <GoPulse /> Listar Roles</Link>
              <Link to="/roles/registrar" className="sub-menu-item"> <GoPulse /> Registrar Rol</Link>
            </div>


            <div className="menu-item" onClick={toggleUsers}>
              <span className="menu-icon"><Users /></span> Usuarios
              {showUsers ? <FaAngleUp className="icon" /> : <FaAngleDown className="icon" />}
            </div>
            <div className={`sub-menu ${showUsers ? 'show' : ''}`}>
              <Link to="/users" className="sub-menu-item"> <GoPulse /> Listar Usuarios</Link>
              <Link to="/users/registrar" className="sub-menu-item"> <GoPulse /> Registrar Usuario</Link>
            </div>


            */}

        {/* Dashboard */}
        <Link to="/dashboard" className="menu-item">
          <span className="menu-icon"><Home /></span> Dashboard
        </Link>

        {/* Menú de Roles */}
        <Link to="/roles" className="menu-item">
          <span className="menu-icon"><UserCog /></span> Roles
        </Link>

        {/* Menú de Usuarios */}
        <Link to="/usuarios" className="menu-item">
          <span className="menu-icon"><User /></span> Usuarios
        </Link>

        {/* Menú de Productos */}
        <Link to="/productos" className="menu-item">
          <span className="menu-icon"><Package /></span> Productos
        </Link>

        {/* Menú de Materias Primas */}
        <Link to="/materias-primas" className="menu-item">
          <span className="menu-icon"><Truck /></span> Materias Primas
        </Link>

        {/* Menú de Proveedores */}
        <Link to="/proveedores" className="menu-item">
          <span className="menu-icon"><Users /></span> Proveedores
        </Link>

        {/* Menú de Órdenes de Compra */}
        <Link to="/ordenes-compra" className="menu-item">
          <span className="menu-icon"><FileText /></span> Órdenes de Compra
        </Link>

        {/* Menú de Empresas */}
        <Link to="/empresas" className="menu-item">
          <span className="menu-icon"><Building /></span> Empresas
        </Link>

        {/* Menú de Movimientos */}
        <Link to="/movimientos" className="menu-item">
          <span className="menu-icon"><History /></span> Movimientos
        </Link>

        {/* Menú de Reportes */}
        <Link to="/reportes" className="menu-item">
          <span className="menu-icon"><BarChart3 /></span> Reportes
        </Link>



      </div>
    </div>
  );
};

export default SideMenu;
