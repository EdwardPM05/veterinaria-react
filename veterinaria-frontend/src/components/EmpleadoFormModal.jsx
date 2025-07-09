// src/components/EmpleadoFormModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaSave, FaTimes } from 'react-icons/fa';

const API_ROLES_URL = 'http://localhost:3001/api/roles';

const EmpleadoFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    PrimerNombre: '',
    ApellidoPaterno: '',
    ApellidoMaterno: '',
    DNI: '',
    Correo: '',
    Telefono: '',
    RolID: ''
  });
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [errorRoles, setErrorRoles] = useState(null);
  const [formError, setFormError] = useState('');

  // Cargar roles al abrir el modal
  const fetchRoles = useCallback(async () => {
    setLoadingRoles(true);
    setErrorRoles(null);
    try {
      const response = await axios.get(API_ROLES_URL);
      setRoles(response.data);
    } catch (err) {
      console.error("Error al obtener roles para el modal:", err);
      setErrorRoles("No se pudieron cargar los roles.");
    } finally {
      setLoadingRoles(false);
    }
  }, []); // Dependencias vacías: esta función solo se crea una vez

  useEffect(() => {
    if (isOpen) {
      setFormError(''); // Limpiar errores al abrir el modal
      fetchRoles(); // Cargar roles

      if (initialData) {
        setFormData({
          PrimerNombre: initialData.PrimerNombre || '',
          ApellidoPaterno: initialData.ApellidoPaterno || '',
          ApellidoMaterno: initialData.ApellidoMaterno || '',
          DNI: initialData.DNI || '',
          Correo: initialData.Correo || '',
          Telefono: initialData.Telefono || '',
          RolID: initialData.RolID || ''
        });
      } else {
        setFormData({
          PrimerNombre: '',
          ApellidoPaterno: '',
          ApellidoMaterno: '',
          DNI: '',
          Correo: '',
          Telefono: '',
          RolID: ''
        });
      }
    }
  }, [isOpen, initialData, fetchRoles]); // Dependencias: isOpen, initialData, y la función memoizada

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { PrimerNombre, ApellidoPaterno, ApellidoMaterno, DNI, RolID } = formData;

    if (!PrimerNombre.trim() || !ApellidoPaterno.trim() || !ApellidoMaterno.trim() || !DNI.trim() || !RolID) {
      setFormError('Por favor, completa todos los campos obligatorios marcados con (*).');
      return;
    }
    if (!/^\d{8}$/.test(DNI)) {
      setFormError('El DNI debe contener exactamente 8 dígitos numéricos.');
      return;
    }

    setFormError('');
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} // <-- Añade esto para probar
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative p-6 sm:p-8">
        
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-3xl font-extrabold text-gray-800 flex-1 text-center">
            {initialData ? 'Editar Empleado' : 'Agregar Nuevo Empleado'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition duration-200 absolute top-4 right-4"
            aria-label="Cerrar modal"
          >
            <FaTimes className="text-2xl" />
          </button>
        </div>

        {loadingRoles ? (
          <div className="text-center text-gray-600 py-8">Cargando roles...</div>
        ) : errorRoles ? (
          <div className="text-center text-red-500 py-8">{errorRoles}</div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {/* Campo Primer Nombre */}
            <div>
              <label htmlFor="PrimerNombre" className="block text-gray-700 text-sm font-semibold mb-2">Primer Nombre <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="PrimerNombre"
                name="PrimerNombre"
                value={formData.PrimerNombre}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Escribe el primer nombre"
                required
              />
            </div>
            {/* Campo Apellido Paterno */}
            <div>
              <label htmlFor="ApellidoPaterno" className="block text-gray-700 text-sm font-semibold mb-2">Apellido Paterno <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="ApellidoPaterno"
                name="ApellidoPaterno"
                value={formData.ApellidoPaterno}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Escribe el apellido paterno"
                required
              />
            </div>
            {/* Campo Apellido Materno */}
            <div>
              <label htmlFor="ApellidoMaterno" className="block text-gray-700 text-sm font-semibold mb-2">Apellido Materno <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="ApellidoMaterno"
                name="ApellidoMaterno"
                value={formData.ApellidoMaterno}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Escribe el apellido materno"
                required
              />
            </div>
            {/* Campo DNI */}
            <div>
              <label htmlFor="DNI" className="block text-gray-700 text-sm font-semibold mb-2">DNI <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="DNI"
                name="DNI"
                value={formData.DNI}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Ingresa 8 dígitos del DNI"
                maxLength="8"
                required
              />
            </div>
            {/* Campo Correo */}
            <div>
              <label htmlFor="Correo" className="block text-gray-700 text-sm font-semibold mb-2">Correo Electrónico</label>
              <input
                type="email"
                id="Correo"
                name="Correo"
                value={formData.Correo}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Ej: empleado@vetweb.com"
              />
            </div>
            {/* Campo Teléfono */}
            <div>
              <label htmlFor="Telefono" className="block text-gray-700 text-sm font-semibold mb-2">Teléfono</label>
              <input
                type="text"
                id="Telefono"
                name="Telefono"
                value={formData.Telefono}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Ej: 987654321"
              />
            </div>
            {/* Campo Rol */}
            <div className="md:col-span-2"> {/* Ocupa 2 columnas para centrarlo si es el último */}
              <label htmlFor="RolID" className="block text-gray-700 text-sm font-semibold mb-2">Rol <span className="text-red-500">*</span></label>
              <div className="relative w-full border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition duration-200">
                <select
                  id="RolID"
                  name="RolID"
                  value={formData.RolID}
                  onChange={handleChange}
                  className="w-full p-3 bg-white text-gray-700 rounded-md appearance-none outline-none cursor-pointer"
                  required
                >
                  <option value="">Selecciona un rol</option>
                  {roles.map(rol => (
                    <option key={rol.RolID} value={rol.RolID}>
                      {rol.NombreRol}
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
                <FaSave className="mr-2" /> {initialData ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EmpleadoFormModal;