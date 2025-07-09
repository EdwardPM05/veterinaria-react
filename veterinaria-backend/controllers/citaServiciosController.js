// backend/src/controllers/citaServiciosController.js

// Change 'db' to 'pool' to use the promise-based connection pool
const pool = require('../db');

// Get all CitaServicios records with details and search capability
exports.getAll = async (req, res) => {
    const searchTerm = req.query.search;
    let sql = `
        SELECT
            cs.CitaServicioID,
            cs.CitaID,
            c.Fecha AS CitaFecha,
            c.Estado AS CitaEstado,
            m.Nombre AS MascotaNombre,
            cl.PrimerNombre AS ClientePrimerNombre,
            cl.ApellidoPaterno AS ClienteApellidoPaterno,
            cl.ApellidoMaterno AS ClienteApellidoMaterno,
            s.ServicioID,
            s.NombreServicio AS ServicioNombre,
            s.Descripcion AS ServicioDescripcion,
            s.Precio AS ServicioPrecio
        FROM
            CitaServicios cs
        JOIN
            Citas c ON cs.CitaID = c.CitaID
        JOIN
            Mascotas m ON c.MascotaID = m.MascotaID
        JOIN
            Clientes cl ON m.ClienteID = cl.ClienteID
        JOIN
            Servicios s ON cs.ServicioID = s.ServicioID
    `;
    let params = [];

    if (searchTerm) {
        // Search by pet name, client name, service name, or appointment status
        sql += `
            WHERE
                m.Nombre LIKE ? OR
                cl.PrimerNombre LIKE ? OR
                cl.ApellidoPaterno LIKE ? OR
                cl.ApellidoMaterno LIKE ? OR
                s.NombreServicio LIKE ? OR
                c.Estado LIKE ?
        `;
        const likeTerm = `%${searchTerm}%`;
        params = [likeTerm, likeTerm, likeTerm, likeTerm, likeTerm, likeTerm];
    }

    // Order by CitaFecha (most recent first), then Mascota Nombre, then Servicio Nombre
    sql += ` ORDER BY c.Fecha DESC, m.Nombre, s.NombreServicio`;

    try {
        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error("Error getting CitaServicios:", err.message);
        return res.status(500).json({ error: 'Internal server error when getting CitaServicios.' });
    }
};

// Get CitaServicio record by ID
exports.getById = async (req, res) => {
    const { id } = req.params; // This is CitaServicioID
    try {
        const [rows] = await pool.query(
            `SELECT
                cs.CitaServicioID,
                cs.CitaID,
                c.Fecha AS CitaFecha,
                c.Estado AS CitaEstado,
                m.Nombre AS MascotaNombre,
                cl.PrimerNombre AS ClientePrimerNombre,
                cl.ApellidoPaterno AS ClienteApellidoPaterno,
                cl.ApellidoMaterno AS ClienteApellidoMaterno,
                s.ServicioID,
                s.NombreServicio AS ServicioNombre,
                s.Descripcion AS ServicioDescripcion,
                s.Precio AS ServicioPrecio
            FROM
                CitaServicios cs
            JOIN
                Citas c ON cs.CitaID = c.CitaID
            JOIN
                Mascotas m ON c.MascotaID = m.MascotaID
            JOIN
                Clientes cl ON m.ClienteID = cl.ClienteID
            JOIN
                Servicios s ON cs.ServicioID = s.ServicioID
            WHERE cs.CitaServicioID = ?`,
            [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'CitaServicio record not found.' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error("Error getting CitaServicio by ID:", err.message);
        return res.status(500).json({ error: 'Internal server error when getting the CitaServicio record.' });
    }
};

// Create a new record
exports.create = async (req, res) => {
    const { CitaID, ServicioID } = req.body;

    if (!CitaID || !ServicioID) {
        return res.status(400).json({ error: 'CitaID and ServicioID are mandatory.' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO CitaServicios (CitaID, ServicioID) VALUES (?, ?)',
            [CitaID, ServicioID]
        );
        res.status(201).json({ id: result.insertId, message: 'CitaServicio record created successfully.' });
    } catch (err) {
        console.error("Error creating CitaServicio:", err.message);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'This service is already assigned to this appointment.' });
        }
        if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.errno === 1452) { // 1452 is common errno for foreign key constraint fail
            return res.status(400).json({ error: 'The provided CitaID or ServicioID do not exist.' });
        }
        return res.status(500).json({ error: 'Internal server error when creating CitaServicio.' });
    }
};

// Update a record
exports.update = async (req, res) => {
    const { CitaID, ServicioID } = req.body;
    const { id } = req.params; // This is CitaServicioID

    if (!CitaID || !ServicioID) {
        return res.status(400).json({ error: 'CitaID and ServicioID are mandatory.' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE CitaServicios SET CitaID = ?, ServicioID = ? WHERE CitaServicioID = ?',
            [CitaID, ServicioID, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'CitaServicio record not found for update.' });
        }
        res.json({ message: 'CitaServicio record updated successfully.' });
    } catch (err) {
        console.error("Error updating CitaServicio:", err.message);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'This service is already assigned to this appointment.' });
        }
        if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.errno === 1452) {
            return res.status(400).json({ error: 'The provided CitaID or ServicioID do not exist.' });
        }
        return res.status(500).json({ error: 'Internal server error when updating CitaServicio.' });
    }
};

