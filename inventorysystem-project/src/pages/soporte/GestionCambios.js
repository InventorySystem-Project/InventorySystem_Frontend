import React, { useState, useEffect } from 'react';
import { Button, Modal, Box, TextField, Table, TableBody, TableCell, TableHead, TableRow, Pagination, Select, MenuItem, InputLabel, FormControl, Typography, CircularProgress, Alert, Chip, IconButton, Tooltip as MuiTooltip } from '@mui/material';
import { Plus, Edit, Clock, CheckCircle, XCircle, PlayCircle } from 'lucide-react';
import { getRFCs, addRFC, updateRFC, cambiarEstadoRFC, aprobarRFC } from '../../services/SoporteService';
import { format } from 'date-fns';
import es from 'date-fns/locale/es';
import { useModal } from '../../hooks/useModal';
import CustomModal from '../../components/CustomModal';

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
                <div style={{ display: 'flex', justifyContent: 'center', margin: '30px 0' }}>
                    <CircularProgress />
                </div>
            )}
            
            {error && <Alert severity="error" style={{ marginBottom: '20px' }}>{error}</Alert>}

            {!loading && !error && (
                <div className="table-container">
                    <div className="table-header" style={{ paddingTop: '0px' }}>
                        <h3 style={{ marginTop: '10px', textAlign: 'left' }}>Lista de Solicitudes de Cambio</h3>
                        <p style={{ margin: 0, textAlign: 'left' }}>
                            Administre las solicitudes de cambio y su proceso de aprobación
                        </p>
                    </div>
                    <div style={{ padding: '0px', borderRadius: '8px' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>ID</TableCell>
                                    <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Título</TableCell>
                                    <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Tipo</TableCell>
                                    <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Estado</TableCell>
                                    <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Solicitante</TableCell>
                                    <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rfcsPaginados.length > 0 ? rfcsPaginados.map((rfc) => (
                                    <TableRow key={rfc.id} hover>
                                        <TableCell>{rfc.formattedId || rfc.id}</TableCell>
                                        <TableCell style={{ maxWidth: 350, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            <MuiTooltip title={rfc.titulo} arrow><span>{rfc.titulo}</span></MuiTooltip>
                                        </TableCell>
                                        <TableCell>{renderChipTipoCambio(rfc.tipoCambio)}</TableCell>
                                        <TableCell>{renderChipEstadoCambio(rfc.estado)}</TableCell>
                                        <TableCell>{rfc.solicitanteNombre || '-'}</TableCell>
                                        <TableCell>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                {(rfc.estado === 'REGISTRADO' || rfc.estado === 'EN_EVALUACION') && (rfc.tipoCambio === 'NORMAL' || rfc.tipoCambio === 'EMERGENCIA') && (
                                                    <MuiTooltip title={rfc.tipoCambio === 'NORMAL' ? "Aprobar (CAB)" : "Aprobar (PM)"} arrow>
                                                        <IconButton size="small" color="success" onClick={() => handleApprove(rfc.id, rfc.tipoCambio)}>
                                                            <CheckCircle size={18} />
                                                        </IconButton>
                                                    </MuiTooltip>
                                                )}
                                                {(rfc.estado === 'APROBADO_CAB' || rfc.estado === 'APROBADO_PM_EMERGENCIA') && (
                                                    <MuiTooltip title="Marcar como Implementado" arrow>
                                                        <IconButton size="small" color="secondary" onClick={() => handleSetImplemented(rfc.id)}>
                                                            <PlayCircle size={18} />
                                                        </IconButton>
                                                    </MuiTooltip>
                                                )}
                                                {(rfc.estado === 'REGISTRADO' || rfc.estado === 'EN_EVALUACION') && (
                                                    <MuiTooltip title="Rechazar Solicitud" arrow>
                                                        <IconButton size="small" color="error" onClick={() => handleReject(rfc.id)}>
                                                            <XCircle size={18} />
                                                        </IconButton>
                                                    </MuiTooltip>
                                                )}
                                                {rfc.estado === 'IMPLEMENTADO' && (
                                                    <MuiTooltip title="Cerrar Solicitud" arrow>
                                                        <IconButton size="small" color="default" onClick={() => handleCloseRFC(rfc.id)}>
                                                            <CheckCircle size={18}/>
                                                        </IconButton>
                                                    </MuiTooltip>
                                                )}
                                                <MuiTooltip title="Editar Detalles RFC" arrow>
                                                    <IconButton size="small" color="primary" onClick={() => handleOpenModal(rfc)}>
                                                        <Edit size={18} />
                                                    </IconButton>
                                                </MuiTooltip>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">No hay solicitudes de cambio para mostrar.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        {rfcs.length > itemsPorPagina && (
                            <Pagination count={totalPaginas} page={paginaActual} onChange={(e, value) => setPaginaActual(value)} color="primary" showFirstButton showLastButton />
                        )}
                    </div>
                </div>
            )}

            <RFCFormModal open={modalOpen} onClose={handleCloseModal} onSave={handleSaveRfc} rfcData={nuevoRfcData} setRfcData={setNuevoRfcData} isEditing={!!rfcEditando} />
            
            <CustomModal config={modalConfig} onClose={hideModal} />
        </div>
    );
};

export default GestionCambios;