const express = require('express');
const router = express.Router();
const especiesController = require('../controllers/especiesController');

router.get('/', especiesController.getAll);
router.post('/', especiesController.create);
router.put('/:id', especiesController.update);
router.delete('/:id', especiesController.remove);

module.exports = router;