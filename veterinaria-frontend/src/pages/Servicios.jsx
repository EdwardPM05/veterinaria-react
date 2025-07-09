// src/pages/Servicios.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaBriefcaseMedical } from 'react-icons/fa'; // Icono para estado vacío
import ServicioFormModal from '../components/ServicioFormModal';

const API_BASE_URL = 'http://localhost:3001/api/servicios'; // Nueva URL de API

const Servicios = () => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServicio, setSelectedServicio] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchServicios = async (search = '') => {
    setLoading(true);
    try {
      const url = search ? `${API_BASE_URL}?search=${search}` : API_BASE_URL;
      const response = await axios.get(url);
      setServicios(response.data);
      setError(null);
    } catch (err) {
      console.error("Error al obtener servicios:", err);
      setError("No se pudieron cargar los servicios. Asegúrate de que el backend esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchServicios(searchTerm);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedServicio) {
        await axios.put(`${API_BASE_URL}/${selectedServicio.ServicioID}`, formData);
        alert('Servicio actualizado exitosamente!');
      } else {
        await axios.post(API_BASE_URL, formData);
        alert('Servicio agregado exitosamente!');
      }
      setIsModalOpen(false);
      setSelectedServicio(null);
      fetchServicios(searchTerm);
    } catch (err) {
      console.error("Error al guardar servicio:", err);
      alert('Error al guardar servicio. Revisa la consola para más detalles.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      try {
        await axios.delete(`${API_BASE_URL}/${id}`);
        alert('Servicio eliminado exitosamente!');
        fetchServicios(searchTerm);
      } catch (err) {
        console.error("Error al eliminar servicio:", err);
        // Puedes añadir manejo de errores específicos si el servicio está referenciado en otras tablas
        alert('Error al eliminar servicio. Revisa la consola para más detalles.');
      }
    }
  };

  const handleAddClick = () => {
    setSelectedServicio(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (servicio) => {
    setSelectedServicio(servicio);
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="text-center text-xl text-gray-600 py-8">Cargando servicios...</div>;
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
          placeholder="Buscar servicios por nombre, descripción, categoría o subcategoría..."
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
          <FaPlus className="mr-2" /> Agregar Servicio
        </button>
      </div>

      {/* Tabla de Servicios */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 hidden">ID</th> 
              <th className="py-3 px-6 font-semibold">Nombre del Servicio</th>
              <th className="py-3 px-6 font-semibold">Categoría</th>
              <th className="py-3 px-6 font-semibold">Subcategoría</th>
              <th className="py-3 px-6 font-semibold text-right">Precio</th>
              <th className="py-3 px-6 font-semibold">Descripción</th>
              <th className="py-3 px-6 text-center w-56 font-semibold">Acciones</th> 
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm divide-y divide-gray-200">
            {servicios.length === 0 && !loading ? (
              <tr>
                <td colSpan="7" className="py-8 px-6 text-center text-gray-500 text-lg">
                  <FaBriefcaseMedical className="mx-auto text-4xl mb-3 text-gray-400" />
                  {searchTerm ? "No se encontraron servicios con ese criterio de búsqueda." : "No hay servicios registrados."}
                </td>
              </tr>
            ) : (
              servicios.map((servicio) => (
                <tr 
                  key={servicio.ServicioID} 
                  className="hover:bg-blue-50 transition duration-200 ease-in-out" 
                >
                  <td className="py-4 px-6 whitespace-nowrap hidden">{servicio.ServicioID}</td> 
                  <td className="py-4 px-6 text-base font-medium">
                    {servicio.NombreServicio}
                  </td>
                  <td className="py-4 px-6 text-base">
                    {servicio.NombreCategoria || 'N/A'} {/* Muestra el nombre de la categoría */}
                  </td>
                  <td className="py-4 px-6 text-base">
                    {servicio.NombreSubcategoria || 'N/A'} {/* Muestra el nombre de la subcategoría */}
                  </td>
                  <td className="py-4 px-6 text-base text-right">
                    S/. {parseFloat(servicio.Precio).toFixed(2)}
                  </td>
                  <td className="py-4 px-6 text-base">
                    {servicio.Descripcion || 'N/A'}
                  </td>
                  <td className="py-4 px-6 text-right"> 
                    <button
                      onClick={() => handleEditClick(servicio)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1.5 px-3 rounded-lg text-xs mr-2 transition duration-200 inline-flex items-center shadow-sm hover:shadow-md" 
                    >
                      <FaEdit className="mr-1" /> Editar
                    </button>
                    <button
                      onClick={() => handleDelete(servicio.ServicioID)}
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

      <ServicioFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedServicio}
      />
    </div>
  );
};

export default Servicios;