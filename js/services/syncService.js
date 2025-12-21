// Sync Service - Gestión de sincronización con backend Node.js (OPTIMIZADO)
const SyncService = {
  // Switch automático entre local y producción
  apiBaseUrl: null, // Se inicializa desde ConfigModel
  isOnline: navigator.onLine,
  syncQueue: [],
  syncInterval: null,
  timestampCheckInterval: null,
  statusElement: null,
  lastSyncTime: null,
  collectionTimestamps: {}, // Timestamps de última sincronización por colección
  
  // Inicializar el servicio de sincronización
  async init() {
    this.statusElement = document.getElementById('sync-status');
    await ConfigModel.loadApiBase();
    // Esperar hasta que API_BASE esté correctamente definido
    let retries = 0;
    while ((!ConfigModel.API_BASE || ConfigModel.API_BASE === '' || ConfigModel.API_BASE === null) && retries < 10) {
      await new Promise(res => setTimeout(res, 100));
      retries++;
    }
    this.apiBaseUrl = ConfigModel.API_BASE || 'http://localhost:3000/api';
    this.loadCollectionTimestamps();
    this.checkBackendConnection();
    // Escuchar eventos de conexión
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    // Cargar cola de sincronización pendiente
    this.loadSyncQueue();
    // Iniciar sincronización automática cada 30 segundos (solo cola pendiente)
    this.startAutoSync();
    // Verificar timestamps cada 60 segundos (petición ligera)
    this.startTimestampCheck();
    Logger.log('SyncService inicializado con backend Node.js (OPTIMIZADO)');
  },
  
  // Verificar conexión con backend
  async checkBackendConnection() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos timeout para Render
      
      const response = await fetch(this.apiBaseUrl.replace('/api', ''), {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        this.isOnline = true;
        this.lastSyncTime = Date.now();
        Logger.success('Backend conectado correctamente');
      } else {
        this.isOnline = false;
        Logger.warn('Backend no responde correctamente');
      }
    } catch (error) {
      this.isOnline = false;
      if (error.name === 'AbortError') {
        Logger.warn('Backend no disponible (timeout) - usando modo offline');
      } else {
        Logger.warn('Backend no disponible - usando modo offline');
      }
    }
    this.updateStatus();
  },
  
  // Manejar estado online
  handleOnline() {
    this.checkBackendConnection();
    Logger.success('Conexión restaurada');
    this.processSyncQueue();
  },
  
  // Manejar estado offline
  handleOffline() {
    this.isOnline = false;
    this.updateStatus();
    Logger.warn('Sin conexión a internet');
  },
  
  // Actualizar indicador visual de estado
  updateStatus() {
    if (!this.statusElement) return;
    
    const indicator = this.statusElement.querySelector('.sync-indicator');
    const text = this.statusElement.querySelector('.sync-text');
    
    if (this.isOnline) {
      indicator.className = 'sync-indicator';
      const timeSinceSync = this.lastSyncTime ? Math.floor((Date.now() - this.lastSyncTime) / 1000) : null;
      if (timeSinceSync !== null) {
        if (timeSinceSync < 60) {
          text.textContent = `Sincronizado hace ${timeSinceSync}s`;
        } else {
          text.textContent = `Sincronizado hace ${Math.floor(timeSinceSync / 60)}min`;
        }
      } else {
        text.textContent = 'Sincronizado';
      }
    } else {
      indicator.className = 'sync-indicator offline';
      text.textContent = 'Sin conexión';
    }
  },
  
  // Agregar operación a la cola de sincronización
  addToQueue(operation) {
    this.syncQueue.push({
      id: Date.now() + Math.random(),
      operation: operation,
      timestamp: Date.now(),
      retries: 0
    });
    this.saveSyncQueue();
    Logger.log('Operación agregada a cola de sincronización', operation);
    
    // Intentar sincronizar inmediatamente si hay conexión
    if (this.isOnline) {
      this.processSyncQueue();
    }
  },
  
  // Procesar cola de sincronización
  async processSyncQueue() {
    if (this.syncQueue.length === 0) return;
    if (!this.isOnline) return;
    
    Logger.log(`Procesando cola de sincronización (${this.syncQueue.length} operaciones)`);
    
    const indicator = this.statusElement?.querySelector('.sync-indicator');
    const text = this.statusElement?.querySelector('.sync-text');
    
    if (indicator) indicator.className = 'sync-indicator syncing';
    if (text) text.textContent = 'Sincronizando...';
    
    const queue = [...this.syncQueue];
    this.syncQueue = [];
    
    for (const item of queue) {
      try {
        await this.executeOperation(item.operation);
        Logger.success('Operación sincronizada', item.operation);
      } catch (error) {
        Logger.error('Error sincronizando operación', error);
        
        // Reintentar hasta 3 veces
        if (item.retries < 3) {
          item.retries++;
          this.syncQueue.push(item);
        } else {
          Logger.error('Operación descartada después de 3 intentos', item.operation);
        }
      }
    }
    
    this.saveSyncQueue();
    this.updateStatus();
  },
  
  // Ejecutar operación de sincronización
  async executeOperation(operation) {
    const { collection, action, data, id } = operation;
    
    try {
      switch (action) {
        case 'create': {
          const result = await this.insertOne(collection, data);
          // Actualizar el grupo local con el _id recibido del backend
          if ((collection === 'grupo_ingresos' || collection === 'grupo_gastos') && result && result._id) {
            const grupos = CacheService.get(collection) || [];
            // Buscar el grupo por id local
            const idx = grupos.findIndex(g => g.id === data.id);
            if (idx !== -1) {
              grupos[idx]._id = result._id;
              // Opcional: actualizar otros campos si el backend los modifica
              grupos[idx] = { ...grupos[idx], ...result };
              CacheService.set(collection, grupos);
            }
          }
          return result;
        }
        case 'update':
          return await this.updateOne(collection, id, data);
        case 'delete':
          return await this.deleteOne(collection, id);
        case 'cobrar':
          return await this.registrarCobro(collection, id, data);
        default:
          Logger.error('Acción desconocida', action);
          return false;
      }
    } catch (error) {
      Logger.error('Error ejecutando operación', error);
      throw error;
    }
  },
  
  // Insertar un documento
  async insertOne(collection, document) {
    let url = `${this.apiBaseUrl}/${collection}`;
    if (collection === 'activos' || collection === 'pasivos') {
      url = `${this.apiBaseUrl}/patrimonio/${collection}`;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(document)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error insertando documento: ${error.error || response.statusText}`);
    }

    const result = await response.json();
    Logger.success(`Documento insertado en ${collection}`);
    return result;
  },
  
  // Buscar documentos
  async find(collection) {
    const url = `${this.apiBaseUrl}/${collection}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error buscando documentos: ${error.error || response.statusText}`);
    }

    const result = await response.json();
    return result.data || [];
  },
  
  // Actualizar un documento
  async updateOne(collection, id, updateData) {
    let url = `${this.apiBaseUrl}/${collection}/${id}`;
    if (collection === 'activos' || collection === 'pasivos') {
      url = `${this.apiBaseUrl}/patrimonio/${collection}/${id}`;
    }
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error actualizando documento: ${error.error || response.statusText}`);
    }

    const result = await response.json();
    Logger.success(`Documento actualizado en ${collection}`);
    return result;
  },
  
  // Registrar cobro de préstamo
  async registrarCobro(collection, id, data) {
    const url = `${this.apiBaseUrl}/${collection}/${id}/cobrar`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error registrando cobro: ${error.error || response.statusText}`);
    }

    const result = await response.json();
    Logger.success(`Cobro registrado en ${collection}`);
    return result;
  },
  
  // Eliminar un documento
  async deleteOne(collection, id) {
    let url = `${this.apiBaseUrl}/${collection}/${id}`;
    if (collection === 'activos' || collection === 'pasivos') {
      url = `${this.apiBaseUrl}/patrimonio/${collection}/${id}`;
    }
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error eliminando documento: ${error.error || response.statusText}`);
    }

    const result = await response.json();
    Logger.success(`Documento eliminado de ${collection}`);
    return result;
  },
  
  // Cargar datos desde el backend
  async loadFromCloud(collection) {
    if (!this.isOnline) {
      Logger.warn('Backend no disponible, usando solo localStorage');
      return null;
    }

    try {
      // Manejar rutas especiales para patrimonio
      let url = `${this.apiBaseUrl}/${collection}`;
      if (collection === 'activos' || collection === 'pasivos') {
        url = `${this.apiBaseUrl}/patrimonio/${collection}`;
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 segundos timeout para Render
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Error cargando ${collection}: ${response.status}`);
      }

      const result = await response.json();
      
      // Manejar ambos formatos: { data: [...] } o directamente [...]
      let documents;
      if (Array.isArray(result)) {
        documents = result;
      } else if (result.data && Array.isArray(result.data)) {
        documents = result.data;
      } else {
        documents = [];
      }
      
      // Actualizar timestamp de esta colección
      this.updateCollectionTimestamp(collection);
      this.lastSyncTime = Date.now();
      
      Logger.success(`${documents.length} documentos cargados de ${collection} desde el backend`);
      return documents;
    } catch (error) {
      if (error.name === 'AbortError') {
        Logger.error(`Timeout cargando ${collection} desde el backend`);
      } else {
        Logger.error(`Error cargando ${collection} desde el backend: ${error.message}`);
      }
      return null;
    }
  },
  
  // Guardar cola en localStorage
  saveSyncQueue() {
    try {
      localStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      Logger.error('Error guardando cola de sincronización', error);
    }
  },
  
  // Cargar cola desde localStorage
  loadSyncQueue() {
    try {
      const saved = localStorage.getItem('sync_queue');
      if (saved) {
        this.syncQueue = JSON.parse(saved);
        Logger.log(`Cola de sincronización cargada (${this.syncQueue.length} operaciones)`);
      }
    } catch (error) {
      Logger.error('Error cargando cola de sincronización', error);
      this.syncQueue = [];
    }
  },
  
  // Iniciar sincronización automática
  startAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.syncQueue.length > 0) {
        this.processSyncQueue();
      }
    }, 30000); // Cada 30 segundos
  },
  
  // Detener sincronización automática
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  },
  
  // Forzar sincronización inmediata
  forceSync() {
    if (this.isOnline) {
      this.processSyncQueue();
    } else {
      Logger.warn('No se puede sincronizar sin conexión');
    }
  },
  
  // Sincronizar colección completa al servidor (para configuraciones)
  async syncToServer(collection, data) {
    if (!this.isOnline) {
      Logger.warn('Backend no disponible, datos guardados solo localmente');
      return;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/${collection}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Error sincronizando ${collection}`);
      }

      Logger.success(`${collection} sincronizado correctamente`);
    } catch (error) {
      Logger.error(`Error sincronizando ${collection}`, error);
    }
  },

  // ===== NUEVOS MÉTODOS DE OPTIMIZACIÓN =====

  // Sincronización selectiva de una colección específica
  async syncCollection(collection, forceReload = false) {
    if (!this.isOnline) {
      Logger.log(`Colección ${collection} - usando datos locales (sin conexión)`);
      return CacheService.get(collection) || [];
    }

    try {
      // Verificar si necesitamos recargar según timestamp
      if (!forceReload && !this.shouldSyncCollection(collection)) {
        Logger.log(`Colección ${collection} actualizada - usando caché local`);
        return CacheService.get(collection) || [];
      }

      // Cargar desde servidor
      const datos = await this.loadFromCloud(collection);
      if (datos && datos.length >= 0) {
        CacheService.set(collection, datos);
        this.updateCollectionTimestamp(collection); // Actualizar timestamp
        Logger.success(`${collection}: ${datos.length} registros sincronizados`);
        return datos;
      } else {
        Logger.warn(`${collection}: sin datos en servidor, usando caché local`);
        return CacheService.get(collection) || [];
      }
    } catch (error) {
      Logger.error(`Error sincronizando ${collection}: ${error.message}`);
      return CacheService.get(collection) || [];
    }
  },

  // Verificar si una colección necesita sincronización
  shouldSyncCollection(collection) {
    const lastSync = this.collectionTimestamps[collection];
    if (!lastSync) return true; // Primera carga
    
    const now = Date.now();
    const maxAge = 120000; // 2 minutos (puedes ajustar)
    
    return (now - lastSync) > maxAge;
  },

  // Actualizar timestamp de colección
  updateCollectionTimestamp(collection) {
    this.collectionTimestamps[collection] = Date.now();
    this.saveCollectionTimestamps();
  },

  // Guardar timestamps en localStorage
  saveCollectionTimestamps() {
    try {
      localStorage.setItem('collection_timestamps', JSON.stringify(this.collectionTimestamps));
    } catch (error) {
      Logger.error('Error guardando timestamps', error);
    }
  },

  // Cargar timestamps desde localStorage
  loadCollectionTimestamps() {
    try {
      const saved = localStorage.getItem('collection_timestamps');
      if (saved) {
        this.collectionTimestamps = JSON.parse(saved);
      }
    } catch (error) {
      Logger.error('Error cargando timestamps', error);
      this.collectionTimestamps = {};
    }
  },

  // Verificación periódica de timestamps (petición ligera)
  startTimestampCheck() {
    if (this.timestampCheckInterval) {
      clearInterval(this.timestampCheckInterval);
    }
    
    this.timestampCheckInterval = setInterval(() => {
      if (this.isOnline) {
        this.updateStatus(); // Actualizar indicador de tiempo
      }
    }, 60000); // Cada 60 segundos
  },

  // Cargar todas las colecciones (solo al iniciar la app)
  async loadAllCollections() {
    Logger.log('Cargando todas las colecciones desde MongoDB Atlas...');
    
    const colecciones = [
      'gastos',
      'ingresos',
      'deudas',
      'prestamos',
      'activos',
      'pasivos',
      'ahorros',
      'custodias',
      'auditorias',
      'configuracion_cuentas',
      'cashflow_ingresos',
      'cashflow_gastos'
    ];
    
    let cargadas = 0;
    const promises = [];
    
    // Cargar configuración de formularios (estructura diferente)
    promises.push(
      ConfigModel.loadFromAtlas()
        .then(() => {
          cargadas++;
          Logger.success('Configuración de formularios cargada desde MongoDB');
        })
        .catch(error => {
          Logger.warn('Error cargando configuración de formularios');
        })
    );
    
    // Cargar todas las colecciones en paralelo (más eficiente que secuencial)
    for (const coleccion of colecciones) {
      promises.push(
        this.loadFromCloud(coleccion)
          .then(datos => {
            if (datos && datos.length >= 0) {
              CacheService.set(coleccion, datos);
              cargadas++;
              Logger.success(`${coleccion}: ${datos.length} registros cargados`);
            } else {
              Logger.log(`${coleccion}: sin datos en servidor`);
            }
          })
          .catch(error => {
            Logger.warn(`Error cargando ${coleccion}: ${error.message}`);
          })
      );
    }
    
    await Promise.all(promises);
    
    if (cargadas > 0) {
      Logger.success(`✓ ${cargadas} colecciones cargadas desde MongoDB Atlas`);
    } else {
      Logger.log('No se encontraron datos en el servidor o no hay conexión');
    }
    
    this.lastSyncTime = Date.now();
    this.updateStatus();
    
    return cargadas;
  }
};

// Exportar para uso global
window.SyncService = SyncService;
