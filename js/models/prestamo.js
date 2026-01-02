// Modelo de Préstamo
const PrestamoModel = {
  collectionName: 'prestamos',
  
  // Obtener todos los préstamos
  getAll() {
    let prestamos = CacheService.get(this.collectionName) || [];
    
    // Migrar campos antiguos (montoPendiente -> montoActual)
    let migrado = false;
    prestamos = prestamos.map(p => {
      if (p.montoPendiente !== undefined && p.montoActual === undefined) {
        migrado = true;
        return {
          ...p,
          montoActual: p.montoPendiente,
          montoCobrado: p.montoInicial - p.montoPendiente,
          montoPendiente: undefined
        };
      }
      // Asegurar que montoCobrado existe
      if (p.montoCobrado === undefined) {
        return {
          ...p,
          montoCobrado: p.montoInicial - (p.montoActual || p.montoInicial)
        };
      }
      return p;
    });
    
    // Guardar si hubo migración
    if (migrado) {
      CacheService.set(this.collectionName, prestamos);
      Logger.success('Préstamos migrados a nuevo formato');
    }
    
    Logger.log(`${prestamos.length} préstamos cargados`);
    return prestamos;
  },
  
  // Obtener préstamo por ID
  getById(id) {
    const prestamos = this.getAll();
    return prestamos.find(p => p.id === id);
  },
  
  // Crear nuevo préstamo
  create(prestamoData) {
    // Validar datos
    const validation = ValidationService.validarPrestamo(prestamoData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    const montoInicial = ValidationService.formatearMonto(prestamoData.montoInicial);
    
    // Crear préstamo
    const prestamo = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      persona: ValidationService.sanitizarTexto(prestamoData.persona),
      montoInicial: montoInicial,
      montoActual: prestamoData.montoActual !== undefined ? 
        ValidationService.formatearMonto(prestamoData.montoActual) : montoInicial,
      montoCobrado: prestamoData.montoCobrado !== undefined ? 
        ValidationService.formatearMonto(prestamoData.montoCobrado) : 0,
      fechaPrestamo: prestamoData.fechaPrestamo,
      fechaDevolucion: prestamoData.fechaDevolucion || null,
      descripcion: ValidationService.sanitizarTexto(prestamoData.descripcion || ''),
      createdAt: new Date().toISOString()
    };
    
    // Guardar en caché
    const prestamos = this.getAll();
    prestamos.push(prestamo);
    CacheService.set(this.collectionName, prestamos);
    
    // Agregar a cola de sincronización
    SyncService.addToQueue({
      collection: this.collectionName,
      action: 'create',
      data: prestamo
    });
    
    // Crear gasto automático por el préstamo
    try {
      const gastoPrestamo = {
        fecha: prestamo.fechaPrestamo,
        monto: prestamo.montoInicial,
        categoria: 'Préstamo',
        descripcion: `Préstamo otorgado a ${prestamo.persona}${prestamo.descripcion ? ' - ' + prestamo.descripcion : ''}`
      };
      GastoModel.create(gastoPrestamo);
      Logger.success('Gasto automático creado por préstamo');
    } catch (error) {
      Logger.error('Error creando gasto automático por préstamo', error);
    }
    
    Logger.success('Préstamo creado', prestamo);
    return prestamo;
  },
  
  // Actualizar préstamo
  update(id, prestamoData) {
    // Validar datos
    const validation = ValidationService.validarPrestamo(prestamoData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    const prestamos = this.getAll();
    const index = prestamos.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error('Préstamo no encontrado');
    }
    
    // Actualizar préstamo
    prestamos[index] = {
      ...prestamos[index],
      persona: ValidationService.sanitizarTexto(prestamoData.persona),
      montoInicial: ValidationService.formatearMonto(prestamoData.montoInicial),
      montoActual: ValidationService.formatearMonto(prestamoData.montoActual),
      montoCobrado: ValidationService.formatearMonto(prestamoData.montoCobrado || 0),
      fechaPrestamo: prestamoData.fechaPrestamo,
      fechaDevolucion: prestamoData.fechaDevolucion || null,
      descripcion: ValidationService.sanitizarTexto(prestamoData.descripcion || ''),
      updatedAt: new Date().toISOString()
    };
    
    CacheService.set(this.collectionName, prestamos);
    
    // Agregar a cola de sincronización (excluir _id)
    const { _id, ...updateData } = prestamos[index];
    SyncService.addToQueue({
      collection: this.collectionName,
      action: 'update',
      id: id,
      data: updateData
    });
    
    Logger.success('Préstamo actualizado', prestamos[index]);
    return prestamos[index];
  },
  
  // Registrar pago recibido
  registrarPago(id, montoPago) {
    const prestamo = this.getById(id);
    if (!prestamo) {
      throw new Error('Préstamo no encontrado');
    }
    
    const nuevoMontoActual = prestamo.montoActual - montoPago;
    if (nuevoMontoActual < 0) {
      throw new Error('El pago no puede ser mayor que el monto pendiente');
    }
    
    const nuevoMontoCobrado = (prestamo.montoCobrado || 0) + montoPago;
    
    // Actualizar localmente
    const prestamos = this.getAll();
    const index = prestamos.findIndex(p => p.id === id);
    
    if (index !== -1) {
      prestamos[index] = {
        ...prestamos[index],
        montoActual: nuevoMontoActual,
        montoCobrado: nuevoMontoCobrado,
        updatedAt: new Date().toISOString()
      };
      CacheService.set(this.collectionName, prestamos);
    }
    
    // Agregar a cola de sincronización con operación específica de cobro
    SyncService.addToQueue({
      collection: this.collectionName,
      action: 'cobrar',
      id: id,
      data: { monto: montoPago }
    });
    
    // Crear ingreso automático por el cobro del préstamo
    try {
      const ingresoCobro = {
        fecha: new Date().toISOString().split('T')[0],
        monto: montoPago,
        tipo: 'Cobro Préstamo',
        descripcion: `Cobro de préstamo a ${prestamo.persona}${prestamo.descripcion ? ' - ' + prestamo.descripcion : ''}`
      };
      IngresoModel.create(ingresoCobro);
      Logger.success('Ingreso automático creado por cobro de préstamo');
    } catch (error) {
      Logger.error('Error creando ingreso automático por cobro de préstamo', error);
    }
    
    Logger.success('Pago registrado en préstamo', { id, monto: montoPago });
    return prestamos[index];
  },
  
  // Eliminar préstamo
  delete(id) {
    const prestamos = this.getAll();
    const index = prestamos.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error('Préstamo no encontrado');
    }
    
    const deleted = prestamos.splice(index, 1)[0];
    CacheService.set(this.collectionName, prestamos);
    
    // Agregar a cola de sincronización
    SyncService.addToQueue({
      collection: this.collectionName,
      action: 'delete',
      id: id
    });
    
    Logger.success('Préstamo eliminado', deleted);
    return deleted;
  },
  
  // Obtener préstamos activos (con monto pendiente > 0)
  getActivos() {
    return this.getAll().filter(p => p.montoActual > 0);
  },
  
  // Obtener préstamos vencidos
  getVencidos() {
    const hoy = new Date();
    return this.getActivos().filter(p => {
      if (!p.fechaDevolucion) return false;
      return new Date(p.fechaDevolucion) < hoy;
    });
  },
  
  // Calcular total pendiente de cobro
  getTotalPendiente() {
    return this.getActivos().reduce((sum, p) => sum + p.montoActual, 0);
  },
  
  // Obtener historial de cobros de un préstamo
  getCobros(prestamoId) {
    const prestamo = this.getById(prestamoId);
    if (!prestamo) return [];
    
    // Buscar ingresos con tipo 'Cobro Préstamo' que mencionen la persona
    const ingresos = IngresoModel.getAll();
    return ingresos.filter(i => 
      i.tipo === 'Cobro Préstamo' && 
      i.descripcion && 
      i.descripcion.toLowerCase().includes(prestamo.persona.toLowerCase())
    ).sort((a, b) => {
      const fechaDiff = new Date(b.fecha) - new Date(a.fecha);
      if (fechaDiff !== 0) return fechaDiff;
      return b.id.localeCompare(a.id); // Si misma fecha, el más reciente (ID mayor) primero
    });
  }
};

window.PrestamoModel = PrestamoModel;
Logger.log('PrestamoModel inicializado');
