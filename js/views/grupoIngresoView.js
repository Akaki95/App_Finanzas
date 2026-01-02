// Vista para Grupos de Ingresos
const GrupoIngresoView = {
  renderLista() {
    const grupos = GrupoIngresoModel.getAll().sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
    // Obtener tipos/categorías dinámicos para mostrar icono/etiqueta
    const configActual = ConfigModel.getModuleConfig && ConfigModel.getModuleConfig('ingresos');
    const tipos = configActual && configActual.campos
      ? (configActual.campos.find(c => c.id === 'tipo')?.opciones || [])
      : [];
    let html = `<div class="container">
      <div class="section-header">
        <h2 class="section-title">Grupos de Ingresos</h2>
        <div class="section-header-actions">
          <button class="btn btn-primary" onclick="GrupoIngresoView.renderFormNuevo()">➕ Nuevo Grupo de Ingreso</button>
        </div>
      </div>
      <div class="card">
        <div class="card-title">Listado de Grupos</div>
        ${grupos.length === 0 ? `<div class="empty-state"><div class="empty-state-icon">📦</div><div class="empty-state-title">No hay grupos de ingresos aún</div></div>` : `
          <ul class="items-list">
            ${grupos.map(grupo => {
              const tipoObj = tipos.find(opt => opt.valor === grupo.categoria);
              const icono = tipoObj ? tipoObj.icono : '📦';
              const etiqueta = tipoObj ? tipoObj.etiqueta : grupo.categoria;
              const liberado = grupo.estado === 'cerrado';
              return `<li class="item">
                <div class="item-main">
                  <div class="item-content">
                    <div class="item-title">${grupo.nombre}</div>
                    <div class="item-subtitle">
                      Tipo: <span class="categoria-label">${etiqueta}</span> ${icono} | Estado: <span class="estado ${grupo.estado}">${grupo.estado}</span>
                    </div>
                  </div>
                  <div class="item-amount">${grupo.total.toFixed(2)} €</div>
                  <div class="item-actions">
                    <button class="btn btn-secondary btn-small" title="Liberar grupo" onclick="GrupoIngresoView.liberarGrupo('${grupo.id}')" ${liberado ? 'disabled' : ''}>💸 Liberar</button>
                    <button class="btn-icon-delete" title="Editar grupo" onclick="GrupoIngresoView.renderDetalle('${grupo.id}')">✏️</button>
                    <button class="btn-icon-delete" title="Eliminar grupo" onclick="GrupoIngresoView.eliminarGrupo('${grupo.id}')">🗑️</button>
                  </div>
                </div>
              </li>`;
            }).join('')}
          </ul>
        `}
      </div>
    </div>`;
    document.getElementById('main-content').innerHTML = html;
  },

  eliminarGrupo(id) {
    const grupo = GrupoIngresoModel.getById(id);
    window.showConfirmModal(
      `¿Seguro que quieres eliminar el grupo <b>"${grupo?.nombre || ''}"</b>? Esta acción no se puede deshacer.`,
      () => {
        GrupoIngresoModel.eliminar(id);
        this.renderLista();
      },
      null,
      'Eliminar'
    );
  },

  liberarGrupo(id) {
    const grupo = GrupoIngresoModel.getById(id);
    if (grupo.estado === 'cerrado') return;
    GrupoIngresoModel.cerrarGrupo(id);
    this.renderLista();
  },

  renderFormNuevo() {
    // Obtener tipos/categorías dinámicos de la configuración actual
    const configActual = ConfigModel.getModuleConfig && ConfigModel.getModuleConfig('ingresos');
    const tipos = configActual && configActual.campos
      ? (configActual.campos.find(c => c.id === 'tipo')?.opciones || [])
      : [];
    let html = `
      <div class="modal-header">
        <h3 class="modal-title">Nuevo Grupo de Ingreso</h3>
      </div>
      <div class="modal-body">
        <form id="form-nuevo-grupo-ingreso" onsubmit="GrupoIngresoView.submitNuevo(event)" class="form form-modal">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="grupo-nombre">Nombre *</label>
              <input id="grupo-nombre" name="nombre" type="text" class="form-input" required placeholder="Nombre del grupo" autocomplete="off">
            </div>
            <div class="form-group">
              <label class="form-label" for="grupo-fecha">Fecha de creación *</label>
              <input id="grupo-fecha" name="fechaCreacion" type="date" class="form-input" required>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="grupo-tipo">Tipo *</label>
            <select id="grupo-tipo" name="categoria" class="form-select" required>
              <option value="" disabled selected>Selecciona una opción</option>
              ${tipos.map(tipo => `<option value="${tipo.valor}">${tipo.etiqueta}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="grupo-descripcion">Descripción</label>
            <textarea id="grupo-descripcion" name="descripcion" class="form-textarea" rows="3" placeholder="Descripción del grupo"></textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
            <button type="submit" class="btn btn-primary">Crear</button>
          </div>
        </form>
      </div>
    `;
    document.getElementById('modal-body').innerHTML = html;
    document.getElementById('modal').classList.add('show');
  },

  submitNuevo(e) {
    e.preventDefault();
    const form = e.target;
    GrupoIngresoModel.create({
      nombre: form.nombre.value,
      fechaCreacion: form.fechaCreacion.value,
      categoria: form.categoria.value,
      descripcion: form.descripcion.value
    });
    closeModal();
    GrupoIngresoView.renderLista();
  },

  renderDetalle(id) {
    const grupo = GrupoIngresoModel.getById(id);
    // Obtener tipo/categoría para badge
    const configActual = ConfigModel.getModuleConfig && ConfigModel.getModuleConfig('ingresos');
    const tipos = configActual && configActual.campos ? (configActual.campos.find(c => c.id === 'tipo')?.opciones || []) : [];
    const tipoObj = tipos.find(opt => opt.valor === grupo.categoria);
    const icono = tipoObj ? tipoObj.icono : '💰';
    const etiqueta = tipoObj ? tipoObj.etiqueta : grupo.categoria;
    let html = `<div class="container">
      <div class="section-header">
        <h2 class="section-title">${icono} ${grupo.nombre}</h2>
        <div class="section-header-actions">
          <button class="btn btn-secondary" onclick="GrupoIngresoView.renderLista()">← Volver a grupos</button>
          ${grupo.estado === 'abierto' ? `<button class="btn btn-primary" onclick="GrupoIngresoView.mostrarModalMovimiento('${grupo.id}')">➕ Añadir Ingreso</button>` : ''}
        </div>
      </div>
      <!-- Información del Grupo -->
      <div class="grupo-info-cards">
        <div class="grupo-info-card info-descripcion-card">
          <div class="info-card-icon">📝</div>
          <div class="info-card-content">
            <div class="info-card-label">Descripción</div>
            <div class="info-card-value">${grupo.descripcion || 'Sin descripción'}</div>
          </div>
        </div>
        
        <div class="grupo-info-card info-estado-card ${grupo.estado === 'cerrado' ? 'cerrado' : 'abierto'}">
          <div class="info-card-icon">${grupo.estado === 'cerrado' ? '🔒' : '🔓'}</div>
          <div class="info-card-content">
            <div class="info-card-label">Estado</div>
            <div class="info-card-value">${grupo.estado === 'abierto' ? 'Abierto' : 'Cerrado'}</div>
          </div>
        </div>
        
        <div class="grupo-info-card info-total-card">
          <div class="info-card-icon">💰</div>
          <div class="info-card-content">
            <div class="info-card-label">Total Acumulado</div>
            <div class="info-card-value">${Calculations.formatearMoneda(grupo.total)}</div>
          </div>
        </div>
        
        <div class="grupo-info-card info-count-card">
          <div class="info-card-icon">📊</div>
          <div class="info-card-content">
            <div class="info-card-label">Movimientos</div>
            <div class="info-card-value">${grupo.movimientos.length}</div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-title">Movimientos del Grupo</div>
        <div class="table-container">
          ${grupo.movimientos.length === 0 ? `
            <div class="empty-state">
              <div class="empty-state-icon">📝</div>
              <div class="empty-state-title">Sin movimientos</div>
              <div class="empty-state-text">Agrega tu primer movimiento al grupo</div>
            </div>
          ` : `
            <div class="table-responsive">
              <table class="table">
                <thead class="table-custom-thead">
                  <tr class="table-custom-header-row">
                    <th class="table-custom-th">Fecha</th>
                    <th class="table-custom-th">Descripción</th>
                    <th class="table-custom-th">Monto</th>
                    <th class="table-custom-th">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  ${grupo.movimientos.map((m, idx) => `
                    <tr class="table-custom-row">
                      <td>${new Date(m.fecha).toLocaleDateString('es-ES')}</td>
                      <td>${m.descripcion || '-'}</td>
                      <td class="text-success">${parseFloat(m.monto).toFixed(2)} €</td>
                      <td>
                        <button class="btn btn-small btn-secondary" onclick="GrupoIngresoView.mostrarModalEditarMovimiento('${grupo.id}', ${idx})" ${grupo.estado !== 'abierto' ? 'disabled' : ''}>Editar</button>
                        <button class="btn btn-small btn-danger" onclick="GrupoIngresoView.eliminarMovimiento('${grupo.id}', ${idx})" ${grupo.estado !== 'abierto' ? 'disabled' : ''}>Eliminar</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            <div class="mobile-list">
              ${grupo.movimientos.map((m, idx) => `
                <div class="mobile-list-item" onclick="this.classList.toggle('expanded')">
                  <div class="mobile-item-main">
                    <div class="mobile-item-primary">
                      <div style=\"font-size: 0.85rem; color: var(--text-secondary);\">${new Date(m.fecha).toLocaleDateString('es-ES')}</div>
                    </div>
                    <div class="mobile-item-amount text-success">${parseFloat(m.monto).toFixed(2)} €</div>
                  </div>
                  <div class="mobile-item-details">
                    <div style=\"margin-bottom: var(--spacing-sm);">
                      <strong>Descripción:</strong> ${m.descripcion || '-'
                      }
                    </div>
                    <div style=\"display: flex; gap: var(--spacing-sm);">
                      <button class=\"btn btn-small btn-secondary\" onclick=\"event.stopPropagation(); GrupoIngresoView.mostrarModalEditarMovimiento('${grupo.id}', ${idx})\" ${grupo.estado !== 'abierto' ? 'disabled' : ''}>Editar</button>
                      <button class=\"btn btn-small btn-danger\" onclick=\"event.stopPropagation(); GrupoIngresoView.eliminarMovimiento('${grupo.id}', ${idx})\" ${grupo.estado !== 'abierto' ? 'disabled' : ''}>Eliminar</button>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

          
        ${grupo.estado !== 'abierto' ? `
          <p><strong>Grupo liberado.</strong> Fecha de liberación: ${grupo.fechaCierre || ''}</p>
          <p style="color:gray;">No se pueden añadir ni editar movimientos en un grupo liberado.</p>
        ` : ''}
      </div>
    </div>`;
    document.getElementById('main-content').innerHTML = html;
    
    
  },

  mostrarModalMovimiento(grupoId) {
      // Modal sencillo para añadir movimiento
      const html = `
        <div class="modal-header">
          <h3 class="modal-title">Añadir Ingreso al Grupo</h3>
        </div>
        <div class="modal-body">
          <form id="form-movimiento-grupo" onsubmit="GrupoIngresoView.submitMovimiento(event, '${grupoId}')" class="form form-modal">
            <div class="form-group">
              <label class="form-label">Fecha</label>
              <input name="fecha" type="date" required class="form-input">
            </div>
            <div class="form-group">
              <label class="form-label">Monto</label>
              <input name="monto" type="number" step="0.01" required class="form-input">
            </div>
            <div class="form-group">
              <label class="form-label">Descripción</label>
              <input name="descripcion" class="form-input">
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">Añadir</button>
              <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
            </div>
          </form>
        </div>
      `;
      document.getElementById('modal-body').innerHTML = html;
      document.getElementById('modal').classList.add('show');
    },

  submitMovimiento(e, grupoId) {
    e.preventDefault();
    const form = e.target;
    GrupoIngresoModel.addMovimiento(grupoId, {
      fecha: form.fecha.value,
      monto: parseFloat(form.monto.value),
      descripcion: form.descripcion.value
    });
    closeModal();
    GrupoIngresoView.renderDetalle(grupoId);
  },

  cerrarGrupo(grupoId) {
    GrupoIngresoModel.cerrarGrupo(grupoId);
    GrupoIngresoView.renderDetalle(grupoId);
  },

  mostrarModalEditarMovimiento(grupoId, idx) {
    const grupo = GrupoIngresoModel.getById(grupoId);
    const movimiento = grupo.movimientos[idx];
    const html = `
      <div class="modal-header">
        <h3 class="modal-title">Editar Movimiento</h3>
      </div>
      <div class="modal-body">
        <form id="form-editar-movimiento-grupo" onsubmit="GrupoIngresoView.submitEditarMovimiento(event, '${grupoId}', ${idx})" class="form form-modal">
          <div class="form-group">
            <label class="form-label">Fecha</label>
            <input name="fecha" type="date" required class="form-input" value="${new Date(movimiento.fecha).toISOString().split('T')[0]}">
          </div>
          <div class="form-group">
            <label class="form-label">Monto</label>
            <input name="monto" type="number" step="0.01" required class="form-input" value="${movimiento.monto}">
          </div>
          <div class="form-group">
            <label class="form-label">Descripción</label>
            <input name="descripcion" class="form-input" value="${movimiento.descripcion || ''}">
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Guardar</button>
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
          </div>
        </form>
      </div>
    `;
    document.getElementById('modal-body').innerHTML = html;
    document.getElementById('modal').classList.add('show');
  },

  submitEditarMovimiento(e, grupoId, idx) {
    e.preventDefault();
    const form = e.target;
    GrupoIngresoModel.editarMovimiento(grupoId, idx, {
      fecha: form.fecha.value,
      monto: parseFloat(form.monto.value),
      descripcion: form.descripcion.value
    });
    closeModal();
    GrupoIngresoView.renderDetalle(grupoId);
  },

  eliminarMovimiento(grupoId, idx) {
    window.showConfirmModal(
      '¿Seguro que quieres eliminar este movimiento?',
      () => {
        GrupoIngresoModel.eliminarMovimiento(grupoId, idx);
        closeModal();
        GrupoIngresoView.renderDetalle(grupoId);
      },
      null,
      'Eliminar'
    );
  },
};

window.GrupoIngresoView = GrupoIngresoView;
