// src/pages/Subcategorias.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaClipboardList } from 'react-icons/fa'; // FaClipboardList para estado vacío
import SubcategoriaFormModal from '../components/SubcategoriaFormModal';

const API_BASE_URL = 'http://localhost:3001/api/subcategorias'; // Nueva URL de API

const Subcategorias = () => {
  const [subcategorias, setSubcategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubcategoria, setSelectedSubcategoria] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSubcategorias = async (search = '') => {
    setLoading(true);
    try {
      const url = search ? `${API_BASE_URL}?search=${search}` : API_BASE_URL;
      const response = await axios.get(url);
      setSubcategorias(response.data);
      setError(null);
    } catch (err) {
      console.error("Error al obtener subcategorías:", err);
      setError("No se pudieron cargar las subcategorías. Asegúrate de que el backend esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchSubcategorias(searchTerm);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedSubcategoria) {
        await axios.put(`${API_BASE_URL}/${selectedSubcategoria.SubcategoriaID}`, formData);
        alert('Subcategoría actualizada exitosamente!');
      } else {
        await axios.post(API_BASE_URL, formData);
        alert('Subcategoría agregada exitosamente!');
      }
      setIsModalOpen(false);
      setSelectedSubcategoria(null);
      fetchSubcategorias(searchTerm);
    } catch (err) {
      console.error("Error al guardar subcategoría:", err);
      alert('Error al guardar subcategoría. Revisa la consola para más detalles.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta subcategoría?')) {
      try {
        await axios.delete(`${API_BASE_URL}/${id}`);
        alert('Subcategoría eliminada exitosamente!');
        fetchSubcategorias(searchTerm);
      } catch (err) {
        console.error("Error al eliminar subcategoría:", err);
        if (err.response && err.response.status === 409) {
          alert('Error: No se puede eliminar la subcategoría porque tiene servicios asociados.');
        } else {
          alert('Error al eliminar subcategoría. Revisa la consola para más detalles.');
        }
      }
    }
  };

  const handleAddClick = () => {
    setSelectedSubcategoria(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (subcategoria) => {
    setSelectedSubcategoria(subcategoria);
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="text-center text-xl text-gray-600 py-8">Cargando subcategorías...</div>;
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
          placeholder="Buscar subcategorías por nombre o categoría..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-3 outline-none text-gray-700 placeholder-gray-400"
        />
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Subcategorías</h1>
        <button
          onClick={handleAddClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition duration-200"
        >
          <FaPlus className="mr-2" /> Agregar Subcategoría
        </button>
      </div>

      {/* Tabla de Subcategorías */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 hidden">ID</th> 
              <th className="py-3 px-6 font-semibold">Nombre</th>
              <th className="py-3 px-6 font-semibold">Categoría</th>
              <th className="py-3 px-6 font-semibold">Descripción</th>
              <th className="py-3 px-6 text-center w-56 font-semibold">Acciones</th> 
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm divide-y divide-gray-200">
            {subcategorias.length === 0 && !loading ? (
              <tr>
                <td colSpan="4" className="py-8 px-6 text-center text-gray-500 text-lg">
                  <FaClipboardList className="mx-auto text-4xl mb-3 text-gray-400" /> {/* Ícono para estado vacío */}
                  {searchTerm ? "No se encontraron subcategorías con ese criterio de búsqueda." : "No hay subcategorías registradas."}
                </td>
              </tr>
            ) : (
              subcategorias.map((subcategoria) => (
                <tr 
                  key={subcategoria.SubcategoriaID} 
                  className="hover:bg-blue-50 transition duration-200 ease-in-out" 
                >
                  <td className="py-4 px-6 whitespace-nowrap hidden">{subcategoria.SubcategoriaID}</td> 
                  <td className="py-4 px-6 text-base font-medium">
                    {subcategoria.Nombre}
                  </td>
                  <td className="py-4 px-6 text-base">
                    {subcategoria.NombreCategoria} {/* Muestra el nombre de la categoría */}
                  </td>
                  <td className="py-4 px-6 text-base">
                    {subcategoria.Descripcion || 'N/A'}
                  </td>
                  <td className="py-4 px-6 text-right"> 
                    <button
                      onClick={() => handleEditClick(subcategoria)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1.5 px-3 rounded-lg text-xs mr-2 transition duration-200 inline-flex items-center shadow-sm hover:shadow-md" 
                    >
                      <FaEdit className="mr-1" /> Editar
                    </button>
                    <button
                      onClick={() => handleDelete(subcategoria.SubcategoriaID)}
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

      <SubcategoriaFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedSubcategoria}
      />
    </div>
  );
};

export default Subcategorias;