// src/pages/Especies.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaBone } from 'react-icons/fa'; // Agregamos FaBone para la especie
import EspecieFormModal from '../components/EspecieFormModal';

const API_BASE_URL = 'http://localhost:3001/api/especies';

const Especies = () => {
  const [especies, setEspecies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEspecie, setSelectedEspecie] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEspecies = async (search = '') => {
    setLoading(true);
    try {
      const url = search ? `${API_BASE_URL}?search=${search}` : API_BASE_URL;
      const response = await axios.get(url);
      setEspecies(response.data);
      setError(null);
    } catch (err) {
      console.error("Error al obtener especies:", err);
      setError("No se pudieron cargar las especies. Asegúrate de que el backend esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchEspecies(searchTerm);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedEspecie) {
        await axios.put(`${API_BASE_URL}/${selectedEspecie.EspecieID}`, formData);
        alert('Especie actualizada exitosamente!');
      } else {
        await axios.post(API_BASE_URL, formData);
        alert('Especie agregada exitosamente!');
      }
      setIsModalOpen(false);
      setSelectedEspecie(null);
      fetchEspecies(searchTerm);
    } catch (err) {
      console.error("Error al guardar especie:", err);
      alert('Error al guardar especie. Revisa la consola para más detalles.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta especie?')) {
      try {
        await axios.delete(`${API_BASE_URL}/${id}`);
        alert('Especie eliminada exitosamente!');
        fetchEspecies(searchTerm);
      } catch (err) {
        console.error("Error al eliminar especie:", err);
        if (err.response && err.response.status === 409) {
          alert('Error: No se puede eliminar la especie porque tiene mascotas asociadas.');
        } else {
          alert('Error al eliminar especie. Revisa la consola para más detalles.');
        }
      }
    }
  };

  const handleAddClick = () => {
    setSelectedEspecie(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (especie) => {
    setSelectedEspecie(especie);
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="text-center text-xl text-gray-600 py-8">Cargando especies...</div>;
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
          placeholder="Buscar especies por nombre..."
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
          <FaPlus className="mr-2" /> Agregar Especie
        </button>
      </div>

      {/* Tabla de Especies */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden"> {/* Added overflow-hidden */}
          <thead className="bg-gray-50"> {/* Slightly lighter header background */}
            <tr className="text-left text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 hidden">ID</th> 
              <th className="py-3 px-6 font-semibold">Nombre de Especie</th> {/* Font-semibold para encabezados */}
              <th className="py-3 px-6 text-center w-56 font-semibold">Acciones</th> 
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm divide-y divide-gray-200"> {/* Añadido divide-y */}
            {especies.length === 0 && !loading ? (
              <tr>
                <td colSpan="2" className="py-8 px-6 text-center text-gray-500 text-lg">
                  <FaBone className="mx-auto text-4xl mb-3 text-gray-400" /> {/* Ícono para estado vacío */}
                  {searchTerm ? "No se encontraron especies con ese criterio de búsqueda." : "No hay especies registradas."}
                </td>
              </tr>
            ) : (
              especies.map((especie) => (
                <tr 
                  key={especie.EspecieID} 
                  className="hover:bg-blue-50 transition duration-200 ease-in-out" // Efecto hover más suave
                >
                  <td className="py-4 px-6 whitespace-nowrap hidden">{especie.EspecieID}</td> 
                  <td className="py-4 px-6 flex items-center text-base font-medium"> {/* Alineación con icono */}
                    {especie.NombreEspecie}
                  </td>
                  <td className="py-4 px-6 text-right"> 
                    <button
                      onClick={() => handleEditClick(especie)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1.5 px-3 rounded-lg text-xs mr-2 transition duration-200 inline-flex items-center shadow-sm hover:shadow-md" // Botones más grandes, con sombra
                    >
                      <FaEdit className="mr-1" /> Editar
                    </button>
                    <button
                      onClick={() => handleDelete(especie.EspecieID)}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition duration-200 inline-flex items-center shadow-sm hover:shadow-md" // Botones más grandes, con sombra
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

      <EspecieFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedEspecie}
      />
    </div>
  );
};

export default Especies;