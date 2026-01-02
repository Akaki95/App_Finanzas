// Vista para Grupos de Gastos
const GrupoGastoView = {
  renderLista() {
    const grupos = GrupoGastoModel.getAll().sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
    // Obtener categorías dinámicas
    const configActual = ConfigModel.getModuleConfig && ConfigModel.getModuleConfig('gastos');
    const categorias = configActual && configActual.campos
      ? (configActual.campos.find(c => c.id === 'categoria')?.opciones || [])
      : [];
    let html = `<div class="container">
      <div class="section-header">
        <h2 class="section-title">Grupos de Gastos</h2>
        <div class="section-header-actions">
          <button class="btn btn-primary" onclick="GrupoGastoView.renderFormNuevo()">➕ Nuevo Grupo de Gasto</button>
        </div>
      </div>
      <div class="card">
        <div class="card-title">Listado de Grupos</div>
        ${grupos.length === 0 ? `<div class="empty-state"><div class="empty-state-icon">📦</div><div class="empty-state-title">No hay grupos de gastos aún</div></div>` : `
          <ul class="items-list">
            ${grupos.map(grupo => {
              const catObj = categorias.find(opt => opt.valor === grupo.categoria);
              const icono = catObj ? catObj.icono : '📦';
              const etiqueta = catObj ? catObj.etiqueta : grupo.categoria;
              return `<li class="item">
                <div class="item-main">
                  <div class="item-content">
                    <div class="item-title">${grupo.nombre}</div>
                    <div class="item-subtitle">
                      Categoría: <span class="categoria-label">${etiqueta}</span> | Estado: <span class="estado ${grupo.estado}">${grupo.estado}</span>
                    </div>
                  </div>
                  <div class="item-amount">${grupo.total.toFixed(2)} €</div>
                  <div class="item-actions">
                    <button class="btn btn-secondary btn-small${grupo.estado === 'cerrado' ? ' btn-disabled' : ''}" title="Liberar grupo" onclick="GrupoGastoView.liberarGrupo('${grupo.id}')" ${grupo.estado === 'cerrado' ? 'disabled aria-disabled="true" tabindex="-1"' : ''}>💸 Liberar</button>
                      <button class="btn-icon-delete" title="Ver grupo" onclick="GrupoGastoView.entrarEnGrupo('${grupo.id}')">✏️</button>
                    <button class="btn-icon-delete" title="Eliminar grupo" onclick="GrupoGastoView.eliminarGrupo('${grupo.id}', '${grupo.nombre}')">🗑️</button>
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

    eliminarGrupo(id, nombre) {
      // Usar el modal de confirmación global
      window.showConfirmModal(
        `¿Seguro que quieres eliminar el grupo "${nombre}"? Esta acción no se puede deshacer.`,
        () => GrupoGastoView.confirmarEliminarGrupo(id),
        null,
        'Eliminar'
      );
    },

    confirmarEliminarGrupo(id) {
    GrupoGastoModel.eliminar(id);
    closeModal();
    this.renderLista();
  },

  submitNuevo(e) {
    e.preventDefault();
    const form = e.target;
    GrupoGastoModel.create({
      nombre: form.nombre.value,
      fechaCreacion: form.fechaCreacion.value,
      categoria: form.categoria.value,
      descripcion: form.descripcion.value
    });
    closeModal();
    GrupoGastoView.renderLista();
  },

  renderDetalle(id) {
    const grupo = GrupoGastoModel.getById(id);
    const cat = ConfigModel.DEFAULT_CONFIG.gastos.campos.find(c => c.id === 'categoria');
    const catObj = cat && cat.opciones.find(opt => opt.valor === grupo.categoria);
    const icono = catObj ? catObj.icono : '📦';
    const etiqueta = catObj ? catObj.etiqueta : grupo.categoria;
    let html = `<div class="container">
      <div class="section-header">
        <h2 class="section-title">${icono} ${grupo.nombre} </h2>
        <div class="section-header-actions">
          <button class="btn btn-secondary" onclick="GrupoGastoView.renderLista()">← Volver a grupos</button>
          ${grupo.estado === 'abierto' ? `<button class="btn btn-primary" onclick="GrupoGastoView.mostrarModalMovimiento('${grupo.id}')">➕ Añadir Gasto</button>` : ''}
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
                      <td class="text-danger">${parseFloat(m.monto).toFixed(2)} €</td>
                      <td>
                        <button class="btn btn-small btn-secondary" onclick="GrupoGastoView.mostrarModalEditarMovimiento('${grupo.id}', ${idx})" ${grupo.estado !== 'abierto' ? 'disabled' : ''}>Editar</button>
                        <button class="btn btn-small btn-danger" onclick="GrupoGastoView.eliminarMovimiento('${grupo.id}', ${idx})" ${grupo.estado !== 'abierto' ? 'disabled' : ''}>Eliminar</button>
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
                    <div class="mobile-item-amount text-danger">${parseFloat(m.monto).toFixed(2)} €</div>
                  </div>
                  <div class="mobile-item-details">
                    <div style=\"margin-bottom: var(--spacing-sm);">
                      <strong>Descripción:</strong> ${m.descripcion || '-'}
                    </div>
                    <div style=\"display: flex; gap: var(--spacing-sm);">
                      <button class=\"btn btn-small btn-secondary\" onclick=\"event.stopPropagation(); GrupoGastoView.mostrarModalEditarMovimiento('${grupo.id}', ${idx})\" ${grupo.estado !== 'abierto' ? 'disabled' : ''}>Editar</button>
                      <button class=\"btn btn-small btn-danger\" onclick=\"event.stopPropagation(); GrupoGastoView.eliminarMovimiento('${grupo.id}', ${idx})\" ${grupo.estado !== 'abierto' ? 'disabled' : ''}>Eliminar</button>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
        ${grupo.estado !== 'abierto' ? `
          <p><strong>Grupo cerrado.</strong> Fecha de cierre: ${grupo.fechaCierre || ''}</p>
          <p style="color:gray;">No se pueden añadir ni editar movimientos en un grupo cerrado.</p>
        ` : ''}
      </div>
    </div>`;
    document.getElementById('main-content').innerHTML = html;
    
  },

  mostrarModalMovimiento(grupoId) {
      // Modal sencillo para añadir movimiento
      const html = `
        <div class="modal-header">
          <h3 class="modal-title">Añadir Gasto al Grupo</h3>
        </div>
        <div class="modal-body">
          <form id="form-movimiento-grupo" onsubmit="GrupoGastoView.submitMovimiento(event, '${grupoId}')" class="form form-modal">
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

    entrarEnGrupo(id) {
    // Navega a la subpágina interna mostrando el detalle en el área principal
    this.renderDetalle(id);
    },
    
    submitMovimiento(e, grupoId) {
    e.preventDefault();
    const form = e.target;
    GrupoGastoModel.addMovimiento(grupoId, {
      fecha: form.fecha.value,
      monto: parseFloat(form.monto.value),
      descripcion: form.descripcion.value
    });
    closeModal();
    GrupoGastoView.renderDetalle(grupoId);
  },

  cerrarGrupo(grupoId) {
    GrupoGastoModel.cerrarGrupo(grupoId);
    closeModal();
    GrupoGastoView.renderDetalle(grupoId);
  },

  liberarGrupo(id) {
    GrupoGastoModel.cerrarGrupo(id);
    this.renderLista();
  },

      renderFormNuevo() {
      // Obtener categorías dinámicas de la configuración actual
      const configActual = ConfigModel.getModuleConfig && ConfigModel.getModuleConfig('gastos');
      const categorias = configActual && configActual.campos
        ? (configActual.campos.find(c => c.id === 'categoria')?.opciones || [])
        : [];
      let html = `
        <div class="modal-header">
          <h3 class="modal-title">Nuevo Grupo de Gasto</h3>
        </div>
        <div class="modal-body">
          <form id="form-nuevo-grupo-gasto" onsubmit="GrupoGastoView.submitNuevo(event)" class="form form-modal">
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
              <label class="form-label" for="grupo-categoria">Categoría *</label>
              <select id="grupo-categoria" name="categoria" class="form-select" required>
                <option value="" disabled selected>Selecciona una opción</option>
                ${categorias.map(cat => `<option value="${cat.valor}">${cat.etiqueta || cat.valor}</option>`).join('')}
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

     mostrarModalEditarMovimiento(grupoId, idx) {
    const grupo = GrupoGastoModel.getById(grupoId);
    const movimiento = grupo.movimientos[idx];
    const html = `
      <div class="modal-header">
        <h3 class="modal-title">Editar Movimiento</h3>
      </div>
      <div class="modal-body">
        <form id="form-editar-movimiento-grupo" onsubmit="GrupoGastoView.submitEditarMovimiento(event, '${grupoId}', ${idx})" class="form form-modal">
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
    GrupoGastoModel.editarMovimiento(grupoId, idx, {
      fecha: form.fecha.value,
      monto: parseFloat(form.monto.value),
      descripcion: form.descripcion.value
    });
    closeModal();
    GrupoGastoView.renderDetalle(grupoId);
  },

  eliminarMovimiento(grupoId, idx) {
    window.showConfirmModal(
      '¿Seguro que quieres eliminar este movimiento?',
      () => {
        GrupoGastoModel.eliminarMovimiento(grupoId, idx);
        closeModal();
        GrupoGastoView.renderDetalle(grupoId);
      },
      null,
      'Eliminar'
    );
  },

};

// Registrar GrupoGastoView en window para disponibilidad global
window.GrupoGastoView = GrupoGastoView;
