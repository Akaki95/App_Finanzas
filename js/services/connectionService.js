// Connection Service - Verifica la conexión con el backend
const ConnectionService = {
  checkInterval: null,
  retryAttempts: 0,
  maxRetryAttempts: 3,
  retryDelay: 10000, // 10 segundos entre reintentos automáticos
  connectionTimeout: 5000, // 5 segundos de timeout

  // Elementos del DOM
  screen: null,
  title: null,
  message: null,
  retryBtn: null,

  init() {
    this.screen = document.getElementById('connection-screen');
    this.title = document.getElementById('connection-title');
    this.message = document.getElementById('connection-message');
    this.retryBtn = document.getElementById('connection-retry-btn');

    // Evento del botón reintentar
    if (this.retryBtn) {
      this.retryBtn.addEventListener('click', () => this.manualRetry());
    }

    // Verificar conexión inicial
    this.checkConnection();
  },

  async checkConnection() {
    try {
      this.showConnecting();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.connectionTimeout);

      const apiBase = window.APP_ENV?.API_BASE?.replace('/api', '') || 'http://localhost:3000';
      const response = await fetch(`${apiBase}/api/health`, {
        method: 'GET',
        mode: 'cors',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'ok') {
          this.onConnectionSuccess();
          return true;
        }
      }

      throw new Error('Respuesta no válida del servidor');
    } catch (error) {
      console.error('Error al verificar conexión:', error);
      this.onConnectionError(error);
      return false;
    }
  },

  showConnecting() {
    if (!this.screen) return;
    
    this.screen.classList.remove('hidden', 'error', 'retrying');
    this.screen.classList.add('connecting');
    
    if (this.title) {
      this.title.textContent = 'Conectando con el servidor';
      this.title.classList.add('loading');
    }
    
    if (this.message) {
      this.message.textContent = 'Por favor espera un momento';
    }
    
    if (this.retryBtn) {
      this.retryBtn.classList.add('hidden');
    }
  },

  onConnectionSuccess() {
    console.log('✅ Conexión exitosa con el backend');
    this.retryAttempts = 0;

    // Ocultar pantalla de conexión
    if (this.screen) {
      this.screen.classList.add('hidden');
    }

    // Detener reintentos automáticos si existen
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    // Iniciar monitoreo periódico (cada 30 segundos)
    this.startPeriodicCheck();
  },

  onConnectionError(error) {
    console.error('❌ Error de conexión:', error);
    this.retryAttempts++;

    if (!this.screen) return;

    this.screen.classList.remove('hidden', 'connecting');
    this.screen.classList.add('error');

    if (this.title) {
      this.title.textContent = 'No se pudo conectar al servidor';
      this.title.classList.remove('loading');
    }

    if (this.message) {
      if (error.name === 'AbortError') {
        this.message.textContent = 'El servidor no responde. Puede que esté iniciándose.';
      } else {
        this.message.textContent = 'Verifica tu conexión a internet o intenta más tarde.';
      }
    }

    // Mostrar botón de reintento si es necesario
    if (this.retryBtn && this.retryAttempts >= this.maxRetryAttempts) {
      this.retryBtn.classList.remove('hidden');
      if (this.checkInterval) {
        clearInterval(this.checkInterval);
        this.checkInterval = null;
      }
    } else {
      // Reintentar automáticamente
      this.scheduleAutoRetry();
    }
  },

  scheduleAutoRetry() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    if (this.screen) {
      this.screen.classList.add('retrying');
    }

    if (this.title) {
      this.title.textContent = 'Reintentando conexión';
      this.title.classList.add('loading');
    }

    if (this.message) {
      this.message.textContent = `Intento ${this.retryAttempts} de ${this.maxRetryAttempts}...`;
    }

    this.checkInterval = setInterval(() => {
      this.checkConnection();
    }, this.retryDelay);
  },

  manualRetry() {
    this.retryAttempts = 0;
    if (this.retryBtn) {
      this.retryBtn.classList.add('hidden');
    }
    this.checkConnection();
  },

  startPeriodicCheck() {
    // Verificar conexión cada 30 segundos en background
    setInterval(() => {
      this.silentCheck();
    }, 30000);
  },

  async silentCheck() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.connectionTimeout);

      const apiBase = window.APP_ENV?.API_BASE?.replace('/api', '') || 'http://localhost:3000';
      const response = await fetch(`${apiBase}/api/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Si falla la verificación silenciosa, mostrar pantalla
        this.retryAttempts = 0;
        this.checkConnection();
      }
    } catch (error) {
      // Si falla la verificación silenciosa, mostrar pantalla
      console.warn('Conexión perdida, mostrando pantalla de reconexión');
      this.retryAttempts = 0;
      this.checkConnection();
    }
  }
};

// Exportar para uso global
window.ConnectionService = ConnectionService;
