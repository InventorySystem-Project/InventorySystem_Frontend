import React, { useState, useEffect } from 'react';
import { TextField, Button, Modal, Box, Pagination, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { Plus, Pencil, Trash2 } from "lucide-react";
import { getMateriasPrimas, addMateriaPrima, updateMateriaPrima, deleteMateriaPrima } from '../services/MateriaPrimaService';

const MateriaPrima = () => {
    const [materiasPrimas, setMateriasPrimas] = useState([]);
    const [nuevaMateriaPrima, setNuevaMateriaPrima] = useState({
        nombre: "",
        descripcion: "",
        precioUnitario: "",
        unidad: "",
        imagen: ""
    });
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [materiaPrimaEditando, setMateriaPrimaEditando] = useState(null);
    const [paginaActual, setPaginaActual] = useState(1);
    const [materiasPrimasPorPagina, setMateriasPrimasPorPagina] = useState(5);

    useEffect(() => {
        const fetchMateriasPrimas = async () => {
            try {
                const materiasPrimas = await getMateriasPrimas();
                setMateriasPrimas(materiasPrimas);
            } catch (error) {
                console.error('Error al obtener materias primas', error);
            }
        };
        fetchMateriasPrimas();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevaMateriaPrima(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAgregarMateriaPrima = async () => {
        // Verificar si todos los campos están completos
        if (!nuevaMateriaPrima.nombre || !nuevaMateriaPrima.precioUnitario || !nuevaMateriaPrima.unidad) {
            alert('Por favor complete los campos obligatorios');
            return;
        }

        try {
            if (materiaPrimaEditando) {
                // Si estamos editando una materia prima, la actualizamos
                await updateMateriaPrima(materiaPrimaEditando.id, nuevaMateriaPrima);
                setMateriasPrimas(prev => prev.map(m => m.id === materiaPrimaEditando.id ? { ...nuevaMateriaPrima, id: materiaPrimaEditando.id } : m));
            } else {
                // Si es una nueva materia prima, la agregamos
                const materiaPrima = await addMateriaPrima(nuevaMateriaPrima);
                setMateriasPrimas(prev => [materiaPrima, ...prev]);
            }

            // Limpiar los campos después de agregar o editar la materia prima
            setNuevaMateriaPrima({
                nombre: "",
                descripcion: "",
                precioUnitario: "",
                unidad: "",
                imagen: ""
            });

            setMateriaPrimaEditando(null);
            setMostrarFormulario(false);  // Cerrar el formulario
        } catch (error) {
            console.error('Error al agregar o actualizar materia prima', error);
        }
    };

    const handleCancelar = () => {
        setMostrarFormulario(false);
        setMateriaPrimaEditando(null);
        setNuevaMateriaPrima({
            nombre: "",
            descripcion: "",
            precioUnitario: "",
            unidad: "",
            imagen: ""
        });
    };

    const handleEditarMateriaPrima = (materiaPrima) => {
        setMateriaPrimaEditando(materiaPrima);
        setNuevaMateriaPrima(materiaPrima);
        setMostrarFormulario(true);
    };

    const handleEliminarMateriaPrima = async (id) => {
        try {
            await deleteMateriaPrima(id);
            setMateriasPrimas(prev => prev.filter(m => m.id !== id));
        } catch (error) {
            console.error('Error al eliminar materia prima', error);
        }
    };

    const handleChangePage = (event, value) => {
        setPaginaActual(value);
    };

    const handleChangeMateriasPrimasPorPagina = (event) => {
        const value = event.target.value;
        if (value === "all") {
            setMateriasPrimasPorPagina(materiasPrimas.length);
            setPaginaActual(1);
        } else {
            setMateriasPrimasPorPagina(Number(value));
            setPaginaActual(1);
        }
    };

    const indexOfLastMateriaPrima = paginaActual * materiasPrimasPorPagina;
    const indexOfFirstMateriaPrima = indexOfLastMateriaPrima - materiasPrimasPorPagina;
    const materiasPrimasPaginadas = materiasPrimas.slice(indexOfFirstMateriaPrima, indexOfLastMateriaPrima);

    const totalPages = Math.ceil(materiasPrimas.length / materiasPrimasPorPagina);

    return (
        <div className="container-general">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <h2 style={{ margin: 0 }}>Gestión de Materias Primas</h2>
                <Button variant="contained" color="primary" onClick={() => setMostrarFormulario(true)}>
                    <Plus /> Nueva Materia Prima
                </Button>
            </div>

            <div className="table-container">
                <div className="table-header" style={{ paddingTop: '0px', width: '100%' }}>
                    <h3 style={{ marginTop: '10px', textAlign: 'left' }}>Lista de Materias Primas</h3>
                    <p style={{ margin: 0, textAlign: 'left' }}>Administre sus materias primas</p>
                </div>

                <div style={{ padding: '0px', borderRadius: '8px' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ fontWeight: 'bold' }}>Nombre</TableCell>
                                <TableCell style={{ fontWeight: 'bold' }}>Descripción</TableCell>
                                <TableCell style={{ fontWeight: 'bold' }}>Precio Unitario</TableCell>
                                <TableCell style={{ fontWeight: 'bold' }}>Unidad</TableCell>
                                <TableCell style={{ fontWeight: 'bold' }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {materiasPrimasPaginadas.map((materiaPrima) => (
                                <TableRow key={materiaPrima.id}>
                                    <TableCell>{materiaPrima.nombre}</TableCell>
                                    <TableCell>{materiaPrima.descripcion}</TableCell>
                                    <TableCell>{materiaPrima.precioUnitario}</TableCell>
                                    <TableCell>{materiaPrima.unidad}</TableCell>
                                    <TableCell>
                                        <Button onClick={() => handleEditarMateriaPrima(materiaPrima)}><Pencil /></Button>
                                        <Button onClick={() => handleEliminarMateriaPrima(materiaPrima.id)}><Trash2 /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Pagination count={totalPages} page={paginaActual} onChange={handleChangePage} color="primary" showFirstButton showLastButton />
                </div>
            </div>

            <Modal open={mostrarFormulario} onClose={() => setMostrarFormulario(false)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box style={{ background: '#fff', padding: '20px', borderRadius: '10px', minWidth: '400px' }}>
                    <h3>{materiaPrimaEditando ? 'Editar Materia Prima' : 'Nueva Materia Prima'}</h3>
                    <TextField label="Nombre" name="nombre" value={nuevaMateriaPrima.nombre} onChange={handleInputChange} fullWidth />
                    <TextField label="Descripción" name="descripcion" value={nuevaMateriaPrima.descripcion} onChange={handleInputChange} fullWidth />
                    <TextField label="Precio Unitario" name="precioUnitario" value={nuevaMateriaPrima.precioUnitario} onChange={handleInputChange} fullWidth />
                    <TextField label="Unidad" name="unidad" value={nuevaMateriaPrima.unidad} onChange={handleInputChange} fullWidth />
                    <TextField label="Imagen" name="imagen" value={nuevaMateriaPrima.imagen} onChange={handleInputChange} fullWidth />
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                        <Button variant="outlined" color="primary" onClick={handleCancelar}>Cancelar</Button>
                        <Button variant="contained" color="primary" onClick={handleAgregarMateriaPrima}>Guardar</Button>
                    </div>
                </Box>
            </Modal>
        </div>
    );
};

export default MateriaPrima;
