import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import SideMenu from './SideMenu';
import TopBar from './TopBar';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const isLogin = location.pathname === '/';
  
  // Estado para el menú de usuario
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const toggleUserMenu = () => setOpenUserMenu(!openUserMenu);  // Toggle para mostrar/ocultar el menú de usuario

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Menú lateral */}
      {!isLogin && <SideMenu openUserMenu={openUserMenu} toggleUserMenu={toggleUserMenu} />}

      {/* Topbar */}
      <div style={{ width: '100%' }}>
        <TopBar toggleUserMenu={toggleUserMenu} />
        {/* Contenido de las páginas */}
        <div
          style={{
            marginLeft: isLogin ? '0' : '250px',
            paddingRight: '20px',
            paddingLeft: '20px',
            backgroundColor: '#134ac1',
            height: '100%',
            overflowY: 'auto'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
