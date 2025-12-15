// Modelo de Gasto Automático (Recurrente)
const GastoAutomaticoModel = {
  collectionName: 'gastos_automaticos',
  API_BASE: null, // Se inicializa desde ConfigModel
  
  // Obtener todas las reglas desde MongoDB Atlas
  async getAll() {
    if (!this.API_BASE) {
      await ConfigModel.loadApiBase();
      this.API_BASE = ConfigModel.API_BASE;
    }
    try {
      const res = await fetch(`${this.API_BASE}/api/gastos_automaticos`);
      const json = await res.json();
      if (json.success) {
        // Normalizar reglas: usar _id como id si no existe
        const reglas = json.data.map(r => ({
          ...r,
          id: r.id || r._id?.toString() || Date.now().toString() + Math.random().toString(36).substr(2, 9)
        }));
        Logger.log(`${reglas.length} reglas de gastos automáticos cargadas (MongoDB)`);
        return reglas;
      }
      return [];
    } catch (error) {
      Logger.error('Error obteniendo reglas automáticas', error);
      return [];
    }
  },
  
  // Obtener regla por ID desde MongoDB Atlas
  async getById(id) {
    if (!this.API_BASE) {
      await ConfigModel.loadApiBase();
      this.API_BASE = ConfigModel.API_BASE;
    }
    try {
      const res = await fetch(`${this.API_BASE}/api/gastos_automaticos/${id}`);
      const json = await res.json();
      if (json.success) {
        // Normalizar: asegurar que tenga id
        return {
          ...json.data,
          id: json.data.id || json.data._id?.toString() || id
        };
      }
      return null;
    } catch (error) {
      Logger.error('Error obteniendo regla automática', error);
      return null;
    }
  },
  
  // Crear nueva regla en MongoDB Atlas
  async create(reglaData) {
    if (!this.API_BASE) {
      await ConfigModel.loadApiBase();
      this.API_BASE = ConfigModel.API_BASE;
    }
    try {
      // Generar ID único antes de enviar al backend
      const regla = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        ...reglaData,
        activo: true,
        ultimaAplicacion: null
      };
      const res = await fetch(`${this.API_BASE}/api/gastos_automaticos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regla)
      });
      const json = await res.json();
      if (json.success) {
        Logger.success('Regla de gasto automático creada (MongoDB)', json.data);
        return json.data;
      }
      throw new Error(json.error || 'Error creando regla automática');
    } catch (error) {
      Logger.error('Error creando regla automática', error);
      throw error;
    }
  },
  
  // Actualizar regla en MongoDB Atlas
  async update(id, reglaData) {
    if (!this.API_BASE) {
      await ConfigModel.loadApiBase();
      this.API_BASE = ConfigModel.API_BASE;
    }
    try {
      const res = await fetch(`${this.API_BASE}/api/gastos_automaticos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reglaData)
      });
      const json = await res.json();
      if (json.success) {
        Logger.success('Regla de gasto automático actualizada (MongoDB)', json.data);
        return json.data;
      }
      throw new Error(json.error || 'Error actualizando regla automática');
    } catch (error) {
      Logger.error('Error actualizando regla automática', error);
      throw error;
    }
  },
  
  // Eliminar regla en MongoDB Atlas
  async delete(id) {
    if (!this.API_BASE) {
      await ConfigModel.loadApiBase();
      this.API_BASE = ConfigModel.API_BASE;
    }
    try {
      const res = await fetch(`${this.API_BASE}/api/gastos_automaticos/${id}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (json.success) {
        Logger.success('Regla de gasto automático eliminada (MongoDB)');
        return true;
      }
      throw new Error(json.error || 'Error eliminando regla automática');
    } catch (error) {
      Logger.error('Error eliminando regla automática', error);
      throw error;
    }
  },
  
  // Aplicar reglas automáticas (genera gastos si corresponde)
  async aplicarReglas() {
    const reglas = (await this.getAll()).filter(r => r.activo);
    const hoy = new Date();
    let gastosGenerados = 0;
    for (const regla of reglas) {
      if (this.debeAplicarse(regla, hoy)) {
        try {
          // Verificar si ya existe un gasto automático para esta regla y fecha
          const fechaHoy = hoy.toISOString().split('T')[0];
          const yaExiste = GastoModel.getAll().some(g =>
            g.fecha === fechaHoy &&
            g.monto === regla.monto &&
            g.categoria === regla.categoria &&
            g.descripcion === `🤖 ${regla.nombre}${regla.descripcion ? ' - ' + regla.descripcion : ''}` &&
            (g.esAutomatico === true || g.reglaId === regla.id)
          );
          if (yaExiste) continue;
          // Crear gasto automático
          const gasto = {
            fecha: fechaHoy,
            monto: regla.monto,
            categoria: regla.categoria,
            descripcion: `🤖 ${regla.nombre}${regla.descripcion ? ' - ' + regla.descripcion : ''}`,
            esAutomatico: true,
            reglaId: regla.id
          };
          GastoModel.create(gasto);
          // Actualizar última aplicación
          await this.update(regla.id, {
            ...regla,
            ultimaAplicacion: fechaHoy
          });
          gastosGenerados++;
        } catch (error) {
          Logger.error(`Error aplicando regla automática ${regla.nombre}`, error);
        }
      }
    }
    if (gastosGenerados > 0) {
      Logger.success(`${gastosGenerados} gasto(s) automático(s) generado(s)`);
    }
    return gastosGenerados;
  },
  
  // Verificar si una regla debe aplicarse hoy
  debeAplicarse(regla, fecha) {
    const hoy = new Date(fecha);
    const inicio = new Date(regla.fechaInicio);
    
    // No aplicar si no ha llegado la fecha de inicio
    if (hoy < inicio) return false;
    
    // No aplicar si pasó la fecha de fin
    if (regla.fechaFin && hoy > new Date(regla.fechaFin)) return false;
    
    // No aplicar si ya se aplicó hoy
    if (regla.ultimaAplicacion === hoy.toISOString().split('T')[0]) return false;
    
    // Verificar según frecuencia
    switch (regla.frecuencia) {
      case 'diaria':
        return true;
        
      case 'semanal':
        // diaAplicacion: 1=Lunes, 7=Domingo
        return hoy.getDay() === (regla.diaAplicacion % 7);
        
      case 'mensual':
        // diaAplicacion: día del mes (1-31)
        return hoy.getDate() === regla.diaAplicacion;
        
      case 'anual':
        // diaAplicacion: día del año (formato: MMDD, ej: 1225 para 25 de diciembre)
        const mesHoy = (hoy.getMonth() + 1).toString().padStart(2, '0');
        const diaHoy = hoy.getDate().toString().padStart(2, '0');
        const hoyMMDD = parseInt(mesHoy + diaHoy);
        return hoyMMDD === regla.diaAplicacion;
        
      default:
        return false;
    }
  },
  
  // Obtener próxima fecha de aplicación
  getProximaAplicacion(regla) {
    const hoy = new Date();
    const proxima = new Date(hoy);
    
    switch (regla.frecuencia) {
      case 'diaria':
        proxima.setDate(proxima.getDate() + 1);
        break;
        
      case 'semanal':
        const diasHastaProxima = (regla.diaAplicacion - proxima.getDay() + 7) % 7 || 7;
        proxima.setDate(proxima.getDate() + diasHastaProxima);
        break;
        
      case 'mensual':
        proxima.setMonth(proxima.getMonth() + 1);
        proxima.setDate(regla.diaAplicacion);
        break;
        
      case 'anual':
        const mesObjetivo = Math.floor(regla.diaAplicacion / 100);
        const diaObjetivo = regla.diaAplicacion % 100;
        proxima.setFullYear(proxima.getFullYear() + 1);
        proxima.setMonth(mesObjetivo - 1);
        proxima.setDate(diaObjetivo);
        break;
    }
    
    return proxima.toISOString().split('T')[0];
  }
};

window.GastoAutomaticoModel = GastoAutomaticoModel;
