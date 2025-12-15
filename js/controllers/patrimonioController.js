// Controlador de Patrimonio - Rediseñado para ser intuitivo
const PatrimonioController = {
  
  // Obtener categorías desde configuración
  getCategorias(tipo) {
    const modulo = tipo === 'activos' ? 'patrimonio_activos' : 'patrimonio_pasivos';
    return ConfigModel.getCategorias(modulo);
  },
  
  render() {
    const mainContent = document.getElementById('main-content');
    const activos = PatrimonioModel.getAllActivos();
    const pasivos = PatrimonioModel.getAllPasivos();
    const resumen = PatrimonioModel.getResumen();
    
    console.log('[PatrimonioController] Render con:', {
      activos: activos.length,
      pasivos: pasivos.length,
      activosData: activos,
      pasivosData: pasivos
    });
    
    // Obtener categorías desde configuración
    const categoriasActivos = this.getCategorias('activos');
    const categoriasPasivos = this.getCategorias('pasivos');
    
    console.log('[PatrimonioController] Categorías:', {
      activos: categoriasActivos,
      pasivos: categoriasPasivos
    });
    
    // Agrupar por categoría
    const activosPorCategoria = this.agruparPorCategoria(activos, categoriasActivos);
    const pasivosPorCategoria = this.agruparPorCategoria(pasivos, categoriasPasivos);
    
    console.log('[PatrimonioController] Grupos:', {
      activosPorCategoria,
      pasivosPorCategoria
    });
    
    mainContent.innerHTML = `
      <div class="container">
        <div class="section-header">
          <div>
            <h2 class="section-title">💰 Tu Patrimonio Personal</h2>
            <p class="section-subtitle">Visualiza todo lo que tienes y lo que debes de forma sencilla</p>
          </div>
        </div>
        
        <!-- Banner informativo -->
        <div class="info-banner">
          <div class="info-banner-icon">ℹ️</div>
          <div class="info-banner-text">
            <strong>¿Qué es el patrimonio?</strong> Es la diferencia entre lo que tienes (activos) y lo que debes (pasivos).
            Un patrimonio positivo significa que tienes más de lo que debes.
          </div>
        </div>
        
        <!-- Resumen principal -->
        <div class="patrimonio-resumen-principal">
          <div class="patrimonio-columna">
            <div class="patrimonio-total activos">
              <div class="patrimonio-total-label">Lo que TIENES</div>
              <div class="patrimonio-total-valor">${Calculations.formatearMoneda(resumen.activos)}</div>
              <div class="patrimonio-total-subtitulo">Total Activos</div>
            </div>
          </div>
          
          <div class="patrimonio-separador">
            <div class="patrimonio-operacion">−</div>
          </div>
          
          <div class="patrimonio-columna">
            <div class="patrimonio-total pasivos">
              <div class="patrimonio-total-label">Lo que DEBES</div>
              <div class="patrimonio-total-valor">${Calculations.formatearMoneda(resumen.pasivos)}</div>
              <div class="patrimonio-total-subtitulo">Total Pasivos</div>
            </div>
          </div>
          
          <div class="patrimonio-separador">
            <div class="patrimonio-operacion">=</div>
          </div>
          
          <div class="patrimonio-columna">
            <div class="patrimonio-total neto ${resumen.patrimonioNeto >= 0 ? 'positivo' : 'negativo'}">
              <div class="patrimonio-total-label">Tu PATRIMONIO</div>
              <div class="patrimonio-total-valor">${Calculations.formatearMoneda(resumen.patrimonioNeto)}</div>
              <div class="patrimonio-total-subtitulo">Patrimonio Neto</div>
            </div>
          </div>
        </div>
        
        <!-- Contenido lado a lado -->
        <div class="patrimonio-contenido-doble">
          <!-- ACTIVOS (Izquierda) -->
          <div class="patrimonio-lado activos-lado">
            <div class="patrimonio-lado-header">
              <h3 class="patrimonio-lado-titulo">
                <span class="patrimonio-lado-icono">💰</span>
                ACTIVOS - Lo que Tienes
              </h3>
              <button class="btn btn-primary btn-small" onclick="PatrimonioController.nuevoActivo()">
                ➕ Añadir Activo
              </button>
            </div>
            
            <div class="patrimonio-categorias">
              ${this.renderCategoriasActivos(activosPorCategoria)}
            </div>
            
            ${activos.length === 0 ? `
              <div class="empty-state">
                <div class="empty-state-icon">🏦</div>
                <div class="empty-state-title">Aún no tienes activos registrados</div>
                <div class="empty-state-description">Haz clic en "Añadir Activo" para comenzar</div>
              </div>
            ` : ''}
          </div>
          
          <!-- Línea divisoria -->
          <div class="patrimonio-divisor"></div>
          
          <!-- PASIVOS (Derecha) -->
          <div class="patrimonio-lado pasivos-lado">
            <div class="patrimonio-lado-header">
              <h3 class="patrimonio-lado-titulo">
                <span class="patrimonio-lado-icono">💸</span>
                PASIVOS - Lo que Debes
              </h3>
              <button class="btn btn-primary btn-small" onclick="PatrimonioController.nuevoPasivo()">
                ➕ Añadir Pasivo
              </button>
            </div>
            
            <div class="patrimonio-categorias">
              ${this.renderCategoriasPasivos(pasivosPorCategoria)}
            </div>
            
            ${pasivos.length === 0 ? `
              <div class="empty-state">
                <div class="empty-state-icon">💸</div>
                <div class="empty-state-title">No tienes pasivos registrados</div>
                <div class="empty-state-description">Si tienes deudas, añádelas aquí</div>
              </div>
            ` : ''}
          </div>
        </div>
        
        ${this.renderModales()}
      </div>
    `;
    
    // Event listener para cambio de categoría en formularios
    const activoCategoria = document.getElementById('activo-categoria');
    if (activoCategoria) {
      activoCategoria.addEventListener('change', (e) => {
        const categoriasActivos = this.getCategorias('activos');
        const cat = categoriasActivos.find(c => c.id === e.target.value);
        const ayuda = document.getElementById('activo-categoria-ayuda');
        if (ayuda && cat) ayuda.textContent = cat.ayuda;
      });
    }
    
    const pasivoCategoria = document.getElementById('pasivo-categoria');
    if (pasivoCategoria) {
      pasivoCategoria.addEventListener('change', (e) => {
        const categoriasPasivos = this.getCategorias('pasivos');
        const cat = categoriasPasivos.find(c => c.id === e.target.value);
        const ayuda = document.getElementById('pasivo-categoria-ayuda');
        if (ayuda && cat) ayuda.textContent = cat.ayuda;
      });
    }
  },
  
  agruparPorCategoria(items, categorias) {
    const grupos = {};
    console.log('[PatrimonioController] Agrupando items:', items);
    console.log('[PatrimonioController] Por categorías:', categorias);
    
    categorias.forEach(cat => {
      const itemsCategoria = items.filter(item => item.categoria === cat.id);
      console.log(`[PatrimonioController] Categoría '${cat.id}' tiene ${itemsCategoria.length} items:`, itemsCategoria);
      
      grupos[cat.id] = {
        categoria: cat,
        items: itemsCategoria,
        total: 0
      };
      grupos[cat.id].total = grupos[cat.id].items.reduce((sum, item) => sum + item.valor, 0);
    });
    return grupos;
  },
  
  renderCategoriasActivos(grupos) {
    return Object.values(grupos).map(grupo => {
      if (grupo.items.length === 0) return '';
      
      return `
        <div class="patrimonio-categoria collapsed">
          <div class="patrimonio-categoria-header" onclick="PatrimonioController.toggleCategoria(this)">
            <div class="patrimonio-categoria-info">
              <span class="patrimonio-categoria-icono">${grupo.categoria.icono}</span>
              <div>
                <div class="patrimonio-categoria-nombre">${grupo.categoria.nombre}</div>
                <div class="patrimonio-categoria-ayuda">${grupo.categoria.ayuda}</div>
              </div>
            </div>
            <div class="patrimonio-categoria-total">
              <div class="patrimonio-categoria-valor text-success">${Calculations.formatearMoneda(grupo.total)}</div>
              <div class="patrimonio-categoria-contador">${grupo.items.length} item(s)</div>
            </div>
            <span class="patrimonio-categoria-toggle">▼</span>
          </div>
          <div class="patrimonio-categoria-items">
            ${grupo.items.map(item => `
              <div class="patrimonio-item ${item.esAutomatico ? 'patrimonio-item-auto' : ''}">
                <div class="patrimonio-item-info">
                  <div class="patrimonio-item-nombre">
                    ${item.nombre}
                    ${item.esAutomatico ? '<span class="badge-auto">🤖 Auto</span>' : ''}
                  </div>
                  ${item.descripcion ? `<div class="patrimonio-item-desc">${item.descripcion}</div>` : ''}
                </div>
                <div class="patrimonio-item-derecha">
                  <div class="patrimonio-item-valor text-success">${Calculations.formatearMoneda(item.valor)}</div>
                  ${!item.esAutomatico ? `
                  <div class="patrimonio-item-acciones">
                    <button class="item-action-btn" onclick="PatrimonioController.editarActivo('${item.id}')" title="Editar">✏️</button>
                    <button class="item-action-btn delete" onclick="PatrimonioController.eliminarActivo('${item.id}')" title="Eliminar">🗑️</button>
                  </div>
                  ` : '<div class="patrimonio-item-acciones"><span class="text-muted" style="font-size: 0.75rem;">Calculado</span></div>'}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  },
  
  renderCategoriasPasivos(grupos) {
    return Object.values(grupos).map(grupo => {
      if (grupo.items.length === 0) return '';
      
      return `
        <div class="patrimonio-categoria collapsed">
          <div class="patrimonio-categoria-header" onclick="PatrimonioController.toggleCategoria(this)">
            <div class="patrimonio-categoria-info">
              <span class="patrimonio-categoria-icono">${grupo.categoria.icono}</span>
              <div>
                <div class="patrimonio-categoria-nombre">${grupo.categoria.nombre}</div>
                <div class="patrimonio-categoria-ayuda">${grupo.categoria.ayuda}</div>
              </div>
            </div>
            <div class="patrimonio-categoria-total">
              <div class="patrimonio-categoria-valor text-danger">${Calculations.formatearMoneda(grupo.total)}</div>
              <div class="patrimonio-categoria-contador">${grupo.items.length} item(s)</div>
            </div>
            <span class="patrimonio-categoria-toggle">▼</span>
          </div>
          <div class="patrimonio-categoria-items">
            ${grupo.items.map(item => `
              <div class="patrimonio-item ${item.esAutomatico ? 'patrimonio-item-auto' : ''}">
                <div class="patrimonio-item-info">
                  <div class="patrimonio-item-nombre">
                    ${item.nombre}
                    ${item.esAutomatico ? '<span class="badge-auto">🤖 Auto</span>' : ''}
                  </div>
                  ${item.descripcion ? `<div class="patrimonio-item-desc">${item.descripcion}</div>` : ''}
                </div>
                <div class="patrimonio-item-derecha">
                  <div class="patrimonio-item-valor text-danger">${Calculations.formatearMoneda(item.valor)}</div>
                  ${!item.esAutomatico ? `
                  <div class="patrimonio-item-acciones">
                    <button class="item-action-btn" onclick="PatrimonioController.editarPasivo('${item.id}')" title="Editar">✏️</button>
                    <button class="item-action-btn delete" onclick="PatrimonioController.eliminarPasivo('${item.id}')" title="Eliminar">🗑️</button>
                  </div>
                  ` : '<div class="patrimonio-item-acciones"><span class="text-muted" style="font-size: 0.75rem;">Calculado</span></div>'}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  },
  
  renderModales() {
    return `
      <!-- Modal Activo -->
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
                <label class="form-label">¿Qué tipo de activo es? *</label>
                <select id="activo-categoria" class="form-select" required onchange="PatrimonioController.actualizarAyudaCategoria('activo')">
                  <option value="">Selecciona una categoría...</option>
                  ${this.getCategorias('activos').map(cat => `
                    <option value="${cat.id}">${cat.icono} ${cat.nombre}</option>
                  `).join('')}
                </select>
                <small class="form-help" id="activo-categoria-ayuda"></small>
              </div>
              ${FormBuilder.render('patrimonio_activos', 'activo-form')}
              <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="PatrimonioController.cancelarActivo()">Cancelar</button>
                <button type="submit" class="btn btn-primary">Guardar Activo</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <!-- Modal Pasivo -->
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
                <label class="form-label">¿Qué tipo de deuda es? *</label>
                <select id="pasivo-categoria" class="form-select" required onchange="PatrimonioController.actualizarAyudaCategoria('pasivo')">
                  <option value="">Selecciona una categoría...</option>
                  ${this.getCategorias('pasivos').map(cat => `
                    <option value="${cat.id}">${cat.icono} ${cat.nombre}</option>
                  `).join('')}
                </select>
                <small class="form-help" id="pasivo-categoria-ayuda"></small>
              </div>
              ${FormBuilder.render('patrimonio_pasivos', 'pasivo-form')}
              <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="PatrimonioController.cancelarPasivo()">Cancelar</button>
                <button type="submit" class="btn btn-primary">Guardar Pasivo</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  },
  
  toggleCategoria(headerElement) {
    const categoria = headerElement.parentElement;
    categoria.classList.toggle('collapsed');
  },
  
  actualizarAyudaCategoria(tipo) {
    const categoriaSelect = document.getElementById(`${tipo}-categoria`);
    const ayudaElement = document.getElementById(`${tipo}-categoria-ayuda`);
    const categoriaId = categoriaSelect.value;
    
    if (!categoriaId) {
      ayudaElement.textContent = '';
      return;
    }
    
    const categorias = tipo === 'activo' ? this.getCategorias('activos') : this.getCategorias('pasivos');
    const cat = categorias.find(c => c.id === categoriaId);
    if (cat) {
      ayudaElement.textContent = cat.ayuda;
    }
  },
  
  nuevoActivo() { 
    document.getElementById('modal-activo').classList.add('show');
    document.getElementById('activo-form').reset();
    document.getElementById('form-activo-title').textContent = 'Nuevo Activo';
    document.getElementById('activo-categoria-ayuda').textContent = '';
  },
  
  cancelarActivo() { 
    document.getElementById('modal-activo').classList.remove('show');
    document.getElementById('activo-form').reset();
  },
  
  guardarActivo(event) {
    event.preventDefault();
    const id = document.getElementById('activo-id').value;
    const data = {
      categoria: document.getElementById('activo-categoria').value,
      ...FormBuilder.getFormData('patrimonio_activos')
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
    document.getElementById('activo-categoria').value = activo.categoria || '';
    
    // Rellenar campos dinámicos usando FormBuilder
    FormBuilder.populateForm('patrimonio_activos', activo);
    
    // Mostrar ayuda de categoría
    this.actualizarAyudaCategoria('activo');
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
    document.getElementById('pasivo-categoria-ayuda').textContent = '';
  },
  
  cancelarPasivo() { 
    document.getElementById('modal-pasivo').classList.remove('show');
    document.getElementById('pasivo-form').reset();
  },
  
  guardarPasivo(event) {
    event.preventDefault();
    const id = document.getElementById('pasivo-id').value;
    const formData = FormBuilder.getFormData('patrimonio_pasivos');
    console.log('[PatrimonioController] FormBuilder.getFormData retornó:', formData);
    
    const data = {
      categoria: document.getElementById('pasivo-categoria').value,
      ...formData
    };
    
    console.log('[PatrimonioController] Datos finales para guardar:', data);
    
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
    document.getElementById('pasivo-categoria').value = pasivo.categoria || '';
    
    // Rellenar campos dinámicos usando FormBuilder
    FormBuilder.populateForm('patrimonio_pasivos', pasivo);
    
    // Mostrar ayuda de categoría
    this.actualizarAyudaCategoria('pasivo');
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
