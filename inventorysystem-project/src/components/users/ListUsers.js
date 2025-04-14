import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { IoMdCheckboxOutline } from "react-icons/io";
import { FiMinusCircle } from "react-icons/fi";
import { FaRegTrashCan } from "react-icons/fa6";
import { MdOutlineCancel, MdOutlineSaveAlt } from "react-icons/md";

const ListUsers = () => {
  const [users, setUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(null);
  const [editedUser, setEditedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(5);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Token no encontrado.');
      return;
    }

    axios.get('http://localhost:8080/usuarios/listar', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => setUsers(response.data))
    .catch(error => console.error("Error al obtener usuarios: ", error));
  }, []);

  const handleDelete = (id) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    axios.delete(`http://localhost:8080/usuarios/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      alert('Usuario eliminado exitosamente');
      setUsers(users.filter(user => user.id !== id));
    })
    .catch(error => console.error('Error al eliminar usuario:', error));
  };

  const handleUpdate = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    axios.put('http://localhost:8080/usuarios', editedUser, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      alert('Usuario actualizado exitosamente');
      setUsers(users.map(user => (user.id === editedUser.id ? editedUser : user)));
      setIsEditing(null);
      setEditedUser(null);
    })
    .catch(error => {
      console.error('Error al actualizar usuario:', error);
      alert('Error al actualizar usuario');
    });
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setEditedUser({
      ...editedUser,
      [name]: type === 'number' ? parseInt(value) : value
    });
  };

  const handleStartEdit = (user) => {
    setIsEditing(user.id);
    setEditedUser({ ...user });
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
    setEditedUser(null);
  };

  const handleChangeUsersPerPage = (e) => {
    const value = e.target.value;
    if (value === "all") {
      setUsersPerPage(users.length);
      setCurrentPage(1);
    } else {
      setUsersPerPage(Number(value));
      setCurrentPage(1);
    }
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="container-general">
      <h2 className="list-users-heading">Lista de Usuarios</h2>
      <div className="table-container">

        {/* Selector de cantidad por página */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px', alignItems: 'center' }}>
          <label style={{ marginRight: '8px', fontWeight: 'bold' }}></label>
          <select onChange={handleChangeUsersPerPage} value={usersPerPage === users.length ? 'all' : usersPerPage}>
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
              <th className="th">Nombre</th>
              <th className="th">Apellido</th>
              <th className="th">Correo</th>
              <th className="th">Username</th>
              <th className="th">Género</th>
              <th className="th">DNI</th>
              <th className="th">Teléfono</th>
              <th className="th">Nacimiento</th>
              <th className="th">Foto</th>
              <th className="th">Estado</th>
              <th className="th">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map(user => (
              <tr key={user.id} className="tr">
                <td className="td">{user.id}</td>

                <td className="td">
                  {isEditing === user.id ? (
                    <input name="nombre" value={editedUser.nombre || ''} onChange={handleChange} />
                  ) : user.nombre}
                </td>

                <td className="td">
                  {isEditing === user.id ? (
                    <input name="apellido" value={editedUser.apellido || ''} onChange={handleChange} />
                  ) : user.apellido}
                </td>

                <td className="td">
                  {isEditing === user.id ? (
                    <input name="correo" type="email" value={editedUser.correo || ''} onChange={handleChange} />
                  ) : user.correo}
                </td>

                <td className="td">
                  {isEditing === user.id ? (
                    <input name="username" value={editedUser.username || ''} onChange={handleChange} />
                  ) : user.username}
                </td>

                <td className="td">
                  {isEditing === user.id ? (
                    <select name="genero" value={editedUser.genero || ''} onChange={handleChange}>
                      <option value="">Selecciona</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Otro">Otro</option>
                    </select>
                  ) : user.genero}
                </td>

                <td className="td">
                  {isEditing === user.id ? (
                    <input name="dni" type="number" value={editedUser.dni || ''} onChange={handleChange} />
                  ) : user.dni}
                </td>

                <td className="td">
                  {isEditing === user.id ? (
                    <input name="telefono" type="number" value={editedUser.telefono || ''} onChange={handleChange} />
                  ) : user.telefono}
                </td>

                <td className="td">
                  {isEditing === user.id ? (
                    <input name="fechaNacimiento" type="date" value={editedUser.fechaNacimiento?.substring(0, 10) || ''} onChange={handleChange} />
                  ) : user.fechaNacimiento?.substring(0, 10)}
                </td>

                <td className="td">
                  {isEditing === user.id ? (
                    <input name="foto" type="text" value={editedUser.foto || ''} onChange={handleChange} />
                  ) : <img src={user.foto} alt="foto" width="50" />}
                </td>

                <td className="td">
                  {isEditing === user.id ? (
                    <select
                      name="enabled"
                      value={editedUser.enabled ? 'true' : 'false'}
                      onChange={(e) =>
                        handleChange({
                          target: {
                            name: 'enabled',
                            value: e.target.value === 'true',
                          },
                        })
                      }
                    >
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </select>
                  ) : (
                    user.enabled ? (
                      <>
                        <IoMdCheckboxOutline style={{ color: 'green' }} />
                        <span style={{ color: 'green' }}>Activo</span>
                      </>
                    ) : (
                      <>
                        <FiMinusCircle style={{ color: 'red' }} />
                        <span style={{ color: 'red' }}>Inactivo</span>
                      </>
                    )
                  )}
                </td>

                <td className="td">
                  {isEditing === user.id ? (
                    <>
                      <button onClick={handleUpdate} className="btn btn-update">
                        <MdOutlineSaveAlt style={{ color: 'white' }} /> Guardar
                      </button>
                      <button onClick={handleCancelEdit} className="btn btn-delete">
                        <MdOutlineCancel style={{ color: 'white' }} /> Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleStartEdit(user)} className="btn btn-update">
                        <IoMdCheckboxOutline style={{ color: 'blue' }} /> Modificar
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="btn btn-delete">
                        <FaRegTrashCan style={{ color: 'red' }} /> Eliminar
                      </button>
                    </>
                  )}
                </td>
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

export default ListUsers;
