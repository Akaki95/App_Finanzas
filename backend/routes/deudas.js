const express = require('express');
const router = express.Router();
const { getDB } = require('../config/database');

const COLLECTION = 'deudas';

// GET /api/deudas
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const deudas = await db.collection(COLLECTION).find({}).toArray();
    res.json({ success: true, data: deudas });
  } catch (error) {
    console.error('Error obteniendo deudas:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/deudas/:id
router.get('/:id', async (req, res) => {
  try {
    const db = getDB();
    const deuda = await db.collection(COLLECTION).findOne({ id: req.params.id });
    
    if (!deuda) {
      return res.status(404).json({ success: false, error: 'Deuda no encontrada' });
    }
    
    res.json({ success: true, data: deuda });
  } catch (error) {
    console.error('Error obteniendo deuda:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/deudas
router.post('/', async (req, res) => {
  try {
    const db = getDB();
    const nuevaDeuda = {
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    const result = await db.collection(COLLECTION).insertOne(nuevaDeuda);
    
    res.status(201).json({ 
      success: true, 
      data: nuevaDeuda,
      insertedId: result.insertedId 
    });
  } catch (error) {
    console.error('Error creando deuda:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/deudas/:id
router.put('/:id', async (req, res) => {
  try {
    const db = getDB();
    const { id, createdAt, ...updateData } = req.body;
    
    updateData.updatedAt = new Date().toISOString();
    
    const result = await db.collection(COLLECTION).updateOne(
      { id: req.params.id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, error: 'Deuda no encontrada' });
    }
    
    res.json({ success: true, data: { id: req.params.id, ...updateData } });
  } catch (error) {
    console.error('Error actualizando deuda:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/deudas/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection(COLLECTION).deleteOne({ id: req.params.id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Deuda no encontrada' });
    }
    
    res.json({ success: true, message: 'Deuda eliminada correctamente' });
  } catch (error) {
    console.error('Error eliminando deuda:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/deudas/:id/pagar - Registrar pago
router.post('/:id/pagar', async (req, res) => {
  try {
    const db = getDB();
    const { monto } = req.body;
    
    const deuda = await db.collection(COLLECTION).findOne({ id: req.params.id });
    
    if (!deuda) {
      return res.status(404).json({ success: false, error: 'Deuda no encontrada' });
    }
    
    const nuevoMontoActual = deuda.montoActual - parseFloat(monto);
    const nuevoPagado = deuda.montoPagado + parseFloat(monto);
    
    await db.collection(COLLECTION).updateOne(
      { id: req.params.id },
      { 
        $set: { 
          montoActual: nuevoMontoActual,
          montoPagado: nuevoPagado,
          updatedAt: new Date().toISOString()
        }
      }
    );
    
    res.json({ success: true, message: 'Pago registrado correctamente' });
  } catch (error) {
    console.error('Error registrando pago:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
