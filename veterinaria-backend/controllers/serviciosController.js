// backend/src/controllers/serviciosController.js

// Change 'db' to 'pool' to use the promise-based connection pool
const pool = require('../db');

// Get all services (with optional search and subcategory/category names)
exports.getAll = async (req, res) => {
    const searchTerm = req.query.search;
    let sql = `
        SELECT
            s.ServicioID,
            s.NombreServicio,
            s.Descripcion,
            s.Precio,
            s.SubcategoriaID,
            sc.Nombre AS NombreSubcategoria,
            cp.NombreCategoria
        FROM
            Servicios s
        LEFT JOIN
            Subcategoria sc ON s.SubcategoriaID = sc.SubcategoriaID
        LEFT JOIN
            CategoriasProductos cp ON sc.CategoriaProductoID = cp.CategoriaProductoID
    `;
    let params = [];

    if (searchTerm) {
        // Search by service name, description, subcategory name, or category name
        sql += `
            WHERE
                s.NombreServicio LIKE ? OR
                s.Descripcion LIKE ? OR
                sc.Nombre LIKE ? OR
                cp.NombreCategoria LIKE ?
        `;
        const likeTerm = `%${searchTerm}%`;
        params = [likeTerm, likeTerm, likeTerm, likeTerm];
    }

    sql += ` ORDER BY s.NombreServicio ASC`; // Optional: order the results

    try {
        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error("Error getting services:", err.message);
        return res.status(500).json({ error: 'Internal server error when getting services.' });
    }
};

// Get service by ID
exports.getById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT
                s.ServicioID,
                s.NombreServicio,
                s.Descripcion,
                s.Precio,
                s.SubcategoriaID,
                sc.Nombre AS NombreSubcategoria,
                cp.NombreCategoria
            FROM
                Servicios s
            LEFT JOIN
                Subcategoria sc ON s.SubcategoriaID = sc.SubcategoriaID
            LEFT JOIN
                CategoriasProductos cp ON sc.CategoriaProductoID = cp.CategoriaProductoID
            WHERE s.ServicioID = ?`,
            [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Service not found.' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error("Error getting service by ID:", err.message);
        return res.status(500).json({ error: 'Internal server error when getting the service.' });
    }
};

// Create new service
exports.create = async (req, res) => {
    const { NombreServicio, Descripcion, Precio, SubcategoriaID } = req.body;

    if (!NombreServicio || Precio === undefined) {
        return res.status(400).json({ error: 'NombreServicio and Precio are mandatory.' });
    }
    // Ensure price is a valid number and handle description as optional
    const formattedPrecio = parseFloat(Precio);
    if (isNaN(formattedPrecio)) {
        return res.status(400).json({ error: 'Precio must be a valid number.' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO Servicios (NombreServicio, Descripcion, Precio, SubcategoriaID) VALUES (?, ?, ?, ?)',
            [NombreServicio, Descripcion || null, formattedPrecio, SubcategoriaID || null]
        );
        res.status(201).json({ id: result.insertId, message: 'Service created successfully.' });
    } catch (err) {
        console.error("Error creating service:", err.message);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'A service with this name already exists.' });
        }
        return res.status(500).json({ error: 'Internal server error when creating service.' });
    }
};

// Update service
exports.update = async (req, res) => {
    const { id } = req.params;
    const { NombreServicio, Descripcion, Precio, SubcategoriaID } = req.body;

    if (!NombreServicio || Precio === undefined) {
        return res.status(400).json({ error: 'NombreServicio and Precio are mandatory.' });
    }
    const formattedPrecio = parseFloat(Precio);
    if (isNaN(formattedPrecio)) {
        return res.status(400).json({ error: 'Precio must be a valid number.' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE Servicios SET NombreServicio = ?, Descripcion = ?, Precio = ?, SubcategoriaID = ? WHERE ServicioID = ?',
            [NombreServicio, Descripcion || null, formattedPrecio, SubcategoriaID || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Service not found for update.' });
        }
        res.json({ message: 'Service updated successfully.' });
    } catch (err) {
        console.error("Error updating service:", err.message);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'A service with this name already exists.' });
        }
        return res.status(500).json({ error: 'Internal server error when updating service.' });
    }
};

// Delete service
exports.remove = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM Servicios WHERE ServicioID = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Service not found for deletion.' });
        }
        res.json({ message: 'Service deleted successfully.' });
    } catch (err) {
        console.error("Error deleting service:", err.message);
        // If there are tables that reference ServicioID (e.g., CitaServicios), here would be a 409 error
        if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
            return res.status(409).json({ error: 'Cannot delete the service because it has associated records (e.g., appointments, products). Please delete related items first.' });
        }
        return res.status(500).json({ error: 'Internal server error when deleting service.' });
    }
};
