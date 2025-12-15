# Cómo añadir una nueva cuenta de MongoDB Atlas al programa

Sigue estos pasos sencillos para conectar tu base de datos MongoDB Atlas:

---

## 1. Crea una cuenta en MongoDB Atlas
- Ve a https://www.mongodb.com/cloud/atlas/register
- Regístrate y crea un nuevo proyecto.

## 2. Crea un clúster
- En tu panel de Atlas, haz clic en "Build a Database" y sigue los pasos para crear un clúster gratuito.

## 3. Añade un usuario de base de datos
- Ve a "Database Access" > "Add New Database User".
- Elige un nombre de usuario y contraseña.
- Da permisos de lectura y escritura.

## 4. Permite el acceso desde tu IP
- Ve a "Network Access" > "Add IP Address".
- Añade tu IP pública o selecciona "Allow access from anywhere" (0.0.0.0/0).

## 5. Copia la cadena de conexión
- Ve a "Clusters" > "Connect" > "Connect your application".
- Copia la cadena que empieza por `mongodb+srv://...`

## 6. Configura el backend del programa
- Abre el archivo `backend/config/database.js`.
- Busca la variable `MONGO_URI`.
- Pega tu cadena de conexión en esa variable:

```js
const MONGO_URI = 'mongodb+srv://USUARIO:CONTRASEÑA@CLUSTER.mongodb.net/NOMBRE_BASE?retryWrites=true&w=majority';
```

- Guarda los cambios.

## 7. Reinicia el backend
- Detén y vuelve a iniciar el servidor backend para aplicar la nueva configuración.

---

¡Listo! Tu programa ahora usará la nueva cuenta de MongoDB Atlas.
