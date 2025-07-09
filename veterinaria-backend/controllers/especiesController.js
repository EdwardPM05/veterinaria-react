// backend/src/controllers/especiesController.js

// Cambia 'db' por 'pool' para usar el pool de conexiones con promesas
const pool = require('../db');

// Obtener todas las especies (con búsqueda opcional)
exports.getAll = async (req, res) => {
    const searchTerm = req.query.search; // Captura el término de búsqueda de la URL

    let sql = 'SELECT * FROM Especies';
    let params = [];

    // Si hay un término de búsqueda, añade la cláusula WHERE
    if (searchTerm) {
        sql += ' WHERE NombreEspecie LIKE ?';
        params.push(`%${searchTerm}%`); // Añade comodines para búsqueda parcial
    }

    sql += ` ORDER BY NombreEspecie ASC`; // Opcional: ordenar los resultados

    try {
        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error("Error al obtener especies:", err.message); // Log para depuración
        return res.status(500).json({ error: 'Error interno del servidor al obtener especies.' });
    }
};

// Obtener especie por ID
exports.getById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM Especies WHERE EspecieID = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Especie no encontrada.' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error("Error al obtener especie por ID:", err.message);
        return res.status(500).json({ error: 'Error interno del servidor al obtener la especie.' });
    }
};

// Crear nueva especie
exports.create = async (req, res) => {
    const { NombreEspecie } = req.body;
    if (!NombreEspecie) {
        return res.status(400).json({ error: 'NombreEspecie es obligatorio.' });
    }

    try {
        const [result] = await pool.query('INSERT INTO Especies (NombreEspecie) VALUES (?)', [NombreEspecie]);
        res.status(201).json({ id: result.insertId, message: 'Especie creada correctamente.' });
    } catch (err) {
        console.error("Error al crear especie:", err.message); // Log para depuración
        // Manejo de error si el nombre de la especie ya existe (si tienes una restricción UNIQUE)
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Ya existe una especie con este nombre.' });
        }
        return res.status(500).json({ error: 'Error interno del servidor al crear especie.' });
    }
};

// Actualizar una especie
exports.update = async (req, res) => {
    const { NombreEspecie } = req.body;
    const { id } = req.params;
    if (!NombreEspecie) {
        return res.status(400).json({ error: 'NombreEspecie es obligatorio.' });
    }

    try {
        const [result] = await pool.query('UPDATE Especies SET NombreEspecie = ? WHERE EspecieID = ?', [NombreEspecie, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Especie no encontrada para actualizar.' });
        }
        res.json({ message: 'Especie actualizada correctamente.' });
    } catch (err) {
        console.error("Error al actualizar especie:", err.message); // Log para depuración
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Ya existe una especie con este nombre.' });
        }
        return res.status(500).json({ error: 'Error interno del servidor al actualizar especie.' });
    }
};

// Eliminar una especie
exports.remove = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM Especies WHERE EspecieID = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Especie no encontrada para eliminar.' });
        }
        res.json({ message: 'Especie eliminada correctamente.' });
    } catch (err) {
        console.error("Error al eliminar especie:", err.message); // Log para depuración
        // Manejar el error de clave foránea si existen mascotas asociadas
        if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
            return res.status(409).json({ error: 'No se puede eliminar la especie porque tiene razas o mascotas asociadas. Por favor, elimina primero los elementos relacionados.' });
        }
        return res.status(500).json({ error: 'Error interno del servidor al eliminar especie.' });
    }
};
