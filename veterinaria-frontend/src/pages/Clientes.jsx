// src/pages/Clientes.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaUsers } from 'react-icons/fa'; // Agregamos FaUsers para el estado vacío
import ClienteFormModal from '../components/ClienteFormModal';

const API_BASE_URL = 'http://localhost:3001/api/clientes';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchClientes = async (search = '') => {
    setLoading(true);
    try {
      const url = search ? `${API_BASE_URL}?search=${search}` : API_BASE_URL;
      const response = await axios.get(url);
      setClientes(response.data);
      setError(null);
    } catch (err) {
      console.error("Error al obtener clientes:", err);
      setError("No se pudieron cargar los clientes. Asegúrate de que el backend esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchClientes(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedCliente) {
        await axios.put(`${API_BASE_URL}/${selectedCliente.ClienteID}`, formData);
        alert('Cliente actualizado exitosamente!');
      } else {
        await axios.post(API_BASE_URL, formData);
        alert('Cliente agregado exitosamente!');
      }
      setIsModalOpen(false);
      setSelectedCliente(null);
      fetchClientes(searchTerm);
    } catch (err) {
      console.error("Error al guardar cliente:", err);
      alert('Error al guardar cliente. Revisa la consola para más detalles.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      try {
        await axios.delete(`${API_BASE_URL}/${id}`);
        alert('Cliente eliminado exitosamente!');
        fetchClientes(searchTerm);
      } catch (err) {
        console.error("Error al eliminar cliente:", err);
        if (err.response && err.response.status === 409) {
          alert('Error: No se puede eliminar el cliente porque tiene mascotas asociadas.');
        } else {
          alert('Error al eliminar cliente. Revisa la consola para más detalles.');
        }
      }
    }
  };

  const handleAddClick = () => {
    setSelectedCliente(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (cliente) => {
    setSelectedCliente(cliente);
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="text-center text-xl text-gray-600 py-8">Cargando clientes...</div>;
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
          placeholder="Buscar clientes por nombre, DNI, teléfono o correo..."
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
          <FaPlus className="mr-2" /> Agregar Cliente
        </button>
      </div>

      {/* Tabla de Clientes */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 hidden">ID</th> 
              <th className="py-3 px-6 font-semibold">Nombre Completo</th>
              <th className="py-3 px-6 font-semibold">DNI</th>
              <th className="py-3 px-6 font-semibold">Teléfono</th>
              <th className="py-3 px-6 font-semibold">Correo</th>
              <th className="py-3 px-6 text-center w-56 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm divide-y divide-gray-200">
            {clientes.length === 0 && !loading ? (
              <tr>
                <td colSpan="6" className="py-8 px-6 text-center text-gray-500 text-lg">
                  <FaUsers className="mx-auto text-4xl mb-3 text-gray-400" /> {/* Ícono para estado vacío */}
                  {searchTerm ? "No se encontraron clientes con ese criterio de búsqueda." : "No hay clientes registrados."}
                </td>
              </tr>
            ) : (
              clientes.map((cliente) => (
                <tr 
                  key={cliente.ClienteID} 
                  className="hover:bg-blue-50 transition duration-200 ease-in-out"
                >
                  <td className="py-4 px-6 whitespace-nowrap hidden">{cliente.ClienteID}</td> 
                  <td className="py-4 px-6 text-base font-medium">
                    {cliente.PrimerNombre} {cliente.ApellidoPaterno} {cliente.ApellidoMaterno}
                  </td>
                  <td className="py-4 px-6 text-base">{cliente.DNI}</td>
                  <td className="py-4 px-6 text-base">{cliente.Telefono || 'N/A'}</td>
                  <td className="py-4 px-6 text-base">{cliente.Correo || 'N/A'}</td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleEditClick(cliente)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1.5 px-3 rounded-lg text-xs mr-2 transition duration-200 inline-flex items-center shadow-sm hover:shadow-md"
                    >
                      <FaEdit className="mr-1" /> Editar
                    </button>
                    <button
                      onClick={() => handleDelete(cliente.ClienteID)}
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

      <ClienteFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedCliente}
      />
    </div>
  );
};

export default Clientes;