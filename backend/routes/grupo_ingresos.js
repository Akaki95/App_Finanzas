const express = require('express');
const router = express.Router();
const grupoIngresoController = require('../controllers/grupoIngresoController');

router.post('/', grupoIngresoController.createGrupoIngreso);
router.post('/:id/movimiento', grupoIngresoController.addMovimiento);
router.post('/:id/cerrar', grupoIngresoController.cerrarGrupo);
router.get('/', grupoIngresoController.listarGrupos);
router.get('/:id', grupoIngresoController.getGrupo);

// Eliminar grupo de ingreso
router.delete('/:id', grupoIngresoController.deleteGrupoIngreso);
router.put('/:id', grupoIngresoController.updateGrupoIngreso);

module.exports = router;
