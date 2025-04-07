import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ListRoles = () => {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8080/roles/Listar', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then(response => setRoles(response.data))
    .catch(error => console.error('Error al obtener roles:', error));
  }, []);

  return (
    <div>
      <h2>Lista de Roles</h2>
      <ul>
        {roles.map(role => <li key={role.id}>{role.rol}</li>)}
      </ul>
    </div>
  );
};

export default ListRoles;
