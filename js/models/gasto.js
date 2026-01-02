// Modelo de Gasto
const GastoModel = {
  collectionName: 'gastos',
  
  // Obtener todos los gastos
  getAll() {
    const gastos = CacheService.get(this.collectionName) || [];
    Logger.log(`${gastos.length} gastos cargados`);
    return gastos;
  },
  
  // Obtener gasto por ID
  getById(id) {
    const gastos = this.getAll();
    return gastos.find(g => g.id === id);
  },
  
  // Crear nuevo gasto
  create(gastoData) {
    // Validar datos
    const validation = ValidationService.validarGasto(gastoData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    // Crear gasto
    const gasto = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      fecha: gastoData.fecha,
      monto: ValidationService.formatearMonto(gastoData.monto),
      descripcion: ValidationService.sanitizarTexto(gastoData.descripcion || ''),
      categoria: ValidationService.sanitizarTexto(gastoData.categoria),
      esAutomatico: gastoData.esAutomatico || false,
      reglaId: gastoData.reglaId || null,
      origenGrupo: gastoData.origenGrupo || false,
      grupoId: gastoData.grupoId || null,
      createdAt: new Date().toISOString()
    };
    
    // Guardar en caché
    const gastos = this.getAll();
    gastos.push(gasto);
    CacheService.set(this.collectionName, gastos);
    
    // Agregar a cola de sincronización
    SyncService.addToQueue({
      collection: this.collectionName,
      action: 'create',
      data: gasto
    });
    
    Logger.success('Gasto creado', gasto);
    return gasto;
  },
  
  // Actualizar gasto
  update(id, gastoData) {
    // Validar datos
    const validation = ValidationService.validarGasto(gastoData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    const gastos = this.getAll();
    const index = gastos.findIndex(g => g.id === id);
    
    if (index === -1) {
      throw new Error('Gasto no encontrado');
    }
    
    // Actualizar gasto
    gastos[index] = {
      ...gastos[index],
      fecha: gastoData.fecha,
      monto: ValidationService.formatearMonto(gastoData.monto),
      descripcion: ValidationService.sanitizarTexto(gastoData.descripcion || ''),
      categoria: ValidationService.sanitizarTexto(gastoData.categoria),
      updatedAt: new Date().toISOString()
    };
    
    CacheService.set(this.collectionName, gastos);
    
    // Agregar a cola de sincronización (excluir _id)
    const { _id, ...updateData } = gastos[index];
    SyncService.addToQueue({
      collection: this.collectionName,
      action: 'update',
      id: id,
      data: updateData
    });
    
    Logger.success('Gasto actualizado', gastos[index]);
    return gastos[index];
  },
  
  // Eliminar gasto
  delete(id) {
    const gastos = this.getAll();
    const index = gastos.findIndex(g => g.id === id);
    
    if (index === -1) {
      throw new Error('Gasto no encontrado');
    }
    
    const deleted = gastos.splice(index, 1)[0];
    CacheService.set(this.collectionName, gastos);
    
    // Agregar a cola de sincronización
    SyncService.addToQueue({
      collection: this.collectionName,
      action: 'delete',
      id: id
    });
    
    Logger.success('Gasto eliminado', deleted);
    return deleted;
  },
  
  // Filtrar por categoría
  filterByCategoria(categoria) {
    return this.getAll().filter(g => g.categoria === categoria);
  },
  
  // Filtrar por rango de fechas
  filterByDateRange(fechaInicio, fechaFin) {
    return Calculations.filtrarPorRango(this.getAll(), fechaInicio, fechaFin);
  },
  
  // Obtener categorías únicas
  getCategorias() {
    const gastos = this.getAll();
    return [...new Set(gastos.map(g => g.categoria))].sort();
  }
};

window.GastoModel = GastoModel;
Logger.log('GastoModel inicializado');
