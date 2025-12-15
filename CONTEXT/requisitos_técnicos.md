# Requisitos Técnicos

**Fase:** Requisitos y Arquitectura
**Proyecto:** FINANZAS
**Fecha de generación:** 2025-11-29 20:34:36

---

Requisitos No Funcionales – App de Finanzas Personales
1. Performance y Escalabilidad
Requisito	Métrica	Prioridad	Herramienta de Validación
Tiempos de respuesta del CRUD (gastos, ingresos, deudas, préstamos, activos/pasivos)	< 1 segundo para hasta 1,000 registros locales en caché	Crítico	Navegador: Chrome DevTools Network / Performance
Dashboard y gráficos interactivos	< 2 segundos para renderizar hasta 500 registros	Crítico	Lighthouse, Performance tab en DevTools
Throughput esperado	1 usuario, 2 dispositivos simultáneos (PC y móvil)	Crítico	Pruebas funcionales locales y sincronización Atlas
Recursos mínimos del dispositivo	CPU: i7 o equivalente, RAM: 8GB	Importante	Observación de uso de memoria en DevTools
Escalado futuro	Escalado vertical permitido en cada dispositivo; horizontal posible agregando backend si multiusuario	Deseable	Documentación de arquitectura y planificación futura
2. Disponibilidad y Confiabilidad
Requisito	Métrica	Prioridad	Herramienta de Validación
Disponibilidad offline	App funcional offline parcial (CRUD y dashboards)	Crítico	Prueba desconectando internet
Disponibilidad online	Sincronización con Atlas < 5 segundos para nuevos registros	Crítico	Pruebas funcionales y medición de tiempos
Backup y recuperación	Todos los registros sincronizados a Atlas actúan como backup	Crítico	Verificación de restauración desde Atlas
MTBF / MTTR	Aplicación no crítica; no aplica para un solo usuario	N/A	N/A
3. Seguridad
Requisito	Métrica	Prioridad	Herramienta de Validación
Autenticación y autorización	No requerida; uso personal	Crítico (por simplicidad)	Confirmación de diseño
Cifrado de datos en tránsito	MongoDB Atlas usa TLS/SSL	Crítico	Auditoría de conexiones HTTPS
Cifrado de datos en reposo	Atlas Free Tier maneja cifrado por defecto	Importante	Revisión de configuración Atlas
Cumplimiento regulatorio	No aplica, datos personales limitados	Deseable	N/A
Logging y auditoría	Logs básicos en consola para errores	Importante	Pruebas de registro de errores en DevTools
4. Mantenibilidad y Operabilidad
Requisito	Métrica	Prioridad	Herramienta de Validación
Monitoreo	Consola del navegador para errores y mensajes de debug	Crítico	DevTools Console
Logging estructurado	Mensajes de error consistentes y claros	Crítico	Revisión de logs en DevTools
Métricas técnicas	Tiempo de carga de dashboards, número de registros procesados	Importante	Lighthouse, Performance tab
Deployment	Local, sin servidores; actualizar archivos manualmente	Crítico	Verificación manual
Facilidad de rollback	Mantener versiones anteriores de archivos JS/CSS/HTML	Importante	Control de versiones (Git local)
5. Compatibilidad e Interoperabilidad
Requisito	Métrica	Prioridad	Herramienta de Validación
Navegadores soportados	Chrome, Firefox, Edge, Safari	Crítico	Pruebas cross-browser
Dispositivos soportados	PC (Windows/Mac), iOS móviles, Android tablet	Crítico	Pruebas en dispositivos reales
Formatos de datos	JSON para sincronización con Atlas	Crítico	Pruebas funcionales de CRUD
APIs y protocolos	Solo MongoDB Atlas REST/Web SDK	Crítico	Pruebas de integración con Atlas
6. Usabilidad
Requisito	Métrica	Prioridad	Herramienta de Validación
Tiempo de carga de pantalla	< 2 segundos para dashboards y formularios	Crítico	Lighthouse, Performance tab
Accesibilidad	Nivel básico; soporte teclado y pantalla	Importante	Lighthouse Accessibility, pruebas manuales
Experiencia móvil / responsive	Layout adaptativo a pantallas móviles y tablets	Crítico	Pruebas en Chrome DevTools Device Mode, dispositivos reales
Interactividad	Dashboards y filtros respondan inmediatamente	Crítico	Pruebas funcionales con diferentes volúmenes de datos
✅ Resumen

La aplicación está optimizada para uso personal, bajo volumen de datos y dos dispositivos simultáneos.

La caché local garantiza rendimiento instantáneo y operación offline parcial.

La persistencia en MongoDB Atlas proporciona disponibilidad, backup y sincronización.

La arquitectura es simple, mantenible y compatible con todos los navegadores y dispositivos relevantes.

---

*Documento generado automáticamente por MUDAI - Gestor de Proyectos*
