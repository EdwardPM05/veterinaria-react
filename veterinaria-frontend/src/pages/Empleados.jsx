// src/pages/Empleados.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaUserTie } from 'react-icons/fa'; // FaUserTie para estado vacío
import EmpleadoFormModal from '../components/EmpleadoFormModal';

const API_BASE_URL = 'http://localhost:3001/api/empleados'; // URL de API para Empleados

const Empleados = () => {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmpleado, setSelectedEmpleado] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEmpleados = async (search = '') => {
    setLoading(true);
    try {
      const url = search ? `${API_BASE_URL}?search=${search}` : API_BASE_URL;
      const response = await axios.get(url);
      setEmpleados(response.data);
      setError(null);
    } catch (err) {
      console.error("Error al obtener empleados:", err);
      setError("No se pudieron cargar los empleados. Asegúrate de que el backend esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchEmpleados(searchTerm);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedEmpleado) {
        await axios.put(`${API_BASE_URL}/${selectedEmpleado.EmpleadoID}`, formData);
        alert('Empleado actualizado exitosamente!');
      } else {
        await axios.post(API_BASE_URL, formData);
        alert('Empleado agregado exitosamente!');
      }
      setIsModalOpen(false);
      setSelectedEmpleado(null);
      fetchEmpleados(searchTerm);
    } catch (err) {
      console.error("Error al guardar empleado:", err);
      if (err.response && err.response.status === 409) {
        alert('Error: El DNI ingresado ya existe para otro empleado.');
      } else {
        alert('Error al guardar empleado. Revisa la consola para más detalles.');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este empleado?')) {
      try {
        await axios.delete(`${API_BASE_URL}/${id}`);
        alert('Empleado eliminado exitosamente!');
        fetchEmpleados(searchTerm);
      } catch (err) {
        console.error("Error al eliminar empleado:", err);
        if (err.response && err.response.status === 409) {
          alert('Error: No se puede eliminar el empleado porque tiene citas asociadas.');
        } else {
          alert('Error al eliminar empleado. Revisa la consola para más detalles.');
        }
      }
    }
  };

  const handleAddClick = () => {
    setSelectedEmpleado(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (empleado) => {
    setSelectedEmpleado(empleado);
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="text-center text-xl text-gray-600 py-8">Cargando empleados...</div>;
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
          placeholder="Buscar empleados por nombre, DNI, teléfono, correo o rol..."
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
          <FaPlus className="mr-2" /> Agregar Empleado
        </button>
      </div>

      {/* Tabla de Empleados */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 hidden">ID</th> 
              <th className="py-3 px-6 font-semibold">Nombre Completo</th>
              <th className="py-3 px-6 font-semibold">DNI</th>
              <th className="py-3 px-6 font-semibold">Teléfono</th>
              <th className="py-3 px-6 font-semibold">Correo</th>
              <th className="py-3 px-6 font-semibold">Rol</th>
              <th className="py-3 px-6 text-center w-56 font-semibold">Acciones</th> 
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm divide-y divide-gray-200">
            {empleados.length === 0 && !loading ? (
              <tr>
                <td colSpan="7" className="py-8 px-6 text-center text-gray-500 text-lg">
                  <FaUserTie className="mx-auto text-4xl mb-3 text-gray-400" />
                  {searchTerm ? "No se encontraron empleados con ese criterio de búsqueda." : "No hay empleados registrados."}
                </td>
              </tr>
            ) : (
              empleados.map((empleado) => (
                <tr 
                  key={empleado.EmpleadoID} 
                  className="hover:bg-blue-50 transition duration-200 ease-in-out" 
                >
                  <td className="py-4 px-6 whitespace-nowrap hidden">{empleado.EmpleadoID}</td> 
                  <td className="py-4 px-6 text-base font-medium">
                    {empleado.PrimerNombre} {empleado.ApellidoPaterno} {empleado.ApellidoMaterno}
                  </td>
                  <td className="py-4 px-6 text-base">{empleado.DNI}</td>
                  <td className="py-4 px-6 text-base">{empleado.Telefono || 'N/A'}</td>
                  <td className="py-4 px-6 text-base">{empleado.Correo || 'N/A'}</td>
                  <td className="py-4 px-6 text-base">{empleado.NombreRol}</td>
                  <td className="py-4 px-6 text-right"> 
                    <button
                      onClick={() => handleEditClick(empleado)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1.5 px-3 rounded-lg text-xs mr-2 transition duration-200 inline-flex items-center shadow-sm hover:shadow-md" 
                    >
                      <FaEdit className="mr-1" /> Editar
                    </button>
                    <button
                      onClick={() => handleDelete(empleado.EmpleadoID)}
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

      <EmpleadoFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedEmpleado}
      />
    </div>
  );
};

export default Empleados;