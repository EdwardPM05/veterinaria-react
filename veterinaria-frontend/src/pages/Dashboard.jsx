// frontend/src/pages/Dashboard.jsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Estilos por defecto del calendario
import {
    FaCalendarAlt, FaUsers, FaPaw, FaCheckCircle, FaTimesCircle,
    FaHourglassHalf, FaClipboardList, FaPlusCircle, FaUserPlus,
    FaHistory, FaExclamationTriangle, FaSyncAlt, FaFilePdf
} from 'react-icons/fa'; // Asegúrate de tener react-icons instalado
import { useNavigate } from 'react-router-dom'; // Importa useNavigate para las redirecciones

// Importar el componente modal de reportes
import ReporteCitaModal from '../components/ReporteCitaModal'; // Asegúrate de la ruta correcta

// URL base de tu API (Asegúrate de que coincida con la de tu backend)
const API_BASE_URL = 'http://localhost:3001/api/dashboard';

const Dashboard = () => {
    const navigate = useNavigate(); // Inicializa useNavigate para poder redirigir

    const [currentDate, setCurrentDate] = useState(new Date());
    const [citaSummary, setCitaSummary] = useState({
        today: 0,
        pending: 0,
        completedToday: 0,
        completedWeek: 0,
        cancelledToday: 0,
        cancelledWeek: 0
    });
    const [totalClients, setTotalClients] = useState(0);
    const [totalMascotas, setTotalMascotas] = useState(0);
    const [upcomingCitas, setUpcomingCitas] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [citasInCalendar, setCitasInCalendar] = useState([]);
    const [showReportModal, setShowReportModal] = useState(false); // Estado para controlar la visibilidad del modal de reporte

    const [loadingSummary, setLoadingSummary] = useState(true);
    const [loadingCounts, setLoadingCounts] = useState(true);
    const [loadingUpcoming, setLoadingUpcoming] = useState(true);
    const [loadingActivity, setLoadingActivity] = useState(true);
    const [error, setError] = useState(null);

    // --- Funciones de Fetch de Datos del Backend ---

    const fetchCitaSummary = useCallback(async () => {
        setLoadingSummary(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/summary`);
            setCitaSummary(response.data);
            setError(null); // Limpiar error si la carga es exitosa
        } catch (err) {
            console.error("Error fetching cita summary:", err);
            setError("Error al cargar el resumen de citas.");
        } finally {
            setLoadingSummary(false);
        }
    }, []);

    const fetchCounts = useCallback(async () => {
        setLoadingCounts(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/counts`);
            setTotalClients(response.data.totalClients);
            setTotalMascotas(response.data.totalMascotas);
            setError(null);
        } catch (err) {
            console.error("Error fetching counts:", err);
            setError("Error al cargar el conteo de clientes/mascotas.");
        } finally {
            setLoadingCounts(false);
        }
    }, []);

    const fetchUpcomingCitas = useCallback(async () => {
        setLoadingUpcoming(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/upcoming-citas`, { params: { limit: 5 } });
            setUpcomingCitas(response.data);
            // Asegúrate de que las fechas sean objetos Date para el calendario
            setCitasInCalendar(response.data.map(cita => new Date(cita.Fecha)));
            setError(null);
        } catch (err) {
            console.error("Error fetching upcoming citas:", err);
            setError("Error al cargar las próximas citas.");
        } finally {
            setLoadingUpcoming(false);
        }
    }, []);

    const fetchRecentActivity = useCallback(async () => {
        setLoadingActivity(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/recent-activity`);
            setRecentActivity(response.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching recent activity:", err);
            setError("Error al cargar la actividad reciente.");
        } finally {
            setLoadingActivity(false);
        }
    }, []);

    // Función para verificar y establecer alertas (basada en el estado actual del dashboard)
    const checkAlerts = useCallback(() => {
        const currentAlerts = [];
        // Ejemplo de alerta: Pocas citas para hoy
        if (citaSummary.today < 3 && !loadingSummary) {
            currentAlerts.push({
                id: 'low_citas_today',
                message: `¡Alerta! Solo tienes ${citaSummary.today} citas programadas para hoy.`,
                type: 'warning'
            });
        }
        // Ejemplo de alerta: Citas a punto de empezar (en los próximos 30 minutos)
        const now = new Date();
        upcomingCitas.forEach(cita => {
            const citaTime = new Date(cita.Fecha);
            const diffMinutes = Math.round((citaTime.getTime() - now.getTime()) / (1000 * 60));
            if (diffMinutes > 0 && diffMinutes <= 30) {
                currentAlerts.push({
                    id: `cita_near_${cita.CitaID}`,
                    message: `La cita de ${cita.MascotaNombre} (Cliente: ${cita.ClienteNombre}) inicia en ${diffMinutes} minutos.`,
                    type: 'info'
                });
            }
        });

        setAlerts(currentAlerts);
    }, [citaSummary.today, loadingSummary, upcomingCitas]);

    // --- Efecto para cargar datos al montar el componente ---
    useEffect(() => {
        fetchCitaSummary();
        fetchCounts();
        fetchUpcomingCitas();
        fetchRecentActivity();
    }, [fetchCitaSummary, fetchCounts, fetchUpcomingCitas, fetchRecentActivity]);

    // --- Efecto para verificar alertas cuando los datos cambian ---
    useEffect(() => {
        if (!loadingSummary && !loadingUpcoming) { // Solo si los datos clave ya cargaron
            checkAlerts();
        }
    }, [loadingSummary, loadingUpcoming, checkAlerts]);


    // --- Funciones de Formateo ---
    const formatDateForDisplay = (date) => {
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false // Formato 24 horas
        });
    };

    // Función para marcar días con citas en el calendario (puntos azules)
    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            if (citasInCalendar.some(citaDate =>
                citaDate.getDate() === date.getDate() &&
                citaDate.getMonth() === date.getMonth() &&
                citaDate.getFullYear() === date.getFullYear()
            )) {
                return <div className="dot" style={{
                    height: '6px',
                    width: '6px',
                    backgroundColor: '#2E74B5', // Color azul para el punto
                    borderRadius: '50%',
                    margin: '0 auto',
                    marginTop: '2px'
                }}></div>;
            }
        }
        return null;
    };

    // --- Componentes Reutilizables (internos de la página Dashboard) ---
    const SummaryCard = ({ title, value, icon: Icon, onClick = () => { }, color = 'text-blue-600', bgColor = 'bg-blue-100', hoverBg = 'hover:bg-blue-200' }) => (
        <div
            onClick={onClick}
            className={`flex flex-col items-center justify-center p-6 rounded-lg shadow-md ${bgColor} ${hoverBg} transition-all duration-300 cursor-pointer text-center min-w-[180px]`}
        >
            <Icon className={`text-4xl mb-3 ${color}`} />
            <h3 className="text-lg font-semibold text-gray-700 mb-1">{title}</h3>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
    );

    const InfoCard = ({ title, value, icon: Icon, color = 'text-gray-600' }) => (
        <div className="flex flex-col items-center justify-center p-6 rounded-lg shadow-md bg-white border border-gray-200 text-center min-w-[180px]">
            <Icon className={`text-4xl mb-3 ${color}`} />
            <h3 className="text-lg font-semibold text-gray-700 mb-1">{title}</h3>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
    );

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Cabecera del Dashboard */}
            <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-md">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900">Dashboard General</h1>
                </div>
                <div className="text-right">
                    <p className="text-lg font-semibold text-gray-700">{formatDateForDisplay(currentDate)}</p>
                    <p className="text-md text-gray-500">{currentDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
            </div>

            {/* Resumen de Citas y Métricas Clave */}
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Resumen del Día</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
                {(loadingSummary || loadingCounts) ? (
                    <div className="col-span-full text-center py-10">
                        <FaSyncAlt className="animate-spin text-4xl text-blue-500 mx-auto" />
                        <p className="mt-3 text-gray-600 text-lg">Cargando datos del dashboard...</p>
                    </div>
                ) : error ? (
                    <div className="col-span-full text-center py-10 text-red-500 text-lg">{error}</div>
                ) : (
                    <>
                        <SummaryCard
                            title="Citas Hoy"
                            value={citaSummary.today}
                            icon={FaCalendarAlt}
                            color="text-indigo-600"
                            bgColor="bg-indigo-100"
                            hoverBg="hover:bg-indigo-200"
                            onClick={() => navigate('/citas?filtro=hoy')} // Ejemplo de redirección
                        />
                        <SummaryCard
                            title="Citas Pendientes"
                            value={citaSummary.pending}
                            icon={FaHourglassHalf}
                            color="text-yellow-600"
                            bgColor="bg-yellow-100"
                            hoverBg="hover:bg-yellow-200"
                            onClick={() => navigate('/citas?filtro=pendientes')} // Ejemplo de redirección
                        />
                        <SummaryCard
                            title="Completadas (Hoy)"
                            value={citaSummary.completedToday}
                            icon={FaCheckCircle}
                            color="text-green-600"
                            bgColor="bg-green-100"
                            hoverBg="hover:bg-green-200"
                            onClick={() => navigate('/citas?filtro=completadasHoy')} // Ejemplo de redirección
                        />
                        <SummaryCard
                            title="Canceladas (Hoy)"
                            value={citaSummary.cancelledToday}
                            icon={FaTimesCircle}
                            color="text-red-600"
                            bgColor="bg-red-100"
                            hoverBg="hover:bg-red-200"
                            onClick={() => navigate('/citas?filtro=canceladasHoy')} // Ejemplo de redirección
                        />
                           <InfoCard
                                title="Clientes Registrados"
                                value={totalClients}
                                icon={FaUsers}
                                color="text-purple-600"
                            />
                            <InfoCard
                                title="Mascotas Registradas"
                                value={totalMascotas}
                                icon={FaPaw}
                                color="text-teal-600"
                            />
                    </>
                )}
            </div>

            {/* Sección de Próximas Citas y Calendario */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                {/* Próximas Citas */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-800 mb-5 flex items-center">
                        <FaCalendarAlt className="mr-3 text-blue-600" /> Próximas Citas
                    </h3>
                    {loadingUpcoming ? (
                        <div className="text-center py-8">
                            <FaSyncAlt className="animate-spin text-3xl text-blue-500 mx-auto" />
                            <p className="mt-2 text-gray-600">Cargando próximas citas...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-500">{error}</div>
                    ) : upcomingCitas.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {upcomingCitas.map(cita => (
                                <li key={cita.CitaID} className="py-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {formatDateForDisplay(cita.Fecha)} - {formatTime(cita.Fecha)}
                                            </p>
                                            <p className="text-gray-700">
                                                <span className="font-medium">{cita.MascotaNombre}</span> (Cliente: {cita.ClienteNombre})
                                            </p>
                                            <p className="text-sm text-gray-500">Servicio: {cita.ServicioPrincipal}</p>
                                        </div>
                                        {/* ELIMINADO: Botón "Ver Detalles" */}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-500 py-8">No hay próximas citas programadas.</p>
                    )}
                </div>

                {/* Mini-Calendario */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col items-center">
                    <h3 className="text-2xl font-bold text-gray-800 mb-5 flex items-center">
                        <FaCalendarAlt className="mr-3 text-blue-600" /> Calendario de Citas
                    </h3>
                    <div className="w-full max-w-sm mx-auto"> {/* 'mx-auto' para centrar horizontalmente */}
                        <Calendar
                            onChange={setCurrentDate}
                            value={currentDate}
                            tileContent={tileContent} // Para marcar días con citas
                            locale="es-ES"
                            className="p-2 border rounded-lg shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Sección de Actividad Reciente */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-10">
                <h3 className="text-2xl font-bold text-gray-800 mb-5 flex items-center">
                    <FaHistory className="mr-3 text-green-600" /> Actividad Reciente
                </h3>
                {loadingActivity ? (
                    <div className="text-center py-8">
                        <FaSyncAlt className="animate-spin text-3xl text-green-500 mx-auto" />
                        <p className="mt-2 text-gray-600">Cargando actividad reciente...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-8 text-red-500">{error}</div>
                ) : recentActivity.length > 0 ? (
                    <ul className="divide-y divide-gray-100">
                        {recentActivity.map(activity => (
                            <li key={activity.id} className="py-3 text-gray-700 text-lg">
                                <span className="font-medium text-blue-700">
                                    [{new Date(activity.timestamp).toLocaleDateString('es-ES')} {new Date(activity.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}]
                                </span> {activity.description}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-gray-500 py-8">No hay actividad reciente para mostrar.</p>
                )}
            </div>

            {/* Sección de Acciones Rápidas */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-5 flex items-center">
                    <FaClipboardList className="mr-3 text-purple-600" /> Acciones Rápidas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <button
                        onClick={() => navigate('/citas')} // Redirigir a la página de Citas
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center text-lg shadow-md transition-all duration-200"
                    >
                        <FaPlusCircle className="mr-2" /> Agendar Cita
                    </button>
                    <button
                        onClick={() => navigate('/clientes')} // Redirigir a la página de Clientes
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center text-lg shadow-md transition-all duration-200"
                    >
                        <FaUserPlus className="mr-2" /> Nuevo Cliente
                    </button>
                    <button
                        onClick={() => navigate('/citas')} // Redirigir a la página de todas las citas
                        className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center text-lg shadow-md transition-all duration-200"
                    >
                        <FaCalendarAlt className="mr-2" /> Ver Citas
                    </button>
                    <button
                        onClick={() => setShowReportModal(true)} // Abrir el modal de reportes
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center text-lg shadow-md transition-all duration-200"
                    >
                        <FaFilePdf className="mr-2" /> Generar Reporte
                    </button>
                </div>
            </div>

            {/* Renderizado condicional del ReporteCitaModal */}
            {showReportModal && (
                <ReporteCitaModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} />
            )}
        </div>
    );
};

export default Dashboard;
