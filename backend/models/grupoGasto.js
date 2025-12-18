const mongoose = require('mongoose');

const GrupoMovimientoSchema = new mongoose.Schema({
  fecha: { type: Date, required: true },
  monto: { type: Number, required: true },
  descripcion: { type: String, required: true }
});

const GrupoGastoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  fechaCreacion: { type: Date, required: true },
  categoria: { type: String, required: true },
  descripcion: { type: String },
  movimientos: [GrupoMovimientoSchema],
  estado: { type: String, enum: ['abierto', 'cerrado'], default: 'abierto' },
  fechaCierre: { type: Date },
  total: { type: Number, default: 0 }
}, { collection: 'grupo_gastos' }); // Especificar nombre explícito de colección

module.exports = mongoose.model('GrupoGasto', GrupoGastoSchema);