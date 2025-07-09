// backend/src/controllers/subcategoriasController.js

// Change 'db' to 'pool' to use the promise-based connection pool
const pool = require('../db');

// Get all subcategories with search capabilities and category name
exports.getAll = async (req, res) => {
    const searchTerm = req.query.search;
    let sql = `
        SELECT
            sc.SubcategoriaID,
            sc.CategoriaProductoID,
            sc.Nombre,
            sc.Descripcion,
            cp.NombreCategoria
        FROM
            Subcategoria sc
        JOIN
            CategoriasProductos cp ON sc.CategoriaProductoID = cp.CategoriaProductoID
    `;
    let params = [];

    if (searchTerm) {
        sql += ` WHERE sc.Nombre LIKE ? OR cp.NombreCategoria LIKE ?`;
        const likeTerm = `%${searchTerm}%`;
        params = [likeTerm, likeTerm];
    }

    sql += ` ORDER BY sc.Nombre ASC`; // Optional: order the results

    try {
        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error("Error getting subcategories:", err.message);
        return res.status(500).json({ error: 'Internal server error when getting subcategories.' });
    }
};

// Get subcategory by ID
exports.getById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT
                sc.SubcategoriaID,
                sc.CategoriaProductoID,
                sc.Nombre,
                sc.Descripcion,
                cp.NombreCategoria
            FROM
                Subcategoria sc
            JOIN
                CategoriasProductos cp ON sc.CategoriaProductoID = cp.CategoriaProductoID
            WHERE sc.SubcategoriaID = ?`,
            [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Subcategory not found.' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error("Error getting subcategory by ID:", err.message);
        return res.status(500).json({ error: 'Internal server error when getting the subcategory.' });
    }
};

// Create new subcategory
exports.create = async (req, res) => {
    const { CategoriaProductoID, Nombre, Descripcion } = req.body;

    if (!CategoriaProductoID || !Nombre) {
        return res.status(400).json({ error: 'CategoriaProductoID and Nombre are mandatory.' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO Subcategoria (CategoriaProductoID, Nombre, Descripcion) VALUES (?, ?, ?)',
            [CategoriaProductoID, Nombre, Descripcion || null] // Use null if description is empty
        );
        res.status(201).json({ id: result.insertId, message: 'Subcategory created successfully.' });
    } catch (err) {
        console.error("Error creating subcategory:", err.message);
        // Handle error if subcategory name already exists for that category (if you have a UNIQUE constraint)
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'A subcategory with this name already exists for the selected category.' });
        }
        return res.status(500).json({ error: 'Internal server error when creating subcategory.' });
    }
};

// Update subcategory
exports.update = async (req, res) => {
    const { id } = req.params;
    const { CategoriaProductoID, Nombre, Descripcion } = req.body;

    if (!CategoriaProductoID || !Nombre) {
        return res.status(400).json({ error: 'CategoriaProductoID and Nombre are mandatory.' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE Subcategoria SET CategoriaProductoID = ?, Nombre = ?, Descripcion = ? WHERE SubcategoriaID = ?',
            [CategoriaProductoID, Nombre, Descripcion || null, id] // Use null if description is empty
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Subcategory not found for update.' });
        }
        res.json({ message: 'Subcategory updated successfully.' });
    } catch (err) {
        console.error("Error updating subcategory:", err.message);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'A subcategory with this name already exists for the selected category.' });
        }
        return res.status(500).json({ error: 'Internal server error when updating subcategory.' });
    }
};

// Delete subcategory
exports.remove = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM Subcategoria WHERE SubcategoriaID = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Subcategory not found for deletion.' });
        }
        res.json({ message: 'Subcategory deleted successfully.' });
    } catch (err) {
        console.error("Error deleting subcategory:", err.message);
        if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
            return res.status(409).json({ error: 'Cannot delete the subcategory because it has associated services. Please delete related items first.' });
        }
        return res.status(500).json({ error: 'Internal server error when deleting subcategory.' });
    }
};
