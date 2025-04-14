import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ListRoles = () => {
  const [roles, setRoles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rolesPerPage, setRolesPerPage] = useState(5);

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

  const handleChangeRolesPerPage = (e) => {
    const value = e.target.value;
    if (value === "all") {
      setRolesPerPage(roles.length);
      setCurrentPage(1);
    } else {
      setRolesPerPage(Number(value));
      setCurrentPage(1);
    }
  };

  const indexOfLastRole = currentPage * rolesPerPage;
  const indexOfFirstRole = indexOfLastRole - rolesPerPage;
  const currentRoles = roles.slice(indexOfFirstRole, indexOfLastRole);
  const totalPages = Math.ceil(roles.length / rolesPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="container-general">
      <h2 className="list-users-heading">Lista de Roles</h2>
      <div className="table-container">
        
        {/* Selector de cantidad por página */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px', alignItems: 'center' }}>
          <label style={{ marginRight: '8px', fontWeight: 'bold' }}>Roles por página:</label>
          <select onChange={handleChangeRolesPerPage} value={rolesPerPage === roles.length ? 'all' : rolesPerPage}>
            <option value="5">5</option>
            <option value="15">15</option>
            <option value="20">20</option>
            <option value="all">Todos</option>
          </select>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th className="th">ID</th>
              <th className="th">Rol</th>
            </tr>
          </thead>
          <tbody>
            {currentRoles.map(role => (
              <tr key={role.id} className="tr">
                <td className="td">{role.id}</td>
                <td className="td">{role.rol}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Paginador */}
        <div className="pagination">
          <button 
            onClick={handlePrevPage} 
            disabled={currentPage === 1}
            className="btn btn-update"
          >
            Anterior
          </button>
          <span className="pagination-info">
            Página {currentPage} de {totalPages}
          </span>
          <button 
            onClick={handleNextPage} 
            disabled={currentPage === totalPages}
            className="btn btn-update"
          >
            Siguiente
          </button>
        </div>

      </div>
    </div>
  );
};

export default ListRoles;
