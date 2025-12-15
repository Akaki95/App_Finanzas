// 🐀 Cashflow Controller - Libertad Financiera 🐀
const CashflowController = {
  render() {
    const mainContent = document.getElementById('main-content');
    const resumen = CashflowModel.getResumen();
    const ingresos = CashflowModel.getAllIngresos();
    const gastos = CashflowModel.getAllGastos();
    
    const esLibre = resumen.libertadFinanciera;
    const cashflowClass = resumen.cashflow >= 0 ? '' : 'negative';
    
    mainContent.innerHTML = `
      <div class="container">
        <!-- Header con estilo Kiyosaki -->
        <div class="cashflow-header">
          <h1><span class="rat-flip rat-title-icon">🐀</span>Cashflow - Libertad Financiera 💰</h1>
          <p class="cashflow-subtitle">Inspirado en el juego Cashflow de Robert Kiyosaki</p>
        </div>
        
        <!-- Tarjetas de resumen con gradientes violeta/dorado -->
        <div class="cashflow-summary-cards">
          <!-- Ingresos Pasivos -->
          <div class="cashflow-card income">
            <span class="cashflow-card-icon">💸</span>
            <div class="cashflow-card-title">Ingresos Pasivos Mensuales</div>
            <div class="cashflow-card-amount">${Calculations.formatearMoneda(resumen.totalIngresos)}</div>
            <div class="cashflow-card-meta">
              <span>${resumen.cantidadIngresos} fuente${resumen.cantidadIngresos !== 1 ? 's' : ''}</span>
            </div>
          </div>
          
          <!-- Gastos Recurrentes -->
          <div class="cashflow-card expense">
            <span class="cashflow-card-icon">💳</span>
            <div class="cashflow-card-title">Gastos Recurrentes Mensuales</div>
            <div class="cashflow-card-amount">${Calculations.formatearMoneda(resumen.totalGastos)}</div>
            <div class="cashflow-card-meta">
              <span>${resumen.cantidadGastos} gasto${resumen.cantidadGastos !== 1 ? 's' : ''}</span>
            </div>
          </div>
          
          <!-- Cashflow Neto con Rata -->
          <div class="cashflow-card total ${cashflowClass}">
            <span class="cashflow-card-icon">${resumen.cashflow >= 0 ? '🏆' : '<span class="rat-flip">🐀</span>'}</span>
            <div class="cashflow-card-title">Cashflow Neto Mensual</div>
            <div class="cashflow-card-amount">${Calculations.formatearMoneda(resumen.cashflow)}</div>
            ${esLibre ? `
              <div class="cashflow-freedom-message">
                <span class="rat-icon">🐀</span>
                <span>¡Has escapado de la Carrera de la Rata!</span>
                <span class="rat-icon">🎉</span>
              </div>
            ` : `
              <div class="cashflow-card-meta">
                <span class="rat-flip" style="display: inline-block;">🐀</span>
                <span>Aún en la Carrera de la Rata</span>
              </div>
              <div class="running-rat">🐀</div>
            `}
          </div>
        </div>

        <!-- Secciones de Ingresos y Gastos -->
        <div class="cashflow-sections">
          <!-- Ingresos Pasivos -->
          <div class="cashflow-section ingresos">
            <div class="cashflow-section-header">
              <h3 class="cashflow-section-title">
                <span class="icon">💸</span>
                Ingresos Pasivos
              </h3>
              <button class="cashflow-add-btn purple" onclick="CashflowController.mostrarFormularioIngreso()">
                <span>➕</span>
                Nuevo Ingreso
              </button>
            </div>
            
            <div class="cashflow-list">
              ${ingresos.length === 0 ? `
                <div class="cashflow-empty">
                  <div class="cashflow-empty-icon">🌱</div>
                  <div class="cashflow-empty-text">No hay ingresos pasivos registrados</div>
                  <div class="cashflow-empty-hint">Agrega fuentes de ingreso que no requieran tu trabajo activo</div>
                </div>
              ` : ingresos.map(i => `
                <div class="cashflow-item">
                  <div class="cashflow-item-info">
                    <div class="cashflow-item-nombre">${i.nombre}</div>
                    ${i.descripcion ? `<div class="cashflow-item-descripcion">${i.descripcion}</div>` : ''}
                  </div>
                  <div class="cashflow-item-monto">${Calculations.formatearMoneda(i.valor)}</div>
                  <div class="cashflow-item-actions">
                    <button class="btn-icon" onclick="CashflowController.editarIngreso('${i.id}')" title="Editar">✏️</button>
                    <button class="btn-icon btn-danger" onclick="CashflowController.eliminarIngreso('${i.id}')" title="Eliminar">🗑️</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Gastos Recurrentes -->
          <div class="cashflow-section gastos">
            <div class="cashflow-section-header">
              <h3 class="cashflow-section-title">
                <span class="icon">💳</span>
                Gastos Recurrentes
              </h3>
              <button class="cashflow-add-btn gold" onclick="CashflowController.mostrarFormularioGasto()">
                <span>➕</span>
                Nuevo Gasto
              </button>
            </div>
            
            <div class="cashflow-list">
              ${gastos.length === 0 ? `
                <div class="cashflow-empty">
                  <div class="cashflow-empty-icon">✨</div>
                  <div class="cashflow-empty-text">No hay gastos recurrentes registrados</div>
                  <div class="cashflow-empty-hint">Agrega gastos que pagas regularmente cada mes</div>
                </div>
              ` : gastos.map(g => `
                <div class="cashflow-item">
                  <div class="cashflow-item-info">
                    <div class="cashflow-item-nombre">${g.nombre}</div>
                    ${g.descripcion ? `<div class="cashflow-item-descripcion">${g.descripcion}</div>` : ''}
                  </div>
                  <div class="cashflow-item-monto">${Calculations.formatearMoneda(g.valor)}</div>
                  <div class="cashflow-item-actions">
                    <button class="btn-icon" onclick="CashflowController.editarGasto('${g.id}')" title="Editar">✏️</button>
                    <button class="btn-icon btn-danger" onclick="CashflowController.eliminarGasto('${g.id}')" title="Eliminar">🗑️</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // Mostrar formulario para nuevo ingreso pasivo
  mostrarFormularioIngreso(id = null) {
    const ingreso = id ? CashflowModel.getAllIngresos().find(i => i.id === id) : null;
    const titulo = id ? 'Editar Ingreso Pasivo' : 'Nuevo Ingreso Pasivo';
    
    const formHTML = `
      <h3 style="margin-bottom: 1.5rem; color: var(--cashflow-purple);">${titulo}</h3>
      <div class="form-group">
        <label class="form-label" for="nombre">Nombre del Ingreso *</label>
        <input type="text" 
               id="nombre" 
               class="form-input" 
               required
               placeholder="Ej: Dividendos, Alquiler, Regalías..."
               value="${ingreso?.nombre || ''}">
      </div>
      <div class="form-group">
        <label class="form-label" for="valor">Monto Mensual (€) *</label>
        <input type="number" 
               id="valor" 
               class="form-input" 
               required
               step="0.01"
               min="0.01"
               value="${ingreso?.valor || ''}">
      </div>
      <div class="form-group">
        <label class="form-label" for="descripcion">Descripción</label>
        <textarea id="descripcion" 
                  class="form-input" 
                  rows="3"
                  placeholder="Describe de dónde viene este ingreso pasivo">${ingreso?.descripcion || ''}</textarea>
      </div>
      <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
        <button class="btn btn-secondary" style="flex: 1;" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" style="flex: 1;" onclick="CashflowController.guardarIngreso('${id || ''}')">${id ? 'Actualizar' : 'Crear'}</button>
      </div>
    `;

    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = formHTML;
    modal.classList.add('show');
  },

  // Guardar ingreso pasivo
  async guardarIngreso(id) {
    try {
      const nombre = document.getElementById('nombre').value;
      const valor = document.getElementById('valor').value;
      const descripcion = document.getElementById('descripcion').value;
      
      if (!nombre || !valor) {
        alert('Por favor completa todos los campos obligatorios');
        return;
      }

      const ingresoData = {
        nombre: nombre.trim(),
        valor: parseFloat(valor),
        descripcion: descripcion ? descripcion.trim() : ''
      };

      if (id) {
        await CashflowModel.updateIngreso(id, ingresoData);
        Logger.success('Ingreso pasivo actualizado');
      } else {
        await CashflowModel.createIngreso(ingresoData);
        Logger.success('Ingreso pasivo creado');
      }

      closeModal();
      this.render();
    } catch (error) {
      Logger.error('Error guardando ingreso pasivo', error);
      alert('Error al guardar el ingreso pasivo');
    }
  },

  // Editar ingreso
  editarIngreso(id) {
    this.mostrarFormularioIngreso(id);
  },

  // Eliminar ingreso
  async eliminarIngreso(id) {
    const ingreso = CashflowModel.getAllIngresos().find(i => i.id === id);
    if (!ingreso) return;

    showConfirmModal(
      `¿Eliminar el ingreso pasivo "${ingreso.nombre}" de ${Calculations.formatearMoneda(ingreso.valor)}/mes?\n\nEsta acción no se puede deshacer.`,
      async () => {
        try {
          await CashflowModel.deleteIngreso(id);
          Logger.success('💸 Ingreso pasivo eliminado correctamente');
          this.render();
        } catch (error) {
          Logger.error('Error eliminando ingreso pasivo', error);
          showModal('❌ Error al eliminar el ingreso pasivo. Intenta nuevamente.');
        }
      },
      null,
      'Eliminar Ingreso'
    );
  },

  // Mostrar formulario para nuevo gasto recurrente
  mostrarFormularioGasto(id = null) {
    const gasto = id ? CashflowModel.getAllGastos().find(g => g.id === id) : null;
    const titulo = id ? 'Editar Gasto Recurrente' : 'Nuevo Gasto Recurrente';
    
    const formHTML = `
      <h3 style="margin-bottom: 1.5rem; color: var(--cashflow-gold-dark);">${titulo}</h3>
      <div class="form-group">
        <label class="form-label" for="nombre">Nombre del Gasto *</label>
        <input type="text" 
               id="nombre" 
               class="form-input" 
               required
               placeholder="Ej: Hipoteca, Luz, Agua, Netflix..."
               value="${gasto?.nombre || ''}">
      </div>
      <div class="form-group">
        <label class="form-label" for="valor">Monto Mensual (€) *</label>
        <input type="number" 
               id="valor" 
               class="form-input" 
               required
               step="0.01"
               min="0.01"
               value="${gasto?.valor || ''}">
      </div>
      <div class="form-group">
        <label class="form-label" for="descripcion">Descripción</label>
        <textarea id="descripcion" 
                  class="form-input" 
                  rows="3"
                  placeholder="Detalles adicionales sobre este gasto">${gasto?.descripcion || ''}</textarea>
      </div>
      <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
        <button class="btn btn-secondary" style="flex: 1;" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" style="flex: 1;" onclick="CashflowController.guardarGasto('${id || ''}')">${id ? 'Actualizar' : 'Crear'}</button>
      </div>
    `;

    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = formHTML;
    modal.classList.add('show');
  },

  // Guardar gasto recurrente
  async guardarGasto(id) {
    try {
      const nombre = document.getElementById('nombre').value;
      const valor = document.getElementById('valor').value;
      const descripcion = document.getElementById('descripcion').value;
      
      if (!nombre || !valor) {
        alert('Por favor completa todos los campos obligatorios');
        return;
      }

      const gastoData = {
        nombre: nombre.trim(),
        valor: parseFloat(valor),
        descripcion: descripcion ? descripcion.trim() : ''
      };

      if (id) {
        await CashflowModel.updateGasto(id, gastoData);
        Logger.success('Gasto recurrente actualizado');
      } else {
        await CashflowModel.createGasto(gastoData);
        Logger.success('Gasto recurrente creado');
      }

      closeModal();
      this.render();
    } catch (error) {
      Logger.error('Error guardando gasto recurrente', error);
      alert('Error al guardar el gasto recurrente');
    }
  },

  // Editar gasto
  editarGasto(id) {
    this.mostrarFormularioGasto(id);
  },

  // Eliminar gasto
  async eliminarGasto(id) {
    const gasto = CashflowModel.getAllGastos().find(g => g.id === id);
    if (!gasto) return;

    showConfirmModal(
      `¿Eliminar el gasto recurrente "${gasto.nombre}" de ${Calculations.formatearMoneda(gasto.valor)}/mes?\n\nEsta acción no se puede deshacer.`,
      async () => {
        try {
          await CashflowModel.deleteGasto(id);
          Logger.success('💳 Gasto recurrente eliminado correctamente');
          this.render();
        } catch (error) {
          Logger.error('Error eliminando gasto recurrente', error);
          showModal('❌ Error al eliminar el gasto recurrente. Intenta nuevamente.');
        }
      },
      null,
      'Eliminar Gasto'
    );
  }
};

window.CashflowController = CashflowController;
Logger.log('CashflowController cargado - 🐀 ¡Escapa de la Carrera de la Rata! 🐀');
