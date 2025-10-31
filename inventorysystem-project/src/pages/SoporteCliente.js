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
import './StarRating.css'; // Importar estilos para las estrellas

// Importa los componentes específicos para cada pestaña
import GestionIncidentes from './soporte/GestionIncidentes';
import GestionProblemas from './soporte/GestionProblemas';
import GestionCambios from './soporte/GestionCambios';

// Importa los servicios necesarios
import { getUsuarios, getUsuariosAsignables } from '../services/UsuarioService';

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
};

function a11yProps(index) {
    return {
        id: `soporte-tab-${index}`,
        'aria-controls': `soporte-tabpanel-${index}`,
    };
}
// --- Fin TabPanel y a11yProps ---

const SoporteCliente = () => {
    // Estado y autenticación
    const { userId, role, isAuthenticated, loading: loadingAuth, hasRole } = useAuth();
    const [activeTab, setActiveTab] = useState(() => {
        const savedTab = localStorage.getItem('soporteCliente_activeTab');
        return savedTab ? parseInt(savedTab) : 0;
    });
    const [usuarios, setUsuarios] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState('');

    // Cargar datos iniciales
    useEffect(() => {
        if (isAuthenticated && !loadingAuth) {
            const fetchInitialData = async () => {
                try {
                    setLoadingData(true);
                    setError('');
                    // Solo cargar usuarios asignables si no es USER
                    if (role !== ROLES.USER) {
                        // Llamamos al nuevo servicio para obtener solo usuarios asignables
                        const usuariosData = await getUsuariosAsignables();
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

    // Guardar tab activa
    useEffect(() => {
        localStorage.setItem('soporteCliente_activeTab', activeTab.toString());
    }, [activeTab]);

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div>
                    <h2 style={{ marginBottom: '8px' }}>Módulo de Soporte al Cliente</h2>
                    <Typography variant="body2" color="text.secondary">
                        {role === ROLES.USER ? 
                            "Gestione sus tickets de soporte y solicitudes de cambio" :
                            "Administre incidentes, problemas y cambios del sistema"
                        }
                    </Typography>
                </div>
            </div>

            <Container sx={{ width: 'auto', display: 'flex', justifyContent: 'flex-start', maxWidth: 'none', marginLeft: '0', paddingLeft: 'none' }}>
                <Box sx={{ borderBottom: 0, backgroundColor: '#f5f7fa', borderRadius: '8px', padding: '4px', marginTop: 2, display: 'flex', justifyContent: 'flex-start', alignItems: 'center', width: '100%' }}>
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
                                '& svg': {
                                    marginRight: '8px',
                                    marginBottom: '0',
                                    color: '#64748B',
                                },
                                '&:hover': {
                                    color: '#0F172A',
                                    backgroundColor: 'rgba(15, 23, 42, 0.04)',
                                    '& svg': {
                                        color: '#3b82f6',
                                    }
                                },
                                '&.Mui-selected': {
                                    color: '#0F172A',
                                    fontWeight: 600,
                                    '& svg': {
                                        color: '#3b82f6'
                                    },
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
                            {...a11yProps(0)}
                        />
                        {hasRole([ROLES.ADMIN, ROLES.SOPORTE_N2]) && (
                            <Tab 
                                icon={<Wrench size={18} />}
                                label="Gestión de Problemas"
                                {...a11yProps(1)}
                            />
                        )}
                        {hasRole([ROLES.ADMIN, ROLES.GESTOR_CAMBIOS, ROLES.CAB_MEMBER, ROLES.PROJECT_MANAGER]) && (
                            <Tab 
                                icon={<Bolt size={18} />}
                                label="Gestión de Cambios"
                                {...a11yProps(2)}
                            />
                        )}
                    </Tabs>
                </Box>
            </Container>

            <div className="container" style={{ marginTop: '24px' }}>
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
            </div>
        </div>
    );
};

export default SoporteCliente;