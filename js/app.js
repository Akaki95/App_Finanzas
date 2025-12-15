// App Principal - Punto de entrada de la aplicación
(function() {
  'use strict';
  
  // Inicializar la aplicación
  async function init() {
    Logger.log('Iniciando aplicación de Finanzas Personales...');
    
    // Inicializar tema
    ConfigController.initTheme();

    // Inicializar servicios
    SyncService.init();

    // OPTIMIZACIÓN: Cargar TODOS los datos solo una vez al iniciar
    await cargarDatosIniciales();

    // Sincronizar cola pendiente
    if (SyncService.isOnline) {
      SyncService.processSyncQueue();
    }

    // Inicializar modelos
    AuditoriaModel.init();

    // Aplicar reglas automáticas al iniciar
    aplicarReglasAutomaticas();

    // Programar aplicación de reglas automáticas cada hora
    setInterval(aplicarReglasAutomaticas, 3600000); // 1 hora

    // OPTIMIZACIÓN: Registrar rutas con sincronización SELECTIVA
    const renderWithSelectiveSync = async (renderFn, collections) => {
      // Sincronizar solo las colecciones necesarias para esta vista
      // FORZAR RECARGA para que siempre tenga datos frescos al navegar
      if (collections && collections.length > 0) {
        for (const collection of collections) {
          await SyncService.syncCollection(collection, true); // true = forceReload
        }
      }
      // Renderizar con los datos actualizados
      await renderFn();
    };

    Router.register('dashboard', () => renderWithSelectiveSync(() => DashboardView.render(), ['gastos', 'ingresos', 'deudas', 'prestamos', 'activos', 'pasivos']));
    Router.register('gastos', () => renderWithSelectiveSync(() => GastosController.render(), ['gastos']));
    Router.register('ingresos', () => renderWithSelectiveSync(() => IngresosController.render(), ['ingresos']));
    Router.register('deudas', () => renderWithSelectiveSync(() => DeudasController.render(), ['deudas']));
    Router.register('prestamos', () => renderWithSelectiveSync(() => PrestamosController.render(), ['prestamos']));
    Router.register('patrimonio', () => renderWithSelectiveSync(() => PatrimonioController.render(), ['activos', 'pasivos']));
    Router.register('cashflow', () => renderWithSelectiveSync(() => CashflowController.render(), ['cashflow_ingresos', 'cashflow_gastos']));
    Router.register('ahorros', () => renderWithSelectiveSync(() => AhorrosController.render(), ['ahorros']));
    Router.register('custodia', () => renderWithSelectiveSync(() => CustodiaController.render(), ['custodias']));
    Router.register('auditoria', () => renderWithSelectiveSync(() => AuditoriaController.render(), ['auditorias']));
    Router.register('configuracion', () => renderWithSelectiveSync(() => ConfigController.render(), ['configuracion_cuentas']));

    // Inicializar router
    Router.init();
    
    // Forzar navegación inicial al Dashboard si no hay hash
    if (!window.location.hash) {
      Router.navigate('dashboard');
    } else {
      Router.handleRoute();
    }

    // Configurar modal
    setupModal();

    // Configurar cierre de modales de formularios
    setupFormModals();

    // Configurar menú hamburguesa responsive (después del router)
    setupMobileMenu();

    // Configurar botón de sincronización manual
    setupSyncButton();
    
    // Si quieres cargar datos de ejemplo, descomenta la siguiente línea:
    // cargarDatosDeEjemplo();
    
    Logger.success('Aplicación iniciada correctamente');
  }
  
  // Configurar modal
  function setupModal() {
    const modal = document.getElementById('modal');
    const closeBtn = modal.querySelector('.modal-close');
    
    // Función global para cerrar modal
    window.closeModal = function() {
      modal.classList.remove('show');
    };
    
    // Cerrar modal al hacer clic en X
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('show');
    });
    
    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
      }
    });
    
    // Cerrar modal con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('show')) {
        modal.classList.remove('show');
      }
    });
  }

  // Modal de confirmación personalizado
  window.showConfirmModal = function(message, onConfirm, onCancel, confirmText = 'Confirmar') {
    const modal = document.getElementById('confirm-modal');
    const messageEl = document.getElementById('confirm-modal-message');
    const confirmBtn = document.getElementById('confirm-modal-confirm');
    const cancelBtn = document.getElementById('confirm-modal-cancel');

    // Establecer mensaje
    messageEl.textContent = message;
    
    // Personalizar texto del botón de confirmación
    confirmBtn.textContent = confirmText;
    
    // Si no hay callback de cancelar, ocultar botón de cancelar
    if (!onCancel && confirmText === 'Entendido') {
      cancelBtn.style.display = 'none';
    } else {
      cancelBtn.style.display = '';
    }

    // Mostrar modal
    modal.classList.add('show');

    // Bloquear scroll del body
    document.body.style.overflow = 'hidden';

    // Función para cerrar modal
    const closeModal = () => {
      modal.classList.remove('show');
      document.body.style.overflow = '';
      // Limpiar event listeners
      confirmBtn.onclick = null;
      cancelBtn.onclick = null;
      modal.onclick = null;
      document.removeEventListener('keydown', escHandler);
      // Restaurar texto del botón
      confirmBtn.textContent = 'Confirmar';
      cancelBtn.style.display = '';
    };

    // Handler para ESC
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        if (onCancel) onCancel();
      }
    };

    // Evento confirmar
    confirmBtn.onclick = () => {
      closeModal();
      if (onConfirm) onConfirm();
    };

    // Evento cancelar
    cancelBtn.onclick = () => {
      closeModal();
      if (onCancel) onCancel();
    };

    // Cerrar al hacer clic fuera
    modal.onclick = (e) => {
      if (e.target === modal) {
        closeModal();
        if (onCancel) onCancel();
      }
    };

    // Prevenir que el clic en el contenido cierre el modal
    modal.querySelector('.confirm-modal-content').onclick = (e) => {
      e.stopPropagation();
    };

    // ESC para cerrar
    document.addEventListener('keydown', escHandler);
  }
  
  // Cargar datos iniciales desde el servidor (OPTIMIZADO)
  async function cargarDatosIniciales() {
    Logger.log('Cargando datos desde MongoDB Atlas...');
    
    // Usar el nuevo método optimizado de SyncService
    const cargadas = await SyncService.loadAllCollections();
    
    if (cargadas > 0) {
      Logger.success(`✓ ${cargadas} colecciones cargadas desde MongoDB Atlas`);
    } else {
      Logger.log('No se encontraron datos en el servidor o no hay conexión');
    }
  }
  
  // Configurar botón de sincronización manual
  function setupSyncButton() {
    const syncBtn = document.getElementById('sync-btn');
    const syncStatus = document.getElementById('sync-status');
    const syncText = syncStatus.querySelector('.sync-text');
    
    if (!syncBtn) return;
    
    syncBtn.addEventListener('click', async () => {
      // Deshabilitar botón durante sincronización
      syncBtn.disabled = true;
      syncBtn.style.animation = 'spin 1s linear infinite';
      syncText.textContent = 'Sincronizando...';
      
      try {
        await cargarDatosIniciales();
        
        // Recargar la vista actual
        const currentRoute = Router.currentRoute || 'dashboard';
        Router.navigate(currentRoute);
        
        syncText.textContent = 'Sincronizado';
        Logger.success('Sincronización manual completada');
      } catch (error) {
        syncText.textContent = 'Error';
        Logger.error('Error en sincronización manual', error);
      } finally {
        syncBtn.disabled = false;
        syncBtn.style.animation = '';
      }
    });
  }

  // Configurar modales de formularios (gastos, ingresos, deudas, etc)
  function setupFormModals() {
    // Cerrar modales al hacer clic fuera del contenido
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('show');
      }
    });

    // Cerrar modales con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal-overlay.show');
        openModals.forEach(modal => modal.classList.remove('show'));
      }
    });
  }
  
  // Cargar datos de ejemplo si la aplicación está vacía
  function cargarDatosDeEjemplo() {
    // Solo cargar si no hay datos
    if (GastoModel.getAll().length > 0) {
      Logger.log('Ya existen datos, omitiendo datos de ejemplo');
      return;
    }
    
    Logger.log('Cargando datos de ejemplo...');
    
    try {
      // Datos de ejemplo para gastos
      const gastosEjemplo = [
        { fecha: '2025-12-01', monto: 45.50, categoria: 'Comida', descripcion: 'Supermercado semanal' },
        { fecha: '2025-12-03', monto: 30.00, categoria: 'Transporte', descripcion: 'Recarga transporte público' },
        { fecha: '2025-12-05', monto: 60.00, categoria: 'Ocio', descripcion: 'Cena con amigos' },
        { fecha: '2025-11-28', monto: 120.00, categoria: 'Servicios', descripcion: 'Factura de luz' },
        { fecha: '2025-11-25', monto: 25.00, categoria: 'Salud', descripcion: 'Farmacia' }
      ];
      
      gastosEjemplo.forEach(g => {
        try {
          GastoModel.create(g);
        } catch (error) {
          Logger.error('Error creando gasto de ejemplo', error);
        }
      });
      
      // Datos de ejemplo para ingresos
      const ingresosEjemplo = [
        { fecha: '2025-12-01', monto: 2000.00, tipo: 'Salario', descripcion: 'Salario mensual' },
        { fecha: '2025-11-01', monto: 2000.00, tipo: 'Salario', descripcion: 'Salario mensual' },
        { fecha: '2025-12-03', monto: 150.00, tipo: 'Freelance', descripcion: 'Proyecto web' }
      ];
      
      ingresosEjemplo.forEach(i => {
        try {
          IngresoModel.create(i);
        } catch (error) {
          Logger.error('Error creando ingreso de ejemplo', error);
        }
      });
      
      // Datos de ejemplo para deudas
      const deudasEjemplo = [
        { 
          acreedor: 'Banco Santander', 
          montoInicial: 5000.00, 
          montoPendiente: 3500.00, 
          fechaInicio: '2025-01-15',
          fechaVencimiento: '2026-01-15',
          descripcion: 'Préstamo personal'
        }
      ];
      
      deudasEjemplo.forEach(d => {
        try {
          DeudaModel.create(d);
        } catch (error) {
          Logger.error('Error creando deuda de ejemplo', error);
        }
      });
      
      // Datos de ejemplo para préstamos
      const prestamosEjemplo = [
        { 
          persona: 'Juan Pérez', 
          montoInicial: 200.00, 
          montoPendiente: 100.00, 
          fechaPrestamo: '2025-11-01',
          fechaDevolucion: '2025-12-31',
          descripcion: 'Préstamo personal'
        }
      ];
      
      prestamosEjemplo.forEach(p => {
        try {
          PrestamoModel.create(p);
        } catch (error) {
          Logger.error('Error creando préstamo de ejemplo', error);
        }
      });
      
      // Datos de ejemplo para activos
      const activosEjemplo = [
        { nombre: 'Coche', valor: 12000.00, descripcion: 'Vehículo personal' },
        { nombre: 'Ahorros', valor: 5000.00, descripcion: 'Cuenta de ahorros' }
      ];
      
      activosEjemplo.forEach(a => {
        try {
          PatrimonioModel.createActivo(a);
        } catch (error) {
          Logger.error('Error creando activo de ejemplo', error);
        }
      });
      
      // Datos de ejemplo para pasivos
      const pasivosEjemplo = [
        { nombre: 'Hipoteca', valor: 50000.00, descripcion: 'Préstamo hipotecario' }
      ];
      
      pasivosEjemplo.forEach(p => {
        try {
          PatrimonioModel.createPasivo(p);
        } catch (error) {
          Logger.error('Error creando pasivo de ejemplo', error);
        }
      });
      
      Logger.success('Datos de ejemplo cargados exitosamente');
    } catch (error) {
      Logger.error('Error cargando datos de ejemplo', error);
    }
  }
  
  // Configurar menú hamburguesa responsive
  function setupMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('nav');
    const navBtns = nav.querySelectorAll('.nav-btn');
    
    if (!menuToggle || !nav) return;
    
    // Toggle del menú
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      nav.classList.toggle('show');
      menuToggle.textContent = nav.classList.contains('show') ? '✕' : '☰';
    });
    
    // Cerrar menú al hacer clic en un item (usar delegación de eventos)
    nav.addEventListener('click', (e) => {
      if (e.target.classList.contains('nav-btn')) {
        // Pequeño delay para que se vea la selección
        setTimeout(() => {
          nav.classList.remove('show');
          menuToggle.textContent = '☰';
        }, 150);
      }
    });
    
    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (nav.classList.contains('show') && 
          !nav.contains(e.target) && 
          e.target !== menuToggle) {
        nav.classList.remove('show');
        menuToggle.textContent = '☰';
      }
    });
    
    // Cerrar menú al cambiar de ruta (hashchange)
    window.addEventListener('hashchange', () => {
      if (nav.classList.contains('show')) {
        nav.classList.remove('show');
        menuToggle.textContent = '☰';
      }
    });
    
    // Cerrar menú al redimensionar ventana (si se vuelve grande)
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && nav.classList.contains('show')) {
        nav.classList.remove('show');
        menuToggle.textContent = '☰';
      }
    });
  }
  
  // Aplicar reglas automáticas de gastos e ingresos
  function aplicarReglasAutomaticas() {
    try {
      if (typeof GastoAutomaticoModel !== 'undefined') {
        const gastosGenerados = GastoAutomaticoModel.aplicarReglas();
        if (gastosGenerados > 0) {
          Logger.success(`${gastosGenerados} gasto(s) automático(s) generado(s)`);
        }
      }
      
      if (typeof IngresoAutomaticoModel !== 'undefined') {
        const ingresosGenerados = IngresoAutomaticoModel.aplicarReglas();
        if (ingresosGenerados > 0) {
          Logger.success(`${ingresosGenerados} ingreso(s) automático(s) generado(s)`);
        }
      }
    } catch (error) {
      Logger.error('Error aplicando reglas automáticas', error);
    }
  }
  
  // Iniciar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();

