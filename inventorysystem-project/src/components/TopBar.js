import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaUserCircle, FaPowerOff } from 'react-icons/fa';
import { IoSearchOutline } from "react-icons/io5";
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const TopBar = ({ isCollapsed, toggleCollapse }) => {
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [notifications, setNotifications] = useState(3); // Ejemplo de contador de notificaciones
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);
  const { username, role, logout } = useAuth();

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setOpenUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const generateBreadcrumbs = () => {
    const path = location.pathname.split('/').filter(Boolean);
    
    if (path.length === 0) return "Inicio";

    return (
      <div className="breadcrumbs-container" style={styles.breadcrumbsContainer}>
        <div className="breadcrumb-item" style={styles.breadcrumbItemHome} onClick={() => navigate('/dashboard')}>
          <svg style={styles.homeIcon} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span style={styles.breadcrumbHomeText}>Inicio</span>
        </div>
        
        {path.map((part, index) => {
          const isLast = index === path.length - 1;
          const text = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ");
          const url = `/${path.slice(0, index + 1).join('/')}`;
          
          return (
            <React.Fragment key={index}>
              <div className="breadcrumb-separator" style={styles.breadcrumbSeparator}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
              <div 
                className={`breadcrumb-item ${isLast ? 'active' : ''}`}
                style={{
                  ...styles.breadcrumbItem,
                  ...(isLast ? styles.breadcrumbItemActive : {}),
                  cursor: isLast ? 'default' : 'pointer'
                }}
                onClick={() => !isLast && navigate(url)}
              >
                <span>{text}</span>
                {isLast && (
                  <div style={styles.breadcrumbActiveDot}></div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  if (location.pathname === '/') {
    return null; // No mostrar en la página de login
  }

  const handleLogout = () => {
    logout(); // Usa la función de logout del hook useAuth
    setOpenUserMenu(false);
  };

  return (
    <div className={`top-bar ${isCollapsed ? 'collapsed' : ''}`} style={styles.topBar}>
      <div className="breadcrumbs" style={styles.breadcrumbs}>
        {generateBreadcrumbs()}
      </div>
      {/*
      <div className="search-container" style={styles.searchContainer}>
        <IoSearchOutline style={styles.searchIcon} />
        <input 
          type="text" 
          placeholder="Buscar..." 
          style={styles.searchInput} 
        />
      </div>
      */}
      <div className="user-profile" style={styles.userProfile}>
        
        {/* <div className="notification-wrapper" style={styles.notificationWrapper}>
          <FaBell style={styles.notificationIcon} />
          {notifications > 0 && (
            <span className="notification-badge" style={styles.notificationBadge}>
              {notifications}
            </span>
          )}
        </div> 
          )}
        </div>*/}
        
        <div 
          className="profile-container" 
          style={styles.profileContainer}
          onClick={() => setOpenUserMenu(!openUserMenu)}
        >
          <div className="profile-circle" style={styles.profileCircle}>
            <FaUserCircle style={styles.userIcon} />
          </div>
          <div className="profile-info" style={styles.profileInfo}>
            <span style={styles.username}>{username}</span>
            <span style={styles.role}>{role}</span>
          </div>
        </div>
        
        {openUserMenu && (
          <div 
            ref={userMenuRef}
            className="user-menu" 
            style={styles.userMenu}
          >
            <div className="user-menu-header" style={styles.userMenuHeader}>
              <FaUserCircle style={styles.userMenuIcon} />
              <div style={styles.userMenuInfo}>
                <p style={styles.userMenuName}>{username}</p>
                <p style={styles.userMenuRole}>{role}</p>
              </div>
            </div>
            
            <div className="user-menu-divider" style={styles.userMenuDivider}></div>
            
            <div className="user-menu-options" style={styles.userMenuOptions}>
              <div 
                className="menu-option" 
                style={styles.menuOption}
                onClick={() => navigate('/perfil')}
              >
                <span>Mi Perfil</span>
              </div>
              <div 
                className="menu-option" 
                style={styles.menuOption}
                onClick={() => navigate('/configuracion')}
              >
                <span>Configuración</span>
              </div>
            </div>
            
            <div className="user-menu-divider" style={styles.userMenuDivider}></div>
            
            <button 
              onClick={handleLogout} 
              className="logout-button" 
              style={styles.logoutButton}
            >
              <FaPowerOff style={styles.logoutIcon} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Estilos en línea para el componente
const styles = {
  // Estilos para la barra superior
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1.5rem',
    height: '70px',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s ease',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  
  // Estilos para las migas de pan
  breadcrumbs: {
    fontSize: '14px',
    color: '#666',
    flex: '1',
    display: 'flex',
    alignItems: 'center',
  },
  breadcrumbsContainer: {
    display: 'flex',
    alignItems: 'center',
    background: '#f8f9fa',
    borderRadius: '8px',
    padding: '6px 12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  breadcrumbItemHome: {
    display: 'flex',
    alignItems: 'center',
    padding: '4px 8px',
    borderRadius: '6px',
    backgroundColor: '#edf2f7',
    color: '#3182ce',
    fontWeight: '500',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  homeIcon: {
    marginRight: '6px',
  },
  breadcrumbHomeText: {
    fontWeight: '500',
  },
  breadcrumbSeparator: {
    margin: '0 4px',
    color: '#a0aec0',
    display: 'flex',
    alignItems: 'center',
  },
  breadcrumbItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '400',
    color: '#4a5568',
    position: 'relative',
    transition: 'all 0.2s ease',
  },
  breadcrumbItemActive: {
    backgroundColor: '#ebf8ff',
    color: '#2b6cb0',
    fontWeight: '500',
    paddingRight: '16px',
  },
  breadcrumbActiveDot: {
    position: 'absolute',
    right: '5px',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#3182ce',
  },
  
  // Estilos para el buscador
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: '20px',
    padding: '0 15px',
    height: '40px',
    width: '300px',
    marginRight: '20px',
    transition: 'all 0.3s ease',
  },
  searchIcon: {
    fontSize: '18px',
    color: '#666',
    marginRight: '10px',
  },
  searchInput: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    width: '100%',
    fontSize: '14px',
    color: '#333',
  },
  
  // Estilos para el área de perfil de usuario
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
  },
  
  // Estilos para notificaciones
  notificationWrapper: {
    position: 'relative',
    marginRight: '20px',
    cursor: 'pointer',
  },
  notificationIcon: {
    fontSize: '20px',
    color: '#666',
    transition: 'color 0.2s ease',
  },
  notificationBadge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    background: '#f44336',
    color: 'white',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    fontSize: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
  },
  
  // Estilos para el contenedor de perfil
  profileContainer: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '5px 10px',
    borderRadius: '20px',
    transition: 'background-color 0.2s ease',
  },
  profileCircle: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    marginRight: '10px',
  },
  userIcon: {
    fontSize: '24px',
    color: '#666',
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  username: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  role: {
    fontSize: '12px',
    color: '#888',
  },
  
  // Estilos para el menú de usuario
  userMenu: {
    position: 'absolute',
    top: '70px',
    right: '0',
    width: '250px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    zIndex: 1000,
    animation: 'fadeIn 0.2s ease-in-out',
  },
  userMenuHeader: {
    display: 'flex',
    padding: '15px',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  userMenuIcon: {
    fontSize: '40px',
    color: '#666',
    marginRight: '15px',
  },
  userMenuInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  userMenuName: {
    margin: '0',
    fontSize: '15px',
    fontWeight: '600',
    color: '#333',
  },
  userMenuRole: {
    margin: '0',
    fontSize: '13px',
    color: '#666',
  },
  userMenuDivider: {
    height: '1px',
    backgroundColor: '#eeeeee',
    margin: '0',
  },
  userMenuOptions: {
    padding: '10px 0',
  },
  menuOption: {
    padding: '10px 15px',
    fontSize: '14px',
    color: '#333',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '12px 15px',
    backgroundColor: '#fff',
    border: 'none',
    borderTop: '1px solid #eee',
    color: '#f44336',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  logoutIcon: {
    fontSize: '16px',
    marginRight: '10px',
  },
};


export default TopBar;