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
} from '@mui/material'; import { Plus, Pencil, Trash2, Edit } from "lucide-react";
import { getMateriasPrimas, addMateriaPrima, updateMateriaPrima, deleteMateriaPrima } from '../services/MateriaPrimaService';

const MateriaPrima = () => {
    const [materiasPrimas, setMateriasPrimas] = useState([]);
    const [nuevaMateriaPrima, setNuevaMateriaPrima] = useState({ nombre: "", unidad: "" });
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [materiaPrimaEditando, setMateriaPrimaEditando] = useState(null);
    const [paginaActual, setPaginaActual] = useState(1);
    const [materiasPrimasPorPagina, setMateriasPrimasPorPagina] = useState(5);

    // Función para obtener materias primas desde el backend
    const fetchMateriasPrimas = async () => {
        try {
            const materiasPrimas = await getMateriasPrimas();
            setMateriasPrimas(materiasPrimas);
        } catch (error) {
            console.error('Error al obtener materias primas', error);
        }
    };

    // useEffect inicial
    useEffect(() => {
        fetchMateriasPrimas();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevaMateriaPrima(prev => ({ ...prev, [name]: value }));
    };

    const handleAgregarMateriaPrima = async () => {
        if (!nuevaMateriaPrima.nombre || !nuevaMateriaPrima.unidad) {
            alert('Por favor complete los campos obligatorios');
            return;
        }

        try {
            if (materiaPrimaEditando) {
                await updateMateriaPrima(materiaPrimaEditando.id, nuevaMateriaPrima);
            } else {
                await addMateriaPrima(nuevaMateriaPrima);
            }

            // Refrescar lista desde backend después de agregar o actualizar
            await fetchMateriasPrimas();

            // Limpiar formulario
            setNuevaMateriaPrima({ nombre: "", unidad: "" });
            setMateriaPrimaEditando(null);
            setMostrarFormulario(false);
        } catch (error) {
            console.error('Error al agregar o actualizar materia prima', error);
        }
    };

    const handleCancelar = () => {
        setMostrarFormulario(false);
        setMateriaPrimaEditando(null);
        setNuevaMateriaPrima({ nombre: "", unidad: "" });
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
        setMateriasPrimasPorPagina(value === "all" ? materiasPrimas.length : Number(value));
        setPaginaActual(1);
    };

    const indexOfLast = paginaActual * materiasPrimasPorPagina;
    const indexOfFirst = indexOfLast - materiasPrimasPorPagina;
    const materiasPrimasPaginadas = materiasPrimas.slice(indexOfFirst, indexOfLast);
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
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Nombre</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Unidad</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {materiasPrimasPaginadas.map((materiaPrima) => (
                                <TableRow key={materiaPrima.id}>
                                    <TableCell>{materiaPrima.nombre}</TableCell>
                                    <TableCell>{materiaPrima.unidad}</TableCell>
                                    <TableCell>
                                        <Button color="primary" onClick={() => handleEditarMateriaPrima(materiaPrima)}><Edit size={18} /></Button>
                                        <Button color="error" onClick={() => handleEliminarMateriaPrima(materiaPrima.id)}><Trash2 size={18} /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Pagination
                        count={totalPages}
                        page={paginaActual}
                        onChange={handleChangePage}
                        color="primary"
                        showFirstButton
                        showLastButton
                    />
                </div>
            </div>

            <Modal open={mostrarFormulario} onClose={() => setMostrarFormulario(false)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box style={{ background: '#fff', padding: '20px', borderRadius: '10px', minWidth: '400px' }}>
                    <h3>{materiaPrimaEditando ? 'Editar Materia Prima' : 'Nueva Materia Prima'}</h3>
                    <TextField label="Nombre" name="nombre" value={nuevaMateriaPrima.nombre} onChange={handleInputChange} fullWidth />
                    <TextField
                        select
                        label="Unidad"
                        name="unidad"
                        value={nuevaMateriaPrima.unidad}
                        onChange={handleInputChange}
                        fullWidth
                    >
                        <MenuItem value="m²">Metro cuadrado (m²)</MenuItem>
                        <MenuItem value="cm²">Centímetro cuadrado (cm²)</MenuItem>
                        <MenuItem value="m">Metro lineal (m)</MenuItem>
                        <MenuItem value="cm">Centímetro lineal (cm)</MenuItem>
                        <MenuItem value="kg">Kilogramo (kg)</MenuItem>
                        <MenuItem value="g">Gramo (g)</MenuItem>
                        <MenuItem value="L">Litro (L)</MenuItem>
                        <MenuItem value="mL">Mililitro (mL)</MenuItem>
                        <MenuItem value="unid.">Unidad (unid.)</MenuItem>
                        <MenuItem value="rollo">Rollo</MenuItem>
                        <MenuItem value="par">Par</MenuItem>
                    </TextField>
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
