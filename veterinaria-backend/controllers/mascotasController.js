// backend/src/controllers/mascotasController.js

// Change 'db' to 'pool' to use the promise-based connection pool
const pool = require('../db');

// Get all pets with search capabilities and joins
exports.getAll = async (req, res) => {
    const searchTerm = req.query.search; // Get the search term from the query string
    let sql = `
        SELECT
            m.MascotaID,
            m.Nombre,
            m.Edad,
            m.Sexo,
            m.ClienteID,
            c.PrimerNombre AS ClientePrimerNombre,
            c.ApellidoPaterno AS ClienteApellidoPaterno,
            c.ApellidoMaterno AS ClienteApellidoMaterno,
            m.RazaID,
            r.NombreRaza,
            e.NombreEspecie
        FROM
            Mascotas m
        JOIN
            Clientes c ON m.ClienteID = c.ClienteID
        JOIN
            Razas r ON m.RazaID = r.RazaID
        JOIN
            Especies e ON r.EspecieID = e.EspecieID
    `;
    let params = [];

    if (searchTerm) {
        // Add search conditions
        sql += `
            WHERE
                m.Nombre LIKE ? OR
                c.PrimerNombre LIKE ? OR
                c.ApellidoPaterno LIKE ? OR
                c.ApellidoMaterno LIKE ? OR
                r.NombreRaza LIKE ? OR
                e.NombreEspecie LIKE ?
        `;
        const likeTerm = `%${searchTerm}%`;
        params = [likeTerm, likeTerm, likeTerm, likeTerm, likeTerm, likeTerm];
    }

    // Optional: order the results
    sql += ` ORDER BY m.Nombre ASC`;

    try {
        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error("Error getting pets:", err);
        return res.status(500).json({ error: 'Internal server error when getting pets.' });
    }
};

// Get pet by ID
exports.getById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT
                m.MascotaID,
                m.Nombre,
                m.Edad,
                m.Sexo,
                m.ClienteID,
                c.PrimerNombre AS ClientePrimerNombre,
                c.ApellidoPaterno AS ClienteApellidoPaterno,
                c.ApellidoMaterno AS ClienteApellidoMaterno,
                m.RazaID,
                r.NombreRaza,
                e.NombreEspecie
            FROM
                Mascotas m
            JOIN
                Clientes c ON m.ClienteID = c.ClienteID
            JOIN
                Razas r ON m.RazaID = r.RazaID
            JOIN
                Especies e ON r.EspecieID = e.EspecieID
            WHERE m.MascotaID = ?`,
            [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Pet not found.' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error("Error getting pet by ID:", err.message);
        return res.status(500).json({ error: 'Internal server error when getting the pet.' });
    }
};


// Create new pet
exports.create = async (req, res) => {
    const { Nombre, Edad, Sexo, ClienteID, RazaID } = req.body;

    if (!Nombre || Edad === undefined || !Sexo || !ClienteID || !RazaID) {
        return res.status(400).json({ error: 'All fields are mandatory: Nombre, Edad, Sexo, ClienteID, RazaID.' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO Mascotas (Nombre, Edad, Sexo, ClienteID, RazaID) VALUES (?, ?, ?, ?, ?)',
            [Nombre, Edad, Sexo, ClienteID, RazaID]
        );
        res.status(201).json({ id: result.insertId, message: 'Pet created successfully.' });
    } catch (err) {
        console.error("Error creating pet:", err.message);
        return res.status(500).json({ error: 'Internal server error when creating pet.' });
    }
};

// Update pet
exports.update = async (req, res) => {
    const { id } = req.params;
    const { Nombre, Edad, Sexo, ClienteID, RazaID } = req.body;

    if (!Nombre || Edad === undefined || !Sexo || !ClienteID || !RazaID) {
        return res.status(400).json({ error: 'All fields are mandatory: Nombre, Edad, Sexo, ClienteID, RazaID.' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE Mascotas SET Nombre = ?, Edad = ?, Sexo = ?, ClienteID = ?, RazaID = ? WHERE MascotaID = ?',
            [Nombre, Edad, Sexo, ClienteID, RazaID, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pet not found for update.' });
        }
        res.json({ message: 'Pet updated successfully.' });
    } catch (err) {
        console.error("Error updating pet:", err.message);
        return res.status(500).json({ error: 'Internal server error when updating pet.' });
    }
};

// Delete pet
exports.remove = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM Mascotas WHERE MascotaID = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pet not found for deletion.' });
        }
        res.json({ message: 'Pet deleted successfully.' });
    } catch (err) {
        console.error("Error deleting pet:", err);
        // If there's a foreign key error (e.g., if it has health records/appointments)
        if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
            return res.status(409).json({ error: 'Cannot delete the pet because it has associated records (e.g., appointments, medical history). Please delete related items first.' });
        }
        return res.status(500).json({ error: 'Internal server error when deleting pet.' });
    }
};
