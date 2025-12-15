// Calculations - Funciones de cálculo financiero
const Calculations = {
  
  // Calcular balance mensual (ingresos - gastos)
  calcularBalanceMensual(ingresos, gastos, mes, anio) {
    const ingresosDelMes = this.filtrarPorMes(ingresos, mes, anio);
    const gastosDelMes = this.filtrarPorMes(gastos, mes, anio);
    
    const totalIngresos = this.sumarMontos(ingresosDelMes);
    const totalGastos = this.sumarMontos(gastosDelMes);
    
    return {
      ingresos: totalIngresos,
      gastos: totalGastos,
      balance: totalIngresos - totalGastos
    };
  },
  
  // Calcular cashflow (flujo de efectivo por mes)
  calcularCashflow(ingresos, gastos, meses = 6) {
    const hoy = new Date();
    const resultado = [];
    
    for (let i = meses - 1; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const mes = fecha.getMonth() + 1;
      const anio = fecha.getFullYear();
      
      const balance = this.calcularBalanceMensual(ingresos, gastos, mes, anio);
      
      resultado.push({
        mes: fecha.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
        ingresos: balance.ingresos,
        gastos: balance.gastos,
        balance: balance.balance
      });
    }
    
    return resultado;
  },
  
  // Calcular cashflow por rango de fechas
  calcularCashflowRango(ingresos, gastos, fechaInicio, fechaFin) {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const resultado = [];
    
    // Iterar mes por mes desde inicio hasta fin
    const fechaActual = new Date(inicio.getFullYear(), inicio.getMonth(), 1);
    const fechaLimite = new Date(fin.getFullYear(), fin.getMonth(), 1);
    
    while (fechaActual <= fechaLimite) {
      const mes = fechaActual.getMonth() + 1;
      const anio = fechaActual.getFullYear();
      
      const balance = this.calcularBalanceMensual(ingresos, gastos, mes, anio);
      
      resultado.push({
        mes: fechaActual.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
        ingresos: balance.ingresos,
        gastos: balance.gastos,
        balance: balance.balance
      });
      
      fechaActual.setMonth(fechaActual.getMonth() + 1);
    }
    
    return resultado;
  },
  
  // Calcular total por categoría
  calcularTotalPorCategoria(registros, campo = 'categoria') {
    const totales = {};
    
    registros.forEach(registro => {
      const categoria = registro[campo] || 'Sin categoría';
      if (!totales[categoria]) {
        totales[categoria] = 0;
      }
      totales[categoria] += parseFloat(registro.monto || 0);
    });
    
    return totales;
  },
  
  // Calcular promedio mensual
  calcularPromedioMensual(registros, meses = 3) {
    if (registros.length === 0) return 0;
    const total = this.sumarMontos(registros);
    return total / meses;
  },
  
  // Calcular patrimonio neto (activos - pasivos)
  calcularPatrimonioNeto(activos, pasivos) {
    const totalActivos = this.sumarMontos(activos);
    const totalPasivos = this.sumarMontos(pasivos);
    return totalActivos - totalPasivos;
  },
  
  // Filtrar registros por mes y año
  filtrarPorMes(registros, mes, anio) {
    return registros.filter(registro => {
      const fecha = new Date(registro.fecha);
      return fecha.getMonth() + 1 === mes && fecha.getFullYear() === anio;
    });
  },
  
  // Filtrar registros por rango de fechas
  filtrarPorRango(registros, fechaInicio, fechaFin) {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    return registros.filter(registro => {
      const fecha = new Date(registro.fecha);
      return fecha >= inicio && fecha <= fin;
    });
  },
  
  // Sumar montos de un array de registros
  sumarMontos(registros) {
    return registros.reduce((sum, registro) => sum + parseFloat(registro.monto || 0), 0);
  },
  
  // Formatear número como moneda
  formatearMoneda(monto) {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(monto);
  },
  
  // Formatear fecha
  formatearFecha(fecha) {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  },
  
  // Obtener mes y año actual
  obtenerMesActual() {
    const hoy = new Date();
    return {
      mes: hoy.getMonth() + 1,
      anio: hoy.getFullYear(),
      texto: hoy.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    };
  },
  
  // Calcular porcentaje de cambio
  calcularPorcentajeCambio(valorActual, valorAnterior) {
    if (valorAnterior === 0) return 0;
    return ((valorActual - valorAnterior) / valorAnterior) * 100;
  },
  
  // Obtener top N categorías
  obtenerTopCategorias(registros, n = 5) {
    const totales = this.calcularTotalPorCategoria(registros);
    return Object.entries(totales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([categoria, monto]) => ({ categoria, monto }));
  }
};

// Exportar para uso global
window.Calculations = Calculations;
