# Diseño de Base de Datos

**Fase:** Diseño del Sistema
**Proyecto:** FINANZAS
**Fecha de generación:** 2025-11-29 20:34:36

---

Modelo Conceptual en MongoDB

Colecciones principales y documentos:

gastos

{
  "_id": ObjectId,
  "fecha": ISODate,
  "monto": 50.0,
  "descripcion": "Cena",
  "categoria": "Comida"
}


ingresos

{
  "_id": ObjectId,
  "fecha": ISODate,
  "monto": 1000.0,
  "descripcion": "Salario",
  "tipo": "Salario"
}


deudas

{
  "_id": ObjectId,
  "acreedor": "Banco XYZ",
  "monto_inicial": 5000.0,
  "monto_pendiente": 2000.0,
  "fecha_inicio": ISODate
}


prestamos

{
  "_id": ObjectId,
  "persona": "Amigo",
  "monto_inicial": 200.0,
  "monto_pendiente": 50.0,
  "fecha_prestamo": ISODate,
  "fecha_devolucion": ISODate
}


activos

{
  "_id": ObjectId,
  "nombre": "Coche",
  "valor": 10000.0
}


pasivos

{
  "_id": ObjectId,
  "nombre": "Préstamo Hipotecario",
  "valor": 50000.0
}

Decisiones de diseño

Colecciones separadas por tipo de dato:

Facilita queries específicas, agregaciones y filtrado.

No anidamos demasiados documentos:

Cada gasto, ingreso, deuda, préstamo es un documento independiente.

Categorías y tipos de ingreso se pueden almacenar como valores de string por simplicidad (no es necesario otra colección por ahora).

Índices recomendados:

gastos.fecha y gastos.categoria

ingresos.fecha y ingresos.tipo

deudas.monto_pendiente

prestamos.monto_pendiente

Agregaciones y dashboards:

Usar MongoDB Aggregation Framework para sumar gastos por categoría, generar balances mensuales y flujos de efectivo.

Se puede crear views si quieres consultas pre-agregadas para dashboards.

Escalabilidad futura:

Cada documento incluye _id único.

Para multiusuario, simplemente agregar usuario_id a cada documento.

MongoDB maneja sharding y réplicas automáticamente si se migra a un uso más intenso.

---

*Documento generado automáticamente por MUDAI - Gestor de Proyectos*
