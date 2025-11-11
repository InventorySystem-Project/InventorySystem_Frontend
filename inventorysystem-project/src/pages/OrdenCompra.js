import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    Button, Modal, Box, TextField, MenuItem, Table, TableHead, TableRow, TableCell, TableBody,
    Pagination, List, ListItem, ListItemText, Paper, ListSubheader, Tabs, Tab,
    Typography, IconButton, TableContainer, CircularProgress, Autocomplete
} from '@mui/material';
import * as tableStyles from '../styles/tableStyles';
import {
    FileText, Trash2, Plus, Clock, CheckCircle2, Loader2, XCircle, Edit, MessageSquareMore, AlertTriangle
} from "lucide-react";
import useAuth from '../hooks/useAuth';
import { ROLES } from '../constants/roles';
import { useModal } from '../hooks/useModal';
import CustomModal from '../components/CustomModal';

// --- Importaciones de servicios (sin cambios) ---
import { getMovimientosInventarioMP } from '../services/MovimientoInventarioMPService';
import { getMovimientosInventarioPT } from '../services/MovimientoInventarioPTService';
import { getOrdenesCompra, addOrdenCompra, deleteOrdenCompra, updateOrdenCompra, enviarPdfWhatsAppPorBackend } from '../services/OrdenCompraService';
import { getMateriasPrimas } from '../services/MateriaPrimaService';
import { getProductosTerminados } from '../services/ProductoTerminadoService';
import { getEmpresas } from '../services/EmpresaService';
import { getProveedores } from '../services/ProveedorService';
// import { registrarEnGoogleSheet } from '../services/GoogleSheetService'; // Comentado si no se usa

