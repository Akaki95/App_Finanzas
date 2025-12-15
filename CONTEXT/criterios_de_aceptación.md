# Criterios de Aceptación

**Fase:** Requisitos y Arquitectura
**Proyecto:** FINANZAS
**Fecha de generación:** 2025-11-29 20:34:36

---

Feature: Registrar Gasto
Scenario: Usuario agrega un gasto válido
  Given el usuario está en el formulario de gasto
  When ingresa monto = 50, fecha = hoy, categoría = comida
  And pulsa "Guardar"
  Then el gasto se almacena en caché local
  And se sincroniza con MongoDB Atlas si hay internet
  And el dashboard muestra el nuevo gasto

Scenario: Usuario ingresa monto inválido
  Given el usuario está en el formulario de gasto
  When ingresa monto = -10, fecha = hoy, categoría = comida
  And pulsa "Guardar"
  Then se muestra mensaje de error "Monto inválido"
  And el gasto no se almacena

Feature: Registrar Ingreso
Scenario: Usuario agrega un ingreso válido
  Given el usuario está en el formulario de ingreso
  When ingresa monto = 1000, fecha = hoy, tipo = salario
  And pulsa "Guardar"
  Then el ingreso se almacena en caché local
  And se sincroniza con MongoDB Atlas si hay internet
  And el dashboard actualiza balance y cashflow

Scenario: Usuario ingresa tipo de ingreso inválido
  Given el usuario está en el formulario de ingreso
  When ingresa monto = 500, fecha = hoy, tipo = "desconocido"
  And pulsa "Guardar"
  Then se muestra mensaje de error "Tipo de ingreso inválido"
  And el ingreso no se almacena

Feature: Visualizar Dashboards
Scenario: Dashboard muestra datos correctamente
  Given el usuario tiene gastos e ingresos registrados
  When abre la sección de dashboards
  Then se muestran gráficos de barras, líneas y pastel
  And los filtros por fecha y categoría funcionan correctamente
  And los totales y balances coinciden con registros almacenados

Scenario: Dashboard con caché vacío
  Given el usuario no tiene registros
  When abre la sección de dashboards
  Then se muestra mensaje "No hay datos para mostrar"
  And los filtros están deshabilitados

Feature: Sincronización Offline/Online
Scenario: Sincronización al reconectar internet
  Given el usuario registró gastos y no hay conexión
  When se reconecta a internet
  Then los registros pendientes se sincronizan automáticamente con Atlas
  And se actualiza el dashboard con los nuevos datos

Scenario: Conflicto de sincronización
  Given el usuario modificó un registro en dos dispositivos distintos
  When se sincronizan ambos registros con Atlas
  Then se detecta conflicto
  And se muestra alerta para resolución manual


✅ Datos de prueba sugeridos:

Gastos: 50, 100, 200, categoría comida/transporte/ocio

Ingresos: 500, 1000, tipo salario/venta/regalo

Fechas: hoy, ayer, fecha pasada y fecha futura (para validar errores)

✅ Configuración de entorno:

Navegador en PC y móvil

Caché local vacía al inicio

Conexión/desconexión de internet para pruebas de sincronización

✅ Dependencias externas: MongoDB Atlas

---

*Documento generado automáticamente por MUDAI - Gestor de Proyectos*
