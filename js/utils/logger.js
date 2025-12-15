// Logger - Sistema de logging simple
const Logger = {
  isEnabled: true,
  
  log(message, data = null) {
    if (!this.isEnabled) return;
    console.log(`[LOG] ${new Date().toISOString()} - ${message}`, data || '');
  },
  
  error(message, error = null) {
    if (!this.isEnabled) return;
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '');
  },
  
  warn(message, data = null) {
    if (!this.isEnabled) return;
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data || '');
  },
  
  info(message, data = null) {
    if (!this.isEnabled) return;
    console.info(`[INFO] ${new Date().toISOString()} - ${message}`, data || '');
  },
  
  success(message, data = null) {
    if (!this.isEnabled) return;
    console.log(`[SUCCESS] ${new Date().toISOString()} - ${message}`, data || '');
  }
};

// Exportar para uso global
window.Logger = Logger;
