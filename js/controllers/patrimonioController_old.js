// Controlador de Patrimonio
const PatrimonioController = {
  render() {
    const mainContent = document.getElementById('main-content');
    const activos = PatrimonioModel.getAllActivos().sort((a, b) => new Date(b.fechaAdquisicion || '1900-01-01') - new Date(a.fechaAdquisicion || '1900-01-01'));
    const pasivos = PatrimonioModel.getAllPasivos().sort((a, b) => new Date(b.fechaAdquisicion || '1900-01-01') - new Date(a.fechaAdquisicion || '1900-01-01'));
    const resumen = PatrimonioModel.getResumen();
    
    mainContent.innerHTML = `
      <div class="container">
        <h2 class="section-title">Patrimonio Neto</h2>
        
        <!-- Resumen -->
        <div class="summary-cards">
          <div class="summary-card ingresos">
            <div class="summary-card-label">Total Activos</div>
            <div class="summary-card-value">${Calculations.formatearMoneda(resumen.activos)}</div>
          </div>
          <div class="summary-card gastos">
            <div class="summary-card-label">Total Pasivos</div>
            <div class="summary-card-value">${Calculations.formatearMoneda(resumen.pasivos)}</div>
          </div>
          <div class="summary-card patrimonio">
            <div class="summary-card-label">Patrimonio Neto</div>
            <div class="summary-card-value">${Calculations.formatearMoneda(resumen.patrimonioNeto)}</div>
          </div>
        </div>
        
        <!-- Tabs -->
        <div class="tabs">
          <button class="tab active" onclick="PatrimonioController.cambiarTab('activos')">Activos</button>
          <button class="tab" onclick="PatrimonioController.cambiarTab('pasivos')">Pasivos</button>
        </div>
        
        <!-- Tab Activos -->
        <div id="tab-activos" class="tab-content active">
          <div class="section-header">
            <h3>Activos</h3>
            <button class="btn btn-primary" onclick="PatrimonioController.nuevoActivo()">➕ Nuevo Activo</button>
          </div>
          <div id="modal-activo" class="modal-overlay">
            <div class="modal-content">
              <div class="modal-header">
                <h3 class="modal-title" id="form-activo-title">Nuevo Activo</h3>
                <button class="modal-close" onclick="PatrimonioController.cancelarActivo()">&times;</button>
              </div>
              <div class="modal-body">
                <form id="activo-form" onsubmit="PatrimonioController.guardarActivo(event)">
                  <input type="hidden" id="activo-id">
                  <div class="form-group">
                    <label class="form-label">Nombre *</label>
                    <input type="text" id="activo-nombre" class="form-input" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Valor (€) *</label>
                    <input type="number" id="activo-valor" class="form-input" step="0.01" min="0.01" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Descripción</label>
                    <textarea id="activo-descripcion" class="form-textarea" rows="2"></textarea>
                  </div>
                  <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="PatrimonioController.cancelarActivo()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Guardar</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          ${activos.length === 0 ? '<div class="empty-state"><div class="empty-state-icon">🏦</div><div class="empty-state-title">No hay activos registrados</div></div>' : `
            <ul class="items-list">
              ${activos.map(a => `
                <li class="item">
                  <div class="item-content">
                    <div class="item-title">${a.nombre}</div>
                    <div class="item-subtitle">${a.descripcion || '-'}</div>
                  </div>
                  <div class="item-amount text-success">${Calculations.formatearMoneda(a.valor)}</div>
                  <div class="item-actions">
                    <button class="item-action-btn" onclick="PatrimonioController.editarActivo('${a.id}')">✏️</button>
                    <button class="item-action-btn delete" onclick="PatrimonioController.eliminarActivo('${a.id}')">🗑️</button>
                  </div>
                </li>
              `).join('')}
            </ul>
          `}
        </div>
        
        <!-- Tab Pasivos -->
        <div id="tab-pasivos" class="tab-content">
          <div class="section-header">
            <h3>Pasivos</h3>
            <button class="btn btn-primary" onclick="PatrimonioController.nuevoPasivo()">➕ Nuevo Pasivo</button>
          </div>
          <div id="modal-pasivo" class="modal-overlay">
            <div class="modal-content">
              <div class="modal-header">
                <h3 class="modal-title" id="form-pasivo-title">Nuevo Pasivo</h3>
                <button class="modal-close" onclick="PatrimonioController.cancelarPasivo()">&times;</button>
              </div>
              <div class="modal-body">
                <form id="pasivo-form" onsubmit="PatrimonioController.guardarPasivo(event)">
                  <input type="hidden" id="pasivo-id">
                  <div class="form-group">
                    <label class="form-label">Nombre *</label>
                    <input type="text" id="pasivo-nombre" class="form-input" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Valor (€) *</label>
                    <input type="number" id="pasivo-valor" class="form-input" step="0.01" min="0.01" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Descripción</label>
                    <textarea id="pasivo-descripcion" class="form-textarea" rows="2"></textarea>
                  </div>
                  <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="PatrimonioController.cancelarPasivo()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Guardar</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
                <div class="form-group">
                  <label class="form-label">Descripción</label>
                  <textarea id="pasivo-descripcion" class="form-textarea" rows="2"></textarea>
                </div>
                <div class="form-actions">
                  <button type="button" class="btn btn-secondary" onclick="PatrimonioController.cancelarPasivo()">Cancelar</button>
                  <button type="submit" class="btn btn-primary">Guardar</button>
                </div>
              </form>
            </div>
          </div>
          ${pasivos.length === 0 ? '<div class="empty-state"><div class="empty-state-icon">📉</div><div class="empty-state-title">No hay pasivos registrados</div></div>' : `
            <ul class="items-list">
              ${pasivos.map(p => `
                <li class="item">
                  <div class="item-content">
                    <div class="item-title">${p.nombre}</div>
                    <div class="item-subtitle">${p.descripcion || '-'}</div>
                  </div>
                  <div class="item-amount text-danger">${Calculations.formatearMoneda(p.valor)}</div>
                  <div class="item-actions">
                    <button class="item-action-btn" onclick="PatrimonioController.editarPasivo('${p.id}')">✏️</button>
                    <button class="item-action-btn delete" onclick="PatrimonioController.eliminarPasivo('${p.id}')">🗑️</button>
                  </div>
                </li>
              `).join('')}
            </ul>
          `}
        </div>
      </div>
    `;
  },
  
  cambiarTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById(`tab-${tab}`).classList.add('active');
  },
  
  nuevoActivo() { 
    document.getElementById('modal-activo').classList.add('show');
    document.getElementById('activo-form').reset();
    document.getElementById('form-activo-title').textContent = 'Nuevo Activo';
  },
  cancelarActivo() { 
    document.getElementById('modal-activo').classList.remove('show');
    document.getElementById('activo-form').reset();
  },
  guardarActivo(event) {
    event.preventDefault();
    const id = document.getElementById('activo-id').value;
    const data = {
      nombre: document.getElementById('activo-nombre').value,
      valor: document.getElementById('activo-valor').value,
      descripcion: document.getElementById('activo-descripcion').value
    };
    try {
      id ? PatrimonioModel.updateActivo(id, data) : PatrimonioModel.createActivo(data);
      this.cancelarActivo();
      this.render();
    } catch (error) {
      alert(error.message);
    }
  },
  editarActivo(id) {
    const activo = PatrimonioModel.getActivoById(id);
    if (!activo) return;
    document.getElementById('modal-activo').classList.add('show');
    document.getElementById('form-activo-title').textContent = 'Editar Activo';
    document.getElementById('activo-id').value = activo.id;
    document.getElementById('activo-nombre').value = activo.nombre;
    document.getElementById('activo-valor').value = activo.valor;
    document.getElementById('activo-descripcion').value = activo.descripcion || '';
  },
  eliminarActivo(id) {
    showConfirmModal(
      '¿Estás seguro de eliminar este activo? Esta acción no se puede deshacer.',
      () => {
        PatrimonioModel.deleteActivo(id);
        this.render();
      }
    );
  },
  
  nuevoPasivo() { 
    document.getElementById('modal-pasivo').classList.add('show');
    document.getElementById('pasivo-form').reset();
    document.getElementById('form-pasivo-title').textContent = 'Nuevo Pasivo';
  },
  cancelarPasivo() { 
    document.getElementById('modal-pasivo').classList.remove('show');
    document.getElementById('pasivo-form').reset();
  },
  guardarPasivo(event) {
    event.preventDefault();
    const id = document.getElementById('pasivo-id').value;
    const data = {
      nombre: document.getElementById('pasivo-nombre').value,
      valor: document.getElementById('pasivo-valor').value,
      descripcion: document.getElementById('pasivo-descripcion').value
    };
    try {
      id ? PatrimonioModel.updatePasivo(id, data) : PatrimonioModel.createPasivo(data);
      this.cancelarPasivo();
      this.render();
    } catch (error) {
      alert(error.message);
    }
  },
  editarPasivo(id) {
    const pasivo = PatrimonioModel.getPasivoById(id);
    if (!pasivo) return;
    document.getElementById('modal-pasivo').classList.add('show');
    document.getElementById('form-pasivo-title').textContent = 'Editar Pasivo';
    document.getElementById('pasivo-id').value = pasivo.id;
    document.getElementById('pasivo-nombre').value = pasivo.nombre;
    document.getElementById('pasivo-valor').value = pasivo.valor;
    document.getElementById('pasivo-descripcion').value = pasivo.descripcion || '';
  },
  eliminarPasivo(id) {
    showConfirmModal(
      '¿Estás seguro de eliminar este pasivo? Esta acción no se puede deshacer.',
      () => {
        PatrimonioModel.deletePasivo(id);
        this.render();
      }
    );
  }
};

window.PatrimonioController = PatrimonioController;
