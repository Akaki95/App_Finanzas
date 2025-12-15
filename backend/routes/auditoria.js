const express = require('express');
const router = express.Router();

// GET /api/auditorias - Obtener todas las auditorías
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const auditorias = await db.collection('auditorias')
      .find({})
      .sort({ fecha: -1 })
      .toArray();
    
    res.json(auditorias);
  } catch (error) {
    console.error('Error al obtener auditorías:', error);
    res.status(500).json({ 
      error: 'Error al obtener auditorías',
      message: error.message 
    });
  }
});

// GET /api/auditorias/estadisticas - Obtener estadísticas
router.get('/estadisticas', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const auditorias = await db.collection('auditorias').find({}).toArray();
    
    if (auditorias.length === 0) {
      return res.json({
        total: 0,
        cuadradas: 0,
        noCuadradas: 0,
        porcentajeCuadradas: 0,
        ultimaAuditoria: null
      });
    }
    
    const cuadradas = auditorias.filter(a => a.cuadra).length;
    const noCuadradas = auditorias.length - cuadradas;
    
    res.json({
      total: auditorias.length,
      cuadradas: cuadradas,
      noCuadradas: noCuadradas,
      porcentajeCuadradas: (cuadradas / auditorias.length) * 100,
      ultimaAuditoria: auditorias[0]
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de auditorías:', error);
    res.status(500).json({ 
      error: 'Error al obtener estadísticas de auditorías',
      message: error.message 
    });
  }
});

// GET /api/auditorias/:id - Obtener auditoría por ID
router.get('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { ObjectId } = require('mongodb');
    const auditoria = await db.collection('auditorias').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!auditoria) {
      return res.status(404).json({ error: 'Auditoría no encontrada' });
    }
    
    res.json(auditoria);
  } catch (error) {
    console.error('Error al obtener auditoría:', error);
    res.status(500).json({ 
      error: 'Error al obtener auditoría',
      message: error.message 
    });
  }
});

// POST /api/auditorias - Crear nueva auditoría
router.post('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { cuentas, totalCuentas, balanceMes, diferencia, cuadra, notas, fecha } = req.body;
    
    // Validaciones
    if (!cuentas || cuentas.length === 0) {
      return res.status(400).json({ 
        error: 'Debe agregar al menos una cuenta' 
      });
    }
    
    const auditoria = {
      fecha: fecha || new Date().toISOString(),
      cuentas: cuentas,
      totalCuentas: parseFloat(totalCuentas),
      balanceMes: parseFloat(balanceMes),
      diferencia: parseFloat(diferencia),
      cuadra: cuadra,
      notas: notas || '',
      createdAt: new Date().toISOString()
    };
    
    const result = await db.collection('auditorias').insertOne(auditoria);
    auditoria._id = result.insertedId;
    
    res.status(201).json(auditoria);
  } catch (error) {
    console.error('Error al crear auditoría:', error);
    res.status(500).json({ 
      error: 'Error al crear auditoría',
      message: error.message 
    });
  }
});

// DELETE /api/auditorias/:id - Eliminar auditoría
router.delete('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { ObjectId } = require('mongodb');
    
    const result = await db.collection('auditorias').deleteOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Auditoría no encontrada' });
    }
    
    res.json({ message: 'Auditoría eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar auditoría:', error);
    res.status(500).json({ 
      error: 'Error al eliminar auditoría',
      message: error.message 
    });
  }
});

// POST /api/auditorias/sync - Sincronizar todas las auditorías (reemplazar colección completa)
router.post('/sync', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const auditorias = req.body;
    
    if (!Array.isArray(auditorias)) {
      return res.status(400).json({ error: 'Se esperaba un array de auditorías' });
    }
    
    // Eliminar todas las auditorías existentes
    await db.collection('auditorias').deleteMany({});
    
    // Insertar las nuevas auditorías si hay alguna
    if (auditorias.length > 0) {
      await db.collection('auditorias').insertMany(auditorias);
    }
    
    res.json({ 
      message: 'Auditorías sincronizadas correctamente',
      count: auditorias.length 
    });
  } catch (error) {
    console.error('Error al sincronizar auditorías:', error);
    res.status(500).json({ 
      error: 'Error al sincronizar auditorías',
      message: error.message 
    });
  }
});

module.exports = router;
