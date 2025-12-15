# Restricciones y Contexto

**Fase:** Fundamentos y Contexto
**Proyecto:** FINANZAS
**Fecha de generación:** 2025-11-29 20:34:36

---

Análisis de Restricciones – Aplicación de Finanzas Personales
1. Recursos Disponibles
Recurso	Restricción	Plan de Mitigación
Presupuesto	100% gratuito para desarrollo y uso	Usar únicamente software open source y servicios gratuitos (MongoDB Atlas Free Tier)
Herramientas / Software	Solo software gratuito y open source	VS Code, GitHub/GitLab free, Node.js, MongoDB Atlas Free Tier, librerías JS gratuitas (Chart.js, etc.)
Hardware	Laptop i7, 8GB RAM, 500GB SSD, GPU 6GB; 2 móviles iOS, 1 tablet Android	Optimizar la web app para móviles; pruebas en todos los dispositivos
Tiempo	Ilimitado, desarrollo con apoyo de herramientas de IA	Priorizar calidad y coherencia, aprovechar automatización de IA
2. Restricciones Técnicas
Restricción	Detalle	Plan de Mitigación
Tecnologías obligatorias	JavaScript vainilla, HTML, CSS; MongoDB Atlas Free Tier	Mantener código limpio y modular; usar librerías gratuitas solo si es necesario
Tecnologías prohibidas	Frameworks/librerías de pago; servicios de backend pagos; APIs no gratuitas	No usar React, Angular, Vue, ni servicios pagos
Performance / Escalabilidad	Solo un usuario; no requiere alta concurrencia	MongoDB Atlas Free Tier suficiente; cálculos directos y consultas simples
Integración con otros sistemas	Ninguna	Todo flujo manual; evitar dependencias externas
3. Restricciones Regulatorias
Restricción	Detalle	Plan de Mitigación
Protección de datos	Actualmente solo datos personales; GDPR/LOPD no aplican	Para uso futuro con amigos, cada usuario debe usar su propia instancia MongoDB
Seguridad	Autenticación básica de usuario único	Contraseña robusta; no compartir credenciales
4. Restricciones de Negocio
Restricción	Detalle	Plan de Mitigación
Deadlines	No hay fecha límite	Planificar iteraciones según conveniencia
Políticas internas	Solo software gratuito; privacidad absoluta	Cumplir con la política usando open source y almacenamiento personal en nube gratuita
Acceso a datos / usuarios	Solo usuario único	Implementar autenticación básica; futura expansión requiere instancias separadas para cada usuario
5. Plan de Mitigación General

Restricciones de presupuesto / software:

Usar únicamente software open source y servicios gratuitos; optimizar uso de recursos gratuitos de MongoDB Atlas.

Limitaciones técnicas (performance / escalabilidad):

Diseñar la app para un solo usuario; pruebas en todos los dispositivos.

Consultas y cálculos simples para garantizar fluidez.

Restricciones regulatorias (uso futuro multiusuario):

Cada usuario deberá configurar su propia base de datos gratuita para mantener privacidad.

No almacenar datos de terceros en la misma instancia.

Acceso y seguridad:

Implementar autenticación de usuario con contraseña robusta.

No depender de servicios pagos ni de servidores externos más allá de MongoDB Atlas Free Tier.

---

*Documento generado automáticamente por MUDAI - Gestor de Proyectos*
