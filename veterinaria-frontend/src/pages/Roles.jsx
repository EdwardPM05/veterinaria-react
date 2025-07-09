// src/pages/Roles.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaUserTag } from 'react-icons/fa'; // FaUserTag para estado vacío
import RolFormModal from '../components/RolFormModal';

const API_BASE_URL = 'http://localhost:3001/api/roles'; // URL de API para Roles

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRol, setSelectedRol] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRoles = async (search = '') => {
    setLoading(true);
    try {
      const url = search ? `${API_BASE_URL}?search=${search}` : API_BASE_URL;
      const response = await axios.get(url);
      setRoles(response.data);
      setError(null);
    } catch (err) {
      console.error("Error al obtener roles:", err);
      setError("No se pudieron cargar los roles. Asegúrate de que el backend esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchRoles(searchTerm);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedRol) {
        await axios.put(`${API_BASE_URL}/${selectedRol.RolID}`, formData);
        alert('Rol actualizado exitosamente!');
      } else {
        await axios.post(API_BASE_URL, formData);
        alert('Rol agregado exitosamente!');
      }
      setIsModalOpen(false);
      setSelectedRol(null);
      fetchRoles(searchTerm);
    } catch (err) {
      console.error("Error al guardar rol:", err);
      if (err.response && err.response.status === 409) {
        alert('Error: El nombre del rol ya existe.');
      } else {
        alert('Error al guardar rol. Revisa la consola para más detalles.');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este rol?')) {
      try {
        await axios.delete(`${API_BASE_URL}/${id}`);
        alert('Rol eliminado exitosamente!');
        fetchRoles(searchTerm);
      } catch (err) {
        console.error("Error al eliminar rol:", err);
        if (err.response && err.response.status === 409) {
          alert('Error: No se puede eliminar el rol porque tiene empleados asociados.');
        } else {
          alert('Error al eliminar rol. Revisa la consola para más detalles.');
        }
      }
    }
  };

  const handleAddClick = () => {
    setSelectedRol(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (rol) => {
    setSelectedRol(rol);
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="text-center text-xl text-gray-600 py-8">Cargando roles...</div>;
  }

  if (error) {
    return <div className="text-center text-xl text-red-500 py-8">{error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">

      {/* Barra de búsqueda */}
      <div className="mb-6 flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden">
        <FaSearch className="ml-4 text-gray-400 text-lg" />
        <input
          type="text"
          placeholder="Buscar roles por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-3 outline-none text-gray-700 placeholder-gray-400"
        />
      </div>

      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleAddClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition duration-200"
        >
          <FaPlus className="mr-2" /> Agregar Rol
        </button>
      </div>

      {/* Tabla de Roles */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 hidden">ID</th> 
              <th className="py-3 px-6 font-semibold">Nombre del Rol</th>
              <th className="py-3 px-6 text-center w-56 font-semibold">Acciones</th> 
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm divide-y divide-gray-200">
            {roles.length === 0 && !loading ? (
              <tr>
                <td colSpan="2" className="py-8 px-6 text-center text-gray-500 text-lg">
                  <FaUserTag className="mx-auto text-4xl mb-3 text-gray-400" /> {/* Ícono para estado vacío */}
                  {searchTerm ? "No se encontraron roles con ese criterio de búsqueda." : "No hay roles registrados."}
                </td>
              </tr>
            ) : (
              roles.map((rol) => (
                <tr 
                  key={rol.RolID} 
                  className="hover:bg-blue-50 transition duration-200 ease-in-out" 
                >
                  <td className="py-4 px-6 whitespace-nowrap hidden">{rol.RolID}</td> 
                  <td className="py-4 px-6 text-base font-medium">
                    {rol.NombreRol}
                  </td>
                  <td className="py-4 px-6 text-right"> 
                    <button
                      onClick={() => handleEditClick(rol)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1.5 px-3 rounded-lg text-xs mr-2 transition duration-200 inline-flex items-center shadow-sm hover:shadow-md" 
                    >
                      <FaEdit className="mr-1" /> Editar
                    </button>
                    <button
                      onClick={() => handleDelete(rol.RolID)}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition duration-200 inline-flex items-center shadow-sm hover:shadow-md" 
                    >
                      <FaTrash className="mr-1" /> Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <RolFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedRol}
      />
    </div>
  );
};

export default Roles;