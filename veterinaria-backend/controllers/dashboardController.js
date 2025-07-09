// backend/src/controllers/dashboardController.js

const pool = require('../db');

// Helper functions for date ranges
const getTodayDateRange = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0); // Start of the day
    const end = new Date();
    end.setHours(23, 59, 59, 999); // End of the day
    return { start, end };
};

const getWeekDateRange = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // Adjust to ensure Monday is the start of the week. In Peru, Monday is typically the first day of the week.
    const diffToMonday = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(now.setDate(diffToMonday));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // 6 days after Monday
    endOfWeek.setHours(23, 59, 59, 999);

    return { start: startOfWeek, end: endOfWeek };
};

// --- Controller Functions ---

// Get Dashboard Summary (Citas Hoy, Pendientes, Completadas, Canceladas)
exports.getDashboardSummary = async (req, res) => {
    try {
        const { start: todayStart, end: todayEnd } = getTodayDateRange();
        const { start: weekStart, end: weekEnd } = getWeekDateRange();

        // Citas Hoy
        const [citasHoy] = await pool.query(
            `SELECT COUNT(*) AS count FROM Citas WHERE Fecha BETWEEN ? AND ?`,
            [todayStart, todayEnd]
        );

        // Citas Pendientes (Estado 'Programada' o 'Pendiente')
        const [citasPendientes] = await pool.query(
            `SELECT COUNT(*) AS count FROM Citas WHERE Estado IN ('Programada', 'Pendiente')`
        );

        // Citas Completadas Hoy
        const [citasCompletadasHoy] = await pool.query(
            `SELECT COUNT(*) AS count FROM Citas WHERE Estado = 'Completada' AND Fecha BETWEEN ? AND ?`,
            [todayStart, todayEnd]
        );

        // Citas Completadas Semana
        const [citasCompletadasSemana] = await pool.query(
            `SELECT COUNT(*) AS count FROM Citas WHERE Estado = 'Completada' AND Fecha BETWEEN ? AND ?`,
            [weekStart, weekEnd]
        );

        // Citas Canceladas Hoy
        const [citasCanceladasHoy] = await pool.query(
            `SELECT COUNT(*) AS count FROM Citas WHERE Estado = 'Cancelada' AND Fecha BETWEEN ? AND ?`,
            [todayStart, todayEnd]
        );

        // Citas Canceladas Semana
        const [citasCanceladasSemana] = await pool.query(
            `SELECT COUNT(*) AS count FROM Citas WHERE Estado = 'Cancelada' AND Fecha BETWEEN ? AND ?`,
            [weekStart, weekEnd]
        );

        res.json({
            today: citasHoy[0].count,
            pending: citasPendientes[0].count,
            completedToday: citasCompletadasHoy[0].count,
            completedWeek: citasCompletadasSemana[0].count,
            cancelledToday: citasCanceladasHoy[0].count,
            cancelledWeek: citasCanceladasSemana[0].count
        });

    } catch (error) {
        console.error('Error in getDashboardSummary:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener el resumen del dashboard.' });
    }
};

// Get Total Clients and Total Pets
exports.getCounts = async (req, res) => {
    try {
        const [clientesCount] = await pool.query(`SELECT COUNT(*) AS count FROM Clientes`);
        const [mascotasCount] = await pool.query(`SELECT COUNT(*) AS count FROM Mascotas`);

        res.json({
            totalClients: clientesCount[0].count,
            totalMascotas: mascotasCount[0].count
        });

    } catch (error) {
        console.error('Error in getCounts:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener los conteos.' });
    }
};

