import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ListUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8080/users', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then(response => setUsers(response.data))
    .catch(error => console.error('Error al obtener usuarios:', error));
  }, []);

  return (
    <div>
      <h2>Lista de Usuarios</h2>
      <ul>
        {users.map(user => <li key={user.id}>{user.username}</li>)}
      </ul>
    </div>
  );
};

export default ListUsers;
