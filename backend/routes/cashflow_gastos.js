// Rutas API para Gastos Recurrentes (Cashflow)
const express = require('express');
const router = express.Router();
const { getDB } = require('../config/database');

// GET /api/cashflow_gastos - Obtener todos los gastos recurrentes
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const gastos = await db.collection('cashflow_gastos').find({}).toArray();
    res.json(gastos);
  } catch (error) {
    console.error('Error obteniendo gastos recurrentes:', error);
    res.status(500).json({ error: 'Error al obtener gastos recurrentes' });
  }
});

// POST /api/cashflow_gastos - Crear un nuevo gasto recurrente
router.post('/', async (req, res) => {
  try {
    const db = getDB();
    const nuevoGasto = {
      ...req.body,
      createdAt: new Date()
    };
    
    const resultado = await db.collection('cashflow_gastos').insertOne(nuevoGasto);
    
    res.status(201).json({
      _id: resultado.insertedId,
      ...nuevoGasto
    });
  } catch (error) {
    console.error('Error creando gasto recurrente:', error);
    res.status(500).json({ error: 'Error al crear gasto recurrente' });
  }
});

// PUT /api/cashflow_gastos/:id - Actualizar un gasto recurrente
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
    
    const resultado = await db.collection('cashflow_gastos').updateOne(
      query,
      { $set: updateData }
    );
    
    if (resultado.matchedCount === 0) {
      return res.status(404).json({ error: 'Gasto recurrente no encontrado' });
    }
    
    res.json({ message: 'Gasto recurrente actualizado correctamente' });
  } catch (error) {
    console.error('Error actualizando gasto recurrente:', error);
    res.status(500).json({ error: 'Error al actualizar gasto recurrente' });
  }
});

// DELETE /api/cashflow_gastos/:id - Eliminar un gasto recurrente
router.delete('/:id', async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    const db = getDB();
    
    // Intentar eliminar por _id (ObjectId de MongoDB)
    let query;
    if (ObjectId.isValid(req.params.id) && req.params.id.length === 24) {
      query = { _id: new ObjectId(req.params.id) };
    } else {
      // Si no es un ObjectId válido, buscar por el campo 'id' personalizado
      query = { id: req.params.id };
    }
    
    const resultado = await db.collection('cashflow_gastos').deleteOne(query);
    
    if (resultado.deletedCount === 0) {
      return res.status(404).json({ error: 'Gasto recurrente no encontrado' });
    }
    
    res.json({ message: 'Gasto recurrente eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando gasto recurrente:', error);
    res.status(500).json({ error: 'Error al eliminar gasto recurrente' });
  }
});

module.exports = router;