// Get Upcoming Citas
exports.getUpcomingCitas = async (req, res) => {
    const limit = parseInt(req.query.limit) || 5; // Default limit of 5 citas
    try {
        const [upcomingCitas] = await pool.query(
            `SELECT
                c.CitaID,
                c.Fecha,
                m.Nombre AS MascotaNombre,
                cl.PrimerNombre AS ClientePrimerNombre,
                cl.ApellidoPaterno AS ClienteApellidoPaterno,
                -- Use GROUP_CONCAT to list all services for a cita, separated by a comma and space
                -- This handles cases where a single cita might have multiple associated services
                GROUP_CONCAT(DISTINCT s.NombreServicio ORDER BY s.NombreServicio SEPARATOR ', ') AS ServicioPrincipal
            FROM
                Citas c
            JOIN
                Mascotas m ON c.MascotaID = m.MascotaID
            JOIN
                Clientes cl ON m.ClienteID = cl.ClienteID
            LEFT JOIN
                CitaServicios cs ON c.CitaID = cs.CitaID -- Correct join key for CitaServicios table
            LEFT JOIN
                Servicios s ON cs.ServicioID = s.ServicioID
            WHERE
                c.Fecha >= CURDATE() AND c.Estado IN ('Programada', 'Pendiente')
            -- IMPORTANT: All non-aggregated columns in SELECT must be in GROUP BY when ONLY_FULL_GROUP_BY is enabled
            GROUP BY c.CitaID, c.Fecha, m.Nombre, cl.PrimerNombre, cl.ApellidoPaterno
            ORDER BY
                c.Fecha ASC
            LIMIT ?`,
            [limit]
        );

        // Format the response for the frontend
        const formattedCitas = upcomingCitas.map(cita => ({
            CitaID: cita.CitaID,
            Fecha: cita.Fecha, // Date object, will be stringified to ISO when sent
            MascotaNombre: cita.MascotaNombre,
            ClienteNombre: `${cita.ClientePrimerNombre} ${cita.ClienteApellidoPaterno}`,
            ServicioPrincipal: cita.ServicioPrincipal || 'No especificado'
        }));

        res.json(formattedCitas);

    } catch (error) {
        console.error('Error in getUpcomingCitas:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener las próximas citas.' });
    }
};

// Get Recent Activity
exports.getRecentActivity = async (req, res) => {
    try {
        const activities = [];

        // Fetch last 2 created/updated appointments
        // NOTE: Your 'Citas' table schema does not include 'FechaCreacion' or 'FechaActualizacion'.
        // We'll use 'CitaID' for ordering as a proxy for recency, assuming it's AUTO_INCREMENT.
        // For more accurate "creation" or "update" times, consider adding TIMESTAMP columns to your tables.
        const [lastCitas] = await pool.query(
            `SELECT c.CitaID, c.Fecha, m.Nombre AS MascotaNombre, cl.PrimerNombre AS ClientePrimerNombre, cl.ApellidoPaterno AS ClienteApellidoPaterno, c.Estado
             FROM Citas c
             JOIN Mascotas m ON c.MascotaID = m.MascotaID
             JOIN Clientes cl ON m.ClienteID = cl.ClienteID
             ORDER BY c.CitaID DESC LIMIT 2` // Using CitaID to order by "creation"
        );
        lastCitas.forEach(cita => {
            activities.push({
                id: `cita_${cita.CitaID}_created`,
                type: 'cita_agendada',
                description: `Cita agendada para ${cita.MascotaNombre} (${cita.ClientePrimerNombre} ${cita.ClienteApellidoPaterno}) el ${new Date(cita.Fecha).toLocaleDateString('es-ES')} a las ${new Date(cita.Fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}.`,
                timestamp: new Date(cita.Fecha) // Using Cita's Fecha as timestamp
            });
        });

        // Fetch last created client
        // NOTE: Your 'Clientes' table schema does not include 'FechaRegistro'.
        // We'll use 'ClienteID' for ordering as a proxy for recency.
        const [lastClients] = await pool.query(
            `SELECT ClienteID, PrimerNombre, ApellidoPaterno FROM Clientes ORDER BY ClienteID DESC LIMIT 1` // Using ClienteID to order by "registration"
        );
        if (lastClients.length > 0) {
            activities.push({
                id: `cliente_${lastClients[0].ClienteID}_new`,
                type: 'cliente_nuevo',
                description: `Nuevo cliente registrado: ${lastClients[0].PrimerNombre} ${lastClients[0].ApellidoPaterno}.`,
                timestamp: new Date() // Using current date as a fallback timestamp
            });
        }

        // Fetch last completed appointment
        // NOTE: Your 'Citas' table schema does not include 'FechaActualizacion'.
        const [lastCompletedCita] = await pool.query(
            `SELECT CitaID, Fecha FROM Citas WHERE Estado = 'Completada' ORDER BY CitaID DESC LIMIT 1` // Using CitaID for ordering
        );
        if (lastCompletedCita.length > 0) {
            activities.push({
                id: `cita_${lastCompletedCita[0].CitaID}_completed`,
                type: 'cita_completada',
                description: `Cita ID ${lastCompletedCita[0].CitaID} marcada como completada.`,
                timestamp: new Date(lastCompletedCita[0].Fecha) // Using Cita's Fecha as timestamp
            });
        }

        // Sort activities by timestamp in descending order
        activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        // Limit the number of activities returned
        res.json(activities.slice(0, 5)); // Return top 5 recent activities

    } catch (error) {
        console.error('Error in getRecentActivity:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener la actividad reciente.' });
    }
};