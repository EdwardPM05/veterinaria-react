const express = require('express');
const router = express.Router();
const subcategoriasController = require('../controllers/subcategoriasController');

router.get('/', subcategoriasController.getAll);
router.post('/', subcategoriasController.create);
router.put('/:id', subcategoriasController.update);
router.delete('/:id', subcategoriasController.remove);

module.exports = router;