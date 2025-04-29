import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import SideMenu from './SideMenu';
import TopBar from './TopBar';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const isLogin = location.pathname === '/';

  // Estado para el menú de usuario
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const toggleUserMenu = () => setOpenUserMenu(!openUserMenu);

  // Estado para controlar el colapso del menú
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const toggleMenuCollapse = () => setIsMenuCollapsed(!isMenuCollapsed);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Menú lateral */}
      {!isLogin && (
        <SideMenu 
          openUserMenu={openUserMenu} 
          toggleUserMenu={toggleUserMenu} 
          isCollapsed={isMenuCollapsed}
          toggleCollapse={toggleMenuCollapse}
        />
      )}

      {/* Topbar */}
      <div style={{ width: '100%' }}>
        <TopBar 
          toggleUserMenu={toggleUserMenu} 
          isCollapsed={isMenuCollapsed}  // Pasar el estado del colapso al TopBar
          toggleCollapse={toggleMenuCollapse}  // Pasar la función para controlar el colapso
          style={{
            marginLeft: isMenuCollapsed ? '75px' : '255px', // Ajusta la transición del TopBar
            transition: 'margin-left 0.3s ease-in-out' // Aplicar transición
          }}
        />
        {/* Contenido de las páginas */}
        <div
          style={{
            marginLeft: isLogin ? '0' : (isMenuCollapsed ? '95px' : '255px'), // Ajustar el margen dependiendo de si está colapsado
            backgroundColor: '#134ac1',
            height: '100%',
            overflowY: 'auto',
            overflow: 'hidden',
            transition: 'margin-left 0.3s ease-in-out',
            zindex: '1'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
