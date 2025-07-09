// backend/src/controllers/categoriasController.js

// Cambia 'db' por 'pool' para usar el pool de conexiones con promesas
const pool = require('../db');

// Obtener todas las categorías (con búsqueda opcional)
exports.getAll = async (req, res) => {
    const searchTerm = req.query.search;
    let sql = 'SELECT * FROM CategoriasProductos'; // Nombre de la tabla
    let params = [];

    if (searchTerm) {
        sql += ` WHERE NombreCategoria LIKE ?`;
        const likeTerm = `%${searchTerm}%`;
        params = [likeTerm];
    }

    sql += ` ORDER BY NombreCategoria ASC`; // Opcional: ordenar los resultados

    try {
        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error("Error al obtener categorías de productos:", err.message);
        return res.status(500).json({ error: 'Error interno del servidor al obtener categorías.' });
    }
};

// Obtener categoría por ID
exports.getById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM CategoriasProductos WHERE CategoriaProductoID = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada.' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error("Error al obtener categoría por ID:", err.message);
        return res.status(500).json({ error: 'Error interno del servidor al obtener la categoría.' });
    }
};

// Crear nueva categoría
exports.create = async (req, res) => {
    const { NombreCategoria } = req.body;
    if (!NombreCategoria) {
        return res.status(400).json({ error: 'NombreCategoria es obligatorio.' });
    }

    try {
        const [result] = await pool.query('INSERT INTO CategoriasProductos (NombreCategoria) VALUES (?)', [NombreCategoria]);
        res.status(201).json({ id: result.insertId, NombreCategoria, message: 'Categoría creada correctamente.' });
    } catch (err) {
        console.error("Error al crear categoría de producto:", err.message);
        // Manejo de error si el nombre de la categoría ya existe (si tienes una restricción UNIQUE)
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Ya existe una categoría con este nombre.' });
        }
        return res.status(500).json({ error: 'Error interno del servidor al crear categoría.' });
    }
};

// Actualizar una categoría
exports.update = async (req, res) => {
    const { id } = req.params;
    const { NombreCategoria } = req.body;

    if (!NombreCategoria) {
        return res.status(400).json({ error: 'NombreCategoria es obligatorio.' });
    }

    try {
        const [result] = await pool.query('UPDATE CategoriasProductos SET NombreCategoria = ? WHERE CategoriaProductoID = ?', [NombreCategoria, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada para actualizar.' });
        }
        res.json({ message: 'Categoría actualizada correctamente.' });
    } catch (err) {
        console.error("Error al actualizar categoría de producto:", err.message);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Ya existe una categoría con este nombre.' });
        }
        return res.status(500).json({ error: 'Error interno del servidor al actualizar categoría.' });
    }
};

// Eliminar una categoría
exports.remove = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM CategoriasProductos WHERE CategoriaProductoID = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada para eliminar.' });
        }
        res.json({ message: 'Categoría eliminada correctamente.' });
    } catch (err) {
        console.error("Error al eliminar categoría de producto:", err.message);
        // Manejo específico para error de clave foránea si la categoría está en uso
        if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) { // 1451 es el errno común para FOREIGN KEY constraint fails
            return res.status(409).json({ error: 'No se puede eliminar la categoría porque tiene subcategorías o servicios asociados. Por favor, elimina primero los elementos relacionados.' });
        }
        return res.status(500).json({ error: 'Error interno del servidor al eliminar categoría.' });
    }
};