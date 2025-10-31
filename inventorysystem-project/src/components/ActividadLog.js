import React, { useState, useEffect } from 'react';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot, TimelineOppositeContent } from '@mui/lab';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { MessageSquare, CheckCircle } from 'lucide-react';
import { getActividades } from '../services/SoporteService';

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
    }, [ticketId]); // Se recarga si el ticketId cambia

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
        <Box sx={{ p: 2, maxHeight: '500px', overflowY: 'auto' }}>
            <Timeline position="alternate">
                {actividades.map((item, index) => {
                    const isComentario = item.tipo === 'comentario';
                    const color = isComentario ? '#607D8B' : '#009688';
                    
                    return (
                        <TimelineItem key={index}>
                            <TimelineOppositeContent color="textSecondary" sx={{ maxWidth: '120px' }}>
                                <Typography variant="caption">
                                    {new Date(item.fecha).toLocaleString('es-ES', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </Typography>
                            </TimelineOppositeContent>
                            <TimelineSeparator>
                                <TimelineDot sx={{ bgcolor: color, p: 1 }}>
                                    {isComentario ? (
                                        <MessageSquare size={16} color="white" />
                                    ) : (
                                        <CheckCircle size={16} color="white" />
                                    )}
                                </TimelineDot>
                                {index < actividades.length - 1 && <TimelineConnector />}
                            </TimelineSeparator>
                            <TimelineContent>
                                <Card elevation={2}>
                                    <CardContent>
                                        <Typography variant="subtitle2" fontWeight="bold">
                                            {item.usuarioNombre}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                            {item.descripcion}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </TimelineContent>
                        </TimelineItem>
                    );
                })}
            </Timeline>
        </Box>
    );
};

export default ActividadLog;
