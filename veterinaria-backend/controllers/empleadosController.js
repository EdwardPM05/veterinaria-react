// backend/src/controllers/empleadosController.js

// Change 'db' to 'pool' to use the promise-based connection pool
const pool = require('../db');

// Get all employees with search capabilities and join with Roles
exports.getAll = async (req, res) => {
    const searchTerm = req.query.search;
    let sql = `
        SELECT
            e.EmpleadoID,
            e.PrimerNombre,
            e.ApellidoPaterno,
            e.ApellidoMaterno,
            e.DNI,
            e.Correo,
            e.Telefono,
            e.RolID,
            r.NombreRol
        FROM
            Empleados e
        JOIN
            Roles r ON e.RolID = r.RolID
    `;
    let params = [];

    if (searchTerm) {
        // Search by name, DNI, phone, email, or role name
        sql += `
            WHERE
                e.PrimerNombre LIKE ? OR
                e.ApellidoPaterno LIKE ? OR
                e.ApellidoMaterno LIKE ? OR
                e.DNI LIKE ? OR
                e.Telefono LIKE ? OR
                e.Correo LIKE ? OR
                r.NombreRol LIKE ?
        `;
        const likeTerm = `%${searchTerm}%`;
        params = [likeTerm, likeTerm, likeTerm, likeTerm, likeTerm, likeTerm, likeTerm];
    }

    sql += ` ORDER BY e.PrimerNombre ASC`; // Optional: order the results

    try {
        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error("Error getting employees:", err.message);
        return res.status(500).json({ error: 'Internal server error when getting employees.' });
    }
};

// Get employee by ID
exports.getById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT
                e.EmpleadoID,
                e.PrimerNombre,
                e.ApellidoPaterno,
                e.ApellidoMaterno,
                e.DNI,
                e.Correo,
                e.Telefono,
                e.RolID,
                r.NombreRol
            FROM
                Empleados e
            JOIN
                Roles r ON e.RolID = r.RolID
            WHERE e.EmpleadoID = ?`,
            [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Employee not found.' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error("Error getting employee by ID:", err.message);
        return res.status(500).json({ error: 'Internal server error when getting the employee.' });
    }
};

// Create new employee
exports.create = async (req, res) => {
    const {
        PrimerNombre,
        ApellidoPaterno,
        ApellidoMaterno,
        DNI,
        Correo = 'a@gmail.com', // Default value if not provided
        Telefono,
        RolID
    } = req.body;

    if (!PrimerNombre || !ApellidoPaterno || !ApellidoMaterno || !DNI || !RolID) {
        return res.status(400).json({ error: 'Missing mandatory fields: PrimerNombre, ApellidoPaterno, ApellidoMaterno, DNI, RolID.' });
    }

    // Validate DNI (e.g.: 8 numeric digits)
    if (!/^\d{8}$/.test(DNI)) {
        return res.status(400).json({ error: 'DNI must contain exactly 8 numeric digits.' });
    }

    try {
        const [result] = await pool.query(
            `INSERT INTO Empleados
            (PrimerNombre, ApellidoPaterno, ApellidoMaterno, DNI, Correo, Telefono, RolID)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [PrimerNombre, ApellidoPaterno, ApellidoMaterno, DNI, Correo, Telefono, RolID]
        );
        res.status(201).json({ id: result.insertId, message: 'Employee created successfully.' });
    } catch (err) {
        console.error("Error creating employee:", err.message);
        if (err.code === 'ER_DUP_ENTRY') { // Duplicate entry error (unique DNI)
            return res.status(409).json({ error: 'The provided DNI already exists for another employee.' });
        }
        return res.status(500).json({ error: 'Internal server error when creating employee.' });
    }
};

// Update employee
exports.update = async (req, res) => {
    const { id } = req.params;
    const {
        PrimerNombre,
        ApellidoPaterno,
        ApellidoMaterno,
        DNI,
        Correo,
        Telefono,
        RolID
    } = req.body;

    if (!PrimerNombre || !ApellidoPaterno || !ApellidoMaterno || !DNI || !RolID) {
        return res.status(400).json({ error: 'Missing mandatory fields: PrimerNombre, ApellidoPaterno, ApellidoMaterno, DNI, RolID.' });
    }

    // Validate DNI (e.g.: 8 numeric digits)
    if (!/^\d{8}$/.test(DNI)) {
        return res.status(400).json({ error: 'DNI must contain exactly 8 numeric digits.' });
    }

    try {
        const [result] = await pool.query(
            `UPDATE Empleados
            SET PrimerNombre = ?, ApellidoPaterno = ?, ApellidoMaterno = ?, DNI = ?, Correo = ?, Telefono = ?, RolID = ?
            WHERE EmpleadoID = ?`,
            [PrimerNombre, ApellidoPaterno, ApellidoMaterno, DNI, Correo, Telefono, RolID, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Employee not found for update.' });
        }
        res.json({ message: 'Employee updated successfully.' });
    } catch (err) {
        console.error("Error updating employee:", err.message);
        if (err.code === 'ER_DUP_ENTRY') { // Duplicate entry error (unique DNI)
            return res.status(409).json({ error: 'The provided DNI already exists for another employee.' });
        }
        return res.status(500).json({ error: 'Internal server error when updating employee.' });
    }
};

// Delete employee
exports.remove = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM Empleados WHERE EmpleadoID = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Employee not found for deletion.' });
        }
        res.json({ message: 'Employee deleted successfully.' });
    } catch (err) {
        console.error("Error deleting employee:", err.message);
        if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
            return res.status(409).json({ error: 'Cannot delete the employee because they have associated appointments. Please delete related appointments first.' });
        }
        return res.status(500).json({ error: 'Internal server error when deleting employee.' });
    }
};
