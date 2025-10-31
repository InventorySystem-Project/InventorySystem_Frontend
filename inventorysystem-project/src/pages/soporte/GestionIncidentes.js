import React, { useState, useEffect } from 'react';
import { Button, Modal, Box, TextField, Table, TableBody, TableCell, TableHead, TableRow, Pagination, Select, MenuItem, InputLabel, FormControl, Typography, CircularProgress, Alert, Chip, IconButton, Tooltip as MuiTooltip, Divider, Card, CardContent } from '@mui/material';
import { Plus, Edit, Trash2, UserPlus, MessageSquare, X, Send, User, Clock, AlertCircle } from 'lucide-react';
import { getTickets, addTicket, updateTicket, deleteTicket, asignarTicket, cambiarEstadoTicket, addComentario, getComentariosPorTicket, calificarTicket } from '../../services/SoporteService';
import { getRoles } from '../../services/RolService';
import { format } from 'date-fns';
import es from 'date-fns/locale/es';
import TicketPanelUnificado from './TicketPanelUnificado';

// Componente de estrellas para calificación
const StarRating = ({ value, onChange, selectedTicket, currentUser }) => {
    const [hover, setHover] = useState(0);

    // --- INICIO DE LA LÓGICA CORREGIDA ---

    // 1. Verificar si el ticket está en estado final
    const isTicketResolved = selectedTicket && 
        (selectedTicket.estado === 'RESUELTO' || selectedTicket.estado === 'CERRADO');

    // 2. Verificar si el usuario actual es el creador del ticket.
    //    Usamos '==' (en lugar de '===') para comparar flexiblemente (ej. 5 == "5")
    //    También nos aseguramos que 'currentUser' y 'selectedTicket.usuario' existan.
    const isCreator = currentUser && 
                      selectedTicket && 
                      selectedTicket.usuario && 
                      (currentUser.id == selectedTicket.usuario.id);

    // 3. El usuario solo puede calificar si es el CREADOR.
    const canRate = isCreator;

    // --- FIN DE LA LÓGICA CORREGIDA ---

    // No mostrar el componente en absoluto si el ticket no está resuelto.
    if (!isTicketResolved) {
        return null;
    }

    // Si está resuelto, lo mostramos, pero lo deshabilitamos si no es el creador.
    const isDisabled = !canRate;

    return (
        <div className="star-rating" style={{ marginTop: '20px', marginBottom: '15px' }}>
            <label>Tu Calificación:</label>
            {[...Array(5)].map((star, index) => {
                index += 1;
                return (
                    <button
                        type="button"
                        key={index}
                        className={index <= (hover || value) ? "on" : "off"}
                        onClick={() => !isDisabled && onChange(index)}
                        onMouseEnter={() => !isDisabled && setHover(index)}
                        onMouseLeave={() => !isDisabled && setHover(value)}
                        disabled={isDisabled}
                        title={isDisabled ? "Solo el creador del ticket puede calificar" : `${index} estrellas`}
                    >
                        <span className="star">&#9733;</span>
                    </button>
                );
            })}
        </div>
    );
};

