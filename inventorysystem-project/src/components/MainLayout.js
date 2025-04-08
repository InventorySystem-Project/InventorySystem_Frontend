import React from 'react';
import { useLocation } from 'react-router-dom';
import SideMenu from './SideMenu';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const isLogin = location.pathname === '/';

  return (
    <div style={{ display: 'flex', height: '100vh' }}> {/* 👈 esto fuerza a ocupar todo el alto */}
      {!isLogin && <SideMenu />}
      <div
        style={{
          marginLeft: isLogin ? '0' : '250px',
          padding: '20px',
          width: '100%',
          backgroundColor: '#134ac1',
          overflowY: 'auto' // 👈 opcional para scroll si hay mucho contenido
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
