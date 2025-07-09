// src/components/ServicioFormModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaSave, FaTimes } from 'react-icons/fa';

const API_CATEGORIAS_URL = 'http://localhost:3001/api/categorias';
const API_SUBCATEGORIAS_URL = 'http://localhost:3001/api/subcategorias';

const ServicioFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    NombreServicio: '',
    Descripcion: '',
    Precio: '',
    SubcategoriaID: '',
    selectedCategoriaID: '' // Para manejar la categoría seleccionada en el frontend
  });
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [filteredSubcategorias, setFilteredSubcategorias] = useState([]);
  const [loadingDependencies, setLoadingDependencies] = useState(true);
  const [errorDependencies, setErrorDependencies] = useState(null);
  const [formError, setFormError] = useState('');

  // Función para cargar categorías y subcategorías, memoizada con useCallback
  // Esta función NO tiene dependencias, por lo que su referencia NUNCA cambia.
  const fetchDependencies = useCallback(async () => {
    setLoadingDependencies(true);
    setErrorDependencies(null);
    try {
      const [categoriasRes, subcategoriasRes] = await Promise.all([
        axios.get(API_CATEGORIAS_URL),
        axios.get(API_SUBCATEGORIAS_URL)
      ]);
      setCategorias(categoriasRes.data);
      setSubcategorias(subcategoriasRes.data);
    } catch (err) {
      console.error("Error al obtener dependencias para el modal de servicio:", err);
      setErrorDependencies("No se pudieron cargar las categorías y subcategorías.");
    } finally {
      setLoadingDependencies(false);
    }
  }, []);

  // **PRIMER useEffect:** Inicia la carga de dependencias cuando el modal se abre.
  // Solo depende de 'isOpen' y de la función 'fetchDependencies' (que es estable).
  useEffect(() => {
    if (isOpen) {
      setFormError(''); // Limpiar errores al abrir el modal
      fetchDependencies(); // Dispara la carga de datos
    }
  }, [isOpen, fetchDependencies]); // Dependencias: isOpen y fetchDependencies (estable)

  // **SEGUNDO useEffect:** Inicializa los datos del formulario (initialData)
  // una vez que el modal está abierto Y las dependencias (subcategorias, categorias) se han cargado.
  useEffect(() => {
    if (isOpen && !loadingDependencies && initialData && categorias.length > 0 && subcategorias.length > 0) {
      const sub = subcategorias.find(s => s.SubcategoriaID === initialData.SubcategoriaID);
      setFormData({
        NombreServicio: initialData.NombreServicio || '',
        Descripcion: initialData.Descripcion || '',
        Precio: initialData.Precio !== undefined ? initialData.Precio.toString() : '',
        SubcategoriaID: initialData.SubcategoriaID || '',
        selectedCategoriaID: sub ? sub.CategoriaProductoID.toString() : ''
      });
    } else if (isOpen && !initialData) { // Si no hay initialData, limpiar el formulario al abrir
      setFormData({
        NombreServicio: '',
        Descripcion: '',
        Precio: '',
        SubcategoriaID: '',
        selectedCategoriaID: ''
      });
    }
  }, [isOpen, initialData, loadingDependencies, subcategorias, categorias]); // Depende de que las dependencias estén cargadas

  // **TERCER useEffect:** Filtra las subcategorías cuando cambia la categoría seleccionada.
  // Este useEffect es correcto como estaba.
  useEffect(() => {
    if (formData.selectedCategoriaID) {
      const filtered = subcategorias.filter(sub => 
        sub.CategoriaProductoID === parseInt(formData.selectedCategoriaID)
      );
      setFilteredSubcategorias(filtered);
      // Si la subcategoría seleccionada no pertenece a la nueva categoría, resetearla
      if (!filtered.some(s => s.SubcategoriaID === parseInt(formData.SubcategoriaID))) {
        setFormData(prev => ({ ...prev, SubcategoriaID: '' }));
      }
    } else {
      setFilteredSubcategorias([]); // Si no hay categoría seleccionada, no hay subcategorías
      setFormData(prev => ({ ...prev, SubcategoriaID: '' })); // Y limpiar la subcategoría
    }
  }, [formData.selectedCategoriaID, subcategorias, formData.SubcategoriaID]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoriaChange = (e) => {
    const selectedCatId = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      selectedCategoriaID: selectedCatId,
      SubcategoriaID: '' // Resetear subcategoría al cambiar de categoría
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.NombreServicio.trim() || formData.Precio === '' || isNaN(parseFloat(formData.Precio))) {
      setFormError('Nombre del Servicio y Precio son obligatorios y el precio debe ser un número.');
      return;
    }
    // Asegurarse de que si se selecciona una subcategoría, también haya una categoría padre.
    // Esto es más una validación lógica que un requisito de la UI ya que el select de subcategoría está deshabilitado.
    // if (formData.SubcategoriaID && !formData.selectedCategoriaID) {
    //   setFormError('Debes seleccionar una Categoría para la subcategoría.');
    //   return;
    // }

    setFormError('');
    onSubmit({ 
      NombreServicio: formData.NombreServicio, 
      Descripcion: formData.Descripcion, 
      Precio: parseFloat(formData.Precio), 
      SubcategoriaID: formData.SubcategoriaID ? parseInt(formData.SubcategoriaID) : null
    });
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
            {initialData ? 'Editar Servicio' : 'Agregar Nuevo Servicio'}
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
          <div className="text-center text-gray-600 py-8">Cargando dependencias...</div>
        ) : errorDependencies ? (
          <div className="text-center text-red-500 py-8">{errorDependencies}</div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-5">
            {/* Campo Nombre del Servicio */}
            <div>
              <label htmlFor="NombreServicio" className="block text-gray-700 text-sm font-semibold mb-2">Nombre del Servicio <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="NombreServicio"
                name="NombreServicio"
                value={formData.NombreServicio}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Ej: Consulta Veterinaria, Baño y Peluquería"
                required
              />
            </div>
            {/* Campo Precio */}
            <div>
              <label htmlFor="Precio" className="block text-gray-700 text-sm font-semibold mb-2">Precio <span className="text-red-500">*</span></label>
              <input
                type="number"
                id="Precio"
                name="Precio"
                value={formData.Precio}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Ej: 50.00"
                step="0.01"
                required
              />
            </div>
            {/* Campo Categoría (para filtrar subcategorías) */}
            <div>
              <label htmlFor="selectedCategoriaID" className="block text-gray-700 text-sm font-semibold mb-2">Categoría</label>
              <div className="relative w-full border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition duration-200">
                <select
                  id="selectedCategoriaID"
                  name="selectedCategoriaID"
                  value={formData.selectedCategoriaID}
                  onChange={handleCategoriaChange}
                  className="w-full p-3 bg-white text-gray-700 rounded-md appearance-none outline-none cursor-pointer"
                >
                  <option value="">Selecciona una categoría (Opcional)</option>
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

            {/* Campo Subcategoría (filtrado por Categoría) */}
            <div>
              <label htmlFor="SubcategoriaID" className="block text-gray-700 text-sm font-semibold mb-2">Subcategoría</label>
              <div className="relative w-full border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition duration-200">
                <select
                  id="SubcategoriaID"
                  name="SubcategoriaID"
                  value={formData.SubcategoriaID}
                  onChange={handleChange}
                  className="w-full p-3 bg-white text-gray-700 rounded-md appearance-none outline-none cursor-pointer"
                  disabled={!formData.selectedCategoriaID || filteredSubcategorias.length === 0} // Deshabilitar si no hay categoría o subcategorías
                >
                  <option value="">Selecciona una subcategoría (Opcional)</option>
                  {filteredSubcategorias.map(sub => (
                    <option key={sub.SubcategoriaID} value={sub.SubcategoriaID}>
                      {sub.Nombre}
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
                placeholder="Descripción opcional del servicio"
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

export default ServicioFormModal;