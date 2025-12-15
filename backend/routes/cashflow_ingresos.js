// Rutas API para Ingresos Pasivos (Cashflow)
const express = require('express');
const router = express.Router();
const { getDB } = require('../config/database');

// GET /api/cashflow_ingresos - Obtener todos los ingresos pasivos
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const ingresos = await db.collection('cashflow_ingresos').find({}).toArray();
    res.json(ingresos);
  } catch (error) {
    console.error('Error obteniendo ingresos pasivos:', error);
    res.status(500).json({ error: 'Error al obtener ingresos pasivos' });
  }
});

// POST /api/cashflow_ingresos - Crear un nuevo ingreso pasivo
router.post('/', async (req, res) => {
  try {
    const db = getDB();
    const nuevoIngreso = {
      ...req.body,
      createdAt: new Date()
    };
    
    const resultado = await db.collection('cashflow_ingresos').insertOne(nuevoIngreso);
    
    res.status(201).json({
      _id: resultado.insertedId,
      ...nuevoIngreso
    });
  } catch (error) {
    console.error('Error creando ingreso pasivo:', error);
    res.status(500).json({ error: 'Error al crear ingreso pasivo' });
  }
});

// PUT /api/cashflow_ingresos/:id - Actualizar un ingreso pasivo
router.put('/:id', async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const db = getDB();
    const { id, createdAt, _id, ...updateData } = req.body;
    
    // Determinar el tipo de query según el ID
    let query;
    if (ObjectId.isValid(req.params.id) && req.params.id.length === 24) {
      query = { _id: new ObjectId(req.params.id) };
    } else {
      query = { id: req.params.id };
    }
    
    const resultado = await db.collection('cashflow_ingresos').updateOne(
      query,
      { $set: updateData }
    );
    
    if (resultado.matchedCount === 0) {
      return res.status(404).json({ error: 'Ingreso pasivo no encontrado' });
    }
    
    res.json({ message: 'Ingreso pasivo actualizado correctamente' });
  } catch (error) {
    console.error('Error actualizando ingreso pasivo:', error);
    res.status(500).json({ error: 'Error al actualizar ingreso pasivo' });
  }
});

// DELETE /api/cashflow_ingresos/:id - Eliminar un ingreso pasivo
router.delete('/:id', async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const db = getDB();
    
    // Intentar eliminar por _id (ObjectId de MongoDB) o por id personalizado
    let query;
    if (ObjectId.isValid(req.params.id) && req.params.id.length === 24) {
      query = { _id: new ObjectId(req.params.id) };
    } else {
      query = { id: req.params.id };
    }
    
    const resultado = await db.collection('cashflow_ingresos').deleteOne(query);
    
    if (resultado.deletedCount === 0) {
      return res.status(404).json({ error: 'Ingreso pasivo no encontrado' });
    }
    
    res.json({ message: 'Ingreso pasivo eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando ingreso pasivo:', error);
    res.status(500).json({ error: 'Error al eliminar ingreso pasivo' });
  }
});

module.exports = router;