// Componente reutilizable para el modal de formulario
const TicketFormModal = ({ open, onClose, onSave, ticketData, setTicketData, usuarios, isEditing, currentUserId, calificacion, setCalificacion }) => {
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTicketData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Modal open={open} onClose={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box style={{ background: '#fff', padding: '30px', borderRadius: '10px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                <Typography variant="h6" component="h2" gutterBottom style={{ color: '#0F172A', fontWeight: 600, marginBottom: '20px' }}>
                    {isEditing ? 'Editar Ticket' : 'Registrar Nuevo Ticket'}
                </Typography>
                <TextField label="Descripción del Incidente" name="descripcion" value={ticketData.descripcion} onChange={handleInputChange} fullWidth required multiline rows={4} margin="normal" />
                <FormControl fullWidth margin="normal">
                    <InputLabel id="prioridad-label">Prioridad</InputLabel>
                    <Select labelId="prioridad-label" label="Prioridad" name="prioridad" value={ticketData.prioridad} onChange={handleInputChange} required>
                        <MenuItem value="CRITICA">Crítica</MenuItem>
                        <MenuItem value="ALTA">Alta</MenuItem>
                        <MenuItem value="MEDIA">Media</MenuItem>
                        <MenuItem value="BAJA">Baja</MenuItem>
                    </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                    <InputLabel id="tipo-label">Tipo</InputLabel>
                    <Select labelId="tipo-label" label="Tipo" name="tipo" value={ticketData.tipo} onChange={handleInputChange} required>
                        <MenuItem value="INCIDENTE">Incidente</MenuItem>
                    </Select>
                </FormControl>
                <TextField label="Solución Aplicada (Opcional)" name="solucion" value={ticketData.solucion || ''} onChange={handleInputChange} fullWidth multiline rows={3} margin="normal" />

                {/* Mostrar información de duración si es edición */}
                {isEditing && ticketData && (
                    <>
                        <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #e0e0e0' }} />
                        <Typography variant="h6" style={{ marginBottom: '15px', fontSize: '16px', fontWeight: 600 }}>
                            Detalles de Atención
                        </Typography>
                        
                        <TextField
                            label="Inicio de Atención"
                            value={ticketData.fechaInicioAtencion ? new Date(ticketData.fechaInicioAtencion).toLocaleString('es-ES') : 'N/A'}
                            fullWidth
                            margin="normal"
                            InputProps={{ readOnly: true }}
                        />
                        <TextField
                            label="Fecha Resolución"
                            value={ticketData.fechaResolucion ? new Date(ticketData.fechaResolucion).toLocaleString('es-ES') : 'N/A'}
                            fullWidth
                            margin="normal"
                            InputProps={{ readOnly: true }}
                        />
                        <TextField
                            label="Duración (Minutos)"
                            value={ticketData.duracionAtencionMinutos != null ? ticketData.duracionAtencionMinutos : 'N/A'}
                            fullWidth
                            margin="normal"
                            InputProps={{ readOnly: true }}
                        />

                        {/* Sistema de calificación con estrellas */}
                        <StarRating
                            value={calificacion || 0}
                            onChange={(newRating) => {
                                // La lógica de habilitación ya está en el componente StarRating.
                                // Aquí solo actualizamos el estado.
                                setCalificacion(newRating);
                            }}
                            selectedTicket={ticketData}
                            currentUser={{ id: currentUserId }}
                        />
                    </>
                )}

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <Button onClick={onClose} variant="outlined">Cancelar</Button>
                    <Button onClick={onSave} variant="contained" color="primary">
                        {isEditing ? 'Actualizar' : 'Guardar'}
                    </Button>
                </div>
            </Box>
        </Modal>
    );
};

// Componente para asignar responsable
const AsignarResponsableModal = ({ open, onClose, onAssign, ticketId, usuarios }) => {
    const [responsableId, setResponsableId] = useState('');
    const [rolesMap, setRolesMap] = useState({});
    const [loadingRoles, setLoadingRoles] = useState(true);

    // Cargar roles cuando el modal se abre
    useEffect(() => {
        const fetchRoles = async () => {
            if (open) {
                try {
                    setLoadingRoles(true);
                    const rolesData = await getRoles();
                    // Crear un mapa de rolId -> nombre del rol
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
        
        if (!open) {
            setResponsableId('');
        }
    }, [open]);

    const handleAssign = () => {
        if (!responsableId) {
            alert('Seleccione un responsable');
            return;
        }
        onAssign(ticketId, responsableId);
        onClose();
    };

    return (
        <Modal open={open} onClose={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box style={{ background: '#fff', padding: '30px', borderRadius: '10px', width: '90%', maxWidth: '400px' }}>
                <Typography variant="h6" gutterBottom>Asignar Responsable</Typography>
                <FormControl fullWidth margin="normal">
                    <InputLabel id="responsable-label">Responsable</InputLabel>
                    <Select labelId="responsable-label" label="Responsable" value={responsableId} onChange={(e) => setResponsableId(e.target.value)} disabled={loadingRoles}>
                        <MenuItem value="" disabled><em>-- Seleccione --</em></MenuItem>
                        {usuarios.map(u => {
                            // Obtener el nombre del rol usando el rolId del usuario
                            const rolNombre = rolesMap[u.rolId] || 'Sin rol';
                            return (
                                <MenuItem key={u.id} value={u.id}>
                                    {`${u.nombre} ${u.apellido} - ${rolNombre}`}
                                </MenuItem>
                            );
                        })}
                    </Select>
                </FormControl>
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <Button onClick={onClose} variant="outlined">Cancelar</Button>
                    <Button onClick={handleAssign} variant="contained" disabled={!responsableId || loadingRoles}>Asignar</Button>
                </div>
            </Box>
        </Modal>
    );
};

// Componente para ver/agregar comentarios
const ComentariosModal = ({ open, onClose, ticketId }) => {
    const [comentarios, setComentarios] = useState([]);
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [loadingComentarios, setLoadingComentarios] = useState(false);
    const [errorComentarios, setErrorComentarios] = useState('');

    const fetchComentarios = async () => {
        if (!ticketId) return;
        setLoadingComentarios(true);
        setErrorComentarios('');
        try {
            const data = await getComentariosPorTicket(ticketId);
            setComentarios(data || []);
        } catch (error) {
            setErrorComentarios('Error al cargar comentarios.');
        } finally {
            setLoadingComentarios(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchComentarios();
            setNuevoComentario('');
        }
    }, [open, ticketId]);

    const handleAddComentario = async () => {
        if (!nuevoComentario.trim()) return;
        try {
            await addComentario(ticketId, { texto: nuevoComentario });
            setNuevoComentario('');
            fetchComentarios();
        } catch (error) {
            alert('Error al agregar comentario.');
        }
    };

    const formatCommentDate = (dateString) => {
        if (!dateString) return '';
        try {
            return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: es });
        } catch {
            return dateString;
        }
    };

    return (
        <Modal open={open} onClose={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box style={{ background: '#fff', padding: '25px', borderRadius: '10px', width: '90%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom>Comentarios del Ticket #{ticketId}</Typography>

                <div style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '15px', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '15px' }}>
                    {loadingComentarios && <CircularProgress size={24} />}
                    {errorComentarios && <Alert severity="error">{errorComentarios}</Alert>}
                    {!loadingComentarios && comentarios.length === 0 && <Typography>No hay comentarios.</Typography>}
                    {!loadingComentarios && comentarios.map(c => (
                        <div key={c.id} style={{ marginBottom: '15px', padding: '12px', borderBottom: '1px solid #eee' }}>
                            <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>{c.texto}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                Por: {c.usuarioNombre} - {formatCommentDate(c.fecha)}
                            </Typography>
                        </div>
                    ))}
                </div>

                <TextField label="Nuevo Comentario" value={nuevoComentario} onChange={(e) => setNuevoComentario(e.target.value)} fullWidth multiline rows={3} margin="normal" variant="outlined" />
                <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <Button onClick={onClose} variant="outlined">Cerrar</Button>
                    <Button onClick={handleAddComentario} variant="contained" disabled={!nuevoComentario.trim()}>
                        Agregar
                    </Button>
                </div>
            </Box>
        </Modal>
    );
};

// Componente principal de Gestión de Incidentes
const GestionIncidentes = ({ usuarios = [], currentUserId }) => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [ticketSeleccionado, setTicketSeleccionado] = useState(null);
    const [filtroEstado, setFiltroEstado] = useState('');
    const [calificacion, setCalificacion] = useState(0); // Estado para la calificación

    const [nuevoTicketData, setNuevoTicketData] = useState({
        descripcion: '',
        prioridad: 'MEDIA',
        tipo: 'INCIDENTE',
        solucion: ''
    });

    const [paginaActual, setPaginaActual] = useState(1);
    const itemsPorPagina = 7;

    const fetchTickets = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getTickets(filtroEstado || null);
            const sortedData = (data || []).sort((a, b) => b.id - a.id);
            setTickets(sortedData);
        } catch (err) {
            setError('Error al cargar los tickets. Intente de nuevo.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [filtroEstado]);

    const handleOpenModal = (ticket = null) => {
        if (ticket) {
            setTicketSeleccionado(ticket);
            setNuevoTicketData({
                id: ticket.id,
                descripcion: ticket.descripcion,
                prioridad: ticket.prioridad,
                tipo: ticket.tipo,
                solucion: ticket.solucion || '',
                estado: ticket.estado,
                usuario: ticket.usuario,
                responsable: ticket.responsable,
                fechaInicioAtencion: ticket.fechaInicioAtencion,
                fechaResolucion: ticket.fechaResolucion,
                fechaCreacion: ticket.fechaCreacion,
                duracionAtencionMinutos: ticket.duracionAtencionMinutos
            });
            // Establecer la calificación actual del ticket
            setCalificacion(ticket.calificacion || 0);
        } else {
            setTicketSeleccionado(null);
            setNuevoTicketData({ descripcion: '', prioridad: 'MEDIA', tipo: 'INCIDENTE', solucion: '' });
            setCalificacion(0);
        }
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setTicketSeleccionado(null);
        setCalificacion(0); // Resetear la calificación
    };

    const handleSaveTicket = async () => {
        try {
            if (ticketSeleccionado) {
                // Si estamos editando un ticket
                const ticketData = {
                    ...nuevoTicketData
                };
                
                // Actualizar el ticket (sin incluir la calificación en el body de PUT)
                await updateTicket(ticketSeleccionado.id, ticketData);
                
                // Si hay una calificación nueva o modificada, usar el endpoint específico
                if (calificacion > 0 && calificacion !== ticketSeleccionado.calificacion) {
                    await calificarTicket(ticketSeleccionado.id, calificacion);
                }
            } else {
                // Si estamos creando un ticket nuevo
                await addTicket(nuevoTicketData);
            }
            handleCloseModal();
            fetchTickets();
        } catch (error) {
            console.error('Error al guardar el ticket:', error);
            alert('Error al guardar el ticket: ' + (error.message || 'Error desconocido'));
        }
    };

    const handleAssignResponsable = async (ticketId, responsableId) => {
        try {
            await asignarTicket(ticketId, responsableId);
            fetchTickets();
        } catch (error) {
            alert('Error al asignar responsable: ' + (error.message || 'Error desconocido'));
        }
    };

    const handleDeleteTicket = async (id) => {
        if (window.confirm('¿Está seguro de eliminar este ticket?')) {
            try {
                await deleteTicket(id);
                fetchTickets();
            } catch (error) {
                alert('Error al eliminar el ticket: ' + (error.message || 'Error desconocido'));
            }
        }
    };

    const handleCambiarEstado = async (ticketId, estadoActual) => {
        let nuevoEstado = '';
        switch (estadoActual) {
            case 'ABIERTO': nuevoEstado = 'EN_PROGRESO'; break;
            case 'EN_PROGRESO': nuevoEstado = 'RESUELTO'; break;
            case 'RESUELTO': nuevoEstado = 'CERRADO'; break;
            case 'CERRADO': nuevoEstado = 'ABIERTO'; break;
            default: return;
        }

        if (window.confirm(`¿Desea cambiar el estado del ticket a ${nuevoEstado.replace('_', ' ')}?`)) {
            try {
                await cambiarEstadoTicket(ticketId, nuevoEstado);
                fetchTickets();
            } catch (error) {
                alert('Error al cambiar estado: ' + (error.message || 'Error desconocido'));
            }
        }
    };

    const formatTicketDate = (dateString) => {
        if (!dateString) return '-';
        try {
            return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: es });
        } catch {
            return dateString;
        }
    };

    const renderChipEstado = (estado) => {
        let color = 'default';
        let label = estado;
        switch (estado) {
            case 'ABIERTO': color = 'info'; label = 'Abierto'; break;
            case 'EN_PROGRESO': color = 'warning'; label = 'En Progreso'; break;
            case 'RESUELTO': color = 'success'; label = 'Resuelto'; break;
            case 'CERRADO': color = 'default'; label = 'Cerrado'; break;
        }
        return <Chip label={label} color={color} size="small" />;
    };

    const renderChipPrioridad = (prioridad) => {
        let color = 'default';
        let label = prioridad;
        switch (prioridad) {
            case 'CRITICA': color = 'error'; label = 'Crítica'; break;
            case 'ALTA': color = 'warning'; label = 'Alta'; break;
            case 'MEDIA': color = 'info'; label = 'Media'; break;
            case 'BAJA': color = 'success'; label = 'Baja'; break;
        }
        return <Chip label={label} color={color} size="small" variant="outlined" style={{ fontWeight: 'medium' }} />;
    };

    const indiceFinal = paginaActual * itemsPorPagina;
    const indiceInicial = indiceFinal - itemsPorPagina;
    const ticketsPaginados = tickets.slice(indiceInicial, indiceFinal);
    const totalPaginas = Math.ceil(tickets.length / itemsPorPagina);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <h3 style={{ margin: 0, color: '#0F172A', fontWeight: 600 }}>Gestión de Incidentes</h3>
                
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <FormControl size="small" style={{ minWidth: 180 }}>
                        <InputLabel id="filtro-estado-label">Filtrar por Estado</InputLabel>
                        <Select labelId="filtro-estado-label" label="Filtrar por Estado" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            <MenuItem value="ABIERTO">Abierto</MenuItem>
                            <MenuItem value="EN_PROGRESO">En Progreso</MenuItem>
                            <MenuItem value="RESUELTO">Resuelto</MenuItem>
                            <MenuItem value="CERRADO">Cerrado</MenuItem>
                        </Select>
                    </FormControl>
                    <Button variant="contained" color="primary" onClick={() => handleOpenModal()}>
                        <Plus size={16} style={{ marginRight: '8px' }} /> Nuevo Ticket
                    </Button>
                </div>
            </div>

            {loading && (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '30px 0' }}>
                    <CircularProgress size={32} style={{ color: '#3b82f6' }} />
                </div>
            )}
            
            {error && <Alert severity="error" style={{ marginBottom: '20px', borderRadius: '8px' }}>{error}</Alert>}

            {!loading && !error && (
                <div className="table-container">
                    <div className="table-header" style={{ paddingTop: '0px' }}>
                        <h3 style={{ marginTop: '10px', textAlign: 'left' }}>Lista de Tickets</h3>
                        <p style={{ margin: 0, textAlign: 'left' }}>
                            Administre los incidentes reportados y su resolución
                        </p>
                    </div>
                    <div style={{ padding: '0px', borderRadius: '8px' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell style={{ fontWeight: 'bold', color: '#748091', width: '80px' }}>ID</TableCell>
                                    <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Descripción</TableCell>
                                    <TableCell style={{ fontWeight: 'bold', color: '#748091', width: '120px' }}>Prioridad</TableCell>
                                    <TableCell style={{ fontWeight: 'bold', color: '#748091', width: '120px' }}>Estado</TableCell>
                                    <TableCell style={{ fontWeight: 'bold', color: '#748091', width: '150px' }}>Reportado por</TableCell>
                                    <TableCell style={{ fontWeight: 'bold', color: '#748091', width: '150px' }}>Responsable</TableCell>
                                    <TableCell style={{ fontWeight: 'bold', color: '#748091', width: '150px' }}>Fecha Reporte</TableCell>
                                    <TableCell style={{ fontWeight: 'bold', color: '#748091', width: '160px' }} align="center">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {ticketsPaginados.length > 0 ? ticketsPaginados.map((ticket) => (
                                    <TableRow key={ticket.id} hover>
                                        <TableCell>{ticket.id}</TableCell>
                                        <TableCell style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            <MuiTooltip title={ticket.descripcion} arrow>
                                                <span>{ticket.descripcion}</span>
                                            </MuiTooltip>
                                        </TableCell>
                                        <TableCell>{renderChipPrioridad(ticket.prioridad)}</TableCell>
                                        <TableCell>
                                            <MuiTooltip title="Clic para cambiar estado" arrow>
                                                <span style={{ cursor: 'pointer' }} onClick={() => handleCambiarEstado(ticket.id, ticket.estado)}>
                                                    {renderChipEstado(ticket.estado)}
                                                </span>
                                            </MuiTooltip>
                                        </TableCell>
                                        <TableCell>{ticket.usuarioReportaNombre || '-'}</TableCell>
                                        <TableCell>{ticket.responsableAsignadoNombre || '-'}</TableCell>
                                        <TableCell>{formatTicketDate(ticket.fechaReporte)}</TableCell>
                                        <TableCell>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <MuiTooltip title="Ver/Editar Ticket" arrow>
                                                    <IconButton size="small" color="primary" onClick={() => handleOpenModal(ticket)}>
                                                        <Edit size={18} />
                                                    </IconButton>
                                                </MuiTooltip>
                                                <MuiTooltip title="Eliminar Ticket" arrow>
                                                    <IconButton size="small" color="error" onClick={() => handleDeleteTicket(ticket.id)}>
                                                        <Trash2 size={18} />
                                                    </IconButton>
                                                </MuiTooltip>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">No hay tickets para mostrar.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        {tickets.length > itemsPorPagina && (
                            <Pagination count={totalPaginas} page={paginaActual} onChange={(e, value) => setPaginaActual(value)} color="primary" showFirstButton showLastButton />
                        )}
                    </div>
                </div>
            )}

            <TicketPanelUnificado 
                open={modalOpen} 
                onClose={handleCloseModal} 
                ticketData={nuevoTicketData} 
                setTicketData={setNuevoTicketData} 
                usuarios={usuarios} 
                isEditing={!!ticketSeleccionado}
                currentUserId={currentUserId}
                calificacion={calificacion}
                setCalificacion={setCalificacion}
                onSave={handleSaveTicket}
                onAssignResponsible={handleAssignResponsable}
            />
        </div>
    );
};

export default GestionIncidentes;