// backend/src/controllers/citasController.js

// Cambia 'db' por 'pool' para usar el pool de conexiones con promesas
const pool = require('../db');

// Helper function to validate if a date is in the past
const isDateInPast = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    // Compare dates without considering milliseconds for robustness
    return date.setHours(0, 0, 0, 0) < now.setHours(0, 0, 0, 0);
};

// Get all appointments with search capabilities and joins
exports.getAll = async (req, res) => {
    const searchTerm = req.query.search;
    let sql = `
        SELECT
            c.CitaID,
            c.Fecha,
            c.Estado,
            c.MascotaID,
            m.Nombre AS MascotaNombre,
            cl.PrimerNombre AS ClientePrimerNombre,
            cl.ApellidoPaterno AS ClienteApellidoPaterno,
            cl.ApellidoMaterno AS ClienteApellidoMaterno,
            c.EmpleadoID,
            e.PrimerNombre AS EmpleadoPrimerNombre,
            e.ApellidoPaterno AS EmpleadoApellidoPaterno,
            r.NombreRol AS EmpleadoRol
        FROM
            Citas c
        JOIN
            Mascotas m ON c.MascotaID = m.MascotaID
        JOIN
            Clientes cl ON m.ClienteID = cl.ClienteID
        JOIN
            Empleados e ON c.EmpleadoID = e.EmpleadoID
        JOIN
            Roles r ON e.RolID = r.RolID
    `;
    let params = [];

    if (searchTerm) {
        // Search by pet name, client name, employee name, role, or status
        sql += `
            WHERE
                m.Nombre LIKE ? OR
                cl.PrimerNombre LIKE ? OR
                cl.ApellidoPaterno LIKE ? OR
                cl.ApellidoMaterno LIKE ? OR
                e.PrimerNombre LIKE ? OR
                e.ApellidoPaterno LIKE ? OR
                r.NombreRol LIKE ? OR
                c.Estado LIKE ?
        `;
        const likeTerm = `%${searchTerm}%`;
        params = [likeTerm, likeTerm, likeTerm, likeTerm, likeTerm, likeTerm, likeTerm, likeTerm];
    }

    sql += ` ORDER BY c.Fecha DESC`; // Order by date, most recent first

    try {
        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error("Error al obtener citas:", err.message);
        return res.status(500).json({ error: 'Error interno del servidor al obtener citas.' });
    }
};

// Get appointment by ID
exports.getById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT
                c.CitaID,
                c.Fecha,
                c.Estado,
                c.MascotaID,
                m.Nombre AS MascotaNombre,
                cl.PrimerNombre AS ClientePrimerNombre,
                cl.ApellidoPaterno AS ClienteApellidoPaterno,
                cl.ApellidoMaterno AS ClienteApellidoMaterno,
                c.EmpleadoID,
                e.PrimerNombre AS EmpleadoPrimerNombre,
                e.ApellidoPaterno AS EmpleadoApellidoPaterno,
                r.NombreRol AS EmpleadoRol
            FROM
                Citas c
            JOIN
                Mascotas m ON c.MascotaID = m.MascotaID
            JOIN
                Clientes cl ON m.ClienteID = cl.ClienteID
            JOIN
                Empleados e ON c.EmpleadoID = e.EmpleadoID
            JOIN
                Roles r ON e.RolID = r.RolID
            WHERE c.CitaID = ?`,
            [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Cita no encontrada.' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error("Error al obtener cita por ID:", err.message);
        return res.status(500).json({ error: 'Error interno del servidor al obtener la cita.' });
    }
};

// Create new appointment
exports.create = async (req, res) => {
    const { Fecha, Estado = 'Pendiente', MascotaID, EmpleadoID } = req.body;

    if (!MascotaID || !EmpleadoID) {
        return res.status(400).json({ error: 'Mascota y Empleado son obligatorios.' });
    }

    const fechaFinal = Fecha ? new Date(Fecha) : new Date();
    if (isNaN(fechaFinal.getTime())) {
        return res.status(400).json({ error: 'Formato de fecha inválido.' });
    }

    // --- DATE VALIDATION IN THE BACKEND (for CREATE) ---
    if (isDateInPast(fechaFinal)) {
        return res.status(400).json({ error: 'No se puede agendar una cita en el pasado.' });
    }
    // ----------------------------------------------------

    try {
        const [result] = await pool.query(
            'INSERT INTO Citas (Fecha, Estado, MascotaID, EmpleadoID) VALUES (?, ?, ?, ?)',
            [fechaFinal, Estado, MascotaID, EmpleadoID]
        );
        res.status(201).json({ id: result.insertId, message: 'Cita creada correctamente.' });
    } catch (err) {
        console.error("Error al crear cita:", err.message);
        return res.status(500).json({ error: 'Error interno del servidor al crear cita.' });
    }
};

// Update an appointment
exports.update = async (req, res) => {
    const { Fecha, Estado, MascotaID, EmpleadoID } = req.body;
    const { id } = req.params;

    if (!Fecha || !Estado || !MascotaID || !EmpleadoID) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios para actualizar la cita.' });
    }

    const fechaFinal = new Date(Fecha);
    if (isNaN(fechaFinal.getTime())) {
        return res.status(400).json({ error: 'Formato de fecha inválido.' });
    }

    try {
        // --- DATE VALIDATION IN THE BACKEND (for UPDATE) ---
        // Only allow updating to a past date if it's the same original date
        // This is so you can change the status of a past appointment, without changing the date
        const [rows] = await pool.query('SELECT Fecha FROM Citas WHERE CitaID = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Cita no encontrada para actualizar.' });
        }
        const originalFecha = new Date(rows[0].Fecha);

        // If the new date is in the past AND it's different from the original date
        if (isDateInPast(fechaFinal) && fechaFinal.getTime() !== originalFecha.getTime()) {
            return res.status(400).json({ error: 'No se puede cambiar una cita a una fecha pasada.' });
        }
        // ----------------------------------------------------

        const [result] = await pool.query(
            'UPDATE Citas SET Fecha = ?, Estado = ?, MascotaID = ?, EmpleadoID = ? WHERE CitaID = ?',
            [fechaFinal, Estado, MascotaID, EmpleadoID, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cita no encontrada para actualizar.' });
        }
        res.json({ message: 'Cita actualizada correctamente.' });
    } catch (err) {
        console.error("Error al actualizar cita:", err.message);
        return res.status(500).json({ error: 'Error interno del servidor al actualizar cita.' });
    }
};

// Delete an appointment
exports.remove = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM Citas WHERE CitaID = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cita no encontrada para eliminar.' });
        }
        res.json({ message: 'Cita eliminada correctamente.' });
    } catch (err) {
        console.error("Error al eliminar cita:", err.message);
        // Specific handling for foreign key error if the appointment has associated services
        if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
            return res.status(409).json({ error: 'No se puede eliminar la cita porque tiene servicios asociados. Por favor, elimina primero los servicios asociados a esta cita.' });
        }
        return res.status(500).json({ error: 'Error interno del servidor al eliminar cita.' });
    }
};
