// Router - Sistema de routing hash-based para SPA
const Router = {
  routes: {},
  currentRoute: null,
  
  // Registrar una ruta
  register(path, handler) {
    this.routes[path] = handler;
    Logger.log(`Ruta registrada: ${path}`);
  },
  
  // Inicializar el router
  init() {
    // Escuchar cambios en el hash
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
    
    // Configurar navegación con botones de navegación y configuración
    document.querySelectorAll('.nav-btn, .config-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const route = e.target.dataset.route;
        this.navigate(route);
      });
    });
    
    Logger.log('Router inicializado');
  },
  
  // Manejar cambio de ruta
  handleRoute() {
    const hash = window.location.hash.slice(1) || 'dashboard';
    const route = hash.split('?')[0]; // Remover query params si existen
    
    Logger.log(`Navegando a: ${route}`);
    
    // Actualizar botones de navegación
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.route === route) {
        btn.classList.add('active');
      }
    });
    
    // Ejecutar handler de la ruta
    if (this.routes[route]) {
      this.currentRoute = route;
      this.routes[route]();
    } else {
      Logger.warn(`Ruta no encontrada: ${route}`);
      this.navigate('dashboard');
    }
  },
  
  // Navegar a una ruta
  navigate(path) {
    window.location.hash = path;
  },
  
  // Obtener parámetros de la URL
  getParams() {
    const hash = window.location.hash.slice(1);
    const queryString = hash.split('?')[1];
    if (!queryString) return {};
    
    const params = {};
    queryString.split('&').forEach(param => {
      const [key, value] = param.split('=');
      params[key] = decodeURIComponent(value);
    });
    return params;
  },
  
  // Recargar la ruta actual
  reload() {
    if (this.currentRoute && this.routes[this.currentRoute]) {
      this.routes[this.currentRoute]();
    }
  }
};

// Exportar para uso global
window.Router = Router;
