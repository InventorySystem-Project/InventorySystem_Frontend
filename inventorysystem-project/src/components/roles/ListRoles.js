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
    <div className="container-general">
      <h2>Lista de Roles</h2>
      <table className="table">
        <thead>
          <tr>
            <th className="th">ID</th>
            <th className="th">Rol</th>
          </tr>
        </thead>
        <tbody>
          {roles.map(role => (
            <tr key={role.id} className="tr">
              <td className="td">{role.id}</td>
              <td className="td">{role.rol}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListRoles;
