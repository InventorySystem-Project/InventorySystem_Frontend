import React, { useState, useEffect } from 'react';
import { TextField, Button, Modal, Box, Pagination, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { Plus, Pencil, Trash2, Edit } from "lucide-react";
import Flag from 'react-world-flags'; // Para mostrar banderas
import { getEmpresas, addEmpresa, updateEmpresa, deleteEmpresa } from '../services/EmpresaService';

const Empresa = () => {
    const [empresas, setEmpresas] = useState([]);
    const [nuevaEmpresa, setNuevaEmpresa] = useState({
        nombre: "", ruc: "", direccion: "", telefono: "", correo: "", pais: "", enabled: true
    });
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [empresaEditando, setEmpresaEditando] = useState(null);
    const [paginaActual, setPaginaActual] = useState(1);
    const [empresasPorPagina, setEmpresasPorPagina] = useState(5);
    const [paises, setPaises] = useState([]);  // Nuevo estado para los países
    const [paisesNombreCompleto, setPaisesNombreCompleto] = useState({});  // Mapa de códigos ISO a nombres completos de países

    // Obtener la lista de empresas
    const fetchEmpresas = async () => {
        try {
            const data = await getEmpresas();
            setEmpresas(data);
        } catch (error) {
            console.error('Error al obtener empresas', error);
        }
    };

    // Obtener la lista de países
const fetchPaises = async () => {
        try {
            // URL corregida para pedir solo los campos necesarios y evitar el error 400
            const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2');
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error ${response.status}: ${errorData.message}`);
            }
            
            const data = await response.json();
            
            if (Array.isArray(data)) {
                const paisesOrdenados = data.sort((a, b) => 
                    a.name.common.localeCompare(b.name.common)
                );
                setPaises(paisesOrdenados);
            } else {
                 console.error('La respuesta de la API de países no es un array:', data);
            }
        } catch (error) {
            console.error('Error al obtener los países:', error);
        }
    };
    useEffect(() => {
        fetchEmpresas();
        fetchPaises();  // Llamar a la función para obtener los países
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevaEmpresa(prev => ({ ...prev, [name]: value }));
    };

    const handleGuardarEmpresa = async () => {
        if (!nuevaEmpresa.nombre || !nuevaEmpresa.ruc || !nuevaEmpresa.direccion || !nuevaEmpresa.telefono || !nuevaEmpresa.correo || !nuevaEmpresa.pais) {
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
            setNuevaEmpresa({ nombre: "", ruc: "", direccion: "", telefono: "", correo: "", pais: "", enabled: true });
            setEmpresaEditando(null);
            setMostrarFormulario(false);
        } catch (error) {
            console.error('Error al guardar empresa', error);
        }
    };

    const handleCancelar = () => {
        setMostrarFormulario(false);
        setEmpresaEditando(null);
        setNuevaEmpresa({ nombre: "", ruc: "", direccion: "", telefono: "", correo: "", pais: "", enabled: true });
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
                <h2>Gestión de Empresas</h2>
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
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Nombre</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>RUC</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Dirección</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Teléfono</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Correo</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>País</TableCell>
                                <TableCell style={{ fontWeight: 'bold', color: '#748091' }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {empresasPaginadas.map((empresa) => (
                                <TableRow key={empresa.id}>
                                    <TableCell>{empresa.nombre}</TableCell>
                                    <TableCell>{empresa.ruc}</TableCell>
                                    <TableCell>{empresa.direccion}</TableCell>
                                    <TableCell>{empresa.telefono}</TableCell>
                                    <TableCell>{empresa.correo}</TableCell>
                                    {/* Mostrar la bandera del país con el código ISO */}
                                    <TableCell>
                                        {/* Contenedor para la bandera y el nombre del país */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <img
                                                src={`https://flagcdn.com/w320/${empresa.pais.toLowerCase()}.png`}
                                                alt={empresa.pais}
                                                style={{
                                                    width: '24px',
                                                    height: '16px',
                                                    borderRadius: '2px',  // Borde redondeado solo en la imagen
                                                }}
                                            />
                                            <span>{paisesNombreCompleto[empresa.pais] || empresa.pais}</span> {/* Aquí mostramos el nombre completo del país */}
                                        </div>
                                    </TableCell>


                                    <TableCell>
                                        <Button color="primary" onClick={() => handleEditarEmpresa(empresa)}><Edit size={18} /></Button>
                                        <Button color="error" onClick={() => handleEliminarEmpresa(empresa.id)}><Trash2 size={18} /></Button>
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
                    <h3>{empresaEditando ? 'Editar Empresa' : 'Nueva Empresa'}</h3>
                    <TextField label="Nombre" name="nombre" value={nuevaEmpresa.nombre} onChange={handleInputChange} fullWidth />
                    <TextField label="RUC" name="ruc" value={nuevaEmpresa.ruc} onChange={handleInputChange} fullWidth />
                    <TextField label="Dirección" name="direccion" value={nuevaEmpresa.direccion} onChange={handleInputChange} fullWidth />
                    <TextField label="Teléfono" name="telefono" value={nuevaEmpresa.telefono} onChange={handleInputChange} fullWidth />
                    <TextField label="Correo" name="correo" value={nuevaEmpresa.correo} onChange={handleInputChange} fullWidth />

                    {/* Desplegable de países */}
                    <TextField
                        label="País"
                        name="pais"
                        value={nuevaEmpresa.pais}
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
