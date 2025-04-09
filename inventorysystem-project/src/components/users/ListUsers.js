import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { IoMdCheckboxOutline } from "react-icons/io"; // Icono de estado activo
import { FiMinusCircle } from "react-icons/fi"; // Icono de estado inactivo
import { FaRegTrashCan } from "react-icons/fa6"; // Icono de eliminar
import { MdOutlineCancel } from "react-icons/md"; // Icono de cancelar
import { MdOutlineSaveAlt } from "react-icons/md"; // Icono de guardar
import { Link } from 'react-router-dom';

const ListUsers = () => {
  const [users, setUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(null); // Para saber qué usuario está siendo editado
  const [editedUser, setEditedUser] = useState(null); // Para almacenar el usuario que se está editando

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Token no encontrado. Usuario no autenticado.');
      return;
    }

    axios.get('http://localhost:8080/users/Listar', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => setUsers(response.data))
    .catch(error => console.error("Error al obtener usuarios: ", error));
  }, []);

  const handleDelete = (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Token no encontrado. Usuario no autenticado.');
      return;
    }

    axios.delete(`http://localhost:8080/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      alert('Usuario eliminado exitosamente');
      setUsers(users.filter(user => user.id !== id));
    })
    .catch(error => console.error('Error al eliminar usuario:', error));
  };

  const handleUpdate = (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Token no encontrado. Usuario no autenticado.');
      return;
    }

    const updatedUser = { ...editedUser };

    axios.put('http://localhost:8080/users', updatedUser, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(response => {
      console.log('Usuario actualizado exitosamente');
    })
    .catch(error => {
      console.error('Error al actualizar usuario:', error);
      alert('Error al actualizar usuario');
    });
  };

  const handleChange = (e, user) => {
    setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
  };

  const handleCancelEdit = () => {
    setIsEditing(null); // Restablecer la edición
    setEditedUser(null); // Limpiar los cambios
  };

  return (
    <div className="container-general">
      <h2 className="list-users-heading">Lista de Usuarios</h2>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="th">ID</th>
              <th className="th">Username</th>
              <th className="th">Estado</th>
              <th className="th">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="tr">
                <td className="td">{user.id}</td>
                <td className="td">
                  {/* Si estamos editando, mostrar un campo de entrada */}
                  {isEditing === user.id ? (
                    <input 
                      type="text" 
                      name="username" 
                      value={editedUser ? editedUser.username : user.username} 
                      onChange={(e) => handleChange(e, user)} 
                    />
                  ) : (
                    user.username
                  )}
                </td>
                <td className="td">
                  {/* Mostrar el icono y el texto de acuerdo al estado */}
                  {user.enabled ? (
                    <>
                      <IoMdCheckboxOutline style={{ color: 'green' }} /> 
                      <span style={{ color: 'green' }}>Activo</span>
                    </>
                  ) : (
                    <>
                      <FiMinusCircle style={{ color: 'red' }} /> 
                      <span style={{ color: 'red' }}>Inactivo</span>
                    </>
                  )}
                </td>
                <td className="td">
                  {/* Si no estamos editando, mostrar los iconos de modificar y eliminar */}
                  {isEditing === user.id ? (
                    <>
                      <button onClick={() => handleUpdate(user.id)} className="btn btn-update">
                        <MdOutlineSaveAlt style={{ color: 'white' }} /> Guardar
                      </button>
                      <button onClick={handleCancelEdit} className="btn btn-delete">
                        <MdOutlineCancel style={{ color: 'white' }} /> Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => setIsEditing(user.id)} 
                        className="btn btn-update"
                      >
                        <IoMdCheckboxOutline style={{ color: 'blue' }} /> Modificar
                      </button>
                    </>
                  )}

                  {/* Mostrar el botón de eliminar solo si no estamos editando */}
                  {isEditing !== user.id && (
                    <button onClick={() => handleDelete(user.id)} className="btn btn-delete">
                      <FaRegTrashCan style={{ color: 'red' }} /> Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListUsers;
