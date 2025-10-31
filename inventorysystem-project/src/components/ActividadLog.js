import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Divider } from '@mui/material';
import { User, MessageSquare, Settings, Clock } from 'lucide-react';
import { getActividades } from '../services/SoporteService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ActividadLog = ({ ticketId }) => {
    const [actividades, setActividades] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (ticketId) {
            setLoading(true);
            getActividades(ticketId)
                .then(data => {
                    setActividades(data || []);
                })
                .catch(error => {
                    console.error('Error al cargar actividades:', error);
                    setActividades([]);
                })
                .finally(() => setLoading(false));
        }
    }, [ticketId]);

    const getActivityIcon = (tipo) => {
        switch (tipo) {
            case 'comentario':
                return <MessageSquare size={16} />;
            case 'cambio_estado':
                return <Settings size={16} />;
            default:
                return <Clock size={16} />;
        }
    };

    const getActivityColor = (tipo) => {
        switch (tipo) {
            case 'comentario':
                return '#1976d2'; // Azul
            case 'cambio_estado':
                return '#f57c00'; // Naranja
            default:
                return '#9e9e9e'; // Gris
        }
    };

    const formatActivityDate = (dateString) => {
        try {
            const date = new Date(dateString);
            const dayMonth = format(date, 'EEE. dd MMM. yyyy', { locale: es });
            const time = format(date, 'HH:mm');
            return { dayMonth, time };
        } catch (error) {
            return { dayMonth: 'Fecha inválida', time: '' };
        }
    };

    if (!ticketId) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="textSecondary">
                    Guarde el ticket para ver las actividades.
                </Typography>
            </Box>
        );
    }
    
    if (loading) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="textSecondary">Cargando actividades...</Typography>
            </Box>
        );
    }

    if (actividades.length === 0) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="textSecondary">
                    No hay actividades registradas para este ticket.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2, maxHeight: '500px', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
            {actividades.map((item, index) => {
                const { dayMonth, time } = formatActivityDate(item.fecha);
                const iconColor = getActivityColor(item.tipo);
                
                return (
                    <Box key={index} sx={{ mb: 2 }}>
                        {/* Fecha del día */}
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mb: 1,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#666'
                        }}>
                            <Typography variant="caption" sx={{ 
                                fontSize: '0.75rem', 
                                fontWeight: 600, 
                                color: '#666',
                                textTransform: 'capitalize'
                            }}>
                                {dayMonth}
                            </Typography>
                        </Box>

                        {/* Actividad */}
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'flex-start', 
                            gap: 2,
                            position: 'relative',
                            pl: 2
                        }}>
                            {/* Línea vertical */}
                            {index < actividades.length - 1 && (
                                <Box sx={{
                                    position: 'absolute',
                                    left: '27px',
                                    top: '40px',
                                    bottom: '-16px',
                                    width: '2px',
                                    backgroundColor: '#e0e0e0'
                                }} />
                            )}

                            {/* Hora */}
                            <Typography variant="caption" sx={{ 
                                minWidth: '40px',
                                fontSize: '0.75rem',
                                color: '#666',
                                mt: 0.5
                            }}>
                                {time}
                            </Typography>

                            {/* Avatar/Icono */}
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                backgroundColor: iconColor,
                                color: 'white',
                                fontSize: '12px',
                                flexShrink: 0,
                                zIndex: 1
                            }}>
                                {getActivityIcon(item.tipo)}
                            </Box>

                            {/* Contenido de la actividad */}
                            <Box sx={{ 
                                flex: 1,
                                backgroundColor: 'white',
                                borderRadius: 2,
                                p: 2,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                border: '1px solid #e0e0e0'
                            }}>
                                {/* Header con usuario y hora específica */}
                                <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    mb: 1
                                }}>
                                    <Typography variant="subtitle2" sx={{ 
                                        fontWeight: 600,
                                        color: '#1976d2'
                                    }}>
                                        {item.usuarioNombre}
                                    </Typography>
                                    <Typography variant="caption" sx={{ 
                                        color: '#666',
                                        fontSize: '0.7rem'
                                    }}>
                                        {time}
                                    </Typography>
                                </Box>

                                {/* Descripción */}
                                <Typography variant="body2" sx={{ 
                                    color: '#333',
                                    lineHeight: 1.5,
                                    fontSize: '0.875rem'
                                }}>
                                    {item.descripcion}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
};

export default ActividadLog;
