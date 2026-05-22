# Base de Datos — NOCTURNA

MariaDB gestionada con Prisma ORM. Schema en `backend/midnightcode/prisma/schema.prisma`.

---

## Tablas

| Tabla | Descripción |
|-------|-------------|
| `Rol` | Roles del sistema (admin, empleado, usuario, dj, inventario) |
| `Usuario` | Todos los usuarios del sistema |
| `Mesa` | Mesas del club para reservar |
| `Parqueadero` | Espacios de parqueo |
| `Reserva` | Reservas de mesas y/o parqueaderos |
| `MetodoPago` | Métodos de pago (efectivo, tarjeta…) |
| `Producto` | Inventario de bebidas y productos |
| `Venta` | Cabecera de ventas |
| `DetalleVenta` | Ítems de cada venta |
| `Movimiento` | Historial de entradas/salidas de inventario |
| `Cancion` | Cola de canciones para el DJ |
| `Evento` | Eventos y noches temáticas |
| `Horario` | Turnos de empleados |
| `Caja` | Apertura/cierre de caja por turno |
| `Auditoria` | Log automático de todas las acciones |
| `TokenBlacklist` | JWTs invalidados por logout |
| `PasswordResetToken` | Tokens temporales de recuperación |

---

## Modelos principales

### Usuario
| Campo | Tipo | Notas |
|-------|------|-------|
| `doc_identidad` | Int (PK) | Cédula — NO autoincrement |
| `cod_rol` | Int (FK→Rol) | Rol asignado |
| `nombre_usu` | VarChar(100) | |
| `correo_usu` | VarChar(100) UNIQUE | |
| `password_usu` | VarChar(255) | Hash bcrypt, nunca texto plano |
| `avatar_usu` | Text? | URL de foto |
| `fecha_registro` | DateTime | Auto |

### Reserva
| Campo | Tipo | Notas |
|-------|------|-------|
| `id_reserva` | Int (PK, auto) | |
| `doc_identidad` | Int (FK→Usuario) | |
| `cod_mesa` | Int (FK→Mesa) | |
| `cod_parqueadero` | Int? (FK→Parqueadero) | Opcional |
| `fecha_reserva` | Date | |
| `hora_reserva` | Time | |
| `estado` | EstadoReserva | `Pendiente` → `Confirmada`/`Cancelada` |
| `fecha_expiracion` | DateTime? | +15 min desde creación |
| `estado_temporal` | EstadoTemporal | `Activa` / `Expirada` |

### Venta + DetalleVenta
```
Venta (cabecera)
  id_venta, doc_identidad, cod_metodopago, total, estado, codigo_pago
      │
      └── DetalleVenta (ítems)
            id_venta → Venta
            cod_producto → Producto
            cantidad, precio_produc (histórico al momento de la venta)
```

### Cancion
| Campo | Notas |
|-------|-------|
| `nombre_can` | Nombre de la canción |
| `Link_can` | URL de YouTube |
| `votos` | Se ordena por votos descendente |
| `numero_fila` | Posición en cola |

> La tabla se vacía todos los días a las 6 AM por el cron job.

---

## Enums

```
EstadoReserva  → Pendiente | Confirmada | Cancelada
EstadoVenta    → Pendiente | Pagada | Cancelada
EstadoCaja     → Abierta | Cerrada
TipoMesa       → Normal | VIP
DiaSemana      → Lunes | Martes | Miercoles | Jueves | Viernes | Sabado | Domingo
TipoMovimiento → Entrada | Salida
TipoAccion     → INSERT | UPDATE | DELETE
EstadoTemporal → Activa | Expirada
```

---

## Comandos Prisma

```bash
npx prisma db push        # Aplicar cambios del schema (desarrollo)
npx prisma migrate dev    # Crear migración versionada (producción)
npx prisma generate       # Regenerar el cliente JS
npx prisma studio         # UI visual en http://localhost:5555
```

## Ejemplo de query

```javascript
// Transacción: crear venta y descontar stock
const venta = await prisma.$transaction(async (tx) => {
  const nueva = await tx.venta.create({
    data: {
      doc_identidad: usuarioId,
      total: 120000,
      detalles: {
        create: [{ cod_producto: 1, cantidad: 2, precio_produc: 45000 }],
      },
    },
  });
  await tx.producto.update({
    where: { cod_producto: 1 },
    data:  { stock: { decrement: 2 } },
  });
  return nueva;
});
```
