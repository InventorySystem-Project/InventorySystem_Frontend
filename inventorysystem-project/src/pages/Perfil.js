import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Avatar,
    Typography,
    Grid,
    Divider,
    IconButton,
    Alert,
    Tabs,
    Tab,
    InputAdornment
} from '@mui/material';
import { User, Mail, Lock, Camera, Save, Shield, Eye, EyeOff } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { useModal } from '../hooks/useModal';
import CustomModal from '../components/CustomModal';
import { updateUsuario, getUsuarioById } from '../services/UsuarioService';

const Perfil = () => {
    const { username, role, userId, updateAuthUser } = useAuth();
    const { modalConfig, showSuccess, showError, hideModal } = useModal();
    const [activeTab, setActiveTab] = useState(0);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [profileData, setProfileData] = useState({
        nombre: '',
        username: '',
        email: '',
        telefono: '',
        direccion: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [avatarPreview, setAvatarPreview] = useState(null);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            if (userId) {
                const userData = await getUsuarioById(userId);
                setProfileData({
                    nombre: userData.nombre || '',
                    username: userData.username || '',
                    email: userData.email || '',
                    telefono: userData.telefono || '',
                    direccion: userData.direccion || ''
                });
            }
        } catch (error) {
            console.error('Error al obtener datos del usuario:', error);
            showError('Error al cargar los datos del perfil');
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        setErrors({});
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const validateProfileForm = () => {
        const newErrors = {};
        
        if (!profileData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido';
        }
        
        if (!profileData.username.trim()) {
            newErrors.username = 'El nombre de usuario es requerido';
        }
        
        if (profileData.email && !/\S+@\S+\.\S+/.test(profileData.email)) {
            newErrors.email = 'Email inválido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validatePasswordForm = () => {
        const newErrors = {};

        if (!passwordData.currentPassword) {
            newErrors.currentPassword = 'La contraseña actual es requerida';
        }

        if (!passwordData.newPassword) {
            newErrors.newPassword = 'La nueva contraseña es requerida';
        } else if (passwordData.newPassword.length < 6) {
            newErrors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveProfile = async () => {
        if (!validateProfileForm()) return;

        try {
            await updateUsuario(userId, {
                ...profileData,
                rol: role // Mantener el rol actual
            });
            
            // Actualizar el contexto de autenticación
            if (updateAuthUser) {
                updateAuthUser({
                    username: profileData.username,
                    nombre: profileData.nombre
                });
            }
            
            showSuccess('Perfil actualizado correctamente');
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            showError('Error al actualizar el perfil');
        }
    };

    const handleChangePassword = async () => {
        if (!validatePasswordForm()) return;

        try {
            // Aquí deberías llamar a un endpoint específico para cambiar contraseña
            // Por ahora, simulamos el proceso
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            showSuccess('Contraseña actualizada correctamente');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            showError('Error al cambiar la contraseña');
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        const names = name.split(' ');
        if (names.length >= 2) {
            return names[0][0] + names[1][0];
        }
        return name[0];
    };

    return (
        <div className="container-general">
            <CustomModal
                isOpen={modalConfig.isOpen}
                type={modalConfig.type}
                title={modalConfig.title}
                message={modalConfig.message}
                onConfirm={modalConfig.onConfirm}
                onCancel={hideModal}
            />

            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                    Mi Perfil
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748b' }}>
                    Gestiona tu información personal y preferencias
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Columna izquierda - Avatar y datos básicos */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ 
                        borderRadius: '16px', 
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        overflow: 'visible'
                    }}>
                        <CardContent sx={{ textAlign: 'center', pt: 4, pb: 4 }}>
                            <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                                <Avatar
                                    src={avatarPreview}
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        fontSize: '2.5rem',
                                        bgcolor: '#3b82f6',
                                        border: '4px solid #ffffff',
                                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                                    }}
                                >
                                    {getInitials(profileData.nombre || username)}
                                </Avatar>
                                <IconButton
                                    component="label"
                                    sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        bgcolor: '#3b82f6',
                                        color: 'white',
                                        width: 36,
                                        height: 36,
                                        '&:hover': {
                                            bgcolor: '#2563eb'
                                        },
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                    }}
                                >
                                    <Camera size={18} />
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                    />
                                </IconButton>
                            </Box>

                            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {profileData.nombre || username}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                                @{profileData.username || username}
                            </Typography>

                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                bgcolor: '#f1f5f9',
                                borderRadius: '8px',
                                p: 1.5,
                                mb: 2
                            }}>
                                <Shield size={20} color="#3b82f6" style={{ marginRight: '8px' }} />
                                <Typography variant="body2" sx={{ fontWeight: 500, color: '#475569' }}>
                                    Rol: <span style={{ color: '#3b82f6', fontWeight: 600 }}>{role}</span>
                                </Typography>
                            </Box>

                            {profileData.email && (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                                    <Mail size={16} color="#64748b" style={{ marginRight: '8px' }} />
                                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                                        {profileData.email}
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Columna derecha - Formularios */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ 
                        borderRadius: '16px', 
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}>
                        <CardContent sx={{ p: 0 }}>
                            <Tabs
                                value={activeTab}
                                onChange={handleTabChange}
                                sx={{
                                    borderBottom: 1,
                                    borderColor: 'divider',
                                    px: 3,
                                    '& .MuiTab-root': {
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        fontSize: '0.95rem'
                                    }
                                }}
                            >
                                <Tab 
                                    icon={<User size={18} />} 
                                    iconPosition="start" 
                                    label="Información Personal" 
                                />
                                <Tab 
                                    icon={<Lock size={18} />} 
                                    iconPosition="start" 
                                    label="Seguridad" 
                                />
                            </Tabs>

                            {/* Tab 1: Información Personal */}
                            {activeTab === 0 && (
                                <Box sx={{ p: 4 }}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Nombre Completo"
                                                name="nombre"
                                                value={profileData.nombre}
                                                onChange={handleProfileChange}
                                                error={!!errors.nombre}
                                                helperText={errors.nombre}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <User size={20} color="#64748b" />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Nombre de Usuario"
                                                name="username"
                                                value={profileData.username}
                                                onChange={handleProfileChange}
                                                error={!!errors.username}
                                                helperText={errors.username}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Correo Electrónico"
                                                name="email"
                                                type="email"
                                                value={profileData.email}
                                                onChange={handleProfileChange}
                                                error={!!errors.email}
                                                helperText={errors.email}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Mail size={20} color="#64748b" />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Teléfono"
                                                name="telefono"
                                                value={profileData.telefono}
                                                onChange={handleProfileChange}
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Dirección"
                                                name="direccion"
                                                multiline
                                                rows={2}
                                                value={profileData.direccion}
                                                onChange={handleProfileChange}
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Button
                                                variant="contained"
                                                startIcon={<Save size={20} />}
                                                onClick={handleSaveProfile}
                                                sx={{
                                                    bgcolor: '#3b82f6',
                                                    textTransform: 'none',
                                                    fontWeight: 500,
                                                    px: 4,
                                                    py: 1.5,
                                                    borderRadius: '8px',
                                                    '&:hover': {
                                                        bgcolor: '#2563eb'
                                                    }
                                                }}
                                            >
                                                Guardar Cambios
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}

                            {/* Tab 2: Seguridad */}
                            {activeTab === 1 && (
                                <Box sx={{ p: 4 }}>
                                    <Alert severity="info" sx={{ mb: 3, borderRadius: '8px' }}>
                                        Por seguridad, necesitas ingresar tu contraseña actual para cambiarla.
                                    </Alert>

                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Contraseña Actual"
                                                name="currentPassword"
                                                type={showCurrentPassword ? 'text' : 'password'}
                                                value={passwordData.currentPassword}
                                                onChange={handlePasswordChange}
                                                error={!!errors.currentPassword}
                                                helperText={errors.currentPassword}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Lock size={20} color="#64748b" />
                                                        </InputAdornment>
                                                    ),
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                                edge="end"
                                                            >
                                                                {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Divider sx={{ my: 2 }} />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Nueva Contraseña"
                                                name="newPassword"
                                                type={showNewPassword ? 'text' : 'password'}
                                                value={passwordData.newPassword}
                                                onChange={handlePasswordChange}
                                                error={!!errors.newPassword}
                                                helperText={errors.newPassword}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                                edge="end"
                                                            >
                                                                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Confirmar Nueva Contraseña"
                                                name="confirmPassword"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={passwordData.confirmPassword}
                                                onChange={handlePasswordChange}
                                                error={!!errors.confirmPassword}
                                                helperText={errors.confirmPassword}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                edge="end"
                                                            >
                                                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Button
                                                variant="contained"
                                                startIcon={<Lock size={20} />}
                                                onClick={handleChangePassword}
                                                sx={{
                                                    bgcolor: '#3b82f6',
                                                    textTransform: 'none',
                                                    fontWeight: 500,
                                                    px: 4,
                                                    py: 1.5,
                                                    borderRadius: '8px',
                                                    '&:hover': {
                                                        bgcolor: '#2563eb'
                                                    }
                                                }}
                                            >
                                                Cambiar Contraseña
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </div>
    );
};

export default Perfil;
