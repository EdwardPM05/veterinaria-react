// frontend/src/pages/CitaServicios.jsx

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaDollarSign, FaFilePdf } from 'react-icons/fa'; // Agregamos FaFilePdf
import CitaServicioFormModal from '../components/CitaServicioFormModal';
import ReporteCitaModal from '../components/ReporteCitaModal'; // <-- ¡IMPORTAR EL NUEVO MODAL!

const API_BASE_URL = 'http://localhost:3001/api/citaservicios';

const CitaServicios = () => {
  const [citaServicios, setCitaServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false); // <-- NUEVO ESTADO PARA EL MODAL DE REPORTE
  const [selectedCitaServicio, setSelectedCitaServicio] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCitaServicios = useCallback(async (search = '') => {
    setLoading(true);
    try {
      let url = API_BASE_URL;
      if (search) {
        url += `?search=${search}`;
      }
      
      const response = await axios.get(url);
      setCitaServicios(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching CitaServicios:", err);
      setError("No se pudieron cargar los servicios de citas. Asegúrate de que el backend esté corriendo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCitaServicios(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchCitaServicios]);

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedCitaServicio) {
        await axios.put(`${API_BASE_URL}/${selectedCitaServicio.CitaServicioID}`, formData);
        alert('Servicio de cita actualizado exitosamente!');
      } else {
        await axios.post(API_BASE_URL, formData);
        alert('Servicio agregado a la cita exitosamente!');
      }
      setIsModalOpen(false);
      setSelectedCitaServicio(null);
      fetchCitaServicios(searchTerm); 
    } catch (err) {
      console.error("Error saving CitaServicio:", err);
      if (err.response && err.response.data && err.response.data.error) {
        alert(`Error al guardar servicio de cita: ${err.response.data.error}`);
      } else {
        alert('Error al guardar servicio de cita. Revisa la consola para más detalles.');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este servicio de la cita?')) {
      try {
        await axios.delete(`${API_BASE_URL}/${id}`);
        alert('Servicio de cita eliminado exitosamente!');
        fetchCitaServicios(searchTerm); 
      } catch (err) {
        console.error("Error deleting CitaServicio:", err);
        alert('Error al eliminar servicio de cita. Revisa la consola para más detalles.');
      }
    }
  };

  const handleAddClick = () => {
    setSelectedCitaServicio(null);
    setIsModalOpen(true);
  };

  // Función para abrir el modal de reporte
  const handleGenerateReportClick = () => {
    setIsReportModalOpen(true);
  };

  const handleEditClick = (citaServicio) => {
    setSelectedCitaServicio(citaServicio);
    setIsModalOpen(true);
  };

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

  const groupedCitas = useMemo(() => {
    const groups = {};
    citaServicios.forEach(cs => {
      if (!groups[cs.CitaID]) {
        groups[cs.CitaID] = {
          CitaID: cs.CitaID,
          CitaFecha: cs.CitaFecha,
          CitaEstado: cs.CitaEstado,
          MascotaNombre: cs.MascotaNombre,
          ClienteNombre: `${cs.ClientePrimerNombre} ${cs.ClienteApellidoPaterno} ${cs.ClienteApellidoMaterno || ''}`.trim(),
          Servicios: [],
          TotalPrecio: 0
        };
      }
      groups[cs.CitaID].Servicios.push({
        CitaServicioID: cs.CitaServicioID,
        ServicioNombre: cs.ServicioNombre,
        ServicioPrecio: cs.ServicioPrecio
      });
      groups[cs.CitaID].TotalPrecio += parseFloat(cs.ServicioPrecio || 0);
    });
    return Object.values(groups).sort((a, b) => new Date(b.CitaFecha) - new Date(a.CitaFecha));
  }, [citaServicios]);

  if (loading) {
    return <div className="text-center text-xl text-gray-600 py-8">Cargando servicios de citas...</div>;
  }

  if (error) {
    return <div className="text-center text-xl text-red-500 py-8">{error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">

        <div className="mb-6 flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden">
        <FaSearch className="ml-4 text-gray-400 text-lg" />
        <input
          type="text"
          placeholder="Buscar por mascota, cliente, servicio o estado..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-3 outline-none text-gray-700 placeholder-gray-400"
        />
      </div>


      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-3"> {/* Contenedor para los botones */}
          <button
            onClick={handleAddClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition duration-200"
          >
            <FaPlus className="mr-2" /> Agregar Servicio a Cita
          </button>
          <button
            onClick={handleGenerateReportClick} // <-- Botón para generar reporte
            className="bg-red-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition duration-200"
          >
            <FaFilePdf className="mr-2" /> Generar Reporte
          </button>
        </div>
      </div>


      {groupedCitas.length === 0 && !loading ? (
        <div className="py-8 px-6 text-center text-gray-500 text-lg">
          <FaDollarSign className="mx-auto text-4xl mb-3 text-gray-400" />
          {searchTerm ? 
             "No se encontraron servicios de citas con ese criterio de búsqueda." : 
             "No hay servicios asociados a citas registrados."
          }
        </div>
      ) : (
        <div className="space-y-6">
          {groupedCitas.map((citaGroup) => (
            <div key={citaGroup.CitaID} className="bg-gray-50 border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gray-100 p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center text-gray-800 font-semibold text-lg">
                <div className="mb-2 sm:mb-0">
                  Fecha: <span className="font-bold">{formatDateTime(citaGroup.CitaFecha)}</span> | 
                  Mascota: <span className="font-bold">{citaGroup.MascotaNombre}</span> (Cliente: {citaGroup.ClienteNombre})
                </div>
                <div className="flex items-center text-blue-700">
                  Total: <span className="text-2xl ml-2 font-extrabold">S/. {citaGroup.TotalPrecio.toFixed(2)}</span>
                </div>
              </div>
              <table className="min-w-full bg-white divide-y divide-gray-200">
                <thead className="bg-white">
                  <tr className="text-left text-gray-600 uppercase text-xs leading-normal">
                    <th className="py-2 px-4 font-semibold">Servicio</th>
                    <th className="py-2 px-4 font-semibold text-right">Precio</th>
                    <th className="py-2 px-4 text-center font-semibold w-40">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 text-sm divide-y divide-gray-100">
                  {citaGroup.Servicios.map((servicioItem) => (
                    <tr key={servicioItem.CitaServicioID} className="hover:bg-blue-50 transition duration-200 ease-in-out">
                      <td className="py-3 px-4 text-base">{servicioItem.ServicioNombre}</td>
                      <td className="py-3 px-4 text-right text-base">S/. {parseFloat(servicioItem.ServicioPrecio || 0).toFixed(2)}</td> 
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDelete(servicioItem.CitaServicioID)}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition duration-200 inline-flex items-center shadow-sm hover:shadow-md" 
                        >
                          <FaTrash className="mr-1" /> Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      <CitaServicioFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedCitaServicio}
      />

      {/* Nuevo Modal para Reporte */}
      <ReporteCitaModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};

export default CitaServicios;