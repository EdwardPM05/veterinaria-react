// src/components/SubcategoriaFormModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaSave, FaTimes } from 'react-icons/fa';

const API_CATEGORIAS_URL = 'http://localhost:3001/api/categorias'; // URL para obtener categorías

const SubcategoriaFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    Nombre: '',
    Descripcion: '',
    CategoriaProductoID: ''
  });
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [errorCategorias, setErrorCategorias] = useState(null);
  const [formError, setFormError] = useState('');

  // Usamos useCallback para memoizar la función de carga de categorías
  const fetchCategorias = useCallback(async () => {
    setLoadingCategorias(true);
    setErrorCategorias(null);
    try {
      const response = await axios.get(API_CATEGORIAS_URL);
      setCategorias(response.data);
    } catch (err) {
      console.error("Error al obtener categorías para el modal:", err);
      setErrorCategorias("No se pudieron cargar las categorías.");
    } finally {
      setLoadingCategorias(false);
    }
  }, []); // No depende de nada, solo se crea una vez

  useEffect(() => {
    if (isOpen) {
      setFormError(''); // Limpiar errores al abrir el modal
      fetchCategorias(); // Llamar a la función memoizada

      if (initialData) {
        setFormData({
          Nombre: initialData.Nombre || '',
          Descripcion: initialData.Descripcion || '',
          CategoriaProductoID: initialData.CategoriaProductoID || ''
        });
      } else {
        setFormData({
          Nombre: '',
          Descripcion: '',
          CategoriaProductoID: ''
        });
      }
    }
  }, [isOpen, initialData, fetchCategorias]); // Dependencias: isOpen, initialData, y la función memoizada

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.Nombre.trim() || !formData.CategoriaProductoID) {
      setFormError('Nombre y Categoría son obligatorios.');
      return;
    }
    setFormError('');
    onSubmit({ 
      Nombre: formData.Nombre, 
      Descripcion: formData.Descripcion, 
      CategoriaProductoID: parseInt(formData.CategoriaProductoID) 
    });
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
            {initialData ? 'Editar Subcategoría' : 'Agregar Nueva Subcategoría'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition duration-200 absolute top-4 right-4"
            aria-label="Cerrar modal"
          >
            <FaTimes className="text-2xl" />
          </button>
        </div>

        {loadingCategorias ? (
          <div className="text-center text-gray-600 py-8">Cargando categorías...</div>
        ) : errorCategorias ? (
          <div className="text-center text-red-500 py-8">{errorCategorias}</div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-5"> {/* Solo una columna */}
            {/* Campo Nombre */}
            <div>
              <label htmlFor="Nombre" className="block text-gray-700 text-sm font-semibold mb-2">Nombre <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="Nombre"
                name="Nombre"
                value={formData.Nombre}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Ej: Alimento Seco, Juguetes Interactivos"
                required
              />
            </div>
            {/* Campo Categoría */}
            <div>
              <label htmlFor="CategoriaProductoID" className="block text-gray-700 text-sm font-semibold mb-2">Categoría <span className="text-red-500">*</span></label>
              <div className="relative w-full border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition duration-200">
                <select
                  id="CategoriaProductoID"
                  name="CategoriaProductoID"
                  value={formData.CategoriaProductoID}
                  onChange={handleChange}
                  className="w-full p-3 bg-white text-gray-700 rounded-md appearance-none outline-none cursor-pointer"
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map(categoria => (
                    <option key={categoria.CategoriaProductoID} value={categoria.CategoriaProductoID}>
                      {categoria.NombreCategoria}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
            {/* Campo Descripción */}
            <div>
              <label htmlFor="Descripcion" className="block text-gray-700 text-sm font-semibold mb-2">Descripción</label>
              <textarea
                id="Descripcion"
                name="Descripcion"
                value={formData.Descripcion}
                onChange={handleChange}
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-y"
                placeholder="Descripción opcional de la subcategoría"
              ></textarea>
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

export default SubcategoriaFormModal;