// Controlador de Préstamos
const PrestamosController = {
  render() {
    const mainContent = document.getElementById('main-content');
    const prestamos = PrestamoModel.getAll().sort((a, b) => {
      const fechaDiff = new Date(b.fechaPrestamo) - new Date(a.fechaPrestamo);
      if (fechaDiff !== 0) return fechaDiff;
      return b.id.localeCompare(a.id); // Si misma fecha, el más reciente (ID mayor) primero
    });
    const totalPendiente = PrestamoModel.getTotalPendiente();
    
    mainContent.innerHTML = `
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Gestión de Préstamos</h2>
          <button class="btn btn-primary" onclick="PrestamosController.mostrarFormulario()">➕ Nuevo Préstamo</button>
        </div>
        
        <div class="card">
          <div class="summary-card balance">
            <div class="summary-card-label">Total Pendiente de Cobro</div>
            <div class="summary-card-value">${Calculations.formatearMoneda(totalPendiente)}</div>
          </div>
        </div>
        
        <div id="modal-prestamo" class="modal-overlay">
          <div class="modal-content">
            <div class="modal-header">
              <h3 class="modal-title" id="form-prestamo-title">Nuevo Préstamo</h3>
              <button class="modal-close" onclick="PrestamosController.cancelar()">&times;</button>
            </div>
            <div class="modal-body">
              <form id="prestamo-form" onsubmit="PrestamosController.guardar(event)">
                <input type="hidden" id="prestamo-id">
                <div class="form-group">
                  <label class="form-label">Persona *</label>
                  <input type="text" id="prestamo-persona" class="form-input" required>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Monto Inicial (€) *</label>
                    <input type="number" id="prestamo-monto-inicial" class="form-input" step="0.01" min="0.01" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Monto Actual (€) *</label>
                    <input type="number" id="prestamo-monto-actual" class="form-input" step="0.01" min="0" required>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Fecha Préstamo *</label>
                    <input type="date" id="prestamo-fecha-prestamo" class="form-input" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Fecha Devolución</label>
                    <input type="date" id="prestamo-fecha-devolucion" class="form-input">
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Descripción</label>
                  <textarea id="prestamo-descripcion" class="form-textarea" rows="3"></textarea>
                </div>
                <div class="form-error" id="prestamo-errors"></div>
                <div class="form-actions">
                  <button type="button" class="btn btn-secondary" onclick="PrestamosController.cancelar()">Cancelar</button>
                  <button type="submit" class="btn btn-primary">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div id="modal-cobro" class="modal-overlay">
          <div class="modal-content">
            <div class="modal-header">
              <h3 class="modal-title">Registrar Cobro</h3>
              <button class="modal-close" onclick="PrestamosController.cancelarCobro()">&times;</button>
            </div>
            <div class="modal-body">
              <form id="cobro-form" onsubmit="PrestamosController.confirmarCobro(event)">
                <input type="hidden" id="cobro-prestamo-id">
                <div class="form-group">
                  <label class="form-label">Persona</label>
                  <input type="text" id="cobro-persona" class="form-input" readonly>
                </div>
                <div class="form-group">
                  <label class="form-label">Monto Pendiente</label>
                  <input type="text" id="cobro-pendiente" class="form-input" readonly>
                </div>
                <div class="form-group">
                  <label class="form-label">Monto del Cobro (€) *</label>
                  <input type="number" id="cobro-monto" class="form-input" step="0.01" min="0.01" required autofocus>
                </div>
                <div class="form-error" id="cobro-errors"></div>
                <div class="form-actions">
                  <button type="button" class="btn btn-secondary" onclick="PrestamosController.cancelarCobro()">Cancelar</button>
                  <button type="submit" class="btn btn-primary">Registrar Cobro</button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-title">Listado de Préstamos</div>
          ${prestamos.length === 0 ? `
            <div class="empty-state">
              <div class="empty-state-icon">💸</div>
              <div class="empty-state-title">No hay préstamos registrados</div>
            </div>
          ` : `
            <ul class="items-list">
              ${prestamos.map(p => {
                const cobros = PrestamoModel.getCobros(p.id);
                const totalCobrado = p.montoCobrado || 0;
                return `
                <li class="item item-expandible" id="prestamo-${p.id}">
                  <div class="item-main" onclick="PrestamosController.toggleDetalles('${p.id}')">
                    <div class="item-content">
                      <div class="item-title">${p.persona}</div>
                      <div class="item-subtitle">
                        Inicial: ${Calculations.formatearMoneda(p.montoInicial)} | 
                        Prestado: ${new Date(p.fechaPrestamo).toLocaleDateString('es-ES')}
                        ${p.fechaDevolucion ? ' | Devolución: ' + new Date(p.fechaDevolucion).toLocaleDateString('es-ES') : ''}
                      </div>
                    </div>
                    <div class="item-amount text-success">${Calculations.formatearMoneda(p.montoActual)}</div>
                    <div class="item-actions" onclick="event.stopPropagation()">
                      <button class="item-action-btn" onclick="PrestamosController.registrarPago('${p.id}')">💰 Cobro</button>
                      <button class="item-action-btn" onclick="PrestamosController.editar('${p.id}')">✏️</button>
                      <button class="item-action-btn delete" onclick="PrestamosController.eliminar('${p.id}')">🗑️</button>
                    </div>
                  </div>
                  <div class="item-detalles" id="detalles-${p.id}" style="display: none;">
                    <div class="deuda-resumen">
                      <div class="deuda-stat">
                        <span class="deuda-stat-label">Total Cobrado:</span>
                        <span class="deuda-stat-value text-success">${Calculations.formatearMoneda(totalCobrado)}</span>
                      </div>
                      <div class="deuda-stat">
                        <span class="deuda-stat-label">Progreso:</span>
                        <span class="deuda-stat-value">${Math.round((totalCobrado / p.montoInicial) * 100)}%</span>
                      </div>
                    </div>
                    ${cobros.length > 0 ? `
                      <div class="pagos-historial">
                        <h4 class="pagos-titulo">Historial de Cobros</h4>
                        <ul class="pagos-lista">
                          ${cobros.map(c => `
                            <li class="pago-item">
                              <span class="pago-fecha">${new Date(c.fecha).toLocaleDateString('es-ES')}</span>
                              <span class="pago-monto">${Calculations.formatearMoneda(c.monto)}</span>
                            </li>
                          `).join('')}
                        </ul>
                      </div>
                    ` : `
                      <div class="empty-state-small">No hay cobros registrados aún</div>
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
    document.getElementById('modal-prestamo').classList.add('show');
    document.getElementById('prestamo-form').reset();
    document.getElementById('form-prestamo-title').textContent = 'Nuevo Préstamo';
    document.getElementById('prestamo-fecha-prestamo').value = new Date().toISOString().split('T')[0];
  },
  
  cancelar() {
    document.getElementById('modal-prestamo').classList.remove('show');
  },
  
  guardar(event) {
    event.preventDefault();
    const id = document.getElementById('prestamo-id').value;
    const data = {
      persona: document.getElementById('prestamo-persona').value,
      montoInicial: document.getElementById('prestamo-monto-inicial').value,
      montoActual: document.getElementById('prestamo-monto-actual').value,
      montoCobrado: id ? PrestamoModel.getById(id)?.montoCobrado || 0 : 0,
      fechaPrestamo: document.getElementById('prestamo-fecha-prestamo').value,
      fechaDevolucion: document.getElementById('prestamo-fecha-devolucion').value,
      descripcion: document.getElementById('prestamo-descripcion').value
    };
    
    try {
      id ? PrestamoModel.update(id, data) : PrestamoModel.create(data);
      this.cancelar();
      this.render();
    } catch (error) {
      ValidationService.mostrarErrores([error.message], 'prestamo-errors');
    }
  },
  
  editar(id) {
    const prestamo = PrestamoModel.getById(id);
    if (!prestamo) return;
    document.getElementById('modal-prestamo').classList.add('show');
    document.getElementById('form-prestamo-title').textContent = 'Editar Préstamo';
    document.getElementById('prestamo-id').value = prestamo.id;
    document.getElementById('prestamo-persona').value = prestamo.persona;
    document.getElementById('prestamo-monto-inicial').value = prestamo.montoInicial;
    document.getElementById('prestamo-monto-actual').value = prestamo.montoActual;
    document.getElementById('prestamo-fecha-prestamo').value = prestamo.fechaPrestamo;
    document.getElementById('prestamo-fecha-devolucion').value = prestamo.fechaDevolucion || '';
    document.getElementById('prestamo-descripcion').value = prestamo.descripcion || '';
  },
  
  eliminar(id) {
    showConfirmModal(
      '¿Estás seguro de eliminar este préstamo? Esta acción no se puede deshacer.',
      () => {
        PrestamoModel.delete(id);
        this.render();
      }
    );
  },
  
  registrarPago(id) {
    const prestamo = PrestamoModel.getById(id);
    if (!prestamo) return;
    
    document.getElementById('modal-cobro').classList.add('show');
    document.getElementById('cobro-prestamo-id').value = prestamo.id;
    document.getElementById('cobro-persona').value = prestamo.persona;
    document.getElementById('cobro-pendiente').value = Calculations.formatearMoneda(prestamo.montoActual);
    document.getElementById('cobro-monto').value = '';
    document.getElementById('cobro-monto').max = prestamo.montoActual;
    document.getElementById('cobro-errors').textContent = '';
  },
  
  cancelarCobro() {
    document.getElementById('modal-cobro').classList.remove('show');
  },
  
  confirmarCobro(event) {
    event.preventDefault();
    const id = document.getElementById('cobro-prestamo-id').value;
    const monto = parseFloat(document.getElementById('cobro-monto').value);
    
    try {
      PrestamoModel.registrarPago(id, monto);
      this.cancelarCobro();
      this.render();
    } catch (error) {
      document.getElementById('cobro-errors').textContent = error.message;
    }
  },
  
  toggleDetalles(id) {
    const detalles = document.getElementById(`detalles-${id}`);
    const item = document.getElementById(`prestamo-${id}`);
    
    if (detalles.style.display === 'none') {
      detalles.style.display = 'block';
      item.classList.add('expandido');
    } else {
      detalles.style.display = 'none';
      item.classList.remove('expandido');
    }
  }
};

window.PrestamosController = PrestamosController;
