// frontend/src/components/CitaServicioFormModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaSave, FaTimes } from 'react-icons/fa';

// Asegúrate de que estas URLs sean correctas para tus endpoints
const API_CITAS_URL = 'http://localhost:3001/api/citas';
const API_SERVICIOS_URL = 'http://localhost:3001/api/servicios';

const CitaServicioFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    CitaID: '',
    ServicioID: ''
  });
  const [citas, setCitas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loadingDependencies, setLoadingDependencies] = useState(true);
  const [errorDependencies, setErrorDependencies] = useState(null);
  const [formError, setFormError] = useState('');

  // Función para obtener citas y servicios
  const fetchDependencies = useCallback(async () => {
    setLoadingDependencies(true);
    setErrorDependencies(null); // Limpiar errores anteriores
    try {
      // Asumiendo que tu /api/citas endpoint ya hace join con Mascotas y Clientes para los nombres
      const [citasRes, serviciosRes] = await Promise.all([
        axios.get(API_CITAS_URL),
        axios.get(API_SERVICIOS_URL)
      ]);
      setCitas(citasRes.data);
      setServicios(serviciosRes.data);
    } catch (err) {
      console.error("Error al obtener dependencias para el modal de CitaServicio:", err);
      // Detalle del error para el usuario
      setErrorDependencies("No se pudieron cargar las citas o los servicios. Verifica que los servidores backend estén funcionando y que las rutas sean correctas.");
    } finally {
      setLoadingDependencies(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setFormError(''); // Limpiar errores del formulario al abrir el modal
      fetchDependencies(); // Obtener las dependencias

      if (initialData) {
        setFormData({
          CitaID: initialData.CitaID || '',
          ServicioID: initialData.ServicioID || ''
        });
      } else {
        setFormData({
          CitaID: '',
          ServicioID: ''
        });
      }
    }
  }, [isOpen, initialData, fetchDependencies]); // 'fetchDependencies' es una dependencia porque es una función memoizada con useCallback

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { CitaID, ServicioID } = formData;

    if (!CitaID || !ServicioID) {
      setFormError('Por favor, selecciona una cita y un servicio.');
      return;
    }

    setFormError(''); // Limpiar errores antes de enviar
    onSubmit(formData);
  };

  if (!isOpen) return null;

  // Función para formatear fecha y hora para mostrar en los selectores
  const formatDateTimeForSelect = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    return date.toLocaleString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} // <-- Añade esto para probar
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg relative p-6 sm:p-8">
        
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-3xl font-extrabold text-gray-800 flex-1 text-center">
            {initialData ? 'Editar Servicio de Cita' : 'Agregar Servicio a Cita'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition duration-200 absolute top-4 right-4"
            aria-label="Cerrar modal"
          >
            <FaTimes className="text-2xl" />
          </button>
        </div>

        {loadingDependencies ? (
          <div className="text-center text-gray-600 py-8">Cargando citas y servicios...</div>
        ) : errorDependencies ? (
          <div className="text-center text-red-500 py-8">{errorDependencies}</div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-5">
            {/* Campo de Cita */}
            <div>
              <label htmlFor="CitaID" className="block text-gray-700 text-sm font-semibold mb-2">Cita <span className="text-red-500">*</span></label>
              <div className="relative w-full border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition duration-200">
                <select
                  id="CitaID"
                  name="CitaID"
                  value={formData.CitaID}
                  onChange={handleChange}
                  className="w-full p-3 bg-white text-gray-700 rounded-md appearance-none outline-none cursor-pointer"
                  required
                >
                  <option value="">Selecciona una cita</option>
                  {citas.map(cita => (
                    <option key={cita.CitaID} value={cita.CitaID}>
                      {formatDateTimeForSelect(cita.Fecha)} - {cita.MascotaNombre} ({cita.ClientePrimerNombre} {cita.ClienteApellidoPaterno})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            {/* Campo de Servicio */}
            <div>
              <label htmlFor="ServicioID" className="block text-gray-700 text-sm font-semibold mb-2">Servicio <span className="text-red-500">*</span></label>
              <div className="relative w-full border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition duration-200">
                <select
                  id="ServicioID"
                  name="ServicioID"
                  value={formData.ServicioID}
                  onChange={handleChange}
                  className="w-full p-3 bg-white text-gray-700 rounded-md appearance-none outline-none cursor-pointer"
                  required
                >
                  <option value="">Selecciona un servicio</option>
                  {servicios.map(servicio => (
                    <option key={servicio.ServicioID} value={servicio.ServicioID}>
                      {servicio.NombreServicio} - S/. {parseFloat(servicio.Precio || 0).toFixed(2)} {/* <-- SOLUCIÓN AQUÍ */}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
            
            {formError && (
              <div className="text-red-600 text-sm mt-4 text-center">
                {formError}
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2.5 px-5 rounded-lg transition duration-200 flex items-center shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                <FaTimes className="mr-2" /> Cancelar
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-lg transition duration-200 flex items-center shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <FaSave className="mr-2" /> {initialData ? 'Actualizar' : 'Agregar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CitaServicioFormModal;