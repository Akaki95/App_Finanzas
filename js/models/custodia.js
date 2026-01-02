// Modelo de Custodia - Gestión de dinero de terceros
const CustodiaModel = {
  collectionName: 'custodias',
  
  // Normalizar custodia (convertir _id de MongoDB a id)
  normalizar(custodia) {
    if (custodia._id && !custodia.id) {
      custodia.id = custodia._id;
    }
    return custodia;
  },
  
  // Obtener todas las custodias
  getAll() {
    const custodias = CacheService.get(this.collectionName) || [];
    Logger.log(`${custodias.length} custodias cargadas`);
    // Normalizar todas las custodias
    return custodias.map(c => this.normalizar(c));
  },
  
  // Obtener custodia por ID
  getById(id) {
    const custodias = this.getAll();
    return custodias.find(c => c.id === id);
  },
  
  // Obtener custodias por persona
  getByPersona(persona) {
    const custodias = this.getAll();
    return custodias.filter(c => 
      c.persona.toLowerCase().includes(persona.toLowerCase())
    );
  },
  
  // Obtener movimientos de una persona
  getMovimientosByPersona(persona) {
    const custodias = this.getAll();
    return custodias
      .filter(c => c.persona.toLowerCase() === persona.toLowerCase())
      .sort((a, b) => {
        const fechaDiff = new Date(b.fecha) - new Date(a.fecha);
        if (fechaDiff !== 0) return fechaDiff;
        return b.id.localeCompare(a.id); // Si misma fecha, el más reciente (ID mayor) primero
      });
  },
  
  // Calcular saldo por persona
  getSaldoByPersona(persona) {
    const movimientos = this.getMovimientosByPersona(persona);
    return movimientos.reduce((saldo, mov) => {
      return mov.tipo === 'deposito' ? saldo + mov.monto : saldo - mov.monto;
    }, 0);
  },
  
  // Obtener resumen de todas las personas
  getResumenPersonas() {
    const custodias = this.getAll();
    const personas = {};
    
    custodias.forEach(c => {
      if (!personas[c.persona]) {
        personas[c.persona] = {
          persona: c.persona,
          depositos: 0,
          retiros: 0,
          saldo: 0,
          movimientos: 0
        };
      }
      
      personas[c.persona].movimientos++;
      
      if (c.tipo === 'deposito') {
        personas[c.persona].depositos += c.monto;
        personas[c.persona].saldo += c.monto;
      } else {
        personas[c.persona].retiros += c.monto;
        personas[c.persona].saldo -= c.monto;
      }
    });
    
    return Object.values(personas).sort((a, b) => b.saldo - a.saldo);
  },
  
  // Obtener total en custodia
  getTotalCustodia() {
    const resumen = this.getResumenPersonas();
    return resumen.reduce((total, p) => total + p.saldo, 0);
  },
  
  // Crear nuevo movimiento de custodia
  create(custodiaData) {
    // Validar datos básicos
    if (!custodiaData.persona || !custodiaData.monto || !custodiaData.tipo) {
      throw new Error('Persona, monto y tipo son requeridos');
    }
    
    if (custodiaData.monto <= 0) {
      throw new Error('El monto debe ser mayor a 0');
    }
    
    // Validar que no retire más de lo que tiene
    if (custodiaData.tipo === 'retiro') {
      const saldoActual = this.getSaldoByPersona(custodiaData.persona);
      if (custodiaData.monto > saldoActual) {
        throw new Error(`No hay suficiente saldo. Saldo actual: ${Calculations.formatearMoneda(saldoActual)}`);
      }
    }
    
    // Crear movimiento
    const custodia = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      persona: ValidationService.sanitizarTexto(custodiaData.persona),
      monto: ValidationService.formatearMonto(custodiaData.monto),
      tipo: custodiaData.tipo, // 'deposito' o 'retiro'
      fecha: custodiaData.fecha,
      descripcion: ValidationService.sanitizarTexto(custodiaData.descripcion || ''),
      createdAt: new Date().toISOString()
    };
    
    // Guardar en caché
    const custodias = this.getAll();
    custodias.push(custodia);
    CacheService.set(this.collectionName, custodias);
    
    // Agregar a cola de sincronización
    SyncService.addToQueue({
      collection: this.collectionName,
      action: 'create',
      data: custodia
    });
    
    Logger.success('Movimiento de custodia creado', custodia);
    return custodia;
  },
  
  // Actualizar movimiento de custodia
  update(id, custodiaData) {
    const custodias = this.getAll();
    const index = custodias.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error('Movimiento de custodia no encontrado');
    }
    
    // Validar datos básicos
    if (!custodiaData.persona || !custodiaData.monto || !custodiaData.tipo) {
      throw new Error('Persona, monto y tipo son requeridos');
    }
    
    if (custodiaData.monto <= 0) {
      throw new Error('El monto debe ser mayor a 0');
    }
    
    // Actualizar movimiento
    const custodiaActualizada = {
      ...custodias[index],
      persona: ValidationService.sanitizarTexto(custodiaData.persona),
      monto: ValidationService.formatearMonto(custodiaData.monto),
      tipo: custodiaData.tipo,
      fecha: custodiaData.fecha,
      descripcion: ValidationService.sanitizarTexto(custodiaData.descripcion || ''),
      updatedAt: new Date().toISOString()
    };
    
    custodias[index] = custodiaActualizada;
    CacheService.set(this.collectionName, custodias);
    
    // Agregar a cola de sincronización (excluir _id)
    const { _id, ...updateData } = custodiaActualizada;
    SyncService.addToQueue({
      collection: this.collectionName,
      action: 'update',
      id: id,
      data: updateData
    });
    
    Logger.success('Movimiento de custodia actualizado', custodiaActualizada);
    return custodiaActualizada;
  },
  
  // Eliminar movimiento de custodia
  delete(id) {
    const custodias = this.getAll();
    const custodia = custodias.find(c => c.id === id);
    
    if (!custodia) {
      throw new Error('Movimiento de custodia no encontrado');
    }
    
    const custodiasFiltradas = custodias.filter(c => c.id !== id);
    CacheService.set(this.collectionName, custodiasFiltradas);
    
    // Agregar a cola de sincronización
    SyncService.addToQueue({
      collection: this.collectionName,
      action: 'delete',
      id: id
    });
    
    Logger.success('Movimiento de custodia eliminado', custodia);
    return custodia;
  }
};
