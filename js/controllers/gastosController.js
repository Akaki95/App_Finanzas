// Controlador de Gastos
const GastosController = {
  
  // Renderizar vista de gastos
  render() {
    const mainContent = document.getElementById('main-content');
    const gastos = GastoModel.getAll().sort((a, b) => {
      const fechaDiff = new Date(b.fecha) - new Date(a.fecha);
      if (fechaDiff !== 0) return fechaDiff;
      return b.id.localeCompare(a.id); // Si misma fecha, el más reciente (ID mayor) primero
    });
    const categorias = GastoModel.getCategorias();
    
    mainContent.innerHTML = `
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Gestión de Gastos</h2>
          <div class="section-header-actions">
            <button class="btn btn-secondary" onclick="GastosController.gestionarAutomaticos()">
              ⚙️ Gastos Automáticos
            </button>
            <button class="btn btn-primary" onclick="GastosController.mostrarFormulario()">
              ➕ Nuevo Gasto
            </button>
          </div>
        </div>
        
        <!-- Modal de formulario -->
        <div id="modal-gasto" class="modal-overlay">
          <div class="modal-content">
            <div class="modal-header">
              <h3 class="modal-title" id="form-gasto-title">Nuevo Gasto</h3>
              <button class="modal-close" onclick="GastosController.cancelar()">&times;</button>
            </div>
            <div class="modal-body">
              <form id="gasto-form" onsubmit="GastosController.guardar(event)">
                <input type="hidden" id="gasto-id">
                ${FormBuilder.renderInRows('gastos', 'gasto-form')}
                <div class="form-error" id="gasto-errors"></div>
                <div class="form-actions">
                  <button type="button" class="btn btn-secondary" 
                          onclick="GastosController.cancelar()">Cancelar</button>
                  <button type="submit" class="btn btn-primary">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <!-- Lista de gastos -->
        <div class="card">
          <div class="card-title">Listado de Gastos</div>
          <div class="table-container">
            ${gastos.length === 0 ? `
              <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <div class="empty-state-title">No hay gastos registrados</div>
                <div class="empty-state-text">Comienza agregando tu primer gasto</div>
              </div>
            ` : `
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Descripción</th>
                      <th>Categoría</th>
                      <th>Monto</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${gastos.map(gasto => `
                      <tr>
                        <td>${new Date(gasto.fecha).toLocaleDateString('es-ES')}</td>
                        <td>${gasto.descripcion || '-'}${gasto.origenGrupo ? ' <span class="grupo-origen">(de grupo)</span>' : ''}</td>
                        <td><span class="category-chip category-${gasto.categoria.toLowerCase()}">${gasto.categoria}</span></td>
                        <td class="text-danger">${Calculations.formatearMoneda(gasto.monto)}</td>
                        <td>
                          <button class="btn btn-small btn-secondary" 
                                  onclick="GastosController.editar('${gasto.id}')">Editar</button>
                          <button class="btn btn-small btn-danger" 
                                  onclick="GastosController.eliminar('${gasto.id}')">Eliminar</button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
              <div class="mobile-list">
                ${gastos.map(gasto => `
                  <div class="mobile-list-item" onclick="this.classList.toggle('expanded')">
                    <div class="mobile-item-main">
                      <div class="mobile-item-primary">
                        <div style="font-size: 0.85rem; color: var(--text-secondary);">${new Date(gasto.fecha).toLocaleDateString('es-ES')}</div>
                        <div style="margin: 4px 0;">
                          <span class="category-chip category-${gasto.categoria.toLowerCase()}">${gasto.categoria}</span>
                        </div>
                      </div>
                      <div class="mobile-item-amount text-danger">${Calculations.formatearMoneda(gasto.monto)}</div>
                    </div>
                    <div class="mobile-item-details">
                      <div style="margin-bottom: var(--spacing-sm);">
                        <strong>Descripción:</strong> ${gasto.descripcion || '-'}${gasto.origenGrupo ? ' <span class=\"grupo-origen\">(de grupo)</span>' : ''}
                      </div>
                      <div style="display: flex; gap: var(--spacing-sm);">
                        <button class="btn btn-small btn-secondary" 
                                onclick="event.stopPropagation(); GastosController.editar('${gasto.id}')">Editar</button>
                        <button class="btn btn-small btn-danger" 
                                onclick="event.stopPropagation(); GastosController.eliminar('${gasto.id}')">Eliminar</button>
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
  
  // Mostrar formulario
  mostrarFormulario() {
    document.getElementById('modal-gasto').classList.add('show');
    document.getElementById('gasto-id').value = '';
    document.getElementById('form-gasto-title').textContent = 'Nuevo Gasto';
    FormBuilder.clearForm('gastos');
    ValidationService.limpiarErrores('gasto-errors');
  },
  
  // Cancelar formulario
  cancelar() {
    document.getElementById('modal-gasto').classList.remove('show');
    FormBuilder.clearForm('gastos');
    ValidationService.limpiarErrores('gasto-errors');
  },
  
  // Guardar gasto (crear o actualizar)
  guardar(event) {
    event.preventDefault();
    
    // Validar formulario dinámico
    const validation = FormBuilder.validateForm('gastos');
    if (!validation.valid) {
      ValidationService.mostrarErrores(validation.errors, 'gasto-errors');
      return;
    }
    
    const id = document.getElementById('gasto-id').value;
    const gastoData = FormBuilder.extractFormData('gastos');
    
    try {
      if (id) {
        GastoModel.update(id, gastoData);
      } else {
        GastoModel.create(gastoData);
      }
      
      this.cancelar();
      this.render();
    } catch (error) {
      Logger.error('Error guardando gasto', error);
      ValidationService.mostrarErrores([error.message], 'gasto-errors');
    }
  },
  
  // Editar gasto
  editar(id) {
    const gasto = GastoModel.getById(id);
    if (!gasto) {
      this.mostrarMensaje('Gasto no encontrado', 'danger');
      return;
    }
    
    document.getElementById('modal-gasto').classList.add('show');
    document.getElementById('form-gasto-title').textContent = 'Editar Gasto';
    document.getElementById('gasto-id').value = gasto.id;
    FormBuilder.fillForm('gastos', gasto);
    ValidationService.limpiarErrores('gasto-errors');
  },
  
  // Eliminar gasto
  eliminar(id) {
    showConfirmModal(
      '¿Estás seguro de eliminar este gasto? Esta acción no se puede deshacer.',
      () => {
        try {
          GastoModel.delete(id);
          this.render();
        } catch (error) {
          Logger.error('Error eliminando gasto', error);
        }
      }
    );
  },
  
  // Mostrar mensaje
  mostrarMensaje(texto, tipo = 'info') {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `<div class="alert alert-${tipo}">${texto}</div>`;
    modal.classList.add('show');
    
    setTimeout(() => modal.classList.remove('show'), 3000);
  },
  
  // === GESTIÓN DE GASTOS AUTOMÁTICOS ===
  
  async gestionarAutomaticos() {
    const reglas = await GastoAutomaticoModel.getAll();
    const config = ConfigModel.getLocalConfig();
    const categorias = config.gastos.campos.find(c => c.id === 'categoria').opciones;
    
    const modal = document.createElement('div');
    modal.id = 'modal-automaticos';
    modal.className = 'modal-overlay show';
    modal.innerHTML = `
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h3 class="modal-title">⚙️ Gastos Automáticos</h3>
          <button class="modal-close" onclick="GastosController.cerrarAutomaticos()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="info-banner" style="margin-bottom: var(--spacing-lg);">
            <div class="info-banner-icon">💡</div>
            <div class="info-banner-text">
              Los gastos automáticos se generan automáticamente según la frecuencia que definas.
              Por ejemplo: alquiler mensual, suscripciones, etc.
            </div>
          </div>
          
          <button class="btn btn-primary" onclick="GastosController.nuevaReglaAutomatica()" style="margin-bottom: var(--spacing-md);">
            ➕ Nueva Regla Automática
          </button>
          
          ${reglas.length === 0 ? `
            <div class="empty-state">
              <div class="empty-state-icon">⚙️</div>
              <div class="empty-state-title">No hay reglas automáticas</div>
              <div class="empty-state-text">Crea tu primera regla para automatizar gastos recurrentes</div>
            </div>
          ` : `
            <div class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Monto</th>
                    <th>Categoría</th>
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
                      <td class="text-danger">${Calculations.formatearMoneda(regla.monto)}</td>
                      <td><span class="category-chip">${regla.categoria}</span></td>
                      <td>${this.getFrecuenciaTexto(regla.frecuencia)}</td>
                      <td>${regla.activo ? GastoAutomaticoModel.getProximaAplicacion(regla) : '-'}</td>
                      <td>
                          <span class="badge badge-auto">
                            ${regla.activo ? '🤖 Automático' : '⏸ Pausada'}
                          </span>
                      </td>
                      <td>
                        <button class="btn btn-small btn-secondary" onclick="GastosController.editarReglaAutomatica('${regla.id}')">✏️</button>
                        <button class="btn btn-small ${regla.activo ? 'btn-warning' : 'btn-success'}" 
                                onclick="GastosController.toggleReglaAutomatica('${regla.id}')">
                          ${regla.activo ? '⏸' : '▶'}
                        </button>
                        <button class="btn btn-small btn-danger" onclick="GastosController.eliminarReglaAutomatica('${regla.id}')">🗑️</button>
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
    const config = ConfigModel.getLocalConfig();
    const categorias = config.gastos.campos.find(c => c.id === 'categoria').opciones;
    const modal = document.createElement('div');
    modal.id = 'modal-regla';
    modal.className = 'modal-overlay show';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Nueva Regla Automática</h3>
          <button class="modal-close" onclick="GastosController.cerrarFormularioRegla()">&times;</button>
        </div>
        <div class="modal-body">
          <form id="form-regla-automatica" onsubmit="GastosController.guardarReglaAutomatica(event)">
            <input type="hidden" id="regla-id">
            
            <div class="form-group">
              <label class="form-label">Nombre *</label>
              <input type="text" id="regla-nombre" class="form-input" required placeholder="Ej: Alquiler mensual">
            </div>
            
            <div class="form-group">
              <label class="form-label">Monto (€) *</label>
              <input type="number" id="regla-monto" class="form-input" step="0.01" min="0.01" required>
            </div>
            
            <div class="form-group">
              <label class="form-label">Categoría *</label>
              <select id="regla-categoria" class="form-select" required>
                ${categorias.map(c => `<option value="${c.valor}">${c.etiqueta}</option>`).join('')}
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Frecuencia *</label>
              <select id="regla-frecuencia" class="form-select" required onchange="GastosController.cambiarFrecuencia()">
                <option value="diaria">Diaria</option>
                <option value="semanal">Semanal</option>
                <option value="mensual" selected>Mensual</option>
                <option value="anual">Anual</option>
              </select>
            </div>
            
            <div class="form-group" id="grupo-dia-aplicacion">
              <label class="form-label" id="label-dia-aplicacion">Día del mes (1-31) *</label>
              <input type="number" id="regla-dia" class="form-input" min="1" max="31" value="1" required>
              <small class="form-help" id="help-dia-aplicacion">Día del mes en que se aplicará el gasto</small>
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
              <button type="button" class="btn btn-secondary" onclick="GastosController.cerrarFormularioRegla()">Cancelar</button>
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
        help.textContent = 'Día del mes en que se aplicará el gasto';
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
      categoria: document.getElementById('regla-categoria').value,
      frecuencia: document.getElementById('regla-frecuencia').value,
      diaAplicacion: parseInt(document.getElementById('regla-dia').value) || 1,
      fechaInicio: document.getElementById('regla-fecha-inicio').value,
      fechaFin: document.getElementById('regla-fecha-fin').value || null,
      descripcion: document.getElementById('regla-descripcion').value
    };
    
    try {
      if (id) {
        await GastoAutomaticoModel.update(id, data);
      } else {
        await GastoAutomaticoModel.create(data);
      }
      this.cerrarFormularioRegla();
      this.cerrarAutomaticos();
      await this.gestionarAutomaticos();
    } catch (error) {
      alert(error.message);
    }
  },
  
  async editarReglaAutomatica(id) {
    const regla = await GastoAutomaticoModel.getById(id);
    if (!regla) return;
    
    this.nuevaReglaAutomatica();
    
    setTimeout(() => {
      document.getElementById('regla-id').value = regla.id;
      document.getElementById('regla-nombre').value = regla.nombre;
      document.getElementById('regla-monto').value = regla.monto;
      document.getElementById('regla-categoria').value = regla.categoria;
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
    const regla = await GastoAutomaticoModel.getById(id);
    if (!regla) return;
    
    await GastoAutomaticoModel.update(id, { ...regla, activo: !regla.activo });
    this.cerrarAutomaticos();
    await this.gestionarAutomaticos();
  },
  
  eliminarReglaAutomatica(id) {
    showConfirmModal(
      '¿Estás seguro de eliminar esta regla automática? No afectará a los gastos ya generados.',
      async () => {
        await GastoAutomaticoModel.delete(id);
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

window.GastosController = GastosController;
Logger.log('GastosController inicializado');
