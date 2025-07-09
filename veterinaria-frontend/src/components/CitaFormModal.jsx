// src/components/CitaFormModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaSave, FaTimes } from 'react-icons/fa';

const API_MASCOTAS_URL = 'http://localhost:3001/api/mascotas';
const API_EMPLEADOS_URL = 'http://localhost:3001/api/empleados';

const CitaFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    Fecha: '',
    Estado: 'Pendiente',
    MascotaID: '',
    EmpleadoID: ''
  });
  const [mascotas, setMascotas] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loadingDependencies, setLoadingDependencies] = useState(true);
  const [errorDependencies, setErrorDependencies] = useState(null);
  const [formError, setFormError] = useState('');

  // Obtener la fecha y hora actual formateada para el input datetime-local
  // Esto también servirá como valor mínimo para el input
  const getMinDateTime = () => {
    const now = new Date();
    // Ajustar a la zona horaria local y luego obtener el formato YYYY-MM-DDTHH:mm
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [minDateTime, setMinDateTime] = useState(getMinDateTime());


  // Función para cargar mascotas y empleados
  const fetchDependencies = useCallback(async () => {
    setLoadingDependencies(true);
    setErrorDependencies(null);
    try {
      const [mascotasRes, empleadosRes] = await Promise.all([
        axios.get(API_MASCOTAS_URL),
        axios.get(API_EMPLEADOS_URL)
      ]);
      setMascotas(mascotasRes.data);
      setEmpleados(empleadosRes.data);
    } catch (err) {
      console.error("Error al obtener dependencias para el modal de cita:", err);
      setErrorDependencies("No se pudieron cargar mascotas o empleados.");
    } finally {
      setLoadingDependencies(false);
    }
  }, []);

  // Efecto para cargar dependencias y setear initialData
  useEffect(() => {
    if (isOpen) {
      setFormError(''); // Limpiar errores al abrir el modal
      setMinDateTime(getMinDateTime()); // Actualizar el minDateTime por si el modal se reabre otro día

      fetchDependencies(); // Cargar mascotas y empleados

      if (initialData) {
        // Formatear la fecha para el input datetime-local
        // Asegúrate de que la fecha sea manejada correctamente.
        // Si la fecha de la cita ya pasada, el input puede mostrarla pero no permitir seleccionarla de nuevo.
        const initialDate = new Date(initialData.Fecha);
        const formattedDate = initialDate 
          ? initialDate.toISOString().slice(0, 16) // "YYYY-MM-DDTHH:mm"
          : '';

        setFormData({
          Fecha: formattedDate,
          Estado: initialData.Estado || 'Pendiente',
          MascotaID: initialData.MascotaID || '',
          EmpleadoID: initialData.EmpleadoID || ''
        });
      } else {
        // Para una nueva cita, el valor por defecto es la fecha y hora actual o la mínima permitida
        setFormData({
          Fecha: getMinDateTime(), 
          Estado: 'Pendiente',
          MascotaID: '',
          EmpleadoID: ''
        });
      }
    }
  }, [isOpen, initialData, fetchDependencies]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { Fecha, Estado, MascotaID, EmpleadoID } = formData;

    if (!Fecha || !Estado.trim() || !MascotaID || !EmpleadoID) {
      setFormError('Por favor, completa todos los campos obligatorios (*).');
      return;
    }

    // --- VALIDACIÓN DE FECHA: NO PERMITIR FECHAS PASADAS ---
    const selectedDate = new Date(Fecha);
    const now = new Date();
    // Para comparar, ignora los segundos y milisegundos para ser más indulgente en la comparación
    // O simplemente compara directamente con now, que incluye segundos/milisegundos
    // Si la cita es para un día pasado, o para hoy pero una hora/minuto pasado
    if (selectedDate < now && (!initialData || initialData.Fecha !== Fecha)) { // Si es una cita nueva o si se está cambiando la fecha de una existente a una pasada
        setFormError('No se puede agendar una cita en el pasado.');
        return;
    }
    // --------------------------------------------------------

    setFormError('');
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} // <-- Añade esto para probar
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg relative p-6 sm:p-8">
        
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-3xl font-extrabold text-gray-800 flex-1 text-center">
            {initialData ? 'Editar Cita' : 'Agendar Nueva Cita'}
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
          <div className="text-center text-gray-600 py-8">Cargando mascotas y empleados...</div>
        ) : errorDependencies ? (
          <div className="text-center text-red-500 py-8">{errorDependencies}</div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {/* Campo Fecha */}
            <div className="md:col-span-2"> {/* Ocupa todo el ancho */}
              <label htmlFor="Fecha" className="block text-gray-700 text-sm font-semibold mb-2">Fecha y Hora <span className="text-red-500">*</span></label>
              <input
                type="datetime-local"
                id="Fecha"
                name="Fecha"
                value={formData.Fecha}
                onChange={handleChange}
                // --- VALIDACIÓN DE FECHA: min attribute ---
                min={minDateTime} 
                // -----------------------------------------
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                required
              />
            </div>
            {/* Campo Estado */}
            <div>
              <label htmlFor="Estado" className="block text-gray-700 text-sm font-semibold mb-2">Estado <span className="text-red-500">*</span></label>
              <div className="relative w-full border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition duration-200">
                <select
                  id="Estado"
                  name="Estado"
                  value={formData.Estado}
                  onChange={handleChange}
                  className="w-full p-3 bg-white text-gray-700 rounded-md appearance-none outline-none cursor-pointer"
                  required
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Confirmada">Confirmada</option>
                  <option value="Completada">Completada</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
            {/* Campo Mascota */}
            <div>
              <label htmlFor="MascotaID" className="block text-gray-700 text-sm font-semibold mb-2">Mascota <span className="text-red-500">*</span></label>
              <div className="relative w-full border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition duration-200">
                <select
                  id="MascotaID"
                  name="MascotaID"
                  value={formData.MascotaID}
                  onChange={handleChange}
                  className="w-full p-3 bg-white text-gray-700 rounded-md appearance-none outline-none cursor-pointer"
                  required
                >
                  <option value="">Selecciona una mascota</option>
                  {mascotas.map(mascota => (
                    <option key={mascota.MascotaID} value={mascota.MascotaID}>
                      {mascota.Nombre} ({mascota.ClientePrimerNombre} {mascota.ClienteApellidoPaterno})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
            {/* Campo Empleado */}
            <div className="md:col-span-2"> {/* Ocupa todo el ancho si es el último */}
              <label htmlFor="EmpleadoID" className="block text-gray-700 text-sm font-semibold mb-2">Empleado <span className="text-red-500">*</span></label>
              <div className="relative w-full border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition duration-200">
                <select
                  id="EmpleadoID"
                  name="EmpleadoID"
                  value={formData.EmpleadoID}
                  onChange={handleChange}
                  className="w-full p-3 bg-white text-gray-700 rounded-md appearance-none outline-none cursor-pointer"
                  required
                >
                  <option value="">Selecciona un empleado</option>
                  {empleados.map(empleado => (
                    <option key={empleado.EmpleadoID} value={empleado.EmpleadoID}>
                      {empleado.PrimerNombre} {empleado.ApellidoPaterno} ({empleado.NombreRol})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
            
            {formError && (
              <div className="md:col-span-2 text-red-600 text-sm mt-4 text-center">
                {formError}
              </div>
            )}

            <div className="md:col-span-2 flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
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
                <FaSave className="mr-2" /> {initialData ? 'Actualizar' : 'Agendar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CitaFormModal;