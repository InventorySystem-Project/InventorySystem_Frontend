import React, { useState, useEffect } from 'react';
import { TextField, Button, Modal, Box, Pagination, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Typography, Autocomplete } from '@mui/material';
import { Plus, Pencil, Trash2, Edit } from "lucide-react";
import Flag from 'react-world-flags'; // Para mostrar banderas
import { getEmpresas, addEmpresa, updateEmpresa, deleteEmpresa } from '../services/EmpresaService';
import * as tableStyles from '../styles/tableStyles';

const Empresa = () => {
    const [empresas, setEmpresas] = useState([]);
    const [nuevaEmpresa, setNuevaEmpresa] = useState({
        nombre: "", ruc: "", direccion: "", telefono: "", correo: "", pais: "", enabled: true
    });
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [empresaEditando, setEmpresaEditando] = useState(null);
    const [paginaActual, setPaginaActual] = useState(1);
    const [empresasPorPagina, setEmpresasPorPagina] = useState(5);
    const [paises, setPaises] = useState([]);  // Lista de países [{ code, name, flag }]
    const [paisesNombreCompleto, setPaisesNombreCompleto] = useState({});  // Mapa de códigos ISO a nombres completos de países
    const [intentoGuardar, setIntentoGuardar] = useState(false);

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
            const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error ${response.status}: ${errorData.message}`);
            }
            const data = await response.json();
            if (Array.isArray(data)) {
                const paisesOrdenados = data
                    .filter(pais => pais && pais.name && pais.name.common && pais.cca2)
                    .map(pais => ({
                        code: pais.cca2,
                        name: pais.name.common,
                        flag: `https://flagcdn.com/w40/${pais.cca2.toLowerCase()}.png`
                    }))
                    .sort((a, b) => a.name.localeCompare(b.name));
                setPaises(paisesOrdenados);
                // Mapa de códigos a nombres
                const mapaCodigosNombres = {};
                paisesOrdenados.forEach(pais => {
                    mapaCodigosNombres[pais.code] = pais.name;
                });
                setPaisesNombreCompleto(mapaCodigosNombres);
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
        // Activar validación visual
        setIntentoGuardar(true);
        
        // Validar campos obligatorios
        if (!nuevaEmpresa.nombre || nuevaEmpresa.nombre.trim() === '') {
            return;
        }
        
        if (!nuevaEmpresa.ruc || nuevaEmpresa.ruc.trim() === '') {
            return;
        }
        
        if (!nuevaEmpresa.direccion || nuevaEmpresa.direccion.trim() === '') {
            return;
        }
        
        if (!nuevaEmpresa.telefono || nuevaEmpresa.telefono.trim() === '') {
            return;
        }
        
        if (!nuevaEmpresa.correo || nuevaEmpresa.correo.trim() === '') {
            return;
        }
        
        if (!nuevaEmpresa.pais || nuevaEmpresa.pais.trim() === '') {
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
            setIntentoGuardar(false);
            setMostrarFormulario(false);
        } catch (error) {
            console.error('Error al guardar empresa', error);
        }
    };

    const handleCancelar = () => {
        setMostrarFormulario(false);
        setEmpresaEditando(null);
        setIntentoGuardar(false);
        setNuevaEmpresa({ nombre: "", ruc: "", direccion: "", telefono: "", correo: "", pais: "", enabled: true });
    };

    const handleEditarEmpresa = (empresa) => {
        setEmpresaEditando(empresa);
        setNuevaEmpresa(empresa);
        setIntentoGuardar(false);
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

                <TableContainer sx={tableStyles.enhancedTableContainer}>
                    <Table>
                        <TableHead sx={tableStyles.enhancedTableHead}>
                            <TableRow>
                                <TableCell>Nombre</TableCell>
                                <TableCell sx={tableStyles.hideColumnOnMobile}>RUC</TableCell>
                                <TableCell sx={tableStyles.hideColumnOnTablet}>Dirección</TableCell>
                                <TableCell sx={tableStyles.hideColumnOnMobile}>Teléfono</TableCell>
                                <TableCell sx={tableStyles.hideColumnOnTablet}>Correo</TableCell>
                                <TableCell>País</TableCell>
                                <TableCell align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {empresasPaginadas.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} sx={tableStyles.emptyTableMessage}>
                                        <Box className="empty-icon">🏢</Box>
                                        <Typography>No hay empresas registradas</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                empresasPaginadas.map((empresa) => (
                                    <TableRow key={empresa.id} sx={tableStyles.enhancedTableRow}>
                                        <TableCell sx={tableStyles.enhancedTableCell}>{empresa.nombre}</TableCell>
                                        <TableCell sx={{ ...tableStyles.enhancedTableCell, ...tableStyles.hideColumnOnMobile }}>{empresa.ruc}</TableCell>
                                        <TableCell sx={{ ...tableStyles.enhancedTableCell, ...tableStyles.hideColumnOnTablet }}>{empresa.direccion}</TableCell>
                                        <TableCell sx={{ ...tableStyles.enhancedTableCell, ...tableStyles.hideColumnOnMobile }}>{empresa.telefono}</TableCell>
                                        <TableCell sx={{ ...tableStyles.enhancedTableCell, ...tableStyles.hideColumnOnTablet }}>{empresa.correo}</TableCell>
                                        <TableCell sx={tableStyles.enhancedTableCell}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <img
                                                    src={`https://flagcdn.com/w320/${empresa.pais.toLowerCase()}.png`}
                                                    alt={empresa.pais}
                                                    style={{
                                                        width: '24px',
                                                        height: '16px',
                                                        borderRadius: '2px',
                                                    }}
                                                />
                                                <span>{paisesNombreCompleto[empresa.pais] || empresa.pais}</span>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={tableStyles.enhancedTableCell} align="center">
                                            <Box sx={tableStyles.enhancedTableCellActions}>
                                                <Button color="primary" onClick={() => handleEditarEmpresa(empresa)} sx={tableStyles.enhancedActionButton} startIcon={<Edit size={18} />}>
                                                </Button>
                                                <Button color="error" onClick={() => handleEliminarEmpresa(empresa.id)} sx={tableStyles.enhancedActionButton} startIcon={<Trash2 size={18} />}>
                                                </Button>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    <Box sx={tableStyles.enhancedPagination}>
                        <Pagination count={totalPages} page={paginaActual} onChange={handleChangePage} color="primary" showFirstButton showLastButton />
                    </Box>
                </TableContainer>
            </div>

            <Modal open={mostrarFormulario} onClose={() => setMostrarFormulario(false)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box style={{ background: '#fff', padding: '20px', borderRadius: '10px', width: '450px', maxHeight: '90vh', overflowY: 'auto' }}>
                    <h3>{empresaEditando ? 'Editar Empresa' : 'Nueva Empresa'}</h3>
                    <TextField label="Nombre" name="nombre" value={nuevaEmpresa.nombre} onChange={handleInputChange} fullWidth margin="normal" />
                    <TextField 
                        type="number"
                        label="RUC" 
                        name="ruc" 
                        value={nuevaEmpresa.ruc} 
                        onChange={handleInputChange} 
                        fullWidth 
                        margin="normal" 
                        InputProps={{ inputProps: { min: 0, step: 1 } }}
                        onKeyDown={(e) => { if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.') e.preventDefault(); }}
                        helperText="Solo números positivos"
                    />
                    <TextField label="Dirección" name="direccion" value={nuevaEmpresa.direccion} onChange={handleInputChange} fullWidth margin="normal" />
                    <TextField 
                        type="number"
                        label="Teléfono" 
                        name="telefono" 
                        value={nuevaEmpresa.telefono} 
                        onChange={handleInputChange} 
                        fullWidth 
                        margin="normal" 
                        InputProps={{ inputProps: { min: 0, step: 1 } }}
                        onKeyDown={(e) => { if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.') e.preventDefault(); }}
                        helperText="Solo números positivos"
                    />
                    <TextField label="Correo" name="correo" value={nuevaEmpresa.correo} onChange={handleInputChange} fullWidth margin="normal" />

                    {/* Selector de país mejorado con Autocomplete y banderas */}
                    <Autocomplete
                        options={paises}
                        getOptionLabel={option => option.name}
                        value={paises.find(p => p.code === nuevaEmpresa.pais) || null}
                        onChange={(event, newValue) => {
                            setNuevaEmpresa(prev => ({ ...prev, pais: newValue ? newValue.code : '' }));
                        }}
                        renderOption={(props, option) => (
                            <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', color: '#222' }}>
                                <img src={option.flag} alt={option.code} style={{ width: 24, height: 16, marginRight: 8, borderRadius: 2 }} />
                                {option.name}
                            </Box>
                        )}
                        renderInput={params => (
                            <TextField {...params} label="País" margin="normal" fullWidth variant="outlined"
                                InputProps={{ ...params.InputProps, style: { background: '#f9fafb', color: '#222' } }}
                            />
                        )}
                        sx={{ marginBottom: 2 }}
                        isOptionEqualToValue={(option, value) => option.code === value.code}
                    />

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                        <Button variant="outlined" color="primary" onClick={handleCancelar}>Cancelar</Button>
                        <Button variant="contained" color="primary" onClick={handleGuardarEmpresa}>Guardar</Button>
                    </div>
                </Box>
            </Modal>
        </div>
    );
};

export default Empresa;