// --- Componente AlertasStockBajo (sin cambios) ---
const AlertasStockBajo = ({ titulo, alertas, onAnadirProducto }) => {
    // ... (código sin cambios) ...
     if (!alertas || alertas.length === 0) {
        return null;
    }
    return (
        <Paper elevation={2} sx={{ my: 2, p: 2, backgroundColor: '#FFFBEB' }}>
            <List dense subheader={
                <ListSubheader sx={{ bgcolor: 'transparent', color: '#92400E', display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                    <AlertTriangle size={20} /> {titulo}
                </ListSubheader>
            }>
                {alertas.map(alerta => (
                    <ListItem key={alerta.id} divider secondaryAction={
                        <Button variant="outlined" size="small" startIcon={<Plus size={16} />} onClick={() => onAnadirProducto(alerta.id)}>Añadir</Button>
                    }>
                        <ListItemText 
                            primary={alerta.nombre} 
                            secondary={`Stock actual: ${alerta.stockActual} (Mínimo: 5)`}
                            primaryTypographyProps={{ style: { color: '#1f2937', fontWeight: 500 } }}
                            secondaryTypographyProps={{ style: { color: '#6b7280' } }}
                        />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
};
// --- Fin AlertasStockBajo ---


const OrdenCompra = () => {
    // --- Estados (igual que antes, incluyendo los de PDF) ---
    const [tipoOrden, setTipoOrden] = useState('materiasPrimas');
    const [ordenes, setOrdenes] = useState([]);
    const [materiasPrimas, setMateriasPrimas] = useState([]);
    const [productosTerminados, setProductosTerminados] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [productosSeleccionados, setProductosSeleccionados] = useState([]);
    const [formulario, setFormulario] = useState({ empresaId: '', proveedorId: '', fechaEmision: new Date().toISOString().split('T')[0], estado: 'Aprobada' });
    const [codigoGenerado, setCodigoGenerado] = useState('');
    const [mostrarModal, setMostrarModal] = useState(false);
    const [paginaActual, setPaginaActual] = useState(1);
    const [productoActual, setProductoActual] = useState({ productoId: '', cantidad: '' });
    const [ordenEditando, setOrdenEditando] = useState(null);
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
    const [mostrarModalPdf, setMostrarModalPdf] = useState(false);
    const [movimientosMP, setMovimientosMP] = useState([]);
    const [alertasStockMP, setAlertasStockMP] = useState([]);
    const [movimientosPT, setMovimientosPT] = useState([]);
    const [alertasStockPT, setAlertasStockPT] = useState([]);
    const [loading, setLoading] = useState(true);

    const ordenesPorPagina = 5;
    const { role } = useAuth();
    const isGuest = role === ROLES.GUEST;
    const [showGuestAlert, setShowGuestAlert] = useState(false);
    
    // Hook para modals
    const { modalConfig, showAlert, showSuccess, showError, showConfirm, hideModal } = useModal();

    // --- useEffects (sin cambios) ---
    useEffect(() => {
        const fetchData = async () => {
             try {
                setLoading(true);
                const [
                    ordenesData, empresasData, proveedoresData, materiasPrimasData,
                    productosTerminadosData, movimientosMPData, movimientosPTData
                ] = await Promise.all([
                    getOrdenesCompra(), getEmpresas(), getProveedores(), getMateriasPrimas(),
                    getProductosTerminados(), getMovimientosInventarioMP(), getMovimientosInventarioPT()
                ]);
                setOrdenes((ordenesData || []).sort((a,b) => b.id - a.id));
                setEmpresas(empresasData || []);
                setProveedores(proveedoresData || []);
                setMateriasPrimas(materiasPrimasData || []);
                setProductosTerminados(productosTerminadosData || []);
                setMovimientosMP(movimientosMPData || []);
                setMovimientosPT(movimientosPTData || []);
            } catch (error) {
                 console.error("Error cargando datos iniciales:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

     useEffect(() => {
        if (materiasPrimas.length > 0 && Array.isArray(movimientosMP)) {
            const stockCalculado = {};
            movimientosMP.forEach(mov => {
                stockCalculado[mov.materiaPrimaId] = (stockCalculado[mov.materiaPrimaId] || 0) + (mov.tipoMovimiento === 'Entrada' ? mov.cantidad : -mov.cantidad);
            });
            const nuevasAlertas = materiasPrimas.map(mp => ({ ...mp, stockActual: stockCalculado[mp.id] || 0 })).filter(mp => mp.stockActual <= 5);
            setAlertasStockMP(nuevasAlertas);
        }
    }, [materiasPrimas, movimientosMP]);

    useEffect(() => {
        if (productosTerminados.length > 0 && Array.isArray(movimientosPT)) {
            const stockCalculado = {};
            movimientosPT.forEach(mov => {
                stockCalculado[mov.productoTerminadoId] = (stockCalculado[mov.productoTerminadoId] || 0) + (mov.tipoMovimiento === 'Entrada' ? mov.cantidad : -mov.cantidad);
            });
            const nuevasAlertas = productosTerminados.map(pt => ({ ...pt, stockActual: stockCalculado[pt.id] || 0 })).filter(pt => pt.stockActual <= 5);
            setAlertasStockPT(nuevasAlertas);
        }
    }, [productosTerminados, movimientosPT]);
    // --- Fin useEffects ---


    // --- Funciones Handler (sin cambios en la lógica interna) ---
    const handleAnadirDesdeAlerta = (productoId) => {
        const yaExiste = productosSeleccionados.some(p => p.productoId === productoId);
        if (yaExiste) {
                        showAlert("Este producto ya está en la orden de compra.", 'Producto Duplicado', 'warning');
            return;
        }
        // Buscar el producto para determinar el tipo si es necesario
        const mp = materiasPrimas.find(m => m.id === productoId);
        const pt = productosTerminados.find(p => p.id === productoId);
        const tipoProducto = mp ? 'materiasPrimas' : (pt ? 'productosTerminados' : null);

        // Si la orden actual es de otro tipo, preguntar o cambiar
        if(tipoProducto && tipoOrden !== tipoProducto) {
             showAlert(`Este producto es de tipo '${tipoProducto === 'materiasPrimas' ? 'Materias Primas' : 'Productos Terminados'}'. Cambie el tipo de orden o añada productos del tipo correcto.`, 'Tipo Incorrecto', 'warning');
             return; // O cambia setTipoOrden(tipoProducto) si quieres forzar el cambio
        }

        setProductosSeleccionados(prev => [...prev, { productoId, cantidad: 1 }]);
    };

    const handleEliminarProducto = (index) => {
        const nuevos = [...productosSeleccionados];
        nuevos.splice(index, 1);
        setProductosSeleccionados(nuevos);
    };

    const fetchOrdenesYRecalcular = async () => {
         try {
             const ordenesData = await getOrdenesCompra();
             setOrdenes((ordenesData || []).sort((a,b) => b.id - a.id));
         } catch (error) {
            console.error("Error recargando órdenes:", error);
         }
    };

    const handleRegistrarOrden = async () => {
        try {
            if (isGuest) { setShowGuestAlert(true); return; }
            if (!formulario.empresaId || !formulario.proveedorId || !formulario.fechaEmision || !formulario.estado || productosSeleccionados.length === 0) {
                showAlert("Por favor, complete todos los campos de la orden y añada al menos un producto.", 'Campos Requeridos', 'warning');
                return;
            }
            const nuevaOrdenParaBD = {
                empresaId: parseInt(formulario.empresaId, 10),
                proveedorId: parseInt(formulario.proveedorId, 10),
                fechaEmision: formulario.fechaEmision,
                estado: formulario.estado,
                codigoOrden: codigoGenerado,
                // tipo: tipoOrden, // No enviar 'tipo' explícitamente si el backend no lo usa
                detalles: productosSeleccionados.map(p => ({
                    materiaPrimaId: tipoOrden === 'materiasPrimas' ? parseInt(p.productoId, 10) : null,
                     productoTerminadoId: tipoOrden === 'productosTerminados' ? parseInt(p.productoId, 10) : null,
                    cantidad: parseInt(p.cantidad, 10) || 0
                }))
            };

            if (ordenEditando) {
                await updateOrdenCompra({ ...nuevaOrdenParaBD, id: ordenEditando.id });
                setOrdenes(prev => prev.map(o => o.id === ordenEditando.id ? { ...nuevaOrdenParaBD, id: ordenEditando.id } : o));
                showSuccess("Orden actualizada con éxito.");
            } else {
                const nuevaOrdenResponse = await addOrdenCompra(nuevaOrdenParaBD);
                setOrdenes(prev => [nuevaOrdenResponse, ...prev]);
                showSuccess("Orden registrada con éxito.");
            }            
            setMostrarModal(false);
        } catch (error) {
            console.error("❌ Error en handleRegistrarOrden:", error.response?.data || error.message || error);
            showError("Hubo un error al registrar/actualizar la orden: " + (error.response?.data?.message || error.message));
        }
    };

    const handleEditarOrden = (orden) => {
        setOrdenEditando(orden);
        const tipoDetectado = orden.tipo || (orden.detalles && orden.detalles.length > 0 && orden.detalles[0]?.materiaPrimaId ? 'materiasPrimas' : 'productosTerminados');
        setTipoOrden(tipoDetectado);
        setFormulario({
            empresaId: orden.empresaId || '',
            proveedorId: orden.proveedorId || '',
            fechaEmision: orden.fechaEmision ? new Date(orden.fechaEmision).toISOString().split('T')[0] : '',
            estado: orden.estado || ''
        });
        setCodigoGenerado(orden.codigoOrden || '');
        setProductosSeleccionados(orden.detalles?.map(d => ({
            productoId: tipoDetectado === 'materiasPrimas' ? d.materiaPrimaId : d.productoTerminadoId,
            cantidad: d.cantidad
        })) || []);
        setProductoActual({ productoId: '', cantidad: '' });
        setMostrarModal(true);
    };

    const handleOpenModal = () => {
        // Calcular el siguiente ID basado en las órdenes existentes
        const nextId = ordenes.length > 0 ? Math.max(...ordenes.map(o => o.id)) + 1 : 1;
        const today = new Date().toISOString().split('T')[0];
        setCodigoGenerado(`OC-${nextId.toString().padStart(4, '0')}`); // Usar nextId calculado
        setFormulario({ empresaId: '', proveedorId: '', fechaEmision: today, estado: 'Aprobada' });
        setOrdenEditando(null);
        setProductosSeleccionados([]);
        setProductoActual({ productoId: '', cantidad: '' });
        setTipoOrden('materiasPrimas'); // Resetear a MP al abrir nueva orden
        setMostrarModal(true);
    };

    const handleEliminarOrden = async (id) => {
        if (isGuest) { setShowGuestAlert(true); return; }
        
        showConfirm('¿Está seguro que desea eliminar esta orden de compra?', async () => {
            try {
                await deleteOrdenCompra(id);
                setOrdenes(prev => prev.filter(o => o.id !== id));
                showSuccess('Orden eliminada con éxito.');
            } catch (error) {
                console.error('Error eliminando orden:', error);
                showError('No se pudo eliminar la orden.');
            }
        });
    };
    // --- Fin Handlers ---

    // --- Función para generar PDF (devuelve Data URL - sin cambios) ---
    const generarPdfDataUrl = (orden) => {
        // ... (código sin cambios) ...
        const doc = new jsPDF();
        const empresa = empresas.find(e => e.id === orden.empresaId);
        const proveedor = proveedores.find(p => p.id === orden.proveedorId);
        // Determina la lista correcta de productos A PARTIR DEL TIPO DE ORDEN O DETALLES
        const tipoRealOrden = orden.tipo || (orden.detalles && orden.detalles.length > 0 && orden.detalles[0]?.materiaPrimaId ? 'materiasPrimas' : 'productosTerminados');
        const listaProductos = tipoRealOrden === 'materiasPrimas' ? materiasPrimas : productosTerminados;

        // Título y Código
        doc.setFontSize(18);
        doc.text(`Orden de Compra: ${orden.codigoOrden || 'N/A'}`, 14, 22);

        // Información de Empresa y Proveedor
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Empresa: ${empresa?.nombre || 'Desconocida'}`, 14, 32);
        doc.text(`Proveedor: ${proveedor?.nombreEmpresaProveedor || 'Desconocido'}`, 14, 38);
        doc.text(`Fecha Emisión: ${orden.fechaEmision ? new Date(orden.fechaEmision).toLocaleDateString('es-ES') : 'N/A'}`, 14, 44);
        doc.text(`Estado: ${orden.estado || 'N/A'}`, 14, 50);

        // Tabla de Detalles
        const tableColumn = ["Producto", "Cantidad", "Unidad"];
        const tableRows = [];

        orden.detalles?.forEach(detalle => {
            const productoId = tipoRealOrden === 'materiasPrimas' ? detalle.materiaPrimaId : detalle.productoTerminadoId;
            const producto = listaProductos.find(p => p.id === productoId);
            const row = [
                producto?.nombre || `ID: ${productoId}`,
                detalle.cantidad || 0,
                producto?.unidad || (tipoRealOrden === 'materiasPrimas' ? 'N/A' : 'unid')
            ];
            tableRows.push(row);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 60,
            theme: 'grid',
            headStyles: { fillColor: [76, 49, 148] }, // Ajusta el color si es necesario
        });

        return doc.output('datauristring');
    };
    // --- Fin generarPdfDataUrl ---

    // --- Handler para abrir el modal de vista previa (sin cambios) ---
    const handleAbrirPdfPreview = (orden) => {
        if (isGuest) { setShowGuestAlert(true); return; }
        try {
            const dataUrl = generarPdfDataUrl(orden);
            setPdfPreviewUrl(dataUrl);
            setMostrarModalPdf(true); // Cambiado a setMostrarModalPdf
        } catch (error) {
            console.error("Error generando PDF para vista previa:", error);
            showError("No se pudo generar la vista previa del PDF.");
        }
    };
    // --- Fin handler abrir PDF ---

    // --- Funciones de formato y renderizado (sin cambios) ---
    const renderEstado = (estado) => {
        const estilos = { padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', width: 'fit-content', gap: '5px' };
        switch (estado) {
            case 'En proceso': return (<div style={{ ...estilos, backgroundColor: '#FFF8E1', color: '#FFC107' }}><Clock size={16} /> En Proceso</div>);
            case 'Aprobada': return (<div style={{ ...estilos, backgroundColor: '#E3F2FD', color: '#2196F3' }}><Loader2 size={16} /> Aprobada</div>);
            case 'Recibida': return (<div style={{ ...estilos, backgroundColor: '#E8F5E9', color: '#4CAF50' }}><CheckCircle2 size={16} /> Recibida</div>);
            case 'Rechazada': return (<div style={{ ...estilos, backgroundColor: '#FFEBEE', color: '#F44336' }}><XCircle size={16} /> Rechazada</div>);
            default: return estado;
        }
    };
    // --- Fin funciones formato ---

    // Paginación (sin cambios)
    const indiceFinal = paginaActual * ordenesPorPagina;
    const indiceInicial = indiceFinal - ordenesPorPagina;
    const ordenesPaginadas = ordenes.slice(indiceInicial, indiceFinal);
    const totalPaginas = Math.ceil(ordenes.length / ordenesPorPagina);

    return (
        <div className="container-general">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '20px' }}>
                <h2>Gestión de Órdenes de Compra</h2>
                <Button variant="contained" color="primary" onClick={isGuest ? () => setShowGuestAlert(true) : handleOpenModal} startIcon={<Plus />}>
                    Nueva Orden
                </Button>
            </div>

            <div className="table-container">
                <div className="table-header" style={{ paddingTop: '0px', width: '100%' }}>
                    <h3 style={{ marginTop: '10px', textAlign: 'left' }}>Lista de Órdenes de Compra</h3>
                    <p style={{ margin: 0, textAlign: 'left' }}>Administre sus órdenes de compra a proveedores</p>
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
                    <CircularProgress size={40} style={{ color: '#8b5cf6' }} />
                    <Typography variant="body1" sx={{ marginTop: 2, color: '#666' }}>
                        Cargando órdenes de compra...
                    </Typography>
                </Box>
            ) : (
                <TableContainer sx={tableStyles.enhancedTableContainer}>
                <Table>
                    <TableHead sx={tableStyles.enhancedTableHead}>
                        <TableRow>
                            <TableCell>Código</TableCell>
                            <TableCell>Proveedor</TableCell>
                            <TableCell sx={tableStyles.hideColumnOnMobile}>Fecha</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell align="center">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {ordenesPaginadas.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} sx={tableStyles.emptyTableMessage}>
                                    <Box className="empty-icon">📋</Box>
                                    <Typography>No hay órdenes de compra registradas</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            ordenesPaginadas.map((orden) => (
                                <TableRow key={orden.id} sx={tableStyles.enhancedTableRow}>
                                    <TableCell sx={tableStyles.enhancedTableCell}><strong>{orden.codigoOrden}</strong></TableCell>
                                    <TableCell sx={tableStyles.enhancedTableCell}>{proveedores.find(p => p.id === orden.proveedorId)?.nombreEmpresaProveedor || "-"}</TableCell>
                                    <TableCell sx={{ ...tableStyles.enhancedTableCell, ...tableStyles.hideColumnOnMobile }}>
                                        {orden.fechaEmision ? new Date(orden.fechaEmision).toLocaleDateString('es-ES') : '-'}
                                    </TableCell>
                                    <TableCell sx={tableStyles.enhancedTableCell}>{renderEstado(orden.estado)}</TableCell>
                                    <TableCell sx={tableStyles.enhancedTableCell} align="center">
                                        <Box sx={tableStyles.enhancedTableCellActions}>
                                            <Button color="primary" onClick={() => isGuest ? setShowGuestAlert(true) : handleAbrirPdfPreview(orden)} sx={tableStyles.enhancedActionButton} startIcon={<FileText size={18} />}>
                                            </Button>
                                            <Button color="info" onClick={() => isGuest ? setShowGuestAlert(true) : handleEditarOrden(orden)} sx={tableStyles.enhancedActionButton} startIcon={<Edit size={18} />}>
                                            </Button>
                                            <Button color="error" onClick={() => isGuest ? setShowGuestAlert(true) : handleEliminarOrden(orden.id)} sx={tableStyles.enhancedActionButton} startIcon={<Trash2 size={18} />}>
                                            </Button>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {totalPaginas > 1 && (
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
                )}
            </TableContainer>
            )}
            </div>

            {/* --- MODAL PARA CREAR/EDITAR ORDEN --- */}
            <Modal 
                open={mostrarModal} 
                onClose={() => setMostrarModal(false)} 
                sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    padding: '20px'
                }}
            >
                <Box sx={{ 
                    background: '#fff', 
                    borderRadius: '16px', 
                    width: '90%',
                    maxWidth: '900px', 
                    maxHeight: '95vh', 
                    overflowY: 'auto',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Header */}
                    <Box sx={{ 
                        padding: '24px 30px', 
                        borderBottom: '1px solid #e5e7eb',
                        backgroundColor: '#f9fafb'
                    }}>
                        <Typography variant="h5" sx={{ 
                            color: '#1f2937', 
                            fontWeight: 700,
                            marginBottom: '8px'
                        }}>
                            {ordenEditando ? 'Editar Orden de Compra' : 'Nueva Orden de Compra'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            Complete la información de la orden y agregue los productos necesarios
                        </Typography>
                    </Box>

                    {/* Tabs */}
                    <Box sx={{ 
                        borderBottom: 1, 
                        borderColor: 'divider',
                        px: 3,
                        pt: 2
                    }}>
                        <Tabs 
                            value={tipoOrden} 
                            onChange={(e, newValue) => setTipoOrden(newValue)} 
                            sx={{
                                '& .MuiTab-root': {
                                    color: '#6b7280',
                                    fontWeight: 500,
                                    textTransform: 'none',
                                    fontSize: '0.95rem',
                                    '&.Mui-selected': {
                                        color: '#3b82f6',
                                        fontWeight: 600
                                    }
                                },
                                '& .MuiTabs-indicator': {
                                    backgroundColor: '#3b82f6',
                                    height: 3
                                }
                            }}
                        >
                            <Tab label="Materias Primas" value="materiasPrimas" />
                            <Tab label="Productos Terminados" value="productosTerminados" />
                        </Tabs>
                    </Box>

                    {/* Content */}
                    <Box sx={{ padding: '30px', flex: 1 }}>
                        {/* Alertas */}
                        {tipoOrden === 'materiasPrimas' && !ordenEditando && (
                            <AlertasStockBajo titulo="ALERTAS DE STOCK BAJO (MATERIAS PRIMAS)" alertas={alertasStockMP} onAnadirProducto={handleAnadirDesdeAlerta} />
                        )}
                        {tipoOrden === 'productosTerminados' && !ordenEditando && (
                            <AlertasStockBajo titulo="ALERTAS DE STOCK BAJO (PRODUCTOS TERMINADOS)" alertas={alertasStockPT} onAnadirProducto={handleAnadirDesdeAlerta} />
                        )}

                        {/* Sección: Información General */}
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h6" sx={{ 
                                color: '#1f2937', 
                                fontWeight: 600,
                                marginBottom: '20px',
                                fontSize: '1.1rem',
                                borderBottom: '2px solid #e5e7eb',
                                paddingBottom: '8px'
                            }}>
                                Información General
                            </Typography>
                            
                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                <Autocomplete
                                    fullWidth
                                    options={empresas}
                                    getOptionLabel={option => option.nombre}
                                    value={empresas.find(e => e.id === formulario.empresaId) || null}
                                    onChange={(event, newValue) => setFormulario({ ...formulario, empresaId: newValue ? newValue.id : '' })}
                                    renderInput={params => (
                                        <TextField 
                                            {...params} 
                                            label="Empresa" 
                                            required 
                                            variant="outlined"
                                            sx={{ 
                                                '& .MuiInputLabel-root': { color: '#6b7280' }, 
                                                '& .MuiInputBase-input': { color: '#1f2937' },
                                                '& .MuiOutlinedInput-root': {
                                                    '&:hover fieldset': { borderColor: '#9ca3af' },
                                                    '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                                                }
                                            }} 
                                        />
                                    )}
                                />
                                <TextField 
                                    fullWidth 
                                    label="Código de Orden" 
                                    value={codigoGenerado} 
                                    disabled 
                                    sx={{ 
                                        '& .MuiInputLabel-root': { color: '#6b7280' }, 
                                        '& .MuiInputBase-input': { color: '#6b7280' },
                                        backgroundColor: '#f3f4f6'
                                    }} 
                                />
                            </Box>
                            
                            <Autocomplete
                                fullWidth
                                options={proveedores}
                                getOptionLabel={option => option.nombreEmpresaProveedor}
                                value={proveedores.find(p => p.id === formulario.proveedorId) || null}
                                onChange={(event, newValue) => setFormulario({ ...formulario, proveedorId: newValue ? newValue.id : '' })}
                                renderInput={params => (
                                    <TextField 
                                        {...params} 
                                        label="Proveedor" 
                                        required 
                                        variant="outlined"
                                        sx={{ 
                                            mb: 2,
                                            '& .MuiInputLabel-root': { color: '#6b7280' }, 
                                            '& .MuiInputBase-input': { color: '#1f2937' },
                                            '& .MuiOutlinedInput-root': {
                                                '&:hover fieldset': { borderColor: '#9ca3af' },
                                                '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                                            }
                                        }} 
                                    />
                                )}
                            />

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField 
                                    fullWidth 
                                    type="date" 
                                    label="Fecha de Emisión" 
                                    InputLabelProps={{ shrink: true }} 
                                    value={formulario.fechaEmision} 
                                    onChange={e => setFormulario({ ...formulario, fechaEmision: e.target.value })} 
                                    required 
                                    sx={{ 
                                        '& .MuiInputLabel-root': { color: '#6b7280' }, 
                                        '& .MuiInputBase-input': { color: '#1f2937' },
                                        '& .MuiOutlinedInput-root': {
                                            '&:hover fieldset': { borderColor: '#9ca3af' },
                                            '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                                        }
                                    }} 
                                />
                                <TextField 
                                    fullWidth 
                                    select 
                                    label="Estado" 
                                    value={formulario.estado} 
                                    onChange={e => setFormulario({ ...formulario, estado: e.target.value })} 
                                    required 
                                    sx={{ 
                                        '& .MuiInputLabel-root': { color: '#6b7280' }, 
                                        '& .MuiInputBase-input': { color: '#1f2937' },
                                        '& .MuiOutlinedInput-root': {
                                            '&:hover fieldset': { borderColor: '#9ca3af' },
                                            '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                                        }
                                    }}
                                    MenuProps={{ 
                                        PaperProps: { 
                                            sx: { 
                                                '& .MuiMenuItem-root': { 
                                                    color: '#1f2937',
                                                    '&:hover': { backgroundColor: '#f3f4f6' },
                                                    '&.Mui-selected': { backgroundColor: '#dbeafe' }
                                                } 
                                            } 
                                        } 
                                    }}
                                >
                                    <MenuItem value="En proceso">En proceso</MenuItem>
                                    <MenuItem value="Aprobada">Aprobada</MenuItem>
                                    <MenuItem value="Recibida">Recibida</MenuItem>
                                    <MenuItem value="Rechazada">Rechazada</MenuItem>
                                </TextField>
                            </Box>
                        </Box>

                        {/* Sección: Productos */}
                        <Box>
                            <Typography variant="h6" sx={{ 
                                color: '#1f2937', 
                                fontWeight: 600,
                                marginBottom: '20px',
                                fontSize: '1.1rem',
                                borderBottom: '2px solid #e5e7eb',
                                paddingBottom: '8px'
                            }}>
                                Productos de la Orden
                            </Typography>

                            {/* Formulario para agregar productos */}
                            <Paper elevation={0} sx={{ 
                                p: 3, 
                                mb: 3, 
                                backgroundColor: '#f9fafb',
                                border: '1px solid #e5e7eb',
                                borderRadius: '12px'
                            }}>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                    <TextField 
                                        select 
                                        label="Producto" 
                                        value={productoActual.productoId} 
                                        onChange={e => setProductoActual({ ...productoActual, productoId: e.target.value })} 
                                        fullWidth
                                        sx={{ 
                                            flex: 2,
                                            '& .MuiInputLabel-root': { color: '#6b7280' }, 
                                            '& .MuiInputBase-input': { color: '#1f2937' },
                                            '& .MuiOutlinedInput-root': {
                                                '&:hover fieldset': { borderColor: '#9ca3af' },
                                                '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                                            }
                                        }}
                                        MenuProps={{ 
                                            PaperProps: { 
                                                sx: { 
                                                    '& .MuiMenuItem-root': { 
                                                        color: '#1f2937',
                                                        '&:hover': { backgroundColor: '#f3f4f6' },
                                                        '&.Mui-selected': { backgroundColor: '#dbeafe' }
                                                    } 
                                                } 
                                            } 
                                        }}
                                    >
                                        {tipoOrden === 'materiasPrimas' ?
                                            materiasPrimas.map(mp => <MenuItem key={mp.id} value={mp.id}>{mp.nombre}</MenuItem>) :
                                            productosTerminados.map(pt => <MenuItem key={pt.id} value={pt.id}>{pt.nombre}</MenuItem>)
                                        }
                                    </TextField>
                                    <TextField 
                                        type="number" 
                                        label="Cantidad"
                                        value={productoActual.cantidad} 
                                        onChange={e => setProductoActual({ ...productoActual, cantidad: e.target.value === '' ? '' : Number(e.target.value) })} 
                                        onFocus={e => e.target.select()} 
                                        InputProps={{ inputProps: { min: 1 } }} 
                                        sx={{ 
                                            width: '150px',
                                            '& .MuiInputLabel-root': { color: '#6b7280' }, 
                                            '& .MuiInputBase-input': { color: '#1f2937' },
                                            '& .MuiOutlinedInput-root': {
                                                '&:hover fieldset': { borderColor: '#9ca3af' },
                                                '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                                            }
                                        }} 
                                    />
                                    <Button 
                                        variant="contained" 
                                        onClick={() => {
                                            if (!productoActual.productoId || !productoActual.cantidad || productoActual.cantidad < 1) {
                                                showAlert('Seleccione un producto y una cantidad válida (mayor a 0).', 'Validación', 'warning'); 
                                                return;
                                            }
                                            if (productosSeleccionados.some(p => p.productoId === productoActual.productoId)) {
                                                showAlert('Este producto ya está en la lista.', 'Producto Duplicado', 'warning'); 
                                                return;
                                            }
                                            setProductosSeleccionados([...productosSeleccionados, productoActual]);
                                            setProductoActual({ productoId: '', cantidad: '' });
                                        }}
                                        startIcon={<Plus size={18} />}
                                        sx={{
                                            height: '56px',
                                            minWidth: '160px',
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                            '&:hover': {
                                                boxShadow: '0 6px 8px -1px rgba(0, 0, 0, 0.15)'
                                            }
                                        }}
                                    >
                                        Agregar
                                    </Button>
                                </Box>
                            </Paper>

                            {/* Tabla de productos */}
                            {productosSeleccionados.length > 0 ? (
                                <TableContainer component={Paper} elevation={0} sx={{ 
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '12px',
                                    overflow: 'hidden'
                                }}>
                                    <Table>
                                        <TableHead sx={{ backgroundColor: '#f9fafb' }}>
                                            <TableRow>
                                                <TableCell sx={{ color: '#1f2937', fontWeight: 600, fontSize: '0.875rem' }}>
                                                    Producto
                                                </TableCell>
                                                <TableCell align="right" sx={{ color: '#1f2937', fontWeight: 600, fontSize: '0.875rem' }}>
                                                    Cantidad
                                                </TableCell>
                                                <TableCell align="center" sx={{ color: '#1f2937', fontWeight: 600, fontSize: '0.875rem', width: '100px' }}>
                                                    Acción
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {productosSeleccionados.map((item, index) => {
                                                const lista = tipoOrden === 'materiasPrimas' ? materiasPrimas : productosTerminados;
                                                const producto = lista.find(p => p.id === item.productoId);
                                                return (
                                                    <TableRow 
                                                        key={index}
                                                        sx={{
                                                            '&:hover': { backgroundColor: '#f9fafb' },
                                                            '&:last-child td': { borderBottom: 0 }
                                                        }}
                                                    >
                                                        <TableCell sx={{ color: '#1f2937', fontWeight: 500 }}>
                                                            {producto?.nombre || '-'}
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ color: '#1f2937', fontWeight: 600 }}>
                                                            {item.cantidad}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <IconButton 
                                                                color="error" 
                                                                size="small" 
                                                                onClick={() => handleEliminarProducto(index)}
                                                                sx={{
                                                                    '&:hover': { backgroundColor: '#fee2e2' }
                                                                }}
                                                            >
                                                                <Trash2 size={18}/>
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Paper elevation={0} sx={{ 
                                    p: 4, 
                                    textAlign: 'center',
                                    backgroundColor: '#f9fafb',
                                    border: '1px dashed #d1d5db',
                                    borderRadius: '12px'
                                }}>
                                    <Typography sx={{ color: '#6b7280', fontSize: '0.95rem' }}>
                                        Aún no hay productos añadidos. Use el formulario arriba para agregar productos a la orden.
                                    </Typography>
                                </Paper>
                            )}
                        </Box>
                    </Box>

                    {/* Footer con botones */}
                    <Box sx={{ 
                        padding: '20px 30px', 
                        borderTop: '1px solid #e5e7eb',
                        backgroundColor: '#f9fafb',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 2
                    }}>
                        <Button 
                            variant="outlined" 
                            onClick={() => setMostrarModal(false)}
                            sx={{
                                minWidth: '120px',
                                textTransform: 'none',
                                fontWeight: 600,
                                borderColor: '#d1d5db',
                                color: '#6b7280',
                                '&:hover': {
                                    borderColor: '#9ca3af',
                                    backgroundColor: '#f3f4f6'
                                }
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={handleRegistrarOrden} 
                            disabled={productosSeleccionados.length === 0}
                            sx={{
                                minWidth: '160px',
                                textTransform: 'none',
                                fontWeight: 600,
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                '&:hover': {
                                    boxShadow: '0 6px 8px -1px rgba(0, 0, 0, 0.15)'
                                },
                                '&:disabled': {
                                    backgroundColor: '#d1d5db',
                                    color: '#9ca3af'
                                }
                            }}
                        >
                            {ordenEditando ? 'Actualizar Orden' : 'Registrar Orden'}
                        </Button>
                    </Box>
                </Box>
            </Modal>
            {/* --- FIN MODAL CREAR/EDITAR --- */}

            {/* --- MODAL ACCIÓN RESTRINGIDA PARA GUESTS --- */}
            <Modal open={showGuestAlert} onClose={() => setShowGuestAlert(false)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box style={{ background: '#fff', padding: '25px', borderRadius: '10px', minWidth: '400px', textAlign: 'center', borderTop: '5px solid #f44336' }}>
                    <Typography variant="h6" style={{ color: '#f44336', fontWeight: '600' }}>Acción Restringida</Typography>
                    <Typography style={{ margin: '15px 0' }}>
                        No tienes permisos para realizar esta acción. Solicita autorización a un administrador al WhastApp 985804246.
                    </Typography>
                    <Button variant="contained" color="primary" onClick={() => setShowGuestAlert(false)}>Entendido</Button>
                </Box>
            </Modal>

            {/* --- MODAL PARA VISTA PREVIA PDF (Sin cambios) --- */}
            <Modal
                open={mostrarModalPdf} // Usar el estado correcto
                onClose={() => setMostrarModalPdf(false)} // Usar el setter correcto
                aria-labelledby="pdf-preview-title"
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <Box sx={{
                    bgcolor: 'background.paper',
                    width: '90%',
                    height: '90%',
                    maxWidth: '800px',
                    maxHeight: '80vh',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '8px',
                    boxShadow: 24,
                }}>
                    <Typography id="pdf-preview-title" variant="h6" component="h2" sx={{ mb: 2, textAlign: 'center' }}>
                        Vista Previa - Orden de Compra
                    </Typography>
                    {pdfPreviewUrl ? (
                        <iframe
                            src={pdfPreviewUrl}
                            title="Vista Previa PDF"
                            style={{ width: '100%', height: '100%', border: 'none' }}
                        />
                    ) : (
                        <Typography sx={{ textAlign: 'center' }}>Generando vista previa...</Typography>
                    )}
                    <Button onClick={() => setMostrarModalPdf(false)} sx={{ mt: 2, alignSelf: 'flex-end' }}>
                        Cerrar
                    </Button>
                </Box>
            </Modal>
            {/* --- FIN MODAL PDF --- */}

            {/* Modal del sistema de alertas profesional */}
            <CustomModal
                config={modalConfig}
                onClose={hideModal}
            />

        </div>
    );
};

export default OrdenCompra;