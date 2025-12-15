// FormBuilder - Constructor dinámico de formularios basado en configuración
const FormBuilder = {
  
  // Renderizar formulario completo
  render(modulo, formId, valorActual = {}) {
    const config = ConfigModel.getModuleConfig(modulo);
    if (!config || !config.campos) {
      Logger.error(`Configuración no encontrada para módulo: ${modulo}`);
      return '';
    }

    // Ordenar campos por orden
    const camposOrdenados = [...config.campos].sort((a, b) => (a.orden || 0) - (b.orden || 0));
    
    return camposOrdenados.map(campo => this.renderField(campo, valorActual[campo.id])).join('');
  },

  // Renderizar un campo individual
  renderField(campo, valor = '') {
    const { id, nombre, tipo, obligatorio, placeholder, rows, step, min, max, opciones } = campo;
    
    // Determinar si los campos deben estar en una fila (para fechas y números juntos)
    const esNumeroOFecha = tipo === 'number' || tipo === 'date';
    const wrapperClass = esNumeroOFecha ? 'form-group' : 'form-group';

    switch (tipo) {
      case 'text':
        return `
          <div class="${wrapperClass}">
            <label class="form-label" for="${id}">${nombre} ${obligatorio ? '*' : ''}</label>
            <input type="text" 
                   id="${id}" 
                   class="form-input" 
                   ${obligatorio ? 'required' : ''} 
                   placeholder="${placeholder || ''}"
                   value="${valor || ''}">
          </div>
        `;

      case 'number':
        return `
          <div class="${wrapperClass}">
            <label class="form-label" for="${id}">${nombre} ${obligatorio ? '*' : ''}</label>
            <input type="number" 
                   id="${id}" 
                   class="form-input" 
                   ${obligatorio ? 'required' : ''}
                   step="${step || '0.01'}"
                   min="${min || '0'}"
                   ${max ? `max="${max}"` : ''}
                   placeholder="${placeholder || ''}"
                   value="${valor || ''}">
          </div>
        `;

      case 'date':
        return `
          <div class="${wrapperClass}">
            <label class="form-label" for="${id}">${nombre} ${obligatorio ? '*' : ''}</label>
            <input type="date" 
                   id="${id}" 
                   class="form-input" 
                   ${obligatorio ? 'required' : ''}
                   value="${valor || ''}">
          </div>
        `;

      case 'select':
        return `
          <div class="form-group">
            <label class="form-label" for="${id}">${nombre} ${obligatorio ? '*' : ''}</label>
            <select id="${id}" 
                    class="form-select" 
                    ${obligatorio ? 'required' : ''}>
              <option value="">Selecciona una opción</option>
              ${(opciones || []).map(opcion => {
                const valorOpcion = opcion.valor || opcion;
                const etiquetaOpcion = opcion.icono ? `${opcion.icono} ${opcion.valor}` : (opcion.etiqueta || opcion.valor || opcion);
                return `<option value="${valorOpcion}" ${valor === valorOpcion ? 'selected' : ''}>${etiquetaOpcion}</option>`;
              }).join('')}
            </select>
          </div>
        `;

      case 'textarea':
        return `
          <div class="form-group">
            <label class="form-label" for="${id}">${nombre} ${obligatorio ? '*' : ''}</label>
            <textarea id="${id}" 
                      class="form-textarea" 
                      rows="${rows || 3}"
                      ${obligatorio ? 'required' : ''}
                      placeholder="${placeholder || ''}">${valor || ''}</textarea>
          </div>
        `;

      case 'checkbox':
        return `
          <div class="form-group">
            <label class="form-label checkbox-label">
              <input type="checkbox" 
                     id="${id}" 
                     ${obligatorio ? 'required' : ''}
                     ${valor ? 'checked' : ''}>
              ${nombre} ${obligatorio ? '*' : ''}
            </label>
          </div>
        `;

      default:
        Logger.warn(`Tipo de campo desconocido: ${tipo}`);
        return '';
    }
  },

  // Agrupar campos en filas (para layouts con múltiples campos por fila)
  renderInRows(modulo, formId, valorActual = {}) {
    const config = ConfigModel.getModuleConfig(modulo);
    if (!config || !config.campos) {
      return '';
    }

    const camposOrdenados = [...config.campos].sort((a, b) => (a.orden || 0) - (b.orden || 0));
    let html = '';
    let currentRow = [];

    camposOrdenados.forEach((campo, index) => {
      const esNumeroOFecha = campo.tipo === 'number' || campo.tipo === 'date';
      
      if (esNumeroOFecha && currentRow.length === 0) {
        currentRow.push(campo);
        
        // Si el siguiente campo también es número o fecha, agregarlo a la fila
        const nextCampo = camposOrdenados[index + 1];
        if (nextCampo && (nextCampo.tipo === 'number' || nextCampo.tipo === 'date')) {
          // Se agregará en la siguiente iteración
        } else {
          // Renderizar la fila con un solo campo
          html += `<div class="form-row">${this.renderField(campo, valorActual[campo.id])}</div>`;
          currentRow = [];
        }
      } else if (esNumeroOFecha && currentRow.length === 1) {
        currentRow.push(campo);
        // Renderizar la fila con dos campos
        html += `<div class="form-row">
          ${this.renderField(currentRow[0], valorActual[currentRow[0].id])}
          ${this.renderField(campo, valorActual[campo.id])}
        </div>`;
        currentRow = [];
      } else {
        // Campo de texto, textarea, select - ocupa toda la fila
        if (currentRow.length > 0) {
          html += `<div class="form-row">${this.renderField(currentRow[0], valorActual[currentRow[0].id])}</div>`;
          currentRow = [];
        }
        html += this.renderField(campo, valorActual[campo.id]);
      }
    });

    // Renderizar cualquier campo pendiente
    if (currentRow.length > 0) {
      html += `<div class="form-row">${currentRow.map(c => this.renderField(c, valorActual[c.id])).join('')}</div>`;
    }

    return html;
  },

  // Extraer valores del formulario
  extractFormData(modulo) {
    const config = ConfigModel.getModuleConfig(modulo);
    if (!config || !config.campos) {
      return {};
    }

    const data = {};
    config.campos.forEach(campo => {
      const element = document.getElementById(campo.id);
      if (element) {
        if (campo.tipo === 'checkbox') {
          data[campo.id] = element.checked;
        } else if (campo.tipo === 'number') {
          data[campo.id] = element.value ? parseFloat(element.value) : null;
        } else {
          data[campo.id] = element.value;
        }
      }
    });

    return data;
  },

  // Validar formulario
  validateForm(modulo) {
    const config = ConfigModel.getModuleConfig(modulo);
    if (!config || !config.campos) {
      return { valid: true, errors: [] };
    }

    const errors = [];
    
    config.campos.forEach(campo => {
      if (campo.obligatorio) {
        const element = document.getElementById(campo.id);
        if (!element) return;

        if (campo.tipo === 'checkbox') {
          if (!element.checked) {
            errors.push(`${campo.nombre} es obligatorio`);
          }
        } else {
          if (!element.value || element.value.trim() === '') {
            errors.push(`${campo.nombre} es obligatorio`);
          }
        }
      }

      // Validaciones específicas por tipo
      const element = document.getElementById(campo.id);
      if (!element || !element.value) return;

      if (campo.tipo === 'number') {
        const value = parseFloat(element.value);
        if (isNaN(value)) {
          errors.push(`${campo.nombre} debe ser un número válido`);
        } else {
          if (campo.min !== undefined && value < parseFloat(campo.min)) {
            errors.push(`${campo.nombre} debe ser mayor o igual a ${campo.min}`);
          }
          if (campo.max !== undefined && value > parseFloat(campo.max)) {
            errors.push(`${campo.nombre} debe ser menor o igual a ${campo.max}`);
          }
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  },

  // Llenar formulario con datos
  fillForm(modulo, data) {
    const config = ConfigModel.getModuleConfig(modulo);
    if (!config || !config.campos) {
      return;
    }

    config.campos.forEach(campo => {
      const element = document.getElementById(campo.id);
      if (element && data[campo.id] !== undefined) {
        if (campo.tipo === 'checkbox') {
          element.checked = data[campo.id];
        } else {
          element.value = data[campo.id] || '';
        }
      }
    });
  },

  // Limpiar formulario
  clearForm(modulo) {
    const config = ConfigModel.getModuleConfig(modulo);
    if (!config || !config.campos) {
      return;
    }

    config.campos.forEach(campo => {
      const element = document.getElementById(campo.id);
      if (element) {
        if (campo.tipo === 'checkbox') {
          element.checked = false;
        } else if (campo.tipo === 'date') {
          element.value = campo.id === 'fecha' || campo.id.includes('fecha') 
            ? new Date().toISOString().split('T')[0] 
            : '';
        } else {
          element.value = '';
        }
      }
    });
  },

  // Alias para compatibilidad
  getFormData(modulo) {
    return this.extractFormData(modulo);
  },

  populateForm(modulo, data) {
    return this.fillForm(modulo, data);
  }
};

window.FormBuilder = FormBuilder;
Logger.log('FormBuilder cargado');
