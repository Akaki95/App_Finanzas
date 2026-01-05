// Dashboard View - Vista principal con gráficos
const DashboardView = {
  charts: {},
  filtros: {
    cashflow: { inicio: null, fin: null },
    categorias: { inicio: null, fin: null },
    comparacion: { inicio: null, fin: null },
    patrimonio: { inicio: null, fin: null }
  },
  
  // Inicializar fechas por defecto personalizadas
  inicializarFechasDefecto() {
    const hoy = new Date();
    const anioActual = hoy.getFullYear();
    // Flujo de efectivo: últimos 3 meses
    const cashflowInicio = new Date(hoy.getFullYear(), hoy.getMonth() - 2, 1);
    const cashflowFin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    // Gastos por Categoría: primer día del mes en curso
    const categoriasInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const categoriasFin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    // Ingresos por Tipo (%): mes actual por defecto
    const comparacionInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    // Último día del mes actual
    const comparacionFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    // Gastos por Categoría: primer día del mes actual hasta hoy
    const patrimonioInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const patrimonioFin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    // Formato YYYY-MM-DD local para inputs
    const formatoFechaLocal = (fecha) => {
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const day = String(fecha.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    return {
      cashflow: {
        inicio: formatoFechaLocal(cashflowInicio),
        fin: formatoFechaLocal(cashflowFin)
      },
      categorias: {
        inicio: formatoFechaLocal(categoriasInicio),
        fin: formatoFechaLocal(categoriasFin)
      },
      comparacion: {
        inicio: formatoFechaLocal(comparacionInicio),
        fin: formatoFechaLocal(comparacionFin)
      },
      patrimonio: {
        inicio: formatoFechaLocal(patrimonioInicio),
        fin: formatoFechaLocal(patrimonioFin)
      }
    };
  },
  
  render() {
    const mainContent = document.getElementById('main-content');
    const gastos = GastoModel.getAll();
    const ingresos = IngresoModel.getAll();
    const mesActual = Calculations.obtenerMesActual();
    const balance = Calculations.calcularBalanceMensual(ingresos, gastos, mesActual.mes, mesActual.anio);
    const disponible = {
      ingresos: Calculations.sumarMontos(ingresos),
      gastos: Calculations.sumarMontos(gastos),
      disponible: Calculations.sumarMontos(ingresos) - Calculations.sumarMontos(gastos)
    };
    const patrimonio = PatrimonioModel.getResumen();
    const ahorrosStats = AhorroModel.getEstadisticas();
    
    // Inicializar filtros por defecto
    const fechasDefecto = this.inicializarFechasDefecto();
    Object.keys(this.filtros).forEach(key => {
      if (!this.filtros[key].inicio) {
        this.filtros[key] = { ...fechasDefecto[key] };
      }
    });
    
    // Calcular cambios del mes anterior
    const mesAnterior = new Date();
    mesAnterior.setMonth(mesAnterior.getMonth() - 1);
    const balanceAnterior = Calculations.calcularBalanceMensual(
      ingresos, gastos, mesAnterior.getMonth() + 1, mesAnterior.getFullYear()
    );
    
    mainContent.innerHTML = `
      <div class="container">
        <div class="dashboard-header">
          <h1 class="dashboard-title">Dashboard Financiero</h1>
          <p class="dashboard-subtitle">${mesActual.texto}</p>
        </div>
        
        <!-- Tarjetas de resumen -->
        <div class="summary-cards">
          <div class="summary-card ingresos">
            <div class="summary-card-icon">💰</div>
            <div class="summary-card-label">Ingresos del Mes</div>
            <div class="summary-card-value">${Calculations.formatearMoneda(balance.ingresos)}</div>
            <div class="summary-card-change">${ingresos.length} registros</div>
          </div>
          
          <div class="summary-card gastos">
            <div class="summary-card-icon">💸</div>
            <div class="summary-card-label">Gastos del Mes</div>
            <div class="summary-card-value">${Calculations.formatearMoneda(balance.gastos)}</div>
            <div class="summary-card-change">${gastos.length} registros</div>
          </div>
          
          <div class="summary-card balance">
            <div class="summary-card-icon">📊</div>
            <div class="summary-card-label">Disponible</div>
            <div class="summary-card-value">${Calculations.formatearMoneda(disponible.disponible)}</div>
            <div class="summary-card-change">
              ${disponible.disponible >= 0 ? '✅ Positivo' : '⚠️ Negativo'}
            </div>
          </div>
          
          <div class="summary-card patrimonio">
            <div class="summary-card-icon">🏦</div>
            <div class="summary-card-label">Patrimonio Neto</div>
            <div class="summary-card-value">${Calculations.formatearMoneda(patrimonio.patrimonioNeto)}</div>
            <div class="summary-card-change">
              Activos: ${Calculations.formatearMoneda(patrimonio.activos)}
            </div>
          </div>
          
          <div class="summary-card ahorros">
            <div class="summary-card-icon">💰</div>
            <div class="summary-card-label">Ahorros</div>
            <div class="summary-card-value">${Calculations.formatearMoneda(ahorrosStats.totalAcumulado)}</div>
            <div class="summary-card-change">
              ${ahorrosStats.cantidadMovimientos} movimientos
            </div>
          </div>
        </div>
        
        <!-- Gráficos -->
        <div class="charts-container">
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">Flujo de Efectivo</h3>
              <div class="chart-date-filter">
                <input type="date" id="cashflow-inicio" class="date-input" 
                       value="${this.filtros.cashflow.inicio}"
                       onchange="DashboardView.actualizarFiltro('cashflow', 'inicio', this.value)">
                <span class="date-separator">—</span>
                <input type="date" id="cashflow-fin" class="date-input" 
                       value="${this.filtros.cashflow.fin}"
                       onchange="DashboardView.actualizarFiltro('cashflow', 'fin', this.value)">
              </div>
            </div>
            <canvas id="chart-cashflow" class="chart-canvas"></canvas>
          </div>
          
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">Gastos por Categoría</h3>
              <div class="chart-date-filter">
                <input type="date" id="categorias-inicio" class="date-input" 
                       value="${this.filtros.categorias.inicio}"
                       onchange="DashboardView.actualizarFiltro('categorias', 'inicio', this.value)">
                <span class="date-separator">—</span>
                <input type="date" id="categorias-fin" class="date-input" 
                       value="${this.filtros.categorias.fin}"
                       onchange="DashboardView.actualizarFiltro('categorias', 'fin', this.value)">
              </div>
            </div>
            <canvas id="chart-categorias" class="chart-canvas"></canvas>
          </div>
        </div>
        
        <div class="charts-container">
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">Ingresos por Tipo (%)</h3>
              <div class="chart-date-filter">
                <input type="date" id="comparacion-inicio" class="date-input" 
                       value="${this.filtros.comparacion.inicio}"
                       onchange="DashboardView.actualizarFiltro('comparacion', 'inicio', this.value)">
                <span class="date-separator">—</span>
                <input type="date" id="comparacion-fin" class="date-input" 
                       value="${this.filtros.comparacion.fin}"
                       onchange="DashboardView.actualizarFiltro('comparacion', 'fin', this.value)">
              </div>
            </div>
            <canvas id="chart-comparacion" class="chart-canvas"></canvas>
          </div>
          
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">Gastos por Categoría (%)</h3>
              <div class="chart-date-filter">
                <input type="date" id="patrimonio-inicio" class="date-input" 
                       value="${this.filtros.patrimonio.inicio}"
                       onchange="DashboardView.actualizarFiltro('patrimonio', 'inicio', this.value)">
                <span class="date-separator">—</span>
                <input type="date" id="patrimonio-fin" class="date-input" 
                       value="${this.filtros.patrimonio.fin}"
                       onchange="DashboardView.actualizarFiltro('patrimonio', 'fin', this.value)">
              </div>
            </div>
            <canvas id="chart-patrimonio" class="chart-canvas"></canvas>
          </div>
        </div>
        
        <!-- Transacciones recientes -->
        <div class="card recent-transactions">
          <h3 class="card-title">Transacciones Recientes</h3>
          ${this.renderTransaccionesRecientes(gastos, ingresos)}
        </div>
      </div>
    `;
    
    // Renderizar gráficos
    this.renderCharts();
  },
  
  // Actualizar filtro de fecha
  actualizarFiltro(grafica, tipo, valor) {
    this.filtros[grafica][tipo] = valor;
    
    // Re-renderizar solo la gráfica específica
    switch(grafica) {
      case 'cashflow':
        this.renderCashflowChart();
        break;
      case 'categorias':
        this.renderCategoriasChart();
        break;
      case 'comparacion':
        this.renderComparacionChart();
        break;
      case 'patrimonio':
        this.renderPatrimonioChart();
        break;
    }
  },
  
  renderTransaccionesRecientes(gastos, ingresos) {
    // Combinar y ordenar por fecha
    const todas = [
      ...gastos.map(g => ({...g, tipo: 'gasto'})),
      ...ingresos.map(i => ({...i, tipo: 'ingreso'}))
    ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 10);

    if (todas.length === 0) {
      return '<div class="empty-state"><div class="empty-state-text">No hay transacciones recientes</div></div>';
    }

    return todas.map(t => {
      let origen = '';
      if (t.origenGrupo) {
        origen = `<span class="grupo-origen">(de grupo)</span> `;
      }
      return `
      <div class="transaction-item">
        <div class="transaction-info">
          <div class="transaction-description">
            ${t.tipo === 'gasto' ? '💸' : '💰'} ${origen}${t.descripcion || (t.categoria || t.tipo)}
          </div>
          <div class="transaction-meta">
            ${new Date(t.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
        <div class="transaction-amount ${t.tipo}">
          ${t.tipo === 'gasto' ? '-' : '+'}${Calculations.formatearMoneda(t.monto)}
        </div>
      </div>
      `;
    }).join('');
  },
  
  renderCharts() {
    this.renderCashflowChart();
    this.renderCategoriasChart();
    this.renderComparacionChart();
    this.renderPatrimonioChart();
  },
  
  renderCashflowChart() {
    const ctx = document.getElementById('chart-cashflow');
    if (!ctx) return;
    
    const filtro = this.filtros.cashflow;
    let gastos = GastoModel.getAll();
    let ingresos = IngresoModel.getAll();
    
    // Aplicar filtro de fechas si está definido
    if (filtro.inicio && filtro.fin) {
      gastos = Calculations.filtrarPorRango(gastos, filtro.inicio, filtro.fin);
      ingresos = Calculations.filtrarPorRango(ingresos, filtro.inicio, filtro.fin);
    }
    
    // Calcular meses entre las fechas
    const inicio = new Date(filtro.inicio);
    const fin = new Date(filtro.fin);
    const mesesDiferencia = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24 * 30));
    const meses = Math.max(1, Math.min(mesesDiferencia, 12));
    
    const cashflow = Calculations.calcularCashflowRango(ingresos, gastos, filtro.inicio, filtro.fin);
    
    if (this.charts.cashflow) {
      this.charts.cashflow.destroy();
    }
    
    this.charts.cashflow = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: cashflow.map(c => c.mes),
        datasets: [
          {
            label: 'Ingresos del Mes',
            data: cashflow.map(c => c.ingresos),
            backgroundColor: 'rgba(76, 175, 80, 0.7)',
            borderColor: '#4CAF50',
            borderWidth: 1,
            yAxisID: 'y1',
            order: 2
          },
          {
            label: 'Gastos del Mes',
            data: cashflow.map(c => c.gastos),
            backgroundColor: 'rgba(244, 67, 54, 0.7)',
            borderColor: '#f44336',
            borderWidth: 1,
            yAxisID: 'y1',
            order: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                label += Calculations.formatearMoneda(context.parsed.y);
                return label;
              }
            }
          }
        },
        scales: {
          y1: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Ingresos/Gastos del Mes'
            }
          }
        }
      }
    });
  },
  
  renderCategoriasChart() {
    const ctx = document.getElementById('chart-categorias');
    if (!ctx) return;
    
    const filtro = this.filtros.categorias;
    let gastos = GastoModel.getAll();
    
    // Aplicar filtro de fechas
    if (filtro.inicio && filtro.fin) {
      gastos = Calculations.filtrarPorRango(gastos, filtro.inicio, filtro.fin);
    }
    
    const categorias = Calculations.calcularTotalPorCategoria(gastos);
    
    if (this.charts.categorias) {
      this.charts.categorias.destroy();
    }
    
    const colores = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
      '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
    ];
    
    this.charts.categorias = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(categorias),
        datasets: [{
          data: Object.values(categorias),
          backgroundColor: colores,
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed;
                const data = context.chart.data.datasets[0].data;
                const total = data.reduce((a, b) => a + b, 0);
                const porcentaje = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return `${label}: ${Calculations.formatearMoneda(value)} (${porcentaje}%)`;
              }
            }
          }
        }
      }
    });
  },
  
  renderComparacionChart() {
    const ctx = document.getElementById('chart-comparacion');
    if (!ctx) return;
    
    const filtro = this.filtros.comparacion;
    let ingresos = IngresoModel.getAll();
    
    // Aplicar filtro de fechas
    if (filtro.inicio && filtro.fin) {
      ingresos = Calculations.filtrarPorRango(ingresos, filtro.inicio, filtro.fin);
    }
    
    // Calcular ingresos por tipo
    const ingresosPorTipo = {};
    let totalIngresos = 0;
    
    ingresos.forEach(ingreso => {
      const tipo = ingreso.tipo || 'Sin tipo';
      if (!ingresosPorTipo[tipo]) {
        ingresosPorTipo[tipo] = 0;
      }
      ingresosPorTipo[tipo] += ingreso.monto;
      totalIngresos += ingreso.monto;
    });
    
    // Convertir a arrays y calcular porcentajes
    const tipos = Object.keys(ingresosPorTipo).sort((a, b) => 
      ingresosPorTipo[b] - ingresosPorTipo[a]
    );
    const montos = tipos.map(tipo => ingresosPorTipo[tipo]);
    const porcentajes = tipos.map(tipo => 
      totalIngresos > 0 ? ((ingresosPorTipo[tipo] / totalIngresos) * 100).toFixed(1) : 0
    );
    
    // Colores para los tipos
    const colores = [
      '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#00BCD4',
      '#FFEB3B', '#E91E63', '#8BC34A', '#03A9F4', '#4CAF50'
    ];
    
    if (this.charts.comparacion) {
      this.charts.comparacion.destroy();
    }
    
    this.charts.comparacion = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: tipos,
        datasets: [
          {
            label: 'Porcentaje del Total (%)',
            data: porcentajes,
            backgroundColor: colores.slice(0, tipos.length),
            borderColor: colores.slice(0, tipos.length).map(c => c.replace(')', ', 0.8)').replace('rgb', 'rgba')),
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const tipo = context.label;
                const porcentaje = context.parsed.y;
                const monto = montos[context.dataIndex];
                return [
                  `${tipo}: ${porcentaje}%`,
                  `Monto: ${Calculations.formatearMoneda(monto)}`
                ];
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            },
            title: {
              display: true,
              text: 'Porcentaje del Total (%)'
            }
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45
            }
          }
        }
      }
    });
  },
  
  renderPatrimonioChart() {
    const ctx = document.getElementById('chart-patrimonio');
    if (!ctx) return;
    
    const filtro = this.filtros.patrimonio;
    let gastos = GastoModel.getAll();
    
    // Aplicar filtro de fechas
    if (filtro.inicio && filtro.fin) {
      gastos = Calculations.filtrarPorRango(gastos, filtro.inicio, filtro.fin);
    }
    
    // Calcular gastos por categoría
    const gastosPorCategoria = {};
    let totalGastos = 0;
    
    gastos.forEach(gasto => {
      const categoria = gasto.categoria || 'Sin categoría';
      if (!gastosPorCategoria[categoria]) {
        gastosPorCategoria[categoria] = 0;
      }
      gastosPorCategoria[categoria] += gasto.monto;
      totalGastos += gasto.monto;
    });
    
    // Convertir a arrays y calcular porcentajes
    const categorias = Object.keys(gastosPorCategoria).sort((a, b) => 
      gastosPorCategoria[b] - gastosPorCategoria[a]
    );
    const montos = categorias.map(cat => gastosPorCategoria[cat]);
    const porcentajes = categorias.map(cat => 
      totalGastos > 0 ? ((gastosPorCategoria[cat] / totalGastos) * 100).toFixed(1) : 0
    );
    
    // Colores para las categorías
    const colores = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
    ];
    
    if (this.charts.patrimonio) {
      this.charts.patrimonio.destroy();
    }
    
    this.charts.patrimonio = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: categorias,
        datasets: [
          {
            label: 'Porcentaje del Total (%)',
            data: porcentajes,
            backgroundColor: colores.slice(0, categorias.length),
            borderColor: colores.slice(0, categorias.length).map(c => c.replace(')', ', 0.8)').replace('rgb', 'rgba')),
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const categoria = context.label;
                const porcentaje = context.parsed.y;
                const monto = montos[context.dataIndex];
                return [
                  `${categoria}: ${porcentaje}%`,
                  `Monto: ${Calculations.formatearMoneda(monto)}`
                ];
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            },
            title: {
              display: true,
              text: 'Porcentaje del Total (%)'
            }
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45
            }
          }
        }
      }
    });
  }
};

window.DashboardView = DashboardView;
Logger.log('DashboardView inicializado');
