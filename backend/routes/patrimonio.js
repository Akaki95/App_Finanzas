const express = require('express');
const router = express.Router();
const { getDB } = require('../config/database');

const ACTIVOS_COLLECTION = 'activos';
const PASIVOS_COLLECTION = 'pasivos';

// ===== ACTIVOS =====

// GET /api/patrimonio/activos
router.get('/activos', async (req, res) => {
  try {
    const db = getDB();
    const activos = await db.collection(ACTIVOS_COLLECTION).find({}).toArray();
    res.json({ success: true, data: activos });
  } catch (error) {
    console.error('Error obteniendo activos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/patrimonio/activos/:id
router.get('/activos/:id', async (req, res) => {
  try {
    const db = getDB();
    const activo = await db.collection(ACTIVOS_COLLECTION).findOne({ id: req.params.id });
    
    if (!activo) {
      return res.status(404).json({ success: false, error: 'Activo no encontrado' });
    }
    
    res.json({ success: true, data: activo });
  } catch (error) {
    console.error('Error obteniendo activo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/patrimonio/activos
router.post('/activos', async (req, res) => {
  try {
    const db = getDB();
    const nuevoActivo = {
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    const result = await db.collection(ACTIVOS_COLLECTION).insertOne(nuevoActivo);
    
    res.status(201).json({ 
      success: true, 
      data: nuevoActivo,
      insertedId: result.insertedId 
    });
  } catch (error) {
    console.error('Error creando activo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/patrimonio/activos/:id
router.put('/activos/:id', async (req, res) => {
  try {
    const db = getDB();
    const { _id, id, createdAt, ...updateData } = req.body;
    
    updateData.updatedAt = new Date().toISOString();
    
    const result = await db.collection(ACTIVOS_COLLECTION).updateOne(
      { id: req.params.id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, error: 'Activo no encontrado' });
    }
    
    res.json({ success: true, data: { id: req.params.id, ...updateData } });
  } catch (error) {
    console.error('Error actualizando activo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/patrimonio/activos/:id
router.delete('/activos/:id', async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection(ACTIVOS_COLLECTION).deleteOne({ id: req.params.id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Activo no encontrado' });
    }
    
    res.json({ success: true, message: 'Activo eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando activo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== PASIVOS =====

// GET /api/patrimonio/pasivos
router.get('/pasivos', async (req, res) => {
  try {
    const db = getDB();
    const pasivos = await db.collection(PASIVOS_COLLECTION).find({}).toArray();
    res.json({ success: true, data: pasivos });
  } catch (error) {
    console.error('Error obteniendo pasivos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/patrimonio/pasivos/:id
router.get('/pasivos/:id', async (req, res) => {
  try {
    const db = getDB();
    const pasivo = await db.collection(PASIVOS_COLLECTION).findOne({ id: req.params.id });
    
    if (!pasivo) {
      return res.status(404).json({ success: false, error: 'Pasivo no encontrado' });
    }
    
    res.json({ success: true, data: pasivo });
  } catch (error) {
    console.error('Error obteniendo pasivo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/patrimonio/pasivos
router.post('/pasivos', async (req, res) => {
  try {
    const db = getDB();
    const nuevoPasivo = {
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    const result = await db.collection(PASIVOS_COLLECTION).insertOne(nuevoPasivo);
    
    res.status(201).json({ 
      success: true, 
      data: nuevoPasivo,
      insertedId: result.insertedId 
    });
  } catch (error) {
    console.error('Error creando pasivo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/patrimonio/pasivos/:id
router.put('/pasivos/:id', async (req, res) => {
  try {
    const db = getDB();
    const { _id, id, createdAt, ...updateData } = req.body;
    
    updateData.updatedAt = new Date().toISOString();
    
    const result = await db.collection(PASIVOS_COLLECTION).updateOne(
      { id: req.params.id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, error: 'Pasivo no encontrado' });
    }
    
    res.json({ success: true, data: { id: req.params.id, ...updateData } });
  } catch (error) {
    console.error('Error actualizando pasivo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/patrimonio/pasivos/:id
router.delete('/pasivos/:id', async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection(PASIVOS_COLLECTION).deleteOne({ id: req.params.id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Pasivo no encontrado' });
    }
    
    res.json({ success: true, message: 'Pasivo eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando pasivo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
