// src/components/RazaFormModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSave, FaTimes } from 'react-icons/fa';

const API_ESPECIES_URL = 'http://localhost:3001/api/especies';

const RazaFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [nombreRaza, setNombreRaza] = useState('');
  const [especieID, setEspecieID] = useState('');
  const [especies, setEspecies] = useState([]);
  const [loadingEspecies, setLoadingEspecies] = useState(true);
  const [errorEspecies, setErrorEspecies] = useState(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const fetchEspecies = async () => {
      setLoadingEspecies(true);
      try {
        const response = await axios.get(API_ESPECIES_URL);
        setEspecies(response.data);
        setErrorEspecies(null);
      } catch (err) {
        console.error("Error al obtener especies para el modal:", err);
        setErrorEspecies("No se pudieron cargar las especies.");
      } finally {
        setLoadingEspecies(false);
      }
    };

    if (isOpen) {
      fetchEspecies();
      setFormError(''); // Limpiar errores al abrir
      if (initialData) {
        setNombreRaza(initialData.NombreRaza || '');
        setEspecieID(initialData.EspecieID || '');
      } else {
        setNombreRaza('');
        setEspecieID('');
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombreRaza.trim() || !especieID) {
      setFormError('Nombre de Raza y Especie son obligatorios.');
      return;
    }
    setFormError(''); // Limpiar errores si la validación es exitosa
    onSubmit({ NombreRaza: nombreRaza, EspecieID: parseInt(especieID) });
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
            {initialData ? 'Editar Raza' : 'Agregar Nueva Raza'}
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
            <label htmlFor="nombreRaza" className="block text-gray-700 text-sm font-semibold mb-2">
              Nombre de Raza: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nombreRaza"
              value={nombreRaza}
              onChange={(e) => setNombreRaza(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="Ej: Labrador, Siames, Periquito"
              required
            />
          </div>
          <div className="mb-5">
            <label htmlFor="especie" className="block text-gray-700 text-sm font-semibold mb-2">
              Especie: <span className="text-red-500">*</span>
            </label>
            {loadingEspecies ? (
              <p className="text-gray-600 py-3">Cargando especies...</p>
            ) : errorEspecies ? (
              <p className="text-red-500 py-3">{errorEspecies}</p>
            ) : (
              <select
                id="especie"
                value={especieID}
                onChange={(e) => setEspecieID(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                required
              >
                <option value="">Selecciona una especie</option>
                {especies.map((especie) => (
                  <option key={especie.EspecieID} value={especie.EspecieID}>
                    {especie.NombreEspecie}
                  </option>
                ))}
              </select>
            )}
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

export default RazaFormModal;