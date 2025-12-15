const express = require('express');
const router = express.Router();
const { getDB } = require('../config/database');

const COLLECTION = 'ingresos_automaticos';

// GET /api/ingresos_automaticos - Obtener todas las reglas
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const reglas = await db.collection(COLLECTION).find({}).toArray();
    res.json({ success: true, data: reglas });
  } catch (error) {
    console.error('Error obteniendo reglas automáticas:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/ingresos_automaticos/:id - Obtener una regla por ID
router.get('/:id', async (req, res) => {
  try {
    const db = getDB();
    const { ObjectId } = require('mongodb');
    
    // Buscar por id custom o por _id de MongoDB
    let regla = await db.collection(COLLECTION).findOne({ id: req.params.id });
    
    // Si no se encuentra, intentar con _id de MongoDB
    if (!regla && ObjectId.isValid(req.params.id)) {
      regla = await db.collection(COLLECTION).findOne({ _id: new ObjectId(req.params.id) });
    }
    
    if (!regla) {
      return res.status(404).json({ success: false, error: 'Regla no encontrada' });
    }
    res.json({ success: true, data: regla });
  } catch (error) {
    console.error('Error obteniendo regla automática:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/ingresos_automaticos - Crear nueva regla
router.post('/', async (req, res) => {
  try {
    const db = getDB();
    const nuevaRegla = {
      ...req.body,
      createdAt: new Date().toISOString()
    };
    const result = await db.collection(COLLECTION).insertOne(nuevaRegla);
    res.status(201).json({ success: true, data: nuevaRegla, insertedId: result.insertedId });
  } catch (error) {
    console.error('Error creando regla automática:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/ingresos_automaticos/:id - Actualizar regla
router.put('/:id', async (req, res) => {
  try {
    const db = getDB();
    const { ObjectId } = require('mongodb');
    const { id, createdAt, _id, ...updateData } = req.body;
    updateData.updatedAt = new Date().toISOString();
    
    // Intentar actualizar por id custom
    let result = await db.collection(COLLECTION).updateOne(
      { id: req.params.id },
      { $set: updateData }
    );
    
    // Si no se encuentra, intentar con _id de MongoDB
    if (result.matchedCount === 0 && ObjectId.isValid(req.params.id)) {
      result = await db.collection(COLLECTION).updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { ...updateData, id: req.params.id } }
      );
    }
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, error: 'Regla no encontrada' });
    }
    res.json({ success: true, data: { id: req.params.id, ...updateData } });
  } catch (error) {
    console.error('Error actualizando regla automática:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/ingresos_automaticos/:id - Eliminar regla
router.delete('/:id', async (req, res) => {
  try {
    const db = getDB();
    const { ObjectId } = require('mongodb');
    
    // Intentar eliminar por id custom
    let result = await db.collection(COLLECTION).deleteOne({ id: req.params.id });
    
    // Si no se encuentra, intentar con _id de MongoDB
    if (result.deletedCount === 0 && ObjectId.isValid(req.params.id)) {
      result = await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(req.params.id) });
    }
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Regla no encontrada' });
    }
    res.json({ success: true, message: 'Regla eliminada correctamente' });
  } catch (error) {
    console.error('Error eliminando regla automática:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
