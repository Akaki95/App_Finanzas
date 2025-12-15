# Diseño de APIs

**Fase:** Diseño del Sistema
**Proyecto:** FINANZAS
**Fecha de generación:** 2025-11-29 20:34:36

---

Diseño de API – Finanzas Personales (REST)
1. Arquitectura de la API

Estilo: RESTful

Versionado: vía URL, ej. /api/v1/...

Formato de datos: JSON

Naming convention: plural para recursos (/gastos, /ingresos), kebab-case para endpoints complejos (/prestamos-pendientes)

Consideraciones de backward compatibility:

Nuevas propiedades se agregan como opcionales

Endpoints antiguos marcados como deprecated con header Warning: 299 - Deprecated

2. Endpoints principales
Gastos
Método	URL	Descripción
GET	/api/v1/gastos	Listar todos los gastos, con filtros opcionales
GET	/api/v1/gastos/{id}	Obtener gasto por ID
POST	/api/v1/gastos	Crear nuevo gasto
PUT	/api/v1/gastos/{id}	Actualizar gasto existente
DELETE	/api/v1/gastos/{id}	Eliminar gasto

Query params para GET /gastos:

fechaInicio / fechaFin → filtrar por rango de fechas

categoria → filtrar por categoría

limit / offset → paginación

sort → ordenar por fecha o monto

Ejemplo POST request:

{
  "fecha": "2025-11-29",
  "monto": 50.0,
  "descripcion": "Cena",
  "categoria": "Comida"
}


Response (200 OK GET / 201 Created POST):

{
  "id": "64f7f4c9a1b2c9d1f1234567",
  "fecha": "2025-11-29",
  "monto": 50.0,
  "descripcion": "Cena",
  "categoria": "Comida"
}


Status Codes:

200 OK – operación exitosa

201 Created – recurso creado

400 Bad Request – datos inválidos

404 Not Found – recurso no encontrado

500 Internal Server Error – error del servidor

Ingresos

Igual estructura que gastos (/api/v1/ingresos)

Query params: fechaInicio, fechaFin, tipo, limit, offset, sort

Deudas
Método	URL	Descripción
GET	/api/v1/deudas	Listar deudas activas
POST	/api/v1/deudas	Crear deuda
PUT	/api/v1/deudas/{id}	Actualizar deuda
DELETE	/api/v1/deudas/{id}	Eliminar deuda
Préstamos
Método	URL	Descripción
GET	/api/v1/prestamos	Listar préstamos pendientes
POST	/api/v1/prestamos	Crear nuevo préstamo
PUT	/api/v1/prestamos/{id}	Actualizar préstamo
DELETE	/api/v1/prestamos/{id}	Eliminar préstamo
Activos / Pasivos

Endpoints REST estándar (/api/v1/activos, /api/v1/pasivos)

GET con filtros por nombre o valor

POST / PUT / DELETE para CRUD

Dashboards / Agregaciones
Método	URL	Descripción
GET	/api/v1/dashboard/balance-mensual	Retorna balance mensual agregado
GET	/api/v1/dashboard/gastos-por-categoria	Retorna total de gastos agrupados por categoría
GET	/api/v1/dashboard/flujo-efectivo	Retorna ingresos - gastos por mes

Query params: mes, anio, categoria

3. Autenticación y Autorización

Inicialmente no se requiere (uso personal)

Para futuro multiusuario: JWT + refresh tokens

Roles posibles: usuario (propietario), admin (solo si se agrega multiusuario)

Rate limiting opcional: 1000 requests/día por usuario

4. Manejo de errores

Formato estándar de error:

{
  "status": 400,
  "code": "INVALID_AMOUNT",
  "message": "El monto ingresado debe ser mayor que cero"
}


status → HTTP status code

code → código interno de error

message → mensaje legible para el usuario

5. Performance y escalabilidad

Paginación: limit y offset

Filtrado y ordenamiento: query params (fechaInicio, fechaFin, categoria, sort)

Caching: HTTP cache headers en GET para dashboards

Bulk operations: no aplicable actualmente (single user)

Optimización MongoDB: índices en fecha, categoria, tipo

6. Documentación

OpenAPI 3.0 Specification para todos los endpoints

Ejemplos de request/response incluidos

SDK sugerido: axios para JS frontend

Se puede exportar colección Postman con todos los endpoints

---

*Documento generado automáticamente por MUDAI - Gestor de Proyectos*
