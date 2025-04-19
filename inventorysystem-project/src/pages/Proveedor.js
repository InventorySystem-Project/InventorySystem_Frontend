import React, { useState, useEffect } from 'react';
import { TextField, Button, Modal, Box, Pagination, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { Plus, Pencil, Trash2, Edit} from "lucide-react";
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
    const [paisesNombreCompleto, setPaisesNombreCompleto] = useState({});  // Mapa de códigos ISO a nombres completos de países

    useEffect(() => {
        fetchProveedores();
        fetchPaises();  // Llamar a la función para obtener los países
    }, []);

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
            const paisesOrdenados = data.sort((a, b) => a.name.common.localeCompare(b.name.common)); // Ordenar por nombre

            // Crear un mapa que relacione los códigos ISO con los nombres completos
            const paisesMap = {};
            data.forEach(pais => {
                paisesMap[pais.cca2] = pais.name.common;  // "cca2" es el código ISO y "name.common" es el nombre del país
            });

            setPaises(paisesOrdenados);
            setPaisesNombreCompleto(paisesMap);  // Guardar el mapa de países
        } catch (error) {
            console.error('Error al obtener los países', error);
        }
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevoProveedor(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAgregarProveedor = async () => {
        // Verificar si todos los campos están completos
        if (
            !nuevoProveedor.nombreEmpresaProveedor || 
            !nuevoProveedor.nombreContacto || 
            !nuevoProveedor.telefono || 
            !nuevoProveedor.ruc
        ) 
            {
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
                                <TableCell style={{ fontWeight: 'bold' , color: '#748091'}}>Nombre Empresa</TableCell>
                                <TableCell style={{ fontWeight: 'bold' , color: '#748091'}}>RUC</TableCell>
                                <TableCell style={{ fontWeight: 'bold' , color: '#748091'}}>Contacto</TableCell>
                                <TableCell style={{ fontWeight: 'bold' , color: '#748091'}}>País</TableCell>
                                <TableCell style={{ fontWeight: 'bold' , color: '#748091'}}>Teléfono</TableCell>
                                <TableCell style={{ fontWeight: 'bold' , color: '#748091'}}>Correo</TableCell>
                                <TableCell style={{ fontWeight: 'bold' , color: '#748091'}}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {proveedoresPaginados.map((proveedor) => (
                                <TableRow key={proveedor.id}>
                                    <TableCell>{proveedor.nombreEmpresaProveedor}</TableCell>
                                    <TableCell>{proveedor.ruc}</TableCell>
                                    <TableCell>{proveedor.nombreContacto}</TableCell>
                                     <TableCell>
                                                                            {/* Contenedor para la bandera y el nombre del país */}
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                                <img
                                                                                    src={`https://flagcdn.com/w320/${proveedor.pais.toLowerCase()}.png`}
                                                                                    alt={proveedor.pais}
                                                                                    style={{
                                                                                        width: '24px',
                                                                                        height: '16px',
                                                                                        borderRadius: '2px',  // Borde redondeado solo en la imagen
                                                                                    }}
                                                                                />
                                                                                <span>{paisesNombreCompleto[proveedor.pais] || proveedor.pais}</span> {/* Aquí mostramos el nombre completo del país */}
                                                                            </div>
                                                                        </TableCell>
                                    <TableCell>{proveedor.telefono}</TableCell>
                                    <TableCell>{proveedor.correo}</TableCell>
                                    <TableCell>
                                        <Button color="primary" onClick={() => handleEditarProveedor(proveedor)}><Edit size={18} /></Button>
                                        <Button color="error" onClick={() => handleEliminarProveedor(proveedor.id)}><Trash2 size={18} /></Button>
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
                        SelectProps={{ native: true }}
                    >
                        {paises.map((pais) => (
                            <option key={pais.cca2} value={pais.cca2}> {/* Usamos el código ISO del país aquí */}
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
