const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config(); // si usas .env

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/empleados', require('./routes/empleados'));
app.use('/api/roles', require('./routes/roles'));
app.use('/api/categorias', require('./routes/categorias'));
app.use('/api/subcategorias', require('./routes/subcategorias'));
app.use('/api/servicios', require('./routes/servicios'));
app.use('/api/especies', require('./routes/especies'));
app.use('/api/razas', require('./routes/razas'));
app.use('/api/mascotas', require('./routes/mascotas'));
app.use('/api/citas', require('./routes/citas'));
app.use('/api/citaservicios', require('./routes/citaServicios'));

// Puerto
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
