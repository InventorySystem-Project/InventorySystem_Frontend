import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:8080/authenticate', { username, password })
      .then(response => {
        const token = response.data.jwttoken;
        if (token) {
          localStorage.setItem('token', token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          navigate('/menu');
        } else {
          alert('Error: No se obtuvo el token');
        }
      })
      .catch(error => {
        alert('Error al iniciar sesión');
        console.error(error);
      });
  };

  return (
    <motion.div 
      className="login-container"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <h2 className="login-heading">Iniciar Sesión</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Nombre de usuario" 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
          className="login-input"
        />
        <input 
          type="password" 
          placeholder="Contraseña" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          className="login-input"
        />
        <motion.button 
          type="submit" 
          className="login-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Entrar
        </motion.button>
      </form>
    </motion.div>
  );
};

export default Login;
