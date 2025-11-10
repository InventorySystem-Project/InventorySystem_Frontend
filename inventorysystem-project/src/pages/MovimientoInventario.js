import React, { useState, useEffect } from 'react';
import {
    Button,
    Modal,
    Box,
    TextField,
    MenuItem,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Pagination,
    Tabs,
    Container,
    TableContainer,
    Typography,
    FormControlLabel,
    Checkbox,
    Tab,
    CircularProgress
} from '@mui/material';
import { Plus, Edit, Trash2 } from "lucide-react";
import * as tableStyles from '../styles/tableStyles';
import { getMovimientosInventarioMP, addMovimientoInventarioMP, updateMovimientoInventarioMP, deleteMovimientoInventarioMP } from '../services/MovimientoInventarioMPService';
import { getMovimientosInventarioPT, addMovimientoInventarioPT, updateMovimientoInventarioPT, deleteMovimientoInventarioPT } from '../services/MovimientoInventarioPTService';
import { getAlmacenes } from '../services/AlmacenService';
import { getMateriasPrimas } from '../services/MateriaPrimaService';
import { getProductosTerminados } from '../services/ProductoTerminadoService';
import { useModal } from '../hooks/useModal';
import CustomModal from '../components/CustomModal';
import useAuth from '../hooks/useAuth';
import { ROLES } from '../constants/roles';

