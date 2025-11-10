import React, { useState, useEffect } from 'react';
import { Button, Modal, Box, TextField, Table, TableBody, TableCell, TableHead, TableRow, Pagination, Select, MenuItem, InputLabel, FormControl, Typography, CircularProgress, Alert, Chip, IconButton, Tooltip as MuiTooltip, TableContainer } from '@mui/material';
import { Plus, Edit, Clock, CheckCircle, XCircle, PlayCircle } from 'lucide-react';
import { getRFCs, addRFC, updateRFC, cambiarEstadoRFC, aprobarRFC } from '../../services/SoporteService';
import { format } from 'date-fns';
import es from 'date-fns/locale/es';
import { useModal } from '../../hooks/useModal';
import CustomModal from '../../components/CustomModal';
import * as tableStyles from '../../styles/tableStyles';

// Modal de Formulario para RFCs
const RFCFormModal = ({ open, onClose, onSave, rfcData, setRfcData, isEditing }) => {
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRfcData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Modal open={open} onClose={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box style={{ background: '#fff', padding: '30px', borderRadius: '10px', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
                <Typography variant="h6" component="h2" gutterBottom>
                    {isEditing ? 'Editar Solicitud de Cambio (RFC)' : 'Registrar Nueva Solicitud de Cambio (RFC)'}
                </Typography>
                <TextField label="Título del Cambio" name="titulo" value={rfcData.titulo} onChange={handleInputChange} fullWidth required margin="normal" />
                <TextField label="Descripción Detallada" name="descripcion" value={rfcData.descripcion} onChange={handleInputChange} fullWidth required multiline rows={4} margin="normal" />
                <TextField label="Justificación del Negocio" name="justificacion" value={rfcData.justificacion} onChange={handleInputChange} fullWidth required multiline rows={3} margin="normal" />

                <FormControl fullWidth margin="normal">
                    <InputLabel id="tipo-cambio-label">Tipo de Cambio</InputLabel>
                    <Select labelId="tipo-cambio-label" label="Tipo de Cambio" name="tipoCambio" value={rfcData.tipoCambio} onChange={handleInputChange} required>
                        <MenuItem value="ESTANDAR">Estándar (Pre-aprobado)</MenuItem>
                        <MenuItem value="NORMAL">Normal (Requiere CAB)</MenuItem>
                        <MenuItem value="EMERGENCIA">Emergencia (Requiere PM)</MenuItem>
                    </Select>
                </FormControl>

                <TextField label="Análisis de Impacto" name="impacto" value={rfcData.impacto || ''} onChange={handleInputChange} fullWidth multiline rows={3} margin="normal" helperText="Consecuencias potenciales del cambio." />
                <TextField label="Evaluación de Riesgos" name="riesgos" value={rfcData.riesgos || ''} onChange={handleInputChange} fullWidth multiline rows={3} margin="normal" helperText="Posibles riesgos y plan de mitigación." />
                <TextField label="Plan de Implementación (Borrador)" name="planImplementacion" value={rfcData.planImplementacion || ''} onChange={handleInputChange} fullWidth multiline rows={4} margin="normal" helperText="Pasos propuestos para ejecutar el cambio." />
                <TextField label="Plan de Retirada (Rollback)" name="planRetirada" value={rfcData.planRetirada || ''} onChange={handleInputChange} fullWidth multiline rows={3} margin="normal" helperText="Procedimiento para revertir si falla." />

                {isEditing && rfcData.solicitanteNombre && (
                    <TextField label="Solicitante" value={rfcData.solicitanteNombre} fullWidth disabled margin="normal" />
                )}

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <Button onClick={onClose} variant="outlined">Cancelar</Button>
                    <Button onClick={onSave} variant="contained" color="primary">
                        {isEditing ? 'Actualizar RFC' : 'Guardar RFC'}
                    </Button>
                </div>
            </Box>
        </Modal>
    );
};

const GestionCambios = ({ usuarios }) => {
    const [rfcs, setRfcs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [rfcEditando, setRfcEditando] = useState(null);
    const [nuevoRfcData, setNuevoRfcData] = useState({
        titulo: '',
        descripcion: '',
        justificacion: '',
        tipoCambio: 'NORMAL',
        impacto: '',
        riesgos: '',
        planImplementacion: '',
        planRetirada: '',
    });

    const [filtroTipo, setFiltroTipo] = useState('');
    const [paginaActual, setPaginaActual] = useState(1);
    const itemsPorPagina = 7;
    
    // Hook para modals
    const { modalConfig, showAlert, showConfirm, showError, hideModal } = useModal();

    const fetchRfcs = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getRFCs(filtroTipo || null);
            const sortedData = (data || []).sort((a, b) => b.id - a.id);
            setRfcs(sortedData);
        } catch (err) {
            setError('Error al cargar las Solicitudes de Cambio. Intente de nuevo.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRfcs();
    }, [filtroTipo]);

    const handleOpenModal = (rfc = null) => {
        if (rfc) {
            setRfcEditando(rfc);
            setNuevoRfcData({
                id: rfc.id,
                formattedId: rfc.formattedId,
                titulo: rfc.titulo,
                descripcion: rfc.descripcion,
                justificacion: rfc.justificacion,
                tipoCambio: rfc.tipoCambio,
                impacto: rfc.impacto || '',
                riesgos: rfc.riesgos || '',
                planImplementacion: rfc.planImplementacion || '',
                planRetirada: rfc.planRetirada || '',
                solicitanteNombre: rfc.solicitanteNombre || ''
            });
        } else {
            setRfcEditando(null);
            setNuevoRfcData({ titulo: '', descripcion: '', justificacion: '', tipoCambio: 'NORMAL', impacto: '', riesgos: '', planImplementacion: '', planRetirada: '' });
        }
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setRfcEditando(null);
    };

    const handleSaveRfc = async () => {
        if (!nuevoRfcData.titulo || !nuevoRfcData.descripcion || !nuevoRfcData.justificacion || !nuevoRfcData.tipoCambio) {
            showAlert('Título, Descripción, Justificación y Tipo de Cambio son obligatorios.', 'Validación', 'warning');
            return;
        }
        try {
            if (rfcEditando) {
                const { solicitanteNombre, ...dataToUpdate } = nuevoRfcData;
                await updateRFC(rfcEditando.id, dataToUpdate);
            } else {
                await addRFC(nuevoRfcData);
            }
            handleCloseModal();
            fetchRfcs();
        } catch (error) {
            showError('Error al guardar RFC: ' + (error.message || 'Error desconocido'));
        }
    };

    const handleApprove = async (rfcId, tipoCambio) => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            showError("No se pudo identificar al usuario aprobador.");
            return;
        }
        const tipoAprobacion = tipoCambio === 'NORMAL' ? 'CAB' : 'PM';

        showConfirm(
            `¿Desea aprobar este cambio como ${tipoAprobacion}?`,
            async () => {
                try {
                    await aprobarRFC(rfcId, parseInt(userId, 10), tipoAprobacion);
                    fetchRfcs();
                } catch (error) {
                    showError('Error al aprobar RFC: ' + (error.message || 'Error desconocido'));
                }
            },
            'Aprobar Cambio'
        );
    };

    const handleSetImplemented = async (rfcId) => {
        showConfirm(
            '¿Marcar este cambio como Implementado?',
            async () => {
                try {
                    await cambiarEstadoRFC(rfcId, 'IMPLEMENTADO');
                    fetchRfcs();
                } catch (error) {
                    showError('Error al marcar como implementado: ' + (error.message || 'Error desconocido'));
                }
            },
            'Marcar como Implementado'
        );
    };

    const handleReject = async (rfcId) => {
        showConfirm(
            '¿Está seguro de rechazar esta solicitud de cambio?',
            async () => {
                try {
                    await cambiarEstadoRFC(rfcId, 'RECHAZADO');
                    fetchRfcs();
                } catch (error) {
                    showError('Error al rechazar RFC: ' + (error.message || 'Error desconocido'));
                }
            },
            'Rechazar Solicitud'
        );
    };

    const handleCloseRFC = async (rfcId) => {
        showConfirm(
            '¿Está seguro de cerrar esta solicitud de cambio?',
            async () => {
                try {
                    await cambiarEstadoRFC(rfcId, 'CERRADO');
                    fetchRfcs();
                } catch (error) {
                    showError('Error al cerrar RFC: ' + (error.message || 'Error desconocido'));
                }
            },
            'Cerrar Solicitud'
        );
    };

    const renderChipEstadoCambio = (estado) => {
        let color = 'default';
        let label = estado;
        let icon = null;
        switch (estado) {
            case 'REGISTRADO': color = 'info'; label = 'Registrado'; icon = <Clock size={16}/>; break;
            case 'EN_EVALUACION': color = 'warning'; label = 'En Evaluación'; icon = <Clock size={16}/>; break;
            case 'APROBADO_CAB': color = 'success'; label = 'Aprobado CAB'; icon = <CheckCircle size={16}/>; break;
            case 'APROBADO_PM_EMERGENCIA': color = 'success'; label = 'Aprobado PM'; icon = <CheckCircle size={16}/>; break;
            case 'IMPLEMENTADO': color = 'secondary'; label = 'Implementado'; icon = <PlayCircle size={16}/>; break;
            case 'RECHAZADO': color = 'error'; label = 'Rechazado'; icon = <XCircle size={16}/>; break;
            case 'CERRADO': color = 'default'; label = 'Cerrado'; break;
        }
        return <Chip icon={icon} label={label} color={color} size="small" variant="filled" />;
    };

    const renderChipTipoCambio = (tipo) => {
        let color = 'default';
        let label = tipo;
        let variant = 'filled';
        switch (tipo) {
            case 'ESTANDAR': color = 'success'; label = 'Estándar'; variant = 'outlined'; break;
            case 'NORMAL': color = 'info'; label = 'Normal'; break;
            case 'EMERGENCIA': color = 'error'; label = 'Emergencia'; break;
        }
        return <Chip label={label} color={color} size="small" variant={variant} />;
    };

    const indiceFinal = paginaActual * itemsPorPagina;
    const indiceInicial = indiceFinal - itemsPorPagina;
    const rfcsPaginados = rfcs.slice(indiceInicial, indiceFinal);
    const totalPaginas = Math.ceil(rfcs.length / itemsPorPagina);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#0F172A', fontWeight: 600 }}>Gestión de Cambios (RFCs)</h3>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <FormControl size="small" style={{ minWidth: 180 }}>
                        <InputLabel id="filtro-tipo-label">Filtrar por Tipo</InputLabel>
                        <Select labelId="filtro-tipo-label" label="Filtrar por Tipo" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            <MenuItem value="ESTANDAR">Estándar</MenuItem>
                            <MenuItem value="NORMAL">Normal</MenuItem>
                            <MenuItem value="EMERGENCIA">Emergencia</MenuItem>
                        </Select>
                    </FormControl>
                    <Button variant="contained" color="primary" onClick={() => handleOpenModal()}>
                        <Plus size={16} style={{ marginRight: '8px' }} /> Nueva Solicitud (RFC)
                    </Button>
                </div>
            </div>

            {loading && (
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '60px 20px',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                    <CircularProgress size={40} style={{ color: '#10b981' }} />
                    <Typography sx={{ mt: 2, color: '#64748b', fontSize: '0.95rem' }}>
                        Cargando solicitudes de cambio...
                    </Typography>
                </Box>
            )}
            
            {error && <Alert severity="error" style={{ marginBottom: '20px' }}>{error}</Alert>}

            {!loading && !error && (
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: '#1f2937' }}>
                            Lista de Solicitudes de Cambio
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            Administre las solicitudes de cambio y su proceso de aprobación
                        </Typography>
                    </Box>
                    
                    <TableContainer sx={tableStyles.enhancedTableContainer}>
                        <Table>
                            <TableHead sx={tableStyles.enhancedTableHead}>
                                <TableRow>
                                    <TableCell sx={tableStyles.enhancedTableCell}>ID</TableCell>
                                    <TableCell sx={tableStyles.enhancedTableCell}>Título</TableCell>
                                    <TableCell sx={tableStyles.enhancedTableCell}>Tipo</TableCell>
                                    <TableCell sx={tableStyles.enhancedTableCell}>Estado</TableCell>
                                    <TableCell sx={tableStyles.enhancedTableCell}>Solicitante</TableCell>
                                    <TableCell sx={tableStyles.enhancedTableCell} align="center">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rfcsPaginados.length > 0 ? rfcsPaginados.map((rfc) => (
                                    <TableRow key={rfc.id} sx={tableStyles.enhancedTableRow}>
                                        <TableCell sx={tableStyles.enhancedTableCell}>{rfc.formattedId || rfc.id}</TableCell>
                                        <TableCell sx={{ ...tableStyles.enhancedTableCell, maxWidth: 350, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            <MuiTooltip title={rfc.titulo} arrow><span>{rfc.titulo}</span></MuiTooltip>
                                        </TableCell>
                                        <TableCell sx={tableStyles.enhancedTableCell}>{renderChipTipoCambio(rfc.tipoCambio)}</TableCell>
                                        <TableCell sx={tableStyles.enhancedTableCell}>{renderChipEstadoCambio(rfc.estado)}</TableCell>
                                        <TableCell sx={tableStyles.enhancedTableCell}>{rfc.solicitanteNombre || '-'}</TableCell>
                                        <TableCell sx={tableStyles.enhancedTableCell} align="center">
                                            <Box sx={tableStyles.enhancedTableCellActions}>
                                                {(rfc.estado === 'REGISTRADO' || rfc.estado === 'EN_EVALUACION') && (rfc.tipoCambio === 'NORMAL' || rfc.tipoCambio === 'EMERGENCIA') && (
                                                    <Button 
                                                        color="success" 
                                                        onClick={() => handleApprove(rfc.id, rfc.tipoCambio)}
                                                        sx={tableStyles.enhancedActionButton}
                                                        startIcon={<CheckCircle size={18} />}
                                                    >
                                                    </Button>
                                                )}
                                                {(rfc.estado === 'APROBADO_CAB' || rfc.estado === 'APROBADO_PM_EMERGENCIA') && (
                                                    <Button 
                                                        color="info" 
                                                        onClick={() => handleSetImplemented(rfc.id)}
                                                        sx={tableStyles.enhancedActionButton}
                                                        startIcon={<PlayCircle size={18} />}
                                                    >
                                                    </Button>
                                                )}
                                                {(rfc.estado === 'REGISTRADO' || rfc.estado === 'EN_EVALUACION') && (
                                                    <Button 
                                                        color="error" 
                                                        onClick={() => handleReject(rfc.id)}
                                                        sx={tableStyles.enhancedActionButton}
                                                        startIcon={<XCircle size={18} />}
                                                    >
                                                    </Button>
                                                )}
                                                {rfc.estado === 'IMPLEMENTADO' && (
                                                    <Button 
                                                        color="success" 
                                                        onClick={() => handleCloseRFC(rfc.id)}
                                                        sx={tableStyles.enhancedActionButton}
                                                        startIcon={<CheckCircle size={18}/>}
                                                    >
                                                    </Button>
                                                )}
                                                <Button 
                                                    color="primary" 
                                                    onClick={() => handleOpenModal(rfc)}
                                                    sx={tableStyles.enhancedActionButton}
                                                    startIcon={<Edit size={18} />}
                                                >
                                                </Button>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={6} sx={tableStyles.emptyTableMessage}>
                                            <Box className="empty-icon">📋</Box>
                                            <Typography>No hay solicitudes de cambio para mostrar</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    
                    <Box sx={tableStyles.enhancedPagination}>
                        <Pagination 
                            count={totalPaginas} 
                            page={paginaActual} 
                            onChange={(e, value) => setPaginaActual(value)} 
                            color="primary" 
                            showFirstButton 
                            showLastButton 
                        />
                    </Box>
                </Box>
            )}

            <RFCFormModal open={modalOpen} onClose={handleCloseModal} onSave={handleSaveRfc} rfcData={nuevoRfcData} setRfcData={setNuevoRfcData} isEditing={!!rfcEditando} />
            
            <CustomModal config={modalConfig} onClose={hideModal} />
        </div>
    );
};

export default GestionCambios;