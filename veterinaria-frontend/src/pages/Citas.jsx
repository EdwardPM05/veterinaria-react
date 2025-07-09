// src/pages/Citas.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaCalendarAlt } from 'react-icons/fa'; // FaCalendarAlt para estado vacío
import CitaFormModal from '../components/CitaFormModal';

const API_BASE_URL = 'http://localhost:3001/api/citas'; // URL de API para Citas

const Citas = () => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCita, setSelectedCita] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCitas = async (search = '') => {
    setLoading(true);
    try {
      const url = search ? `${API_BASE_URL}?search=${search}` : API_BASE_URL;
      const response = await axios.get(url);
      setCitas(response.data);
      setError(null);
    } catch (err) {
      console.error("Error al obtener citas:", err);
      setError("No se pudieron cargar las citas. Asegúrate de que el backend esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCitas(searchTerm);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedCita) {
        await axios.put(`${API_BASE_URL}/${selectedCita.CitaID}`, formData);
        alert('Cita actualizada exitosamente!');
      } else {
        await axios.post(API_BASE_URL, formData);
        alert('Cita agendada exitosamente!');
      }
      setIsModalOpen(false);
      setSelectedCita(null);
      fetchCitas(searchTerm);
    } catch (err) {
      console.error("Error al guardar cita:", err);
      if (err.response && err.response.data && err.response.data.error) {
        alert(`Error al guardar cita: ${err.response.data.error}`);
      } else {
        alert('Error al guardar cita. Revisa la consola para más detalles.');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
      try {
        await axios.delete(`${API_BASE_URL}/${id}`);
        alert('Cita eliminada exitosamente!');
        fetchCitas(searchTerm);
      } catch (err) {
        console.error("Error al eliminar cita:", err);
        if (err.response && err.response.status === 409) {
          alert('Error: No se puede eliminar la cita porque tiene servicios asociados.');
        } else {
          alert('Error al eliminar cita. Revisa la consola para más detalles.');
        }
      }
    }
  };

  const handleAddClick = () => {
    setSelectedCita(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (cita) => {
    setSelectedCita(cita);
    setIsModalOpen(true);
  };

  // Función para formatear la fecha para la visualización en la tabla
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    return date.toLocaleString('es-ES', { 
      year: 'numeric', 
      month: 'numeric', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return <div className="text-center text-xl text-gray-600 py-8">Cargando citas...</div>;
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
          placeholder="Buscar citas por mascota, cliente, empleado o estado..."
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
          <FaPlus className="mr-2" /> Agendar Cita
        </button>
      </div>

      {/* Tabla de Citas */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 hidden">ID</th> 
              <th className="py-3 px-6 font-semibold">Fecha y Hora</th>
              <th className="py-3 px-6 font-semibold">Estado</th>
              <th className="py-3 px-6 font-semibold">Mascota</th>
              <th className="py-3 px-6 font-semibold">Cliente</th>
              <th className="py-3 px-6 font-semibold">Empleado</th>
              <th className="py-3 px-6 text-center w-56 font-semibold">Acciones</th> 
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm divide-y divide-gray-200">
            {citas.length === 0 && !loading ? (
              <tr>
                <td colSpan="7" className="py-8 px-6 text-center text-gray-500 text-lg">
                  <FaCalendarAlt className="mx-auto text-4xl mb-3 text-gray-400" />
                  {searchTerm ? "No se encontraron citas con ese criterio de búsqueda." : "No hay citas registradas."}
                </td>
              </tr>
            ) : (
              citas.map((cita) => (
                <tr 
                  key={cita.CitaID} 
                  className="hover:bg-blue-50 transition duration-200 ease-in-out" 
                >
                  <td className="py-4 px-6 whitespace-nowrap hidden">{cita.CitaID}</td> 
                  <td className="py-4 px-6 text-base font-medium">
                    {formatDateTime(cita.Fecha)}
                  </td>
                  <td className="py-4 px-6 text-base">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold 
                      ${cita.Estado === 'Pendiente' ? 'bg-blue-100 text-blue-800' :
                        cita.Estado === 'Confirmada' ? 'bg-green-100 text-green-800' :
                        cita.Estado === 'Completada' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800' // Cancelada
                      }`}
                    >
                      {cita.Estado}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-base">{cita.MascotaNombre}</td>
                  <td className="py-4 px-6 text-base">
                    {cita.ClientePrimerNombre} {cita.ClienteApellidoPaterno}
                  </td>
                  <td className="py-4 px-6 text-base">
                    {cita.EmpleadoPrimerNombre} ({cita.EmpleadoRol})
                  </td>
                  <td className="py-4 px-6 text-right"> 
                    <button
                      onClick={() => handleEditClick(cita)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1.5 px-3 rounded-lg text-xs mr-2 transition duration-200 inline-flex items-center shadow-sm hover:shadow-md" 
                    >
                      <FaEdit className="mr-1" /> Editar
                    </button>
                    <button
                      onClick={() => handleDelete(cita.CitaID)}
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

      <CitaFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedCita}
      />
    </div>
  );
};

export default Citas;