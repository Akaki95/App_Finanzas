// Controlador de Grupos de Gastos (frontend)
const GruposGastoController = {
  render() {
    if (window.GrupoGastoView && typeof window.GrupoGastoView.renderLista === 'function') {
      window.GrupoGastoView.renderLista();
    } else {
      const mainContent = document.getElementById('main-content');
      if (mainContent) mainContent.innerHTML = '<div class="error">No se pudo cargar la vista de grupos de gastos.</div>';
      console.error('GrupoGastoView.renderLista no está disponible');
    }
  }
};

// Controlador de Grupos de Ingresos (frontend)
const GruposIngresoController = {
  render() {
    if (window.GrupoIngresoView && typeof window.GrupoIngresoView.renderLista === 'function') {
      window.GrupoIngresoView.renderLista();
    } else {
      const mainContent = document.getElementById('main-content');
      if (mainContent) mainContent.innerHTML = '<div class="error">No se pudo cargar la vista de grupos de ingresos.</div>';
      console.error('GrupoIngresoView.renderLista no está disponible');
    }
  }
};

window.GruposGastoController = GruposGastoController;
window.GruposIngresoController = GruposIngresoController;
