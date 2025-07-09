const express = require('express');
const router = express.Router();
const serviciosController = require('../controllers/serviciosController');

router.get('/', serviciosController.getAll);
router.post('/', serviciosController.create);
router.put('/:id', serviciosController.update);
router.delete('/:id', serviciosController.remove);

module.exports = router;