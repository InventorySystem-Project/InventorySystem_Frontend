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
  LogOut,
  Warehouse,
  ChevronLeft,
  ChevronRight,
  Boxes,
  Megaphone,
  LifeBuoy // Icono para Soporte al Cliente
} from "lucide-react";

const SideMenu = ({ isCollapsed, toggleCollapse }) => {
  const [activeItem, setActiveItem] = useState('');
  const [showRoles, setShowRoles] = useState(false);
  const [showUsers, setShowUsers] = useState(false);

  const username = localStorage.getItem('username');
  const navigate = useNavigate();

  const toggleRoles = () => setShowRoles(!showRoles);
  const toggleUsers = () => setShowUsers(!showUsers);

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    navigate('/'); // Redirigir al login
  };

  const handleItemClick = (item) => {
    setActiveItem(item);
  };

  return (
    <div className={`side-menu ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="menu-header">
        <div className="logo-container">
          <div className="app-logo">
            <span>EI</span>
          </div>
          {!isCollapsed && (
            <div className="app-title">
              <h3>Frederick E.I.R.L</h3>
              <p>Sistema de inventarios</p>
            </div>
          )}
        </div>
        <button className="collapse-button" onClick={toggleCollapse}>
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Sección de Gestión */}
      <div className="menu-section">
        {!isCollapsed && <p className="section-title">Gestión</p>}

        <Link
          to="/dashboard"
          className={`menu-item ${activeItem === 'dashboard' ? 'active' : ''}`}
          data-tooltip="Dashboard"
          onClick={() => handleItemClick('dashboard')}
        >
          <span className="menu-icon"><Home /></span>
          {!isCollapsed && <span>Dashboard</span>}
        </Link>

        <Link
          to="/productos"
          className={`menu-item ${activeItem === 'productos' ? 'active' : ''}`}
          data-tooltip="Productos"
          onClick={() => handleItemClick('productos')}
        >
          <span className="menu-icon"><Package /></span>
          {!isCollapsed && <span>Productos</span>}
        </Link>

        <Link
          to="/materias-primas"
          className={`menu-item ${activeItem === 'materias-primas' ? 'active' : ''}`}
          data-tooltip="Materias Primas"
          onClick={() => handleItemClick('materias-primas')}
        >
          <span className="menu-icon"><Boxes /></span>
          {!isCollapsed && <span>Materias Primas</span>}
        </Link>

        <Link
          to="/almacenes"
          className={`menu-item ${activeItem === 'almacenes' ? 'active' : ''}`}
          data-tooltip="Almacenes"
          onClick={() => handleItemClick('almacenes')}
        >
          <span className="menu-icon"><Warehouse /></span>
          {!isCollapsed && <span>Almacenes</span>}
        </Link>

        <Link
          to="/proveedores"
          className={`menu-item ${activeItem === 'proveedores' ? 'active' : ''}`}
          data-tooltip="Proveedores"
          onClick={() => handleItemClick('proveedores')}
        >
          <span className="menu-icon"><Truck /></span>
          {!isCollapsed && <span>Proveedores</span>}
        </Link>

        <Link
          to="/ordenes-compra"
          className={`menu-item ${activeItem === 'ordenes-compra' ? 'active' : ''}`}
          data-tooltip="Órdenes de Compra"
          onClick={() => handleItemClick('ordenes-compra')}
        >
          <span className="menu-icon"><FileText /></span>
          {!isCollapsed && <span>Órdenes de Compra</span>}
        </Link>

        <Link
          to="/movimientos"
          className={`menu-item ${activeItem === 'movimientos' ? 'active' : ''}`}
          data-tooltip="Movimientos"
          onClick={() => handleItemClick('movimientos')}
        >
          <span className="menu-icon"><History /></span>
          {!isCollapsed && <span>Movimientos</span>}
        </Link>
      </div>

      {/* Sección de Sistema */}
      <div className="menu-section">
        {!isCollapsed && <p className="section-title">Sistema</p>}

         {/* ---- NUEVO MÓDULO: SOPORTE AL CLIENTE ---- */}
         <Link
          to="/soporte-cliente" // Define la ruta para este módulo
          className={`menu-item ${activeItem === 'soporte-cliente' ? 'active' : ''}`}
          data-tooltip="Soporte al Cliente"
          onClick={() => handleItemClick('soporte-cliente')}
        >
          <span className="menu-icon"><LifeBuoy /></span> {/* Icono sugerido */}
          {!isCollapsed && <span>Soporte al Cliente</span>}
        </Link>
        {/* ---- FIN NUEVO MÓDULO ---- */}

        <Link
          to="/roles"
          className={`menu-item ${activeItem === 'roles' ? 'active' : ''}`}
          data-tooltip="Roles"
          onClick={() => handleItemClick('roles')}
        >
          <span className="menu-icon"><UserCog /></span>
          {!isCollapsed && <span>Roles</span>}
        </Link>

        <Link
          to="/usuarios"
          className={`menu-item ${activeItem === 'usuarios' ? 'active' : ''}`}
          data-tooltip="Usuarios"
          onClick={() => handleItemClick('usuarios')}
        >
          <span className="menu-icon"><User /></span>
          {!isCollapsed && <span>Usuarios</span>}
        </Link>

        <div
          className="menu-item"
          onClick={handleLogout}
          data-tooltip="Salir"
        >
          <span className="menu-icon"><LogOut /></span>
          {!isCollapsed && <span>Salir</span>}
        </div>
      </div>
    </div>
  );
};

export default SideMenu; 