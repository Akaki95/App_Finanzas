// Modelo de Patrimonio (Activos y Pasivos)
const PatrimonioModel = {
  activosCollection: 'activos',
  pasivosCollection: 'pasivos',
  
  // ===== ACTIVOS =====
  
  // Obtener activos automáticos (calculados)
  getActivosAutomaticos() {
    const activos = [];
    
    try {
      // 1. Dinero Disponible (balance actual de ingresos - gastos)
      if (typeof IngresoModel !== 'undefined' && typeof GastoModel !== 'undefined') {
        const ingresos = IngresoModel.getAll() || [];
        const gastos = GastoModel.getAll() || [];
        const totalIngresos = ingresos.reduce((sum, i) => sum + (parseFloat(i.monto) || 0), 0);
        const totalGastos = gastos.reduce((sum, g) => sum + (parseFloat(g.monto) || 0), 0);
        const dineroDisponible = totalIngresos - totalGastos;
        
        console.log('[PatrimonioModel] Dinero disponible:', {
          ingresos: ingresos.length,
          totalIngresos,
          gastos: gastos.length,
          totalGastos,
          dineroDisponible
        });
        
        if (dineroDisponible > 0) {
          activos.push({
            id: 'auto_dinero_disponible',
            nombre: 'Dinero Disponible',
            valor: dineroDisponible,
            categoria: 'efectivo',
            descripcion: 'Balance actual: ingresos menos gastos',
            esAutomatico: true
          });
        }
      } else {
        console.warn('[PatrimonioModel] IngresoModel o GastoModel no disponibles');
      }
      
      // 2. Ahorros (total acumulado)
      if (typeof AhorroModel !== 'undefined') {
        const ahorros = AhorroModel.getAll() || [];
        const totalAhorros = ahorros.reduce((sum, a) => sum + (parseFloat(a.monto) || 0), 0);
        
        console.log('[PatrimonioModel] Ahorros:', {
          ahorros: ahorros.length,
          totalAhorros
        });
        
        if (totalAhorros > 0) {
          activos.push({
            id: 'auto_ahorros',
            nombre: 'Ahorros Acumulados',
            valor: totalAhorros,
            categoria: 'efectivo',
            descripcion: 'Total guardado en ahorros',
            esAutomatico: true
          });
        }
      } else {
        console.warn('[PatrimonioModel] AhorroModel no disponible');
      }
      
      // 3. Préstamos pendientes (dinero que nos deben)
      if (typeof PrestamoModel !== 'undefined') {
        const prestamos = PrestamoModel.getAll() || [];
        const prestamosActivos = prestamos.filter(p => {
          // Compatibilidad con ambos formatos (antiguo y nuevo)
          const montoPendiente = p.montoActual !== undefined ? p.montoActual : p.montoPendiente;
          return parseFloat(montoPendiente) > 0;
        });
        
        console.log('[PatrimonioModel] Préstamos:', {
          total: prestamos.length,
          activos: prestamosActivos.length,
          prestamosData: prestamos
        });
        
        prestamosActivos.forEach(prestamo => {
          const montoPendiente = prestamo.montoActual !== undefined ? prestamo.montoActual : prestamo.montoPendiente;
          activos.push({
            id: `auto_prestamo_${prestamo.id}`,
            nombre: `Préstamo a: ${prestamo.persona}`,
            valor: parseFloat(montoPendiente) || 0,
            categoria: 'cuentas_cobrar',
            descripcion: prestamo.fechaVencimiento 
              ? `Por cobrar. Vence: ${new Date(prestamo.fechaVencimiento).toLocaleDateString()}` 
              : 'Dinero pendiente de cobro',
            esAutomatico: true,
            prestamoId: prestamo.id
          });
        });
      } else {
        console.warn('[PatrimonioModel] PrestamoModel no disponible');
      }
    } catch (error) {
      Logger.error('Error calculando activos automáticos', error);
      console.error('[PatrimonioModel] Error en getActivosAutomaticos:', error);
    }
    
    return activos;
  },
  
  // Obtener todos los activos (manuales + automáticos)
  getAllActivos() {
    const activosManuales = CacheService.get(this.activosCollection) || [];
    const activosAutomaticos = this.getActivosAutomaticos();
    const todos = [...activosAutomaticos, ...activosManuales];
    console.log('[PatrimonioModel] Activos automáticos:', activosAutomaticos);
    console.log('[PatrimonioModel] Activos manuales:', activosManuales);
    Logger.log(`${todos.length} activos cargados (${activosAutomaticos.length} automáticos, ${activosManuales.length} manuales)`);
    return todos;
  },
  
  // Obtener activo por ID
  getActivoById(id) {
    const activos = this.getAllActivos();
    return activos.find(a => a.id === id);
  },
  
  // Crear nuevo activo
  createActivo(activoData) {
    console.log('[PatrimonioModel] createActivo recibido:', activoData);
    
    // Validar datos
    const validation = ValidationService.validarPatrimonio(activoData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    // Crear activo
    const activo = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      nombre: ValidationService.sanitizarTexto(activoData.nombre),
      valor: ValidationService.formatearMonto(activoData.valor),
      descripcion: ValidationService.sanitizarTexto(activoData.descripcion || ''),
      categoria: activoData.categoria || '',
      createdAt: new Date().toISOString()
    };
    
    console.log('[PatrimonioModel] Activo creado:', activo);
    
    // Guardar en caché (solo manuales)
    const activos = CacheService.get(this.activosCollection) || [];
    activos.push(activo);
    CacheService.set(this.activosCollection, activos);
    
    // Agregar a cola de sincronización
    SyncService.addToQueue({
      collection: this.activosCollection,
      action: 'create',
      data: activo
    });
    
    Logger.success('Activo creado', activo);
    return activo;
  },
  
  // Actualizar activo
  updateActivo(id, activoData) {
    // Validar datos
    const validation = ValidationService.validarPatrimonio(activoData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    const activos = CacheService.get(this.activosCollection) || [];
    const index = activos.findIndex(a => a.id === id);
    
    if (index === -1) {
      throw new Error('Activo no encontrado');
    }
    
    // Actualizar activo
    activos[index] = {
      ...activos[index],
      nombre: ValidationService.sanitizarTexto(activoData.nombre),
      valor: ValidationService.formatearMonto(activoData.valor),
      descripcion: ValidationService.sanitizarTexto(activoData.descripcion || ''),
      updatedAt: new Date().toISOString()
    };
    
    CacheService.set(this.activosCollection, activos);
    
    // Agregar a cola de sincronización
    SyncService.addToQueue({
      collection: this.activosCollection,
      action: 'update',
      id: id,
      data: activos[index]
    });
    
    Logger.success('Activo actualizado', activos[index]);
    return activos[index];
  },
  
  // Eliminar activo
  deleteActivo(id) {
    const activos = CacheService.get(this.activosCollection) || [];
    const index = activos.findIndex(a => a.id === id);
    
    if (index === -1) {
      throw new Error('Activo no encontrado');
    }
    
    const deleted = activos.splice(index, 1)[0];
    CacheService.set(this.activosCollection, activos);
    
    // Agregar a cola de sincronización
    SyncService.addToQueue({
      collection: this.activosCollection,
      action: 'delete',
      id: id
    });
    
    Logger.success('Activo eliminado', deleted);
    return deleted;
  },
  
  // ===== PASIVOS =====
  
  // Obtener pasivos automáticos (calculados)
  getPasivosAutomaticos() {
    const pasivos = [];
    
    try {
      // Deudas pendientes
      if (typeof DeudaModel !== 'undefined') {
        const deudas = DeudaModel.getAll() || [];
        const deudasPendientes = deudas.filter(d => !d.pagado);
        
        console.log('[PatrimonioModel] Deudas:', {
          total: deudas.length,
          pendientes: deudasPendientes.length,
          deudas: deudasPendientes
        });
        
        deudasPendientes.forEach(deuda => {
          pasivos.push({
            id: `auto_deuda_${deuda.id}`,
            nombre: `Deuda: ${deuda.descripcion || deuda.categoria}`,
            valor: parseFloat(deuda.montoPendiente) || 0,
            categoria: 'deudas',
            descripcion: deuda.fechaVencimiento ? `Vence: ${new Date(deuda.fechaVencimiento).toLocaleDateString()}` : 'Deuda pendiente de pago',
            esAutomatico: true,
            deudaId: deuda.id
          });
        });
      } else {
        console.warn('[PatrimonioModel] DeudaModel no disponible');
      }
    } catch (error) {
      Logger.error('Error calculando pasivos automáticos', error);
      console.error('[PatrimonioModel] Error en getPasivosAutomaticos:', error);
    }
    
    return pasivos;
  },
  
  // Obtener todos los pasivos (manuales + automáticos)
  getAllPasivos() {
    const pasivosManuales = CacheService.get(this.pasivosCollection) || [];
    const pasivosAutomaticos = this.getPasivosAutomaticos();
    const todos = [...pasivosAutomaticos, ...pasivosManuales];
    console.log('[PatrimonioModel] Pasivos automáticos:', pasivosAutomaticos);
    console.log('[PatrimonioModel] Pasivos manuales:', pasivosManuales);
    Logger.log(`${todos.length} pasivos cargados (${pasivosAutomaticos.length} automáticos, ${pasivosManuales.length} manuales)`);
    return todos;
  },
  
  // Obtener pasivo por ID
  getPasivoById(id) {
    const pasivos = this.getAllPasivos();
    return pasivos.find(p => p.id === id);
  },
  
  // Crear nuevo pasivo
  createPasivo(pasivoData) {
    console.log('[PatrimonioModel] createPasivo recibido:', pasivoData);
    
    // Validar datos
    const validation = ValidationService.validarPatrimonio(pasivoData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    // Crear pasivo
    const pasivo = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      nombre: ValidationService.sanitizarTexto(pasivoData.nombre),
      valor: ValidationService.formatearMonto(pasivoData.valor),
      descripcion: ValidationService.sanitizarTexto(pasivoData.descripcion || ''),
      categoria: pasivoData.categoria || '',
      createdAt: new Date().toISOString()
    };
    
    console.log('[PatrimonioModel] Pasivo creado:', pasivo);
    
    // Guardar en caché
    const pasivos = CacheService.get(this.pasivosCollection) || [];
    pasivos.push(pasivo);
    CacheService.set(this.pasivosCollection, pasivos);
    
    // Agregar a cola de sincronización
    SyncService.addToQueue({
      collection: this.pasivosCollection,
      action: 'create',
      data: pasivo
    });
    
    Logger.success('Pasivo creado', pasivo);
    return pasivo;
  },
  
  // Actualizar pasivo
  updatePasivo(id, pasivoData) {
    // Validar datos
    const validation = ValidationService.validarPatrimonio(pasivoData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    const pasivos = CacheService.get(this.pasivosCollection) || [];
    const index = pasivos.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error('Pasivo no encontrado');
    }
    
    // Actualizar pasivo
    pasivos[index] = {
      ...pasivos[index],
      nombre: ValidationService.sanitizarTexto(pasivoData.nombre),
      valor: ValidationService.formatearMonto(pasivoData.valor),
      descripcion: ValidationService.sanitizarTexto(pasivoData.descripcion || ''),
      updatedAt: new Date().toISOString()
    };
    
    CacheService.set(this.pasivosCollection, pasivos);
    
    // Agregar a cola de sincronización
    SyncService.addToQueue({
      collection: this.pasivosCollection,
      action: 'update',
      id: id,
      data: pasivos[index]
    });
    
    Logger.success('Pasivo actualizado', pasivos[index]);
    return pasivos[index];
  },
  
  // Eliminar pasivo
  deletePasivo(id) {
    const pasivos = CacheService.get(this.pasivosCollection) || [];
    const index = pasivos.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error('Pasivo no encontrado');
    }
    
    const deleted = pasivos.splice(index, 1)[0];
    CacheService.set(this.pasivosCollection, pasivos);
    
    // Agregar a cola de sincronización
    SyncService.addToQueue({
      collection: this.pasivosCollection,
      action: 'delete',
      id: id
    });
    
    Logger.success('Pasivo eliminado', deleted);
    return deleted;
  },
  
  // ===== CÁLCULOS =====
  
  // Calcular total de activos
  getTotalActivos() {
    const activos = this.getAllActivos();
    return activos.reduce((sum, a) => sum + (a.valor || 0), 0);
  },
  
  // Calcular total de pasivos
  getTotalPasivos() {
    const pasivos = this.getAllPasivos();
    const total = pasivos.reduce((sum, p) => sum + (parseFloat(p.valor) || 0), 0);
    console.log('[PatrimonioModel] Total pasivos:', total, 'de', pasivos.length, 'items');
    return total;
  },
  
  // Calcular patrimonio neto
  getPatrimonioNeto() {
    const totalActivos = this.getTotalActivos();
    const totalPasivos = this.getTotalPasivos();
    return totalActivos - totalPasivos;
  },
  
  // Obtener resumen completo
  getResumen() {
    return {
      activos: this.getTotalActivos(),
      pasivos: this.getTotalPasivos(),
      patrimonioNeto: this.getPatrimonioNeto()
    };
  }
};

window.PatrimonioModel = PatrimonioModel;
Logger.log('PatrimonioModel inicializado');
