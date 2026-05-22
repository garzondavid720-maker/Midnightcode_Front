# Roles y Permisos — NOCTURNA

Control de acceso basado en roles (RBAC).

---

## Roles del Sistema

| ID | Nombre | Panel | Descripción |
|----|--------|-------|-------------|
| 1 | **admin** | `/admin` | Acceso total |
| 2 | **empleado** | `/empleado` | Ventas y horario |
| 3 | **usuario** | `/dashboard` | Reservas y canciones |
| 4 | **dj** | `/dj` | Cola de canciones |
| 5 | **inventario** | `/empleado` | Productos y ventas |

---

## Cómo funciona la verificación

```
Request
   │
   ▼
authMiddleware   ← Verifica JWT + blacklist. Consulta BD para rol actualizado.
                   Asigna req.user = { id, rol }
   │
   ▼
roleMiddleware([1, 2])   ← Verifica que req.user.rol esté en el array.
                            Si no → 403 Forbidden
   │
   ▼
Controller
```

```javascript
// roleMiddleware.js
module.exports = (rolesPermitidos) => (req, res, next) => {
  if (!rolesPermitidos.includes(req.user.rol)) {
    return res.status(403).json({ success: false, message: "Sin permisos." });
  }
  next();
};

// Uso en rutas:
router.get("/usuarios", authMiddleware, roleMiddleware([1]), controller.getAll);
router.post("/ventas",  authMiddleware, roleMiddleware([1, 2, 5]), controller.create);
router.get("/eventos",  authMiddleware, controller.getAll); // cualquier autenticado
```

---

## Matriz de Permisos

✅ Permitido | ❌ Denegado | 🔒 Solo propio recurso

### Usuarios
| Endpoint | admin | empleado | usuario | dj | inventario |
|----------|-------|----------|---------|-----|------------|
| GET /usuarios | ✅ | ❌ | ❌ | ❌ | ❌ |
| GET/PATCH /usuarios/me | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /usuarios/:id | ✅ | 🔒 | 🔒 | 🔒 | 🔒 |
| PATCH /usuarios/:id (rol) | ✅ | ❌ | ❌ | ❌ | ❌ |
| DELETE /usuarios/:id | ✅ | ❌ | ❌ | ❌ | ❌ |

### Productos
| Endpoint | admin | empleado | usuario | dj | inventario |
|----------|-------|----------|---------|-----|------------|
| GET /productos | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST/PUT/DELETE /productos | ✅ | ✅ | ❌ | ❌ | ✅ |

### Reservas
| Endpoint | admin | empleado | usuario | dj | inventario |
|----------|-------|----------|---------|-----|------------|
| GET /reservas | ✅ | ✅ | 🔒 | ❌ | ✅ |
| POST /reservas | ✅ | ✅ | ✅ | ❌ | ✅ |
| PUT/DELETE /reservas/:id | ✅ | ✅ | 🔒 | ❌ | ✅ |

### Roles (solo admin)
| Endpoint | admin | Otros |
|----------|-------|-------|
| Todos /roles | ✅ | ❌ |

---

## Acceso al Frontend

| Ruta | admin | empleado | usuario | dj | inventario |
|------|-------|----------|---------|-----|------------|
| `/admin` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/dashboard` | ❌ | ❌ | ✅ | ❌ | ❌ |
| `/dj` | ❌ | ❌ | ❌ | ✅ | ❌ |
| `/empleado` | ❌ | ✅ | ❌ | ❌ | ✅ |

---

## Cambio de Rol en Tiempo Real

El cambio de rol por parte del admin tiene **efecto inmediato** sin re-login:

```javascript
// authMiddleware.js — en cada request se lee el rol desde la BD
const dbUser = await prisma.usuario.findUnique({
  where:  { doc_identidad: decoded.id },
  select: { cod_rol: true },
});
req.user = { ...decoded, rol: dbUser.cod_rol };
```

El frontend lo detecta en la próxima navegación — `PrivateRoute` evalúa el rol y redirige si ya no tiene acceso.

---

## ownerOrAdmin middleware

Permite que un usuario acceda a su propio recurso o que el admin acceda a cualquiera:

```javascript
module.exports = (req, res, next) => {
  const isOwner = String(req.user.id) === String(req.params.id);
  const isAdmin = req.user.rol === 1;
  if (isOwner || isAdmin) return next();
  res.status(403).json({ success: false, message: "Acceso denegado." });
};
```
