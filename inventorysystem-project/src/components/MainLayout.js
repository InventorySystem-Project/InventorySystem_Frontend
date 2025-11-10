import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import SideMenu from './SideMenu';
import TopBar from './TopBar';

const MainLayout = ({ children }) => {
    const location = useLocation();
    const isLogin = location.pathname === '/';

    const [openUserMenu, setOpenUserMenu] = useState(false);
    const toggleUserMenu = () => setOpenUserMenu(!openUserMenu);

    const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
    const toggleMenuCollapse = () => setIsMenuCollapsed(!isMenuCollapsed);

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            {/* Menú lateral */}
            {!isLogin && (
                <SideMenu 
                    openUserMenu={openUserMenu} 
                    toggleUserMenu={toggleUserMenu} 
                    isCollapsed={isMenuCollapsed}
                    toggleCollapse={toggleMenuCollapse}
                />
            )}

            {/* Contenedor para Topbar y Contenido de página */}
            <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column',
                overflow: 'hidden',
                marginLeft: !isLogin ? (isMenuCollapsed ? '75px' : '235px') : 0,
                transition: 'margin-left 0.3s ease-in-out',
            }}>
                {/* Topbar */}
                {!isLogin && (
                    <TopBar 
                        toggleUserMenu={toggleUserMenu} 
                        isCollapsed={isMenuCollapsed}
                        toggleCollapse={toggleMenuCollapse}
                    />
                )}
                
                {/* Contenido de las páginas (con scroll interno) */}
                <div
                    className="main-content-wrapper"
                    style={{
                        backgroundColor: '#f8f9fa',
                        flex: 1,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                    }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
};

export default MainLayout;