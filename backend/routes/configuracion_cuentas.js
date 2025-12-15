// Rutas para configuración de cuentas de auditoría
const express = require('express');
const router = express.Router();

// Obtener configuración de cuentas
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const collection = db.collection('configuracion_cuentas');
    const cuentas = await collection.find({}).sort({ orden: 1 }).toArray();
    res.json(cuentas);
  } catch (error) {
    console.error('Error al obtener configuración de cuentas:', error);
    res.status(500).json({ error: 'Error al obtener configuración de cuentas' });
  }
});

// Sincronizar configuración completa
router.post('/sync', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const collection = db.collection('configuracion_cuentas');
    const cuentas = req.body;

    // Eliminar todas las cuentas existentes
    await collection.deleteMany({});

    // Insertar las nuevas cuentas
    if (cuentas && cuentas.length > 0) {
      await collection.insertMany(cuentas);
    }

    res.json({ success: true, count: cuentas.length });
  } catch (error) {
    console.error('Error al sincronizar configuración de cuentas:', error);
    res.status(500).json({ error: 'Error al sincronizar configuración de cuentas' });
  }
});

module.exports = router;
