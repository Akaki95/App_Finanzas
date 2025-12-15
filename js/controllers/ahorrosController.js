// Controlador de Ahorros (Solo lectura)
const AhorrosController = {
  render() {
    const mainContent = document.getElementById('main-content');
    const ahorros = AhorroModel.getAll();
    const estadisticas = AhorroModel.getEstadisticas();
    
    mainContent.innerHTML = `
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">💰 Gestión de Ahorros</h2>
        </div>
        
        <div class="info-banner">
          <div class="info-banner-icon">ℹ️</div>
          <div class="info-banner-text">
            Esta sección es de <strong>solo lectura</strong>. Los ahorros se calculan automáticamente:
            <ul>
              <li><strong>Entrada a ahorros:</strong> Cuando creas un gasto con categoría "Ahorro"</li>
              <li><strong>Salida de ahorros:</strong> Cuando creas un ingreso con tipo "Ahorro"</li>
            </ul>
          </div>
        </div>
        
        <!-- Resumen de Estadísticas -->
        <div class="summary-cards">
          <div class="summary-card ahorros">
            <div class="summary-card-label">Total Acumulado</div>
            <div class="summary-card-value">${Calculations.formatearMoneda(estadisticas.totalAcumulado)}</div>
          </div>
          <div class="summary-card ingresos">
            <div class="summary-card-label">Total Entradas</div>
            <div class="summary-card-value">${Calculations.formatearMoneda(estadisticas.totalEntradas)}</div>
          </div>
          <div class="summary-card gastos">
            <div class="summary-card-label">Total Salidas</div>
            <div class="summary-card-value">${Calculations.formatearMoneda(estadisticas.totalSalidas)}</div>
          </div>
          <div class="summary-card balance">
            <div class="summary-card-label">Promedio Mensual</div>
            <div class="summary-card-value">${Calculations.formatearMoneda(estadisticas.promedioMensual)}</div>
          </div>
        </div>
        
        <!-- Historial de Movimientos -->
        <div class="card">
          <div class="card-header">
            <h3>Historial de Movimientos</h3>
            <span class="badge">${ahorros.length} movimientos</span>
          </div>
          ${ahorros.length === 0 ? `
            <div class="empty-state">
              <div class="empty-state-icon">💰</div>
              <div class="empty-state-title">No hay movimientos de ahorro</div>
              <div class="empty-state-description">
                Comienza a ahorrar creando gastos con categoría "Ahorro" o registra cuando retires dinero de tus ahorros con ingresos tipo "Ahorro"
              </div>
            </div>
          ` : `
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Descripción</th>
                    <th>Tipo</th>
                    <th>Origen</th>
                    <th class="text-right">Monto</th>
                    <th class="text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.renderMovimientos(ahorros)}
                </tbody>
              </table>
            </div>
            <div class="mobile-list">
              ${this.renderMovimientosMobile(ahorros)}
            </div>
          `}
        </div>
      </div>
    `;
  },
  
  renderMovimientos(ahorros) {
    let balanceAcumulado = 0;
    return ahorros.map(ahorro => {
      balanceAcumulado += ahorro.monto;
      const isEntrada = ahorro.tipo === 'entrada';
      const iconoOrigen = ahorro.origen === 'gasto' ? '💸' : '💵';
      const badgeClass = isEntrada ? 'badge-success' : 'badge-danger';
      const tipoLabel = isEntrada ? 'Entrada' : 'Salida';
      const montoClass = isEntrada ? 'text-success' : 'text-danger';
      const signo = isEntrada ? '+' : '';
      
      return `
        <tr>
          <td>${Calculations.formatearFecha(ahorro.fecha)}</td>
          <td>
            <div class="item-title">${ahorro.descripcion || '-'}</div>
          </td>
          <td>
            <span class="badge ${badgeClass}">${tipoLabel}</span>
          </td>
          <td>
            <span title="${ahorro.origen === 'gasto' ? 'Dinero guardado' : 'Dinero retirado'}">
              ${iconoOrigen} ${ahorro.origen}
            </span>
          </td>
          <td class="text-right ${montoClass}">
            <strong>${signo}${Calculations.formatearMoneda(Math.abs(ahorro.monto))}</strong>
          </td>
          <td class="text-right">
            <strong>${Calculations.formatearMoneda(balanceAcumulado)}</strong>
          </td>
        </tr>
      `;
    }).join('');
  },

  renderMovimientosMobile(ahorros) {
    let balanceAcumulado = 0;
    return ahorros.map(ahorro => {
      balanceAcumulado += ahorro.monto;
      const isEntrada = ahorro.tipo === 'entrada';
      const iconoOrigen = ahorro.origen === 'gasto' ? '💸' : '💵';
      const badgeClass = isEntrada ? 'badge-success' : 'badge-danger';
      const tipoLabel = isEntrada ? 'Entrada' : 'Salida';
      const montoClass = isEntrada ? 'text-success' : 'text-danger';
      const signo = isEntrada ? '+' : '';
      
      return `
        <div class="mobile-list-item" onclick="this.classList.toggle('expanded')">
          <div class="mobile-item-main">
            <div class="mobile-item-primary">
              <div style="font-size: 0.85rem; color: var(--text-secondary);">${Calculations.formatearFecha(ahorro.fecha)}</div>
              <div style="margin: 4px 0;">
                <span class="${montoClass}" style="font-weight: 600;">${signo}${Calculations.formatearMoneda(Math.abs(ahorro.monto))}</span>
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 0.75rem; color: var(--text-secondary);">Balance</div>
              <div style="font-weight: 600;">${Calculations.formatearMoneda(balanceAcumulado)}</div>
            </div>
          </div>
          <div class="mobile-item-details">
            <div style="margin-bottom: var(--spacing-sm);">
              <strong>Descripción:</strong> ${ahorro.descripcion || '-'}
            </div>
            <div style="margin-bottom: var(--spacing-sm);">
              <strong>Tipo:</strong> <span class="badge ${badgeClass}">${tipoLabel}</span>
            </div>
            <div>
              <strong>Origen:</strong> 
              <span title="${ahorro.origen === 'gasto' ? 'Dinero guardado' : 'Dinero retirado'}">
                ${iconoOrigen} ${ahorro.origen}
              </span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
};
