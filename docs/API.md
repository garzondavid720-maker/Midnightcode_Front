# API Reference — NOCTURNA

Base URL: `http://localhost:3000/api`

---

## Convenciones

**Respuesta exitosa:** `{ "success": true, "data": { ... } }`  
**Error:** `{ "success": false, "message": "Descripción" }`  
**Auth header:** `Authorization: Bearer <token>`

---

## Autenticación — `/api/auth`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/auth/login` | No | Login con email + contraseña |
| POST | `/auth/register` | No | Registro nuevo usuario |
| POST | `/auth/google` | No | Login/registro con Google OAuth |
| POST | `/auth/forgot-password` | No | Envía email de recuperación |
| POST | `/auth/reset-password` | No | Establece nueva contraseña |
| GET | `/auth/me` | Sí | Datos del usuario autenticado |
| POST | `/auth/logout` | Sí | Invalida el token actual |

### POST `/auth/login`
```json
// Request
{ "email": "juan@ejemplo.com", "password": "miPass123" }

// Response 200
{ "success": true, "token": "eyJ...", "user": { "id": 1001, "nombre": "Juan", "role": "usuario" } }
```

### POST `/auth/register`
```json
// Request
{ "docId": 1234567890, "name": "Juan Pérez", "email": "juan@ejemplo.com", "password": "miPass123" }

// Response 201
{ "success": true, "token": "eyJ...", "user": { "id": 1234567890, "role": "usuario" } }
```

### POST `/auth/forgot-password`
```json
// Request
{ "email": "juan@ejemplo.com" }

// Response 200
{
  "success": true,
  "message": "Si el correo existe recibirás un enlace.",
  "devResetLink": "http://localhost:5173/reset-password?token=abc",  // solo en dev
  "devEmailPreview": "https://ethereal.email/message/..."             // solo en dev
}
```

### POST `/auth/reset-password`
```json
// Request
{ "token": "abc123xyz", "nuevaPassword": "nuevaPass456" }
```

---

## Usuarios — `/api/usuarios`

| Método | Ruta | Roles | Descripción |
|--------|------|-------|-------------|
| GET | `/usuarios` | admin | Listar todos |
| GET | `/usuarios/me` | todos | Perfil propio |
| PATCH | `/usuarios/me` | todos | Actualizar perfil |
| PATCH | `/usuarios/me/password` | todos | Cambiar contraseña |
| GET | `/usuarios/:id` | admin / dueño | Ver usuario |
| PUT | `/usuarios/:id` | admin | Reemplazar usuario |
| PATCH | `/usuarios/:id` | admin | Actualizar campos (ej: rol) |
| DELETE | `/usuarios/:id` | admin | Eliminar usuario |

---

## Reservas — `/api/reservas`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/reservas/mesas-disponibles` | Mesas libres para una fecha |
| GET | `/reservas/parqueaderos-disponibles` | Parqueaderos libres |
| POST | `/reservas/bloquear` | Bloquear mesa 15 min |
| GET | `/reservas` | Todas las reservas |
| GET | `/reservas/mis-reservas` | Reservas del usuario autenticado |
| POST | `/reservas` | Crear reserva |
| PUT | `/reservas/:id` | Actualizar reserva |
| DELETE | `/reservas/:id` | Cancelar reserva |

```json
// POST /reservas — Request
{
  "cod_mesa": 5, "cod_parqueadero": 2,
  "fecha_reserva": "2024-12-31", "hora_reserva": "21:00",
  "cantidad_personas": 4, "incluye_cover": true
}
```

---

## Ventas — `/api/ventas`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/ventas` | Todas las ventas |
| GET | `/ventas/today` | Ventas de hoy |
| GET | `/ventas/pendientes` | Ventas pendientes de pago |
| GET | `/ventas/codigo/:codigo` | Buscar por código de pago |
| GET | `/ventas/:id` | Detalle de una venta |
| POST | `/ventas` | Crear venta |
| POST | `/ventas/:id/pagar` | Marcar como pagada |
| PUT | `/ventas/:id` | Actualizar venta |
| DELETE | `/ventas/:id` | Eliminar venta |

```json
// POST /ventas — Request
{
  "reserva_id": 42,
  "detalles": [
    { "cod_producto": 1, "cantidad": 2 },
    { "cod_producto": 5, "cantidad": 1 }
  ]
}
// Response 201 → total calculado automáticamente, stock descontado
```

---

## Productos — `/api/productos`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/productos` | Listar productos activos |
| GET | `/productos/:id` | Detalle de producto |
| POST | `/productos` | Crear producto |
| PUT | `/productos/:id` | Actualizar producto |
| DELETE | `/productos/:id` | Desactivar producto |

> Emite `actualizarProductos` vía Socket.io en POST/PUT/DELETE.

---

## Canciones / Cola DJ — `/api/canciones`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/canciones/queue` | Cola ordenada por votos |
| POST | `/canciones/request` | Solicitar canción |
| POST | `/canciones/:id/vote` | Votar por canción |
| PATCH | `/canciones/:id/play` | Marcar como reproduciendo |
| PATCH | `/canciones/:id/played` | Marcar como reproducida |
| PATCH | `/canciones/:id/reject` | Rechazar canción |
| GET | `/canciones/youtube` | Buscar en YouTube (?q=query) |

---

## Eventos — `/api/eventos`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/eventos` | Listar eventos activos |
| GET | `/eventos/:id` | Detalle de evento |
| POST | `/eventos` | Crear evento |
| PUT | `/eventos/:id` | Actualizar evento |
| DELETE | `/eventos/:id` | Desactivar evento |

---

## Horarios — `/api/horarios`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/horarios` | Todos los horarios |
| GET | `/horarios/usuario/:doc` | Horarios de un empleado |
| POST | `/horarios` | Crear turno |
| PUT | `/horarios/:id` | Actualizar turno |
| DELETE | `/horarios/:id` | Eliminar turno |

---

## Caja — `/api/caja`

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/caja/abrir` | Abrir caja con monto inicial |
| POST | `/caja/cerrar` | Cerrar caja con monto final |
| GET | `/caja/actual` | Caja abierta actualmente |
| GET | `/caja/ventas-hoy` | Ventas del turno |
| GET | `/caja/total-hoy` | Total en caja hoy |
| GET | `/caja/top-productos` | Productos más vendidos hoy |

---

## Mesas — `/api/mesas`

`GET /` · `POST /` · `PUT /:id` · `DELETE /:id`

Tipos de mesa: `Normal`, `VIP`

---

## Parqueaderos — `/api/parqueaderos`

`GET /` · `POST /` · `PUT /:id` · `DELETE /:id`

---

## Roles — `/api/roles` (solo admin)

`GET /` · `GET /:id` · `POST /` · `PUT /:id` · `DELETE /:id`

---

## Códigos de Error

| Código | Significado |
|--------|------------|
| 400 | Datos inválidos o faltantes |
| 401 | Sin token o token inválido/expirado |
| 403 | Sin permisos para esa ruta |
| 404 | Recurso no encontrado |
| 429 | Rate limit excedido |
| 500 | Error interno del servidor |
