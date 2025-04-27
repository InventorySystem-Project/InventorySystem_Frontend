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
    Tab
} from '@mui/material';
import { Plus, Edit, Trash2 } from "lucide-react";
import { getMovimientosInventarioMP, addMovimientoInventarioMP, updateMovimientoInventarioMP, deleteMovimientoInventarioMP } from '../services/MovimientoInventarioMPService';
import { getMovimientosInventarioPT, addMovimientoInventarioPT, updateMovimientoInventarioPT, deleteMovimientoInventarioPT } from '../services/MovimientoInventarioPTService';
import { getAlmacenes } from '../services/AlmacenService';
import { getMateriasPrimas } from '../services/MateriaPrimaService';
import { getProductosTerminados } from '../services/ProductoTerminadoService';

const MovimientoInventario = () => {
    // Estado para el tipo de inventario seleccionado (MP o PT)
    const [tipoInventario, setTipoInventario] = useState('materiasPrimas');

    // Estado para el tipo de inventario en el formulario
    const [tipoInventarioForm, setTipoInventarioForm] = useState('materiasPrimas');

    // Estados para movimientos de Materias Primas
    const [movimientosMP, setMovimientosMP] = useState([]);
    const [nuevoMovimientoMP, setNuevoMovimientoMP] = useState({
        almacenId: '',
        materiaPrimaId: '',
        tipoMovimiento: 'Entrada',
        cantidad: '',
        motivo: ''
    });

    // Estados para movimientos de Productos Terminados
    const [movimientosPT, setMovimientosPT] = useState([]);
    const [nuevoMovimientoPT, setNuevoMovimientoPT] = useState({
        almacenId: '',
        productoTerminadoId: '',
        tipoMovimiento: 'Entrada',
        cantidad: '',
        motivo: ''
    });

    // Estados comunes
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [movimientoEditando, setMovimientoEditando] = useState(null);
    const [paginaActual, setPaginaActual] = useState(1);
    const [movimientosPorPagina, setMovimientosPorPagina] = useState(5);

    // Estados para datos relacionados
    const [almacenes, setAlmacenes] = useState([]);
    const [materiasPrimas, setMateriasPrimas] = useState([]);
    const [productosTerminados, setProductosTerminados] = useState([]);

    useEffect(() => {
        fetchMovimientos();
        fetchAlmacenes();
        fetchMateriasPrimas();
        fetchProductosTerminados();
    }, []);

    // Función para cargar todos los movimientos según el tipo seleccionado
    const fetchMovimientos = async () => {
        try {
            // Cargar movimientos de materias primas
            const dataMP = await getMovimientosInventarioMP();
            console.log('Movimientos MP:', dataMP);
            setMovimientosMP(dataMP || []);

            // Cargar movimientos de productos terminados
            const dataPT = await getMovimientosInventarioPT();
            console.log('Movimientos PT:', dataPT);
            setMovimientosPT(dataPT || []);
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

    // Manejadores de cambio para Materias Primas
    const handleInputChangeMP = (e) => {
        const { name, value } = e.target;
        setNuevoMovimientoMP(prev => ({ ...prev, [name]: value }));
    };

    // Manejadores de cambio para Productos Terminados
    const handleInputChangePT = (e) => {
        const { name, value } = e.target;
        setNuevoMovimientoPT(prev => ({ ...prev, [name]: value }));
    };

    // Función para manejar el cambio de tipo de inventario
    const handleChangeTipoInventario = (event, newValue) => {
        setTipoInventario(newValue);
        setPaginaActual(1); // Resetear la paginación al cambiar de tipo
    };

    // Función mejorada para manejar el cambio de tipo de inventario en el formulario
    const handleChangeTipoInventarioForm = (event, newValue) => {
        setTipoInventarioForm(newValue);
        console.log("Cambiado tipo de inventario en formulario a:", newValue);
    }

    // Función para agregar o actualizar un movimiento
    const handleAgregarMovimiento = async () => {
        try {
            // Determinar si estamos procesando un movimiento de MP o PT
            if (tipoInventarioForm === 'materiasPrimas') {
                // Validación de campos para MP
                if (!nuevoMovimientoMP.almacenId || !nuevoMovimientoMP.materiaPrimaId || !nuevoMovimientoMP.cantidad || !nuevoMovimientoMP.motivo) {
                    alert('Por favor complete los campos obligatorios');
                    return;
                }

                // Añadir fecha automáticamente
                const movimientoConFecha = {
                    ...nuevoMovimientoMP,
                    fechaMovimiento: new Date()
                };

                console.log('Datos MP a enviar:', movimientoConFecha);

                // Si está editando un movimiento existente
                if (movimientoEditando) {
                    movimientoConFecha.id = movimientoEditando.id;
                    await updateMovimientoInventarioMP(movimientoConFecha);
                } else {
                    // Si es un nuevo movimiento
                    await addMovimientoInventarioMP(movimientoConFecha);
                }

                // Refrescar lista desde backend después de agregar o actualizar
                const dataMP = await getMovimientosInventarioMP();
                setMovimientosMP(dataMP || []);

                // Limpiar formulario MP
                setNuevoMovimientoMP({
                    almacenId: '',
                    materiaPrimaId: '',
                    tipoMovimiento: 'Entrada',
                    cantidad: '',
                    motivo: ''
                });
            } else {
                // Validación de campos para PT
                if (!nuevoMovimientoPT.almacenId || !nuevoMovimientoPT.productoTerminadoId || !nuevoMovimientoPT.cantidad || !nuevoMovimientoPT.motivo) {
                    alert('Por favor complete los campos obligatorios');
                    return;
                }

                // Añadir fecha automáticamente
                const movimientoConFecha = {
                    ...nuevoMovimientoPT,
                    fechaMovimiento: new Date()
                };

                console.log('Datos PT a enviar:', movimientoConFecha);

                // Si está editando un movimiento existente
                if (movimientoEditando) {
                    movimientoConFecha.id = movimientoEditando.id;
                    await updateMovimientoInventarioPT(movimientoConFecha);
                } else {
                    // Si es un nuevo movimiento
                    await addMovimientoInventarioPT(movimientoConFecha);
                }

                // Refrescar lista desde backend después de agregar o actualizar
                const dataPT = await getMovimientosInventarioPT();
                setMovimientosPT(dataPT || []);

                // Limpiar formulario PT
                setNuevoMovimientoPT({
                    almacenId: '',
                    productoTerminadoId: '',
                    tipoMovimiento: 'Entrada',
                    cantidad: '',
                    motivo: ''
                });
            }

            // Resetear estados comunes
            setMovimientoEditando(null);
            setMostrarFormulario(false);
        } catch (error) {
            console.error('Error al registrar movimiento de inventario', error);
            alert('Error al registrar el movimiento: ' + error.message);
        }
    };

    const handleCancelar = () => {
        setMostrarFormulario(false);
        setMovimientoEditando(null);
        // Resetear ambos formularios
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

    // Función para editar un movimiento según su tipo
    const handleEditarMovimiento = (movimiento, tipo) => {
        if (!movimiento) return;

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

    // Función para eliminar un movimiento según su tipo
    const handleEliminarMovimiento = async (id, tipo) => {
        if (!id) return;

        if (window.confirm('¿Está seguro que desea eliminar este movimiento?')) {
            try {
                if (tipo === 'materiasPrimas') {
                    await deleteMovimientoInventarioMP(id);
                    // Eliminar el movimiento de la lista de movimientos MP
                    const nuevosMovimientosMP = movimientosMP.filter(m => m.id !== id);
                    setMovimientosMP(nuevosMovimientosMP);
                } else {
                    await deleteMovimientoInventarioPT(id);
                    // Eliminar el movimiento de la lista de movimientos PT
                    const nuevosMovimientosPT = movimientosPT.filter(m => m.id !== id);
                    setMovimientosPT(nuevosMovimientosPT);
                }

                // Verificar si la página actual está vacía
                const movimientosActuales = tipo === 'materiasPrimas' ? movimientosMP : movimientosPT;
                const totalPages = Math.ceil(movimientosActuales.length / movimientosPorPagina);
                if (paginaActual > totalPages) {
                    setPaginaActual(totalPages > 0 ? totalPages : 1); // Cambiar a la última página si la actual ya no tiene registros
                }
            } catch (error) {
                console.error('Error al eliminar movimiento de inventario', error);
                alert('Error al eliminar el movimiento: ' + error.message);
            }
        }
    };

    const handleChangePage = (event, value) => {
        setPaginaActual(value);
    };

    // Calcular paginación según el tipo de inventario seleccionado
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

    // Obtener el nombre del almacén a partir del ID
    const getAlmacenNombre = (almacenId) => {
        const almacen = almacenes.find(a => a.id === almacenId);
        return almacen ? almacen.nombre : '-';
    };

    // Obtener el nombre de la materia prima a partir del ID
    const getMateriaPrimaNombre = (materiaPrimaId) => {
        const materiaPrima = materiasPrimas.find(mp => mp.id === materiaPrimaId);
        return materiaPrima ? materiaPrima.nombre : '-';
    };

    // Obtener la unidad de la materia prima a partir del ID
    const getMateriaPrimaUnidad = (materiaPrimaId) => {
        const materiaPrima = materiasPrimas.find(mp => mp.id === materiaPrimaId);
        return materiaPrima ? materiaPrima.unidad : '';
    };

    // Obtener el nombre del producto terminado a partir del ID
    const getProductoTerminadoNombre = (productoTerminadoId) => {
        const producto = productosTerminados.find(pt => pt.id === productoTerminadoId);
        return producto ? producto.nombre : '-';
    };

    // Obtener la unidad del producto terminado a partir del ID
    const getProductoTerminadoUnidad = (productoTerminadoId) => {
        const producto = productosTerminados.find(pt => pt.id === productoTerminadoId);
        return producto && producto.unidad ? producto.unidad : 'unid';
    };

    const renderBackgroundTipoMovimiento = (tipoMovimiento) => {
        switch (tipoMovimiento) {
            case "Entrada":
                return (
                    <div style={{
                        backgroundColor: '#4ade80', // Color verde
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        width: 'fit-content'
                    }}>
                        Entrada
                    </div>
                );
            case "Salida":
                return (
                    <div style={{
                        backgroundColor: '#f97316', // Color naranja
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        width: 'fit-content'
                    }}>
                        Salida
                    </div>
                );
            default:
                return tipoMovimiento;
        }
    };

    return (
        <div className="container-general">
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%'
            }}>
                <h2>Gestión de Movimientos de Inventario</h2>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        setMostrarFormulario(true);
                        setTipoInventarioForm(tipoInventario); // Sincroniza el tipo del formulario con el alternador
                    }}
                >
                    <Plus size={16} /> Nuevo Movimiento
                </Button>
            </div>

            {/* Tabs para cambiar entre Materias Primas y Productos Terminados */}
            <Container sx={{
                width: 'auto',
                display: 'flex',
                justifyContent: 'flex-start',

                maxWidth: 'none', // Esto elimina cualquier restricción de max-width
                marginLeft: '0',

                //backgroundColor: '#0747A6',
                paddingLeft: 'none'
            }}>
                <Box sx={{
                    borderBottom: 0,
                    backgroundColor: '#f5f7fa',
                    borderRadius: '8px',
                    padding: '4px',
                    marginTop: 2,
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    width: '100%', // Asegura que el Box ocupe todo el espacio disponible sin moverse
                }}>
                    <Tabs
                        value={tipoInventario}
                        onChange={handleChangeTipoInventario}
                        aria-label="tipo de inventario tabs"
                        indicatorColor="primary"
                        textColor="primary"
                        variant="standard"
                        sx={{
                            minHeight: '36px',
                            '& .MuiTab-root': {
                                minHeight: '36px',
                                textTransform: 'none',
                                fontSize: '14px',
                                fontWeight: 500,
                                // padding: '6px 16px',
                                color: '#64748B',
                                transition: 'color 0.3s ease, background-color 0.3s ease',
                                '&:hover': {
                                    color: '#0F172A',
                                    backgroundColor: 'rgba(15, 23, 42, 0.04)',
                                },
                                '&.Mui-selected': {
                                    color: '#0F172A',
                                    fontWeight: 600,
                                    '&:hover': {
                                        color: '#0F172A',
                                        backgroundColor: 'rgba(15, 23, 42, 0.04)',
                                    }
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

                <div style={{ padding: '0px', borderRadius: '8px' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Fecha</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Almacén</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>
                                    {tipoInventario === 'materiasPrimas' ? 'Materia Prima' : 'Producto Terminado'}
                                </TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Tipo</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Cantidad</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Motivo</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {movimientosPaginados.length > 0 ? (
                                movimientosPaginados.map((movimiento) => (
                                    movimiento && movimiento.id ? (
                                        <TableRow key={movimiento.id}>
                                            <TableCell>{formatDate(movimiento.fechaMovimiento)}</TableCell>
                                            <TableCell>{getAlmacenNombre(movimiento.almacenId)}</TableCell>
                                            <TableCell>
                                                {tipoInventario === 'materiasPrimas'
                                                    ? getMateriaPrimaNombre(movimiento.materiaPrimaId)
                                                    : getProductoTerminadoNombre(movimiento.productoTerminadoId)
                                                }
                                            </TableCell>
                                            <TableCell>{renderBackgroundTipoMovimiento(movimiento.tipoMovimiento)}</TableCell>
                                            <TableCell>
                                                {movimiento.cantidad || '0'} {tipoInventario === 'materiasPrimas'
                                                    ? getMateriaPrimaUnidad(movimiento.materiaPrimaId)
                                                    : getProductoTerminadoUnidad(movimiento.productoTerminadoId)
                                                }
                                            </TableCell>
                                            <TableCell>{movimiento.motivo || '-'}</TableCell>
                                            <TableCell>
                                                <Button color="primary" onClick={() => handleEditarMovimiento(movimiento, tipoInventario)}>
                                                    <Edit size={18} />
                                                </Button>
                                                <Button color="error" onClick={() => handleEliminarMovimiento(movimiento.id, tipoInventario)}>
                                                    <Trash2 size={18} />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ) : null
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        No hay movimientos registrados
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {movimientosActuales.length > movimientosPorPagina && (
                        <Pagination
                            count={totalPages}
                            page={paginaActual}
                            onChange={handleChangePage}
                            color="primary"
                            showFirstButton
                            showLastButton
                        />
                    )}
                </div>
            </div>

            {/* Modal para Agregar/Editar Movimientos */}
            <Modal open={mostrarFormulario} onClose={() => setMostrarFormulario(false)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box style={{ background: '#fff', padding: '20px', borderRadius: '10px', minWidth: '400px' }}>
                    <h3>{movimientoEditando ? 'Editar Movimiento' : 'Registrar Movimiento'}</h3>
                    <p style={{ margin: '0 0 15px 0' }}>
                        {movimientoEditando
                            ? 'Modifique los datos del movimiento'
                            : 'Registra entradas o salidas de inventario'}
                    </p>

                    {/* Botones para elegir tipo de movimiento a registrar */}
                    <div
                        style={{
                            display: 'flex',        // Alinea los elementos horizontalmente
                            gap: '10px',            // Espacio entre los botones
                            marginBottom: '16px',   // Espacio debajo del contenedor
                            width: '100%',          // Asegura que el contenedor ocupe todo el ancho disponible
                        }}
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
                                    //transition: 'all 0.2s ease-in-out',
                                },
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 500,
                                padding: '10px',
                                border: tipoInventarioForm === 'productosTerminados' ? 'none' : '1px solid #e2e8f0',
                                //transition: 'all 0.2s ease-in-out',
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
                                    //transition: 'all 0.2s ease-in-out',
                                },
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 500,
                                padding: '10px',
                                border: '1px solid #e2e8f0',
                                //transition: 'all 0.2s ease-in-out',
                            }}
                            onClick={() => handleChangeTipoInventarioForm(null, 'materiasPrimas')}
                        >
                            Materias Primas
                        </Button>
                    </div>


                    {/* Formulario para Materias Primas */}
                    {tipoInventarioForm === 'materiasPrimas' && (
                        <>
                            <TextField
                                select
                                label="Tipo de Movimiento"
                                name="tipoMovimiento"
                                value={nuevoMovimientoMP.tipoMovimiento}
                                onChange={handleInputChangeMP}
                                fullWidth
                                style={{ marginBottom: '15px' }}
                            >
                                <MenuItem value="Entrada">Entrada</MenuItem>
                                <MenuItem value="Salida">Salida</MenuItem>
                            </TextField>

                            <TextField
                                select
                                label="Almacén"
                                name="almacenId"
                                value={nuevoMovimientoMP.almacenId}
                                onChange={handleInputChangeMP}
                                fullWidth
                                style={{ marginBottom: '15px' }}
                                error={!nuevoMovimientoMP.almacenId && nuevoMovimientoMP.almacenId !== ''}
                                helperText={!nuevoMovimientoMP.almacenId && nuevoMovimientoMP.almacenId !== '' ? 'Seleccione un almacén' : ''}
                            >
                                {almacenes.length > 0 ? (
                                    almacenes.map((almacen) => (
                                        almacen && almacen.id ? (
                                            <MenuItem key={almacen.id} value={almacen.id}>
                                                {almacen.nombre}
                                            </MenuItem>
                                        ) : null
                                    ))
                                ) : (
                                    <MenuItem value="" disabled>
                                        No hay almacenes disponibles
                                    </MenuItem>
                                )}
                            </TextField>

                            <TextField
                                select
                                label="Materia Prima"
                                name="materiaPrimaId"
                                value={nuevoMovimientoMP.materiaPrimaId}
                                onChange={handleInputChangeMP}
                                fullWidth
                                style={{ marginBottom: '15px' }}
                                error={!nuevoMovimientoMP.materiaPrimaId && nuevoMovimientoMP.materiaPrimaId !== ''}
                                helperText={!nuevoMovimientoMP.materiaPrimaId && nuevoMovimientoMP.materiaPrimaId !== '' ? 'Seleccione una materia prima' : ''}
                            >
                                {materiasPrimas.length > 0 ? (
                                    materiasPrimas.map((materiaPrima) => (
                                        materiaPrima && materiaPrima.id ? (
                                            <MenuItem key={materiaPrima.id} value={materiaPrima.id}>
                                                {materiaPrima.nombre} ({materiaPrima.unidad || 'Sin unidad'})
                                            </MenuItem>
                                        ) : null
                                    ))
                                ) : (
                                    <MenuItem value="" disabled>
                                        No hay materias primas disponibles
                                    </MenuItem>
                                )}
                            </TextField>

                            <TextField
                                type="number"
                                label="Cantidad"
                                name="cantidad"
                                value={nuevoMovimientoMP.cantidad}
                                onChange={handleInputChangeMP}
                                fullWidth
                                style={{ marginBottom: '15px' }}
                                InputProps={{ inputProps: { min: 0 } }}
                                error={!nuevoMovimientoMP.cantidad && nuevoMovimientoMP.cantidad !== ''}
                                helperText={!nuevoMovimientoMP.cantidad && nuevoMovimientoMP.cantidad !== '' ? 'Ingrese una cantidad válida' : ''}
                            />

                            <TextField
                                label="Motivo"
                                name="motivo"
                                value={nuevoMovimientoMP.motivo}
                                onChange={handleInputChangeMP}
                                placeholder="Motivo del movimiento"
                                fullWidth
                                style={{ marginBottom: '20px' }}
                                error={!nuevoMovimientoMP.motivo && nuevoMovimientoMP.motivo !== ''}
                                helperText={!nuevoMovimientoMP.motivo && nuevoMovimientoMP.motivo !== '' ? 'Ingrese un motivo' : ''}
                            />
                        </>
                    )}

                    {/* Formulario para Productos Terminados */}
                    {tipoInventarioForm === 'productosTerminados' && (
                        <>
                            <TextField
                                select
                                label="Tipo de Movimiento"
                                name="tipoMovimiento"
                                value={nuevoMovimientoPT.tipoMovimiento}
                                onChange={handleInputChangePT}
                                fullWidth
                                style={{ marginBottom: '15px' }}
                            >
                                <MenuItem value="Entrada">Entrada</MenuItem>
                                <MenuItem value="Salida">Salida</MenuItem>
                            </TextField>

                            <TextField
                                select
                                label="Almacén"
                                name="almacenId"
                                value={nuevoMovimientoPT.almacenId}
                                onChange={handleInputChangePT}
                                fullWidth
                                style={{ marginBottom: '15px' }}
                                error={!nuevoMovimientoPT.almacenId && nuevoMovimientoPT.almacenId !== ''}
                                helperText={!nuevoMovimientoPT.almacenId && nuevoMovimientoPT.almacenId !== '' ? 'Seleccione un almacén' : ''}
                            >
                                {almacenes.length > 0 ? (
                                    almacenes.map((almacen) => (
                                        almacen && almacen.id ? (
                                            <MenuItem key={almacen.id} value={almacen.id}>
                                                {almacen.nombre}
                                            </MenuItem>
                                        ) : null
                                    ))
                                ) : (
                                    <MenuItem value="" disabled>
                                        No hay almacenes disponibles
                                    </MenuItem>
                                )}
                            </TextField>

                            <TextField
                                select
                                label="Producto Terminado"
                                name="productoTerminadoId"
                                value={nuevoMovimientoPT.productoTerminadoId}
                                onChange={handleInputChangePT}
                                fullWidth
                                style={{ marginBottom: '15px' }}
                                error={!nuevoMovimientoPT.productoTerminadoId && nuevoMovimientoPT.productoTerminadoId !== ''}
                                helperText={!nuevoMovimientoPT.productoTerminadoId && nuevoMovimientoPT.productoTerminadoId !== '' ? 'Seleccione un producto terminado' : ''}
                            >
                                {productosTerminados.length > 0 ? (
                                    productosTerminados.map((producto) => (
                                        producto && producto.id ? (
                                            <MenuItem key={producto.id} value={producto.id}>
                                                {producto.nombre} ({producto.unidad || 'unid'})
                                            </MenuItem>
                                        ) : null
                                    ))
                                ) : (
                                    <MenuItem value="" disabled>
                                        No hay productos terminados disponibles
                                    </MenuItem>
                                )}
                            </TextField>

                            <TextField
                                type="number"
                                label="Cantidad"
                                name="cantidad"
                                value={nuevoMovimientoPT.cantidad}
                                onChange={handleInputChangePT}
                                fullWidth
                                style={{ marginBottom: '15px' }}
                                InputProps={{ inputProps: { min: 0 } }}
                                error={!nuevoMovimientoPT.cantidad && nuevoMovimientoPT.cantidad !== ''}
                                helperText={!nuevoMovimientoPT.cantidad && nuevoMovimientoPT.cantidad !== '' ? 'Ingrese una cantidad válida' : ''}
                            />

                            <TextField
                                label="Motivo"
                                name="motivo"
                                value={nuevoMovimientoPT.motivo}
                                onChange={handleInputChangePT}
                                placeholder="Motivo del movimiento"
                                fullWidth
                                style={{ marginBottom: '20px' }}
                                error={!nuevoMovimientoPT.motivo && nuevoMovimientoPT.motivo !== ''}
                                helperText={!nuevoMovimientoPT.motivo && nuevoMovimientoPT.motivo !== '' ? 'Ingrese un motivo' : ''}
                            />
                        </>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                        <Button variant="outlined" onClick={handleCancelar}>
                            Cancelar
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAgregarMovimiento}
                        >
                            {movimientoEditando ? 'Actualizar' : 'Registrar'}
                        </Button>
                    </div>
                </Box>
            </Modal>
        </div>
    );
};

export default MovimientoInventario;