import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ListRoles = () => {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Token no encontrado. Usuario no autenticado.');
      return;
    }

    axios.get('http://localhost:8080/roles/Listar', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => setRoles(response.data))
    .catch(error => console.error('Error al obtener roles:', error));
  }, []);

  return (
    <div>
      <h2>Lista de Roles</h2>
      <ul>
        {roles.map(role => (
          <li key={role.id}>{role.rol}</li>
        ))}
      </ul>
    </div>
  );
};

export default ListRoles;
