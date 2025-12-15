// Modelo de Configuración - Gestiona la configuración de formularios
const ConfigModel = {
  STORAGE_KEY: 'finanzas_config',
  API_BASE: null, // Se cargará dinámicamente desde config.json
  // Cargar configuración externa (config.json) para la URL del backend
  async loadApiBase() {
    if (window.location.hostname === 'localhost') {
      this.API_BASE = 'http://localhost:3000/api';
      return;
    }
    try {
      const response = await fetch('js/config.json');
      if (!response.ok) throw new Error('No se pudo cargar config.json');
      const data = await response.json();
      this.API_BASE = data.API_BASE;
    } catch (e) {
      console.error('No se pudo cargar la URL del backend desde config.json:', e);
      this.API_BASE = '';
    }
  },

  // Configuración por defecto para cada módulo
  DEFAULT_CONFIG: {
    gastos: {
      campos: [
        { id: 'fecha', nombre: 'Fecha', tipo: 'date', obligatorio: true, sistema: true, orden: 1 },
        { id: 'monto', nombre: 'Monto (€)', tipo: 'number', obligatorio: true, sistema: true, orden: 2, step: '0.01', min: '0.01' },
        { 
          id: 'categoria', 
          nombre: 'Categoría', 
          tipo: 'select', 
          obligatorio: true, 
          sistema: false, 
          orden: 3,
          opciones: [
            { valor: 'Comida', etiqueta: '🍽️ Comida', icono: '🍽️' },
            { valor: 'Transporte', etiqueta: '🚗 Transporte', icono: '🚗' },
            { valor: 'Ocio', etiqueta: '🎮 Ocio', icono: '🎮' },
            { valor: 'Salud', etiqueta: '💊 Salud', icono: '💊' },
            { valor: 'Educación', etiqueta: '📚 Educación', icono: '📚' },
            { valor: 'Vivienda', etiqueta: '🏠 Vivienda', icono: '🏠' },
            { valor: 'Servicios', etiqueta: '💡 Servicios', icono: '💡' },
            { valor: 'Pago Deuda', etiqueta: '💳 Pago Deuda', icono: '💳' },
            { valor: 'Préstamo', etiqueta: '💸 Préstamo', icono: '💸' },
            { valor: 'Otros', etiqueta: '📦 Otros', icono: '📦' }
          ]
        },
        { id: 'descripcion', nombre: 'Descripción', tipo: 'textarea', obligatorio: false, sistema: false, orden: 4, rows: 3 }
      ]
    },
    ingresos: {
      campos: [
        { id: 'fecha', nombre: 'Fecha', tipo: 'date', obligatorio: true, sistema: true, orden: 1 },
        { id: 'monto', nombre: 'Monto (€)', tipo: 'number', obligatorio: true, sistema: true, orden: 2, step: '0.01', min: '0.01' },
        { 
          id: 'tipo', 
          nombre: 'Tipo', 
          tipo: 'select', 
          obligatorio: true, 
          sistema: false, 
          orden: 3,
          opciones: [
            { valor: 'Salario', etiqueta: '💼 Salario', icono: '💼' },
            { valor: 'Freelance', etiqueta: '💻 Freelance', icono: '💻' },
            { valor: 'Venta', etiqueta: '🏷️ Venta', icono: '🏷️' },
            { valor: 'Regalo', etiqueta: '🎁 Regalo', icono: '🎁' },
            { valor: 'Inversión', etiqueta: '📈 Inversión', icono: '📈' },
            { valor: 'Deuda', etiqueta: '💳 Deuda', icono: '💳' },
            { valor: 'Cobro Préstamo', etiqueta: '💸 Cobro Préstamo', icono: '💸' },
            { valor: 'Otros', etiqueta: '📦 Otros', icono: '📦' }
          ]
        },
        { id: 'descripcion', nombre: 'Descripción', tipo: 'textarea', obligatorio: false, sistema: false, orden: 4, rows: 3 }
      ]
    },
    deudas: {
      campos: [
        { id: 'acreedor', nombre: 'Acreedor', tipo: 'text', obligatorio: true, sistema: true, orden: 1 },
        { id: 'montoInicial', nombre: 'Monto Inicial (€)', tipo: 'number', obligatorio: true, sistema: true, orden: 2, step: '0.01', min: '0.01' },
        { id: 'montoPendiente', nombre: 'Monto Pendiente (€)', tipo: 'number', obligatorio: true, sistema: true, orden: 3, step: '0.01', min: '0' },
        { id: 'fechaInicio', nombre: 'Fecha Inicio', tipo: 'date', obligatorio: true, sistema: true, orden: 4 },
        { id: 'fechaVencimiento', nombre: 'Fecha Vencimiento', tipo: 'date', obligatorio: false, sistema: false, orden: 5 },
        { id: 'descripcion', nombre: 'Descripción', tipo: 'textarea', obligatorio: false, sistema: false, orden: 6, rows: 3 }
      ]
    },
    prestamos: {
      campos: [
        { id: 'persona', nombre: 'Persona', tipo: 'text', obligatorio: true, sistema: true, orden: 1 },
        { id: 'montoInicial', nombre: 'Monto Inicial (€)', tipo: 'number', obligatorio: true, sistema: true, orden: 2, step: '0.01', min: '0.01' },
        { id: 'montoPendiente', nombre: 'Monto Pendiente (€)', tipo: 'number', obligatorio: true, sistema: true, orden: 3, step: '0.01', min: '0' },
        { id: 'fechaPrestamo', nombre: 'Fecha Préstamo', tipo: 'date', obligatorio: true, sistema: true, orden: 4 },
        { id: 'fechaDevolucion', nombre: 'Fecha Devolución', tipo: 'date', obligatorio: false, sistema: false, orden: 5 },
        { id: 'descripcion', nombre: 'Descripción', tipo: 'textarea', obligatorio: false, sistema: false, orden: 6, rows: 3 }
      ]
    },
    patrimonio_activos: {
      campos: [
        { id: 'nombre', nombre: 'Nombre', tipo: 'text', obligatorio: true, sistema: true, orden: 1 },
        { id: 'valor', nombre: 'Valor (€)', tipo: 'number', obligatorio: true, sistema: true, orden: 2, step: '0.01', min: '0.01' },
        { id: 'descripcion', nombre: 'Descripción', tipo: 'textarea', obligatorio: false, sistema: false, orden: 3, rows: 2 }
      ],
      categorias: [
        { id: 'efectivo', nombre: 'Dinero Líquido', icono: '💵', ayuda: 'Dinero en efectivo, saldo disponible y ahorros', sistema: true },
        { id: 'cuentas', nombre: 'Cuentas Bancarias', icono: '🏦', ayuda: 'Dinero en cuentas corrientes, de ahorro, depósitos bancarios', sistema: true },
        { id: 'cuentas_cobrar', nombre: 'Cuentas por Cobrar', icono: '💶', ayuda: 'Dinero prestado a terceros pendiente de cobrar', sistema: true },
        { id: 'inversiones', nombre: 'Inversiones', icono: '📈', ayuda: 'Acciones, bonos, fondos de inversión, ETFs' },
        { id: 'inmuebles', nombre: 'Propiedades e Inmuebles', icono: '🏠', ayuda: 'Casas, pisos, locales, terrenos que posees' },
        { id: 'vehiculos', nombre: 'Vehículos', icono: '🚗', ayuda: 'Coches, motos, barcos que son de tu propiedad' },
        { id: 'negocios', nombre: 'Negocios Propios', icono: '💼', ayuda: 'Valor de empresas o negocios que posees' },
        { id: 'bienes', nombre: 'Bienes Físicos', icono: '💎', ayuda: 'Joyas, arte, colecciones, objetos de valor' },
        { id: 'digitales', nombre: 'Activos Digitales', icono: '₿', ayuda: 'Criptomonedas, NFTs, dominios web' },
        { id: 'pensiones', nombre: 'Planes de Pensiones', icono: '🏛️', ayuda: 'Planes de pensiones, seguros de vida con ahorro' },
        { id: 'otros_activos', nombre: 'Otros Activos', icono: '📦', ayuda: 'Cualquier otro activo que no encaje en las categorías anteriores' }
      ]
    },
    patrimonio_pasivos: {
      campos: [
        { id: 'nombre', nombre: 'Nombre', tipo: 'text', obligatorio: true, sistema: true, orden: 1 },
        { id: 'valor', nombre: 'Valor (€)', tipo: 'number', obligatorio: true, sistema: true, orden: 2, step: '0.01', min: '0.01' },
        { id: 'descripcion', nombre: 'Descripción', tipo: 'textarea', obligatorio: false, sistema: false, orden: 3, rows: 2 }
      ],
      categorias: [
        { id: 'deudas', nombre: 'Deudas Generales', icono: '📋', ayuda: 'Deudas pendientes de pago registradas', sistema: true },
        { id: 'hipotecas', nombre: 'Hipotecas', icono: '🏠', ayuda: 'Préstamos hipotecarios para vivienda' },
        { id: 'prestamos_personales', nombre: 'Préstamos Personales', icono: '💰', ayuda: 'Préstamos personales, créditos al consumo' },
        { id: 'coche', nombre: 'Préstamos de Vehículos', icono: '🚗', ayuda: 'Financiación de coches, motos' },
        { id: 'tarjetas', nombre: 'Tarjetas de Crédito', icono: '💳', ayuda: 'Deudas en tarjetas de crédito' },
        { id: 'estudiantiles', nombre: 'Préstamos Estudiantiles', icono: '🎓', ayuda: 'Préstamos para estudios, becas reembolsables' },
        { id: 'fiscales', nombre: 'Deudas Fiscales', icono: '🏛️', ayuda: 'Deudas con Hacienda, impuestos pendientes' },
        { id: 'empresariales', nombre: 'Deudas Empresariales', icono: '💼', ayuda: 'Deudas relacionadas con tu negocio' },
        { id: 'otros_pasivos', nombre: 'Otros Pasivos', icono: '📋', ayuda: 'Cualquier otra deuda que no encaje en las categorías anteriores' }
      ]
    }
  },

  // Biblioteca de iconos disponibles
  ICONOS: {
    finanzas: ['💰', '💵', '💴', '💶', '💷', '💳', '💸', '🏦', '📊', '📈', '📉', '💹', '🪙', '🥇', '🥈', '🥉', '💎', '💍', '👑', '📿', '🔮', '💠'],
    comida: ['🍽️', '🍕', '🍔', '🍟', '🌮', '🌯', '🥗', '🍱', '🍜', '🍝', '🍞', '🥐', '🍰', '☕', '🍺'],
    transporte: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🛵', '🚲', '🚂', '✈️', '🚁', '⛵'],
    vivienda: ['🏠', '🏡', '🏢', '🏬', '🏭', '🏗️', '🏘️', '🏚️', '🔑', '🚪', '🛋️', '🛏️', '🕌', '🕍', '⛪'],
    trabajo: ['💼', '💻', '⌨️', '🖥️', '📱', '📞', '📠', '📊', '📈', '📉', '🖨️', '🗂️'],
    ocio: ['🎮', '🎯', '🎲', '🎰', '🎪', '🎨', '🎬', '🎭', '🎤', '🎧', '🎵', '🎸', '🎹', '🎺', '🎻'],
    salud: ['💊', '💉', '🩺', '🩹', '🩼', '⚕️', '🏥', '🚑', '😷', '🧘'],
    educacion: ['📚', '📖', '📝', '✏️', '🖊️', '📓', '📔', '📕', '📗', '📘', '📙', '🎓', '🏫'],
    otros: [
      // ...iconos anteriores...
      '📦', '🎁', '🛍️', '🛒', '📌', '📍', '🔖', '🏷️', '💡', '🔧', '🔨', '⚙️', '🧰',
      // ...otros iconos...
      // Animales
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊',
      '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴',
      '🐿️', '🦔', '🐾', '🐉', '🐲', '🌵', '🌲', '🌳', '🌴', '🌱', '🌿', '☘️', '🍀', '🎋', '🎍', '🪴',
      // Ropa y calzado
      '👕', '👔', '👚', '👗', '👙', '👘', '🥻', '🩱', '🩲', '🩳', '👖', '👠', '👡', '👢', '👞', '👟', '🥾', '🥿', '🧦', '🧤', '🧣', '🧥', '🧢',
      // ...puedes seguir agregando más si lo deseas...
    ]
  },

  // Inicializar configuración
  async init() {
    await this.loadApiBase();
    let config = this.getLocalConfig();
    if (!config) {
      // Intentar cargar desde MongoDB
      Logger.log('No hay configuración local, cargando desde MongoDB...');
      try {
        await this.loadFromAtlas();
        config = this.getLocalConfig();
      } catch (error) {
        Logger.warn('No se pudo cargar desde MongoDB, usando configuración por defecto');
      }
      // Si aún no hay config, usar la por defecto
      if (!config) {
        this.saveLocalConfig(this.DEFAULT_CONFIG);
        // Sincronizar configuración por defecto con MongoDB
        await this.syncAllToAtlas();
        Logger.log('Usando configuración por defecto y sincronizando con MongoDB');
      }
    } else {
      // Migrar configuración existente si faltan categorías
      this.migrateConfig(config);
    }
    Logger.log('ConfigModel inicializado');
  },
  
  // Sincronizar toda la configuración local con Atlas
  async syncAllToAtlas() {
    const config = this.getLocalConfig();
    if (!config) return;
    
    const modulos = Object.keys(config);
    for (const modulo of modulos) {
      await this.syncToAtlas(modulo, config[modulo]);
    }
  },
  
  // Migrar configuración antigua agregando categorías faltantes
  migrateConfig(config) {
    let updated = false;
    const modulosActualizados = new Set(); // Usar Set para evitar duplicados
    
    // Inicializar patrimonio_activos si no existe
    if (!config.patrimonio_activos) {
      config.patrimonio_activos = this.DEFAULT_CONFIG.patrimonio_activos;
      updated = true;
      modulosActualizados.add('patrimonio_activos');
      Logger.log('patrimonio_activos inicializado con configuración por defecto');
    } else if (!config.patrimonio_activos.categorias) {
      config.patrimonio_activos.categorias = this.DEFAULT_CONFIG.patrimonio_activos.categorias;
      updated = true;
      modulosActualizados.add('patrimonio_activos');
      Logger.log('Categorías de activos inicializadas');
    } else {
      // Verificar y agregar categoría 'efectivo' en activos si no existe
        const efectivoIndex = config.patrimonio_activos.categorias.findIndex(cat => cat.id === 'efectivo');
        const efectivoDefault = this.DEFAULT_CONFIG.patrimonio_activos.categorias.find(cat => cat.id === 'efectivo');
        if (efectivoIndex === -1) {
          config.patrimonio_activos.categorias.unshift({ ...efectivoDefault });
          updated = true;
          modulosActualizados.add('patrimonio_activos');
          Logger.log('Categoría "efectivo" agregada a activos');
        } else {
          // Actualizar solo si hay diferencias
          const cat = config.patrimonio_activos.categorias[efectivoIndex];
          if (cat.nombre !== efectivoDefault.nombre || 
              cat.icono !== efectivoDefault.icono || 
              cat.ayuda !== efectivoDefault.ayuda || 
              !cat.sistema) {
            cat.nombre = efectivoDefault.nombre;
            cat.icono = efectivoDefault.icono;
            cat.ayuda = efectivoDefault.ayuda;
            cat.sistema = true;
            updated = true;
            modulosActualizados.add('patrimonio_activos');
            Logger.log('Categoría "efectivo" actualizada desde DEFAULT_CONFIG');
          }
        }
      
      // Verificar y marcar categoría 'cuentas' como sistema
        const cuentasIndex = config.patrimonio_activos.categorias.findIndex(cat => cat.id === 'cuentas');
        const cuentasDefault = this.DEFAULT_CONFIG.patrimonio_activos.categorias.find(cat => cat.id === 'cuentas');
        if (cuentasIndex !== -1) {
          const cat = config.patrimonio_activos.categorias[cuentasIndex];
          if (cat.nombre !== cuentasDefault.nombre || 
              cat.icono !== cuentasDefault.icono || 
              cat.ayuda !== cuentasDefault.ayuda || 
              !cat.sistema) {
            cat.nombre = cuentasDefault.nombre;
            cat.icono = cuentasDefault.icono;
            cat.ayuda = cuentasDefault.ayuda;
            cat.sistema = true;
            updated = true;
            modulosActualizados.push('patrimonio_activos');
            Logger.log('Categoría "cuentas" actualizada desde DEFAULT_CONFIG');
          }
        }
      
      // Verificar y agregar categoría 'cuentas_cobrar' en activos si no existe
        const cuentasCobrarIndex = config.patrimonio_activos.categorias.findIndex(cat => cat.id === 'cuentas_cobrar');
        const cuentasCobrarDefault = this.DEFAULT_CONFIG.patrimonio_activos.categorias.find(cat => cat.id === 'cuentas_cobrar');
        if (cuentasCobrarIndex === -1) {
          const insertIndex = config.patrimonio_activos.categorias.findIndex(cat => cat.id === 'cuentas');
          if (insertIndex !== -1) {
            config.patrimonio_activos.categorias.splice(insertIndex + 1, 0, { ...cuentasCobrarDefault });
          } else {
            config.patrimonio_activos.categorias.unshift({ ...cuentasCobrarDefault });
          }
          updated = true;
          modulosActualizados.add('patrimonio_activos');
          Logger.log('Categoría "cuentas_cobrar" agregada a activos');
        } else {
          // Actualizar solo si hay diferencias
          const cat = config.patrimonio_activos.categorias[cuentasCobrarIndex];
          if (cat.nombre !== cuentasCobrarDefault.nombre || 
              cat.icono !== cuentasCobrarDefault.icono || 
              cat.ayuda !== cuentasCobrarDefault.ayuda || 
              !cat.sistema) {
            cat.nombre = cuentasCobrarDefault.nombre;
            cat.icono = cuentasCobrarDefault.icono;
            cat.ayuda = cuentasCobrarDefault.ayuda;
            cat.sistema = true;
            updated = true;
            modulosActualizados.push('patrimonio_activos');
            Logger.log('Categoría "cuentas_cobrar" actualizada desde DEFAULT_CONFIG');
          }
        }
    }
    
    // Inicializar patrimonio_pasivos si no existe
    if (!config.patrimonio_pasivos) {
      config.patrimonio_pasivos = this.DEFAULT_CONFIG.patrimonio_pasivos;
      updated = true;
      modulosActualizados.add('patrimonio_pasivos');
      Logger.log('patrimonio_pasivos inicializado con configuración por defecto');
    } else if (!config.patrimonio_pasivos.categorias) {
      config.patrimonio_pasivos.categorias = this.DEFAULT_CONFIG.patrimonio_pasivos.categorias;
      updated = true;
      modulosActualizados.add('patrimonio_pasivos');
      Logger.log('Categorías de pasivos inicializadas');
    } else {
      // Verificar y agregar categoría 'deudas' en pasivos si no existe
      const deudasIndex = config.patrimonio_pasivos.categorias.findIndex(cat => cat.id === 'deudas');
      if (deudasIndex === -1) {
        config.patrimonio_pasivos.categorias.unshift(
          { id: 'deudas', nombre: 'Deudas Generales', icono: '📋', ayuda: 'Deudas pendientes de pago registradas', sistema: true }
        );
        updated = true;
        modulosActualizados.add('patrimonio_pasivos');
        Logger.log('Categoría "deudas" agregada a pasivos');
      } else if (!config.patrimonio_pasivos.categorias[deudasIndex].sistema) {
        // Actualizar categoría existente para marcarla como sistema
        config.patrimonio_pasivos.categorias[deudasIndex].sistema = true;
        updated = true;
        modulosActualizados.add('patrimonio_pasivos');
        Logger.log('Categoría "deudas" marcada como sistema');
      }
    }
    
    if (updated) {
      this.saveLocalConfig(config);
      Logger.success('Configuración migrada con nuevas categorías');
      
      // Sincronizar módulos actualizados con MongoDB
      modulosActualizados.forEach(modulo => {
        this.syncToAtlas(modulo, config[modulo]);
      });
    }
  },

  // Obtener configuración local completa
  getLocalConfig() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      Logger.error('Error obteniendo configuración local', error);
      return null;
    }
  },

  // Guardar configuración local completa
  saveLocalConfig(config) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
      Logger.log('Configuración guardada localmente');
    } catch (error) {
      Logger.error('Error guardando configuración local', error);
    }
  },

  // Obtener configuración de un módulo específico
  getModuleConfig(modulo) {
    const config = this.getLocalConfig() || this.DEFAULT_CONFIG;
    return config[modulo] || this.DEFAULT_CONFIG[modulo];
  },

  // Guardar configuración de un módulo específico
  saveModuleConfig(modulo, moduleConfig) {
    const config = this.getLocalConfig() || this.DEFAULT_CONFIG;
    config[modulo] = moduleConfig;
    this.saveLocalConfig(config);
    
    // Sincronizar con Atlas
    this.syncToAtlas(modulo, moduleConfig);
  },

  // Sincronizar configuración con Atlas
  async syncToAtlas(modulo, moduleConfig) {
    try {
      const payload = {
        modulo: modulo,
        campos: moduleConfig.campos,
        fechaModificacion: new Date().toISOString()
      };
      
      // Incluir categorías si el módulo las tiene
      if (moduleConfig.categorias) {
        payload.categorias = moduleConfig.categorias;
      }
      
      const response = await fetch(`${this.API_BASE}/configuracion/${modulo}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Error sincronizando con Atlas');
      }

      Logger.success(`Configuración de ${modulo} sincronizada con Atlas`);
    } catch (error) {
      Logger.error(`Error sincronizando ${modulo} con Atlas`, error);
    }
  },

  // Cargar configuración desde Atlas
  async loadFromAtlas(modulo = null) {
    try {
      const url = modulo 
        ? `${this.API_BASE}/configuracion/${modulo}`
        : `${this.API_BASE}/configuracion`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Error cargando configuración desde Atlas');
      }

      const data = await response.json();
      
      if (modulo) {
        // Cargar un módulo específico
        const config = this.getLocalConfig() || this.DEFAULT_CONFIG;
        config[modulo] = { campos: data.campos };
        
        // Incluir categorías si existen (para patrimonio)
        if (data.categorias) {
          config[modulo].categorias = data.categorias;
        }
        
        this.saveLocalConfig(config);
        Logger.success(`Configuración de ${modulo} cargada desde Atlas`);
      } else {
        // Cargar todas las configuraciones
        const config = {};
        data.forEach(item => {
          config[item.modulo] = { campos: item.campos };
          
          // Incluir categorías si existen (para patrimonio)
          if (item.categorias) {
            config[item.modulo].categorias = item.categorias;
          }
        });
        this.saveLocalConfig(config);
        Logger.success('Configuraciones cargadas desde Atlas');
      }

      return data;
    } catch (error) {
      Logger.error('Error cargando desde Atlas', error);
      // Si falla, usar configuración local o por defecto
      return modulo ? this.getModuleConfig(modulo) : this.getLocalConfig();
    }
  },

  // Añadir campo personalizado a un módulo
  addCustomField(modulo, campo) {
    const config = this.getModuleConfig(modulo);
    
    // Generar ID único para el campo
    campo.id = campo.id || `custom_${Date.now()}`;
    campo.sistema = false;
    campo.orden = config.campos.length + 1;
    
    config.campos.push(campo);
    this.saveModuleConfig(modulo, config);
    
    return campo;
  },

  // Actualizar campo existente
  updateField(modulo, campoId, campoData) {
    const config = this.getModuleConfig(modulo);
    const index = config.campos.findIndex(c => c.id === campoId);
    
    if (index !== -1) {
      // No permitir modificar campos del sistema
      if (config.campos[index].sistema) {
        throw new Error('No se puede modificar un campo del sistema');
      }
      
      config.campos[index] = { ...config.campos[index], ...campoData };
      this.saveModuleConfig(modulo, config);
      return config.campos[index];
    }
    
    throw new Error('Campo no encontrado');
  },

  // Eliminar campo personalizado
  deleteField(modulo, campoId) {
    const config = this.getModuleConfig(modulo);
    const campo = config.campos.find(c => c.id === campoId);
    
    if (!campo) {
      throw new Error('Campo no encontrado');
    }
    
    if (campo.sistema) {
      throw new Error('No se puede eliminar un campo del sistema');
    }
    
    config.campos = config.campos.filter(c => c.id !== campoId);
    this.saveModuleConfig(modulo, config);
  },

  // Reordenar campos
  reorderFields(modulo, camposOrdenados) {
    const config = this.getModuleConfig(modulo);
    config.campos = camposOrdenados.map((campo, index) => ({
      ...campo,
      orden: index + 1
    }));
    this.saveModuleConfig(modulo, config);
  },

  // Añadir opción a un campo select
  addSelectOption(modulo, campoId, opcion) {
    const config = this.getModuleConfig(modulo);
    const campo = config.campos.find(c => c.id === campoId);
    
    if (!campo || campo.tipo !== 'select') {
      throw new Error('Campo no encontrado o no es de tipo select');
    }
    
    if (!campo.opciones) {
      campo.opciones = [];
    }
    
    campo.opciones.push(opcion);
    this.saveModuleConfig(modulo, config);
  },

  // Eliminar opción de un campo select
  deleteSelectOption(modulo, campoId, valorOpcion) {
    const config = this.getModuleConfig(modulo);
    const campo = config.campos.find(c => c.id === campoId);
    
    if (!campo || campo.tipo !== 'select') {
      throw new Error('Campo no encontrado o no es de tipo select');
    }
    
    campo.opciones = campo.opciones.filter(o => o.valor !== valorOpcion);
    this.saveModuleConfig(modulo, config);
  },

  // === GESTIÓN DE CATEGORÍAS (PATRIMONIO) ===
  
  // Obtener categorías de un módulo
  getCategorias(modulo) {
    const config = this.getModuleConfig(modulo);
    return config.categorias || [];
  },

  // Añadir categoría
  addCategoria(modulo, categoria) {
    const config = this.getModuleConfig(modulo);
    
    if (!config.categorias) {
      config.categorias = [];
    }
    
    // Generar ID único para la categoría
    categoria.id = categoria.id || `cat_${Date.now()}`;
    
    config.categorias.push(categoria);
    this.saveModuleConfig(modulo, config);
    
    return categoria;
  },

  // Actualizar categoría
  updateCategoria(modulo, categoriaId, categoriaData) {
    const config = this.getModuleConfig(modulo);
    const index = config.categorias.findIndex(c => c.id === categoriaId);
    
    if (index !== -1) {
      config.categorias[index] = { ...config.categorias[index], ...categoriaData };
      this.saveModuleConfig(modulo, config);
      return config.categorias[index];
    }
    
    throw new Error('Categoría no encontrada');
  },

  // Eliminar categoría
  deleteCategoria(modulo, categoriaId) {
    const config = this.getModuleConfig(modulo);
    
    if (!config.categorias) {
      throw new Error('No hay categorías configuradas');
    }
    
    const categoria = config.categorias.find(c => c.id === categoriaId);
    
    if (categoria && categoria.sistema) {
      throw new Error('No se puede eliminar una categoría del sistema');
    }
    
    config.categorias = config.categorias.filter(c => c.id !== categoriaId);
    this.saveModuleConfig(modulo, config);
  },

  // Reordenar categorías
  reorderCategorias(modulo, categoriasOrdenadas) {
    const config = this.getModuleConfig(modulo);
    config.categorias = categoriasOrdenadas;
    this.saveModuleConfig(modulo, config);
  },

  // Restablecer configuración por defecto
  resetModuleConfig(modulo) {
    if (modulo) {
      this.saveModuleConfig(modulo, this.DEFAULT_CONFIG[modulo]);
    } else {
      this.saveLocalConfig(this.DEFAULT_CONFIG);
      // Sincronizar todos con Atlas
      Object.keys(this.DEFAULT_CONFIG).forEach(mod => {
        this.syncToAtlas(mod, this.DEFAULT_CONFIG[mod]);
      });
    }
  }
};

window.ConfigModel = ConfigModel;
Logger.log('ConfigModel cargado');
