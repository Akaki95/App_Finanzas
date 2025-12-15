// Validation Service - Validaciones de datos
const ValidationService = {
  
  // Validar gasto
  validarGasto(gasto) {
    const errors = [];
    
    // Validar monto
    if (!gasto.monto || isNaN(gasto.monto) || parseFloat(gasto.monto) <= 0) {
      errors.push('El monto debe ser mayor que cero');
    }
    
    // Validar fecha
    if (!gasto.fecha) {
      errors.push('La fecha es requerida');
    } else if (!this.validarFecha(gasto.fecha)) {
      errors.push('La fecha no es válida');
    }
    
    // Validar categoría
    if (!gasto.categoria || gasto.categoria.trim() === '') {
      errors.push('La categoría es requerida');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },
  
  // Validar ingreso
  validarIngreso(ingreso) {
    const errors = [];
    
    // Validar monto
    if (!ingreso.monto || isNaN(ingreso.monto) || parseFloat(ingreso.monto) <= 0) {
      errors.push('El monto debe ser mayor que cero');
    }
    
    // Validar fecha
    if (!ingreso.fecha) {
      errors.push('La fecha es requerida');
    } else if (!this.validarFecha(ingreso.fecha)) {
      errors.push('La fecha no es válida');
    }
    
    // Validar tipo
    if (!ingreso.tipo || ingreso.tipo.trim() === '') {
      errors.push('El tipo de ingreso es requerido');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },
  
  // Validar deuda
  validarDeuda(deuda) {
    const errors = [];
    
    // Validar acreedor
    if (!deuda.acreedor || deuda.acreedor.trim() === '') {
      errors.push('El acreedor es requerido');
    }
    
    // Validar monto inicial
    if (!deuda.montoInicial || isNaN(deuda.montoInicial) || parseFloat(deuda.montoInicial) <= 0) {
      errors.push('El monto inicial debe ser mayor que cero');
    }
    
    // Validar monto pendiente
    if (deuda.montoPendiente !== undefined && 
        (isNaN(deuda.montoPendiente) || parseFloat(deuda.montoPendiente) < 0)) {
      errors.push('El monto pendiente no puede ser negativo');
    }
    
    // Validar que monto pendiente no sea mayor que inicial
    if (parseFloat(deuda.montoPendiente || 0) > parseFloat(deuda.montoInicial || 0)) {
      errors.push('El monto pendiente no puede ser mayor que el inicial');
    }
    
    // Validar fecha de inicio
    if (!deuda.fechaInicio) {
      errors.push('La fecha de inicio es requerida');
    } else if (!this.validarFecha(deuda.fechaInicio)) {
      errors.push('La fecha de inicio no es válida');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },
  
  // Validar préstamo
  validarPrestamo(prestamo) {
    const errors = [];
    
    // Validar persona
    if (!prestamo.persona || prestamo.persona.trim() === '') {
      errors.push('El nombre de la persona es requerido');
    }
    
    // Validar monto inicial
    if (!prestamo.montoInicial || isNaN(prestamo.montoInicial) || parseFloat(prestamo.montoInicial) <= 0) {
      errors.push('El monto inicial debe ser mayor que cero');
    }
    
    // Validar monto pendiente
    if (prestamo.montoPendiente !== undefined && 
        (isNaN(prestamo.montoPendiente) || parseFloat(prestamo.montoPendiente) < 0)) {
      errors.push('El monto pendiente no puede ser negativo');
    }
    
    // Validar que monto pendiente no sea mayor que inicial
    if (parseFloat(prestamo.montoPendiente || 0) > parseFloat(prestamo.montoInicial || 0)) {
      errors.push('El monto pendiente no puede ser mayor que el inicial');
    }
    
    // Validar fecha de préstamo
    if (!prestamo.fechaPrestamo) {
      errors.push('La fecha del préstamo es requerida');
    } else if (!this.validarFecha(prestamo.fechaPrestamo)) {
      errors.push('La fecha del préstamo no es válida');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },
  
  // Validar activo o pasivo
  validarPatrimonio(item) {
    const errors = [];
    
    // Validar nombre
    if (!item.nombre || item.nombre.trim() === '') {
      errors.push('El nombre es requerido');
    }
    
    // Validar valor
    if (!item.valor || isNaN(item.valor) || parseFloat(item.valor) <= 0) {
      errors.push('El valor debe ser mayor que cero');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },
  
  // Validar fecha (formato YYYY-MM-DD)
  validarFecha(fecha) {
    if (!fecha) return false;
    
    const date = new Date(fecha);
    return date instanceof Date && !isNaN(date);
  },
  
  // Validar que la fecha no sea futura
  validarFechaNoFutura(fecha) {
    const date = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999);
    return date <= hoy;
  },
  
  // Sanitizar texto
  sanitizarTexto(texto) {
    if (!texto) return '';
    return texto.trim().replace(/[<>]/g, '');
  },
  
  // Formatear monto
  formatearMonto(monto) {
    const numero = parseFloat(monto);
    if (isNaN(numero)) return 0;
    return Math.round(numero * 100) / 100; // 2 decimales
  },
  
  // Mostrar errores en el DOM
  mostrarErrores(errores, contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;
    
    contenedor.innerHTML = '';
    
    if (errores.length === 0) {
      contenedor.classList.remove('show');
      return;
    }
    
    contenedor.classList.add('show');
    errores.forEach(error => {
      const p = document.createElement('p');
      p.textContent = error;
      contenedor.appendChild(p);
    });
  },
  
  // Limpiar errores
  limpiarErrores(contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    if (contenedor) {
      contenedor.innerHTML = '';
      contenedor.classList.remove('show');
    }
  }
};

// Exportar para uso global
window.ValidationService = ValidationService;

Logger.log('ValidationService inicializado');
