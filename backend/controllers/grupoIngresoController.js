// Eliminar grupo de ingreso (DELETE /:id)
exports.deleteGrupoIngreso = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await GrupoIngreso.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'No encontrado' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Actualizar grupo de ingreso (PUT /:id)
exports.updateGrupoIngreso = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    // Evitar que se cambie el _id
    delete update._id;
    const grupo = await GrupoIngreso.findByIdAndUpdate(id, update, { new: true });
    if (!grupo) return res.status(404).json({ error: 'No encontrado' });
    res.json(grupo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const GrupoIngreso = require('../models/grupoIngreso');

// Crear un nuevo grupo de ingreso
exports.createGrupoIngreso = async (req, res) => {
  try {
    const { nombre, fechaCreacion, categoria, descripcion } = req.body;
    const grupo = new GrupoIngreso({
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

// Añadir movimiento a grupo de ingreso
exports.addMovimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, monto, descripcion } = req.body;
    const grupo = await GrupoIngreso.findById(id);
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

// Cerrar grupo de ingreso
exports.cerrarGrupo = async (req, res) => {
  try {
    const { id } = req.params;
    const grupo = await GrupoIngreso.findById(id);
    if (!grupo || grupo.estado === 'cerrado') {
      return res.status(400).json({ error: 'Grupo no encontrado o ya cerrado' });
    }
    grupo.estado = 'cerrado';
    grupo.fechaCierre = new Date();
    await grupo.save();
    // Aquí se debe crear el ingreso resumen en la colección de ingresos principal (pendiente)
    res.json(grupo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Listar grupos de ingreso (más recientes primero)
exports.listarGrupos = async (req, res) => {
  try {
    const grupos = await GrupoIngreso.find().sort({ fechaCreacion: -1 });
    // Mapear _id a id para compatibilidad frontend
    const gruposConId = grupos.map(g => ({
      ...g.toObject(),
      id: g._id.toString()
    }));
    res.json(gruposConId);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener grupo de ingreso por ID
exports.getGrupo = async (req, res) => {
  try {
    const grupo = await GrupoIngreso.findById(req.params.id);
    if (!grupo) return res.status(404).json({ error: 'No encontrado' });
    res.json(grupo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
