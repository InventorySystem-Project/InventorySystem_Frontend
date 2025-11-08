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
  LifeBuoy
} from "lucide-react";
import useAuth from '../hooks/useAuth';
import { ROLES } from '../constants/roles';
import LogoutConfirmModal from './LogoutConfirmModal';

const SideMenu = ({ isCollapsed, toggleCollapse }) => {
  const [activeItem, setActiveItem] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const { role, username, logout } = useAuth();

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    logout();
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
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

        {/* Dashboard (Visible para todos) */}
        <Link to="/dashboard" className={`menu-item ${activeItem === 'dashboard' ? 'active' : ''}`} data-tooltip="Dashboard" onClick={() => handleItemClick('dashboard')} >
          <span className="menu-icon"><Home /></span>
          {!isCollapsed && <span>Dashboard</span>}
        </Link>

        {/* --- CONDICIÓN ELIMINADA --- */}
        {/* Ahora estos enlaces se renderizan siempre */}
        <>
          {/* Productos */}
          <Link to="/productos" className={`menu-item ${activeItem === 'productos' ? 'active' : ''}`} data-tooltip="Productos" onClick={() => handleItemClick('productos')} >
            <span className="menu-icon"><Package /></span>
            {!isCollapsed && <span>Productos</span>}
          </Link>

          {/* Materias Primas */}
          <Link to="/materias-primas" className={`menu-item ${activeItem === 'materias-primas' ? 'active' : ''}`} data-tooltip="Materias Primas" onClick={() => handleItemClick('materias-primas')} >
            <span className="menu-icon"><Boxes /></span>
            {!isCollapsed && <span>Materias Primas</span>}
          </Link>

          {/* Almacenes */}
          <Link to="/almacenes" className={`menu-item ${activeItem === 'almacenes' ? 'active' : ''}`} data-tooltip="Almacenes" onClick={() => handleItemClick('almacenes')} >
            <span className="menu-icon"><Warehouse /></span>
            {!isCollapsed && <span>Almacenes</span>}
          </Link>

          {/* Proveedores */}
          <Link to="/proveedores" className={`menu-item ${activeItem === 'proveedores' ? 'active' : ''}`} data-tooltip="Proveedores" onClick={() => handleItemClick('proveedores')} >
            <span className="menu-icon"><Truck /></span>
            {!isCollapsed && <span>Proveedores</span>}
          </Link>

          {/* Órdenes de Compra */}
          <Link to="/ordenes-compra" className={`menu-item ${activeItem === 'ordenes-compra' ? 'active' : ''}`} data-tooltip="Órdenes de Compra" onClick={() => handleItemClick('ordenes-compra')} >
            <span className="menu-icon"><FileText /></span>
            {!isCollapsed && <span>Órdenes de Compra</span>}
          </Link>

          {/* Movimientos */}
          <Link to="/movimientos" className={`menu-item ${activeItem === 'movimientos' ? 'active' : ''}`} data-tooltip="Movimientos" onClick={() => handleItemClick('movimientos')} >
            <span className="menu-icon"><History /></span>
            {!isCollapsed && <span>Movimientos</span>}
          </Link>
        </>
        {/* --- FIN DE LOS ENLACES QUE ESTABAN CONDICIONADOS --- */}
      </div>

      {/* Sección de Sistema */}
      <div className="menu-section">
        {!isCollapsed && <p className="section-title">Sistema</p>}

        {/* Soporte al Cliente (Visible para todos) */}
        <Link to="/soporte-cliente" className={`menu-item ${activeItem === 'soporte-cliente' ? 'active' : ''}`} data-tooltip="Soporte al Cliente" onClick={() => handleItemClick('soporte-cliente')} >
          <span className="menu-icon"><LifeBuoy /></span>
          {!isCollapsed && <span>Soporte al Cliente</span>}
        </Link>

        {/* Enlaces de administración (Solo para ADMIN - Esta condición está CORRECTA) */}
        {role === ROLES.ADMIN && (
          <>
            <Link to="/roles" className={`menu-item ${activeItem === 'roles' ? 'active' : ''}`} data-tooltip="Roles" onClick={() => handleItemClick('roles')} >
              <span className="menu-icon"><UserCog /></span>
              {!isCollapsed && <span>Roles</span>}
            </Link>

            <Link to="/usuarios" className={`menu-item ${activeItem === 'usuarios' ? 'active' : ''}`} data-tooltip="Usuarios" onClick={() => handleItemClick('usuarios')} >
              <span className="menu-icon"><User /></span>
              {!isCollapsed && <span>Usuarios</span>}
            </Link>
          </>
        )}

        {/* Botón de Salir (Visible para todos) */}
        <div className="menu-item" onClick={handleLogoutClick} data-tooltip="Salir" >
          <span className="menu-icon"><LogOut /></span>
          {!isCollapsed && <span>Salir</span>}
        </div>
      </div>

      {/* Modal de confirmación de cierre de sesión */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
        username={username}
      />
    </div>
  );
};

export default SideMenu;