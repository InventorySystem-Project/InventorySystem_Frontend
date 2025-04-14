import React, { useState } from 'react';
import axios from 'axios';

const RegisterUser = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [enabled, setEnabled] = useState(true);

  const handleRegister = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Token no encontrado. Usuario no autenticado.');
      return;
    }

    if (!username.trim() || !password.trim()) {
      alert("El nombre de usuario y la contraseña no pueden estar vacíos.");
      setEnabled(true);
      return;
    } else {
      setEnabled(true);
    }

    axios.post('http://localhost:8080/users/registrar', { username, password, enabled }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      alert('Usuario registrado exitosamente');
      setUsername('');
      setPassword('');
      setEnabled(true);
    })
    .catch(error => console.error('Error al registrar usuario:', error));
  };

  return (
    <div className="container-general">
      <h2>Registrar Usuario</h2>
      <input 
        type="text" 
        placeholder="Nombre de usuario" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)} 
        className="register-user-input"
      />
      <input 
        type="password" 
        placeholder="Contraseña" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        className="register-user-input"
      />
      <button className="register-user-button" onClick={handleRegister}>Registrar Usuario</button>
    </div>
  );
};

export default RegisterUser;
