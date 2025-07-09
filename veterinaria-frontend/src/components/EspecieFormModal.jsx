// src/components/EspecieFormModal.jsx
import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';

const EspecieFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [nombreEspecie, setNombreEspecie] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNombreEspecie(initialData ? initialData.NombreEspecie : '');
      setFormError(''); // Limpiar errores al abrir el modal
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombreEspecie.trim()) {
      setFormError('El nombre de la especie es obligatorio.');
      return;
    }
    setFormError(''); // Limpiar cualquier error previo si la validación es exitosa
    onSubmit({ NombreEspecie: nombreEspecie });
  };

  if (!isOpen) return null;

  return (
    // Overlay del modal
    <div 
      className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} // <-- Añade esto para probar
    >
      {/* Contenedor principal del modal */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg relative p-6 sm:p-8">
        
        {/* Encabezado del modal con título y botón de cerrar */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-3xl font-extrabold text-gray-800 flex-1 text-center">
            {initialData ? 'Editar Especie' : 'Agregar Nueva Especie'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition duration-200 absolute top-4 right-4"
            aria-label="Cerrar modal"
          >
            <FaTimes className="text-2xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-5"> 
            <label htmlFor="nombreEspecie" className="block text-gray-700 text-sm font-semibold mb-2">
              Nombre de Especie: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nombreEspecie"
              value={nombreEspecie}
              onChange={(e) => setNombreEspecie(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="Ej: Perro, Gato, Ave"
              required
            />
          </div>
          {formError && <p className="text-red-600 text-sm mt-4 text-center">{formError}</p>}
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
      </div>
    </div>
  );
};

export default EspecieFormModal;