import React, { useState, useEffect } from 'react';
import { TextField, Button, Modal, Box, Pagination, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { Plus, Pencil, Trash2 } from "lucide-react";
import { getProveedores, addProveedor, updateProveedor, deleteProveedor } from '../services/ProveedorService';

const Proveedores = () => {
    const [proveedores, setProveedores] = useState([]);
    const [nuevoProveedor, setNuevoProveedor] = useState({
        nombreEmpresaProveedor: "",
        nombreContacto: "",
        telefono: "",
        correo: "",
        direccion: "",
        categoria: "",
        pais: "",
        enabled: true,
        ruc: ""
    });
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [proveedorEditando, setProveedorEditando] = useState(null);
    const [paginaActual, setPaginaActual] = useState(1);
    const [proveedoresPorPagina, setProveedoresPorPagina] = useState(5);
    const [paises, setPaises] = useState([]);  // Nuevo estado para los países

    useEffect(() => {
        const fetchProveedores = async () => {
            try {
                const proveedores = await getProveedores();
                setProveedores(proveedores);
            } catch (error) {
                console.error('Error al obtener proveedores', error);
            }
        };

        const fetchPaises = async () => {
            try {
                const response = await fetch('https://restcountries.com/v3.1/all');
                const data = await response.json();
                // Ordenar los países alfabéticamente por nombre común
                const paisesOrdenados = data.sort((a, b) => a.name.common.localeCompare(b.name.common));
                setPaises(paisesOrdenados);  // Guardar la lista de países ordenados en el estado
            } catch (error) {
                console.error('Error al obtener los países', error);
            }
        };

        fetchProveedores();
        fetchPaises();  // Llamar a la función para obtener los países
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevoProveedor(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAgregarProveedor = async () => {
        // Verificar si todos los campos están completos
        if (!nuevoProveedor.nombreEmpresaProveedor || !nuevoProveedor.nombreContacto || !nuevoProveedor.telefono || !nuevoProveedor.ruc) {
            alert('Por favor complete los campos obligatorios');
            return;
        }

        try {
            let proveedor;

            if (proveedorEditando) {
                // Si estamos editando un proveedor, lo actualizamos
                await updateProveedor(proveedorEditando.id, nuevoProveedor);
                setProveedores(prev => prev.map(p => p.id === proveedorEditando.id ? { ...nuevoProveedor, id: proveedorEditando.id } : p));
            } else {
                // Si es un nuevo proveedor, lo agregamos
                proveedor = { ...nuevoProveedor, id: Date.now() }; // Usamos una id temporal
                setProveedores(prev => [proveedor, ...prev]);  // Actualizamos inmediatamente el estado
                await addProveedor(nuevoProveedor);  // Ahora sincronizamos con el backend
            }

            // Limpiar los campos después de agregar o editar el proveedor
            setNuevoProveedor({
                nombreEmpresaProveedor: "",
                nombreContacto: "",
                telefono: "",
                correo: "",
                direccion: "",
                categoria: "",
                pais: "",
                ruc: "",
                enabled: true
            });

            setProveedorEditando(null);
            setMostrarFormulario(false);  // Cerrar el formulario
        } catch (error) {
            console.error('Error al agregar o actualizar proveedor', error);
        }
    };

    const handleCancelar = () => {
        setMostrarFormulario(false);
        setProveedorEditando(null);
        setNuevoProveedor({
            nombreEmpresaProveedor: "",
            nombreContacto: "",
            telefono: "",
            correo: "",
            direccion: "",
            categoria: "",
            pais: "",
            ruc: "",
            enabled: true
        });
    };

    const handleEditarProveedor = (proveedor) => {
        setProveedorEditando(proveedor);
        setNuevoProveedor(proveedor);
        setMostrarFormulario(true);
    };

    const handleEliminarProveedor = async (id) => {
        try {
            await deleteProveedor(id);
            setProveedores(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error al eliminar el proveedor', error);
        }
    };

    const handleChangePage = (event, value) => {
        setPaginaActual(value);
    };

    const handleChangeProveedoresPorPagina = (event) => {
        const value = event.target.value;
        if (value === "all") {
            setProveedoresPorPagina(proveedores.length);
            setPaginaActual(1);
        } else {
            setProveedoresPorPagina(Number(value));
            setPaginaActual(1);
        }
    };

    const indexOfLastProveedor = paginaActual * proveedoresPorPagina;
    const indexOfFirstProveedor = indexOfLastProveedor - proveedoresPorPagina;
    const proveedoresPaginados = proveedores.slice(indexOfFirstProveedor, indexOfLastProveedor);

    const totalPages = Math.ceil(proveedores.length / proveedoresPorPagina);

    return (
        <div className="container-general">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <h2 style={{ margin: 0 }}>Gestión de Proveedores</h2>
                <Button variant="contained" color="primary" onClick={() => setMostrarFormulario(true)}>
                    <Plus /> Nuevo Proveedor
                </Button>
            </div>

            <div className="table-container">
                <div className="table-header" style={{ paddingTop: '0px', width: '100%' }}>
                    <h3 style={{ marginTop: '10px', textAlign: 'left' }}>Lista de Proveedores</h3>
                    <p style={{ margin: 0, textAlign: 'left' }}>Administre sus proveedores de materias primas</p>
                </div>

                <div style={{ padding: '0px', borderRadius: '8px' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ fontWeight: 'bold' }}>Nombre Empresa</TableCell>
                                <TableCell style={{ fontWeight: 'bold' }}>RUC</TableCell>
                                <TableCell style={{ fontWeight: 'bold' }}>Contacto</TableCell>
                                <TableCell style={{ fontWeight: 'bold' }}>País</TableCell>
                                <TableCell style={{ fontWeight: 'bold' }}>Teléfono</TableCell>
                                <TableCell style={{ fontWeight: 'bold' }}>Correo</TableCell>
                                <TableCell style={{ fontWeight: 'bold' }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {proveedoresPaginados.map((proveedor) => (
                                <TableRow key={proveedor.id}>
                                    <TableCell>{proveedor.nombreEmpresaProveedor}</TableCell>
                                    <TableCell>{proveedor.ruc}</TableCell>
                                    <TableCell>{proveedor.nombreContacto}</TableCell>
                                    <TableCell>{proveedor.pais}</TableCell>
                                    <TableCell>{proveedor.telefono}</TableCell>
                                    <TableCell>{proveedor.correo}</TableCell>
                                    <TableCell>
                                        <Button onClick={() => handleEditarProveedor(proveedor)}><Pencil /></Button>
                                        <Button onClick={() => handleEliminarProveedor(proveedor.id)}><Trash2 /></Button>
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
                    <h3>{proveedorEditando ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h3>
                    <TextField label="Nombre Empresa" name="nombreEmpresaProveedor" value={nuevoProveedor.nombreEmpresaProveedor} onChange={handleInputChange} fullWidth />
                    <TextField label="RUC" name="ruc" value={nuevoProveedor.ruc} onChange={handleInputChange} fullWidth />
                    <TextField label="Nombre de Contacto" name="nombreContacto" value={nuevoProveedor.nombreContacto} onChange={handleInputChange} fullWidth />
                    <TextField label="Teléfono" name="telefono" value={nuevoProveedor.telefono} onChange={handleInputChange} fullWidth />
                    <TextField label="Correo" name="correo" value={nuevoProveedor.correo} onChange={handleInputChange} fullWidth />
                    
                    <TextField
                        label="País"
                        name="pais"
                        value={nuevoProveedor.pais}
                        onChange={handleInputChange}
                        select
                        fullWidth
                        SelectProps={{
                            native: true,
                        }}
                    >
                        {paises.map((pais) => (
                            <option key={pais.cca2} value={pais.name.common}>
                                {pais.name.common}
                            </option>
                        ))}
                    </TextField>

                    <TextField label="Dirección" name="direccion" value={nuevoProveedor.direccion} onChange={handleInputChange} fullWidth />
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                        <Button variant="outlined" color="primary" onClick={handleCancelar}>Cancelar</Button>
                        <Button variant="contained" color="primary" onClick={handleAgregarProveedor}>Guardar</Button>
                    </div>

                </Box>
            </Modal>
        </div>
    );
};

export default Proveedores;
