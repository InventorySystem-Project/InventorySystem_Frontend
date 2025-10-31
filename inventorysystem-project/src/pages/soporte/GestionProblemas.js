import React, { useState, useEffect } from 'react';
import { Button, Modal, Box, TextField, Table, TableBody, TableCell, TableHead, TableRow, Pagination, Select, MenuItem, InputLabel, FormControl, Typography, CircularProgress, Alert, Chip, IconButton, Tooltip as MuiTooltip } from '@mui/material';
import { Plus, Edit } from 'lucide-react';
import { getErroresConocidos, addErrorConocido, updateErrorConocido } from '../../services/SoporteService';

// Modal de Formulario para Errores Conocidos
const ErrorConocidoFormModal = ({ open, onClose, onSave, errorData, setErrorData, isEditing }) => {
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setErrorData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Modal open={open} onClose={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box style={{ background: '#fff', padding: '30px', borderRadius: '10px', width: '90%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
                <Typography variant="h6" component="h2" gutterBottom>
                    {isEditing ? 'Editar Error Conocido' : 'Registrar Nuevo Error Conocido'}
                </Typography>
                <TextField label="Descripción del Error" name="descripcionError" value={errorData.descripcionError} onChange={handleInputChange} fullWidth required multiline rows={3} margin="normal" />
                <TextField label="Síntomas (Opcional)" name="sintomas" value={errorData.sintomas || ''} onChange={handleInputChange} fullWidth multiline rows={2} margin="normal" />
                <TextField label="Causa Raíz (Opcional, si ya se conoce)" name="causaRaiz" value={errorData.causaRaiz || ''} onChange={handleInputChange} fullWidth multiline rows={3} margin="normal" />
                <TextField label="Solución Temporal (Workaround)" name="solucionTemporal" value={errorData.solucionTemporal || ''} onChange={handleInputChange} fullWidth multiline rows={3} margin="normal" />
                <TextField label="Solución Definitiva Propuesta (Opcional)" name="solucionDefinitivaPropuesta" value={errorData.solucionDefinitivaPropuesta || ''} onChange={handleInputChange} fullWidth multiline rows={3} margin="normal" />
                <FormControl fullWidth margin="normal">
                    <InputLabel id="estado-problema-label">Estado</InputLabel>
                    <Select labelId="estado-problema-label" label="Estado" name="estado" value={errorData.estado} onChange={handleInputChange} required>
                        <MenuItem value="IDENTIFICADO">Identificado</MenuItem>
                        <MenuItem value="EN_ANALISIS">En Análisis</MenuItem>
                        <MenuItem value="SOLUCION_PROPUESTA">Solución Propuesta</MenuItem>
                        <MenuItem value="CERRADO">Cerrado</MenuItem>
                    </Select>
                </FormControl>

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

const GestionProblemas = ({ usuarios }) => {
    const [errores, setErrores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [errorEditando, setErrorEditando] = useState(null);
    const [nuevoErrorData, setNuevoErrorData] = useState({
        descripcionError: '',
        sintomas: '',
        causaRaiz: '',
        solucionTemporal: '',
        solucionDefinitivaPropuesta: '',
        estado: 'IDENTIFICADO'
    });

    const [paginaActual, setPaginaActual] = useState(1);
    const itemsPorPagina = 7;

    const fetchErrores = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getErroresConocidos();
            const sortedData = (data || []).sort((a, b) => b.id - a.id);
            setErrores(sortedData);
        } catch (err) {
            setError('Error al cargar los errores conocidos. Intente de nuevo.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchErrores();
    }, []);

    const handleOpenModal = (errorConocido = null) => {
        if (errorConocido) {
            setErrorEditando(errorConocido);
            setNuevoErrorData({
                id: errorConocido.id,
                formattedId: errorConocido.formattedId,
                descripcionError: errorConocido.descripcionError,
                sintomas: errorConocido.sintomas || '',
                causaRaiz: errorConocido.causaRaiz || '',
                solucionTemporal: errorConocido.solucionTemporal || '',
                solucionDefinitivaPropuesta: errorConocido.solucionDefinitivaPropuesta || '',
                estado: errorConocido.estado
            });
        } else {
            setErrorEditando(null);
            setNuevoErrorData({ descripcionError: '', sintomas: '', causaRaiz: '', solucionTemporal: '', solucionDefinitivaPropuesta: '', estado: 'IDENTIFICADO' });
        }
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setErrorEditando(null);
    };

    const handleSaveError = async () => {
        if (!nuevoErrorData.descripcionError || !nuevoErrorData.estado) {
            alert('La descripción y el estado son obligatorios.');
            return;
        }
        try {
            if (errorEditando) {
                await updateErrorConocido(errorEditando.id, nuevoErrorData);
            } else {
                await addErrorConocido(nuevoErrorData);
            }
            handleCloseModal();
            fetchErrores();
        } catch (error) {
            alert('Error al guardar el error conocido: ' + (error.message || 'Error desconocido'));
        }
    };

    const renderChipEstadoProblema = (estado) => {
        let color = 'default';
        let label = estado;
        switch (estado) {
            case 'IDENTIFICADO': color = 'info'; label = 'Identificado'; break;
            case 'EN_ANALISIS': color = 'warning'; label = 'En Análisis'; break;
            case 'SOLUCION_PROPUESTA': color = 'secondary'; label = 'Solución Propuesta'; break;
            case 'CERRADO': color = 'default'; label = 'Cerrado'; break;
        }
        return <Chip label={label} color={color} size="small" />;
    };

    const indiceFinal = paginaActual * itemsPorPagina;
    const indiceInicial = indiceFinal - itemsPorPagina;
    const erroresPaginados = errores.slice(indiceInicial, indiceFinal);
    const totalPaginas = Math.ceil(errores.length / itemsPorPagina);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#0F172A', fontWeight: 600 }}>Gestión de Problemas (Errores Conocidos)</h3>
                <Button variant="contained" color="primary" onClick={() => handleOpenModal()}>
                    <Plus size={16} style={{ marginRight: '8px' }} /> Nuevo Error Conocido
                </Button>
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
                        <h3 style={{ marginTop: '10px', textAlign: 'left' }}>Lista de Errores Conocidos</h3>
                        <p style={{ margin: 0, textAlign: 'left' }}>
                            Base de conocimiento de problemas identificados y sus soluciones
                        </p>
                    </div>
                    <div style={{ padding: '0px', borderRadius: '8px' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>ID</TableCell>
                                    <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Descripción del Error</TableCell>
                                    <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Estado</TableCell>
                                    <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Solución Temporal</TableCell>
                                    <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {erroresPaginados.length > 0 ? erroresPaginados.map((err) => (
                                    <TableRow key={err.id} hover>
                                        <TableCell>{err.formattedId || err.id}</TableCell>
                                        <TableCell style={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            <MuiTooltip title={err.descripcionError} arrow>
                                                <span>{err.descripcionError}</span>
                                            </MuiTooltip>
                                        </TableCell>
                                        <TableCell>{renderChipEstadoProblema(err.estado)}</TableCell>
                                        <TableCell style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            <MuiTooltip title={err.solucionTemporal || '-'} arrow>
                                                <span>{err.solucionTemporal || '-'}</span>
                                            </MuiTooltip>
                                        </TableCell>
                                        <TableCell>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <MuiTooltip title="Editar Error Conocido" arrow>
                                                    <IconButton size="small" color="primary" onClick={() => handleOpenModal(err)}>
                                                        <Edit size={18} />
                                                    </IconButton>
                                                </MuiTooltip>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">No hay errores conocidos registrados.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        {errores.length > itemsPorPagina && (
                            <Pagination count={totalPaginas} page={paginaActual} onChange={(e, value) => setPaginaActual(value)} color="primary" showFirstButton showLastButton />
                        )}
                    </div>
                </div>
            )}

            <ErrorConocidoFormModal open={modalOpen} onClose={handleCloseModal} onSave={handleSaveError} errorData={nuevoErrorData} setErrorData={setNuevoErrorData} isEditing={!!errorEditando} />
        </div>
    );
};

export default GestionProblemas;