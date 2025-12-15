const express = require('express');
const router = express.Router();

// Modelo de Ahorros (calculado desde gastos e ingresos)
// Este endpoint es de solo lectura - calcula ahorros dinámicamente

// GET /api/ahorros - Obtener todos los movimientos de ahorro
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    // Obtener gastos con categoría "Ahorro"
    const gastosAhorro = await db.collection('gastos')
      .find({ categoria: /^ahorro$/i })
      .toArray();
    
    // Obtener ingresos con tipo "Ahorro"
    const ingresosAhorro = await db.collection('ingresos')
      .find({ tipo: /^ahorro$/i })
      .toArray();
    
    // Transformar gastos en entradas de ahorro
    const entradas = gastosAhorro.map(g => ({
      _id: g._id,
      fecha: g.fecha,
      monto: g.monto,
      descripcion: g.descripcion,
      tipo: 'entrada',
      origen: 'gasto',
      createdAt: g.createdAt
    }));
    
    // Transformar ingresos en salidas de ahorro
    const salidas = ingresosAhorro.map(i => ({
      _id: i._id,
      fecha: i.fecha,
      monto: -i.monto, // Negativo porque sale de los ahorros
      descripcion: i.descripcion,
      tipo: 'salida',
      origen: 'ingreso',
      createdAt: i.createdAt
    }));
    
    // Combinar y ordenar por fecha descendente
    const ahorros = [...entradas, ...salidas]
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    res.json(ahorros);
  } catch (error) {
    console.error('Error al obtener ahorros:', error);
    res.status(500).json({ 
      error: 'Error al obtener ahorros',
      message: error.message 
    });
  }
});

// GET /api/ahorros/estadisticas - Obtener estadísticas de ahorros
router.get('/estadisticas', async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    // Obtener gastos con categoría "Ahorro"
    const gastosAhorro = await db.collection('gastos')
      .find({ categoria: /^ahorro$/i })
      .toArray();
    
    // Obtener ingresos con tipo "Ahorro"
    const ingresosAhorro = await db.collection('ingresos')
      .find({ tipo: /^ahorro$/i })
      .toArray();
    
    // Calcular totales
    const totalEntradas = gastosAhorro.reduce((sum, g) => sum + g.monto, 0);
    const totalSalidas = ingresosAhorro.reduce((sum, i) => sum + i.monto, 0);
    const totalAcumulado = totalEntradas - totalSalidas;
    
    // Calcular promedio mensual
    const todasFechas = [...gastosAhorro, ...ingresosAhorro]
      .map(item => new Date(item.fecha))
      .filter(fecha => !isNaN(fecha));
    
    let promedioMensual = 0;
    if (todasFechas.length > 0) {
      const fechaMinima = new Date(Math.min(...todasFechas));
      const fechaMaxima = new Date(Math.max(...todasFechas));
      const mesesTranscurridos = Math.max(1, 
        (fechaMaxima.getFullYear() - fechaMinima.getFullYear()) * 12 + 
        (fechaMaxima.getMonth() - fechaMinima.getMonth()) + 1
      );
      promedioMensual = totalEntradas / mesesTranscurridos;
    }
    
    res.json({
      totalAcumulado,
      totalEntradas,
      totalSalidas,
      promedioMensual,
      cantidadMovimientos: gastosAhorro.length + ingresosAhorro.length
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de ahorros:', error);
    res.status(500).json({ 
      error: 'Error al obtener estadísticas de ahorros',
      message: error.message 
    });
  }
});

// GET /api/ahorros/resumen-mensual - Obtener resumen mensual
router.get('/resumen-mensual', async (req, res) => {
  try {
    const { mes, anio } = req.query;
    
    if (!mes || !anio) {
      return res.status(400).json({ 
        error: 'Parámetros requeridos: mes (0-11) y anio' 
      });
    }
    
    const db = req.app.locals.db;
    const mesInt = parseInt(mes);
    const anioInt = parseInt(anio);
    
    // Calcular rango de fechas
    const fechaInicio = new Date(anioInt, mesInt, 1);
    const fechaFin = new Date(anioInt, mesInt + 1, 0);
    
    // Obtener gastos del mes con categoría "Ahorro"
    const gastosAhorro = await db.collection('gastos')
      .find({ 
        categoria: /^ahorro$/i,
        fecha: { $gte: fechaInicio.toISOString(), $lte: fechaFin.toISOString() }
      })
      .toArray();
    
    // Obtener ingresos del mes con tipo "Ahorro"
    const ingresosAhorro = await db.collection('ingresos')
      .find({ 
        tipo: /^ahorro$/i,
        fecha: { $gte: fechaInicio.toISOString(), $lte: fechaFin.toISOString() }
      })
      .toArray();
    
    const entradas = gastosAhorro.reduce((sum, g) => sum + g.monto, 0);
    const salidas = ingresosAhorro.reduce((sum, i) => sum + i.monto, 0);
    
    res.json({
      mes: mesInt,
      anio: anioInt,
      entradas,
      salidas,
      neto: entradas - salidas,
      movimientos: gastosAhorro.length + ingresosAhorro.length
    });
  } catch (error) {
    console.error('Error al obtener resumen mensual de ahorros:', error);
    res.status(500).json({ 
      error: 'Error al obtener resumen mensual de ahorros',
      message: error.message 
    });
  }
});

module.exports = router;
