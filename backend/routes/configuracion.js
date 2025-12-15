const express = require('express');
const router = express.Router();
const { getDB } = require('../config/database');
const { ObjectId } = require('mongodb');

// GET /api/configuracion - Obtener todas las configuraciones
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const configuraciones = await db.collection('configuraciones').find({}).toArray();
    res.json(configuraciones);
  } catch (error) {
    console.error('Error obteniendo configuraciones:', error);
    res.status(500).json({ error: 'Error obteniendo configuraciones' });
  }
});

// GET /api/configuracion/:modulo - Obtener configuración de un módulo
router.get('/:modulo', async (req, res) => {
  try {
    const { modulo } = req.params;
    const db = getDB();
    
    const configuracion = await db.collection('configuraciones').findOne({ modulo });
    
    if (!configuracion) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }
    
    res.json(configuracion);
  } catch (error) {
    console.error('Error obteniendo configuración:', error);
    res.status(500).json({ error: 'Error obteniendo configuración' });
  }
});

// PUT /api/configuracion/:modulo - Crear o actualizar configuración de un módulo
router.put('/:modulo', async (req, res) => {
  try {
    const { modulo } = req.params;
    const { campos, categorias, fechaModificacion } = req.body;
    
    if (!campos || !Array.isArray(campos)) {
      return res.status(400).json({ error: 'Campos inválidos' });
    }
    
    const db = getDB();
    
    const configuracion = {
      modulo,
      campos,
      fechaModificacion: fechaModificacion || new Date().toISOString(),
      usuarioId: 'user_default' // Por ahora un usuario único
    };
    
    // Incluir categorías si están presentes (para patrimonio)
    if (categorias && Array.isArray(categorias)) {
      configuracion.categorias = categorias;
    }
    
    // Upsert: actualizar si existe, crear si no existe
    const result = await db.collection('configuraciones').updateOne(
      { modulo },
      { $set: configuracion },
      { upsert: true }
    );
    
    console.log(`Configuración de ${modulo} guardada${categorias ? ' (con categorías)' : ''}`);
    res.json({ 
      success: true, 
      modulo,
      upserted: result.upsertedCount > 0,
      modified: result.modifiedCount > 0
    });
  } catch (error) {
    console.error('Error guardando configuración:', error);
    res.status(500).json({ error: 'Error guardando configuración' });
  }
});

// DELETE /api/configuracion/:modulo - Eliminar configuración de un módulo
router.delete('/:modulo', async (req, res) => {
  try {
    const { modulo } = req.params;
    const db = getDB();
    
    const result = await db.collection('configuraciones').deleteOne({ modulo });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }
    
    console.log(`Configuración de ${modulo} eliminada`);
    res.json({ success: true, modulo });
  } catch (error) {
    console.error('Error eliminando configuración:', error);
    res.status(500).json({ error: 'Error eliminando configuración' });
  }
});

module.exports = router;
