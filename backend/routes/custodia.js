const express = require('express');
const router = express.Router();

// GET /api/custodias - Obtener todas las custodias
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const custodias = await db.collection('custodias')
      .find({})
      .sort({ fecha: -1 })
      .toArray();
    
    res.json(custodias);
  } catch (error) {
    console.error('Error al obtener custodias:', error);
    res.status(500).json({ 
      error: 'Error al obtener custodias',
      message: error.message 
    });
  }
});

// GET /api/custodias/resumen - Obtener resumen por persona
router.get('/resumen', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const custodias = await db.collection('custodias').find({}).toArray();
    
    // Agrupar por persona
    const personas = {};
    
    custodias.forEach(c => {
      if (!personas[c.persona]) {
        personas[c.persona] = {
          persona: c.persona,
          depositos: 0,
          retiros: 0,
          saldo: 0,
          movimientos: 0
        };
      }
      
      personas[c.persona].movimientos++;
      
      if (c.tipo === 'deposito') {
        personas[c.persona].depositos += c.monto;
        personas[c.persona].saldo += c.monto;
      } else {
        personas[c.persona].retiros += c.monto;
        personas[c.persona].saldo -= c.monto;
      }
    });
    
    const resumen = Object.values(personas).sort((a, b) => b.saldo - a.saldo);
    res.json(resumen);
  } catch (error) {
    console.error('Error al obtener resumen de custodias:', error);
    res.status(500).json({ 
      error: 'Error al obtener resumen de custodias',
      message: error.message 
    });
  }
});

// GET /api/custodias/persona/:nombre - Obtener movimientos de una persona
router.get('/persona/:nombre', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { nombre } = req.params;
    
    const movimientos = await db.collection('custodias')
      .find({ persona: new RegExp(`^${nombre}$`, 'i') })
      .sort({ fecha: -1 })
      .toArray();
    
    res.json(movimientos);
  } catch (error) {
    console.error('Error al obtener movimientos de persona:', error);
    res.status(500).json({ 
      error: 'Error al obtener movimientos de persona',
      message: error.message 
    });
  }
});

// GET /api/custodias/:id - Obtener custodia por ID
router.get('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { ObjectId } = require('mongodb');
    const custodia = await db.collection('custodias').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!custodia) {
      return res.status(404).json({ error: 'Custodia no encontrada' });
    }
    
    res.json(custodia);
  } catch (error) {
    console.error('Error al obtener custodia:', error);
    res.status(500).json({ 
      error: 'Error al obtener custodia',
      message: error.message 
    });
  }
});

// POST /api/custodias - Crear nueva custodia
router.post('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { persona, monto, tipo, fecha, descripcion } = req.body;
    
    // Validaciones
    if (!persona || !monto || !tipo || !fecha) {
      return res.status(400).json({ 
        error: 'Persona, monto, tipo y fecha son requeridos' 
      });
    }
    
    if (monto <= 0) {
      return res.status(400).json({ 
        error: 'El monto debe ser mayor a 0' 
      });
    }
    
    if (!['deposito', 'retiro'].includes(tipo)) {
      return res.status(400).json({ 
        error: 'El tipo debe ser "deposito" o "retiro"' 
      });
    }
    
    // Si es retiro, verificar saldo disponible
    if (tipo === 'retiro') {
      const movimientos = await db.collection('custodias')
        .find({ persona: new RegExp(`^${persona}$`, 'i') })
        .toArray();
      
      const saldo = movimientos.reduce((acc, m) => {
        return m.tipo === 'deposito' ? acc + m.monto : acc - m.monto;
      }, 0);
      
      if (monto > saldo) {
        return res.status(400).json({ 
          error: `No hay suficiente saldo. Saldo actual: ${saldo.toFixed(2)} €` 
        });
      }
    }
    
    const custodia = {
      persona,
      monto: parseFloat(monto),
      tipo,
      fecha,
      descripcion: descripcion || '',
      createdAt: new Date().toISOString()
    };
    
    const result = await db.collection('custodias').insertOne(custodia);
    custodia._id = result.insertedId;
    
    res.status(201).json(custodia);
  } catch (error) {
    console.error('Error al crear custodia:', error);
    res.status(500).json({ 
      error: 'Error al crear custodia',
      message: error.message 
    });
  }
});

// PUT /api/custodias/:id - Actualizar custodia
router.put('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { ObjectId } = require('mongodb');
    const { persona, monto, tipo, fecha, descripcion } = req.body;
    
    // Validaciones
    if (!persona || !monto || !tipo || !fecha) {
      return res.status(400).json({ 
        error: 'Persona, monto, tipo y fecha son requeridos' 
      });
    }
    
    if (monto <= 0) {
      return res.status(400).json({ 
        error: 'El monto debe ser mayor a 0' 
      });
    }
    
    const custodia = {
      persona,
      monto: parseFloat(monto),
      tipo,
      fecha,
      descripcion: descripcion || '',
      updatedAt: new Date().toISOString()
    };
    
    const result = await db.collection('custodias').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: custodia }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Custodia no encontrada' });
    }
    
    res.json({ ...custodia, _id: req.params.id });
  } catch (error) {
    console.error('Error al actualizar custodia:', error);
    res.status(500).json({ 
      error: 'Error al actualizar custodia',
      message: error.message 
    });
  }
});

// DELETE /api/custodias/:id - Eliminar custodia
router.delete('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { ObjectId } = require('mongodb');
    
    const result = await db.collection('custodias').deleteOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Custodia no encontrada' });
    }
    
    res.json({ message: 'Custodia eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar custodia:', error);
    res.status(500).json({ 
      error: 'Error al eliminar custodia',
      message: error.message 
    });
  }
});

module.exports = router;
