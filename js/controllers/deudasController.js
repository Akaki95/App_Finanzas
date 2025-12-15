// Controlador de Deudas
const DeudasController = {
  render() {
    const mainContent = document.getElementById('main-content');
    const deudas = DeudaModel.getAll().sort((a, b) => {
      const fechaDiff = new Date(b.fechaInicio) - new Date(a.fechaInicio);
      if (fechaDiff !== 0) return fechaDiff;
      return b.id.localeCompare(a.id); // Si misma fecha, el más reciente (ID mayor) primero
    });
    const totalPendiente = DeudaModel.getTotalPendiente();
    
    mainContent.innerHTML = `
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Gestión de Deudas</h2>
          <button class="btn btn-primary" onclick="DeudasController.mostrarFormulario()">➕ Nueva Deuda</button>
        </div>
        
        <div class="card">
          <div class="summary-card gastos">
            <div class="summary-card-label">Total Pendiente</div>
            <div class="summary-card-value">${Calculations.formatearMoneda(totalPendiente)}</div>
          </div>
        </div>
        
        <div id="modal-deuda" class="modal-overlay">
          <div class="modal-content">
            <div class="modal-header">
              <h3 class="modal-title" id="form-deuda-title">Nueva Deuda</h3>
              <button class="modal-close" onclick="DeudasController.cancelar()">&times;</button>
            </div>
            <div class="modal-body">
              <form id="deuda-form" onsubmit="DeudasController.guardar(event)">
                <input type="hidden" id="deuda-id">
                <div class="form-group">
                  <label class="form-label">Acreedor *</label>
                  <input type="text" id="deuda-acreedor" class="form-input" required>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Monto Inicial (€) *</label>
                    <input type="number" id="deuda-monto-inicial" class="form-input" step="0.01" min="0.01" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Monto Pendiente (€) *</label>
                    <input type="number" id="deuda-monto-pendiente" class="form-input" step="0.01" min="0" required>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Fecha Inicio *</label>
                    <input type="date" id="deuda-fecha-inicio" class="form-input" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Fecha Vencimiento</label>
                    <input type="date" id="deuda-fecha-vencimiento" class="form-input">
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Descripción</label>
                  <textarea id="deuda-descripcion" class="form-textarea" rows="3"></textarea>
                </div>
                <div class="form-error" id="deuda-errors"></div>
                <div class="form-actions">
                  <button type="button" class="btn btn-secondary" onclick="DeudasController.cancelar()">Cancelar</button>
                  <button type="submit" class="btn btn-primary">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div id="modal-pago" class="modal-overlay">
          <div class="modal-content">
            <div class="modal-header">
              <h3 class="modal-title">Registrar Pago</h3>
              <button class="modal-close" onclick="DeudasController.cancelarPago()">&times;</button>
            </div>
            <div class="modal-body">
              <form id="pago-form" onsubmit="DeudasController.confirmarPago(event)">
                <input type="hidden" id="pago-deuda-id">
                <div class="form-group">
                  <label class="form-label">Acreedor</label>
                  <input type="text" id="pago-acreedor" class="form-input" readonly>
                </div>
                <div class="form-group">
                  <label class="form-label">Monto Pendiente</label>
                  <input type="text" id="pago-pendiente" class="form-input" readonly>
                </div>
                <div class="form-group">
                  <label class="form-label">Monto del Pago (€) *</label>
                  <input type="number" id="pago-monto" class="form-input" step="0.01" min="0.01" required autofocus>
                </div>
                <div class="form-error" id="pago-errors"></div>
                <div class="form-actions">
                  <button type="button" class="btn btn-secondary" onclick="DeudasController.cancelarPago()">Cancelar</button>
                  <button type="submit" class="btn btn-primary">Registrar Pago</button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-title">Listado de Deudas</div>
          ${deudas.length === 0 ? `
            <div class="empty-state">
              <div class="empty-state-icon">💳</div>
              <div class="empty-state-title">No hay deudas registradas</div>
            </div>
          ` : `
            <ul class="items-list">
              ${deudas.map(d => {
                const pagos = DeudaModel.getPagosDeuda(d.id);
                const totalPagado = d.montoInicial - d.montoPendiente;
                return `
                <li class="item item-expandible" id="deuda-${d.id}">
                  <div class="item-main" onclick="DeudasController.toggleDetalles('${d.id}')">
                    <div class="item-content">
                      <div class="item-title">${d.acreedor}</div>
                      <div class="item-subtitle">
                        Inicial: ${Calculations.formatearMoneda(d.montoInicial)} | 
                        Inicio: ${new Date(d.fechaInicio).toLocaleDateString('es-ES')}
                        ${d.fechaVencimiento ? ' | Vence: ' + new Date(d.fechaVencimiento).toLocaleDateString('es-ES') : ''}
                      </div>
                    </div>
                    <div class="item-amount text-danger">${Calculations.formatearMoneda(d.montoPendiente)}</div>
                    <div class="item-actions" onclick="event.stopPropagation()">
                      <button class="item-action-btn" onclick="DeudasController.registrarPago('${d.id}')">💰 Pago</button>
                      <button class="item-action-btn" onclick="DeudasController.editar('${d.id}')">✏️</button>
                      <button class="item-action-btn delete" onclick="DeudasController.eliminar('${d.id}')">🗑️</button>
                    </div>
                  </div>
                  <div class="item-detalles" id="detalles-${d.id}" style="display: none;">
                    <div class="deuda-resumen">
                      <div class="deuda-stat">
                        <span class="deuda-stat-label">Total Pagado:</span>
                        <span class="deuda-stat-value text-success">${Calculations.formatearMoneda(totalPagado)}</span>
                      </div>
                      <div class="deuda-stat">
                        <span class="deuda-stat-label">Progreso:</span>
                        <span class="deuda-stat-value">${Math.round((totalPagado / d.montoInicial) * 100)}%</span>
                      </div>
                    </div>
                    ${pagos.length > 0 ? `
                      <div class="pagos-historial">
                        <h4 class="pagos-titulo">Historial de Pagos</h4>
                        <ul class="pagos-lista">
                          ${pagos.map(p => `
                            <li class="pago-item">
                              <span class="pago-fecha">${new Date(p.fecha).toLocaleDateString('es-ES')}</span>
                              <span class="pago-monto">${Calculations.formatearMoneda(p.monto)}</span>
                            </li>
                          `).join('')}
                        </ul>
                      </div>
                    ` : `
                      <div class="empty-state-small">No hay pagos registrados aún</div>
                    `}
                  </div>
                </li>
              `}).join('')}
            </ul>
          `}
        </div>
      </div>
    `;
  },
  
  mostrarFormulario() {
    document.getElementById('modal-deuda').classList.add('show');
    document.getElementById('deuda-form').reset();
    document.getElementById('form-deuda-title').textContent = 'Nueva Deuda';
    document.getElementById('deuda-fecha-inicio').value = new Date().toISOString().split('T')[0];
  },
  
  cancelar() {
    document.getElementById('modal-deuda').classList.remove('show');
  },
  
  guardar(event) {
    event.preventDefault();
    const id = document.getElementById('deuda-id').value;
    const data = {
      acreedor: document.getElementById('deuda-acreedor').value,
      montoInicial: document.getElementById('deuda-monto-inicial').value,
      montoPendiente: document.getElementById('deuda-monto-pendiente').value,
      fechaInicio: document.getElementById('deuda-fecha-inicio').value,
      fechaVencimiento: document.getElementById('deuda-fecha-vencimiento').value,
      descripcion: document.getElementById('deuda-descripcion').value
    };
    
    try {
      id ? DeudaModel.update(id, data) : DeudaModel.create(data);
      this.cancelar();
      this.render();
    } catch (error) {
      ValidationService.mostrarErrores([error.message], 'deuda-errors');
    }
  },
  
  editar(id) {
    const deuda = DeudaModel.getById(id);
    if (!deuda) return;
    document.getElementById('modal-deuda').classList.add('show');
    document.getElementById('form-deuda-title').textContent = 'Editar Deuda';
    document.getElementById('deuda-id').value = deuda.id;
    document.getElementById('deuda-acreedor').value = deuda.acreedor;
    document.getElementById('deuda-monto-inicial').value = deuda.montoInicial;
    document.getElementById('deuda-monto-pendiente').value = deuda.montoPendiente;
    document.getElementById('deuda-fecha-inicio').value = deuda.fechaInicio;
    document.getElementById('deuda-fecha-vencimiento').value = deuda.fechaVencimiento || '';
    document.getElementById('deuda-descripcion').value = deuda.descripcion || '';
  },
  
  eliminar(id) {
    showConfirmModal(
      '¿Estás seguro de eliminar esta deuda? Esta acción no se puede deshacer.',
      () => {
        DeudaModel.delete(id);
        this.render();
      }
    );
  },
  
  registrarPago(id) {
    const deuda = DeudaModel.getById(id);
    if (!deuda) return;
    
    document.getElementById('modal-pago').classList.add('show');
    document.getElementById('pago-deuda-id').value = deuda.id;
    document.getElementById('pago-acreedor').value = deuda.acreedor;
    document.getElementById('pago-pendiente').value = Calculations.formatearMoneda(deuda.montoPendiente);
    document.getElementById('pago-monto').value = '';
    document.getElementById('pago-monto').max = deuda.montoPendiente;
    document.getElementById('pago-errors').textContent = '';
  },
  
  cancelarPago() {
    document.getElementById('modal-pago').classList.remove('show');
  },
  
  confirmarPago(event) {
    event.preventDefault();
    const id = document.getElementById('pago-deuda-id').value;
    const monto = parseFloat(document.getElementById('pago-monto').value);
    
    try {
      DeudaModel.registrarPago(id, monto);
      this.cancelarPago();
      this.render();
    } catch (error) {
      document.getElementById('pago-errors').textContent = error.message;
    }
  },
  
  toggleDetalles(id) {
    const detalles = document.getElementById(`detalles-${id}`);
    const item = document.getElementById(`deuda-${id}`);
    
    if (detalles.style.display === 'none') {
      detalles.style.display = 'block';
      item.classList.add('expandido');
    } else {
      detalles.style.display = 'none';
      item.classList.remove('expandido');
    }
  }
};

window.DeudasController = DeudasController;
