// src/pages/Razas.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaDog } from 'react-icons/fa'; // Mantengo FaDog para el estado vacío, si se desea
import RazaFormModal from '../components/RazaFormModal';

const API_BASE_URL = 'http://localhost:3001/api/razas';

const Razas = () => {
  const [razas, setRazas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRaza, setSelectedRaza] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRazas = async (search = '') => {
    setLoading(true);
    try {
      const url = search ? `${API_BASE_URL}?search=${search}` : API_BASE_URL;
      const response = await axios.get(url);
      setRazas(response.data);
      setError(null);
    } catch (err) {
      console.error("Error al obtener razas:", err);
      setError("No se pudieron cargar las razas. Asegúrate de que el backend esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchRazas(searchTerm);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedRaza) {
        await axios.put(`${API_BASE_URL}/${selectedRaza.RazaID}`, formData);
        alert('Raza actualizada exitosamente!');
      } else {
        await axios.post(API_BASE_URL, formData);
        alert('Raza agregada exitosamente!');
      }
      setIsModalOpen(false);
      setSelectedRaza(null);
      fetchRazas(searchTerm);
    } catch (err) {
      console.error("Error al guardar raza:", err);
      alert('Error al guardar raza. Revisa la consola para más detalles.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta raza?')) {
      try {
        await axios.delete(`${API_BASE_URL}/${id}`);
        alert('Raza eliminada exitosamente!');
        fetchRazas(searchTerm);
      } catch (err) {
        console.error("Error al eliminar raza:", err);
        if (err.response && err.response.status === 409) {
          alert('Error: No se puede eliminar la raza porque tiene mascotas asociadas.');
        } else {
          alert('Error al eliminar raza. Revisa la consola para más detalles.');
        }
      }
    }
  };

  const handleAddClick = () => {
    setSelectedRaza(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (raza) => {
    setSelectedRaza(raza);
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="text-center text-xl text-gray-600 py-8">Cargando razas...</div>;
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
          placeholder="Buscar razas por nombre o especie..."
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
          <FaPlus className="mr-2" /> Agregar Raza
        </button>
      </div>

      {/* Tabla de Razas */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 hidden">ID</th> 
              <th className="py-3 px-6 font-semibold">Nombre de Raza</th>
              <th className="py-3 px-6 font-semibold">Especie</th> 
              <th className="py-3 px-6 text-center w-56 font-semibold">Acciones</th> 
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm divide-y divide-gray-200">
            {razas.length === 0 && !loading ? (
              <tr>
                {/* Colspan ajustado a 3 (NombreRaza, Especie, Acciones) + 1 para el icono si lo hubiera, sin icono es 3 */}
                <td colSpan="3" className="py-8 px-6 text-center text-gray-500 text-lg">
                  <FaDog className="mx-auto text-4xl mb-3 text-gray-400" /> {/* Icono para estado vacío */}
                  {searchTerm ? "No se encontraron razas con ese criterio de búsqueda." : "No hay razas registradas."}
                </td>
              </tr>
            ) : (
              razas.map((raza) => (
                <tr 
                  key={raza.RazaID} 
                  className="hover:bg-blue-50 transition duration-200 ease-in-out" 
                >
                  <td className="py-4 px-6 whitespace-nowrap hidden">{raza.RazaID}</td> 
                  <td className="py-4 px-6 text-base font-medium"> {/* SIN FaBone aquí */}
                    {raza.NombreRaza}
                  </td>
                  <td className="py-4 px-6 text-base font-medium"> {/* ESTILO SIMILAR A NOMBRE DE RAZA */}
                    {raza.NombreEspecie}
                  </td>
                  <td className="py-4 px-6 text-right"> 
                    <button
                      onClick={() => handleEditClick(raza)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1.5 px-3 rounded-lg text-xs mr-2 transition duration-200 inline-flex items-center shadow-sm hover:shadow-md" 
                    >
                      <FaEdit className="mr-1" /> Editar
                    </button>
                    <button
                      onClick={() => handleDelete(raza.RazaID)}
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

      <RazaFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedRaza}
      />
    </div>
  );
};

export default Razas;