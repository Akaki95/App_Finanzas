# 🚀 BACKEND NODE.JS + MONGODB ATLAS

## ✅ Implementación Completada

Tu aplicación ahora usa un backend Node.js que se conecta a MongoDB Atlas.

---

## 📋 CONFIGURACIÓN INICIAL

### 1. Configurar la cadena de conexión

1. Abre el archivo `backend/.env`
2. Reemplaza `<db_password>` con tu contraseña real de MongoDB Atlas:
   ```
   MONGODB_URI=mongodb+srv://finanzas_alondra_akaki:TU_PASSWORD_AQUI@finanzas.7t2rx6a.mongodb.net/?appName=Finanzas
   ```

### 2. Instalar dependencias

Abre una terminal en la carpeta del proyecto y ejecuta:
```powershell
cd backend
npm install
```

---

## 🚀 INICIAR LA APLICACIÓN

### Opción 1: Script automático (Recomendado)
Haz doble clic en: **`iniciar_aplicacion.bat`**

Este script:
- Instala dependencias si es necesario
- Inicia el backend en `http://localhost:3000`
- Inicia el frontend en `http://localhost:8888`
- Abre el navegador automáticamente

### Opción 2: Manual

**Terminal 1 - Backend:**
```powershell
cd backend
node server.js
```

**Terminal 2 - Frontend:**
```powershell
python -m http.server 8888
```

Luego abre: `http://localhost:8888`

---

## 🔄 FUNCIONAMIENTO

### Al iniciar la app:
1. El frontend carga datos desde MongoDB Atlas a través del backend
2. Los datos se cachean en localStorage para modo offline
3. Verás en la consola: "Backend conectado correctamente"

### Al crear/editar/eliminar:
1. El frontend envía la petición al backend
2. El backend guarda en MongoDB Atlas
3. El frontend actualiza localStorage
4. Todo queda sincronizado

### Modo offline:
- Si el backend no está disponible, usa localStorage
- Las operaciones se guardan en cola
- Se sincronizan cuando el backend vuelve a estar disponible

---

## 📊 API ENDPOINTS

### Gastos
- `GET /api/gastos` - Obtener todos
- `POST /api/gastos` - Crear nuevo
- `PUT /api/gastos/:id` - Actualizar
- `DELETE /api/gastos/:id` - Eliminar

### Ingresos
- `GET /api/ingresos` - Obtener todos
- `POST /api/ingresos` - Crear nuevo
- `PUT /api/ingresos/:id` - Actualizar
- `DELETE /api/ingresos/:id` - Eliminar

### Deudas
- `GET /api/deudas` - Obtener todos
- `POST /api/deudas` - Crear nueva
- `PUT /api/deudas/:id` - Actualizar
- `DELETE /api/deudas/:id` - Eliminar
- `POST /api/deudas/:id/pagar` - Registrar pago

### Préstamos
- `GET /api/prestamos` - Obtener todos
- `POST /api/prestamos` - Crear nuevo
- `PUT /api/prestamos/:id` - Actualizar
- `DELETE /api/prestamos/:id` - Eliminar
- `POST /api/prestamos/:id/cobrar` - Registrar cobro

### Patrimonio
- `GET /api/patrimonio/activos` - Obtener activos
- `POST /api/patrimonio/activos` - Crear activo
- `PUT /api/patrimonio/activos/:id` - Actualizar activo
- `DELETE /api/patrimonio/activos/:id` - Eliminar activo
- `GET /api/patrimonio/pasivos` - Obtener pasivos
- `POST /api/patrimonio/pasivos` - Crear pasivo
- `PUT /api/patrimonio/pasivos/:id` - Actualizar pasivo
- `DELETE /api/patrimonio/pasivos/:id` - Eliminar pasivo

---

## 🔍 VERIFICAR QUE TODO FUNCIONA

### En la consola del navegador (F12):
✅ Deberías ver:
```
✓ SyncService inicializado con backend Node.js
✓ Backend conectado correctamente
✓ Modelos inicializados correctamente
✓ 0 gastos cargados desde el backend
✓ 0 ingresos cargados desde el backend
...
```

### En MongoDB Atlas:
1. Ve a tu cluster > Browse Collections
2. Base de datos: `finanzas`
3. Colecciones: `gastos`, `ingresos`, `deudas`, `prestamos`, `activos`, `pasivos`
4. Los datos deberían aparecer ahí al crear/editar

---

## 🛠️ SOLUCIÓN DE PROBLEMAS

### "Backend no disponible - usando modo offline"
- Verifica que el backend esté corriendo en http://localhost:3000
- Ejecuta `iniciar_aplicacion.bat` de nuevo

### "Error conectando a MongoDB"
- Verifica la cadena de conexión en `backend/.env`
- Asegúrate de que la contraseña sea correcta
- Verifica que tu IP esté permitida en MongoDB Atlas (Network Access)

### "Cannot find module"
- Instala las dependencias: `cd backend && npm install`

### Los datos no se guardan en Atlas
- Verifica la consola del navegador para ver errores
- Verifica la consola del backend para ver logs
- Asegúrate de que el backend esté conectado a Atlas

---

## 📱 ACCESO DESDE MÓVIL (misma red WiFi)

1. Averigua la IP de tu PC: `ipconfig` (busca IPv4 Address)
2. Actualiza `js/services/syncService.js`:
   ```javascript
   apiBaseUrl: 'http://TU-IP-LOCAL:3000/api'
   ```
3. En tu móvil, abre: `http://TU-IP-LOCAL:8888`

---

## 🌐 DESPLIEGUE EN LA NUBE (Opcional)

Si quieres acceder desde cualquier lugar:

1. **Backend:** Despliega en Railway, Render, o Heroku
2. **Frontend:** Despliega en GitHub Pages, Netlify, o Vercel
3. Actualiza `apiBaseUrl` en `syncService.js` con la URL del backend desplegado

---

✨ **¡Disfruta de tu app de finanzas personales con sincronización en la nube!** 💰📊
