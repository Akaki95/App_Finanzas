// Controlador de Auditoría - Gestión de tiquets de revisión
const AuditoriaController = {
  cuentasTemp: {},
  
  async render() {
    // Asegurar que la configuración esté cargada
    const configFromServer = await SyncService.loadFromCloud('configuracion_cuentas');
    if (configFromServer && configFromServer.length > 0) {
      CacheService.set('configuracion_cuentas', configFromServer);
    }
    
    const mainContent = document.getElementById('main-content');
    const auditorias = AuditoriaModel.getAll();
    const estadisticas = AuditoriaModel.getEstadisticas();
    const balanceMes = AuditoriaModel.getBalanceMesActual();
    const cuentasConfig = AuditoriaModel.getCuentasConfig();
    
    mainContent.innerHTML = `
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">🔍 Auditoría de Cuentas</h2>
          <button class="btn btn-primary" onclick="AuditoriaController.nuevaAuditoria()">➕ Nuevo Tiquet</button>
        </div>
        
        <div class="info-banner">
          <div class="info-banner-icon">ℹ️</div>
          <div class="info-banner-text">
            Crea tiquets para verificar que tus cuentas cuadren con tu balance del mes actual.
            <ul>
              <li><strong>Balance del mes:</strong> ${Calculations.formatearMoneda(balanceMes)}</li>
              <li><strong>Objetivo:</strong> El total de tus cuentas debe coincidir con este balance</li>
            </ul>
          </div>
        </div>
        
        <!-- Estadísticas -->
        <div class="summary-cards">
          <div class="summary-card balance">
            <div class="summary-card-label">Balance del Mes</div>
            <div class="summary-card-value">${Calculations.formatearMoneda(balanceMes)}</div>
          </div>
          <div class="summary-card ingresos">
            <div class="summary-card-label">Auditorías Realizadas</div>
            <div class="summary-card-value">${estadisticas.total}</div>
          </div>
          <div class="summary-card success">
            <div class="summary-card-label">Cuadradas ✓</div>
            <div class="summary-card-value">${estadisticas.cuadradas}</div>
            <div class="summary-card-change">${estadisticas.porcentajeCuadradas.toFixed(1)}%</div>
          </div>
          <div class="summary-card gastos">
            <div class="summary-card-label">No Cuadradas ⚠️</div>
            <div class="summary-card-value">${estadisticas.noCuadradas}</div>
          </div>
          <div class="summary-card config-card" onclick="AuditoriaController.abrirConfiguracion()" style="cursor: pointer;">
            <div class="summary-card-label">Configurar Cuentas</div>
            <div class="summary-card-icon">⚙️</div>
            <div class="summary-card-sublabel">${cuentasConfig.length} cuenta${cuentasConfig.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
        
        <!-- Modal Configuración de Cuentas -->
        <div id="modal-config-cuentas" class="modal-overlay">
          <div class="modal-content modal-medium">
            <div class="modal-header">
              <h3 class="modal-title">⚙️ Configuración de Cuentas</h3>
              <button class="modal-close" onclick="AuditoriaController.cerrarConfiguracion()">&times;</button>
            </div>
            <div class="modal-body">
              <p class="modal-description">Configura las cuentas bancarias y efectivo que deseas auditar regularmente.</p>
              
              <div class="form-group">
                <button class="btn btn-secondary btn-block" onclick="AuditoriaController.agregarCuentaConfig()">➕ Agregar Nueva Cuenta</button>
              </div>
              
              <div id="lista-cuentas-config" class="cuentas-config-list-modal">
                ${cuentasConfig.length === 0 ? `
                  <div class="empty-message">No hay cuentas configuradas. Agrega tu primera cuenta.</div>
                ` : `
                  ${cuentasConfig.map(c => `
                    <div class="cuenta-config-item-modal">
                      <span class="cuenta-config-nombre">${c.descripcion}</span>
                      <button class="btn-icon-delete" onclick="AuditoriaController.eliminarCuentaConfig('${c.id}')">🗑️</button>
                    </div>
                  `).join('')}
                `}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Modal Nuevo Tiquet -->
        <div id="modal-auditoria" class="modal-overlay">
          <div class="modal-content modal-large">
            <div class="modal-header">
              <h3 class="modal-title">Nuevo Tiquet de Auditoría</h3>
              <button class="modal-close" onclick="AuditoriaController.cancelar()">&times;</button>
            </div>
            <div class="modal-body">
              <div class="auditoria-balance-info">
                <span class="balance-label">Balance del mes a verificar:</span>
                <span class="balance-valor">${Calculations.formatearMoneda(balanceMes)}</span>
              </div>
              
              <div class="cuentas-section">
                <h4>Montos Actuales</h4>
                
                <div id="montos-list" class="montos-list">
                  ${cuentasConfig.map(cuenta => `
                    <div class="monto-item">
                      <label class="monto-label">${cuenta.descripcion}</label>
                      <input 
                        type="number" 
                        class="form-input monto-input" 
                        id="monto-${cuenta.id}" 
                        step="0.01" 
                        min="0" 
                        placeholder="0.00"
                        onchange="AuditoriaController.actualizarMontos()"
                      >
                    </div>
                  `).join('')}
                </div>
                
                <div class="total-cuentas">
                  <span class="total-label">Total en cuentas:</span>
                  <span class="total-valor" id="total-cuentas">€0.00</span>
                </div>
                
                <div class="diferencia-section" id="diferencia-section" style="display: none;">
                  <div class="diferencia-info">
                    <span class="diferencia-label">Diferencia:</span>
                    <span class="diferencia-valor" id="diferencia-valor"></span>
                  </div>
                  <div class="diferencia-estado" id="diferencia-estado"></div>
                </div>
              </div>
              
              <div class="form-group">
                <label class="form-label">Notas (Opcional)</label>
                <textarea id="auditoria-notas" class="form-textarea" rows="3" placeholder="Observaciones sobre esta auditoría..."></textarea>
              </div>
              
              <div class="form-error" id="auditoria-errors"></div>
              <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="AuditoriaController.cancelar()">Cancelar</button>
                <button type="button" class="btn btn-primary" onclick="AuditoriaController.guardar()">Crear Tiquet</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Lista de Auditorías -->
        <div class="card">
          <div class="card-header">
            <h3>Historial de Tiquets</h3>
          </div>
          ${auditorias.length === 0 ? `
            <div class="empty-state">
              <div class="empty-state-icon">🔍</div>
              <div class="empty-state-title">No hay auditorías registradas</div>
              <div class="empty-state-description">
                Crea tu primer tiquet para verificar que tus cuentas cuadren con el balance
              </div>
            </div>
          ` : `
            <div class="auditorias-list">
              ${auditorias.map((a, index) => this.renderAuditoria(a, index)).join('')}
            </div>
          `}
        </div>
      </div>
    `;
    
    this.cuentasTemp = {};
  },
  
  renderMontosAuditoria(auditoria) {
    const cuentasConfig = AuditoriaModel.getCuentasConfig();
    
    // Si la auditoría usa el formato antiguo (cuentas array)
    if (auditoria.cuentas && Array.isArray(auditoria.cuentas)) {
      return auditoria.cuentas.map(c => `
        <tr>
          <td>${c.descripcion}</td>
          <td class="text-right">${Calculations.formatearMoneda(c.monto)}</td>
        </tr>
      `).join('');
    }
    
    // Formato nuevo (montos por cuentaId)
    if (!auditoria.montos || typeof auditoria.montos !== 'object') {
      return '<tr><td colspan="2">Sin datos de montos</td></tr>';
    }
    
    return cuentasConfig.map(cuenta => {
      const monto = auditoria.montos[cuenta.id] || 0;
      if (monto > 0) {
        return `
          <tr>
            <td>${cuenta.descripcion}</td>
            <td class="text-right">${Calculations.formatearMoneda(monto)}</td>
          </tr>
        `;
      }
      return '';
    }).filter(row => row).join('');
  },
  
  renderAuditoria(auditoria, index) {
    const fecha = new Date(auditoria.fecha);
    const fechaFormateada = fecha.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const estadoClass = auditoria.cuadra ? 'success' : 'error';
    const estadoIcon = auditoria.cuadra ? '✓' : '⚠️';
    const estadoTexto = auditoria.cuadra ? 'Cuadra' : 'No Cuadra';
    
    return `
      <div class="auditoria-item ${estadoClass}">
        <div class="auditoria-header" onclick="AuditoriaController.toggleDetalle(${index})">
          <div class="auditoria-fecha">${fechaFormateada}</div>
          <div class="auditoria-resumen">
            <span class="auditoria-total">Total: ${Calculations.formatearMoneda(auditoria.totalCuentas)}</span>
            <span class="auditoria-balance">Balance: ${Calculations.formatearMoneda(auditoria.balanceMes)}</span>
            <span class="auditoria-diferencia ${auditoria.diferencia >= 0 ? 'positiva' : 'negativa'}">
              Diferencia: ${auditoria.diferencia >= 0 ? '+' : ''}${Calculations.formatearMoneda(auditoria.diferencia)}
            </span>
            <span class="auditoria-estado badge badge-${auditoria.cuadra ? 'success' : 'warning'}">
              ${estadoIcon} ${estadoTexto}
            </span>
          </div>
          <button class="auditoria-toggle">▼</button>
        </div>
        
        <div class="auditoria-detalle" id="auditoria-detalle-${index}">
          <div class="auditoria-cuentas">
            <h4>Montos Registrados</h4>
            <table class="table">
              <thead>
                <tr>
                  <th>Cuenta</th>
                  <th class="text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                ${this.renderMontosAuditoria(auditoria)}
              </tbody>
              <tfoot>
                <tr>
                  <td><strong>TOTAL EN CUENTAS</strong></td>
                  <td class="text-right"><strong>${Calculations.formatearMoneda(auditoria.totalCuentas)}</strong></td>
                </tr>
                ${(auditoria.totalCustodia || 0) > 0 ? `
                  <tr class="custodia-row">
                    <td><strong>- Custodia (Dinero de terceros)</strong></td>
                    <td class="text-right text-warning"><strong>-${Calculations.formatearMoneda(auditoria.totalCustodia)}</strong></td>
                  </tr>
                ` : ''}
                ${(auditoria.totalAhorros || 0) > 0 ? `
                  <tr class="custodia-row">
                    <td><strong>- Ahorros (Dinero apartado)</strong></td>
                    <td class="text-right text-warning"><strong>-${Calculations.formatearMoneda(auditoria.totalAhorros)}</strong></td>
                  </tr>
                ` : ''}
                ${(auditoria.totalCustodia || auditoria.totalAhorros) ? `
                  <tr class="balance-real-row">
                    <td><strong>= BALANCE REAL</strong></td>
                    <td class="text-right"><strong>${Calculations.formatearMoneda(auditoria.totalCuentas - (auditoria.totalCustodia || 0) - (auditoria.totalAhorros || 0))}</strong></td>
                  </tr>
                ` : ''}
              </tfoot>
            </table>
          </div>
          
          ${auditoria.notas ? `
            <div class="auditoria-notas">
              <h4>Notas</h4>
              <p>${auditoria.notas}</p>
            </div>
          ` : ''}
          
          <div class="auditoria-actions">
            <button class="btn btn-small btn-danger" onclick="AuditoriaController.eliminar('${auditoria.id}')">🗑️ Eliminar</button>
          </div>
        </div>
      </div>
    `;
  },
  
  toggleDetalle(index) {
    const detalle = document.getElementById(`auditoria-detalle-${index}`);
    const toggle = detalle.previousElementSibling.querySelector('.auditoria-toggle');
    
    if (detalle.style.display === 'block') {
      detalle.style.display = 'none';
      toggle.textContent = '▼';
    } else {
      detalle.style.display = 'block';
      toggle.textContent = '▲';
    }
  },
  
  abrirConfiguracion() {
    document.getElementById('modal-config-cuentas').classList.add('show');
  },
  
  cerrarConfiguracion() {
    document.getElementById('modal-config-cuentas').classList.remove('show');
  },
  
  nuevaAuditoria() {
    const cuentasConfig = AuditoriaModel.getCuentasConfig();
    
    if (cuentasConfig.length === 0) {
      showConfirmModal(
        'Primero debes configurar al menos una cuenta. Haz clic en la tarjeta "Configurar Cuentas" para empezar.',
        () => {
          this.abrirConfiguracion();
        },
        null,
        'Entendido'
      );
      return;
    }
    
    this.cuentasTemp = {};
    // Limpiar todos los inputs de monto
    cuentasConfig.forEach(cuenta => {
      const input = document.getElementById(`monto-${cuenta.id}`);
      if (input) input.value = '';
    });
    
    document.getElementById('auditoria-notas').value = '';
    document.getElementById('auditoria-errors').textContent = '';
    document.getElementById('auditoria-errors').classList.remove('show');
    this.actualizarMontos();
    document.getElementById('modal-auditoria').classList.add('show');
  },
  
  agregarCuentaConfig() {
    // Mostrar modal para agregar cuenta a la configuración
    const modalHtml = `
      <div id="modal-agregar-cuenta-config" class="modal-overlay" style="display: flex;">
        <div class="modal-content modal-small">
          <div class="modal-header">
            <h3 class="modal-title">Nueva Cuenta</h3>
            <button class="modal-close" onclick="AuditoriaController.cerrarModalCuentaConfig()">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Nombre de la Cuenta *</label>
              <input type="text" id="nueva-cuenta-config-nombre" class="form-input" placeholder="ej: Banco BBVA, Efectivo en cartera" autofocus>
            </div>
            <div class="form-error" id="cuenta-config-error"></div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" onclick="AuditoriaController.cerrarModalCuentaConfig()">Cancelar</button>
              <button type="button" class="btn btn-primary" onclick="AuditoriaController.confirmarAgregarCuentaConfig()">Agregar</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = modalHtml;
    document.body.appendChild(tempDiv.firstElementChild);
    
    setTimeout(() => {
      document.getElementById('nueva-cuenta-config-nombre').focus();
      document.getElementById('nueva-cuenta-config-nombre').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.confirmarAgregarCuentaConfig();
        }
      });
    }, 100);
  },
  
  cerrarModalCuentaConfig() {
    const modal = document.getElementById('modal-agregar-cuenta-config');
    if (modal) {
      modal.remove();
    }
  },
  
  confirmarAgregarCuentaConfig() {
    const nombre = document.getElementById('nueva-cuenta-config-nombre').value.trim();
    const errorEl = document.getElementById('cuenta-config-error');
    
    if (!nombre) {
      errorEl.textContent = 'El nombre es requerido';
      errorEl.classList.add('show');
      return;
    }
    
    AuditoriaModel.addCuentaConfig(nombre);
    this.cerrarModalCuentaConfig();
    
    // Actualizar lista en el modal de configuración si está abierto
    const modalConfig = document.getElementById('modal-config-cuentas');
    if (modalConfig && modalConfig.classList.contains('show')) {
      // Esperar un momento para que se sincronice
      setTimeout(() => {
        this.actualizarListaCuentasConfig();
      }, 100);
    }
  },
  
  eliminarCuentaConfig(id) {
    showConfirmModal(
      '¿Eliminar esta cuenta de la configuración?',
      () => {
        AuditoriaModel.deleteCuentaConfig(id);
        
        // Actualizar lista en el modal de configuración si está abierto
        const modalConfig = document.getElementById('modal-config-cuentas');
        if (modalConfig && modalConfig.classList.contains('show')) {
          setTimeout(() => {
            this.actualizarListaCuentasConfig();
          }, 100);
        }
      }
    );
  },
  
  actualizarListaCuentasConfig() {
    const cuentasConfig = AuditoriaModel.getCuentasConfig();
    const listaEl = document.getElementById('lista-cuentas-config');
    
    if (!listaEl) return;
    
    if (cuentasConfig.length === 0) {
      listaEl.innerHTML = '<div class="empty-message">No hay cuentas configuradas. Agrega tu primera cuenta.</div>';
    } else {
      listaEl.innerHTML = cuentasConfig.map(c => `
        <div class="cuenta-config-item-modal">
          <span class="cuenta-config-nombre">${c.descripcion}</span>
          <button class="btn-icon-delete" onclick="AuditoriaController.eliminarCuentaConfig('${c.id}')">🗑️</button>
        </div>
      `).join('');
    }
  },
  
  actualizarMontos() {
    const cuentasConfig = AuditoriaModel.getCuentasConfig();
    const totalCuentasEl = document.getElementById('total-cuentas');
    const diferenciaSection = document.getElementById('diferencia-section');
    const diferenciaValor = document.getElementById('diferencia-valor');
    const diferenciaEstado = document.getElementById('diferencia-estado');
    
    // Leer montos de los inputs
    const montos = {};
    let total = 0;
    let hayCantidades = false;
    
    cuentasConfig.forEach(cuenta => {
      const input = document.getElementById(`monto-${cuenta.id}`);
      if (input && input.value) {
        const monto = parseFloat(input.value) || 0;
        if (monto > 0) {
          hayCantidades = true;
          montos[cuenta.id] = monto;
          total += monto;
        }
      }
    });
    
    this.cuentasTemp = montos;
    
    if (!hayCantidades) {
      totalCuentasEl.textContent = '€0.00';
      diferenciaSection.style.display = 'none';
      return;
    }
    
    const balanceMes = AuditoriaModel.getBalanceMesActual();
    const totalCustodia = AuditoriaModel.getTotalCustodia();
    const totalAhorros = AuditoriaModel.getTotalAhorros();
    
    // Balance real = Total en cuentas - Custodia - Ahorros
    const balanceReal = total - totalCustodia - totalAhorros;
    const diferencia = balanceReal - balanceMes;
    const cuadra = Math.abs(diferencia) < 0.01;
    
    // Actualizar total con desglose de custodia y ahorros
    if (totalCustodia > 0 || totalAhorros > 0) {
      let desglose = `<div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-end;">
          <div><strong>${Calculations.formatearMoneda(total)}</strong></div>`;
      
      if (totalCustodia > 0) {
        desglose += `<div style="font-size: 0.85em; color: var(--text-secondary);">- Custodia: ${Calculations.formatearMoneda(totalCustodia)}</div>`;
      }
      
      if (totalAhorros > 0) {
        desglose += `<div style="font-size: 0.85em; color: var(--text-secondary);">- Ahorros: ${Calculations.formatearMoneda(totalAhorros)}</div>`;
      }
      
      desglose += `<div style="font-size: 0.9em; border-top: 1px solid var(--text-secondary); padding-top: 4px;"><strong>= ${Calculations.formatearMoneda(balanceReal)}</strong></div>
        </div>`;
      
      totalCuentasEl.innerHTML = desglose;
    } else {
      totalCuentasEl.textContent = Calculations.formatearMoneda(total);
    }
    
    // Mostrar diferencia
    diferenciaSection.style.display = 'block';
    diferenciaValor.textContent = `${diferencia >= 0 ? '+' : ''}${Calculations.formatearMoneda(diferencia)}`;
    diferenciaValor.className = `diferencia-valor ${diferencia >= 0 ? 'positiva' : 'negativa'}`;
    
    if (cuadra) {
      diferenciaEstado.innerHTML = '<span class="estado-cuadra">✓ Las cuentas cuadran con el balance</span>';
      diferenciaEstado.className = 'diferencia-estado success';
    } else {
      const mensaje = diferencia > 0 
        ? 'Tienes más dinero en cuentas que lo registrado en el balance'
        : 'Te falta dinero en cuentas para cuadrar con el balance';
      diferenciaEstado.innerHTML = `<span class="estado-no-cuadra">⚠️ ${mensaje}</span>`;
      diferenciaEstado.className = 'diferencia-estado warning';
    }
  },
  
  cancelar() {
    document.getElementById('modal-auditoria').classList.remove('show');
    this.cuentasTemp = {};
  },
  
  guardar() {
    const errorEl = document.getElementById('auditoria-errors');
    
    try {
      if (Object.keys(this.cuentasTemp).length === 0) {
        throw new Error('Debe ingresar al menos un monto');
      }
      
      const auditoriaData = {
        montos: this.cuentasTemp,
        notas: document.getElementById('auditoria-notas').value
      };
      
      AuditoriaModel.create(auditoriaData);
      this.cancelar();
      this.render();
    } catch (error) {
      errorEl.textContent = error.message;
      errorEl.classList.add('show');
    }
  },
  
  eliminar(id) {
    showConfirmModal(
      '¿Eliminar este tiquet de auditoría?',
      () => {
        AuditoriaModel.delete(id);
        this.render();
      }
    );
  }
};
