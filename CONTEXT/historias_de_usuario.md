# Historias de Usuario

**Fase:** Requisitos y Arquitectura
**Proyecto:** FINANZAS
**Fecha de generación:** 2025-11-29 20:34:36

---

US-001: Registrar gasto
Como usuario final,
Quiero registrar un gasto con monto, fecha y categoría,
Para llevar un control preciso de mis gastos y calcular balances.

Criterios de Aceptación:

 Escenario principal: Dado que el usuario completa el formulario de gasto, cuando pulsa “guardar”, entonces el gasto se almacena en la caché local y se sincroniza con Atlas si hay internet.

 Escenarios alternativos: Si el monto o fecha no son válidos, mostrar mensaje de error y no guardar.

 Validaciones de entrada: monto > 0, fecha válida, categoría seleccionada.

 Comportamiento de errores: fallas de sincronización registradas en consola, reintento automático al reconectar.

Definición de Listo:

 UI/UX definido

 API endpoints especificados

 Tests de aceptación escritos

 Performance criteria: <1s para registro hasta 1,000 entradas

Prioridad: Must Have
Esfuerzo: S
Valor de Negocio: Alto

US-002: Registrar ingreso
Como usuario final,
Quiero registrar un ingreso con monto, fecha y tipo/origen,
Para actualizar automáticamente balances y cashflow mensual.

Criterios de Aceptación:

 Escenario principal: Formulario validado y registro guardado en caché y Atlas.

 Escenarios alternativos: monto inválido → error; fecha inválida → error.

 Validaciones: monto > 0, fecha válida, tipo/origen seleccionado.

 Errores de sincronización manejados en consola.

Definición de Listo:

 UI/UX definido

 API endpoints especificados

 Tests de aceptación escritos

 Performance criteria: <1s

Prioridad: Must Have
Esfuerzo: S
Valor de Negocio: Alto

US-003: Gestionar deudas pendientes
Como usuario final,
Quiero agregar, actualizar y eliminar mis deudas,
Para conocer capital pendiente y recibir alertas de vencimiento.

Criterios de Aceptación:

 CRUD completo para deudas

 Cálculo automático de capital pendiente

 Alertas de vencimiento visibles en dashboard

 Validaciones: monto > 0, fecha de inicio válida, acreedor especificado

Definición de Listo:

 UI/UX definido

 API endpoints especificados

 Tests unitarios y de integración

 Performance: <1s por operación

Prioridad: Must Have
Esfuerzo: M
Valor de Negocio: Alto

US-004: Gestionar préstamos a terceros
Como usuario final,
Quiero registrar préstamos, pagos parciales y fechas de devolución,
Para mantener control de préstamos pendientes de cobrar.

Criterios de Aceptación:

 CRUD de préstamos

 Registro de pagos parciales actualiza saldo pendiente

 Fecha de devolución prevista marcada y alertas visuales

 Validaciones: monto > 0, persona especificada, fecha de préstamo válida

Definición de Listo:

 UI/UX definido

 API endpoints especificados

 Tests de aceptación escritos

 Performance: <1s

Prioridad: Must Have
Esfuerzo: M
Valor de Negocio: Alto

US-005: Gestionar activos y pasivos
Como usuario final,
Quiero agregar y actualizar mis activos y pasivos,
Para calcular mi patrimonio neto actualizado automáticamente.

Criterios de Aceptación:

 CRUD completo para activos y pasivos

 Cálculo automático de patrimonio neto

 Visualización resumida en dashboard

 Validaciones: monto > 0, tipo de activo/pasivo válido

Definición de Listo:

 UI/UX definido

 API endpoints especificados

 Tests unitarios y de integración

 Performance: <1s por operación

Prioridad: Should Have
Esfuerzo: M
Valor de Negocio: Medio

US-006: Visualizar dashboards y gráficos interactivos
Como usuario final,
Quiero ver gráficos y filtros dinámicos de mis finanzas,
Para entender flujos de efectivo, balances y categorías de gastos.

Criterios de Aceptación:

 Dashboards generados desde caché local

 Filtros por fecha, categoría, tipo, etc.

 Gráficos interactivos (barras, líneas, pastel)

 Actualización instantánea al modificar registros

Definición de Listo:

 UI/UX definido

 Librerías de gráficos seleccionadas (Chart.js/ApexCharts)

 Tests de visualización y filtros

 Performance: <2s para hasta 500 registros

Prioridad: Must Have
Esfuerzo: M
Valor de Negocio: Alto

US-007: Sincronización offline/local con MongoDB Atlas
Como usuario final,
Quiero que la app funcione offline y sincronice automáticamente al reconectar,
Para poder trabajar sin internet y mantener datos consistentes entre dispositivos.

Criterios de Aceptación:

 Caché local actualizada con todos los registros

 Sincronización bidireccional con Atlas cuando hay internet

 Conflictos de datos detectados y resueltos automáticamente

 Visualización correcta en dashboards durante la desconexión

Definición de Listo:

 UI/UX definido

 API endpoints y lógica de caché documentados

 Tests de sincronización

 Performance: <5s para sincronizar 100 registros

Prioridad: Must Have
Esfuerzo: M
Valor de Negocio: Alto

---

*Documento generado automáticamente por MUDAI - Gestor de Proyectos*
