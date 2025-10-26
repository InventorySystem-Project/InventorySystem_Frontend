import React, { useState, useEffect } from 'react';
import { Typography, CircularProgress, Alert, Container, Tabs, Tab } from '@mui/material';
import { LifeBuoy, TriangleAlert, Bolt, Wrench } from 'lucide-react';

// Importa los componentes específicos para cada pestaña
import GestionIncidentes from './soporte/GestionIncidentes';
import GestionProblemas from './soporte/GestionProblemas';
import GestionCambios from './soporte/GestionCambios';

// Importa los servicios necesarios
import { getUsuarios } from '../services/UsuarioService';

// --- TabPanel y a11yProps ---
const TabPanel = (props) => {
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
    // Leer el estado inicial desde localStorage
    const [activeTab, setActiveTab] = useState(() => {
        const savedTab = localStorage.getItem('soporteCliente_activeTab');
        return savedTab ? parseInt(savedTab) : 0;
    });

    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Guardar la pestaña seleccionada en localStorage cada vez que cambie
    useEffect(() => {
        localStorage.setItem('soporteCliente_activeTab', activeTab.toString());
    }, [activeTab]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                setError('');
                const usuariosData = await getUsuarios();
                setUsuarios(usuariosData || []);
            } catch (err) {
                console.error("Error cargando datos iniciales para Soporte:", err);
                setError('No se pudieron cargar los datos necesarios. Intente recargar la página.');
                setUsuarios([]);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const handleChangeTab = (event, newValue) => {
        setActiveTab(newValue);
    };

    // --- Estados de Carga y Error ---
    if (loading) {
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
            <Container sx={{ mt: 4 }}>
                <Alert 
                    severity="error" 
                    sx={{ 
                        borderRadius: 2,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                >
                    {error}
                </Alert>
            </Container>
        );
    }
    // --- Fin Estados de Carga y Error ---

    return (
        <div className="container-general">
            {/* Título del Módulo */}
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <LifeBuoy size={32} style={{ color: '#3b82f6' }} /> 
                Módulo de Soporte al Cliente
            </h2>

            {/* Contenedor de Tabs */}
            <Container sx={{ 
                width: 'auto', 
                display: 'flex', 
                justifyContent: 'flex-start', 
                maxWidth: 'none', 
                marginLeft: '0', 
                paddingLeft: 'none' 
            }}>
                <div style={{
                    borderBottom: 0,
                    backgroundColor: '#f5f7fa',
                    borderRadius: '8px',
                    padding: '4px',
                    marginTop: '16px',
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    width: '100%'
                }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleChangeTab}
                        aria-label="Pestañas de soporte"
                        indicatorColor="primary"
                        textColor="primary"
                        variant="standard"
                        sx={{
                            minHeight: '36px',
                            '& .MuiTab-root': {
                                minHeight: '36px',
                                minWidth: '160px',
                                textTransform: 'none',
                                fontSize: '14px',
                                fontWeight: 500,
                                color: '#64748B',
                                transition: 'color 0.3s ease, background-color 0.3s ease',
                                '& svg': { 
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' 
                                },
                                '&:hover': {
                                    color: '#0F172A',
                                    backgroundColor: 'rgba(15, 23, 42, 0.04)',
                                },
                                '&.Mui-selected': {
                                    color: '#0F172A',
                                    fontWeight: 600,
                                    '& svg': { 
                                        color: '#3b82f6' 
                                    },
                                    '&:hover': {
                                        color: '#0F172A',
                                        backgroundColor: 'rgba(15, 23, 42, 0.04)',
                                    }
                                }
                            }
                        }}
                    >
                        <Tab 
                            label="Gestión de Incidentes" 
                            icon={<TriangleAlert size={18} />} 
                            iconPosition="start" 
                            {...a11yProps(0)} 
                        />
                        <Tab 
                            label="Gestión de Problemas" 
                            icon={<Wrench size={18} />} 
                            iconPosition="start" 
                            {...a11yProps(1)} 
                        />
                        <Tab 
                            label="Gestión de Cambios" 
                            icon={<Bolt size={18} />} 
                            iconPosition="start" 
                            {...a11yProps(2)} 
                        />
                    </Tabs>
                </div>
            </Container>

            {/* Paneles de Contenido */}
            <TabPanel value={activeTab} index={0}>
                <GestionIncidentes usuarios={usuarios} />
            </TabPanel>
            <TabPanel value={activeTab} index={1}>
                <GestionProblemas usuarios={usuarios} />
            </TabPanel>
            <TabPanel value={activeTab} index={2}>
                <GestionCambios usuarios={usuarios} />
            </TabPanel>
        </div>
    );
};

export default SoporteCliente;