require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/database');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Permitir peticiones desde el frontend
app.use(express.json()); // Parsear JSON en el body

// Importar rutas
const authRoutes = require('./routes/auth');
const gastosRoutes = require('./routes/gastos');
const ingresosRoutes = require('./routes/ingresos');
const gastosAutomaticosRoutes = require('./routes/gastos_automaticos');
const ingresosAutomaticosRoutes = require('./routes/ingresos_automaticos');
const deudasRoutes = require('./routes/deudas');
const prestamosRoutes = require('./routes/prestamos');
const patrimonioRoutes = require('./routes/patrimonio');
const configuracionRoutes = require('./routes/configuracion');
const ahorrosRoutes = require('./routes/ahorros');
const custodiaRoutes = require('./routes/custodia');
const auditoriaRoutes = require('./routes/auditoria');
const configuracionCuentasRoutes = require('./routes/configuracion_cuentas');
const cashflowIngresosRoutes = require('./routes/cashflow_ingresos');
const cashflowGastosRoutes = require('./routes/cashflow_gastos');
const grupoGastosRoutes = require('./routes/grupo_gastos');
const grupoIngresosRoutes = require('./routes/grupo_ingresos');

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/gastos', gastosRoutes);
app.use('/api/ingresos', ingresosRoutes);
app.use('/api/gastos_automaticos', gastosAutomaticosRoutes);
app.use('/api/ingresos_automaticos', ingresosAutomaticosRoutes);
app.use('/api/deudas', deudasRoutes);
app.use('/api/prestamos', prestamosRoutes);
app.use('/api/patrimonio', patrimonioRoutes);
app.use('/api/configuracion', configuracionRoutes);
app.use('/api/ahorros', ahorrosRoutes);
app.use('/api/custodias', custodiaRoutes);
app.use('/api/auditorias', auditoriaRoutes);
app.use('/api/configuracion_cuentas', configuracionCuentasRoutes);
app.use('/api/cashflow_ingresos', cashflowIngresosRoutes);
app.use('/api/cashflow_gastos', cashflowGastosRoutes);
app.use('/api/grupo_gastos', grupoGastosRoutes);
app.use('/api/grupo_ingresos', grupoIngresosRoutes);

// Ruta de health check para verificar conexión
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: '💰 API de Finanzas Personales',
    version: '1.0.0',
    status: 'OK'
  });
});

// Iniciar servidor
async function startServer() {
  try {
    // Conectar a MongoDB
    const db = await connectDB();
    
    // Hacer la base de datos disponible en todas las rutas
    app.locals.db = db;
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`\n🚀 Servidor backend corriendo en http://localhost:${PORT}`);
      console.log(`📊 API disponible en http://localhost:${PORT}/api`);
      console.log(`\nPresiona Ctrl+C para detener el servidor\n`);
    });
  } catch (error) {
    console.error('✗ Error iniciando el servidor:', error);
    process.exit(1);
  }
}

// Manejar cierre del servidor
process.on('SIGINT', async () => {
  console.log('\n\nCerrando servidor...');
  process.exit(0);
});

// Iniciar
startServer();
