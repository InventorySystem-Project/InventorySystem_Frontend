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
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' /* Previene el scroll en el body */ }}>
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
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
                    style={{
                        marginLeft: isLogin ? '0' : (isMenuCollapsed ? '95px' : '255px'),
                        // --- INICIO DE LA CORRECCIÓN ---
                        //padding: '20px', // Añadimos el padding aquí para consistencia
                        backgroundColor: '#f4f6f8', // Un color de fondo más suave
                        flex: 1, // Permite que este div ocupe todo el espacio vertical restante
                        overflowY: 'auto', // Habilita el scroll vertical SOLO para esta área
                        transition: 'margin-left 0.3s ease-in-out',
                    }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
};

export default MainLayout;