// backend/src/controllers/razasController.js

// Cambia 'db' por 'pool' para usar el pool de conexiones con promesas
const pool = require('../db');

// Obtener todas las razas (con búsqueda opcional y nombre de especie)
exports.getAll = async (req, res) => {
    const searchTerm = req.query.search;
    let sql = `
        SELECT
            R.RazaID,
            R.NombreRaza,
            R.EspecieID,
            E.NombreEspecie
        FROM Razas R
        JOIN Especies E ON R.EspecieID = E.EspecieID
    `;
    let params = [];

    if (searchTerm) {
        sql += ` WHERE R.NombreRaza LIKE ? OR E.NombreEspecie LIKE ?`;
        const likeTerm = `%${searchTerm}%`;
        params = [likeTerm, likeTerm];
    }

    try {
        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error("Error al obtener razas:", err.message);
        return res.status(500).json({ error: 'Error interno del servidor al obtener razas.' });
    }
};

// Obtener raza por ID
exports.getById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT
                R.RazaID,
                R.NombreRaza,
                R.EspecieID,
                E.NombreEspecie
            FROM Razas R
            JOIN Especies E ON R.EspecieID = E.EspecieID
            WHERE R.RazaID = ?`,
            [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Raza no encontrada.' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error("Error al obtener raza por ID:", err.message);
        return res.status(500).json({ error: 'Error interno del servidor al obtener la raza.' });
    }
};

// Crear nueva raza
exports.create = async (req, res) => {
    const { NombreRaza, EspecieID } = req.body;

    if (!NombreRaza || !EspecieID) {
        return res.status(400).json({ error: 'NombreRaza y EspecieID son obligatorios.' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO Razas (NombreRaza, EspecieID) VALUES (?, ?)',
            [NombreRaza, EspecieID]
        );
        res.status(201).json({ id: result.insertId, message: 'Raza creada correctamente.' });
    } catch (err) {
        console.error("Error al crear raza:", err.message);
        // Manejo de error si el nombre de la raza ya existe para esa especie (si tienes una restricción UNIQUE)
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Ya existe una raza con este nombre para la especie seleccionada.' });
        }
        return res.status(500).json({ error: 'Error interno del servidor al crear raza.' });
    }
};

// Actualizar una raza
exports.update = async (req, res) => {
    const { id } = req.params;
    const { NombreRaza, EspecieID } = req.body;

    if (!NombreRaza || !EspecieID) {
        return res.status(400).json({ error: 'NombreRaza y EspecieID son obligatorios.' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE Razas SET NombreRaza = ?, EspecieID = ? WHERE RazaID = ?',
            [NombreRaza, EspecieID, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Raza no encontrada para actualizar.' });
        }
        res.json({ message: 'Raza actualizada correctamente.' });
    } catch (err) {
        console.error("Error al actualizar raza:", err.message);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Ya existe una raza con este nombre para la especie seleccionada.' });
        }
        return res.status(500).json({ error: 'Error interno del servidor al actualizar raza.' });
    }
};

// Eliminar una raza
exports.remove = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM Razas WHERE RazaID = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Raza no encontrada para eliminar.' });
        }
        res.json({ message: 'Raza eliminada correctamente.' });
    } catch (err) {
        console.error("Error al eliminar raza:", err.message);
        if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
            return res.status(409).json({ error: 'No se puede eliminar la raza porque tiene mascotas asociadas. Por favor, elimina primero los elementos relacionados.' });
        }
        return res.status(500).json({ error: 'Error interno del servidor al eliminar raza.' });
    }
};
