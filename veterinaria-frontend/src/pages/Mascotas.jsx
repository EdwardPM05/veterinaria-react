// src/pages/Mascotas.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaPaw } from 'react-icons/fa'; // FaPaw para estado vacío
import MascotaFormModal from '../components/MascotaFormModal'; // Necesitarás crear este componente

const API_BASE_URL = 'http://localhost:3001/api/mascotas';

const Mascotas = () => {
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMascota, setSelectedMascota] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMascotas = async (search = '') => {
    setLoading(true);
    try {
      const url = search ? `${API_BASE_URL}?search=${search}` : API_BASE_URL;
      const response = await axios.get(url);
      setMascotas(response.data);
      setError(null);
    } catch (err) {
      console.error("Error al obtener mascotas:", err);
      setError("No se pudieron cargar las mascotas. Asegúrate de que el backend esté corriendo y la base de datos esté accesible.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchMascotas(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedMascota) {
        await axios.put(`${API_BASE_URL}/${selectedMascota.MascotaID}`, formData);
        alert('Mascota actualizada exitosamente!');
      } else {
        await axios.post(API_BASE_URL, formData);
        alert('Mascota agregada exitosamente!');
      }
      setIsModalOpen(false);
      setSelectedMascota(null);
      fetchMascotas(searchTerm); // Recarga la lista CON el término de búsqueda actual
    } catch (err) {
      console.error("Error al guardar mascota:", err);
      alert('Error al guardar mascota. Revisa la consola para más detalles.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta mascota?')) {
      try {
        await axios.delete(`${API_BASE_URL}/${id}`);
        alert('Mascota eliminada exitosamente!');
        fetchMascotas(searchTerm); // Recarga la lista CON el término de búsqueda actual
      } catch (err) {
        console.error("Error al eliminar mascota:", err);
        if (err.response && err.response.status === 409) {
            alert('Error: No se puede eliminar la mascota porque tiene registros asociados (ej. citas, historiales médicos).');
        } else {
            alert('Error al eliminar mascota. Revisa la consola para más detalles.');
        }
      }
    }
  };

  const handleAddClick = () => {
    setSelectedMascota(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (mascota) => {
    setSelectedMascota(mascota);
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="text-center text-xl text-gray-600 py-8">Cargando mascotas...</div>;
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
          placeholder="Buscar mascotas por nombre, cliente, raza o especie..."
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
          <FaPlus className="mr-2" /> Agregar Mascota
        </button>
      </div>

      {/* Tabla de Mascotas */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 font-semibold">Nombre</th>
              <th className="py-3 px-6 font-semibold">Edad</th>
              <th className="py-3 px-6 font-semibold">Sexo</th>
              <th className="py-3 px-6 font-semibold">Cliente</th>
              <th className="py-3 px-6 font-semibold">Raza</th>
              <th className="py-3 px-6 font-semibold">Especie</th>
              <th className="py-3 px-6 text-center w-56 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm divide-y divide-gray-200">
            {mascotas.length === 0 && !loading ? (
              <tr>
                <td colSpan="7" className="py-8 px-6 text-center text-gray-500 text-lg">
                  <FaPaw className="mx-auto text-4xl mb-3 text-gray-400" /> {/* Ícono para estado vacío */}
                  {searchTerm ? "No se encontraron mascotas con ese criterio de búsqueda." : "No hay mascotas registradas."}
                </td>
              </tr>
            ) : (
              mascotas.map((mascota) => (
                <tr 
                  key={mascota.MascotaID} 
                  className="hover:bg-blue-50 transition duration-200 ease-in-out"
                >
                  <td className="py-4 px-6 text-base font-medium">{mascota.Nombre}</td>
                  <td className="py-4 px-6 text-base">{mascota.Edad}</td>
                  <td className="py-4 px-6 text-base">{mascota.Sexo}</td>
                  <td className="py-4 px-6 text-base">
                    {mascota.ClientePrimerNombre} {mascota.ClienteApellidoPaterno} {mascota.ClienteApellidoMaterno}
                  </td>
                  <td className="py-4 px-6 text-base">{mascota.NombreRaza}</td>
                  <td className="py-4 px-6 text-base">{mascota.NombreEspecie}</td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleEditClick(mascota)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1.5 px-3 rounded-lg text-xs mr-2 transition duration-200 inline-flex items-center shadow-sm hover:shadow-md"
                    >
                      <FaEdit className="mr-1" /> Editar
                    </button>
                    <button
                      onClick={() => handleDelete(mascota.MascotaID)}
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

      <MascotaFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedMascota}
      />
    </div>
  );
};

export default Mascotas;