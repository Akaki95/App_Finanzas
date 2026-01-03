// Modelo de Auditoría - Gestión de tiquets de revisión de cuentas
const AuditoriaModel = {
  collectionName: 'auditorias',
  configCollectionName: 'configuracion_cuentas',
  
  // Inicializar y cargar configuración desde servidor
  init() {
    // Cargar configuración de cuentas desde servidor en segundo plano
    SyncService.loadFromCloud(this.configCollectionName)
      .then(configFromServer => {
        if (configFromServer && configFromServer.length > 0) {
          CacheService.set(this.configCollectionName, configFromServer);
          Logger.success(`Configuración de cuentas cargada desde servidor: ${configFromServer.length} cuentas`);
        }
      })
      .catch(error => {
        Logger.warn('Error cargando configuración de cuentas desde servidor', error);
      });
  },
  
  // Obtener todas las auditorías
  getAll() {
    const auditorias = CacheService.get(this.collectionName) || [];
    Logger.log(`${auditorias.length} auditorías cargadas`);
    return auditorias;
  },
  
  // Obtener configuración de cuentas
  getCuentasConfig() {
    const config = CacheService.get(this.configCollectionName) || [];
    Logger.log(`${config.length} cuentas configuradas`);
    return config;
  },
  
  // Agregar cuenta a la configuración
  addCuentaConfig(descripcion) {
    const cuentas = this.getCuentasConfig();
    const nuevaCuenta = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      descripcion: ValidationService.sanitizarTexto(descripcion),
      orden: cuentas.length,
      createdAt: new Date().toISOString()
    };
    
    cuentas.push(nuevaCuenta);
    CacheService.set(this.configCollectionName, cuentas);
    Logger.log(`Cuenta agregada localmente: ${descripcion}`);
    
    // Sincronizar con servidor
    SyncService.syncToServer(this.configCollectionName, cuentas)
      .then(() => {
        Logger.success('Cuenta sincronizada con Atlas');
      })
      .catch(error => {
        Logger.error('Error sincronizando cuenta con Atlas', error);
      });
    
    return nuevaCuenta;
  },
  
  // Eliminar cuenta de la configuración
  deleteCuentaConfig(id) {
    let cuentas = this.getCuentasConfig();
    const cuentaEliminada = cuentas.find(c => c.id === id);
    cuentas = cuentas.filter(c => c.id !== id);
    CacheService.set(this.configCollectionName, cuentas);
    Logger.log(`Cuenta eliminada localmente: ${cuentaEliminada?.descripcion}`);
    
    // Sincronizar con servidor
    SyncService.syncToServer(this.configCollectionName, cuentas)
      .then(() => {
        Logger.success('Configuración sincronizada con Atlas');
      })
      .catch(error => {
        Logger.error('Error sincronizando con Atlas', error);
      });
  },
  
  // Actualizar orden de cuentas
  updateOrdenCuentas(cuentasOrdenadas) {
    CacheService.set(this.configCollectionName, cuentasOrdenadas);
    SyncService.syncToServer(this.configCollectionName, cuentasOrdenadas);
    Logger.log('Orden de cuentas actualizado');
  },
  
  // Obtener auditoría por ID
  getById(id) {
    const auditorias = this.getAll();
    return auditorias.find(a => a.id === id);
  },
  
  // Calcular balance acumulado total (todos los meses)
  getBalanceMesActual() {
    const ingresos = IngresoModel.getAll();
    const gastos = GastoModel.getAll();
    
    // Calcular suma total de todos los ingresos
    const totalIngresos = ingresos.reduce((sum, ingreso) => sum + (ingreso.monto || 0), 0);
    
    // Calcular suma total de todos los gastos
    const totalGastos = gastos.reduce((sum, gasto) => sum + (gasto.monto || 0), 0);
    
    // Balance acumulado = total ingresos - total gastos
    return totalIngresos - totalGastos;
  },
  
  // Obtener total en custodia (dinero de terceros)
  getTotalCustodia() {
    return CustodiaModel.getTotalCustodia();
  },
  
  // Obtener total en ahorros (dinero apartado)
  getTotalAhorros() {
    return AhorroModel.getTotal();
  },
  
  // Crear nueva auditoría
  create(auditoriaData) {
    // Validar datos
    if (!auditoriaData.montos || Object.keys(auditoriaData.montos).length === 0) {
      throw new Error('Debe agregar al menos un monto');
    }
    
    // Obtener configuración de cuentas
    const cuentasConfig = this.getCuentasConfig();
    
    // Calcular total de cuentas
    const totalCuentas = Object.values(auditoriaData.montos).reduce((sum, monto) => {
      return sum + parseFloat(monto || 0);
    }, 0);
    
    // Obtener balance del mes
    const balanceMes = this.getBalanceMesActual();
    
    // Obtener total en custodia (dinero de terceros que hay que restar)
    const totalCustodia = this.getTotalCustodia();
    
    // Obtener total en ahorros (dinero apartado que hay que restar)
    const totalAhorros = this.getTotalAhorros();
    
    // Calcular diferencia: Total en cuentas - Custodia - Ahorros debe ser igual al Balance
    // Total Cuentas - Total Custodia - Total Ahorros = Balance Real
    const balanceReal = balanceMes;
    const balanceEnCuentas = totalCuentas - totalCustodia - totalAhorros;
    const diferencia = balanceEnCuentas - balanceReal;
    const cuadra = Math.abs(diferencia) < 0.01; // Tolerancia de 1 céntimo
    
    // Crear auditoría
    const auditoria = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      fecha: new Date().toISOString(),
      montos: auditoriaData.montos, // { cuentaId: monto }
      totalCuentas: totalCuentas,
      totalCustodia: totalCustodia,
      totalAhorros: totalAhorros,
      balanceMes: balanceMes,
      diferencia: diferencia,
      cuadra: cuadra,
      notas: ValidationService.sanitizarTexto(auditoriaData.notas || ''),
      createdAt: new Date().toISOString()
    };
    
    // Guardar en caché
    const auditorias = this.getAll();
    auditorias.unshift(auditoria); // Agregar al inicio (más reciente primero)
    CacheService.set(this.collectionName, auditorias);
    
    // Sincronizar toda la colección con el servidor
    SyncService.syncToServer(this.collectionName, auditorias)
      .then(() => Logger.success('Auditoría sincronizada con MongoDB'))
      .catch(error => Logger.error('Error sincronizando auditoría', error));
    
    Logger.success('Auditoría creada', auditoria);
    return auditoria;
  },
  
  // Eliminar auditoría
  delete(id) {
    const auditorias = this.getAll();
    const auditoria = auditorias.find(a => a.id === id);
    
    if (!auditoria) {
      throw new Error('Auditoría no encontrada');
    }
    
    const auditoriasFiltradas = auditorias.filter(a => a.id !== id);
    CacheService.set(this.collectionName, auditoriasFiltradas);
    
    // Sincronizar toda la colección con el servidor
    SyncService.syncToServer(this.collectionName, auditoriasFiltradas)
      .then(() => Logger.success('Auditoría eliminada y sincronizada con MongoDB'))
      .catch(error => Logger.error('Error sincronizando eliminación', error));
    
    Logger.success('Auditoría eliminada', auditoria);
    return auditoria;
  },
  
  // Obtener estadísticas de auditorías
  getEstadisticas() {
    const auditorias = this.getAll();
    
    if (auditorias.length === 0) {
      return {
        total: 0,
        cuadradas: 0,
        noCuadradas: 0,
        porcentajeCuadradas: 0,
        ultimaAuditoria: null
      };
    }
    
    const cuadradas = auditorias.filter(a => a.cuadra).length;
    const noCuadradas = auditorias.length - cuadradas;
    
    return {
      total: auditorias.length,
      cuadradas: cuadradas,
      noCuadradas: noCuadradas,
      porcentajeCuadradas: (cuadradas / auditorias.length) * 100,
      ultimaAuditoria: auditorias[0]
    };
  }
};
