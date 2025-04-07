// src/pages/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:8080/authenticate', { username, password })
      .then(response => {
        const token = response.data.token;
        localStorage.setItem('token', token);

        // Configura Axios para incluir automáticamente el token en futuras peticiones
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        navigate('/menu');  // Redirige al menú
      })
      .catch(error => {
        alert('Error al iniciar sesión');
        console.error(error);
      });
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Username" 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
