import React, { useState } from 'react';
import axios from 'axios';

const RegisterRole = () => {
  const [rol, setRol] = useState('');

  const handleRegister = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Token no encontrado. Usuario no autenticado.');
      return;
    }

    axios.post('http://localhost:8080/roles/Registrar', { rol }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      alert('Rol registrado exitosamente');
      setRol('');
    })
    .catch(error => console.error('Error al registrar rol:', error));
  };

  return (
    <div>
      <h2>Registrar Rol</h2>
      <input 
        type="text" 
        placeholder="Nombre del rol" 
        value={rol}
        onChange={(e) => setRol(e.target.value)} 
      />
      <br />
      <button onClick={handleRegister}>Registrar Rol</button>
    </div>
  );
};

export default RegisterRole;
