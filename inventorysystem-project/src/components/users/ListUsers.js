import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ListUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Token no encontrado. Usuario no autenticado.');
      return;
    }

    axios.get('http://localhost:8080/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => setUsers(response.data))
    .catch(error => console.error("Error al obtener usuarios: ", error));
  }, []);

  return (
    <div>
      <h2>Lista de Usuarios</h2>
      <table className="table">
        <thead>
          <tr>
            <th className="th">ID</th>
            <th className="th">Username</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="tr">
              <td className="td">{user.id}</td>
              <td className="td">{user.username}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListUsers;
