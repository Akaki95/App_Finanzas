const express = require('express');
const router = express.Router();
const grupoGastoController = require('../controllers/grupoGastoController');

router.post('/', grupoGastoController.createGrupoGasto);
router.post('/:id/movimiento', grupoGastoController.addMovimiento);
router.post('/:id/cerrar', grupoGastoController.cerrarGrupo);
router.get('/', grupoGastoController.listarGrupos);
router.get('/:id', grupoGastoController.getGrupo);

// Eliminar grupo de gasto
router.delete('/:id', grupoGastoController.deleteGrupoGasto);
router.put('/:id', grupoGastoController.updateGrupoGasto);

module.exports = router;
