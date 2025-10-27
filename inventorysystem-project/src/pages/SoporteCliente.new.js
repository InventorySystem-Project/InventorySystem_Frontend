import React, { useState, useEffect } from 'react';
import {
    Typography,
    CircularProgress,
    Alert,
    Container,
    Tabs,
    Tab,
    Box,
    Button,
    Modal
} from '@mui/material';
import { LifeBuoy, TriangleAlert, Wrench, Bolt, Plus } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { ROLES } from '../constants/roles';

// Importa los componentes específicos para cada pestaña
import GestionIncidentes from './soporte/GestionIncidentes';
import GestionProblemas from './soporte/GestionProblemas';
import GestionCambios from './soporte/GestionCambios';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`soporte-tabpanel-${index}`}
            aria-labelledby={`soporte-tab-${index}`}
            {...other}
        >
            {value === index && (
                <div style={{ paddingTop: '20px' }}>
                    {children}
                </div>
            )}
        </div>
    );
}

const SoporteCliente = () => {
    const { userId, role, isAuthenticated, loading: loadingAuth, hasRole } = useAuth();
    
    // Estado para las pestañas
    const [activeTab, setActiveTab] = useState(() => {
        const savedTab = localStorage.getItem('soporteCliente_activeTab');
        return savedTab ? parseInt(savedTab) : 0;
    });

    const [usuarios, setUsuarios] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState('');

    // Persistencia de la pestaña activa
    useEffect(() => {
        localStorage.setItem('soporteCliente_activeTab', activeTab.toString());
    }, [activeTab]);

    // Carga inicial de datos
    useEffect(() => {
        if (isAuthenticated && !loadingAuth) {
            const fetchInitialData = async () => {
                try {
                    setLoadingData(true);
                    setError('');
                    if (role !== ROLES.USER) {
                        const usuariosData = await getUsuarios();
                        setUsuarios(usuariosData || []);
                    }
                } catch (err) {
                    console.error("Error cargando datos para Soporte:", err);
                    setError('No se pudieron cargar los datos necesarios.');
                    setUsuarios([]);
                } finally {
                    setLoadingData(false);
                }
            };
            fetchInitialData();
        } else if (!loadingAuth && !isAuthenticated) {
            setError("Acceso no autorizado. Por favor, inicie sesión.");
            setLoadingData(false);
        }
    }, [isAuthenticated, loadingAuth, role]);

    const handleChangeTab = (event, newValue) => {
        setActiveTab(newValue);
    };

    if (loadingAuth || loadingData) {
        return (
            <Container sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '80vh',
                flexDirection: 'column',
                gap: 2
            }}>
                <CircularProgress size={48} thickness={4} />
                <Typography variant="body1" color="text.secondary">
                    Cargando módulo de soporte...
                </Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        <div className="container-general">
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                width: '100%',
                marginBottom: '24px'
            }}>
                <Box>
                    <Typography variant="h5" sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        fontWeight: 600,
                        color: '#0F172A'
                    }}>
                        <LifeBuoy size={24} /> 
                        Módulo de Soporte al Cliente
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {role === ROLES.USER ? 
                            "Gestione sus tickets de soporte y solicitudes de cambio" :
                            "Administre incidentes, problemas y cambios del sistema"
                        }
                    </Typography>
                </Box>
                {/* El botón podría agregarse aquí si es necesario */}
            </div>

            <Container sx={{ 
                width: 'auto', 
                display: 'flex', 
                justifyContent: 'flex-start', 
                maxWidth: 'none', 
                marginLeft: '0', 
                paddingLeft: 'none' 
            }}>
                <Box sx={{ 
                    borderBottom: 0, 
                    backgroundColor: '#f5f7fa', 
                    borderRadius: '8px', 
                    padding: '4px', 
                    marginTop: 2, 
                    display: 'flex', 
                    justifyContent: 'flex-start', 
                    alignItems: 'center', 
                    width: '100%',
                }}>
                    <Tabs 
                        value={activeTab} 
                        onChange={handleChangeTab} 
                        aria-label="pestañas de soporte"
                        indicatorColor="primary"
                        textColor="primary"
                        variant="standard"
                        sx={{
                            minHeight: '36px',
                            '& .MuiTab-root': {
                                minHeight: '36px',
                                textTransform: 'none',
                                fontSize: '14px',
                                fontWeight: 500,
                                color: '#64748B',
                                transition: 'color 0.3s ease, background-color 0.3s ease',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 1,
                                '& svg': { 
                                    marginRight: '4px',
                                    marginBottom: '0'
                                },
                                '&:hover': {
                                    color: '#0F172A',
                                    backgroundColor: 'rgba(15, 23, 42, 0.04)',
                                },
                                '&.Mui-selected': {
                                    color: '#0F172A',
                                    fontWeight: 600,
                                    '& svg': { color: '#3b82f6' },
                                    '&:hover': {
                                        backgroundColor: 'rgba(15, 23, 42, 0.04)',
                                    }
                                }
                            }
                        }}
                    >
                        <Tab 
                            icon={<TriangleAlert size={18} />}
                            label="Gestión de Incidentes"
                        />
                        {hasRole([ROLES.ADMIN, ROLES.SOPORTE_N2]) && (
                            <Tab 
                                icon={<Wrench size={18} />}
                                label="Gestión de Problemas"
                            />
                        )}
                        {hasRole([ROLES.ADMIN, ROLES.GESTOR_CAMBIOS, ROLES.CAB_MEMBER, ROLES.PROJECT_MANAGER]) && (
                            <Tab 
                                icon={<Bolt size={18} />}
                                label="Gestión de Cambios"
                            />
                        )}
                    </Tabs>
                </Box>
            </Container>

            <Box sx={{ mt: 3 }}>
                <TabPanel value={activeTab} index={0}>
                    <GestionIncidentes 
                        usuarios={usuarios}
                        currentUserRole={role}
                        currentUserId={userId}
                    />
                </TabPanel>

                {hasRole([ROLES.ADMIN, ROLES.SOPORTE_N2]) && (
                    <TabPanel value={activeTab} index={1}>
                        <GestionProblemas 
                            usuarios={usuarios}
                            currentUserRole={role}
                            currentUserId={userId}
                        />
                    </TabPanel>
                )}

                {hasRole([ROLES.ADMIN, ROLES.GESTOR_CAMBIOS, ROLES.CAB_MEMBER, ROLES.PROJECT_MANAGER]) && (
                    <TabPanel value={activeTab} index={2}>
                        <GestionCambios 
                            usuarios={usuarios}
                            currentUserRole={role}
                            currentUserId={userId}
                        />
                    </TabPanel>
                )}
            </Box>
        </div>
    );
};

export default SoporteCliente;