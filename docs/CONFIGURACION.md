# Configuración — NOCTURNA

Variables de entorno y servicios externos.

---

## Backend — `backend/midnightcode/.env`

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=mysql://root:TuPassword@localhost:3306/midnightcode
JWT_SECRET=cadena_aleatoria_minimo_64_caracteres
FRONTEND_URL=http://localhost:5173

# Email (opcional en dev — usa Ethereal automáticamente si no está configurado)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu@gmail.com
SMTP_PASS=tu_app_password_16_chars

# Google OAuth
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com

# YouTube API
YOUTUBE_API_KEY=AIzaSy...
```

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `DATABASE_URL` | ✅ | Conexión a MariaDB |
| `JWT_SECRET` | ✅ | Mínimo 64 chars aleatorios |
| `FRONTEND_URL` | ✅ | Para CORS y links en emails |
| `SMTP_*` | No* | Sin configurar → Ethereal en dev |
| `GOOGLE_CLIENT_ID` | No* | Para login con Google |
| `YOUTUBE_API_KEY` | No* | Para búsqueda en panel DJ |

---

## Frontend — `Fronted/.env`

```env
VITE_API_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

---

## Configurar Google OAuth

1. Ve a [console.cloud.google.com](https://console.cloud.google.com)
2. Crea un proyecto → **APIs y servicios → Credenciales**
3. **+ Crear credenciales → ID de cliente OAuth**
4. Tipo: **Aplicación web**
5. Orígenes JS autorizados: `http://localhost:5173`
6. Copia el Client ID

```env
# backend/.env y Fronted/.env — mismo valor
GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
```

Verifica que `index.html` tenga:
```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

---

## Configurar Email (Gmail)

Gmail requiere **contraseña de aplicación** (no tu contraseña normal):

1. [myaccount.google.com](https://myaccount.google.com) → Seguridad
2. Verificación en 2 pasos → **Contraseñas de aplicaciones**
3. App: Correo | Dispositivo: Otro → "NOCTURNA"
4. Copia la clave de 16 caracteres

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
```

> **En desarrollo sin SMTP:** el sistema usa Ethereal automáticamente y devuelve `devResetLink` y `devEmailPreview` en la respuesta del API.

---

## Configurar YouTube API

1. En Google Cloud Console → **APIs y servicios → Biblioteca**
2. Habilitar **YouTube Data API v3**
3. **Credenciales → + Crear → Clave de API**

> Cuota gratuita: 10,000 unidades/día (~100 búsquedas).

---

## Generar JWT_SECRET seguro

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Dev vs Producción

| Comportamiento | development | production |
|----------------|-------------|------------|
| Email fallback Ethereal | ✅ Auto | ❌ Error si no hay SMTP |
| `devResetLink` en respuesta | ✅ | ❌ |
| Stack trace en errores | ✅ | ❌ |
| Rate limiting global | Desactivado | 200 req/15min |
