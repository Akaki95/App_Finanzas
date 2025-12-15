// Modelo de Ahorros (Solo lectura - Calculado automáticamente)
const AhorroModel = {
  collectionName: 'ahorros',
  
  // Obtener todos los movimientos de ahorro
  getAll() {
    const gastos = GastoModel.getAll();
    const ingresos = IngresoModel.getAll();
    
    // Gastos con categoría "Ahorro" -> aumentan los ahorros (dinero guardado)
    const ahorrosDeGastos = gastos
      .filter(g => g.categoria && g.categoria.toLowerCase() === 'ahorro')
      .map(g => ({
        id: g.id,
        fecha: g.fecha,
        monto: g.monto,
        descripcion: g.descripcion,
        tipo: 'entrada', // Gasto de ahorro = entrada a ahorros
        origen: 'gasto',
        createdAt: g.createdAt
      }));
    
    // Ingresos con tipo "Ahorro" -> disminuyen los ahorros (dinero sacado)
    const ahorrosDeIngresos = ingresos
      .filter(i => i.tipo && i.tipo.toLowerCase() === 'ahorro')
      .map(i => ({
        id: i.id,
        fecha: i.fecha,
        monto: -i.monto, // Negativo porque sale de los ahorros
        descripcion: i.descripcion,
        tipo: 'salida', // Ingreso de ahorro = salida de ahorros
        origen: 'ingreso',
        createdAt: i.createdAt
      }));
    
    // Combinar y ordenar por fecha
    const todosAhorros = [...ahorrosDeGastos, ...ahorrosDeIngresos]
      .sort((a, b) => {
        const fechaDiff = new Date(b.fecha) - new Date(a.fecha);
        if (fechaDiff !== 0) return fechaDiff;
        return b.id.localeCompare(a.id); // Si misma fecha, el más reciente (ID mayor) primero
      });
    
    Logger.log(`${todosAhorros.length} movimientos de ahorro calculados`);
    return todosAhorros;
  },
  
  // Obtener movimiento de ahorro por ID
  getById(id) {
    const ahorros = this.getAll();
    return ahorros.find(a => a.id === id);
  },
  
  // Calcular total de ahorros acumulados
  getTotal() {
    const ahorros = this.getAll();
    const total = ahorros.reduce((sum, a) => sum + a.monto, 0);
    Logger.log(`Total ahorros: ${total}`);
    return total;
  },
  
  // Obtener ahorros por rango de fechas
  getByDateRange(fechaInicio, fechaFin) {
    const ahorros = this.getAll();
    return ahorros.filter(a => {
      const fecha = new Date(a.fecha);
      return fecha >= new Date(fechaInicio) && fecha <= new Date(fechaFin);
    });
  },
  
  // Obtener resumen mensual de ahorros
  getResumenMensual(mes, anio) {
    const ahorros = this.getAll();
    const movimientosMes = ahorros.filter(a => {
      const fecha = new Date(a.fecha);
      return fecha.getMonth() === mes && fecha.getFullYear() === anio;
    });
    
    const entradas = movimientosMes
      .filter(a => a.tipo === 'entrada')
      .reduce((sum, a) => sum + a.monto, 0);
    
    const salidas = movimientosMes
      .filter(a => a.tipo === 'salida')
      .reduce((sum, a) => sum + Math.abs(a.monto), 0);
    
    return {
      entradas,
      salidas,
      neto: entradas - salidas,
      movimientos: movimientosMes.length
    };
  },
  
  // Obtener estadísticas de ahorros
  getEstadisticas() {
    const ahorros = this.getAll();
    
    if (ahorros.length === 0) {
      return {
        totalAcumulado: 0,
        totalEntradas: 0,
        totalSalidas: 0,
        promedioMensual: 0,
        cantidadMovimientos: 0
      };
    }
    
    const entradas = ahorros
      .filter(a => a.tipo === 'entrada')
      .reduce((sum, a) => sum + a.monto, 0);
    
    const salidas = ahorros
      .filter(a => a.tipo === 'salida')
      .reduce((sum, a) => sum + Math.abs(a.monto), 0);
    
    const totalAcumulado = entradas - salidas;
    
    // Calcular promedio mensual
    const fechas = ahorros.map(a => new Date(a.fecha));
    const fechaMinima = new Date(Math.min(...fechas));
    const fechaMaxima = new Date(Math.max(...fechas));
    const mesesTranscurridos = Math.max(1, 
      (fechaMaxima.getFullYear() - fechaMinima.getFullYear()) * 12 + 
      (fechaMaxima.getMonth() - fechaMinima.getMonth()) + 1
    );
    
    const promedioMensual = entradas / mesesTranscurridos;
    
    return {
      totalAcumulado,
      totalEntradas: entradas,
      totalSalidas: salidas,
      promedioMensual,
      cantidadMovimientos: ahorros.length
    };
  }
};
