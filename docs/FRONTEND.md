# Frontend — NOCTURNA

React 19 + Vite 7 SPA. Código en `Fronted/src/`.

---

## Estructura de Carpetas

```
Fronted/src/
├── App.jsx                    ← Router con todas las rutas (lazy loading)
├── main.jsx                   ← Punto de entrada, monta providers
├── assets/css/style.css       ← Clases globales: glass, neon-glow, bar-anim…
│
├── components/
│   ├── auth/
│   │   ├── PrivateRoute.jsx   ← Protege rutas privadas por rol
│   │   └── PublicRoute.jsx    ← Redirige a panel si ya hay sesión
│   ├── layout/
│   │   ├── Navbar.jsx         ← Navbar con scroll suave y menú móvil
│   │   ├── Footer.jsx
│   │   └── AuthFooter.jsx
│   ├── sections/              ← Secciones de la landing page
│   │   ├── Hero.jsx           ← Hero con parallax, countdown y visualizador
│   │   ├── LiveActs.jsx       ← Eventos desde la API con fallback
│   │   ├── Experience.jsx
│   │   ├── MenuPreview.jsx
│   │   ├── StatsSection.jsx
│   │   ├── Testimonials.jsx
│   │   ├── VipGallery.jsx
│   │   ├── WhyJoin.jsx
│   │   ├── CTA.jsx
│   │   └── Location.jsx
│   └── ui/
│       ├── InputField.jsx
│       ├── PasswordInput.jsx
│       ├── NeonDashboard.jsx
│       └── WelcomeModal.jsx
│
├── context/
│   ├── AuthContext.jsx        ← Estado global de auth + roleRedirect
│   └── SongContext.jsx        ← Estado global de la cola de canciones
│
├── pages/
│   ├── public/
│   │   ├── Home.jsx
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── ForgotPasswordPage.jsx
│   │   └── ResetPasswordPage.jsx
│   └── Private/
│       ├── Admin/Dashboard.jsx
│       ├── DJ/DJPanel.jsx
│       ├── Employee/EmployeeDashboard.jsx
│       └── User/Dashboard.jsx
│
└── services/
    ├── api.js           ← Axios con JWT automático + errores amigables
    ├── publicApi.js     ← Axios sin auth (login, register, eventos públicos)
    └── authService.js   ← Funciones: login, register, googleLogin, resetPassword…
```

---

## Rutas

| Ruta | Componente | Protección |
|------|-----------|------------|
| `/` | Home | Pública |
| `/login` | LoginPage | Solo no-autenticados |
| `/register` | SignupPage | Solo no-autenticados |
| `/forgot-password` | ForgotPasswordPage | Solo no-autenticados |
| `/reset-password` | ResetPasswordPage | Solo no-autenticados |
| `/admin` | AdminDashboard | Rol: admin |
| `/dashboard` | UserDashboard | Rol: usuario |
| `/dj` | DJPanel | Rol: dj |
| `/empleado` | EmployeeDashboard | Roles: empleado, inventario |

---

## AuthContext

Proveedor global de autenticación. Importar con `useAuth()`.

```jsx
const { user, login, logout, register, googleLogin, loading, authError, clearError } = useAuth();
```

| Valor | Descripción |
|-------|-------------|
| `user` | Objeto con id, nombre, email, role — o `null` |
| `loading` | `true` mientras hay operación de auth en curso |
| `authError` | Mensaje de error o `null` |

**`roleRedirect(role)`** — mapea rol a ruta:
```javascript
roleRedirect("admin")      // → "/admin"
roleRedirect("dj")         // → "/dj"
roleRedirect("empleado")   // → "/empleado"
roleRedirect("inventario") // → "/empleado"
roleRedirect("usuario")    // → "/dashboard"
```

Al montar la app, si hay token en localStorage hace `GET /auth/me` para verificar el rol actual. Muestra un spinner (`initializing`) hasta que resuelve, evitando que `PrivateRoute` vea un rol desactualizado.

---

## Servicios HTTP

### `api.js` — autenticado
- Agrega `Authorization: Bearer <token>` automáticamente
- Ante un 401 limpia localStorage y redirige a `/login`
- Mensajes de error en español para todos los códigos HTTP

### `publicApi.js` — sin auth
- Para rutas que no requieren token: login, register, eventos públicos

### `authService.js`
```javascript
loginRequest({ email, password })         // → guarda token en localStorage
registerRequest({ docId, name, email, password })
logoutRequest()                           // → limpia localStorage
googleLoginRequest(idToken)
authService.forgotPassword(email)         // → { devResetLink, devEmailPreview } en dev
authService.resetPassword(token, nuevaPassword)
getStoredUser()                           // → lee neon_user de localStorage
```

---

## Guardas de Rutas

### PrivateRoute
```jsx
<PrivateRoute role="admin">          // un rol
<PrivateRoute role={["empleado","inventario"]}>  // array de roles
```

Flujo:
1. ¿`initializing`? → spinner
2. ¿Sin `user`? → redirige a `/login`
3. ¿Rol incorrecto? → redirige al panel del usuario
4. Renderiza children

### PublicRoute
Si ya hay sesión activa → redirige a `roleRedirect(user.role)` automáticamente.

---

## Variables de Entorno

Archivo `Fronted/.env`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

> Todas las variables DEBEN empezar con `VITE_`. Se leen con `import.meta.env.VITE_NOMBRE`.

---

## Clases CSS Globales

| Clase | Efecto |
|-------|--------|
| `glass` | Fondo oscuro translúcido con blur |
| `neon-glow` | Sombra de luz neón púrpura |
| `text-glow` | Texto con resplandor neón |
| `glass-panel` | Panel con borde primario sutil |
| `bar-anim` | Animación de barra de ecualizador |
| `status-dot` | Pulso verde para indicador de estado |
