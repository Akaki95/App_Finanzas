const express = require('express');
const router = express.Router();
const { getDB } = require('../config/database');

const COLLECTION = 'prestamos';

// GET /api/prestamos
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const prestamos = await db.collection(COLLECTION).find({}).toArray();
    res.json({ success: true, data: prestamos });
  } catch (error) {
    console.error('Error obteniendo préstamos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/prestamos/:id
router.get('/:id', async (req, res) => {
  try {
    const db = getDB();
    const prestamo = await db.collection(COLLECTION).findOne({ id: req.params.id });
    
    if (!prestamo) {
      return res.status(404).json({ success: false, error: 'Préstamo no encontrado' });
    }
    
    res.json({ success: true, data: prestamo });
  } catch (error) {
    console.error('Error obteniendo préstamo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/prestamos
router.post('/', async (req, res) => {
  try {
    const db = getDB();
    const nuevoPrestamo = {
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    const result = await db.collection(COLLECTION).insertOne(nuevoPrestamo);
    
    res.status(201).json({ 
      success: true, 
      data: nuevoPrestamo,
      insertedId: result.insertedId 
    });
  } catch (error) {
    console.error('Error creando préstamo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/prestamos/:id
router.put('/:id', async (req, res) => {
  try {
    const db = getDB();
    const { id, createdAt, _id, ...updateData } = req.body;
    
    updateData.updatedAt = new Date().toISOString();
    
    const result = await db.collection(COLLECTION).updateOne(
      { id: req.params.id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, error: 'Préstamo no encontrado' });
    }
    
    res.json({ success: true, data: { id: req.params.id, ...updateData } });
  } catch (error) {
    console.error('Error actualizando préstamo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/prestamos/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection(COLLECTION).deleteOne({ id: req.params.id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Préstamo no encontrado' });
    }
    
    res.json({ success: true, message: 'Préstamo eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando préstamo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/prestamos/:id/cobrar - Registrar cobro
router.post('/:id/cobrar', async (req, res) => {
  try {
    const db = getDB();
    const { monto } = req.body;
    
    const prestamo = await db.collection(COLLECTION).findOne({ id: req.params.id });
    
    if (!prestamo) {
      return res.status(404).json({ success: false, error: 'Préstamo no encontrado' });
    }
    
    const nuevoMontoActual = prestamo.montoActual - parseFloat(monto);
    const nuevoCobrado = prestamo.montoCobrado + parseFloat(monto);
    
    await db.collection(COLLECTION).updateOne(
      { id: req.params.id },
      { 
        $set: { 
          montoActual: nuevoMontoActual,
          montoCobrado: nuevoCobrado,
          updatedAt: new Date().toISOString()
        }
      }
    );
    
    res.json({ success: true, message: 'Cobro registrado correctamente' });
  } catch (error) {
    console.error('Error registrando cobro:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
