// backend/src/controllers/clientesController.js

// Cambia 'db' por 'pool' para usar el pool de conexiones con promesas
const pool = require('../db');

// Obtener todos los clientes
exports.getAll = async (req, res) => {
    const searchTerm = req.query.search; // Obtener el término de búsqueda de la URL
    let sql = 'SELECT * FROM Clientes';
    let params = [];

    if (searchTerm) {
        // Si hay un término de búsqueda, añadir la cláusula WHERE
        // Buscamos en PrimerNombre, ApellidoPaterno, ApellidoMaterno, DNI, Telefono, Correo
        sql += ` WHERE PrimerNombre LIKE ? OR ApellidoPaterno LIKE ? OR ApellidoMaterno LIKE ? OR DNI LIKE ? OR Telefono LIKE ? OR Correo LIKE ?`;
        const likeTerm = `%${searchTerm}%`; // Para búsqueda parcial
        params = [likeTerm, likeTerm, likeTerm, likeTerm, likeTerm, likeTerm];
    }

    try {
        // Usa await pool.query() y desestructura el resultado
        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error("Error al obtener clientes:", err.message); // Log del error
        return res.status(500).json({ error: 'Error interno del servidor al obtener clientes.' });
    }
};

// Crear nuevo cliente
exports.create = async (req, res) => {
    const {
        PrimerNombre,
        ApellidoPaterno,
        ApellidoMaterno,
        DNI,
        Telefono,
        Direccion,
        Correo = 'a@gmail.com'
    } = req.body;

    if (!PrimerNombre || !ApellidoPaterno || !ApellidoMaterno || !DNI) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: PrimerNombre, ApellidoPaterno, ApellidoMaterno, DNI.' });
    }

    try {
        const [result] = await pool.query(
            `INSERT INTO Clientes
            (PrimerNombre, ApellidoPaterno, ApellidoMaterno, DNI, Telefono, Direccion, Correo)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [PrimerNombre, ApellidoPaterno, ApellidoMaterno, DNI, Telefono, Direccion, Correo]
        );
        res.status(201).json({ id: result.insertId, message: 'Cliente creado correctamente.' });
    } catch (err) {
        console.error("Error al crear cliente:", err.message);
        // Manejo de errores específicos, por ejemplo, DNI duplicado
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'El DNI proporcionado ya existe para otro cliente.' });
        }
        return res.status(500).json({ error: 'Error interno del servidor al crear cliente.' });
    }
};

// Actualizar cliente
exports.update = async (req, res) => {
    const {
        PrimerNombre,
        ApellidoPaterno,
        ApellidoMaterno,
        DNI,
        Telefono,
        Direccion,
        Correo
    } = req.body;

    const { id } = req.params; // ClienteID de la URL

    try {
        const [result] = await pool.query(
            `UPDATE Clientes SET PrimerNombre = ?, ApellidoPaterno = ?, ApellidoMaterno = ?, DNI = ?,
            Telefono = ?, Direccion = ?, Correo = ? WHERE ClienteID = ?`,
            [PrimerNombre, ApellidoPaterno, ApellidoMaterno, DNI, Telefono, Direccion, Correo, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado.' });
        }
        res.json({ message: 'Cliente actualizado correctamente.' });
    } catch (err) {
        console.error("Error al actualizar cliente:", err.message);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'El DNI proporcionado ya existe para otro cliente.' });
        }
        return res.status(500).json({ error: 'Error interno del servidor al actualizar cliente.' });
    }
};

// Eliminar cliente
exports.remove = async (req, res) => {
    const { id } = req.params; // ClienteID de la URL

    try {
        const [result] = await pool.query('DELETE FROM Clientes WHERE ClienteID = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado para eliminar.' });
        }
        res.json({ message: 'Cliente eliminado correctamente.' });
    } catch (err) {
        console.error("Error al eliminar cliente:", err.message);
        // Puedes añadir manejo de errores específicos, por ejemplo, si hay restricciones de clave externa
        if (err.code === 'ER_ROW_IS_REFERENCED_2') { // O 'ER_NO_REFERENCED_ROW_2' dependiendo de la versión
            return res.status(409).json({ error: 'No se puede eliminar el cliente porque tiene mascotas asociadas u otros registros relacionados.' });
        }
        return res.status(500).json({ error: 'Error interno del servidor al eliminar cliente.' });
    }
};

// Obtener cliente por ID
exports.getById = async (req, res) => {
    const { id } = req.params; // ClienteID de la URL

    try {
        const [rows] = await pool.query('SELECT * FROM Clientes WHERE ClienteID = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado.' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error("Error al obtener cliente por ID:", err.message);
        return res.status(500).json({ error: 'Error interno del servidor al obtener el cliente.' });
    }
};