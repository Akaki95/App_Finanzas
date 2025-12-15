// Cache Service - Gestión de caché local usando localStorage
const CacheService = {
  prefix: 'finanzas_',
  
  // Guardar datos en caché
  set(key, data) {
    try {
      const cacheKey = this.prefix + key;
      const serialized = JSON.stringify({
        data: data,
        timestamp: Date.now()
      });
      localStorage.setItem(cacheKey, serialized);
      Logger.log(`Datos guardados en caché: ${key}`);
      return true;
    } catch (error) {
      Logger.error('Error guardando en caché', error);
      return false;
    }
  },
  
  // Obtener datos de caché
  get(key) {
    try {
      const cacheKey = this.prefix + key;
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) {
        Logger.log(`No hay datos en caché para: ${key}`);
        return null;
      }
      
      const parsed = JSON.parse(cached);
      Logger.log(`Datos recuperados de caché: ${key}`);
      return parsed.data;
    } catch (error) {
      Logger.error('Error leyendo de caché', error);
      return null;
    }
  },
  
  // Eliminar datos de caché
  remove(key) {
    try {
      const cacheKey = this.prefix + key;
      localStorage.removeItem(cacheKey);
      Logger.log(`Datos eliminados de caché: ${key}`);
      return true;
    } catch (error) {
      Logger.error('Error eliminando de caché', error);
      return false;
    }
  },
  
  // Limpiar toda la caché
  clear() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      Logger.log('Caché limpiada completamente');
      return true;
    } catch (error) {
      Logger.error('Error limpiando caché', error);
      return false;
    }
  },
  
  // Verificar si existe una clave en caché
  has(key) {
    const cacheKey = this.prefix + key;
    return localStorage.getItem(cacheKey) !== null;
  },
  
  // Obtener todas las claves de caché
  getAllKeys() {
    const keys = Object.keys(localStorage);
    return keys
      .filter(key => key.startsWith(this.prefix))
      .map(key => key.replace(this.prefix, ''));
  },
  
  // Obtener timestamp de la última actualización
  getTimestamp(key) {
    try {
      const cacheKey = this.prefix + key;
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;
      
      const parsed = JSON.parse(cached);
      return parsed.timestamp;
    } catch (error) {
      return null;
    }
  },
  
  // Verificar si los datos están obsoletos (más de X minutos)
  isStale(key, minutesOld = 30) {
    const timestamp = this.getTimestamp(key);
    if (!timestamp) return true;
    
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = diff / (1000 * 60);
    
    return minutes > minutesOld;
  }
};

// Exportar para uso global
window.CacheService = CacheService;

Logger.log('CacheService inicializado');
