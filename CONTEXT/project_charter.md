# Project Charter

**Fase:** Fundamentos y Contexto
**Proyecto:** FINANZAS
**Fecha de generación:** 2025-11-29 20:34:36

---

Project Charter – Aplicación de Finanzas Personales
1. Resumen Ejecutivo

Actualmente, el control de las finanzas personales se realiza de manera dispersa, generando falta de visibilidad sobre gastos, ingresos, deudas, préstamos y patrimonio. Esto dificulta la planificación financiera y el seguimiento del dinero.

La solución propuesta es una aplicación web personal, accesible desde PC y móviles, que permita registrar y categorizar manualmente gastos, ingresos, deudas, préstamos, activos y pasivos, ofreciendo resúmenes claros y actualizados en tiempo real mediante MongoDB Atlas Free Tier. El valor del negocio se centra en mejorar la organización financiera, optimizar la toma de decisiones y aumentar la tranquilidad personal al tener una visión completa y precisa del patrimonio.

2. Objetivo General

Desarrollar y lanzar una aplicación web de finanzas personales que permita registrar, organizar y visualizar gastos, ingresos, deudas, préstamos, activos y pasivos, generando reportes y métricas clave que reflejen el patrimonio neto de manera precisa y en tiempo real.

3. Objetivos Específicos (SMART)

Registrar gastos e ingresos diarios con categorías y fechas, generando resúmenes mensuales y totales por categoría antes del lanzamiento de la versión 1.0.

Gestionar deudas y préstamos, incluyendo pagos parciales, y reflejar su estado actualizado en alertas de vencimiento antes de la primera semana de uso.

Mantener un cálculo automático de patrimonio neto que integre activos registrados y pasivos derivados de deudas, con reportes visuales y exportables.

Implementar filtros y vistas personalizables (por fecha, categoría, tipo de movimiento) para todos los registros antes de la primera versión.

Garantizar que la aplicación funcione offline/localmente con sincronización en tiempo real mediante MongoDB Atlas Free Tier, sin costos asociados.

4. Público Objetivo

Usuario principal: Tú mismo, como gestor de tus finanzas personales.

Necesidades específicas:

Visualizar ingresos y gastos de manera clara y organizada.

Controlar deudas y préstamos con alertas de vencimiento.

Conocer el patrimonio neto en cualquier momento.

Acceder desde PC y dispositivos móviles sin depender de servidores pagos.

5. Alcance de la Versión 1.0

La primera versión incluirá:

Gestión de Gastos e Ingresos

Registro, edición y eliminación de movimientos

Filtros avanzados por fecha, categoría, tipo y monto

Exportación a CSV

Cálculo automático de totales y balances mensuales

Gestión de Deudas y Préstamos

Registro de deudas y préstamos con pagos parciales

Visualización del historial y estado actual

Alertas por vencimiento

Integración automática con módulo de pasivos

Gestión de Activos y Patrimonio

Registro de activos manuales

Cálculo automático de pasivos a partir de deudas + pasivos manuales

Cálculo automático de patrimonio neto

Visualización y gráficos de evolución del patrimonio

Exportación a CSV

Interfaz y Acceso

Web responsive accesible desde PC y móviles

Autenticación de usuario

Sin costos de infraestructura, sincronización mediante MongoDB Atlas Free Tier

6. Criterios de Éxito (KPIs)

Registro completo de 100% de movimientos diarios sin errores.

Actualización de patrimonio neto reflejada en menos de 5 segundos tras cambios en deudas o activos.

Visualización de reportes y filtros funcionando correctamente en PC y móvil.

Backup manual funcional y restauración verificada al menos una vez.

Cumplimiento del objetivo de cero costos operativos.

7. Supuestos

Se desarrollará usando tecnologías web modernas (HTML, CSS, JavaScript, frameworks como React o similar).

MongoDB Atlas Free Tier proporcionará almacenamiento en la nube gratuito y suficiente para el volumen esperado de datos.

La aplicación será usada únicamente por el usuario principal.

El desarrollo y pruebas se realizarán en un entorno local con conexión a Internet para sincronización.

8. Dependencias

MongoDB Atlas Free Tier: almacenamiento y sincronización de datos.

Navegador moderno en PC y dispositivos móviles.

Conexión a Internet para sincronización en tiempo real.

Librerías/frameworks de desarrollo web elegidas (React, Vue, etc.).

9. Riesgos Principales y Mitigación
Riesgo	Probabilidad	Impacto	Plan de Mitigación
Fallos de sincronización en MongoDB Atlas	Media	Alto	Implementar validación de datos antes y después de sincronizar, backups frecuentes.
Pérdida de datos	Baja	Alto	Backups manuales regulares; exportación a CSV.
Errores en cálculos de patrimonio neto	Baja	Alto	Tests unitarios y verificación cruzada con datos reales.
Limitaciones de la versión gratuita de Atlas	Baja	Medio	Mantener el volumen de datos dentro de límites; optimizar consultas.
Problemas de compatibilidad móvil/PC	Media	Medio	Testing en múltiples dispositivos antes del lanzamiento.

---

*Documento generado automáticamente por MUDAI - Gestor de Proyectos*
