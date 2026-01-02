// Modelo de Deuda
const DeudaModel = {
  collectionName: 'deudas',
  
  // Obtener todas las deudas
  getAll() {
    const deudas = CacheService.get(this.collectionName) || [];
    Logger.log(`${deudas.length} deudas cargadas`);
    return deudas;
  },
  
  // Obtener deuda por ID
  getById(id) {
    const deudas = this.getAll();
    return deudas.find(d => d.id === id);
  },
  
  // Crear nueva deuda
  create(deudaData) {
    // Validar datos
    const validation = ValidationService.validarDeuda(deudaData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    const montoInicial = ValidationService.formatearMonto(deudaData.montoInicial);
    
    // Crear deuda
    const deuda = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      acreedor: ValidationService.sanitizarTexto(deudaData.acreedor),
      montoInicial: montoInicial,
      montoPendiente: deudaData.montoPendiente !== undefined ? 
        ValidationService.formatearMonto(deudaData.montoPendiente) : montoInicial,
      fechaInicio: deudaData.fechaInicio,
      fechaVencimiento: deudaData.fechaVencimiento || null,
      descripcion: ValidationService.sanitizarTexto(deudaData.descripcion || ''),
      createdAt: new Date().toISOString()
    };
    
    // Guardar en caché
    const deudas = this.getAll();
    deudas.push(deuda);
    CacheService.set(this.collectionName, deudas);
    
    // Agregar a cola de sincronización
    SyncService.addToQueue({
      collection: this.collectionName,
      action: 'create',
      data: deuda
    });
    
    // Crear ingreso automático por el monto de la deuda
    try {
      const ingresoDeuda = {
        fecha: deuda.fechaInicio,
        monto: deuda.montoInicial,
        tipo: 'Deuda',
        descripcion: `Deuda contraída con ${deuda.acreedor}${deuda.descripcion ? ' - ' + deuda.descripcion : ''}`
      };
      IngresoModel.create(ingresoDeuda);
      Logger.success('Ingreso automático creado por deuda');
    } catch (error) {
      Logger.error('Error creando ingreso automático por deuda', error);
    }
    
    Logger.success('Deuda creada', deuda);
    return deuda;
  },
  
  // Actualizar deuda
  update(id, deudaData) {
    // Validar datos
    const validation = ValidationService.validarDeuda(deudaData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    const deudas = this.getAll();
    const index = deudas.findIndex(d => d.id === id);
    
    if (index === -1) {
      throw new Error('Deuda no encontrada');
    }
    
    // Actualizar deuda
    deudas[index] = {
      ...deudas[index],
      acreedor: ValidationService.sanitizarTexto(deudaData.acreedor),
      montoInicial: ValidationService.formatearMonto(deudaData.montoInicial),
      montoPendiente: ValidationService.formatearMonto(deudaData.montoPendiente),
      fechaInicio: deudaData.fechaInicio,
      fechaVencimiento: deudaData.fechaVencimiento || null,
      descripcion: ValidationService.sanitizarTexto(deudaData.descripcion || ''),
      updatedAt: new Date().toISOString()
    };
    
    CacheService.set(this.collectionName, deudas);
    
    // Agregar a cola de sincronización (excluir _id)
    const { _id, ...updateData } = deudas[index];
    SyncService.addToQueue({
      collection: this.collectionName,
      action: 'update',
      id: id,
      data: updateData
    });
    
    Logger.success('Deuda actualizada', deudas[index]);
    return deudas[index];
  },
  
  // Registrar pago parcial
  registrarPago(id, montoPago) {
    const deuda = this.getById(id);
    if (!deuda) {
      throw new Error('Deuda no encontrada');
    }
    
    const nuevoPendiente = deuda.montoPendiente - montoPago;
    if (nuevoPendiente < 0) {
      throw new Error('El pago no puede ser mayor que el monto pendiente');
    }
    
    const resultado = this.update(id, {
      ...deuda,
      montoPendiente: nuevoPendiente
    });
    
    // Crear gasto automático por el pago de la deuda
    try {
      const gastoPago = {
        fecha: new Date().toISOString().split('T')[0],
        monto: montoPago,
        categoria: 'Pago Deuda',
        descripcion: `Pago de deuda a ${deuda.acreedor}${deuda.descripcion ? ' - ' + deuda.descripcion : ''}`
      };
      GastoModel.create(gastoPago);
      Logger.success('Gasto automático creado por pago de deuda');
    } catch (error) {
      Logger.error('Error creando gasto automático por pago de deuda', error);
    }
    
    return resultado;
  },
  
  // Eliminar deuda
  delete(id) {
    const deudas = this.getAll();
    const index = deudas.findIndex(d => d.id === id);
    
    if (index === -1) {
      throw new Error('Deuda no encontrada');
    }
    
    const deleted = deudas.splice(index, 1)[0];
    CacheService.set(this.collectionName, deudas);
    
    // Agregar a cola de sincronización
    SyncService.addToQueue({
      collection: this.collectionName,
      action: 'delete',
      id: id
    });
    
    Logger.success('Deuda eliminada', deleted);
    return deleted;
  },
  
  // Obtener deudas activas (con monto pendiente > 0)
  getActivas() {
    return this.getAll().filter(d => d.montoPendiente > 0);
  },
  
  // Obtener deudas vencidas
  getVencidas() {
    const hoy = new Date();
    return this.getActivas().filter(d => {
      if (!d.fechaVencimiento) return false;
      return new Date(d.fechaVencimiento) < hoy;
    });
  },
  
  // Calcular total pendiente
  getTotalPendiente() {
    return this.getActivas().reduce((sum, d) => sum + d.montoPendiente, 0);
  },
  
  // Obtener historial de pagos de una deuda
  getPagosDeuda(deudaId) {
    const deuda = this.getById(deudaId);
    if (!deuda) return [];
    
    // Buscar gastos con categoría 'Pago Deuda' que mencionen el acreedor
    const gastos = GastoModel.getAll();
    return gastos.filter(g => 
      g.categoria === 'Pago Deuda' && 
      g.descripcion && 
      g.descripcion.toLowerCase().includes(deuda.acreedor.toLowerCase())
    ).sort((a, b) => {
      const fechaDiff = new Date(b.fecha) - new Date(a.fecha);
      if (fechaDiff !== 0) return fechaDiff;
      return b.id.localeCompare(a.id); // Si misma fecha, el más reciente (ID mayor) primero
    });
  }
};

window.DeudaModel = DeudaModel;
Logger.log('DeudaModel inicializado');
