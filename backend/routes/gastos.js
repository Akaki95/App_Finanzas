const express = require('express');
const router = express.Router();
const { getDB } = require('../config/database');

const COLLECTION = 'gastos';

// GET /api/gastos - Obtener todos los gastos
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const gastos = await db.collection(COLLECTION).find({}).toArray();
    res.json({ success: true, data: gastos });
  } catch (error) {
    console.error('Error obteniendo gastos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/gastos/:id - Obtener un gasto por ID
router.get('/:id', async (req, res) => {
  try {
    const db = getDB();
    const gasto = await db.collection(COLLECTION).findOne({ id: req.params.id });
    
    if (!gasto) {
      return res.status(404).json({ success: false, error: 'Gasto no encontrado' });
    }
    
    res.json({ success: true, data: gasto });
  } catch (error) {
    console.error('Error obteniendo gasto:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/gastos - Crear un nuevo gasto
router.post('/', async (req, res) => {
  try {
    const db = getDB();
    const nuevoGasto = {
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    const result = await db.collection(COLLECTION).insertOne(nuevoGasto);
    
    res.status(201).json({ 
      success: true, 
      data: nuevoGasto,
      insertedId: result.insertedId 
    });
  } catch (error) {
    console.error('Error creando gasto:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/gastos/:id - Actualizar un gasto
router.put('/:id', async (req, res) => {
  try {
    const db = getDB();
    const { _id, id, createdAt, ...updateData } = req.body;
    
    updateData.updatedAt = new Date().toISOString();
    
    const result = await db.collection(COLLECTION).updateOne(
      { id: req.params.id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, error: 'Gasto no encontrado' });
    }
    
    res.json({ success: true, data: { id: req.params.id, ...updateData } });
  } catch (error) {
    console.error('Error actualizando gasto:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/gastos/:id - Eliminar un gasto
router.delete('/:id', async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection(COLLECTION).deleteOne({ id: req.params.id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Gasto no encontrado' });
    }
    
    res.json({ success: true, message: 'Gasto eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando gasto:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
