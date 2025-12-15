# 💰 Aplicación de Finanzas Personales

Aplicación web completa para gestión de finanzas personales desarrollada con JavaScript vanilla, HTML y CSS. Permite controlar gastos, ingresos, deudas, préstamos y patrimonio con dashboards interactivos.

## ✨ Características

- 📊 **Dashboard interactivo** con gráficos en tiempo real
- 💸 **Gestión de gastos** por categorías
- 💰 **Gestión de ingresos** por tipo
- 💳 **Control de deudas** con alertas de vencimiento
- 💵 **Seguimiento de préstamos** a terceros
- 🏦 **Cálculo de patrimonio neto** (activos - pasivos)
- 📈 **Gráficos interactivos** con Chart.js
- 💾 **Persistencia local** con localStorage
- 🔄 **Sistema de sincronización** offline/online
- 📱 **Diseño responsive** para móviles y tablets

## 🚀 Inicio Rápido

### 1. Clonar o descargar el proyecto

```bash
cd FINANZAS_V1
```

### 2. Abrir la aplicación

Simplemente abre el archivo `index.html` en tu navegador preferido:

- **Opción 1:** Doble clic en `index.html`
- **Opción 2:** Arrastrar `index.html` al navegador
- **Opción 3:** Usar un servidor local (recomendado):

```bash
# Si tienes Python instalado
python -m http.server 8000

# Si tienes Node.js instalado
npx http-server
```

Luego visita: `http://localhost:8000`

### 3. ¡Listo!

La aplicación se cargará con datos de ejemplo para que puedas probar todas las funcionalidades.

## 📁 Estructura del Proyecto

```
FINANZAS_V1/
├── index.html                 # Página principal
├── css/
│   ├── main.css              # Estilos principales
│   ├── dashboard.css         # Estilos del dashboard
│   └── forms.css             # Estilos de formularios
├── js/
│   ├── app.js                # Punto de entrada
│   ├── config/
│   │   └── mongodb.js        # Configuración MongoDB
│   ├── models/               # Modelos de datos
│   │   ├── gasto.js
│   │   ├── ingreso.js
│   │   ├── deuda.js
│   │   ├── prestamo.js
│   │   └── patrimonio.js
│   ├── controllers/          # Controladores
│   │   ├── gastosController.js
│   │   ├── ingresosController.js
│   │   ├── deudasController.js
│   │   ├── prestamosController.js
│   │   └── patrimonioController.js
│   ├── services/             # Servicios
│   │   ├── cacheService.js
│   │   ├── syncService.js
│   │   └── validationService.js
│   ├── utils/                # Utilidades
│   │   ├── logger.js
│   │   ├── calculations.js
│   │   └── router.js
│   └── views/
│       └── dashboardView.js  # Vista del dashboard
├── CONTEXT/                   # Documentación del proyecto
└── README.md                 # Este archivo
```

## 📖 Uso de la Aplicación

### Dashboard Principal

El dashboard muestra:
- Resumen financiero del mes actual
- Gráficos de flujo de efectivo (6 meses)
- Gastos por categoría
- Comparación ingresos vs gastos
- Estado del patrimonio neto
- Transacciones recientes

### Gestión de Gastos

1. Click en **"Gastos"** en el menú
2. Click en **"➕ Nuevo Gasto"**
3. Completa el formulario:
   - Fecha
   - Monto
   - Categoría (Comida, Transporte, Ocio, etc.)
   - Descripción (opcional)
4. Click en **"Guardar"**

**Categorías disponibles:**
- 🍽️ Comida
- 🚗 Transporte
- 🎮 Ocio
- 💊 Salud
- 📚 Educación
- 🏠 Vivienda
- 💡 Servicios
- 📦 Otros

### Gestión de Ingresos

1. Click en **"Ingresos"**
2. Click en **"➕ Nuevo Ingreso"**
3. Completa el formulario:
   - Fecha
   - Monto
   - Tipo (Salario, Freelance, Venta, etc.)
   - Descripción (opcional)
4. Click en **"Guardar"**

### Gestión de Deudas

1. Click en **"Deudas"**
2. Click en **"➕ Nueva Deuda"**
3. Completa:
   - Acreedor
   - Monto inicial
   - Monto pendiente
   - Fecha inicio
   - Fecha vencimiento (opcional)
4. Usa el botón **"💰 Pago"** para registrar pagos parciales

### Gestión de Préstamos

1. Click en **"Préstamos"**
2. Click en **"➕ Nuevo Préstamo"**
3. Completa:
   - Persona
   - Monto prestado
   - Monto pendiente
   - Fecha del préstamo
   - Fecha de devolución (opcional)
4. Usa **"💰 Cobro"** para registrar devoluciones parciales

### Gestión de Patrimonio

