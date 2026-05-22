# Arquitectura del Sistema — NOCTURNA

Este documento explica cómo está construido el sistema, cómo fluyen los datos entre sus partes y los patrones de diseño que se usan.

---

## Tabla de Contenidos

- [Visión General](#visión-general)
- [Capas de la Aplicación](#capas-de-la-aplicación)
- [Flujo de una Petición HTTP](#flujo-de-una-petición-http)
- [Sistema de Autenticación JWT](#sistema-de-autenticación-jwt)
- [Comunicación en Tiempo Real (Socket.io)](#comunicación-en-tiempo-real-socketio)
- [Seguridad](#seguridad)
- [Tareas Programadas (Cron Jobs)](#tareas-programadas-cron-jobs)
- [Sistema de Auditoría](#sistema-de-auditoría)
- [Patrón de Capas del Backend](#patrón-de-capas-del-backend)

---

## Visión General

El sistema es una aplicación **cliente-servidor** con las siguientes características:

- **Frontend**: React SPA (Single Page Application) — toda la UI se renderiza en el navegador
- **Backend**: API REST en Express — procesa la lógica, accede a la BD y maneja WebSockets
- **Base de datos**: MariaDB — almacena todos los datos de forma persistente
- **Tiempo real**: Socket.io — notifica a los clientes cuando algo cambia sin que tengan que preguntar

```
CLIENTE ──────── HTTPS/REST ──────────► SERVIDOR
        ◄─────── JSON ◄──────────────

CLIENTE ──────── WebSocket ───────────► SERVIDOR
        ◄─────── Eventos ◄────────────
```

---

## Capas de la Aplicación

### Backend — 4 capas bien definidas

```
┌─────────────────────────────────────────┐
│           ROUTES (src/routes/)          │
│   Define las URLs y qué método HTTP     │
│   aplica a cada una. No tiene lógica.   │
├─────────────────────────────────────────┤
│       CONTROLLERS (src/controllers/)    │
│   Recibe el request, extrae los datos   │
│   (body, params, query), llama al       │
│   service y envía la respuesta JSON.    │
├─────────────────────────────────────────┤
│        SERVICES (src/services/)         │
│   AQUÍ VIVE LA LÓGICA DE NEGOCIO.       │
│   Valida datos, aplica reglas,          │
│   coordina repositorios.                │
├─────────────────────────────────────────┤
│     REPOSITORIES (src/repositories/)   │
│   Sólo habla con la base de datos via  │
│   Prisma. Sin lógica de negocio.        │
└─────────────────────────────────────────┘
             │
             ▼
      BASE DE DATOS (MariaDB)
```

**¿Por qué esta separación?**
- Facilita los tests unitarios (puedes testear cada capa por separado)
- Si cambias de base de datos, solo tocas los repositorios
- Si cambia una regla de negocio, solo tocas el service
- El controller queda limpio y fácil de leer

### Ejemplo práctico — Crear una venta

```
POST /api/ventas
    │
    ▼
ventaRoutes.js          → "esta URL existe y usa roleMiddleware"
    │
    ▼
ventaController.js      → extrae req.body, llama a ventaService.crear()
    │
    ▼
ventaService.js         → valida stock, calcula total, maneja transacción
    │
    ▼
ventaRepository.js      → prisma.venta.create({ data: ... })
productoRepository.js   → prisma.producto.update({ stock: stock - cantidad })
```

---

## Flujo de una Petición HTTP

### Petición sin autenticación (ruta pública)

```
Cliente: GET /api/eventos
    │
    ▼
app.js: Helmet (headers seguridad) → CORS → Rate Limit → JSON parser
    │
    ▼
eventoRoutes.js: router.get('/', controller.listar)
    │
    ▼
eventoController.js: llama a eventoService.listar()
    │
    ▼
eventoService.js: aplica filtros
    │
    ▼
Prisma: SELECT * FROM Evento WHERE activo = true
    │
    ▼
Respuesta JSON: { success: true, data: [...] }
```

### Petición con autenticación (ruta protegida)

```
Cliente: GET /api/usuarios/me
  Header: Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
    │
    ▼
authMiddleware.js:
  1. Extrae el token del header
  2. Busca en TokenBlacklist → si está, rechaza (401)
  3. Verifica firma JWT con JWT_SECRET
  4. Consulta BD: SELECT cod_rol FROM Usuario WHERE doc_identidad = ?
     (para tener el rol actualizado, no el del token que puede estar desactualizado)
  5. Asigna req.user = { id, rol }
    │
    ▼
usuarioController.js → usuarioService.getMe(req.user.id)
    │
    ▼
Respuesta: { success: true, user: { nombre, email, role, ... } }
```

---

## Sistema de Autenticación JWT

### ¿Qué es un JWT?

Un JWT (JSON Web Token) es un string codificado en base64 que tiene 3 partes separadas por puntos:

```
eyJhbGciOiJIUzI1NiJ9 . eyJpZCI6MTIzLCJyb2wiOjN9 . SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
      HEADER                    PAYLOAD                         FIRMA
   (algoritmo)            (datos del usuario)          (verifica autenticidad)
```

El payload contiene:
```json
{
  "id": 1001,
  "rol": 3,
  "iat": 1714000000,
  "exp": 1714028800
}
```

### Ciclo de vida del token

```
1. Login exitoso
   → Backend genera JWT con jwt.sign({ id, rol }, JWT_SECRET, { expiresIn: '8h' })
   → Frontend guarda en localStorage: "neon_token"

2. Peticiones autenticadas
   → Frontend agrega: Authorization: Bearer <token>
   → Backend lo verifica en cada petición

3. Logout
   → Token se agrega a TokenBlacklist en BD
   → Aunque el token siga siendo válido criptográficamente, se rechaza

4. Expiración
   → JWT deja de ser válido después de 8 horas
   → Frontend detecta 401 y redirige a login
```

### Manejo de cambios de rol en tiempo real

```javascript
// authMiddleware.js — se ejecuta en CADA petición
const decoded = jwt.verify(token, process.env.JWT_SECRET);

const dbUser = await prisma.usuario.findUnique({
  where:  { doc_identidad: decoded.id },
  select: { cod_rol: true },
});

req.user = { ...decoded, rol: dbUser.cod_rol };
// Así el rol siempre está actualizado, incluso sin re-login
```

---

## Comunicación en Tiempo Real (Socket.io)

| Evento | Quién lo emite | Cuándo |
|--------|---------------|--------|
| `colaCanciones` | cancionService | Cuando cambia la cola de canciones |
| `actualizarProductos` | productoController | CRUD de productos |
| `actualizarVentas` | ventaService | Nueva venta o pago |
| `actualizarEventos` | eventoService | CRUD de eventos |
| `actualizarHorarios` | horarioService | CRUD de horarios |
| `actualizarUsuarios` | authService | Nuevo registro |
| `reserva_creada` | reservaService | Nueva reserva |
| `mesa_bloqueada` | reservaService | Mesa ocupada temporalmente |

**Backend — emitir evento:**
```javascript
if (global.io) {
  global.io.emit('actualizarProductos');
}
```

**Frontend — escuchar evento:**
```javascript
useEffect(() => {
  const socket = io('http://localhost:3000', {
    auth: { token: localStorage.getItem('neon_token') },
    transports: ['websocket', 'polling'],
  });
  socket.on('actualizarProductos', () => fetchProductos());
  return () => socket.disconnect();
}, []);
```

---

## Seguridad

```
Internet
   │
   ▼
Helmet                    ← HTTP headers seguros
   │
   ▼
CORS                      ← Solo permite orígenes conocidos
   │
   ▼
Rate Limiting             ← 200 req/15min global | 20 intentos login/15min
   │
   ▼
JSON Body Parser          ← Máximo 2MB por request
   │
   ▼
authMiddleware            ← Verifica JWT + blacklist + rol actualizado
   │
   ▼
roleMiddleware            ← Verifica que el rol tenga permiso
   │
   ▼
Controller / Service
```

| Ataque | Protección |
|--------|------------|
| Brute force login | Rate limit 20/15min en /auth/* |
| XSS | Helmet + React escapa HTML |
| CSRF | JWT en header (no cookie) |
| SQL Injection | Prisma usa queries parametrizados |
| Token robado | Blacklist en BD al logout |
| Rol alterado | Se consulta BD en cada request |

---

## Tareas Programadas (Cron Jobs)

### 1. Expiración de Reservas — cada 1 minuto

```javascript
cron.schedule('* * * * *', async () => {
  // Busca reservas Pendiente con fecha_expiracion vencida
  // Las marca como Cancelada
  // Libera mesas y parqueaderos
});
```

### 2. Limpieza de Cola de Canciones — 6:00 AM diario

```javascript
cron.schedule('0 6 * * *', async () => {
  // Elimina TODAS las canciones de la BD
  // Emite Socket colaCanciones con lista vacía
});
```

---

## Sistema de Auditoría

```javascript
// auditoriaMiddleware.js
app.use(async (req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    await prisma.auditoria.create({
      data: {
        tabla_afectada:   req.path,
        accion:           { POST: 'INSERT', PUT: 'UPDATE', PATCH: 'UPDATE', DELETE: 'DELETE' }[req.method],
        usuario_afectado: req.user?.id || null,
        descripcion:      JSON.stringify(req.body).substring(0, 500),
      },
    });
  }
  next();
});
```

---

## Patrón de Capas del Backend

**INCORRECTO — lógica en el controller:**
```javascript
async crear(req, res) {
  const producto = await prisma.producto.findUnique({ where: { id } });
  if (producto.stock < cantidad) return res.status(400).json({ error: 'Sin stock' });
}
```

**CORRECTO — lógica en el service:**
```javascript
// controller
async crear(req, res, next) {
  try {
    const result = await ventaService.crear(req.body, req.user);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

// service
async crear(data, usuario) {
  const producto = await productoRepository.findById(data.productoId);
  if (producto.stock < data.cantidad) throw new Error('Stock insuficiente');
}
```
