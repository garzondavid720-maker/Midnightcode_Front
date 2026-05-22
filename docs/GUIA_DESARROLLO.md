# Guía de Desarrollo — NOCTURNA

---

## Arrancar el proyecto

```bash
# 1. Iniciar MariaDB (XAMPP / Laragon / servicio Windows)

# 2. Backend
cd backend/midnightcode
npm run dev        # http://localhost:3000

# 3. Frontend (nueva terminal)
cd Fronted
npm run dev        # http://localhost:5173
```

---

## Agregar un nuevo endpoint (ejemplo: Galería)

### 1. Repositorio
```javascript
// src/repositories/fotoRepository.js
const prisma = require("../config/database");
module.exports = {
  findAll: ()       => prisma.foto.findMany({ where: { activo: true } }),
  create:  (data)   => prisma.foto.create({ data }),
  remove:  (id)     => prisma.foto.delete({ where: { id_foto: id } }),
};
```
> Solo Prisma. Cero lógica de negocio.

### 2. Service
```javascript
// src/services/fotoService.js
const fotoRepository = require("../repositories/fotoRepository");
module.exports = {
  async listar() {
    return fotoRepository.findAll();
  },
  async crear(data, usuarioId) {
    if (!data.url) throw new Error("La URL es requerida");
    return fotoRepository.create({ ...data, subida_por: usuarioId });
  },
};
```
> Toda la lógica de negocio vive aquí.

### 3. Controller
```javascript
// src/controllers/fotoController.js
const fotoService = require("../services/fotoService");
module.exports = {
  async getAll(req, res, next) {
    try {
      res.json({ success: true, data: await fotoService.listar() });
    } catch (err) { next(err); }
  },
  async create(req, res, next) {
    try {
      const foto = await fotoService.crear(req.body, req.user.id);
      res.status(201).json({ success: true, data: foto });
    } catch (err) { next(err); }
  },
};
```

### 4. Rutas
```javascript
// src/routes/fotoRoutes.js
const router = require("express").Router();
const c = require("../controllers/fotoController");
const auth = require("../middlewares/authMiddleware");
const rol  = require("../middlewares/roleMiddleware");

router.get("/",    auth, c.getAll);
router.post("/",   auth, rol([1]), c.create);
module.exports = router;
```

### 5. Registrar en app.js
```javascript
app.use("/api/fotos", require("./routes/fotoRoutes"));
```

---

## Agregar modelo a la BD

```prisma
// schema.prisma
model Foto {
  id_foto    Int      @id @default(autoincrement())
  url        String   @db.Text
  subida_por Int
  activo     Boolean  @default(true)
  createdAt  DateTime @default(now())
  usuario    Usuario  @relation(fields: [subida_por], references: [doc_identidad])
}
```

```bash
npx prisma db push      # aplica cambios
npx prisma generate     # regenera cliente
```

---

## Agregar página al frontend

```jsx
// src/pages/Private/User/Gallery.jsx
import api from "../../../services/api";
export default function Gallery() {
  const [fotos, setFotos] = useState([]);
  useEffect(() => { api.get("/fotos").then(r => setFotos(r.data.data)); }, []);
  return <div>{fotos.map(f => <img key={f.id_foto} src={f.url} />)}</div>;
}
```

```jsx
// App.jsx
const Gallery = lazy(() => import("./pages/Private/User/Gallery"));
<Route path="/gallery" element={<PrivateRoute role="usuario"><Gallery /></PrivateRoute>} />
```

---

## Agregar evento Socket.io

**Backend:**
```javascript
if (global.io) global.io.emit("nuevaFoto", { id: foto.id_foto });
```

**Frontend:**
```javascript
useEffect(() => {
  const socket = io("http://localhost:3000", {
    auth: { token: localStorage.getItem("neon_token") },
  });
  socket.on("nuevaFoto", () => api.get("/fotos").then(r => setFotos(r.data.data)));
  return () => socket.disconnect(); // siempre limpiar al desmontar
}, []);
```

---

## Convenciones de código

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Componentes React | PascalCase | `LoginPage.jsx` |
| Services backend | camelCase + sufijo | `authService.js` |
| Controllers | camelCase + Controller | `fotoController.js` |
| Repositorios | camelCase + Repository | `fotoRepository.js` |

**Respuestas API — siempre este formato:**
```javascript
res.json({ success: true, data: resultado });          // éxito
res.status(201).json({ success: true, data: creado }); // creación
throw new Error("Mensaje claro del problema");          // error → lo captura errorMiddleware
```

**Imports en frontend — regla de profundidad:**
```
src/components/sections/Hero.jsx   →  ../../services/publicApi   (2 niveles)
src/pages/Private/User/Gallery.jsx →  ../../../services/api      (3 niveles)
```

---

## Flujo de Git

```bash
git checkout -b feat/nombre-feature
git add src/el/archivo/modificado.js
git commit -m "feat: descripción clara del cambio"
git push origin feat/nombre-feature
# → Crear Pull Request en GitHub
```

---

## Scripts

```bash
# Backend
npm run dev              # nodemon con recarga
npx prisma studio        # UI de la BD

# Frontend
npm run dev              # Vite dev server
npm run build            # Build de producción
```

---

## Problemas comunes

| Problema | Causa | Solución |
|---------|-------|----------|
| Página en blanco | Import con ruta incorrecta | Contar niveles: `components/sections/` → `../../services/` |
| Backend no inicia | MariaDB no está corriendo | Iniciar el servicio MySQL/MariaDB |
| Token no llega | Falta `Authorization` header | `api.js` lo agrega automático — usar `api`, no `publicApi` |
| Cambios de BD no aplican | Cliente Prisma desactualizado | `npx prisma generate` |
| Email no llega en dev | Normal | Usar `devEmailPreview` de la respuesta del API |
| Botón Google no aparece | Falta `VITE_GOOGLE_CLIENT_ID` | Agregar al `Fronted/.env` y reiniciar Vite |
