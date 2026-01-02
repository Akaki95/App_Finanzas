
// Modelo para Grupo de Ingreso (frontend)
  // Modelo para Grupo de Ingreso (frontend)
  const GrupoIngresoModel = {
    eliminar(id) {
      let grupos = this.getAll();
      grupos = grupos.filter(g => g.id !== id);
      CacheService.set(this.collectionName, grupos);
      // Usar _id si existe para sincronizar con backend
      const grupo = this.getById(id);
      const syncId = grupo && grupo._id ? grupo._id : id;
      SyncService.addToQueue({ collection: this.collectionName, action: 'delete', id: syncId });
    },

      // Editar un movimiento existente
  editarMovimiento(grupoId, idx, nuevoMovimiento) {
    const grupos = this.getAll();
    const grupo = grupos.find(g => g.id === grupoId && g.estado === 'abierto');
    if (!grupo) throw new Error('Grupo no encontrado o cerrado');
    if (!grupo.movimientos[idx]) throw new Error('Movimiento no encontrado');
    grupo.total -= grupo.movimientos[idx].monto;
    grupo.movimientos[idx] = { ...grupo.movimientos[idx], ...nuevoMovimiento };
    grupo.total += nuevoMovimiento.monto;
    CacheService.set(this.collectionName, grupos);
    // Usar _id si existe para sincronizar con backend (excluir _id del data)
    const syncId = grupo && grupo._id ? grupo._id : grupoId;
    const { _id, ...updateData } = grupo;
    SyncService.addToQueue({ collection: this.collectionName, action: 'update', id: syncId, data: updateData });
    return grupo;
  },

  // Eliminar un movimiento existente
  eliminarMovimiento(grupoId, idx) {
    const grupos = this.getAll();
    const grupo = grupos.find(g => g.id === grupoId && g.estado === 'abierto');
    if (!grupo) throw new Error('Grupo no encontrado o cerrado');
    if (!grupo.movimientos[idx]) throw new Error('Movimiento no encontrado');
    grupo.total -= grupo.movimientos[idx].monto;
    grupo.movimientos.splice(idx, 1);
    CacheService.set(this.collectionName, grupos);
    // Usar _id si existe para sincronizar con backend (excluir _id del data)
    const syncId = grupo && grupo._id ? grupo._id : grupoId;
    const { _id, ...updateData } = grupo;
    SyncService.addToQueue({ collection: this.collectionName, action: 'update', id: syncId, data: updateData });
    return grupo;
  },
  collectionName: 'grupo_ingresos',

  getAll() {
    // Aceptar tanto 'id' como '_id' para compatibilidad con backend
    const grupos = CacheService.get(this.collectionName) || [];
    return grupos.map(g => ({
      ...g,
      id: g.id || g._id // Si viene de backend, usar _id como id
    }));
  },

  getById(id) {
    return this.getAll().find(g => g.id === id);
  },

  create(grupoData) {
    const grupo = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      nombre: grupoData.nombre,
      fechaCreacion: grupoData.fechaCreacion,
      categoria: grupoData.categoria,
      descripcion: grupoData.descripcion || '',
      movimientos: [],
      estado: 'abierto',
      fechaCierre: null,
      total: 0,
      createdAt: new Date().toISOString()
    };
    const grupos = this.getAll();
    grupos.push(grupo);
    CacheService.set(this.collectionName, grupos);
    SyncService.addToQueue({ collection: this.collectionName, action: 'create', data: grupo });
    return grupo;
  },

  addMovimiento(grupoId, movimiento) {
    const grupos = this.getAll();
    const grupo = grupos.find(g => g.id === grupoId && g.estado === 'abierto');
    if (!grupo) throw new Error('Grupo no encontrado o cerrado');
    grupo.movimientos.push(movimiento);
    grupo.total += movimiento.monto;
    CacheService.set(this.collectionName, grupos);
    // Usar _id si existe para sincronizar con backend
    const syncId = grupo && grupo._id ? grupo._id : grupoId;
    SyncService.addToQueue({ collection: this.collectionName, action: 'update', id: syncId, data: grupo });
    return grupo;
  },

  cerrarGrupo(grupoId) {
    const grupos = this.getAll();
    const grupo = grupos.find(g => g.id === grupoId && g.estado === 'abierto');
    if (!grupo) throw new Error('Grupo no encontrado o ya cerrado');
    grupo.estado = 'cerrado';
    grupo.fechaCierre = new Date().toISOString();
    CacheService.set(this.collectionName, grupos);
    // Usar _id si existe para sincronizar con backend (excluir _id del data)
    const syncId = grupo && grupo._id ? grupo._id : grupoId;
    const { _id, ...updateData } = grupo;
    SyncService.addToQueue({ collection: this.collectionName, action: 'update', id: syncId, data: updateData });
    // Crear ingreso resumen en IngresoModel
    IngresoModel.create({
      fecha: grupo.fechaCierre,
      monto: grupo.total,
      descripcion: `[GRUPO] ${grupo.nombre}: ${grupo.descripcion}`,
      tipo: grupo.categoria,
      esAutomatico: false,
      reglaId: null,
      origenGrupo: true,
      grupoId: grupo._id || grupo.id
    });
    return grupo;
  }
};

window.GrupoIngresoModel = GrupoIngresoModel;
Logger.log('GrupoIngresoModel inicializado');
