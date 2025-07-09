// src/components/MascotaFormModal.jsx
import React, { useState, useEffect, useCallback } from 'react'; // Importar useCallback
import axios from 'axios';
import { FaSave, FaTimes } from 'react-icons/fa';

const API_CLIENTES_URL = 'http://localhost:3001/api/clientes';
const API_RAZAS_URL = 'http://localhost:3001/api/razas';
const API_ESPECIES_URL = 'http://localhost:3001/api/especies';

const MascotaFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    Nombre: '',
    Edad: '',
    Sexo: '',
    ClienteID: '',
    RazaID: ''
  });

  const [clientes, setClientes] = useState([]);
  const [razas, setRazas] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [loadingDependencies, setLoadingDependencies] = useState(true);
  const [errorDependencies, setErrorDependencies] = useState(null);
  const [formError, setFormError] = useState('');

  // Usamos useCallback para memoizar la función de carga de dependencias
  const fetchDependencies = useCallback(async () => {
    setLoadingDependencies(true);
    setErrorDependencies(null);
    try {
      const [clientesRes, razasRes, especiesRes] = await Promise.all([
        axios.get(API_CLIENTES_URL),
        axios.get(API_RAZAS_URL),
        axios.get(API_ESPECIES_URL)
      ]);
      setClientes(clientesRes.data);
      setEspecies(especiesRes.data);
      setRazas(razasRes.data);

      // Si hay initialData y razas ya están cargadas, pre-seleccionar especie temporal
      if (initialData && razasRes.data.length > 0) {
        const initialRaza = initialData.RazaID ? razasRes.data.find(r => r.RazaID === initialData.RazaID) : null;
        if (initialRaza) {
          setFormData(prev => ({ ...prev, EspecieIDTemp: initialRaza.EspecieID }));
        } else {
          setFormData(prev => ({ ...prev, EspecieIDTemp: '' }));
        }
      }

    } catch (err) {
      console.error("Error al cargar dependencias para el modal de mascotas:", err);
      setErrorDependencies("No se pudieron cargar clientes, razas o especies.");
    } finally {
      setLoadingDependencies(false);
    }
  }, [initialData]); // fetchDependencies solo se recrea si initialData cambia

  // useEffect para inicializar el formulario y cargar dependencias
  useEffect(() => {
    if (isOpen) {
      setFormError(''); // Limpiar errores
      fetchDependencies(); // Llamar a la función memoizada

      if (initialData) {
        setFormData({
          Nombre: initialData.Nombre || '',
          Edad: initialData.Edad || '',
          Sexo: initialData.Sexo || '',
          ClienteID: initialData.ClienteID || '',
          RazaID: initialData.RazaID || ''
        });
        // La EspecieIDTemp se establece dentro de fetchDependencies después de cargar las razas
      } else {
        setFormData({
          Nombre: '',
          Edad: '',
          Sexo: '',
          ClienteID: '',
          RazaID: '',
          EspecieIDTemp: '' // Campo temporal para la selección de especie
        });
      }
    }
  }, [isOpen, initialData, fetchDependencies]); // Añadir fetchDependencies como dependencia


  // Manejar cambio de input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manejar cambio de especie (para filtrar razas)
  const handleEspecieChange = (e) => {
    const selectedEspecieId = e.target.value;
    setFormData(prev => ({
        ...prev,
        EspecieIDTemp: selectedEspecieId,
        RazaID: '' // Resetear RazaID cuando la especie cambia
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { Nombre, Edad, Sexo, ClienteID, RazaID } = formData;
    
    if (!Nombre.trim() || Edad === '' || !Sexo.trim() || !ClienteID || !RazaID) {
      setFormError('Por favor, completa todos los campos obligatorios marcados con (*).');
      return;
    }
    if (isNaN(Edad) || Edad < 0) {
        setFormError('La edad debe ser un número positivo.');
        return;
    }
    
    setFormError('');
    onSubmit(formData);
  };

  if (!isOpen) return null;

  // Filtrar razas basadas en la especie seleccionada
  const filteredRazas = razas.filter(raza => raza.EspecieID === parseInt(formData.EspecieIDTemp));

  return (
    // Overlay del modal
    <div 
      className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} // <-- Añade esto para probar
    >
      {/* Contenedor principal del modal */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative p-6 sm:p-8">
        
        {/* Encabezado del modal con título y botón de cerrar */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-3xl font-extrabold text-gray-800 flex-1 text-center">
            {initialData ? 'Editar Mascota' : 'Agregar Nueva Mascota'}
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
          <div className="text-center text-gray-600 py-8">Cargando datos necesarios...</div>
        ) : errorDependencies ? (
          <div className="text-center text-red-500 py-8">{errorDependencies}</div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
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
                placeholder="Nombre de la mascota"
                required
              />
            </div>
            {/* Campo Edad */}
            <div>
              <label htmlFor="Edad" className="block text-gray-700 text-sm font-semibold mb-2">Edad <span className="text-red-500">*</span></label>
              <input
                type="number"
                id="Edad"
                name="Edad"
                value={formData.Edad}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Edad en años o meses"
                min="0"
                required
              />
            </div>
            {/* Campo Sexo */}
            <div>
              <label htmlFor="Sexo" className="block text-gray-700 text-sm font-semibold mb-2">Sexo <span className="text-red-500">*</span></label>
              <div className="relative w-full border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition duration-200">
                <select
                  id="Sexo"
                  name="Sexo"
                  value={formData.Sexo}
                  onChange={handleChange}
                  className="w-full p-3 bg-white text-gray-700 rounded-md appearance-none outline-none cursor-pointer"
                  required
                >
                  <option value="">Selecciona el sexo</option>
                  <option value="M">Macho</option> {/* Cambiado de "Macho" a "M" */}
                  <option value="H">Hembra</option> {/* Cambiado de "Hembra" a "H" */}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
            {/* Campo Cliente */}
            <div>
              <label htmlFor="ClienteID" className="block text-gray-700 text-sm font-semibold mb-2">Cliente <span className="text-red-500">*</span></label>
              <div className="relative w-full border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition duration-200">
                <select
                  id="ClienteID"
                  name="ClienteID"
                  value={formData.ClienteID}
                  onChange={handleChange}
                  className="w-full p-3 bg-white text-gray-700 rounded-md appearance-none outline-none cursor-pointer"
                  required
                >
                  <option value="">Selecciona un cliente</option>
                  {clientes.map(cliente => (
                    <option key={cliente.ClienteID} value={cliente.ClienteID}>
                      {cliente.PrimerNombre} {cliente.ApellidoPaterno} {cliente.ApellidoMaterno}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
            {/* Campo Especie (temporal para filtrar razas) */}
            <div>
              <label htmlFor="EspecieIDTemp" className="block text-gray-700 text-sm font-semibold mb-2">Especie <span className="text-red-500">*</span></label>
              <div className="relative w-full border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition duration-200">
                <select
                  id="EspecieIDTemp"
                  name="EspecieIDTemp"
                  value={formData.EspecieIDTemp}
                  onChange={handleEspecieChange}
                  className="w-full p-3 bg-white text-gray-700 rounded-md appearance-none outline-none cursor-pointer"
                  required
                >
                  <option value="">Selecciona una especie</option>
                  {especies.map(especie => (
                    <option key={especie.EspecieID} value={especie.EspecieID}>
                      {especie.NombreEspecie}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
            {/* Campo Raza (depende de la especie seleccionada) */}
            <div>
              <label htmlFor="RazaID" className="block text-gray-700 text-sm font-semibold mb-2">Raza <span className="text-red-500">*</span></label>
              <div className="relative w-full border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition duration-200">
                <select
                  id="RazaID"
                  name="RazaID"
                  value={formData.RazaID}
                  onChange={handleChange}
                  className="w-full p-3 bg-white text-gray-700 rounded-md appearance-none outline-none cursor-pointer"
                  required
                  disabled={!formData.EspecieIDTemp || filteredRazas.length === 0} // Deshabilitar si no hay especie seleccionada o razas
                >
                  <option value="">Selecciona una raza</option>
                  {filteredRazas.map(raza => (
                    <option key={raza.RazaID} value={raza.RazaID}>
                      {raza.NombreRaza}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
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
        )}
      </div>
    </div>
  );
};

export default MascotaFormModal;