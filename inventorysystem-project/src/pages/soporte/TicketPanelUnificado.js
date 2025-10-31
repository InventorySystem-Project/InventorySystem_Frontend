import React, { useState, useEffect } from 'react';
import { Button, Modal, Box, TextField, Select, MenuItem, InputLabel, FormControl, Typography, CircularProgress, Chip, IconButton, Divider, Card, CardContent, Tabs, Tab, ListSubheader, Rating } from '@mui/material';
import { X, Send, User, Clock, MessageSquare, Star } from 'lucide-react';
import { addComentario, getComentariosPorTicket, calificarTicket, getTicketById } from '../../services/SoporteService';
import { getRoles } from '../../services/RolService';
import { format } from 'date-fns';
import es from 'date-fns/locale/es';
import ActividadLog from '../../components/ActividadLog';
import { useModal } from '../../hooks/useModal';
import CustomModal from '../../components/CustomModal';

// Componente de estrellas para calificación
const StarRating = ({ value, onChange, selectedTicket, currentUser }) => {
    console.log('🌟 StarRating props completos:', {
        value,
        selectedTicket,
        currentUser,
        currentUserId: currentUser?.id
    });

    console.log('🎫 Ticket completo expandido:', selectedTicket);
    console.log('👤 Usuario del ticket expandido:', selectedTicket?.usuario);

    const isTicketResolved = selectedTicket && 
        (selectedTicket.estado === 'RESUELTO' || selectedTicket.estado === 'CERRADO');

    // Obtener datos del usuario creador del ticket
    const ticketCreatorId = selectedTicket?.usuarioReportaId || 
                           selectedTicket?.usuario?.id || 
                           selectedTicket?.usuarioId || 
                           selectedTicket?.creadorId ||
                           selectedTicket?.solicitanteId ||
                           selectedTicket?.user?.id;
    
    const ticketCreatorUsername = selectedTicket?.usuarioReportaUsername || 
                                 selectedTicket?.usuario?.username ||
                                 selectedTicket?.username;
    
    const currentUserId = currentUser?.id;

    // Verificar que el usuario actual es el creador/solicitante del ticket
    let isCreator = false;
    
    if (currentUserId && (ticketCreatorId || ticketCreatorUsername)) {
        // Comparar por username (el currentUserId es el username del usuario logueado)
        if (typeof currentUserId === 'string' && ticketCreatorUsername) {
            isCreator = currentUserId.toLowerCase() === ticketCreatorUsername.toLowerCase();
            console.log('🔍 Comparando por username:', {
                currentUserId: currentUserId.toLowerCase(),
                ticketCreatorUsername: ticketCreatorUsername.toLowerCase(),
                isEqual: isCreator
            });
        }
        // Fallback: comparar por ID si ambos son números
        else if (!isNaN(currentUserId) && !isNaN(ticketCreatorId)) {
            isCreator = Number(currentUserId) === Number(ticketCreatorId);
            console.log('🔍 Comparando por ID:', {
                currentUserId: Number(currentUserId),
                ticketCreatorId: Number(ticketCreatorId),
                isEqual: isCreator
            });
        }
    }
    
    console.log('🔐 Verificación de permisos:', {
        currentUserId,
        ticketCreatorId,
        ticketCreatorUsername,
        isCreator,
        canRate: isCreator && isTicketResolved
    });

    console.log('🔍 Análisis detallado:', {
        isTicketResolved,
        ticketState: selectedTicket?.estado,
        currentUserId: currentUserId,
        currentUserIdType: typeof currentUserId,
        ticketCreatorId: ticketCreatorId,
        ticketCreatorIdType: typeof ticketCreatorId,
        usuarioCompleto: selectedTicket?.usuario,
        isCreator: isCreator,
        comparisonResult: Number(currentUserId) === Number(ticketCreatorId),
        // Campos adicionales que pueden tener el ID del usuario
        allUserFields: {
            usuarioReportaId: selectedTicket?.usuarioReportaId,
            usuarioReportaUsername: selectedTicket?.usuarioReportaUsername,
            usuarioId: selectedTicket?.usuarioId,
            creadorId: selectedTicket?.creadorId,
            solicitanteId: selectedTicket?.solicitanteId,
            userId: selectedTicket?.userId
        }
    });

    if (!isTicketResolved) {
        console.log('❌ Ticket no está resuelto o cerrado, estado:', selectedTicket?.estado);
        return null;
    }

    if (!currentUserId) {
        console.log('❌ CurrentUserId faltante:', currentUserId);
        return (
            <Box sx={{ mt: 3, mb: 2 }}>
                <Typography variant="body2" color="error">
                    Error: No se pudo identificar al usuario actual
                </Typography>
            </Box>
        );
    }

    if (!ticketCreatorId) {
        console.log('❌ No se encontró el ID del creador del ticket');
        return (
            <Box sx={{ mt: 3, mb: 2 }}>
                <Typography variant="body2" color="error">
                    Error: No se pudo identificar al creador del ticket
                </Typography>
            </Box>
        );
    }

    // Solo el creador del ticket puede calificar cuando esté resuelto
    const canRate = isCreator && isTicketResolved;

    return (
        <Box sx={{ mt: 3, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                {canRate ? 'Tu Calificación:' : 'Calificación del Solicitante:'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Rating
                    name="ticket-rating"
                    value={value || 0}
                    onChange={(event, newValue) => {
                        console.log('⭐ Calificación cambiada:', newValue);
                        if (canRate && onChange) {
                            onChange(newValue);
                        }
                    }}
                    size="large"
                    readOnly={!canRate}
                    precision={1}
                />
                <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                    {value ? `${value}/5` : 'Sin calificar'}
                </Typography>
            </Box>
            {!canRate && isTicketResolved && (
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                    Solo el solicitante puede calificar este ticket
                </Typography>
            )}
            {!isTicketResolved && (
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                    El ticket debe estar resuelto para poder calificarlo
                </Typography>
            )}
        </Box>
    );
};

// Componente unificado para crear/ver ticket (diseño de 2 columnas)
const TicketPanelUnificado = ({ 
    open, 
    onClose, 
    ticketData, 
    setTicketData, 
    usuarios, 
    isEditing, 
    currentUserId, 
    calificacion, 
    setCalificacion, 
    onSave, 
    onAssignResponsible 
}) => {
    // Debug inmediato del localStorage
    console.log('🚀 INICIO TicketPanelUnificado - localStorage check:');
    console.log('- localStorage.userId:', localStorage.getItem('userId'));
    console.log('- currentUserId prop:', currentUserId);
    console.log('- ticketData recibido:', ticketData);
    const [comentarios, setComentarios] = useState([]);
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [loadingComentarios, setLoadingComentarios] = useState(false);
    const [rolesMap, setRolesMap] = useState({});
    const [loadingRoles, setLoadingRoles] = useState(false);
    const [currentTab, setCurrentTab] = useState(0);
    const [selectedRolId, setSelectedRolId] = useState('');
    const [realCurrentUserId, setRealCurrentUserId] = useState(null);
    
    // Hook para modals
    const { modalConfig, showError, hideModal } = useModal();

    // Obtener el usuario actual del localStorage
    useEffect(() => {
        console.log('🔍 Revisando localStorage completo:');
        console.log('- userId:', localStorage.getItem('userId'));
        console.log('- token:', localStorage.getItem('token') ? 'Existe' : 'No existe');
        console.log('- Todas las keys:', Object.keys(localStorage));
        
        const userId = localStorage.getItem('userId');
        const userIdNumber = userId ? parseInt(userId, 10) : null;
        console.log('👤 Usuario desde localStorage (raw):', userId);
        console.log('👤 Usuario parseado a número:', userIdNumber);
        console.log('👤 Es válido?:', !isNaN(userIdNumber) && userIdNumber > 0);
        
        if (!isNaN(userIdNumber) && userIdNumber > 0) {
            setRealCurrentUserId(userIdNumber);
        } else {
            console.error('❌ UserId inválido en localStorage:', userId);
            // Intentar con otras posibles keys
            const alternativeKeys = ['user_id', 'id', 'currentUserId'];
            let foundUserId = null;
            
            for (const key of alternativeKeys) {
                const altUserId = localStorage.getItem(key);
                console.log(`🔍 Probando key alternativa "${key}":`, altUserId);
                if (altUserId && !isNaN(parseInt(altUserId, 10))) {
                    foundUserId = parseInt(altUserId, 10);
                    console.log(`✅ Usando userId desde "${key}":`, altUserId);
                    break;
                }
            }
            
            if (!foundUserId && currentUserId && !isNaN(currentUserId)) {
                console.log(`🔄 Usando currentUserId de props:`, currentUserId);
                foundUserId = currentUserId;
            }
            
            setRealCurrentUserId(foundUserId);
        }
    }, []);

    // Resetear tab cuando se abre el modal
    useEffect(() => {
        if (open) {
            setCurrentTab(0);
            setSelectedRolId('');
        }
    }, [open]);

    // Pre-seleccionar el rol cuando hay un responsable asignado
    useEffect(() => {
        if (ticketData?.responsable?.id && usuarios.length > 0 && Object.keys(rolesMap).length > 0) {
            const responsable = usuarios.find(u => u.id === ticketData.responsable.id);
            if (responsable && responsable.rolId) {
                setSelectedRolId(responsable.rolId);
            }
        }
    }, [ticketData?.responsable?.id, usuarios, rolesMap]);

    // Sincronizar calificación cuando cambia ticketData
    useEffect(() => {
        if (ticketData?.calificacion && ticketData.calificacion !== calificacion) {
            console.log('🔄 Sincronizando calificación desde ticketData:', ticketData.calificacion);
            setCalificacion(ticketData.calificacion);
        }
    }, [ticketData?.calificacion, calificacion, setCalificacion]);

    // Obtener roles únicos de los usuarios
    const getUniqueRoles = () => {
        const rolesSet = new Set();
        usuarios.forEach(usuario => {
            if (usuario.rolId) {
                rolesSet.add(usuario.rolId);
            }
        });
        return Array.from(rolesSet).map(rolId => ({
            id: rolId,
            nombre: rolesMap[rolId] || 'Sin rol'
        })).sort((a, b) => a.nombre.localeCompare(b.nombre));
    };

    // Obtener usuarios filtrados por rol seleccionado
    const getUsuariosPorRol = (rolId) => {
        if (!rolId) return [];
        return usuarios
            .filter(usuario => usuario.rolId === rolId)
            .sort((a, b) => `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`));
    };

    // Cargar datos completos del ticket y comentarios cuando se abre el modal en modo edición
    useEffect(() => {
        const fetchTicketData = async () => {
            if (open && isEditing && ticketData?.id) {
                setLoadingComentarios(true);
                try {
                    console.log('🔄 Cargando datos completos del ticket:', ticketData.id);
                    
                    // Cargar datos completos del ticket
                    const ticketCompleto = await getTicketById(ticketData.id);
                    console.log('📥 Ticket completo recibido:', ticketCompleto);
                    
                    // Actualizar los datos del ticket con la información completa
                    if (setTicketData && ticketCompleto) {
                        setTicketData(prev => ({
                            ...prev,
                            ...ticketCompleto
                        }));
                    }
                    
                    // Cargar comentarios
                    const comentariosData = await getComentariosPorTicket(ticketData.id);
                    setComentarios(comentariosData || []);
                } catch (error) {
                    console.error('Error al cargar datos del ticket:', error);
                } finally {
                    setLoadingComentarios(false);
                }
            }
        };
        
        fetchTicketData();
    }, [open, isEditing, ticketData?.id]);

    // Cargar roles
    useEffect(() => {
        const fetchRoles = async () => {
            if (open) {
                setLoadingRoles(true);
                try {
                    const rolesData = await getRoles();
                    const map = {};
                    rolesData.forEach(rol => {
                        map[rol.id] = rol.rol || rol.nombreRol || 'Sin rol';
                    });
                    setRolesMap(map);
                } catch (error) {
                    console.error('Error al cargar roles:', error);
                } finally {
                    setLoadingRoles(false);
                }
            }
        };
        fetchRoles();
    }, [open]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTicketData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddComentario = async () => {
        console.log('🔵 handleAddComentario ejecutado');
        console.log('Comentario:', nuevoComentario);
        console.log('Ticket ID:', ticketData?.id);
        
        if (!nuevoComentario.trim()) {
            console.log('⚠️ Comentario vacío');
            return;
        }
        
        if (!ticketData?.id) {
            console.log('⚠️ No hay ticket ID');
            return;
        }
        
        try {
            console.log('📤 Enviando comentario...');
            await addComentario(ticketData.id, { texto: nuevoComentario });
            console.log('✅ Comentario enviado exitosamente');
            setNuevoComentario('');
            // Recargar comentarios
            const data = await getComentariosPorTicket(ticketData.id);
            console.log('📥 Comentarios recargados:', data);
            setComentarios(data || []);
        } catch (error) {
            console.error('❌ Error al agregar comentario:', error);
            showError(`Error al agregar comentario: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleRatingChange = async (newRating) => {
        console.log('⭐ Cambiando calificación a:', newRating);
        console.log('🎫 Ticket ID:', ticketData?.id);
        
        if (!ticketData?.id) {
            console.error('❌ No hay ID de ticket para calificar');
            showError('No se puede calificar - ID del ticket no disponible');
            return;
        }

        if (newRating === null || newRating === 0) {
            console.log('⚠️ Calificación inválida o cero, no se guarda');
            return;
        }

        try {
            console.log('📤 Enviando calificación al servidor...');
            await calificarTicket(ticketData.id, newRating);
            console.log('✅ Calificación guardada exitosamente');
            
            // Actualizar el estado local
            setCalificacion(newRating);
            if (setTicketData) {
                setTicketData(prev => ({
                    ...prev,
                    calificacion: newRating
                }));
            }
        } catch (error) {
            console.error('❌ Error al calificar ticket:', error);
            showError(`Error al guardar calificación: ${error.response?.data?.message || error.message}`);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: es });
        } catch {
            return dateString;
        }
    };

    const getPrioridadColor = (prioridad) => {
        switch (prioridad) {
            case 'CRITICA': return '#dc2626';
            case 'ALTA': return '#f59e0b';
            case 'MEDIA': return '#3b82f6';
            case 'BAJA': return '#10b981';
            default: return '#6b7280';
        }
    };

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'ABIERTO': return '#3b82f6';
            case 'EN_PROCESO': return '#f59e0b';
            case 'RESUELTO': return '#10b981';
            case 'CERRADO': return '#6b7280';
            default: return '#6b7280';
        }
    };

    if (!open) return null;

    return (
        <>
            <Modal 
                open={open} 
                onClose={onClose} 
                style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    zIndex: 1300,
                    padding: '20px'
                }}
            >
            <Box style={{ 
                background: '#fff', 
                borderRadius: '10px', 
                width: isEditing ? '90%' : '700px',
                maxWidth: isEditing ? '1200px' : '700px',
                height: isEditing ? '85vh' : 'auto',
                maxHeight: '85vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
                {/* Header */}
                <Box style={{ 
                    padding: '20px 30px', 
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#f9fafb'
                }}>
                    <div>
                        <Typography variant="h5" style={{ fontWeight: 600, color: '#0F172A' }}>
                            {isEditing ? `Ticket ${ticketData?.formattedId || ticketData?.id || ''}` : 'Nuevo Ticket'}
                        </Typography>
                        {isEditing && ticketData?.fechaCreacion && (
                            <Typography variant="caption" color="textSecondary">
                                Creado el {formatDate(ticketData.fechaCreacion)}
                            </Typography>
                        )}
                    </div>
                    <IconButton onClick={onClose}>
                        <X />
                    </IconButton>
                </Box>

                {/* Contenido */}
                {isEditing ? (
                    // Modo Edición: Layout con Tabs
                    <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
                        {/* Tabs Navigation */}
                        <Box style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                            <Tabs 
                                value={currentTab} 
                                onChange={(e, newValue) => setCurrentTab(newValue)}
                                textColor="primary"
                                indicatorColor="primary"
                            >
                                <Tab label="Detalles" />
                                <Tab label="Actividad" />
                            </Tabs>
                        </Box>

                        {/* Tab Content */}
                        {currentTab === 0 ? (
                            // Tab 1: Detalles - Layout de 2 columnas (contenido original)
                            <Box style={{ flex: 1, display: 'flex', overflow: 'hidden', width: '100%' }}>
                                {/* COLUMNA IZQUIERDA - Descripción y Comentarios */}
                                <Box style={{ 
                                    flex: 1,
                                    minWidth: 0,
                                    padding: '30px', 
                                    overflowY: 'auto',
                                    borderRight: '1px solid #e5e7eb',
                                    backgroundColor: '#fff'
                                }}>
                            {/* Descripción */}
                            <Typography variant="h6" style={{ marginBottom: '15px', fontWeight: 600, color: '#0F172A' }}>
                                Descripción
                            </Typography>
                            <Box style={{ 
                                padding: '15px',
                                backgroundColor: '#f9fafb',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                                marginBottom: '30px',
                                whiteSpace: 'pre-wrap'
                            }}>
                                <Typography variant="body1">
                                    {ticketData?.descripcion || 'Sin descripción'}
                                </Typography>
                            </Box>

                            {/* Solución */}
                            <Typography variant="h6" style={{ marginBottom: '15px', fontWeight: 600, color: '#0F172A' }}>
                                Solución Aplicada
                            </Typography>
                            <TextField 
                                name="solucion"
                                value={ticketData?.solucion || ''}
                                onChange={handleInputChange}
                                fullWidth
                                multiline
                                rows={4}
                                variant="outlined"
                                placeholder="Describe la solución aplicada..."
                                style={{ marginBottom: '30px' }}
                            />

                            {/* Comentarios */}
                            <Divider style={{ margin: '20px 0' }} />
                            <Typography variant="h6" style={{ marginBottom: '15px', fontWeight: 600, color: '#0F172A' }}>
                                <MessageSquare size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                Conversación
                            </Typography>

                            {/* Lista de comentarios */}
                            <div style={{ 
                                maxHeight: '300px', 
                                overflowY: 'auto', 
                                marginBottom: '20px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                padding: '15px',
                                backgroundColor: '#fafafa'
                            }}>
                                {loadingComentarios && <CircularProgress size={24} />}
                                {!loadingComentarios && comentarios.length === 0 && (
                                    <Typography color="textSecondary" style={{ textAlign: 'center', padding: '20px' }}>
                                        No hay comentarios aún
                                    </Typography>
                                )}
                                {!loadingComentarios && comentarios.map(c => (
                                    <Card key={c.id} style={{ marginBottom: '12px', backgroundColor: '#fff' }} elevation={1}>
                                        <CardContent style={{ padding: '12px' }}>
                                            <Typography variant="body2" style={{ whiteSpace: 'pre-wrap', marginBottom: '8px' }}>
                                                {c.texto}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                <User size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                                {c.usuarioNombre} • {formatDate(c.fecha)}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Campo para nuevo comentario */}
                            <Box style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                <TextField
                                    value={nuevoComentario}
                                    onChange={(e) => setNuevoComentario(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleAddComentario();
                                        }
                                    }}
                                    placeholder="Escribe un comentario..."
                                    fullWidth
                                    multiline
                                    rows={2}
                                    variant="outlined"
                                />
                                <Button 
                                    variant="contained" 
                                    onClick={() => {
                                        console.log('🖱️ Click en botón de enviar comentario');
                                        handleAddComentario();
                                    }}
                                    disabled={!nuevoComentario.trim()}
                                    style={{ height: '56px', minWidth: '56px' }}
                                    color="primary"
                                >
                                    <Send size={18} />
                                </Button>
                            </Box>

                            {/* Calificación */}
                            {(ticketData?.estado === 'RESUELTO' || ticketData?.estado === 'CERRADO') && (
                                <>
                                    <Divider style={{ margin: '30px 0' }} />
                                    <StarRating
                                        value={ticketData?.calificacion || calificacion || 0}
                                        onChange={handleRatingChange}
                                        selectedTicket={ticketData}
                                        currentUser={{ 
                                            id: realCurrentUserId || currentUserId || localStorage.getItem('userId')
                                        }}
                                    />
                                </>
                            )}
                        </Box>

                        {/* COLUMNA DERECHA - Propiedades */}
                        <Box style={{ 
                            width: '400px',
                            flexShrink: 0,
                            padding: '30px', 
                            overflowY: 'auto',
                            backgroundColor: '#fafafa'
                        }}>
                            <Typography variant="h6" style={{ marginBottom: '20px', fontWeight: 600, color: '#0F172A' }}>
                                Propiedades
                            </Typography>

                            {/* Prioridad */}
                            <FormControl fullWidth margin="normal" variant="outlined" size="small">
                                <InputLabel>Prioridad</InputLabel>
                                <Select
                                    name="prioridad"
                                    value={ticketData?.prioridad || ''}
                                    onChange={handleInputChange}
                                    label="Prioridad"
                                >
                                    <MenuItem value="CRITICA">
                                        <Chip label="Crítica" size="small" style={{ backgroundColor: getPrioridadColor('CRITICA'), color: '#fff' }} />
                                    </MenuItem>
                                    <MenuItem value="ALTA">
                                        <Chip label="Alta" size="small" style={{ backgroundColor: getPrioridadColor('ALTA'), color: '#fff' }} />
                                    </MenuItem>
                                    <MenuItem value="MEDIA">
                                        <Chip label="Media" size="small" style={{ backgroundColor: getPrioridadColor('MEDIA'), color: '#fff' }} />
                                    </MenuItem>
                                    <MenuItem value="BAJA">
                                        <Chip label="Baja" size="small" style={{ backgroundColor: getPrioridadColor('BAJA'), color: '#fff' }} />
                                    </MenuItem>
                                </Select>
                            </FormControl>

                            {/* Estado */}
                            <FormControl fullWidth margin="normal" variant="outlined" size="small">
                                <InputLabel>Estado</InputLabel>
                                <Select
                                    name="estado"
                                    value={ticketData?.estado || ''}
                                    onChange={handleInputChange}
                                    label="Estado"
                                >
                                    <MenuItem value="ABIERTO">
                                        <Chip label="Abierto" size="small" style={{ backgroundColor: getEstadoColor('ABIERTO'), color: '#fff' }} />
                                    </MenuItem>
                                    <MenuItem value="EN_PROCESO">
                                        <Chip label="En Proceso" size="small" style={{ backgroundColor: getEstadoColor('EN_PROCESO'), color: '#fff' }} />
                                    </MenuItem>
                                    <MenuItem value="RESUELTO">
                                        <Chip label="Resuelto" size="small" style={{ backgroundColor: getEstadoColor('RESUELTO'), color: '#fff' }} />
                                    </MenuItem>
                                    <MenuItem value="CERRADO">
                                        <Chip label="Cerrado" size="small" style={{ backgroundColor: getEstadoColor('CERRADO'), color: '#fff' }} />
                                    </MenuItem>
                                </Select>
                            </FormControl>

                            {/* Tipo */}
                            <FormControl fullWidth margin="normal" variant="outlined" size="small">
                                <InputLabel>Tipo</InputLabel>
                                <Select
                                    name="tipo"
                                    value={ticketData?.tipo || 'INCIDENTE'}
                                    onChange={handleInputChange}
                                    label="Tipo"
                                >
                                    <MenuItem value="INCIDENTE">Incidente</MenuItem>
                                    <MenuItem value="REQUERIMIENTO">Requerimiento</MenuItem>
                                    <MenuItem value="SOLICITUD">Solicitud</MenuItem>
                                    <MenuItem value="CONSULTA">Consulta</MenuItem>
                                </Select>
                            </FormControl>

                            {/* Rol */}
                            <FormControl fullWidth margin="normal" variant="outlined" size="small">
                                <InputLabel>Rol</InputLabel>
                                <Select
                                    value={selectedRolId}
                                    onChange={(e) => {
                                        const newRolId = e.target.value;
                                        setSelectedRolId(newRolId);
                                        // Limpiar la selección de agente cuando se cambia el rol
                                        if (ticketData?.responsable?.id) {
                                            setTicketData(prev => ({
                                                ...prev,
                                                responsable: { id: '', nombre: '', apellido: '' }
                                            }));
                                        }
                                    }}
                                    label="Rol"
                                    disabled={loadingRoles}
                                >
                                    <MenuItem value=""><em>Seleccionar rol</em></MenuItem>
                                    {getUniqueRoles().map(rol => (
                                        <MenuItem key={rol.id} value={rol.id}>
                                            {rol.nombre}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Agente */}
                            <FormControl fullWidth margin="normal" variant="outlined" size="small">
                                <InputLabel>Agente</InputLabel>
                                <Select
                                    value={ticketData?.responsable?.id || ''}
                                    onChange={(e) => {
                                        const newResponsableId = e.target.value;
                                        if (newResponsableId && onAssignResponsible) {
                                            onAssignResponsible(ticketData.id, newResponsableId);
                                        }
                                    }}
                                    label="Agente"
                                    disabled={loadingRoles || !selectedRolId}
                                >
                                    <MenuItem value=""><em>Sin asignar</em></MenuItem>
                                    {getUsuariosPorRol(selectedRolId).map(usuario => (
                                        <MenuItem key={usuario.id} value={usuario.id}>
                                            {`${usuario.nombre} ${usuario.apellido}`}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Información adicional */}
                            <Divider style={{ margin: '30px 0' }} />
                            <Typography variant="subtitle2" style={{ marginBottom: '15px', fontWeight: 600, color: '#6b7280' }}>
                                Información del Ticket
                            </Typography>

                            {/* Creado por */}
                            <Box style={{ marginBottom: '15px' }}>
                                <Typography variant="caption" color="textSecondary" style={{ display: 'block', marginBottom: '5px' }}>
                                    Creado por
                                </Typography>
                                <Typography variant="body2">
                                    {ticketData?.usuario?.nombre || 'N/A'} {ticketData?.usuario?.apellido || ''}
                                </Typography>
                            </Box>

                            {/* Duración */}
                            {ticketData?.duracionAtencionMinutos != null && (
                                <Box style={{ marginBottom: '15px' }}>
                                    <Typography variant="caption" color="textSecondary" style={{ display: 'block', marginBottom: '5px' }}>
                                        <Clock size={14} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                                        Duración de atención
                                    </Typography>
                                    <Typography variant="body2">
                                        {ticketData.duracionAtencionMinutos} minutos
                                    </Typography>
                                </Box>
                            )}

                            {/* Fechas */}
                            {ticketData?.fechaInicioAtencion && (
                                <Box style={{ marginBottom: '15px' }}>
                                    <Typography variant="caption" color="textSecondary" style={{ display: 'block', marginBottom: '5px' }}>
                                        Inicio de atención
                                    </Typography>
                                    <Typography variant="body2">
                                        {formatDate(ticketData.fechaInicioAtencion)}
                                    </Typography>
                                </Box>
                            )}

                            {ticketData?.fechaResolucion && (
                                <Box style={{ marginBottom: '15px' }}>
                                    <Typography variant="caption" color="textSecondary" style={{ display: 'block', marginBottom: '5px' }}>
                                        Fecha de resolución
                                    </Typography>
                                    <Typography variant="body2">
                                        {formatDate(ticketData.fechaResolucion)}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                        ) : (
                            // Tab 2: Actividad - Mostrar log de actividades
                            <Box style={{ flex: 1, overflow: 'hidden' }}>
                                <ActividadLog ticketId={ticketData?.id} />
                            </Box>
                        )}
                    </Box>
                ) : (
                    // Modo Creación: Formulario simple
                    <Box style={{ padding: '30px', overflowY: 'auto' }}>
                        <TextField 
                            label="Descripción del Incidente"
                            name="descripcion"
                            value={ticketData?.descripcion || ''}
                            onChange={handleInputChange}
                            fullWidth
                            multiline
                            rows={6}
                            variant="outlined"
                            placeholder="Describe el incidente..."
                            margin="normal"
                            required
                        />

                        <FormControl fullWidth margin="normal" variant="outlined">
                            <InputLabel>Prioridad</InputLabel>
                            <Select
                                name="prioridad"
                                value={ticketData?.prioridad || 'MEDIA'}
                                onChange={handleInputChange}
                                label="Prioridad"
                            >
                                <MenuItem value="CRITICA">Crítica</MenuItem>
                                <MenuItem value="ALTA">Alta</MenuItem>
                                <MenuItem value="MEDIA">Media</MenuItem>
                                <MenuItem value="BAJA">Baja</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth margin="normal" variant="outlined">
                            <InputLabel>Tipo</InputLabel>
                            <Select
                                name="tipo"
                                value={ticketData?.tipo || 'INCIDENTE'}
                                onChange={handleInputChange}
                                label="Tipo"
                            >
                                <MenuItem value="INCIDENTE">Incidente</MenuItem>
                                <MenuItem value="REQUERIMIENTO">Requerimiento</MenuItem>
                                <MenuItem value="SOLICITUD">Solicitud</MenuItem>
                                <MenuItem value="CONSULTA">Consulta</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                )}

                {/* Footer con botones */}
                <Box style={{ 
                    padding: '20px 30px', 
                    borderTop: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '10px',
                    backgroundColor: '#f9fafb'
                }}>
                    <Button onClick={onClose} variant="outlined">
                        Cancelar
                    </Button>
                    <Button onClick={onSave} variant="contained" color="primary">
                        {isEditing ? 'Actualizar Ticket' : 'Crear Ticket'}
                    </Button>
                </Box>
            </Box>
            </Modal>
            
            <CustomModal config={modalConfig} onClose={hideModal} />
        </>
    );
};

export default TicketPanelUnificado;
