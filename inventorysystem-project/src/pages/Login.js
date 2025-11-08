import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft, ArrowRight, User, Lock, Mail } from 'lucide-react';
import { getRoles, addRol } from '../services/RolService';
import { environment } from '../environment/environment';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  // States for different views
  const [activeView, setActiveView] = useState('login'); // 'login', 'register', 'recover'
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login states
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  // Registration states
  const [registerData, setRegisterData] = useState({
    username: '',
    correo: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    genero: 'M',
    fechaNacimiento: '',
    enabled: true
  });

  // Recovery states
  const [recoverEmail, setRecoverEmail] = useState('');
  const [recoveryStep, setRecoveryStep] = useState(1); // 1: email input, 2: code verification, 3: new password
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const navigate = useNavigate();

  // Verificar si ya hay una sesión activa al cargar el componente
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        // Verificar si el token no ha expirado
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp > currentTime) {
          // Token válido, redirigir al dashboard
          navigate('/dashboard', { replace: true });
        } else {
          // Token expirado, limpiar localStorage
          localStorage.clear();
        }
      } catch (error) {
        // Token inválido, limpiar localStorage
        console.error('Token inválido:', error);
        localStorage.clear();
      }
    }
  }, [navigate]);

  // Clear messages after a delay
  useEffect(() => {
    if (errorMsg || successMsg) {
      const timer = setTimeout(() => {
        setErrorMsg('');
        setSuccessMsg('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg, successMsg]);

  // Handle login form input changes
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  // Handle registration form input changes
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;

    // Validation for numeric fields
    if ((name === 'dni' || name === 'telefono') && value !== '') {
      if (!/^\d*$/.test(value)) return; // Only allow numbers
    }

    setRegisterData(prev => ({ ...prev, [name]: value }));
  };

  // Handle login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await axios.post(`${environment.url}/authenticate`, loginData);
      const token = response.data.jwttoken;

      if (token) {
        // Decodificar el token para obtener el rol
        const decodedToken = jwtDecode(token);
        const userRole = decodedToken.role || decodedToken.authorities?.[0] || 'USER';
        const userId = decodedToken.userId || decodedToken.sub;

        // Guardar información en localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('username', loginData.username);
        localStorage.setItem('userRole', userRole);
        if (userId) localStorage.setItem('userId', userId);

        // Configurar axios para futuras peticiones
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Mostrar mensaje y redireccionar
        setSuccessMsg('Inicio de sesión exitoso. Redirigiendo...');
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        setErrorMsg('Error: No se obtuvo el token de autenticación');
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setErrorMsg('Usuario o contraseña incorrectos');
      } else {
        setErrorMsg('Error al iniciar sesión. Intente nuevamente más tarde.');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

const handleRegisterSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setErrorMsg('');

  try {
    // Buscar o crear el rol USER
    let userRol;
    try {
      const roles = await getRoles();
      userRol = roles.find(rol => rol.rol === "USER");
      if (!userRol) {
        userRol = await addRol({ rol: "USER" });
      }
    } catch (error) {
      console.error("Error al obtener/crear rol USER:", error);
      try {
        userRol = await addRol({ rol: "USER" });
      } catch (rolError) {
        console.error("Error al crear rol USER:", rolError);
      }
    }

    // Prepara los datos para la API
    const apiData = { ...registerData };
    delete apiData.confirmPassword;

    // Ajuste de nombres según backend
    apiData.correo = registerData.email; // el backend espera 'correo'

    // empresa fija (ID 1)
    apiData.empresa = { id: 1 };

    // rol asignado
    if (userRol && userRol.id) {
      apiData.rol = { id: userRol.id };
    }

    const response = await axios.post(`${environment.url}/usuarios/registrar`, apiData);

    if (response.status === 201 || response.status === 200) {
      setSuccessMsg('Registro exitoso. Ahora puede iniciar sesión.');
      setTimeout(() => {
        setActiveView('login');
        setRegisterData({
          username: '',
          correo: '',
          password: '',
          confirmPassword: '',
          nombre: '',
          apellido: '',
          dni: '',
          telefono: '',
          genero: 'M',
          fechaNacimiento: '',
          enabled: true
        });
      }, 2000);
    }
  } catch (error) {
        if (error.response) {
            
            // CASO 1: Usuario duplicado (409)
            if (error.response.status === 409) {
                setErrorMsg("El nombre de usuario ya está en uso. Por favor, elija uno diferente.");
            
            // CASO 2: Correo duplicado (412)
            } else if (error.response.status === 412) {
                setErrorMsg("El correo electrónico ya está registrado. Por favor, utilice otro.");
            
            // CASO 3: Otro error del backend (ej. 400, 500)
            } else {
                setErrorMsg(error.response.data?.message || 'Error al registrar usuario. Verifique los campos.');
            }
            // --- FIN DE CORRECCIÓN ---

        } else {
            // CASO 4: No hubo respuesta del servidor (error de red)
            setErrorMsg('Error al conectar con el servidor. Intente nuevamente más tarde.');
        }
    } finally {
    setLoading(false);
  }
};

  // Handle password recovery initial step
  const handleRecoverSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recoverEmail)) {
      setErrorMsg('Formato de correo electrónico inválido');
      setLoading(false);
      return;
    }

    try {
      // Replace with your actual password recovery endpoint
      await axios.post(`${environment.url}/recover-password`, { email: recoverEmail });

      setSuccessMsg('Se ha enviado un código de verificación a su correo electrónico.');
      setTimeout(() => {
        setRecoveryStep(2);
      }, 2000);
    } catch (error) {
      setErrorMsg('No se pudo enviar el código de recuperación. Verifique su correo e intente nuevamente.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle verification code submission
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // Replace with your actual code verification endpoint
      await axios.post(`${environment.url}/verify-code`, {
        email: recoverEmail,
        code: recoveryCode
      });

      setSuccessMsg('Código verificado correctamente.');
      setTimeout(() => {
        setRecoveryStep(3);
      }, 1000);
    } catch (error) {
      setErrorMsg('Código de verificación incorrecto. Intente nuevamente.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle setting new password
  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (newPassword !== confirmNewPassword) {
      setErrorMsg('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      // Replace with your actual password reset endpoint
      await axios.post(`${environment.url}/reset-password`, {
        email: recoverEmail,
        code: recoveryCode,
        newPassword: newPassword
      });

      setSuccessMsg('Contraseña actualizada exitosamente. Ahora puede iniciar sesión.');
      setTimeout(() => {
        setActiveView('login');
        setRecoverEmail('');
        setRecoveryCode('');
        setNewPassword('');
        setConfirmNewPassword('');
        setRecoveryStep(1);
      }, 2000);
    } catch (error) {
      setErrorMsg('Error al actualizar la contraseña. Intente nuevamente.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Card animation for transitions between forms
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: -30,
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  // Animation for buttons
  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  // Common styles
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      //background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      width: '100%',
      maxWidth: '450px',
      padding: '30px',
      overflow: 'hidden',
    },
    heading: {
      textAlign: 'center',
      color: '#333',
      marginBottom: '25px',
      fontSize: '24px',
      fontWeight: '600',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
    },
    inputGroup: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
    },
    inputLabel: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '5px',
    },
    input: {
      padding: '12px 15px',
      borderRadius: '8px',
      border: '1px solid #ddd',
      fontSize: '16px',
      transition: 'border-color 0.3s',
      width: '100%',
      boxSizing: 'border-box',
      paddingRight: '40px', // Space for the eye icon
    },
    select: {
      padding: '12px 15px',
      borderRadius: '8px',
      border: '1px solid #ddd',
      fontSize: '16px',
      transition: 'border-color 0.3s',
      width: '100%',
      boxSizing: 'border-box',
      backgroundColor: 'white',
      appearance: 'none',
      paddingRight: '40px', // Space for dropdown arrow
    },
    iconWrapper: {
      position: 'absolute',
      right: '12px',
      top: '38px',
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      color: '#666',
    },
    button: {
      backgroundColor: '#4a7fff',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '12px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '10px',
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      color: '#4a7fff',
      border: 'none',
      fontSize: '14px',
      cursor: 'pointer',
      padding: '10px',
    },
    linkText: {
      color: '#4a7fff',
      cursor: 'pointer',
      textDecoration: 'none',
      fontWeight: '500',
    },
    footer: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '20px',
      fontSize: '14px',
      color: '#666',
    },
    error: {
      backgroundColor: '#FDECEA',
      color: '#B71C1C',
      padding: '10px',
      borderRadius: '5px',
      textAlign: 'center',
      marginBottom: '15px',
    },
    success: {
      backgroundColor: '#E8F5E9',
      color: '#1B5E20',
      padding: '10px',
      borderRadius: '5px',
      textAlign: 'center',
      marginBottom: '15px',
    },
    inputRow: {
      display: 'flex',
      gap: '15px',
    },
    inputHalf: {
      flex: 1,
    },
    backButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      backgroundColor: 'transparent',
      color: '#666',
      border: 'none',
      padding: '5px',
      cursor: 'pointer',
      marginBottom: '15px',
    },
    selectWrapper: {
      position: 'relative'
    },
    selectArrow: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      color: '#666'
    }
  };

  // Render login form
  const renderLoginForm = () => (
    <form style={styles.form} onSubmit={handleLoginSubmit}>
      <div style={styles.inputGroup}>
        <label style={styles.inputLabel}>Nombre de usuario</label>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <input
            style={{
              ...styles.input,
              paddingRight: '40px' // Espacio para el icono
            }}
            type="text"
            name="username"
            value={loginData.username}
            onChange={handleLoginChange}
            placeholder="Ingrese su nombre de usuario"
            required
          />
          <div style={{
            position: 'absolute',
            right: '12px',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            color: '#666'
          }}>
            <User size={18} />
          </div>
        </div>
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.inputLabel}>Contraseña</label>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <input
            style={{
              ...styles.input,
              paddingRight: '40px' // Espacio para el icono
            }}
            type={showPassword ? "text" : "password"}
            name="password"
            value={loginData.password}
            onChange={handleLoginChange}
            placeholder="Ingrese su contraseña"
            required
          />
          <div
            style={{
              position: 'absolute',
              right: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: '#666'
            }}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </div>
        </div>
      </div>

      <motion.button
        style={styles.button}
        type="submit"
        disabled={loading}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
      >
        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </motion.button>

      <div style={{ marginTop: '10px', textAlign: 'right' }}>
        <span
          style={styles.linkText}
          onClick={() => setActiveView('recover')}
        >
          ¿Olvidó su contraseña?
        </span>
      </div>

      <div style={styles.footer}>
        <span>¿No tiene una cuenta? </span>
        <span
          style={{ ...styles.linkText, marginLeft: '5px' }}
          onClick={() => setActiveView('register')}
        >
          Regístrese aquí
        </span>
      </div>
    </form>
  );

  // Render registration form
  const renderRegisterForm = () => (
    <>
      <button
        style={styles.backButton}
        onClick={() => setActiveView('login')}
      >
        <ArrowLeft size={16} /> Volver a inicio de sesión
      </button>

      <form style={styles.form} onSubmit={handleRegisterSubmit}>
        <div style={styles.inputRow}>
          <div style={{ ...styles.inputGroup, ...styles.inputHalf }}>
            <label style={styles.inputLabel}>Nombre</label>
            <input
              style={styles.input}
              type="text"
              name="nombre"
              value={registerData.nombre}
              onChange={handleRegisterChange}
              placeholder="Nombre"
              required
            />
          </div>

          <div style={{ ...styles.inputGroup, ...styles.inputHalf }}>
            <label style={styles.inputLabel}>Apellido</label>
            <input
              style={styles.input}
              type="text"
              name="apellido"
              value={registerData.apellido}
              onChange={handleRegisterChange}
              placeholder="Apellido"
              required
            />
          </div>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.inputLabel}>Correo Electrónico</label>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <input
              style={{
                ...styles.input,
                paddingRight: '40px' // Espacio para el icono
              }}
              type="email"
              name="email"
              value={registerData.email}
              onChange={handleRegisterChange}
              placeholder="ejemplo@correo.com"
              required
            />
            <div style={{
              position: 'absolute',
              right: '12px',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              color: '#666'
            }}>
              <Mail size={18} />
            </div>
          </div>
        </div>
        <div style={styles.inputRow}>
          <div style={{ ...styles.inputGroup, ...styles.inputHalf }}>
            <label style={styles.inputLabel}>Fecha de Nacimiento</label>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <input
                style={{
                  ...styles.input,
                  paddingRight: '40px'
                }}
                type="date"
                name="fechaNacimiento"
                value={registerData.fechaNacimiento}
                onChange={handleRegisterChange}
                required
              />
              <div style={{
                position: 'absolute',
                right: '12px',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                color: '#666'
              }}>
                {/* <Calendar size={18} />*/}
              </div>
            </div>
          </div>

          <div style={{ ...styles.inputGroup, ...styles.inputHalf }}>
            <label style={styles.inputLabel}>Género</label>
            <div style={styles.selectWrapper}>
              <select
                style={styles.select}
                name="genero"
                value={registerData.genero}
                onChange={handleRegisterChange}
                required
              >
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="O">Otro</option>
              </select>
              <div style={styles.selectArrow}>
                <ArrowRight size={16} style={{ transform: 'rotate(90deg)' }} />
              </div>
            </div>
          </div>
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.inputLabel}>Nombre de Usuario</label>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <input
              style={{
                ...styles.input,
                paddingRight: '40px' // Espacio para el icono
              }}
              type="text"
              name="username"
              value={registerData.username}
              onChange={handleRegisterChange}
              placeholder="Elija un nombre de usuario"
              required
            />
            <div style={{
              position: 'absolute',
              right: '12px',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              color: '#666'
            }}>
              <User size={18} />
            </div>
          </div>
        </div>

        <div style={styles.inputRow}>
          <div style={{ ...styles.inputGroup, ...styles.inputHalf }}>
            <label style={styles.inputLabel}>DNI</label>
            <input
              style={styles.input}
              type="number"
              name="dni"
              value={registerData.dni}
              onChange={handleRegisterChange}
              placeholder="DNI"
              required
              min="0"
              onKeyDown={(e) => { if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.') e.preventDefault(); }}
            />
          </div>

          <div style={{ ...styles.inputGroup, ...styles.inputHalf }}>
            <label style={styles.inputLabel}>Teléfono</label>
            <input
              style={styles.input}
              type="number"
              name="telefono"
              value={registerData.telefono}
              onChange={handleRegisterChange}
              placeholder="Teléfono"
              required
              min="0"
              onKeyDown={(e) => { if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.') e.preventDefault(); }}
            />
          </div>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.inputLabel}>Contraseña</label>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <input
              style={{
                ...styles.input,
                paddingRight: '40px' // Espacio para el icono
              }}
              type={showPassword ? "text" : "password"}
              name="password"
              value={registerData.password}
              onChange={handleRegisterChange}
              placeholder="Cree una contraseña segura"
              required
            />
            <div
              style={{
                position: 'absolute',
                right: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: '#666'
              }}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          </div>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.inputLabel}>Confirmar Contraseña</label>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <input
              style={{
                ...styles.input,
                paddingRight: '40px' // Espacio para el icono
              }}
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={registerData.confirmPassword}
              onChange={handleRegisterChange}
              placeholder="Repita su contraseña"
              required
            />
            <div style={{
              position: 'absolute',
              right: '12px',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              color: '#666'
            }}>
              <Lock size={18} />
            </div>
          </div>
        </div>

        <motion.button
          style={styles.button}
          type="submit"
          disabled={loading}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </motion.button>
      </form>
    </>
  );

  // Render password recovery form
  const renderRecoverForm = () => {
    if (recoveryStep === 1) {
      return (
        <>
          <button
            style={styles.backButton}
            onClick={() => setActiveView('login')}
          >
            <ArrowLeft size={16} /> Volver a inicio de sesión
          </button>

          <form style={styles.form} onSubmit={handleRecoverSubmit}>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Correo Electrónico</label>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <input
                  style={{
                    ...styles.input,
                    paddingRight: '40px' // Espacio para el icono
                  }}
                  type="email"
                  value={recoverEmail}
                  onChange={(e) => setRecoverEmail(e.target.value)}
                  placeholder="Ingrese su correo electrónico registrado"
                  required
                />
                <div style={{
                  position: 'absolute',
                  right: '12px',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#666'
                }}>
                  <Mail size={18} />
                </div>
              </div>
            </div>

            <motion.button
              style={styles.button}
              type="submit"
              disabled={loading}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {loading ? 'Enviando...' : 'Enviar código de recuperación'}
            </motion.button>
          </form>
        </>
      );
    } else if (recoveryStep === 2) {
      return (
        <>
          <button
            style={styles.backButton}
            onClick={() => setRecoveryStep(1)}
          >
            <ArrowLeft size={16} /> Volver atrás
          </button>

          <form style={styles.form} onSubmit={handleVerifyCode}>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Código de Verificación</label>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <input
                  style={styles.input}
                  type="text"
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value)}
                  placeholder="Ingrese el código recibido por correo"
                  required
                />
              </div>
              <small style={{ marginTop: '5px', color: '#666' }}>
                Por favor revise su correo electrónico e ingrese el código de verificación.
              </small>
            </div>

            <motion.button
              style={styles.button}
              type="submit"
              disabled={loading}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {loading ? 'Verificando...' : 'Verificar código'}
            </motion.button>
          </form>
        </>
      );
    } else if (recoveryStep === 3) {
      return (
        <>
          <button
            style={styles.backButton}
            onClick={() => setRecoveryStep(2)}
          >
            <ArrowLeft size={16} /> Volver atrás
          </button>

          <form style={styles.form} onSubmit={handleSetNewPassword}>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Nueva Contraseña</label>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <input
                  style={{
                    ...styles.input,
                    paddingRight: '40px' // Espacio para el icono
                  }}
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ingrese su nueva contraseña"
                  required
                />
                <div
                  style={{
                    position: 'absolute',
                    right: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#666'
                  }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Confirmar Contraseña</label>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <input
                  style={{
                    ...styles.input,
                    paddingRight: '40px' // Espacio para el icono
                  }}
                  type={showPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirme su nueva contraseña"
                  required
                />
                <div style={{
                  position: 'absolute',
                  right: '12px',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#666'
                }}>
                  <Lock size={18} />
                </div>
              </div>
            </div>

            <motion.button
              style={styles.button}
              type="submit"
              disabled={loading}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {loading ? 'Actualizando...' : 'Actualizar contraseña'}
            </motion.button>
          </form>
        </>
      );
    }
  };

  // Determine which form to render
  const renderActiveView = () => {
    switch (activeView) {
      case 'register':
        return renderRegisterForm();
      case 'recover':
        return renderRecoverForm();
      default:
        return renderLoginForm();
    }
  };

  // Get the heading text based on the active view
  const getHeadingText = () => {
    if (activeView === 'register') {
      return 'Crear Cuenta';
    } else if (activeView === 'recover') {
      if (recoveryStep === 1) return 'Recuperar Contraseña';
      if (recoveryStep === 2) return 'Verificar Código';
      if (recoveryStep === 3) return 'Nueva Contraseña';
    }
    return 'Bienvenido de nuevo';
  };

  return (
    <div style={styles.container}>
      <motion.div
        style={styles.card}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={cardVariants}
        key={`${activeView}-${recoveryStep}`}
      >
        <h2 style={styles.heading}>{getHeadingText()}</h2>

        {errorMsg && <div style={styles.error}>{errorMsg}</div>}
        {successMsg && <div style={styles.success}>{successMsg}</div>}

        {renderActiveView()}
      </motion.div>
    </div>
  );
}

export default Login;