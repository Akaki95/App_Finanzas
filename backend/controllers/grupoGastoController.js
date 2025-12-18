// Eliminar grupo de gasto (DELETE /:id)
exports.deleteGrupoGasto = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await GrupoGasto.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'No encontrado' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Actualizar grupo de gasto (PUT /:id)
exports.updateGrupoGasto = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    // Evitar que se cambie el _id
    delete update._id;
    const grupo = await GrupoGasto.findByIdAndUpdate(id, update, { new: true });
    if (!grupo) return res.status(404).json({ error: 'No encontrado' });
    res.json(grupo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const GrupoGasto = require('../models/grupoGasto');

// Crear un nuevo grupo de gasto
exports.createGrupoGasto = async (req, res) => {
  try {
    const { nombre, fechaCreacion, categoria, descripcion } = req.body;
    const grupo = new GrupoGasto({
      nombre,
      fechaCreacion: fechaCreacion ? new Date(fechaCreacion) : new Date(),
      categoria,
      descripcion,
      movimientos: [],
      estado: 'abierto',
      total: 0
    });
    await grupo.save();
    res.status(201).json(grupo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Añadir movimiento a grupo de gasto
exports.addMovimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, monto, descripcion } = req.body;
    const grupo = await GrupoGasto.findById(id);
    if (!grupo || grupo.estado === 'cerrado') {
      return res.status(400).json({ error: 'Grupo no encontrado o cerrado' });
    }
    grupo.movimientos.push({ fecha: fecha ? new Date(fecha) : new Date(), monto, descripcion });
    grupo.total += monto;
    await grupo.save();
    res.json(grupo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cerrar grupo de gasto
exports.cerrarGrupo = async (req, res) => {
  try {
    const { id } = req.params;
    const grupo = await GrupoGasto.findById(id);
    if (!grupo || grupo.estado === 'cerrado') {
      return res.status(400).json({ error: 'Grupo no encontrado o ya cerrado' });
    }
    grupo.estado = 'cerrado';
    grupo.fechaCierre = new Date();
    await grupo.save();
    // Aquí se debe crear el gasto resumen en la colección de gastos principal (pendiente)
    res.json(grupo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Listar grupos de gasto (más recientes primero)
exports.listarGrupos = async (req, res) => {
  try {
    const grupos = await GrupoGasto.find().sort({ fechaCreacion: -1 });
    // Mapear _id a id para compatibilidad frontend
    const gruposConId = grupos.map(g => ({
      ...g.toObject(),
      id: g._id.toString()
    }));
    res.json(gruposConId);
  } catch (err) {
    console.error('Error en listarGrupos (grupoGastoController):', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
};

// Obtener grupo de gasto por ID
exports.getGrupo = async (req, res) => {
  try {
    const grupo = await GrupoGasto.findById(req.params.id);
    if (!grupo) return res.status(404).json({ error: 'No encontrado' });
    res.json(grupo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
