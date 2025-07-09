const express = require('express');
const router = express.Router();
const razasController = require('../controllers/razasController');

router.get('/', razasController.getAll);
router.post('/', razasController.create);
router.put('/:id', razasController.update);
router.delete('/:id', razasController.remove);

module.exports = router;