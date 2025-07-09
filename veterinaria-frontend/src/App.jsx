import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';

// Import your page components
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Mascotas from './pages/Mascotas';
import Especies from './pages/Especies';
import Razas from './pages/Razas';
import Categorias from './pages/Categorias';
import Subcategorias from './pages/Subcategorias';
import Servicios from './pages/Servicios';
import Roles from './pages/Roles';
import Empleados from './pages/Empleados';
import Citas from './pages/Citas';
import CitaServicios from './pages/CitaServicios';


const CitaDetallesPlaceholder = () => <div className="p-6"><h1>Detalles de la Cita (Componente Pendiente)</h1><p>Este componente aún no ha sido creado. Aquí se mostrarán los detalles de una cita específica.</p></div>;


function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-100 font-sans">
        <Sidebar />
        <div className="flex-1 p-6 overflow-auto">
          <Routes>
            {/* Ruta por defecto: Redirige de "/" a "/dashboard" */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/mascotas" element={<Mascotas />} />
            <Route path="/mascotas/especies" element={<Especies />} />
            <Route path="/mascotas/razas" element={<Razas />} />
            <Route path="/servicios" element={<Servicios />} />
            <Route path="/servicios/categorias" element={<Categorias />} />
            <Route path="/servicios/subcategorias" element={<Subcategorias />} />
            <Route path="/empleados" element={<Empleados />} />
            <Route path="/empleados/roles" element={<Roles />} />
            <Route path="/citas" element={<Citas />} />
            <Route path="/citaservicios" element={<CitaServicios />} />
            <Route path="/citas/:id" element={<CitaDetallesPlaceholder />} />

          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
