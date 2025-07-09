const express = require('express');
const router = express.Router();
const citasController = require('../controllers/citasController');

router.get('/', citasController.getAll);
router.post('/', citasController.create);
router.put('/:id', citasController.update);
router.delete('/:id', citasController.remove);

module.exports = router;
