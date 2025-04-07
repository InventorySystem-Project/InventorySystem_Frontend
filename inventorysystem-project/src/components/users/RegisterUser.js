import React, { useState } from 'react';
import axios from 'axios';

const RegisterUser = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    axios.post('http://localhost:8080/users', { username, password }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then(() => {
      alert('Usuario registrado exitosamente');
      setUsername('');
      setPassword('');
    })
    .catch(error => console.error('Error al registrar usuario:', error));
  };

  return (
    <div>
      <h2>Registrar Usuario</h2>
      <input type="text" placeholder="Nombre" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleRegister}>Registrar Usuario</button>
    </div>
  );
};

export default RegisterUser;
