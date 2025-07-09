// veterinaria-backend/db.js

const mysql = require('mysql2/promise'); // <--- CAMBIO CRUCIAL
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'veterinaria',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
  waitForConnections: true, // Opcional: el pool esperará si no hay conexiones disponibles
  connectionLimit: 10,     // Opcional: número máximo de conexiones en el pool
  queueLimit: 0            // Opcional: número máximo de peticiones en cola (0 = ilimitado)
};

// Crea un pool de conexiones con la interfaz de promesas
const pool = mysql.createPool(dbConfig);

// Verifica la conexión al inicio (opcional pero buena práctica)
pool.getConnection()
  .then(connection => {
    console.log('Conectado a la base de datos MySQL usando Pool'); // Mensaje más específico
    connection.release(); // Libera la conexión de vuelta al pool
  })
  .catch(err => {
    console.error('Error al conectar a la base de datos (Pool):', err.message);
    process.exit(1); 
  });

module.exports = pool; // Exporta el pool