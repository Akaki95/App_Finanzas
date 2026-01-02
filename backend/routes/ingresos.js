const express = require('express');
const router = express.Router();
const { getDB } = require('../config/database');

const COLLECTION = 'ingresos';

// GET /api/ingresos - Obtener todos los ingresos
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const ingresos = await db.collection(COLLECTION).find({}).toArray();
    res.json({ success: true, data: ingresos });
  } catch (error) {
    console.error('Error obteniendo ingresos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/ingresos/:id - Obtener un ingreso por ID
router.get('/:id', async (req, res) => {
  try {
    const db = getDB();
    const ingreso = await db.collection(COLLECTION).findOne({ id: req.params.id });
    
    if (!ingreso) {
      return res.status(404).json({ success: false, error: 'Ingreso no encontrado' });
    }
    
    res.json({ success: true, data: ingreso });
  } catch (error) {
    console.error('Error obteniendo ingreso:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/ingresos - Crear un nuevo ingreso
router.post('/', async (req, res) => {
  try {
    const db = getDB();
    const nuevoIngreso = {
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    const result = await db.collection(COLLECTION).insertOne(nuevoIngreso);
    
    res.status(201).json({ 
      success: true, 
      data: nuevoIngreso,
      insertedId: result.insertedId 
    });
  } catch (error) {
    console.error('Error creando ingreso:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/ingresos/:id - Actualizar un ingreso
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
      return res.status(404).json({ success: false, error: 'Ingreso no encontrado' });
    }
    
    res.json({ success: true, data: { id: req.params.id, ...updateData } });
  } catch (error) {
    console.error('Error actualizando ingreso:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/ingresos/:id - Eliminar un ingreso
router.delete('/:id', async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection(COLLECTION).deleteOne({ id: req.params.id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Ingreso no encontrado' });
    }
    
    res.json({ success: true, message: 'Ingreso eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando ingreso:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
