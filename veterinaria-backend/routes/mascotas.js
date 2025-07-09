const express = require('express');
const router = express.Router();
const mascotasController = require('../controllers/mascotasController');

router.get('/', mascotasController.getAll);
router.post('/', mascotasController.create);
router.put('/:id', mascotasController.update);
router.delete('/:id', mascotasController.remove);

module.exports = router;