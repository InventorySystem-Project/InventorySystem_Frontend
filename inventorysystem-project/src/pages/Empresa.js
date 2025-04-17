import React, { useState, useEffect } from 'react';
import { TextField, Button, Modal, Box, Pagination, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
    getEmpresas,
    addEmpresa,
    updateEmpresa,
    deleteEmpresa
} from '../services/EmpresaService';

const Empresa = () => {
    const [empresas, setEmpresas] = useState([]);
    const [nuevaEmpresa, setNuevaEmpresa] = useState({ nombre: "", ruc: "", direccion: "" });
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [empresaEditando, setEmpresaEditando] = useState(null);
    const [paginaActual, setPaginaActual] = useState(1);
    const [empresasPorPagina, setEmpresasPorPagina] = useState(5);

    const fetchEmpresas = async () => {
        try {
            const data = await getEmpresas();
            setEmpresas(data);
        } catch (error) {
            console.error('Error al obtener empresas', error);
        }
    };

    useEffect(() => {
        fetchEmpresas();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevaEmpresa(prev => ({ ...prev, [name]: value }));
    };

    const handleGuardarEmpresa = async () => {
        if (!nuevaEmpresa.nombre || !nuevaEmpresa.ruc || !nuevaEmpresa.direccion) {
            alert('Por favor complete todos los campos');
            return;
        }

        try {
            if (empresaEditando) {
                await updateEmpresa({ ...nuevaEmpresa, id: empresaEditando.id });
            } else {
                await addEmpresa(nuevaEmpresa);
            }

            await fetchEmpresas();
            setNuevaEmpresa({ nombre: "", ruc: "", direccion: "" });
            setEmpresaEditando(null);
            setMostrarFormulario(false);
        } catch (error) {
            console.error('Error al guardar empresa', error);
        }
    };

    const handleCancelar = () => {
        setMostrarFormulario(false);
        setEmpresaEditando(null);
        setNuevaEmpresa({ nombre: "", ruc: "", direccion: "" });
    };

    const handleEditarEmpresa = (empresa) => {
        setEmpresaEditando(empresa);
        setNuevaEmpresa(empresa);
        setMostrarFormulario(true);
    };

    const handleEliminarEmpresa = async (id) => {
        try {
            await deleteEmpresa(id);
            setEmpresas(prev => prev.filter(e => e.id !== id));
        } catch (error) {
            console.error('Error al eliminar empresa', error);
        }
    };

    const handleChangePage = (event, value) => {
        setPaginaActual(value);
    };

    const indexOfLast = paginaActual * empresasPorPagina;
    const indexOfFirst = indexOfLast - empresasPorPagina;
    const empresasPaginadas = empresas.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(empresas.length / empresasPorPagina);

    return (
        <div className="container-general">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <h2 style={{ margin: 0 }}>Gestión de Empresas</h2>
                <Button variant="contained" color="primary" onClick={() => setMostrarFormulario(true)}>
                    <Plus /> Nueva Empresa
                </Button>
            </div>

            <div className="table-container">
                <div className="table-header" style={{ paddingTop: '0px', width: '100%' }}>
                    <h3 style={{ marginTop: '10px', textAlign: 'left' }}>Lista de Empresas</h3>
                    <p style={{ margin: 0, textAlign: 'left' }}>Administre sus empresas registradas</p>
                </div>

                <div style={{ padding: '0px', borderRadius: '8px' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ fontWeight: 'bold' }}>Nombre</TableCell>
                                <TableCell style={{ fontWeight: 'bold' }}>RUC</TableCell>
                                <TableCell style={{ fontWeight: 'bold' }}>Dirección</TableCell>
                                <TableCell style={{ fontWeight: 'bold' }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {empresasPaginadas.map((empresa) => (
                                <TableRow key={empresa.id}>
                                    <TableCell>{empresa.nombre}</TableCell>
                                    <TableCell>{empresa.ruc}</TableCell>
                                    <TableCell>{empresa.direccion}</TableCell>
                                    <TableCell>
                                        <Button color="primary" onClick={() => handleEditarEmpresa(empresa)}><Pencil size={18} /></Button>
                                        <Button color="error" onClick={() => handleEliminarEmpresa(empresa.id)}><Trash2 size={18} /></Button>
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
                    <h3>{empresaEditando ? 'Editar Empresa' : 'Nueva Empresa'}</h3>
                    <TextField label="Nombre" name="nombre" value={nuevaEmpresa.nombre} onChange={handleInputChange} fullWidth />
                    <TextField label="RUC" name="ruc" value={nuevaEmpresa.ruc} onChange={handleInputChange} fullWidth />
                    <TextField label="Dirección" name="direccion" value={nuevaEmpresa.direccion} onChange={handleInputChange} fullWidth />
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                        <Button variant="outlined" color="primary" onClick={handleCancelar}>Cancelar</Button>
                        <Button variant="contained" color="primary" onClick={handleGuardarEmpresa}>Guardar</Button>
                    </div>
                </Box>
            </Modal>
        </div>
    );
};

export default Empresa;