const MovimientoInventario = () => {
    const { role } = useAuth();
    const isGuest = role === ROLES.GUEST;
    const [showGuestAlert, setShowGuestAlert] = useState(false);
    // CAMBIO 1: Leer el estado inicial desde localStorage.
    // Usamos una función en useState para que se ejecute solo la primera vez.
    const [tipoInventario, setTipoInventario] = useState(() => {
        const savedTab = localStorage.getItem('movimientoInventario_activeTab');
        // Si hay una pestaña guardada, úsala; si no, usa 'productosTerminados' como defecto.
        return savedTab || 'productosTerminados';
    });

    // Estado para el tipo de inventario en el formulario
    const [tipoInventarioForm, setTipoInventarioForm] = useState('productosTerminados');

    // Estados para movimientos de Materias Primas
    const [movimientosMP, setMovimientosMP] = useState([]);
    const [nuevoMovimientoMP, setNuevoMovimientoMP] = useState({
        almacenId: '',
        materiaPrimaId: '',
        tipoMovimiento: 'Entrada',
        cantidad: '',
        motivo: '',
        estadoRecepcion: false
    });

    // Estados para movimientos de Productos Terminados
    const [movimientosPT, setMovimientosPT] = useState([]);
    const [nuevoMovimientoPT, setNuevoMovimientoPT] = useState({
        almacenId: '',
        productoTerminadoId: '',
        tipoMovimiento: 'Entrada',
        cantidad: '',
        motivo: '',
        estadoEntrega: false
    });
    const [loading, setLoading] = useState(true);

    // Estados comunes
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [movimientoEditando, setMovimientoEditando] = useState(null);
    const [paginaActual, setPaginaActual] = useState(1);
    const [movimientosPorPagina, setMovimientosPorPagina] = useState(5);

    // Estados para datos relacionados
    const [almacenes, setAlmacenes] = useState([]);
    const [materiasPrimas, setMateriasPrimas] = useState([]);
    const [productosTerminados, setProductosTerminados] = useState([]);
    const [confirmationState, setConfirmationState] = useState({
        isOpen: false,
        title: '',
        onConfirm: () => { }
    });
    
    // Hook para modals
    const { modalConfig, showAlert, showConfirm, showError, showSuccess, hideModal } = useModal();
    // CAMBIO 2: Guardar la pestaña seleccionada en localStorage cada vez que cambie.
    useEffect(() => {
        localStorage.setItem('movimientoInventario_activeTab', tipoInventario);
    }, [tipoInventario]);


    useEffect(() => {
        const initializeData = async () => {
            try {
                setLoading(true);
                await fetchMovimientos();
                await fetchAlmacenes();
                await fetchMateriasPrimas();
                await fetchProductosTerminados();
            } catch (error) {
                console.error('Error al inicializar datos:', error);
            } finally {
                setLoading(false);
            }
        };
        initializeData();
    }, []);

    // ... (El resto del código de tus funciones no necesita cambios)
    // fetchMovimientos, fetchAlmacenes, handleInputChangeMP, etc... todo sigue igual
    const fetchMovimientos = async () => {
        try {
            const dataMP = await getMovimientosInventarioMP();
            const dataPT = await getMovimientosInventarioPT();

            // --- LA CORRECCIÓN ESTÁ AQUÍ ---
            // Para ordenar del más reciente al más antiguo (descendente), restamos a de b.
            // new Date(b.fecha...) - new Date(a.fecha...)
            const sortedMP = (dataMP || []).sort((a, b) => new Date(b.fechaMovimiento) - new Date(a.fechaMovimiento));
            const sortedPT = (dataPT || []).sort((a, b) => new Date(b.fechaMovimiento) - new Date(a.fechaMovimiento));

            // Guardamos los datos ya ordenados en el estado
            setMovimientosMP(sortedMP);
            setMovimientosPT(sortedPT);

        } catch (error) {
            console.error('Error al obtener movimientos de inventario', error);
        }
    };
    const fetchAlmacenes = async () => {
        try {
            const data = await getAlmacenes();
            console.log('Almacenes:', data);
            setAlmacenes(data || []);
        } catch (error) {
            console.error('Error al obtener almacenes', error);
            setAlmacenes([]);
        }
    };
    const fetchMateriasPrimas = async () => {
        try {
            const data = await getMateriasPrimas();
            console.log('Materias Primas:', data);
            setMateriasPrimas(data || []);
        } catch (error) {
            console.error('Error al obtener materias primas', error);
            setMateriasPrimas([]);
        }
    };
    const fetchProductosTerminados = async () => {
        try {
            const data = await getProductosTerminados();
            console.log('Productos Terminados:', data);
            setProductosTerminados(data || []);
        } catch (error) {
            console.error('Error al obtener productos terminados', error);
            setProductosTerminados([]);
        }
    };
    const handleInputChangeMP = (e) => {
        const { name, value } = e.target;
        setNuevoMovimientoMP(prev => ({ ...prev, [name]: value }));
    };
    const handleInputChangePT = (e) => {
        const { name, value } = e.target;
        setNuevoMovimientoPT(prev => ({ ...prev, [name]: value }));
    };
    const handleChangeTipoInventario = (event, newValue) => {
        setTipoInventario(newValue);
        setPaginaActual(1);
    };
    const handleChangeTipoInventarioForm = (event, newValue) => {
        setTipoInventarioForm(newValue);
        console.log("Cambiado tipo de inventario en formulario a:", newValue);
    }
    const handleCheckboxChange = (e, id, tipoInventario) => {
        if (isGuest) { 
            e.preventDefault(); 
            setShowGuestAlert(true); 
            return; 
        }
        
        const nuevoEstado = e.target.checked;
        const mensaje = nuevoEstado
            ? '¿Deseas confirmar el movimiento?'
            : '¿Deseas reestablecer el movimiento?';

        const handleConfirm = async () => {
            try {
                if (tipoInventario === 'materiasPrimas') {
                    const movimiento = movimientosMP.find(m => m.id === id);
                    if (movimiento) {
                        movimiento.estadoRecepcion = nuevoEstado;
                        await updateMovimientoInventarioMP(movimiento);
                        setMovimientosMP([...movimientosMP]);
                    }
                } else { // productosTerminados
                    const movimiento = movimientosPT.find(m => m.id === id);
                    if (movimiento) {
                        movimiento.estadoEntrega = nuevoEstado;
                        await updateMovimientoInventarioPT(movimiento);
                        setMovimientosPT([...movimientosPT]);
                    }
                }
            } catch (error) {
                console.error('Error al actualizar el estado del movimiento', error);
                showError('Error al actualizar el estado: ' + (error.response?.data?.message || error.message));
            } finally {
                // Cierra el modal después de la operación
                setConfirmationState({ isOpen: false, title: '', onConfirm: () => { } });
            }
        };

        // Abre el modal de confirmación con el título y la acción correspondientes
        setConfirmationState({
            isOpen: true,
            title: mensaje,
            onConfirm: handleConfirm
        });
    };

    const handleAgregarMovimiento = async () => {
        if (isGuest) { setShowGuestAlert(true); return; }
        try {
            if (tipoInventarioForm === 'materiasPrimas') {
                if (!nuevoMovimientoMP.almacenId || !nuevoMovimientoMP.materiaPrimaId || !nuevoMovimientoMP.cantidad || !nuevoMovimientoMP.motivo) {
                    showAlert('Por favor complete los campos obligatorios');
                    return;
                }
                const movimientoConFecha = {
                    ...nuevoMovimientoMP,
                    fechaMovimiento: new Date()
                };
                console.log('Datos MP a enviar:', movimientoConFecha);
                if (movimientoEditando) {
                    movimientoConFecha.id = movimientoEditando.id;
                    await updateMovimientoInventarioMP(movimientoConFecha);
                    // Actualización inmediata para edición
                    setMovimientosMP(prev => prev.map(mov => 
                        mov.id === movimientoEditando.id ? movimientoConFecha : mov
                    ).sort((a, b) => new Date(b.fechaMovimiento) - new Date(a.fechaMovimiento)));
                    showSuccess('Movimiento actualizado correctamente');
                } else {
                    const nuevoMovimiento = await addMovimientoInventarioMP(movimientoConFecha);
                    // Actualización inmediata para creación
                    setMovimientosMP(prev => [nuevoMovimiento, ...prev].sort((a, b) => 
                        new Date(b.fechaMovimiento) - new Date(a.fechaMovimiento)
                    ));
                    showSuccess('Movimiento creado correctamente');
                }

                setNuevoMovimientoMP({
                    almacenId: '',
                    materiaPrimaId: '',
                    tipoMovimiento: 'Entrada',
                    cantidad: '',
                    motivo: '',
                    estadoRecepcion: false
                });

            } else { // Para Productos Terminados
                if (!nuevoMovimientoPT.almacenId || !nuevoMovimientoPT.productoTerminadoId || !nuevoMovimientoPT.cantidad || !nuevoMovimientoPT.motivo) {
                    showAlert('Por favor complete los campos obligatorios');
                    return;
                }
                const movimientoConFecha = {
                    ...nuevoMovimientoPT,
                    fechaMovimiento: new Date()
                };
                console.log('Datos PT a enviar:', movimientoConFecha);
                if (movimientoEditando) {
                    movimientoConFecha.id = movimientoEditando.id;
                    await updateMovimientoInventarioPT(movimientoConFecha);
                    // Actualización inmediata para edición
                    setMovimientosPT(prev => prev.map(mov => 
                        mov.id === movimientoEditando.id ? movimientoConFecha : mov
                    ).sort((a, b) => new Date(b.fechaMovimiento) - new Date(a.fechaMovimiento)));
                    showSuccess('Movimiento actualizado correctamente');
                } else {
                    const nuevoMovimiento = await addMovimientoInventarioPT(movimientoConFecha);
                    // Actualización inmediata para creación
                    setMovimientosPT(prev => [nuevoMovimiento, ...prev].sort((a, b) => 
                        new Date(b.fechaMovimiento) - new Date(a.fechaMovimiento)
                    ));
                    showSuccess('Movimiento creado correctamente');
                }

                setNuevoMovimientoPT({
                    almacenId: '',
                    productoTerminadoId: '',
                    tipoMovimiento: 'Entrada',
                    cantidad: '',
                    motivo: '',
                    estadoEntrega: false
                });
            }

            setMovimientoEditando(null);
            setMostrarFormulario(false);

        } catch (error) {
            console.error('Error al registrar movimiento de inventario', error);
            showError('Error al registrar el movimiento: ' + (error.response?.data?.message || error.message));
        }
    };
    const handleCancelar = () => {
        setMostrarFormulario(false);
        setMovimientoEditando(null);
        setNuevoMovimientoMP({
            almacenId: '',
            materiaPrimaId: '',
            tipoMovimiento: 'Entrada',
            cantidad: '',
            motivo: ''
        });
        setNuevoMovimientoPT({
            almacenId: '',
            productoTerminadoId: '',
            tipoMovimiento: 'Entrada',
            cantidad: '',
            motivo: ''
        });
    };
    const handleEditarMovimiento = (movimiento, tipo) => {
        if (!movimiento) return;
        
        // Verificar si el movimiento está confirmado
        const estaConfirmado = tipo === 'materiasPrimas' 
            ? movimiento.estadoRecepcion 
            : movimiento.estadoEntrega;
        
        if (estaConfirmado) {
            showAlert(
                'No se puede editar un movimiento confirmado. Los movimientos confirmados ya han impactado el inventario y no pueden ser modificados para mantener la integridad de los datos.',
                'Movimiento Confirmado',
                'warning'
            );
            return;
        }
        
        console.log(`Movimiento ${tipo} a editar:`, movimiento);
        setMovimientoEditando(movimiento);
        if (tipo === 'materiasPrimas') {
            setTipoInventarioForm('materiasPrimas');
            setNuevoMovimientoMP({
                almacenId: movimiento.almacenId || '',
                materiaPrimaId: movimiento.materiaPrimaId || '',
                tipoMovimiento: movimiento.tipoMovimiento || 'Entrada',
                cantidad: movimiento.cantidad || '',
                motivo: movimiento.motivo || ''
            });
        } else {
            setTipoInventarioForm('productosTerminados');
            setNuevoMovimientoPT({
                almacenId: movimiento.almacenId || '',
                productoTerminadoId: movimiento.productoTerminadoId || '',
                tipoMovimiento: movimiento.tipoMovimiento || 'Entrada',
                cantidad: movimiento.cantidad || '',
                motivo: movimiento.motivo || ''
            });
        }
        setMostrarFormulario(true);
    };
    const handleEliminarMovimiento = async (id, tipo) => {
        if (!id) return;
        
        // Buscar el movimiento para verificar si está confirmado
        const movimiento = tipo === 'materiasPrimas' 
            ? movimientosMP.find(m => m.id === id)
            : movimientosPT.find(m => m.id === id);
        
        if (!movimiento) {
            showError('Movimiento no encontrado');
            return;
        }
        
        // Verificar si el movimiento está confirmado
        const estaConfirmado = tipo === 'materiasPrimas' 
            ? movimiento.estadoRecepcion 
            : movimiento.estadoEntrega;
        
        if (estaConfirmado) {
            showAlert(
                'No se puede eliminar un movimiento confirmado. Los movimientos confirmados ya han impactado el inventario y no pueden ser eliminados para mantener la integridad de los datos.',
                'Movimiento Confirmado',
                'warning'
            );
            return;
        }
        
        showConfirm('¿Está seguro que desea eliminar este movimiento?', async () => {
            try {
                if (tipo === 'materiasPrimas') {
                    await deleteMovimientoInventarioMP(id);
                    setMovimientosMP(prev => prev.filter(m => m.id !== id));
                } else {
                    await deleteMovimientoInventarioPT(id);
                    setMovimientosPT(prev => prev.filter(m => m.id !== id));
                }
                
                // Ajustar paginación si es necesario
                const movimientosActuales = tipo === 'materiasPrimas' ? movimientosMP : movimientosPT;
                const totalPages = Math.ceil((movimientosActuales.length - 1) / movimientosPorPagina);
                if (paginaActual > totalPages && totalPages > 0) {
                    setPaginaActual(totalPages);
                }
                
                showSuccess('Movimiento eliminado correctamente');
            } catch (error) {
                console.error('Error al eliminar movimiento de inventario', error);
                showError('Error al eliminar el movimiento: ' + error.message);
            }
        });
    };
    const handleChangePage = (event, value) => {
        setPaginaActual(value);
    };
    const movimientosActuales = tipoInventario === 'materiasPrimas' ? movimientosMP : movimientosPT;
    const indexOfLast = paginaActual * movimientosPorPagina;
    const indexOfFirst = indexOfLast - movimientosPorPagina;
    const movimientosPaginados = movimientosActuales.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(movimientosActuales.length / movimientosPorPagina);
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return '-';
        }
    };

    // --- NUEVO COMPONENTE PARA EL POPUP DE CONFIRMACIÓN ---
    const ConfirmationModal = ({ open, onClose, title, onConfirm }) => {
        return (
            <Modal
                open={open}
                onClose={onClose}
                aria-labelledby="confirmation-modal-title"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <Box
                    sx={{
                        p: 3,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        maxWidth: 400,
                        width: '100%',
                        textAlign: 'center'
                    }}
                >
                    <Typography id="confirmation-modal-title" variant="h6" component="h2">
                        {title}
                    </Typography>

                    {/* --- INICIO DE LA MODIFICACIÓN --- */}
                    {/* Este Box ahora alinea los botones en una fila, con "Sí" a la izquierda */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',       // obliga a fila
                            justifyContent: 'space-between', // separa a los extremos
                            gap: 2,
                            mt: 3,
                            width: '100%'               // ocupa todo el ancho disponible
                        }}
                    >
                        <Button
                            variant="contained"
                            onClick={onConfirm}
                            sx={{ flex: 1, mr: 1 }}     // cada botón con flex para igualar anchos
                        >
                            Sí
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={onClose}
                            sx={{ flex: 1, ml: 1 }}
                        >
                            Cancelar
                        </Button>
                    </Box>

                    {/* --- FIN DE LA MODIFICACIÓN --- */}

                </Box>
            </Modal>
        );
    };

    const getAlmacenNombre = (almacenId) => {
        const almacen = almacenes.find(a => a.id === almacenId);
        return almacen ? almacen.nombre : '-';
    };
    const getMateriaPrimaNombre = (materiaPrimaId) => {
        const materiaPrima = materiasPrimas.find(mp => mp.id === materiaPrimaId);
        return materiaPrima ? materiaPrima.nombre : '-';
    };
    const getMateriaPrimaUnidad = (materiaPrimaId) => {
        const materiaPrima = materiasPrimas.find(mp => mp.id === materiaPrimaId);
        return materiaPrima ? materiaPrima.unidad : '';
    };
    const getProductoTerminadoNombre = (productoTerminadoId) => {
        const producto = productosTerminados.find(pt => pt.id === productoTerminadoId);
        return producto ? producto.nombre : '-';
    };
    const getProductoTerminadoUnidad = (productoTerminadoId) => {
        const producto = productosTerminados.find(pt => pt.id === productoTerminadoId);
        return producto && producto.unidad ? producto.unidad : 'unid';
    };
    const renderBackgroundTipoMovimiento = (tipoMovimiento) => {
        switch (tipoMovimiento) {
            case "Entrada":
                return (<div style={{ backgroundColor: '#4ade80', color: 'white', padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', width: 'fit-content' }} > Entrada </div>);
            case "Salida":
                return (<div style={{ backgroundColor: '#f97316', color: 'white', padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', width: 'fit-content' }} > Salida </div>);
            default:
                return tipoMovimiento;
        }
    };

    return (
        <div className="container-general">
            {/* El JSX de tu return no necesita cambios, funcionará con la nueva lógica de estado */}
            {/* ... todo tu return sigue igual ... */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <h2>Gestión de Movimientos de Inventario</h2>
                <Button variant="contained" color="primary" onClick={() => isGuest ? setShowGuestAlert(true) : (() => { setMostrarFormulario(true); setTipoInventarioForm(tipoInventario); })()}>
                    <Plus size={16} /> Nuevo Movimiento
                </Button>
            </div>
            <Container sx={{ width: 'auto', display: 'flex', justifyContent: 'flex-start', maxWidth: 'none', marginLeft: '0', paddingLeft: 'none' }}>
                <Box sx={{ borderBottom: 0, backgroundColor: '#f5f7fa', borderRadius: '8px', padding: '4px', marginTop: 2, display: 'flex', justifyContent: 'flex-start', alignItems: 'center', width: '100%', }}>
                    <Tabs value={tipoInventario} onChange={handleChangeTipoInventario} aria-label="tipo de inventario tabs" indicatorColor="primary" textColor="primary" variant="standard"
                        sx={{
                            minHeight: '36px', '& .MuiTab-root': {
                                minHeight: '36px', textTransform: 'none', fontSize: '14px', fontWeight: 500, color: '#64748B', transition: 'color 0.3s ease, background-color 0.3s ease',
                                '&:hover': { color: '#0F172A', backgroundColor: 'rgba(15, 23, 42, 0.04)', },
                                '&.Mui-selected': {
                                    color: '#0F172A', fontWeight: 600,
                                    '&:hover': { color: '#0F172A', backgroundColor: 'rgba(15, 23, 42, 0.04)', }
                                }
                            }
                        }}
                    >
                        <Tab value="productosTerminados" label="Productos" />
                        <Tab value="materiasPrimas" label="Materias Primas" />
                    </Tabs>
                </Box>
            </Container>
            <div className="table-container">
                <div className="table-header" style={{ paddingTop: '0px', width: '100%' }}>
                    <h3 style={{ marginTop: '10px', textAlign: 'left' }}>
                        Lista de Movimientos - {tipoInventario === 'materiasPrimas' ? 'Materias Primas' : 'Productos Terminados'}
                    </h3>
                    <p style={{ margin: 0, textAlign: 'left' }}>
                        Administre los movimientos de entrada y salida de {tipoInventario === 'materiasPrimas' ? 'materias primas' : 'productos terminados'}
                    </p>
                </div>
                {loading ? (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '400px',
                            backgroundColor: '#ffffff',
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                            padding: '60px'
                        }}
                    >
                        <CircularProgress size={40} style={{ color: '#f59e0b' }} />
                        <Typography variant="body1" sx={{ marginTop: 2, color: '#666' }}>
                            Cargando movimientos de inventario...
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer sx={tableStyles.enhancedTableContainer}>
                    <Table>
                        <TableHead sx={tableStyles.enhancedTableHead}>
                            <TableRow>
                                <TableCell sx={tableStyles.hideColumnOnMobile}>Fecha</TableCell>
                                <TableCell>Almacén</TableCell>
                                <TableCell>
                                    {tipoInventario === 'materiasPrimas' ? 'Materia Prima' : 'Producto Terminado'}
                                </TableCell>
                                <TableCell>Tipo</TableCell>
                                <TableCell sx={tableStyles.hideColumnOnMobile}>Cantidad</TableCell>
                                <TableCell sx={tableStyles.hideColumnOnTablet}>Motivo</TableCell>
                                <TableCell sx={tableStyles.hideColumnOnTablet} align="center">¿Confirmado?</TableCell>
                                <TableCell align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {movimientosPaginados.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} sx={tableStyles.emptyTableMessage}>
                                        <Box className="empty-icon">📦</Box>
                                        <Typography>No hay movimientos registrados</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                movimientosPaginados.map((movimiento) => (
                                    movimiento && movimiento.id ? (
                                        <TableRow key={movimiento.id} sx={tableStyles.enhancedTableRow}>
                                            <TableCell sx={{ ...tableStyles.enhancedTableCell, ...tableStyles.hideColumnOnMobile }}>
                                                {formatDate(movimiento.fechaMovimiento)}
                                            </TableCell>
                                            <TableCell sx={tableStyles.enhancedTableCell}>{getAlmacenNombre(movimiento.almacenId)}</TableCell>
                                            <TableCell sx={tableStyles.enhancedTableCell}>
                                                {tipoInventario === 'materiasPrimas'
                                                    ? getMateriaPrimaNombre(movimiento.materiaPrimaId)
                                                    : getProductoTerminadoNombre(movimiento.productoTerminadoId)
                                                }
                                            </TableCell>
                                            <TableCell sx={tableStyles.enhancedTableCell}>{renderBackgroundTipoMovimiento(movimiento.tipoMovimiento)}</TableCell>
                                            <TableCell sx={{ ...tableStyles.enhancedTableCell, ...tableStyles.hideColumnOnMobile }}>
                                                {movimiento.cantidad || '0'} {tipoInventario === 'materiasPrimas'
                                                    ? getMateriaPrimaUnidad(movimiento.materiaPrimaId)
                                                    : getProductoTerminadoUnidad(movimiento.productoTerminadoId)
                                                }
                                            </TableCell>
                                            <TableCell sx={{ ...tableStyles.enhancedTableCell, ...tableStyles.hideColumnOnTablet }}>{movimiento.motivo || '-'}</TableCell>
                                            <TableCell sx={{ ...tableStyles.enhancedTableCell, ...tableStyles.hideColumnOnTablet }} align="center">
                                                {tipoInventario === 'materiasPrimas' ? (
                                                    <Checkbox
                                                        checked={movimiento.estadoRecepcion || false}
                                                        disabled={isGuest}
                                                        onChange={(e) => isGuest ? setShowGuestAlert(true) : handleCheckboxChange(e, movimiento.id, 'materiasPrimas')}
                                                    />
                                                ) : (
                                                    <Checkbox
                                                        checked={movimiento.estadoEntrega || false}
                                                        disabled={isGuest}
                                                        onChange={(e) => isGuest ? setShowGuestAlert(true) : handleCheckboxChange(e, movimiento.id, 'productosTerminados')}
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell sx={tableStyles.enhancedTableCell} align="center">
                                                <Box sx={tableStyles.enhancedTableCellActions}>
                                                    <Button 
                                                        color="primary" 
                                                        onClick={() => isGuest ? setShowGuestAlert(true) : handleEditarMovimiento(movimiento, tipoInventario)} 
                                                        sx={tableStyles.enhancedActionButton}
                                                        disabled={
                                                            isGuest || 
                                                            (tipoInventario === 'materiasPrimas' ? movimiento.estadoRecepcion : movimiento.estadoEntrega)
                                                        }
                                                        title={
                                                            (tipoInventario === 'materiasPrimas' ? movimiento.estadoRecepcion : movimiento.estadoEntrega)
                                                            ? 'No se puede editar un movimiento confirmado'
                                                            : 'Editar movimiento'
                                                        }
                                                    >
                                                        <Edit size={18} />
                                                    </Button>
                                                    <Button 
                                                        color="error" 
                                                        onClick={() => isGuest ? setShowGuestAlert(true) : handleEliminarMovimiento(movimiento.id, tipoInventario)} 
                                                        sx={tableStyles.enhancedActionButton}
                                                        disabled={
                                                            isGuest || 
                                                            (tipoInventario === 'materiasPrimas' ? movimiento.estadoRecepcion : movimiento.estadoEntrega)
                                                        }
                                                        title={
                                                            (tipoInventario === 'materiasPrimas' ? movimiento.estadoRecepcion : movimiento.estadoEntrega)
                                                            ? 'No se puede eliminar un movimiento confirmado'
                                                            : 'Eliminar movimiento'
                                                        }
                                                    >
                                                        <Trash2 size={18} />
                                                    </Button>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : null
                                ))
                            )}
                        </TableBody>
                    </Table>
                    {movimientosActuales.length > movimientosPorPagina && (
                        <Box sx={tableStyles.enhancedPagination}>
                            <Pagination
                                count={totalPages}
                                page={paginaActual}
                                onChange={handleChangePage}
                                color="primary"
                                showFirstButton
                                showLastButton
                            />
                        </Box>
                    )}
                </TableContainer>
                )}
            </div>

            <Modal open={mostrarFormulario} onClose={() => setMostrarFormulario(false)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box style={{ background: '#fff', padding: '20px', borderRadius: '10px', minWidth: '300px' }}>
                    <h3>{movimientoEditando ? 'Editar Movimiento' : 'Registrar Movimiento'}</h3>
                    <p style={{ margin: '0 0 15px 0' }}>
                        {movimientoEditando
                            ? 'Modifique los datos del movimiento'
                            : 'Registra entradas o salidas de inventario'}
                    </p>
                    <div
                        style={{ display: 'flex', gap: '10px', marginBottom: '16px', width: '100%', }}
                    >
                        <Button
                            fullWidth
                            variant={tipoInventarioForm === 'productosTerminados' ? 'contained' : 'outlined'}
                            sx={{
                                backgroundColor: tipoInventarioForm === 'productosTerminados' ? '#7c3aed' : 'transparent',
                                color: tipoInventarioForm === 'productosTerminados' ? 'white' : '#0F172A',
                                '&:hover': {
                                    backgroundColor: tipoInventarioForm === 'productosTerminados' ? '#6d28d9' : '#c7c7ff',
                                    boxShadow: tipoInventarioForm === 'productosTerminados' ? '0 2px 5px rgba(0,0,0,0.2)' : 'none',
                                    transform: 'translateY(-1px)',
                                },
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 500,
                                padding: '10px',
                                border: tipoInventarioForm === 'productosTerminados' ? 'none' : '1px solid #e2e8f0',
                            }}
                            onClick={() => handleChangeTipoInventarioForm(null, 'productosTerminados')}
                        >
                            Productos
                        </Button>
                        <Button
                            fullWidth
                            variant={tipoInventarioForm === 'materiasPrimas' ? 'contained' : 'outlined'}
                            sx={{
                                backgroundColor: tipoInventarioForm === 'materiasPrimas' ? '#7c3aed' : 'transparent',
                                color: tipoInventarioForm === 'materiasPrimas' ? 'white' : '#0F172A',
                                '&:hover': {
                                    backgroundColor: tipoInventarioForm === 'materiasPrimas' ? '#6d28d9' : '#c7c7ff',
                                    borderColor: tipoInventarioForm === 'materiasPrimas' ? '0 2px 5px rgba(0,0,0,0.2)' : 'none',
                                    transform: 'translateY(-1px)',
                                },
                                textTransform: 'none',
                                fontWeight: 500,
                                padding: '10px',
                            }}
                            onClick={() => handleChangeTipoInventarioForm(null, 'materiasPrimas')}
                        >
                            Materias Primas
                        </Button>
                    </div>
                    {tipoInventarioForm === 'materiasPrimas' && (
                        <>
                            <TextField select label="Tipo de Movimiento" name="tipoMovimiento" value={nuevoMovimientoMP.tipoMovimiento} onChange={handleInputChangeMP} fullWidth style={{ marginBottom: '15px' }} >
                                <MenuItem value="Entrada">Entrada</MenuItem>
                                <MenuItem value="Salida">Salida</MenuItem>
                            </TextField>
                            <TextField select label="Almacén" name="almacenId" value={nuevoMovimientoMP.almacenId} onChange={handleInputChangeMP} fullWidth style={{ marginBottom: '15px' }} error={!nuevoMovimientoMP.almacenId && nuevoMovimientoMP.almacenId !== ''} helperText={!nuevoMovimientoMP.almacenId && nuevoMovimientoMP.almacenId !== '' ? 'Seleccione un almacén' : ''} >
                                {almacenes.length > 0 ? (
                                    almacenes.map((almacen) => (
                                        almacen && almacen.id ? (<MenuItem key={almacen.id} value={almacen.id}> {almacen.nombre} </MenuItem>) : null
                                    ))
                                ) : (<MenuItem value="" disabled> No hay almacenes disponibles </MenuItem>)}
                            </TextField>
                            <TextField select label="Materia Prima" name="materiaPrimaId" value={nuevoMovimientoMP.materiaPrimaId} onChange={handleInputChangeMP} fullWidth style={{ marginBottom: '15px' }} error={!nuevoMovimientoMP.materiaPrimaId && nuevoMovimientoMP.materiaPrimaId !== ''} helperText={!nuevoMovimientoMP.materiaPrimaId && nuevoMovimientoMP.materiaPrimaId !== '' ? 'Seleccione una materia prima' : ''} >
                                {materiasPrimas.length > 0 ? (
                                    materiasPrimas.map((materiaPrima) => (
                                        materiaPrima && materiaPrima.id ? (<MenuItem key={materiaPrima.id} value={materiaPrima.id}> {materiaPrima.nombre} ({materiaPrima.unidad || 'Sin unidad'}) </MenuItem>) : null
                                    ))
                                ) : (<MenuItem value="" disabled> No hay materias primas disponibles </MenuItem>)}
                            </TextField>
                            <TextField 
                                type="number" 
                                label="Cantidad" 
                                name="cantidad" 
                                value={nuevoMovimientoMP.cantidad} 
                                onChange={handleInputChangeMP} 
                                fullWidth 
                                style={{ marginBottom: '15px' }} 
                                InputProps={{ inputProps: { min: 0, step: 1 } }} 
                                InputLabelProps={{ shrink: true }} 
                                error={!nuevoMovimientoMP.cantidad && nuevoMovimientoMP.cantidad !== ''} 
                                helperText={!nuevoMovimientoMP.cantidad && nuevoMovimientoMP.cantidad !== '' ? 'Ingrese una cantidad válida (no puede ser negativa)' : ''} 
                                onKeyDown={(e) => { if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault(); }}
                            />
                            <TextField label="Motivo" name="motivo" value={nuevoMovimientoMP.motivo} onChange={handleInputChangeMP} placeholder="Motivo del movimiento" fullWidth style={{ marginBottom: '20px' }} InputLabelProps={{ shrink: true }} error={!nuevoMovimientoMP.motivo && nuevoMovimientoMP.motivo !== ''} helperText={!nuevoMovimientoMP.motivo && nuevoMovimientoMP.motivo !== '' ? 'Ingrese un motivo' : ''} />
                            {/*<FormControlLabel control={ <Checkbox checked={nuevoMovimientoMP.estadoRecepcion || false} onChange={(e) => setNuevoMovimientoMP({ ...nuevoMovimientoMP, estadoRecepcion: e.target.checked })} name="estadoRecepcion" color="primary" /> } label="Estado de Recepción" style={{ marginBottom: '15px' }} />*/}
                        </>
                    )}
                    {tipoInventarioForm === 'productosTerminados' && (
                        <>
                            <TextField select label="Tipo de Movimiento" name="tipoMovimiento" value={nuevoMovimientoPT.tipoMovimiento} onChange={handleInputChangePT} fullWidth style={{ marginBottom: '15px' }} >
                                <MenuItem value="Entrada">Entrada</MenuItem>
                                <MenuItem value="Salida">Salida</MenuItem>
                            </TextField>
                            <TextField select label="Almacén" name="almacenId" value={nuevoMovimientoPT.almacenId} onChange={handleInputChangePT} fullWidth style={{ marginBottom: '15px' }} error={!nuevoMovimientoPT.almacenId && nuevoMovimientoPT.almacenId !== ''} helperText={!nuevoMovimientoPT.almacenId && nuevoMovimientoPT.almacenId !== '' ? 'Seleccione un almacén' : ''} >
                                {almacenes.length > 0 ? (
                                    almacenes.map((almacen) => (
                                        almacen && almacen.id ? (<MenuItem key={almacen.id} value={almacen.id}> {almacen.nombre} </MenuItem>) : null
                                    ))
                                ) : (<MenuItem value="" disabled> No hay almacenes disponibles </MenuItem>)}
                            </TextField>
                            <TextField select label="Producto Terminado" name="productoTerminadoId" value={nuevoMovimientoPT.productoTerminadoId} onChange={handleInputChangePT} fullWidth style={{ marginBottom: '15px' }} error={!nuevoMovimientoPT.productoTerminadoId && nuevoMovimientoPT.productoTerminadoId !== ''} helperText={!nuevoMovimientoPT.productoTerminadoId && nuevoMovimientoPT.productoTerminadoId !== '' ? 'Seleccione un producto terminado' : ''} >
                                {productosTerminados.length > 0 ? (
                                    productosTerminados.map((producto) => (
                                        producto && producto.id ? (<MenuItem key={producto.id} value={producto.id}> {producto.nombre} ({producto.unidad || 'unid'}) </MenuItem>) : null
                                    ))
                                ) : (<MenuItem value="" disabled> No hay productos terminados disponibles </MenuItem>)}
                            </TextField>
                            <TextField 
                                type="number" 
                                label="Cantidad" 
                                name="cantidad" 
                                value={nuevoMovimientoPT.cantidad} 
                                onChange={handleInputChangePT} 
                                fullWidth 
                                style={{ marginBottom: '15px' }} 
                                InputProps={{ inputProps: { min: 0, step: 1 } }}
                                InputLabelProps={{ shrink: true }} 
                                error={!nuevoMovimientoPT.cantidad && nuevoMovimientoPT.cantidad !== ''} 
                                helperText={!nuevoMovimientoPT.cantidad && nuevoMovimientoPT.cantidad !== '' ? 'Ingrese una cantidad válida (no puede ser negativa)' : ''} 
                                onKeyDown={(e) => { if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault(); }}
                            />
                            <TextField label="Motivo" name="motivo" value={nuevoMovimientoPT.motivo} onChange={handleInputChangePT} placeholder="Motivo del movimiento" fullWidth style={{ marginBottom: '20px' }} InputLabelProps={{ shrink: true }} error={!nuevoMovimientoPT.motivo && nuevoMovimientoPT.motivo !== ''} helperText={!nuevoMovimientoPT.motivo && nuevoMovimientoPT.motivo !== '' ? 'Ingrese un motivo' : ''} />
                            {/*<FormControlLabel control={ <Checkbox checked={nuevoMovimientoPT.estadoEntrega || false} onChange={(e) => setNuevoMovimientoPT({ ...nuevoMovimientoPT, estadoEntrega: e.target.checked })} name="estadoEntrega" color="primary" /> } label="Estado de Entrega" style={{ marginBottom: '15px' }} />*/}
                        </>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                        <Button variant="outlined" onClick={handleCancelar}> Cancelar </Button>
                        <Button variant="contained" color="primary" onClick={handleAgregarMovimiento} > {movimientoEditando ? 'Actualizar' : 'Registrar'} </Button>
                    </div>
                </Box>
            </Modal>


            {/* --- AÑADE ESTA LÍNEA AL FINAL --- */}
            <ConfirmationModal
                open={confirmationState.isOpen}
                onClose={() => setConfirmationState({ ...confirmationState, isOpen: false })}
                title={confirmationState.title}
                onConfirm={confirmationState.onConfirm}
            />

            <CustomModal
                config={modalConfig}
                onClose={hideModal}
            />

            <Modal open={showGuestAlert} onClose={() => setShowGuestAlert(false)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box style={{ background: '#fff', padding: '25px', borderRadius: '10px', minWidth: '400px', textAlign: 'center', borderTop: '5px solid #f44336' }}>
                    <Typography variant="h6" style={{ color: '#f44336', fontWeight: '600' }}>Acción Restringida</Typography>
                    <Typography style={{ margin: '15px 0' }}>
                        No tienes permisos para realizar esta acción. Solicita autorización a un administrador al WhastApp 985804246.
                    </Typography>
                    <Button variant="contained" color="primary" onClick={() => setShowGuestAlert(false)}>Entendido</Button>
                </Box>
            </Modal>
        </div>
    );
};

export default MovimientoInventario;