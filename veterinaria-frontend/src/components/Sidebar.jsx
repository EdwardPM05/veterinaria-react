import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, FaUsers, FaPaw, FaChevronDown, FaChevronUp, FaBone, FaDog, 
  FaBriefcaseMedical, FaTags, FaClipboardList, 
  FaUserTie, FaUserTag,
  FaCalendarAlt, // Icon for Citas
  FaClipboardCheck // <-- NEW! Icon for CitaServicios
} from 'react-icons/fa'; 

const Sidebar = () => {
  const location = useLocation();
  const [isMascotasDropdownOpen, setIsMascotasDropdownOpen] = useState(false);
  const [isServiciosDropdownOpen, setIsServiciosDropdownOpen] = useState(false);
  const [isEmpleadosDropdownOpen, setIsEmpleadosDropdownOpen] = useState(false);

  const isActive = (path) => {
    // Checks if the current path starts with the given path for active styling
    return location.pathname.startsWith(path) ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700';
  };

  const isSubmenuActive = (path) => {
    // Checks for exact path match for submenu active styling
    return location.pathname === path ? 'bg-gray-600 text-white' : 'text-gray-300 hover:bg-gray-600';
  };

  const toggleMascotasDropdown = () => {
    setIsMascotasDropdownOpen(!isMascotasDropdownOpen);
  };

  const toggleServiciosDropdown = () => {
    setIsServiciosDropdownOpen(!isServiciosDropdownOpen);
  };

  const toggleEmpleadosDropdown = () => {
    setIsEmpleadosDropdownOpen(!isEmpleadosDropdownOpen);
  };

  // Effect to open dropdown if one of its sub-routes is active on page load
  useEffect(() => {
    if (location.pathname.startsWith('/mascotas') && !isMascotasDropdownOpen) {
      setIsMascotasDropdownOpen(true);
    }
    if (location.pathname.startsWith('/servicios') && !isServiciosDropdownOpen) {
      setIsServiciosDropdownOpen(true);
    }
    if (location.pathname.startsWith('/empleados') && !isEmpleadosDropdownOpen) {
      setIsEmpleadosDropdownOpen(true);
    }
  }, [location.pathname, isMascotasDropdownOpen, isServiciosDropdownOpen, isEmpleadosDropdownOpen]);

  return (
    <div className="w-64 bg-gray-800 text-white p-4 flex flex-col min-h-screen shadow-lg">
      <div className="text-4xl font-extrabold mb-8 text-center pt-4">
        VetWeb
      </div>
      <nav className="flex-1">
        <ul>
          <li className="mb-2">
            <Link to="/" className={`flex items-center p-3 rounded-lg transition duration-200 ${isActive('/')}`}>
              <FaHome className="mr-3" /> Dashboard
            </Link>
          </li>
          <li className="mb-2">
            <Link to="/clientes" className={`flex items-center p-3 rounded-lg transition duration-200 ${isActive('/clientes')}`}>
              <FaUsers className="mr-3" /> Clientes
            </Link>
          </li>
          
          {/* Dropdown menu for Mascotas */}
          <li className="mb-2">
            <div 
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition duration-200 ${isActive('/mascotas')}`}
              onClick={toggleMascotasDropdown}
            >
              <div className="flex items-center">
                <FaPaw className="mr-3" /> Mascotas
              </div>
              {isMascotasDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {isMascotasDropdownOpen && (
              <ul className="ml-6 mt-1"> 
                <li className="mb-1">
                  <Link 
                    to="/mascotas"
                    className={`flex items-center p-2 rounded-lg transition duration-200 ${isSubmenuActive('/mascotas')}`}
                  >
                    <FaPaw className="mr-3 text-sm" /> Todas las Mascotas
                  </Link>
                </li>
                <li className="mb-1">
                  <Link 
                    to="/mascotas/especies"
                    className={`flex items-center p-2 rounded-lg transition duration-200 ${isSubmenuActive('/mascotas/especies')}`}
                  >
                    <FaBone className="mr-3 text-sm" /> Especies
                  </Link>
                </li>
                <li className="mb-1">
                  <Link 
                    to="/mascotas/razas"
                    className={`flex items-center p-2 rounded-lg transition duration-200 ${isSubmenuActive('/mascotas/razas')}`}
                  >
                    <FaDog className="mr-3 text-sm" /> Razas
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Dropdown menu for Servicios */}
          <li className="mb-2">
            <div 
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition duration-200 ${isActive('/servicios')}`}
              onClick={toggleServiciosDropdown}
            >
              <div className="flex items-center">
                <FaBriefcaseMedical className="mr-3" /> Servicios
              </div>
              {isServiciosDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {isServiciosDropdownOpen && (
              <ul className="ml-6 mt-1"> 
                <li className="mb-1">
                  <Link 
                    to="/servicios" 
                    className={`flex items-center p-2 rounded-lg transition duration-200 ${isSubmenuActive('/servicios')}`}
                  >
                    <FaBriefcaseMedical className="mr-3 text-sm" /> Todos los Servicios
                  </Link>
                </li>
                <li className="mb-1">
                  <Link 
                    to="/servicios/categorias" 
                    className={`flex items-center p-2 rounded-lg transition duration-200 ${isSubmenuActive('/servicios/categorias')}`}
                  >
                    <FaTags className="mr-3 text-sm" /> Categorías
                  </Link>
                </li>
                <li className="mb-1">
                  <Link 
                    to="/servicios/subcategorias"
                    className={`flex items-center p-2 rounded-lg transition duration-200 ${isSubmenuActive('/servicios/subcategorias')}`}
                  >
                    <FaClipboardList className="mr-3 text-sm" /> Subcategorías
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Dropdown menu for Empleados */}
          <li className="mb-2">
            <div 
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition duration-200 ${isActive('/empleados')}`}
              onClick={toggleEmpleadosDropdown}
            >
              <div className="flex items-center">
                <FaUserTie className="mr-3" /> Empleados
              </div>
              {isEmpleadosDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {isEmpleadosDropdownOpen && (
              <ul className="ml-6 mt-1"> 
                <li className="mb-1">
                  <Link 
                    to="/empleados" 
                    className={`flex items-center p-2 rounded-lg transition duration-200 ${isSubmenuActive('/empleados')}`}
                  >
                    <FaUserTie className="mr-3 text-sm" /> Todos los Empleados
                  </Link>
                </li>
                <li className="mb-1">
                  <Link 
                    to="/empleados/roles" 
                    className={`flex items-center p-2 rounded-lg transition duration-200 ${isSubmenuActive('/empleados/roles')}`}
                  >
                    <FaUserTag className="mr-3 text-sm" /> Roles
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Direct link for Citas */}
          <li className="mb-2">
            <Link to="/citas" className={`flex items-center p-3 rounded-lg transition duration-200 ${isActive('/citas')}`}>
              <FaCalendarAlt className="mr-3" /> Citas
            </Link>
          </li>

          {/* NEW: Direct link for CitaServicios */}
          <li className="mb-2">
            <Link to="/citaservicios" className={`flex items-center p-3 rounded-lg transition duration-200 ${isActive('/citaservicios')}`}>
              <FaClipboardCheck className="mr-3" /> Servicios de Cita
            </Link>
          </li>

          {/* Other menu options if you have them */}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;