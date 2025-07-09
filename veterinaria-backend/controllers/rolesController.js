// backend/src/controllers/rolesController.js

// Change 'db' to 'pool' to use the promise-based connection pool
const pool = require('../db');

// Get all roles (with optional search)
exports.getAll = async (req, res) => {
    const searchTerm = req.query.search;
    let sql = 'SELECT * FROM Roles';
    let params = [];

    if (searchTerm) {
        sql += ` WHERE NombreRol LIKE ?`;
        const likeTerm = `%${searchTerm}%`;
        params = [likeTerm];
    }

    sql += ` ORDER BY NombreRol ASC`; // Optional: order the results

    try {
        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error("Error getting roles:", err.message);
        return res.status(500).json({ error: 'Internal server error when getting roles.' });
    }
};

// Get role by ID
exports.getById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM Roles WHERE RolID = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Role not found.' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error("Error getting role by ID:", err.message);
        return res.status(500).json({ error: 'Internal server error when getting the role.' });
    }
};

// Create new role
exports.create = async (req, res) => {
    const { NombreRol } = req.body;
    if (!NombreRol) {
        return res.status(400).json({ error: 'NombreRol is mandatory.' });
    }

    try {
        const [result] = await pool.query('INSERT INTO Roles (NombreRol) VALUES (?)', [NombreRol]);
        res.status(201).json({ id: result.insertId, NombreRol, message: 'Role created successfully.' });
    } catch (err) {
        console.error("Error creating role:", err.message);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'A role with this name already exists.' });
        }
        return res.status(500).json({ error: 'Internal server error when creating role.' });
    }
};

// Update role
exports.update = async (req, res) => {
    const { id } = req.params;
    const { NombreRol } = req.body;

    if (!NombreRol) {
        return res.status(400).json({ error: 'NombreRol is mandatory.' });
    }

    try {
        const [result] = await pool.query('UPDATE Roles SET NombreRol = ? WHERE RolID = ?', [NombreRol, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Role not found for update.' });
        }
        res.json({ message: 'Role updated successfully.' });
    } catch (err) {
        console.error("Error updating role:", err.message);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'A role with this name already exists.' });
        }
        return res.status(500).json({ error: 'Internal server error when updating role.' });
    }
};

// Delete role
exports.remove = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM Roles WHERE RolID = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Role not found for deletion.' });
        }
        res.json({ message: 'Role deleted successfully.' });
    } catch (err) {
        console.error("Error deleting role:", err.message);
        if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
            return res.status(409).json({ error: 'Cannot delete the role because it has associated employees. Please delete related employees first.' });
        }
        return res.status(500).json({ error: 'Internal server error when deleting role.' });
    }
};
