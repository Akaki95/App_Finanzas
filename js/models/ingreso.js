// Modelo de Ingreso
const IngresoModel = {
  collectionName: 'ingresos',
  
  // Obtener todos los ingresos
  getAll() {
    const ingresos = CacheService.get(this.collectionName) || [];
    Logger.log(`${ingresos.length} ingresos cargados`);
    return ingresos;
  },
  
  // Obtener ingreso por ID
  getById(id) {
    const ingresos = this.getAll();
    return ingresos.find(i => i.id === id);
  },
  
  // Crear nuevo ingreso
  create(ingresoData) {
    // Validar datos
    const validation = ValidationService.validarIngreso(ingresoData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    // Crear ingreso
    const ingreso = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      fecha: ingresoData.fecha,
      monto: ValidationService.formatearMonto(ingresoData.monto),
      descripcion: ValidationService.sanitizarTexto(ingresoData.descripcion || ''),
      tipo: ValidationService.sanitizarTexto(ingresoData.tipo),
      esAutomatico: ingresoData.esAutomatico || false,
      reglaId: ingresoData.reglaId || null,
      origenGrupo: ingresoData.origenGrupo || false,
      grupoId: ingresoData.grupoId || null,
      createdAt: new Date().toISOString()
    };
    
    // Guardar en caché
    const ingresos = this.getAll();
    ingresos.push(ingreso);
    CacheService.set(this.collectionName, ingresos);
    
    // Agregar a cola de sincronización
    SyncService.addToQueue({
      collection: this.collectionName,
      action: 'create',
      data: ingreso
    });
    
    Logger.success('Ingreso creado', ingreso);
    return ingreso;
  },
  
  // Actualizar ingreso
  update(id, ingresoData) {
    // Validar datos
    const validation = ValidationService.validarIngreso(ingresoData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    const ingresos = this.getAll();
    const index = ingresos.findIndex(i => i.id === id);
    
    if (index === -1) {
      throw new Error('Ingreso no encontrado');
    }
    
    // Actualizar ingreso
    ingresos[index] = {
      ...ingresos[index],
      fecha: ingresoData.fecha,
      monto: ValidationService.formatearMonto(ingresoData.monto),
      descripcion: ValidationService.sanitizarTexto(ingresoData.descripcion || ''),
      tipo: ValidationService.sanitizarTexto(ingresoData.tipo),
      updatedAt: new Date().toISOString()
    };
    
    CacheService.set(this.collectionName, ingresos);
    
    // Agregar a cola de sincronización (excluir _id)
    const { _id, ...updateData } = ingresos[index];
    SyncService.addToQueue({
      collection: this.collectionName,
      action: 'update',
      id: id,
      data: updateData
    });
    
    Logger.success('Ingreso actualizado', ingresos[index]);
    return ingresos[index];
  },
  
  // Eliminar ingreso
  delete(id) {
    const ingresos = this.getAll();
    const index = ingresos.findIndex(i => i.id === id);
    
    if (index === -1) {
      throw new Error('Ingreso no encontrado');
    }
    
    const deleted = ingresos.splice(index, 1)[0];
    CacheService.set(this.collectionName, ingresos);
    
    // Agregar a cola de sincronización
    SyncService.addToQueue({
      collection: this.collectionName,
      action: 'delete',
      id: id
    });
    
    Logger.success('Ingreso eliminado', deleted);
    return deleted;
  },
  
  // Filtrar por tipo
  filterByTipo(tipo) {
    return this.getAll().filter(i => i.tipo === tipo);
  },
  
  // Filtrar por rango de fechas
  filterByDateRange(fechaInicio, fechaFin) {
    return Calculations.filtrarPorRango(this.getAll(), fechaInicio, fechaFin);
  },
  
  // Obtener tipos únicos
  getTipos() {
    const ingresos = this.getAll();
    return [...new Set(ingresos.map(i => i.tipo))].sort();
  }
};

window.IngresoModel = IngresoModel;
Logger.log('IngresoModel inicializado');
