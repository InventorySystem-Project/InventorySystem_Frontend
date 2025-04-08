import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RegisterRole = () => {
  const [rol, setRol] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  // Cargar usuarios al montar el componente
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Token no encontrado.');
      return;
    }

    axios.get('http://localhost:8080/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => setUsers(response.data))
    .catch(error => console.error('Error al obtener usuarios:', error));
  }, []);

  const handleRegister = () => {
    const token = localStorage.getItem('token');
    if (!token || !rol || !selectedUserId) {
      alert('Debe ingresar todos los campos');
      return;
    }

    const requestBody = {
      rol,
      user: { id: selectedUserId }  // Esto es lo que ModelMapper necesita
    };

    axios.post('http://localhost:8080/roles/Registrar', requestBody, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      alert('Rol registrado exitosamente');
      setRol('');
      setSelectedUserId('');
    })
    .catch(error => console.error('Error al registrar rol:', error));
  };

  return (
    <div className="register-role-container">
      <h2 className="register-role-heading">Registrar Rol</h2>

      <input 
        type="text" 
        placeholder="Nombre del rol" 
        value={rol} 
        onChange={(e) => setRol(e.target.value)} 
        className="register-role-input"
      />

      <select 
        value={selectedUserId} 
        onChange={(e) => setSelectedUserId(e.target.value)} 
        className="register-role-select"
      >
        <option value="">Seleccione un usuario</option>
        {users.map(user => (
          <option key={user.id} value={user.id}>
            {user.username}
          </option>
        ))}
      </select>

      <button className="register-role-button" onClick={handleRegister}>
        Registrar Rol
      </button>
    </div>
  );
};

export default RegisterRole;
