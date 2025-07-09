// src/components/ClienteFormModal.jsx
import React, { useEffect, useState } from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';

const ClienteFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    PrimerNombre: '',
    ApellidoPaterno: '',
    ApellidoMaterno: '',
    DNI: '',
    Telefono: '',
    Direccion: '',
    Correo: ''
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData({
        PrimerNombre: initialData?.PrimerNombre || '',
        ApellidoPaterno: initialData?.ApellidoPaterno || '',
        ApellidoMaterno: initialData?.ApellidoMaterno || '',
        DNI: initialData?.DNI || '',
        Telefono: initialData?.Telefono || '',
        Direccion: initialData?.Direccion || '',
        Correo: initialData?.Correo || ''
      });
      setFormError(''); // Limpiar errores al abrir el modal
    }
  }, [initialData, isOpen]);

  // No renderizar si no está abierto
  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.PrimerNombre.trim() || !formData.ApellidoPaterno.trim() || !formData.ApellidoMaterno.trim() || !formData.DNI.trim()) {
      setFormError('Por favor, completa todos los campos obligatorios marcados con (*).');
      return;
    }
    if (!/^\d{8}$/.test(formData.DNI)) {
      setFormError('El DNI debe contener exactamente 8 dígitos numéricos.');
      return;
    }

    setFormError(''); // Limpiar errores si la validación es exitosa
    onSubmit(formData);
  };

  return (
    // Overlay del modal: fondo semi-transparente y centrado
    <div 
      className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} // <-- Añade esto para probar
    >
      {/* Contenedor principal del modal */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative p-6 sm:p-8">
        
        {/* Encabezado del modal con título y botón de cerrar */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-3xl font-extrabold text-gray-800 flex-1 text-center">
            {initialData ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition duration-200 absolute top-4 right-4"
            aria-label="Cerrar modal"
          >
            <FaTimes className="text-2xl" />
          </button>
        </div>

        {/* Formulario */}
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
          {/* Campo Dirección */}
          <div>
            <label htmlFor="Direccion" className="block text-gray-700 text-sm font-semibold mb-2">Dirección</label>
            <input
              type="text"
              id="Direccion"
              name="Direccion"
              value={formData.Direccion}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="Ej: Av. Las Palmeras 123"
            />
          </div>
          {/* Campo Correo (ocupa 2 columnas) */}
          <div className="md:col-span-2">
            <label htmlFor="Correo" className="block text-gray-700 text-sm font-semibold mb-2">Correo Electrónico</label>
            <input
              type="email"
              id="Correo"
              name="Correo"
              value={formData.Correo}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="Ej: ejemplo@dominio.com"
            />
          </div>
          
          {/* Mensaje de error del formulario */}
          {formError && (
            <div className="md:col-span-2 text-red-600 text-sm mt-4 text-center">
              {formError}
            </div>
          )}

          {/* Botones de acción */}
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
      </div>
    </div>
  );
};

export default ClienteFormModal;