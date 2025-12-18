// Controlador de Ingresos - Similar a Gastos
const IngresosController = {
  render() {
    const mainContent = document.getElementById('main-content');
    const ingresos = IngresoModel.getAll().sort((a, b) => {
      const fechaDiff = new Date(b.fecha) - new Date(a.fecha);
      if (fechaDiff !== 0) return fechaDiff;
      return b.id.localeCompare(a.id); // Si misma fecha, el más reciente (ID mayor) primero
    });
    
    mainContent.innerHTML = `
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Gestión de Ingresos</h2>
          <div class="section-header-actions">
            <button class="btn btn-secondary" onclick="IngresosController.gestionarAutomaticos()">
              ⚙️ Ingresos Automáticos
            </button>
            <button class="btn btn-primary" onclick="IngresosController.mostrarFormulario()">
              ➕ Nuevo Ingreso
            </button>
          </div>
        </div>
        
        <div id="modal-ingreso" class="modal-overlay">
          <div class="modal-content">
            <div class="modal-header">
              <h3 class="modal-title" id="form-ingreso-title">Nuevo Ingreso</h3>
              <button class="modal-close" onclick="IngresosController.cancelar()">&times;</button>
            </div>
            <div class="modal-body">
              <form id="ingreso-form" onsubmit="IngresosController.guardar(event)">
                <input type="hidden" id="ingreso-id">
                ${FormBuilder.renderInRows('ingresos', 'ingreso-form')}
                <div class="form-error" id="ingreso-errors"></div>
                <div class="form-actions">
                  <button type="button" class="btn btn-secondary" onclick="IngresosController.cancelar()">Cancelar</button>
                  <button type="submit" class="btn btn-primary">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-title">Listado de Ingresos</div>
          <div class="table-container">
            ${ingresos.length === 0 ? `
              <div class="empty-state">
                <div class="empty-state-icon">💰</div>
                <div class="empty-state-title">No hay ingresos registrados</div>
              </div>
            ` : `
              <div class="table-responsive">
                <table class="table">
                  <thead><tr><th>Fecha</th><th>Descripción</th><th>Tipo</th><th>Monto</th><th>Acciones</th></tr></thead>
                  <tbody>
                    ${ingresos.map(i => `
                      <tr>
                        <td>${new Date(i.fecha).toLocaleDateString('es-ES')}</td>
                        <td>${i.descripcion || '-'}${i.origenGrupo ? ' <span class="grupo-origen">(de grupo)</span>' : ''}</td>
                        <td><span class="badge badge-success">${i.tipo}</span></td>
                        <td class="text-success">${Calculations.formatearMoneda(i.monto)}</td>
                        <td>
                          <button class="btn btn-small btn-secondary" onclick="IngresosController.editar('${i.id}')">Editar</button>
                          <button class="btn btn-small btn-danger" onclick="IngresosController.eliminar('${i.id}')">Eliminar</button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
              <div class="mobile-list">
                ${ingresos.map(i => `
                  <div class="mobile-list-item" onclick="this.classList.toggle('expanded')">
                    <div class="mobile-item-main">
                      <div class="mobile-item-primary">
                        <div style="font-size: 0.85rem; color: var(--text-secondary);">${new Date(i.fecha).toLocaleDateString('es-ES')}</div>
                        <div style="margin: 4px 0;">
                          <span class="badge badge-success">${i.tipo}</span>
                        </div>
                      </div>
                      <div class="mobile-item-amount text-success">${Calculations.formatearMoneda(i.monto)}</div>
                    </div>
                    <div class="mobile-item-details">
                      <div style="margin-bottom: var(--spacing-sm);">
                        <strong>Descripción:</strong> ${i.descripcion || '-'}${i.origenGrupo ? ' <span class=\"grupo-origen\">(de grupo)</span>' : ''}
                      </div>
                      <div style="display: flex; gap: var(--spacing-sm);">
                        <button class="btn btn-small btn-secondary" 
                                onclick="event.stopPropagation(); IngresosController.editar('${i.id}')">Editar</button>
                        <button class="btn btn-small btn-danger" 
                                onclick="event.stopPropagation(); IngresosController.eliminar('${i.id}')">Eliminar</button>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  },
  
  mostrarFormulario() {
    document.getElementById('modal-ingreso').classList.add('show');
    document.getElementById('ingreso-id').value = '';
    document.getElementById('form-ingreso-title').textContent = 'Nuevo Ingreso';
    FormBuilder.clearForm('ingresos');
    ValidationService.limpiarErrores('ingreso-errors');
  },
  
  cancelar() {
    document.getElementById('modal-ingreso').classList.remove('show');
    FormBuilder.clearForm('ingresos');
    ValidationService.limpiarErrores('ingreso-errors');
  },
  
  guardar(event) {
    event.preventDefault();
    
    // Validar formulario dinámico
    const validation = FormBuilder.validateForm('ingresos');
    if (!validation.valid) {
      ValidationService.mostrarErrores(validation.errors, 'ingreso-errors');
      return;
    }
    
    const id = document.getElementById('ingreso-id').value;
    const ingresoData = FormBuilder.extractFormData('ingresos');
    
    try {
      if (id) {
        IngresoModel.update(id, ingresoData);
      } else {
        IngresoModel.create(ingresoData);
      }
      
      this.cancelar();
      this.render();
    } catch (error) {
      Logger.error('Error guardando ingreso', error);
      ValidationService.mostrarErrores([error.message], 'ingreso-errors');
    }
  },
  
  editar(id) {
    const ingreso = IngresoModel.getById(id);
    if (!ingreso) {
      return;
    }
    
    document.getElementById('modal-ingreso').classList.add('show');
    document.getElementById('form-ingreso-title').textContent = 'Editar Ingreso';
    document.getElementById('ingreso-id').value = ingreso.id;
    FormBuilder.fillForm('ingresos', ingreso);
    ValidationService.limpiarErrores('ingreso-errors');
  },
  
  eliminar(id) {
    showConfirmModal(
      '¿Estás seguro de eliminar este ingreso? Esta acción no se puede deshacer.',
      () => {
        try {
          IngresoModel.delete(id);
          this.render();
        } catch (error) {
          Logger.error('Error eliminando ingreso', error);
        }
      }
    );
  },
  
  mostrarMensaje(texto, tipo = 'info') {
    const modal = document.getElementById('modal');
    document.getElementById('modal-body').innerHTML = `<div class="alert alert-${tipo}">${texto}</div>`;
    modal.classList.add('show');
    setTimeout(() => modal.classList.remove('show'), 3000);
  },
  
  // === GESTIÓN DE INGRESOS AUTOMÁTICOS ===
  
  async gestionarAutomaticos() {
    if (typeof IngresoAutomaticoModel === 'undefined') {
      console.error('IngresoAutomaticoModel no está definido. Verifica que js/models/ingresoAutomatico.js se haya cargado correctamente.');
      alert('Error: El modelo de ingresos automáticos no está cargado. Recarga la página (Ctrl+Shift+R).');
      return;
    }
    const reglas = await IngresoAutomaticoModel.getAll();
    // Usar la configuración local del usuario para las categorías/tipos
    let tipos = [];
    try {
      const localConfig = ConfigModel.getLocalConfig();
      tipos = localConfig?.ingresos?.campos?.find(c => c.id === 'tipo')?.opciones || [];
    } catch (e) {
      tipos = ConfigModel.DEFAULT_CONFIG.ingresos.campos.find(c => c.id === 'tipo').opciones;
    }
    
    const modal = document.createElement('div');
    modal.id = 'modal-automaticos';
    modal.className = 'modal-overlay show';
    modal.innerHTML = `
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h3 class="modal-title">⚙️ Ingresos Automáticos</h3>
          <button class="modal-close" onclick="IngresosController.cerrarAutomaticos()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="info-banner" style="margin-bottom: var(--spacing-lg);">
            <div class="info-banner-icon">💡</div>
            <div class="info-banner-text">
              Los ingresos automáticos se generan automáticamente según la frecuencia que definas.
              Por ejemplo: salario mensual, rentas, etc.
            </div>
          </div>
          
          <button class="btn btn-primary" onclick="IngresosController.nuevaReglaAutomatica()" style="margin-bottom: var(--spacing-md);">
            ➕ Nueva Regla Automática
          </button>
          
          ${reglas.length === 0 ? `
            <div class="empty-state">
              <div class="empty-state-icon">⚙️</div>
              <div class="empty-state-title">No hay reglas automáticas</div>
              <div class="empty-state-text">Crea tu primera regla para automatizar ingresos recurrentes</div>
            </div>
          ` : `
            <div class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Monto</th>
                    <th>Tipo</th>
                    <th>Frecuencia</th>
                    <th>Próxima</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  ${reglas.map(regla => `
                    <tr class="${!regla.activo ? 'regla-inactiva' : ''}">
                      <td><strong>${regla.nombre}</strong></td>
                      <td class="text-success">${Calculations.formatearMoneda(regla.monto)}</td>
                      <td><span class="badge badge-success">${regla.tipo}</span></td>
                      <td>${this.getFrecuenciaTexto(regla.frecuencia)}</td>
                      <td>${regla.activo ? IngresoAutomaticoModel.getProximaAplicacion(regla) : '-'}</td>
                      <td>
                        <span class="badge ${regla.activo ? 'badge-success' : 'badge-secondary'}">
                          ${regla.activo ? '✓ Activa' : '⏸ Pausada'}
                        </span>
                      </td>
                      <td>
                        <button class="btn btn-small btn-secondary" onclick="IngresosController.editarReglaAutomatica('${regla.id}')">✏️</button>
                        <button class="btn btn-small ${regla.activo ? 'btn-warning' : 'btn-success'}" 
                                onclick="IngresosController.toggleReglaAutomatica('${regla.id}')">
                          ${regla.activo ? '⏸' : '▶'}
                        </button>
                        <button class="btn btn-small btn-danger" onclick="IngresosController.eliminarReglaAutomatica('${regla.id}')">🗑️</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  },
  
  cerrarAutomaticos() {
    const modal = document.getElementById('modal-automaticos');
    if (modal) modal.remove();
  },
  
  nuevaReglaAutomatica() {
    // Usar la configuración local del usuario para las categorías/tipos
    let tipos = [];
    try {
      const localConfig = ConfigModel.getLocalConfig();
      tipos = localConfig?.ingresos?.campos?.find(c => c.id === 'tipo')?.opciones || [];
    } catch (e) {
      tipos = ConfigModel.DEFAULT_CONFIG.ingresos.campos.find(c => c.id === 'tipo').opciones;
    }
    const modal = document.createElement('div');
    modal.id = 'modal-regla';
    modal.className = 'modal-overlay show';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Nueva Regla Automática</h3>
          <button class="modal-close" onclick="IngresosController.cerrarFormularioRegla()">&times;</button>
        </div>
        <div class="modal-body">
          <form id="form-regla-automatica" onsubmit="IngresosController.guardarReglaAutomatica(event)">
            <input type="hidden" id="regla-id">
            
            <div class="form-group">
              <label class="form-label">Nombre *</label>
              <input type="text" id="regla-nombre" class="form-input" required placeholder="Ej: Salario mensual">
            </div>
            
            <div class="form-group">
              <label class="form-label">Monto (€) *</label>
              <input type="number" id="regla-monto" class="form-input" step="0.01" min="0.01" required>
            </div>
            
            <div class="form-group">
              <label class="form-label">Tipo *</label>
              <select id="regla-tipo" class="form-select" required>
                ${tipos.map(t => `<option value="${t.valor}">${t.etiqueta}</option>`).join('')}
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Frecuencia *</label>
              <select id="regla-frecuencia" class="form-select" required onchange="IngresosController.cambiarFrecuencia()">
                <option value="diaria">Diaria</option>
                <option value="semanal">Semanal</option>
                <option value="mensual" selected>Mensual</option>
                <option value="anual">Anual</option>
              </select>
            </div>
            
            <div class="form-group" id="grupo-dia-aplicacion">
              <label class="form-label" id="label-dia-aplicacion">Día del mes (1-31) *</label>
              <input type="number" id="regla-dia" class="form-input" min="1" max="31" value="1" required>
              <small class="form-help" id="help-dia-aplicacion">Día del mes en que se aplicará el ingreso</small>
            </div>
            
            <div class="form-group">
              <label class="form-label">Fecha inicio *</label>
              <input type="date" id="regla-fecha-inicio" class="form-input" required value="${new Date().toISOString().split('T')[0]}">
            </div>
            
            <div class="form-group">
              <label class="form-label">Fecha fin (opcional)</label>
              <input type="date" id="regla-fecha-fin" class="form-input">
              <small class="form-help">Deja en blanco para que no expire</small>
            </div>
            
            <div class="form-group">
              <label class="form-label">Descripción</label>
              <textarea id="regla-descripcion" class="form-input" rows="2"></textarea>
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" onclick="IngresosController.cerrarFormularioRegla()">Cancelar</button>
              <button type="submit" class="btn btn-primary">Guardar Regla</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  },
  
  cambiarFrecuencia() {
    const frecuencia = document.getElementById('regla-frecuencia').value;
    const label = document.getElementById('label-dia-aplicacion');
    const input = document.getElementById('regla-dia');
    const help = document.getElementById('help-dia-aplicacion');
    
    switch(frecuencia) {
      case 'diaria':
        document.getElementById('grupo-dia-aplicacion').style.display = 'none';
        break;
      case 'semanal':
        document.getElementById('grupo-dia-aplicacion').style.display = 'block';
        label.textContent = 'Día de la semana *';
        input.min = 0;
        input.max = 6;
        input.value = 1;
        help.textContent = '0=Domingo, 1=Lunes, 2=Martes... 6=Sábado';
        break;
      case 'mensual':
        document.getElementById('grupo-dia-aplicacion').style.display = 'block';
        label.textContent = 'Día del mes (1-31) *';
        input.min = 1;
        input.max = 31;
        input.value = 1;
        help.textContent = 'Día del mes en que se aplicará el ingreso';
        break;
      case 'anual':
        document.getElementById('grupo-dia-aplicacion').style.display = 'block';
        label.textContent = 'Fecha (MMDD) *';
        input.min = 101;
        input.max = 1231;
        input.value = 101;
        help.textContent = 'Formato: MMDD. Ej: 1225 para 25 de diciembre';
        break;
    }
  },
  
  async guardarReglaAutomatica(event) {
    event.preventDefault();
    
    const id = document.getElementById('regla-id').value;
    const data = {
      nombre: document.getElementById('regla-nombre').value,
      monto: parseFloat(document.getElementById('regla-monto').value),
      tipo: document.getElementById('regla-tipo').value,
      frecuencia: document.getElementById('regla-frecuencia').value,
      diaAplicacion: parseInt(document.getElementById('regla-dia').value) || 1,
      fechaInicio: document.getElementById('regla-fecha-inicio').value,
      fechaFin: document.getElementById('regla-fecha-fin').value || null,
      descripcion: document.getElementById('regla-descripcion').value
    };
    
    try {
      if (id) {
        await IngresoAutomaticoModel.update(id, data);
      } else {
        await IngresoAutomaticoModel.create(data);
      }
      this.cerrarFormularioRegla();
      this.cerrarAutomaticos();
      await this.gestionarAutomaticos();
    } catch (error) {
      alert(error.message);
    }
  },
  
  async editarReglaAutomatica(id) {
    const regla = await IngresoAutomaticoModel.getById(id);
    if (!regla) return;
    
    this.nuevaReglaAutomatica();
    
    setTimeout(() => {
      document.getElementById('regla-id').value = regla.id;
      document.getElementById('regla-nombre').value = regla.nombre;
      document.getElementById('regla-monto').value = regla.monto;
      document.getElementById('regla-tipo').value = regla.tipo;
      document.getElementById('regla-frecuencia').value = regla.frecuencia;
      document.getElementById('regla-dia').value = regla.diaAplicacion;
      document.getElementById('regla-fecha-inicio').value = regla.fechaInicio;
      document.getElementById('regla-fecha-fin').value = regla.fechaFin || '';
      document.getElementById('regla-descripcion').value = regla.descripcion || '';
      document.querySelector('#modal-regla .modal-title').textContent = 'Editar Regla Automática';
      this.cambiarFrecuencia();
    }, 100);
  },
  
  async toggleReglaAutomatica(id) {
    const regla = await IngresoAutomaticoModel.getById(id);
    if (!regla) return;
    
    await IngresoAutomaticoModel.update(id, { ...regla, activo: !regla.activo });
    this.cerrarAutomaticos();
    await this.gestionarAutomaticos();
  },
  
  eliminarReglaAutomatica(id) {
    showConfirmModal(
      '¿Estás seguro de eliminar esta regla automática? No afectará a los ingresos ya generados.',
      async () => {
        await IngresoAutomaticoModel.delete(id);
        this.cerrarAutomaticos();
        await this.gestionarAutomaticos();
      }
    );
  },
  
  cerrarFormularioRegla() {
    const modal = document.getElementById('modal-regla');
    if (modal) modal.remove();
  },
  
  getFrecuenciaTexto(frecuencia) {
    const textos = {
      diaria: '📅 Diaria',
      semanal: '📆 Semanal',
      mensual: '🗓️ Mensual',
      anual: '📅 Anual'
    };
    return textos[frecuencia] || frecuencia;
  }
};

window.IngresosController = IngresosController;