1. Click en **"Patrimonio"**
2. Gestiona **Activos** (propiedades, ahorros, vehículos)
3. Gestiona **Pasivos** (hipotecas, préstamos bancarios)
4. El patrimonio neto se calcula automáticamente:
   - **Patrimonio Neto = Activos - Pasivos - Deudas**

## 🔧 Configuración Avanzada

### Integrar con MongoDB Atlas (Opcional)

Por defecto, la aplicación usa localStorage para almacenamiento local. Para sincronizar con MongoDB Atlas:

1. Crea una cuenta gratuita en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster gratuito
3. Obtén tu connection string
4. Edita `js/config/mongodb.js`:

```javascript
const MongoDBConfig = {
  connectionString: 'tu_connection_string_aqui',
  database: 'finanzas_personales',
  // ...
};
```

5. Implementa las llamadas API según la [documentación de MongoDB](https://www.mongodb.com/docs/atlas/api/)

### Personalización de Estilos

Los estilos están en archivos CSS separados:

- **Variables CSS:** Modifica `:root` en `css/main.css`
- **Colores:** Cambia las variables `--primary-color`, `--secondary-color`, etc.
- **Fuentes:** Modifica `font-family` en `body`

### Exportar Datos

Los datos se almacenan en localStorage. Para hacer backup:

1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Application" o "Almacenamiento"
3. Busca "Local Storage"
4. Copia los datos que empiecen con `finanzas_`

Para importar:
1. Pega los datos en localStorage del nuevo dispositivo

## 🎨 Tecnologías Utilizadas

- **Frontend:** HTML5, CSS3, JavaScript ES6+
- **Gráficos:** Chart.js 4.4.0
- **Almacenamiento:** localStorage
- **Patrón:** MVC (Model-View-Controller)
- **Arquitectura:** SPA (Single Page Application) con hash routing
- **No requiere:** Node.js, npm, ni build tools

## 📊 Arquitectura

La aplicación sigue el patrón **MVC** y principios de **Clean Architecture**:

### Modelos
Gestionan la lógica de datos y persistencia

### Controladores
Orquestan la interacción entre modelos y vistas

### Vistas
Renderizar la interfaz de usuario

### Servicios
- **CacheService:** Gestión de localStorage
- **SyncService:** Sincronización offline/online
- **ValidationService:** Validación de datos

### Utilidades
- **Router:** Navegación SPA
- **Calculations:** Cálculos financieros
- **Logger:** Sistema de logs

## 🔒 Privacidad y Seguridad

- **Datos locales:** Toda la información se almacena en tu navegador
- **Sin backend:** No hay servidor que almacene tus datos
- **Sin autenticación:** Diseñado para uso personal
- **Sin tracking:** No se envían datos a terceros

## 🐛 Solución de Problemas

### Los gráficos no se muestran

- Verifica que tienes conexión a internet (Chart.js se carga desde CDN)
- Revisa la consola del navegador (F12) por errores

### Los datos no se guardan

- Verifica que localStorage esté habilitado en tu navegador
- Comprueba que no estés en modo incógnito
- Algunos navegadores limitan el espacio de localStorage

### La aplicación está en blanco

- Abre la consola (F12) y busca errores
- Verifica que todos los archivos JS estén cargados
- Prueba en otro navegador

## 📝 Estándares de Código

El código sigue las convenciones definidas en `CONTEXT/agents.md`:

- **Variables y funciones:** camelCase
- **Constantes:** UPPER_SNAKE_CASE
- **IDs y clases HTML/CSS:** kebab-case
- **Indentación:** 2 espacios
- **Longitud de línea:** 100 caracteres
- **Comillas:** simples para strings

## 🎯 Roadmap Futuro

- [ ] Exportar datos a CSV/Excel
- [ ] Filtros avanzados en todas las vistas
- [ ] Modo oscuro
- [ ] Recordatorios de vencimientos
- [ ] Presupuestos por categoría
- [ ] Integraciones bancarias (OpenBanking)
- [ ] Aplicación PWA (Progressive Web App)
- [ ] Multi-idioma
- [ ] Multi-usuario con backend

## 📄 Licencia

Este proyecto es de uso personal y educativo. Puedes modificarlo y adaptarlo a tus necesidades.

## 👨‍💻 Desarrollo

Desarrollado siguiendo las especificaciones del proyecto documentadas en la carpeta `CONTEXT/`.

### Comandos Útiles

```bash
# Limpiar caché del navegador
# Chrome: Ctrl + Shift + Delete
# Firefox: Ctrl + Shift + Delete

# Reiniciar datos de ejemplo
# En la consola del navegador:
localStorage.clear()
location.reload()
```

## 🤝 Contribuciones

Este es un proyecto personal, pero las sugerencias son bienvenidas.

## 📞 Soporte

Si encuentras algún problema:
1. Revisa la consola del navegador (F12)
2. Verifica que todos los archivos estén en su lugar
3. Prueba en modo incógnito
4. Prueba en otro navegador

---

**¡Disfruta gestionando tus finanzas personales! 💰📊**
