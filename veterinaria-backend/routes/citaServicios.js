const express = require('express');
const router = express.Router();
const citaServiciosController = require('../controllers/citaServiciosController');

router.get('/', citaServiciosController.getAll);
router.post('/', citaServiciosController.create);
router.put('/:id', citaServiciosController.update);
router.delete('/:id', citaServiciosController.remove);

router.get('/reporte/:id', citaServiciosController.getReportDataByCitaId); // Endpoint para el reporte


module.exports = router;
