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
    Pagination
} from '@mui/material';
import { Plus, Edit, Trash2 } from "lucide-react";
import { getMovimientosInventarioMP, addMovimientoInventarioMP, updateMovimientoInventarioMP, deleteMovimientoInventarioMP } from '../services/MovimientoInventarioMPService';
import { getAlmacenes } from '../services/AlmacenService';
import { getMateriasPrimas } from '../services/MateriaPrimaService';

const MovimientoInventarioMP = () => {
    const [movimientos, setMovimientos] = useState([]);
    const [nuevoMovimiento, setNuevoMovimiento] = useState({
        almacenId: '',       // Cambiado de 'almacen' a 'almacenId'
        materiaPrimaId: '',  // Cambiado de 'materiaPrima' a 'materiaPrimaId'
        tipoMovimiento: 'Entrada',
        cantidad: '',
        motivo: ''
    });
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [movimientoEditando, setMovimientoEditando] = useState(null);
    const [paginaActual, setPaginaActual] = useState(1);
    const [movimientosPorPagina, setMovimientosPorPagina] = useState(5);
    const [almacenes, setAlmacenes] = useState([]);
    const [materiasPrimas, setMateriasPrimas] = useState([]);

    useEffect(() => {
        fetchMovimientos();
        fetchAlmacenes();
        fetchMateriasPrimas();
    }, []);

    const fetchMovimientos = async () => {
        try {
            const data = await getMovimientosInventarioMP();
            console.log('Movimientos:', data);  // Verificar datos de movimientos
            setMovimientos(data || []);
        } catch (error) {
            console.error('Error al obtener movimientos de inventario', error);
            setMovimientos([]);
        }
    };

    const fetchAlmacenes = async () => {
        try {
            const data = await getAlmacenes();
            console.log('Almacenes:', data);  // Verificar datos de almacenes
            setAlmacenes(data || []);
        } catch (error) {
            console.error('Error al obtener almacenes', error);
            setAlmacenes([]);
        }
    };

    const fetchMateriasPrimas = async () => {
        try {
            const data = await getMateriasPrimas();
            console.log('Materias Primas:', data);  // Verificar datos de materias primas
            setMateriasPrimas(data || []);
        } catch (error) {
            console.error('Error al obtener materias primas', error);
            setMateriasPrimas([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevoMovimiento(prev => ({ ...prev, [name]: value }));
    };
    const handleAgregarMovimiento = async () => {
        // Validación de campos
        if (!nuevoMovimiento.almacenId || !nuevoMovimiento.materiaPrimaId || !nuevoMovimiento.cantidad || !nuevoMovimiento.motivo) {
            alert('Por favor complete los campos obligatorios');
            return;
        }

        try {
            // Añadir fecha automáticamente
            const movimientoConFecha = {
                ...nuevoMovimiento,
                fechaMovimiento: new Date()
            };

            console.log('Datos a enviar:', movimientoConFecha);

            // Si está editando un movimiento existente
            if (movimientoEditando) {
                // Asegurarse de que el movimiento tenga el id (movimientoEditando.id)
                movimientoConFecha.id = movimientoEditando.id;
                await updateMovimientoInventarioMP(movimientoConFecha);
            } else {
                // Si es un nuevo movimiento
                await addMovimientoInventarioMP(movimientoConFecha);
            }

            // Refrescar lista desde backend después de agregar o actualizar
            await fetchMovimientos();

            // Limpiar formulario
            setNuevoMovimiento({
                almacenId: '',
                materiaPrimaId: '',
                tipoMovimiento: 'Entrada',
                cantidad: '',
                motivo: ''
            });
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
        setNuevoMovimiento({
            almacenId: '',
            materiaPrimaId: '',
            tipoMovimiento: 'Entrada',
            cantidad: '',
            motivo: ''
        });
    };

    const handleEditarMovimiento = (movimiento) => {
        if (!movimiento) return;

        console.log('Movimiento a editar:', movimiento);

        setMovimientoEditando(movimiento);
        setNuevoMovimiento({
            almacenId: movimiento.almacenId || '',
            materiaPrimaId: movimiento.materiaPrimaId || '',
            tipoMovimiento: movimiento.tipoMovimiento || 'Entrada',
            cantidad: movimiento.cantidad || '',
            motivo: movimiento.motivo || ''
        });
        setMostrarFormulario(true);
    };

    const handleEliminarMovimiento = async (id) => {
        if (!id) return;

        if (window.confirm('¿Está seguro que desea eliminar este movimiento?')) {
            try {
                await deleteMovimientoInventarioMP(id);
                // Eliminar el movimiento de la lista de movimientos
                const nuevosMovimientos = movimientos.filter(m => m.id !== id);
                setMovimientos(nuevosMovimientos);

                // Verificar si la página actual está vacía
                const totalPages = Math.ceil(nuevosMovimientos.length / movimientosPorPagina);
                if (paginaActual > totalPages) {
                    setPaginaActual(totalPages); // Cambiar a la última página si la actual ya no tiene registros
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

    const indexOfLast = paginaActual * movimientosPorPagina;
    const indexOfFirst = indexOfLast - movimientosPorPagina;
    const movimientosPaginados = movimientos.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(movimientos.length / movimientosPorPagina);

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


    const renderBackgroundTipoMovimiento = (tipoMovimiento) => {
        switch (tipoMovimiento) {
            case "Entrada":
                return (
                    <div style={{
                        backgroundColor: '#4ade80', // Color morado suave
                        color: 'white', // Color de texto morado oscuro
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
                        backgroundColor: '#f97316', // Color azul suave
                        color: 'white', // Color de texto azul oscuro
                        padding: '4px 10px',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        width: 'fit-content'
                    }}>
                        Salida
                    </div>
                );
        }
    };





    return (
        <div className="container-general">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <h2 style={{ margin: 0 }}>Gestión de Movimientos de Inventario</h2>
                <Button variant="contained" color="primary" onClick={() => setMostrarFormulario(true)}>
                    <Plus /> Nuevo Movimiento
                </Button>
            </div>

            <div className="table-container">
                <div className="table-header" style={{ paddingTop: '0px', width: '100%' }}>
                    <h3 style={{ marginTop: '10px', textAlign: 'left' }}>Lista de Movimientos</h3>
                    <p style={{ margin: 0, textAlign: 'left' }}>Administre los movimientos de entrada y salida de materias primas</p>
                </div>

                <div style={{ padding: '0px', borderRadius: '8px' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Fecha</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Almacén</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Materia Prima</TableCell>
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
                                            <TableCell>{getMateriaPrimaNombre(movimiento.materiaPrimaId)}</TableCell>
                                            <TableCell>{renderBackgroundTipoMovimiento(movimiento.tipoMovimiento)}</TableCell>
                                            <TableCell>
                                                {movimiento.cantidad || '0'} {getMateriaPrimaUnidad(movimiento.materiaPrimaId)}
                                            </TableCell>
                                            <TableCell>{movimiento.motivo || '-'}</TableCell>
                                            <TableCell>
                                                <Button color="primary" onClick={() => handleEditarMovimiento(movimiento)}>
                                                    <Edit size={18} />
                                                </Button>
                                                <Button color="error" onClick={() => handleEliminarMovimiento(movimiento.id)}>
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

                    {movimientos.length > movimientosPorPagina && (
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

            <Modal open={mostrarFormulario} onClose={() => setMostrarFormulario(false)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box style={{ background: '#fff', padding: '20px', borderRadius: '10px', minWidth: '400px' }}>
                    <h3>{movimientoEditando ? 'Editar Movimiento' : 'Registrar Movimiento'}</h3>
                    <p style={{ margin: '0 0 15px 0' }}>
                        {movimientoEditando
                            ? 'Modifique los datos del movimiento'
                            : 'Registra entradas o salidas de materias primas'}
                    </p>

                    <TextField
                        select
                        label="Tipo de Movimiento"
                        name="tipoMovimiento"
                        value={nuevoMovimiento.tipoMovimiento}
                        onChange={handleInputChange}
                        fullWidth
                        style={{ marginBottom: '15px' }}
                    >
                        <MenuItem value="Entrada">Entrada</MenuItem>
                        <MenuItem value="Salida">Salida</MenuItem>
                    </TextField>

                    <TextField
                        select
                        label="Almacén"
                        name="almacenId"  // Nombre del campo cambiado a almacenId
                        value={nuevoMovimiento.almacenId}
                        onChange={handleInputChange}
                        fullWidth
                        style={{ marginBottom: '15px' }}
                        error={!nuevoMovimiento.almacenId && nuevoMovimiento.almacenId !== ''}
                        helperText={!nuevoMovimiento.almacenId && nuevoMovimiento.almacenId !== '' ? 'Seleccione un almacén' : ''}
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
                        name="materiaPrimaId"  // Nombre del campo cambiado a materiaPrimaId
                        value={nuevoMovimiento.materiaPrimaId}
                        onChange={handleInputChange}
                        fullWidth
                        style={{ marginBottom: '15px' }}
                        error={!nuevoMovimiento.materiaPrimaId && nuevoMovimiento.materiaPrimaId !== ''}
                        helperText={!nuevoMovimiento.materiaPrimaId && nuevoMovimiento.materiaPrimaId !== '' ? 'Seleccione una materia prima' : ''}
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
                        value={nuevoMovimiento.cantidad}
                        onChange={handleInputChange}
                        fullWidth
                        style={{ marginBottom: '15px' }}
                        InputProps={{ inputProps: { min: 0 } }}
                        error={!nuevoMovimiento.cantidad && nuevoMovimiento.cantidad !== ''}
                        helperText={!nuevoMovimiento.cantidad && nuevoMovimiento.cantidad !== '' ? 'Ingrese una cantidad válida' : ''}
                    />

                    <TextField
                        label="Motivo"
                        name="motivo"
                        value={nuevoMovimiento.motivo}
                        onChange={handleInputChange}
                        placeholder="Motivo del movimiento"
                        fullWidth
                        style={{ marginBottom: '20px' }}
                        error={!nuevoMovimiento.motivo && nuevoMovimiento.motivo !== ''}
                        helperText={!nuevoMovimiento.motivo && nuevoMovimiento.motivo !== '' ? 'Ingrese un motivo' : ''}
                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={handleCancelar}
                            style={{ flex: '1' }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAgregarMovimiento}
                            style={{
                                flex: '1',
                                backgroundColor: nuevoMovimiento.tipoMovimiento === 'Entrada' ? '#4CAF50' : '#2196F3'
                            }}
                        >
                            {movimientoEditando
                                ? `Guardar ${nuevoMovimiento.tipoMovimiento}`
                                : `Registrar ${nuevoMovimiento.tipoMovimiento}`}
                        </Button>
                    </div>
                </Box>
            </Modal>
        </div>
    );
};

export default MovimientoInventarioMP;