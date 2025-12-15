// Modelo de Cashflow - Ingresos Pasivos y Gastos Recurrentes
const CashflowModel = {
  ingresosCollection: 'cashflow_ingresos',
  gastosCollection: 'cashflow_gastos',
  
  // === INGRESOS PASIVOS ===
  
  // Obtener todos los ingresos pasivos
  getAllIngresos() {
    const ingresos = CacheService.get(this.ingresosCollection) || [];
    Logger.log(`${ingresos.length} ingresos pasivos cargados`);
    return ingresos;
  },
  
  // Obtener ingreso por ID
  getIngresoById(id) {
    const ingresos = this.getAllIngresos();
    return ingresos.find(i => i.id === id);
  },
  
  // Crear nuevo ingreso pasivo
  createIngreso(ingresoData) {
    if (!ingresoData.nombre || !ingresoData.valor || parseFloat(ingresoData.valor) <= 0) {
      throw new Error('Nombre y valor válido son requeridos');
    }
    
    const ingreso = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      nombre: ingresoData.nombre.trim(),
      valor: parseFloat(ingresoData.valor),
      descripcion: (ingresoData.descripcion || '').trim(),
      createdAt: new Date().toISOString()
    };
    
    const ingresos = this.getAllIngresos();
    ingresos.push(ingreso);
    CacheService.set(this.ingresosCollection, ingresos);
    
    // Sincronizar con backend
    SyncService.addToQueue({
      collection: this.ingresosCollection,
      action: 'create',
      data: ingreso
    });
    
    Logger.success('Ingreso pasivo creado', ingreso);
    return ingreso;
  },
  
  // Actualizar ingreso pasivo
  updateIngreso(id, ingresoData) {
    if (!ingresoData.nombre || !ingresoData.valor || parseFloat(ingresoData.valor) <= 0) {
      throw new Error('Nombre y valor válido son requeridos');
    }
    
    const ingresos = this.getAllIngresos();
    const index = ingresos.findIndex(i => i.id === id);
    
    if (index === -1) {
      throw new Error('Ingreso pasivo no encontrado');
    }
    
    ingresos[index] = {
      ...ingresos[index],
      nombre: ingresoData.nombre.trim(),
      valor: parseFloat(ingresoData.valor),
      descripcion: (ingresoData.descripcion || '').trim(),
      updatedAt: new Date().toISOString()
    };
    
    CacheService.set(this.ingresosCollection, ingresos);
    
    // Sincronizar con backend
    SyncService.addToQueue({
      collection: this.ingresosCollection,
      action: 'update',
      id: id,
      data: ingresos[index]
    });
    
    Logger.success('Ingreso pasivo actualizado', ingresos[index]);
    return ingresos[index];
  },
  
  // Eliminar ingreso pasivo
  deleteIngreso(id) {
    const ingresos = this.getAllIngresos();
    const index = ingresos.findIndex(i => i.id === id);
    
    if (index === -1) {
      throw new Error('Ingreso pasivo no encontrado');
    }
    
    const deleted = ingresos.splice(index, 1)[0];
    CacheService.set(this.ingresosCollection, ingresos);
    
    // Sincronizar con backend
    SyncService.addToQueue({
      collection: this.ingresosCollection,
      action: 'delete',
      id: id
    });
    
    Logger.success('Ingreso pasivo eliminado', deleted);
    return deleted;
  },
  
  // === GASTOS RECURRENTES ===
  
  // Obtener todos los gastos recurrentes
  getAllGastos() {
    const gastos = CacheService.get(this.gastosCollection) || [];
    Logger.log(`${gastos.length} gastos recurrentes cargados`);
    return gastos;
  },
  
  // Obtener gasto por ID
  getGastoById(id) {
    const gastos = this.getAllGastos();
    return gastos.find(g => g.id === id);
  },
  
  // Crear nuevo gasto recurrente
  createGasto(gastoData) {
    if (!gastoData.nombre || !gastoData.valor || parseFloat(gastoData.valor) <= 0) {
      throw new Error('Nombre y valor válido son requeridos');
    }
    
    const gasto = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      nombre: gastoData.nombre.trim(),
      valor: parseFloat(gastoData.valor),
      descripcion: (gastoData.descripcion || '').trim(),
      createdAt: new Date().toISOString()
    };
    
    const gastos = this.getAllGastos();
    gastos.push(gasto);
    CacheService.set(this.gastosCollection, gastos);
    
    // Sincronizar con backend
    SyncService.addToQueue({
      collection: this.gastosCollection,
      action: 'create',
      data: gasto
    });
    
    Logger.success('Gasto recurrente creado', gasto);
    return gasto;
  },
  
  // Actualizar gasto recurrente
  updateGasto(id, gastoData) {
    if (!gastoData.nombre || !gastoData.valor || parseFloat(gastoData.valor) <= 0) {
      throw new Error('Nombre y valor válido son requeridos');
    }
    
    const gastos = this.getAllGastos();
    const index = gastos.findIndex(g => g.id === id);
    
    if (index === -1) {
      throw new Error('Gasto recurrente no encontrado');
    }
    
    gastos[index] = {
      ...gastos[index],
      nombre: gastoData.nombre.trim(),
      valor: parseFloat(gastoData.valor),
      descripcion: (gastoData.descripcion || '').trim(),
      updatedAt: new Date().toISOString()
    };
    
    CacheService.set(this.gastosCollection, gastos);
    
    // Sincronizar con backend
    SyncService.addToQueue({
      collection: this.gastosCollection,
      action: 'update',
      id: id,
      data: gastos[index]
    });
    
    Logger.success('Gasto recurrente actualizado', gastos[index]);
    return gastos[index];
  },
  
  // Eliminar gasto recurrente
  deleteGasto(id) {
    const gastos = this.getAllGastos();
    const index = gastos.findIndex(g => g.id === id);
    
    if (index === -1) {
      throw new Error('Gasto recurrente no encontrado');
    }
    
    const deleted = gastos.splice(index, 1)[0];
    CacheService.set(this.gastosCollection, gastos);
    
    // Sincronizar con backend
    SyncService.addToQueue({
      collection: this.gastosCollection,
      action: 'delete',
      id: id
    });
    
    Logger.success('Gasto recurrente eliminado', deleted);
    return deleted;
  },
  
  // === CÁLCULOS ===
  
  // Obtener resumen de cashflow
  getResumen() {
    const ingresos = this.getAllIngresos();
    const gastos = this.getAllGastos();
    
    const totalIngresos = ingresos.reduce((sum, i) => sum + i.valor, 0);
    const totalGastos = gastos.reduce((sum, g) => sum + g.valor, 0);
    const cashflow = totalIngresos - totalGastos;
    
    // Libertad financiera: ingresos pasivos > gastos recurrentes
    const libertadFinanciera = totalIngresos > totalGastos && totalIngresos > 0;
    
    return {
      totalIngresos,
      totalGastos,
      cashflow,
      cantidadIngresos: ingresos.length,
      cantidadGastos: gastos.length,
      libertadFinanciera
    };
  }
};

window.CashflowModel = CashflowModel;
Logger.log('CashflowModel inicializado');
