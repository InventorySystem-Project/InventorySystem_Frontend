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
    Typography
} from '@mui/material'; 
import { Plus, Pencil, Trash2, Edit } from "lucide-react";
import { useModal } from '../hooks/useModal';
import CustomModal from '../components/CustomModal';
import { getMateriasPrimas, addMateriaPrima, updateMateriaPrima, deleteMateriaPrima } from '../services/MateriaPrimaService';
import useAuth from '../hooks/useAuth';
import { ROLES } from '../constants/roles';

const MateriaPrima = () => {
    const { role } = useAuth();
    const isGuest = role === ROLES.GUEST;
    const [showGuestAlert, setShowGuestAlert] = useState(false);

    const [materiasPrimas, setMateriasPrimas] = useState([]);
    const [nuevaMateriaPrima, setNuevaMateriaPrima] = useState({ nombre: "", unidad: "" });
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [materiaPrimaEditando, setMateriaPrimaEditando] = useState(null);
    const [paginaActual, setPaginaActual] = useState(1);
    const [materiasPrimasPorPagina, setMateriasPrimasPorPagina] = useState(5);
    const [intentoGuardar, setIntentoGuardar] = useState(false);
    
    // Hook para modals
    const { modalConfig, showAlert, showConfirm, showSuccess, hideModal } = useModal();

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
        if (isGuest) {
            setShowGuestAlert(true);
            return;
        }
        
        // Activar validación visual
        setIntentoGuardar(true);
        
        // Validar campos obligatorios
        if (!nuevaMateriaPrima.nombre || nuevaMateriaPrima.nombre.trim() === '') {
            return;
        }
        
        if (!nuevaMateriaPrima.unidad || nuevaMateriaPrima.unidad.trim() === '') {
            return;
        }

        try {
            if (materiaPrimaEditando) {
                await updateMateriaPrima(materiaPrimaEditando.id, nuevaMateriaPrima);
                showSuccess('Materia prima actualizada correctamente');
            } else {
                await addMateriaPrima(nuevaMateriaPrima);
                showSuccess('Materia prima creada correctamente');
            }

            // Recargar la lista completa desde el servidor
            await fetchMateriasPrimas();

            // Limpiar formulario
            setNuevaMateriaPrima({ nombre: "", unidad: "" });
            setMateriaPrimaEditando(null);
            setIntentoGuardar(false);
            setMostrarFormulario(false);
        } catch (error) {
            console.error('Error al agregar o actualizar materia prima', error);
        }
    };

    const handleCancelar = () => {
        setMostrarFormulario(false);
        setMateriaPrimaEditando(null);
        setIntentoGuardar(false);
        setNuevaMateriaPrima({ nombre: "", unidad: "" });
    };

    const handleEditarMateriaPrima = (materiaPrima) => {
        setMateriaPrimaEditando(materiaPrima);
        setNuevaMateriaPrima(materiaPrima);
        setIntentoGuardar(false);
        setMostrarFormulario(true);
    };

    const handleEliminarMateriaPrima = async (id) => {
        if (isGuest) {
            setShowGuestAlert(true);
            return;
        }
        
        showConfirm('¿Está seguro que desea eliminar esta materia prima?', async () => {
            try {
                await deleteMateriaPrima(id);
                showSuccess('Materia prima eliminada correctamente');
                
                // Recargar la lista completa desde el servidor
                await fetchMateriasPrimas();
            } catch (error) {
                console.error('Error al eliminar materia prima', error);
            }
        });
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
                <h2 >Gestión de Materias Primas</h2>
                <Button variant="contained" color="primary" alignItems="center" onClick={() => {
                    if (isGuest) {
                        setShowGuestAlert(true);
                    } else {
                        setIntentoGuardar(false);
                        setMostrarFormulario(true);
                    }
                }}>
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
                                        <Button color="primary" onClick={() => isGuest ? setShowGuestAlert(true) : handleEditarMateriaPrima(materiaPrima)} style={{ minWidth: 'auto', padding: '6px' }}><Edit size={18} /></Button>
                                        <Button color="error" onClick={() => isGuest ? setShowGuestAlert(true) : handleEliminarMateriaPrima(materiaPrima.id)} style={{ minWidth: 'auto', padding: '6px' }}><Trash2 size={18} /></Button>
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
                <Box style={{ background: '#fff', padding: '20px', borderRadius: '10px', width: '450px', maxHeight: '90vh', overflowY: 'auto' }}>
                    <h3>{materiaPrimaEditando ? 'Editar Materia Prima' : 'Nueva Materia Prima'}</h3>
                    <TextField 
                        label="Nombre" 
                        name="nombre" 
                        value={nuevaMateriaPrima.nombre} 
                        onChange={handleInputChange} 
                        fullWidth 
                        margin="normal"
                        required
                        error={intentoGuardar && (!nuevaMateriaPrima.nombre || nuevaMateriaPrima.nombre.trim() === '')}
                        helperText={intentoGuardar && (!nuevaMateriaPrima.nombre || nuevaMateriaPrima.nombre.trim() === '') ? 'Este campo es obligatorio' : ''}
                    />
                    <TextField
                        select
                        label="Unidad"
                        name="unidad"
                        value={nuevaMateriaPrima.unidad}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        required
                        error={intentoGuardar && (!nuevaMateriaPrima.unidad || nuevaMateriaPrima.unidad.trim() === '')}
                        helperText={intentoGuardar && (!nuevaMateriaPrima.unidad || nuevaMateriaPrima.unidad.trim() === '') ? 'Este campo es obligatorio' : ''}
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
                        <MenuItem value="pies">Pies</MenuItem>
                    </TextField>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                        <Button variant="outlined" color="primary" onClick={handleCancelar}>Cancelar</Button>
                        <Button variant="contained" color="primary" onClick={handleAgregarMateriaPrima}>Guardar</Button>
                    </div>
                </Box>
            </Modal>
            {/* Guest alert modal */}
            <Modal open={showGuestAlert} onClose={() => setShowGuestAlert(false)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box style={{ background: '#fff', padding: '25px', borderRadius: '10px', minWidth: '400px', textAlign: 'center', borderTop: '5px solid #f44336' }}>
                    <Typography variant="h6" style={{ color: '#f44336', fontWeight: '600' }}>Acción Restringida</Typography>
                    <Typography style={{ margin: '15px 0' }}>
                        No tienes permisos para realizar esta acción. Solicita autorización a un administrador al WhastApp 985804246.
                    </Typography>
                    <Button variant="contained" color="primary" onClick={() => setShowGuestAlert(false)}>Entendido</Button>
                </Box>
            </Modal>
            
            <CustomModal config={modalConfig} onClose={hideModal} />
        </div>
    );
};

export default MateriaPrima;
