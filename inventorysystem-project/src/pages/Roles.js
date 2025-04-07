// src/pages/Roles.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [roleName, setRoleName] = useState('');

  useEffect(() => {
    // Fetch roles from the backend
    axios.get('http://localhost:8080/roles', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(response => setRoles(response.data))
      .catch(error => console.error('Error fetching roles:', error));
  }, []);

  const handleRegisterRole = () => {
    // Send a request to register a new role
    axios.post('http://localhost:8080/roles/Registrar', { rol: roleName }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(() => {
        alert('Role registered successfully');
        setRoleName('');
      })
      .catch(error => console.error('Error registering role:', error));
  };

  return (
    <div>
      <h1>Roles</h1>
      <input
        type="text"
        placeholder="Role name"
        value={roleName}
        onChange={(e) => setRoleName(e.target.value)}
      />
      <button onClick={handleRegisterRole}>Register Role</button>

      <ul>
        {roles.map(role => (
          <li key={role.id}>{role.rol}</li>
        ))}
      </ul>
    </div>
  );
};

export default Roles;
