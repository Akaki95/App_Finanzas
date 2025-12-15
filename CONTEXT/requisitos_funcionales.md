# Requisitos Funcionales

**Fase:** Requisitos y Arquitectura
**Proyecto:** FINANZAS
**Fecha de generación:** 2025-11-29 20:34:36

---

Documento de Requisitos Funcionales – App de Finanzas Personales
1. Identificación de Actores
Actor	Descripción	Responsabilidades / Interacciones
Usuario Final	Tú, usuario único de la aplicación	- Registrar gastos e ingresos
- Gestionar deudas, préstamos, activos y pasivos
- Consultar dashboards y gráficos interactivos
- Filtrar y visualizar información financiera
Sistema Externo: MongoDB Atlas	Base de datos en la nube para persistencia de datos	- Almacenar y recuperar registros financieros
- Sincronizar cambios entre dispositivos
- Servir como fuente de verdad para refresh de caché
Roles Internos (Desarrollador / Operaciones)	Tú mismo, responsable del mantenimiento y evolución de la app	- Configurar base de datos
- Actualizar código y dashboards
- Asegurar integridad de datos y sincronización

Notas: No existen administradores externos ni múltiples usuarios por ahora.

2. Historias de Usuario Detalladas
Historia de Usuario	Criterios de Aceptación	Prioridad	Complejidad
Como usuario final, quiero registrar un gasto con monto, fecha y categoría, para mantener un control preciso de mis gastos.	- Formulario de gasto validado
- Registro guardado en caché local y sincronizado con Atlas
- Confirmación visual de registro exitoso	Must have	S
Como usuario final, quiero registrar un ingreso con monto, fecha y tipo/origen, para calcular balances y cashflow.	- Formulario de ingreso validado
- Registro guardado en caché y sincronizado
- Actualización automática de dashboards	Must have	S
Como usuario final, quiero gestionar mis deudas pendientes, para saber cuánto debo y a quién.	- CRUD completo de deudas
- Cálculo de capital pendiente
- Alertas de vencimiento opcionales	Must have	M
Como usuario final, quiero gestionar préstamos que hago a otros, para controlar pagos parciales y fechas de devolución.	- CRUD de préstamos
- Registro de pagos parciales
- Recordatorio de vencimientos	Must have	M
Como usuario final, quiero consultar resúmenes y dashboards interactivos de mis finanzas, para entender el flujo de dinero y balances mensuales.	- Visualización de gráficos (barras, líneas, pastel)
- Filtrado dinámico por fecha, categoría o tipo
- Datos tomados de caché local o Atlas	Must have	M
Como usuario final, quiero gestionar activos y pasivos, para calcular patrimonio neto actualizado.	- CRUD de activos y pasivos
- Cálculo automático de patrimonio neto
- Visualización en dashboard	Should have	M
Como usuario final, quiero que la app funcione offline y sincronice con Atlas cuando haya internet, para poder trabajar sin conexión.	- Caché local actualizado
- Sincronización bidireccional con Atlas
- Conflictos manejados correctamente	Must have	M
3. Casos de Uso Críticos
3.1 Registrar Gasto

Flujo principal:

Usuario abre formulario de gasto

Introduce monto, fecha y categoría

Datos validados localmente

Registro agregado a caché local

Si hay internet, se sincroniza con MongoDB Atlas

Flujos alternativos:

Si el monto o fecha no son válidos, mostrar error y no guardar

Si no hay internet, almacenar solo en caché y sincronizar más tarde

Precondiciones: Usuario tiene la app abierta y caché inicial cargada

Postcondiciones: Registro disponible en caché y sincronizado eventualmente

Reglas de negocio: Los gastos deben tener categoría válida; no se permiten montos negativos

3.2 Consultar Dashboard

Flujo principal:

Usuario abre sección de dashboards

La app consulta datos del caché local

Se generan gráficos interactivos con filtros aplicados

Flujos alternativos:

Si caché está desactualizado, se hace refresh desde Atlas

Precondiciones: Caché inicial cargada

Postcondiciones: Gráficos muestran datos actualizados

Reglas de negocio: Cálculos de balance y cashflow deben coincidir con registros guardados

(Se pueden generar casos de uso similares para ingresos, deudas, préstamos y patrimonio)

4. Requisitos de Interface

API de MongoDB Atlas:

Operaciones CRUD para gastos, ingresos, deudas, préstamos, activos y pasivos

Formato de entrada/salida JSON

Identificador único por registro (_id)

Frontend:

Lógica en JS vainilla para CRUD, dashboards y filtrado

Interacción con caché local (arrays u objetos JS)

Integraciones externas:

Ninguna por ahora, solo Atlas

5. Validación y Métricas
Funcionalidad	KPI / Métrica	Criterio de aceptación
Registrar gastos e ingresos	% de registros guardados correctamente	≥ 99% de registros exitosos en caché y Atlas
Dashboards y gráficos	Tiempo de carga del dashboard	< 2 segundos para conjunto de 500 registros
Gestión de deudas y préstamos	Alertas de vencimiento enviadas correctamente	Todas las alertas previstas deben aparecer
Sincronización multi-dispositivo	Conflictos de datos	0 conflictos no resueltos; refresh completo al iniciar en otro dispositivo
Usabilidad	Número de clics para registrar un gasto	≤ 3 clics

---

*Documento generado automáticamente por MUDAI - Gestor de Proyectos*