// Delete a record
exports.remove = async (req, res) => {
    const { id } = req.params; // This is CitaServicioID

    try {
        const [result] = await pool.query('DELETE FROM CitaServicios WHERE CitaServicioID = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'CitaServicio record not found for deletion.' });
        }
        res.json({ message: 'CitaServicio record deleted successfully.' });
    } catch (err) {
        console.error("Error deleting CitaServicio:", err.message);
        return res.status(500).json({ error: 'Internal server error when deleting CitaServicio.' });
    }
};

// Get report data by CitaID
exports.getReportDataByCitaId = async (req, res) => {
    const { id } = req.params; // CitaID coming from the URL

    if (!id) {
        return res.status(400).json({ error: 'CitaID is mandatory to generate the report.' });
    }

    const sql = `
        SELECT
            c.CitaID,
            c.Fecha AS CitaFecha,
            c.Estado AS CitaEstado,
            m.MascotaID,
            m.Nombre AS MascotaNombre,
            m.Edad AS MascotaEdad,
            m.Sexo AS MascotaSexo,
            e.NombreEspecie AS MascotaEspecie,
            r.NombreRaza AS MascotaRaza,
            cl.ClienteID,
            cl.PrimerNombre AS ClientePrimerNombre,
            cl.ApellidoPaterno AS ClienteApellidoPaterno,
            cl.ApellidoMaterno AS ClienteApellidoMaterno,
            cl.DNI AS ClienteDNI,
            cl.Telefono AS ClienteTelefono,
            cl.Direccion AS ClienteDireccion,
            cl.Correo AS ClienteCorreo,
            emp.PrimerNombre AS EmpleadoPrimerNombre,
            emp.ApellidoPaterno AS EmpleadoApellidoPaterno,
            rol.NombreRol AS EmpleadoRol,
            s.ServicioID,
            s.NombreServicio AS ServicioNombre,
            s.Descripcion AS ServicioDescripcion,
            s.Precio AS ServicioPrecio
        FROM
            Citas c
        JOIN
            Mascotas m ON c.MascotaID = m.MascotaID
        JOIN
            Clientes cl ON m.ClienteID = cl.ClienteID
        JOIN
            Razas r ON m.RazaID = r.RazaID
        JOIN
            Especies e ON r.EspecieID = e.EspecieID
        JOIN
            Empleados emp ON c.EmpleadoID = emp.EmpleadoID
        JOIN
            Roles rol ON emp.RolID = rol.RolID
        LEFT JOIN -- Use LEFT JOIN so the appointment appears even if it has no associated services
            CitaServicios cs ON c.CitaID = cs.CitaID
        LEFT JOIN
            Servicios s ON cs.ServicioID = s.ServicioID
        WHERE
            c.CitaID = ?
        ORDER BY
            s.NombreServicio;
    `;

    try {
        const [rows] = await pool.query(sql, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Appointment not found or no associated services.' });
        }

        // Group results to return a single appointment object with an array of services
        const citaData = {
            CitaID: rows[0].CitaID,
            Fecha: rows[0].CitaFecha,
            Estado: rows[0].CitaEstado,
            Mascota: {
                ID: rows[0].MascotaID,
                Nombre: rows[0].MascotaNombre,
                Edad: rows[0].MascotaEdad,
                Sexo: rows[0].MascotaSexo,
                Especie: rows[0].MascotaEspecie,
                Raza: rows[0].MascotaRaza,
            },
            Cliente: {
                ID: rows[0].ClienteID,
                PrimerNombre: rows[0].ClientePrimerNombre,
                ApellidoPaterno: rows[0].ClienteApellidoPaterno,
                ApellidoMaterno: rows[0].ClienteApellidoMaterno,
                DNI: rows[0].ClienteDNI,
                Telefono: rows[0].ClienteTelefono,
                Direccion: rows[0].ClienteDireccion,
                Correo: rows[0].ClienteCorreo,
            },
            Empleado: {
                PrimerNombre: rows[0].EmpleadoPrimerNombre,
                ApellidoPaterno: rows[0].EmpleadoApellidoPaterno,
                Rol: rows[0].EmpleadoRol,
            },
            Servicios: []
        };

        let totalPrecioServicios = 0;

        // If there are services (it's possible an appointment has no associated services yet, due to LEFT JOIN)
        if (rows[0].ServicioID !== null) { // Check if the first service is not null
            rows.forEach(row => {
                citaData.Servicios.push({
                    ID: row.ServicioID,
                    Nombre: row.ServicioNombre,
                    Descripcion: row.ServicioDescripcion,
                    Precio: parseFloat(row.ServicioPrecio || 0) // Convert to number here
                });
                totalPrecioServicios += parseFloat(row.ServicioPrecio || 0);
            });
        }

        citaData.TotalPagar = totalPrecioServicios; // Add the calculated total

        res.json(citaData);
    } catch (err) {
        console.error("Error getting appointment report data:", err.message);
        return res.status(500).json({ error: 'Internal server error when getting appointment report data.' });
    }
};
