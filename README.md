# 🌙 NOCTURNA — Sistema de Gestión de Vida Nocturna

> Plataforma fullstack para la administración integral de un club nocturno: reservas, ventas, DJ en tiempo real, inventario y más.

---

## Tabla de Contenidos

- [¿Qué es este proyecto?](#qué-es-este-proyecto)
- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura General](#arquitectura-general)
- [Roles del Sistema](#roles-del-sistema)
- [Requisitos Previos](#requisitos-previos)
- [Instalación y Puesta en Marcha](#instalación-y-puesta-en-marcha)
- [Variables de Entorno](#variables-de-entorno)
- [Estructura de Carpetas](#estructura-de-carpetas)
- [Documentación Detallada](#documentación-detallada)

---

## ¿Qué es este proyecto?

**NOCTURNA** es un sistema de gestión para un club nocturno que incluye:

| Módulo | Descripción |
|--------|-------------|
| **Autenticación** | Login, registro, Google OAuth, recuperación de contraseña por email |
| **Reservas** | Mesas y parqueaderos con expiración automática en 15 minutos |
| **Ventas y Caja** | POS básico con caja, productos y métodos de pago |
| **Cola DJ** | Solicitud de canciones en tiempo real con sistema de votos |
| **Inventario** | CRUD de productos con control de stock |
| **Horarios** | Asignación de turnos para empleados |
| **Eventos** | Gestión de eventos y artistas |
| **Auditoría** | Registro automático de todas las acciones del sistema |

---

## Stack Tecnológico

### Frontend
| Tecnología | Uso |
|------------|-----|
| React 19 | Framework de interfaz de usuario |
| Vite 7 | Build tool y servidor de desarrollo |
| Tailwind CSS 4 | Estilos utilitarios |
| React Router 6 | Navegación SPA (Single Page Application) |
| Axios | Peticiones HTTP al backend |
| Socket.io Client 4 | Comunicación en tiempo real |
| React Hook Form + Yup | Formularios con validación |

### Backend
| Tecnología | Uso |
|------------|-----|
| Node.js 24 | Runtime de JavaScript |
| Express 5 | Framework HTTP |
| Prisma 7 | ORM para la base de datos |
| MariaDB 12 | Base de datos relacional |
| Socket.io 4 | WebSockets para eventos en tiempo real |
| JSON Web Token (JWT) | Autenticación stateless |
| Bcrypt | Hash seguro de contraseñas |
| Nodemailer | Envío de emails (recuperación de contraseña) |
| Pino | Logging estructurado |
| Helmet | Seguridad de HTTP headers |

---

## Arquitectura General

```
┌──────────────────────────────────────────────────────────┐
│                   CLIENTE (Navegador)                    │
│                                                          │
│   React + Vite  →  http://localhost:5173                 │
│   ├── Landing page          (/)                          │
│   ├── Login / Registro      (/login, /register)          │
│   ├── Panel Admin           (/admin)                     │
│   ├── Panel Usuario         (/dashboard)                 │
│   ├── Panel DJ              (/dj)                        │
│   └── Panel Empleado        (/empleado)                  │
└───────────────┬──────────────────────────┬───────────────┘
                │  HTTP/REST (Axios)        │  WebSocket
                ▼                          ▼
┌──────────────────────────────────────────────────────────┐
│                  SERVIDOR (Express)                      │
│                                                          │
│   Node.js + Express  →  http://localhost:3000            │
│   ├── Middlewares: JWT, CORS, Rate Limit, Helmet         │
│   ├── Rutas → Controladores → Servicios → Repositorios  │
│   └── Socket.io: notificaciones en tiempo real           │
└──────────────────────────┬───────────────────────────────┘
                           │  Prisma ORM
                           ▼
┌──────────────────────────────────────────────────────────┐
│                   BASE DE DATOS                          │
│                                                          │
│   MariaDB  →  localhost:3306                             │
│   └── 15+ tablas relacionadas                            │
└──────────────────────────────────────────────────────────┘
```

**Flujo de una petición típica:**
```
Usuario hace clic → React llama a Axios → Express recibe request
→ authMiddleware verifica JWT → Controller procesa → Service aplica
lógica de negocio → Repository consulta BD → Respuesta al cliente
→ (si aplica) Socket.io notifica a otros usuarios en tiempo real
```

---

## Roles del Sistema

| ID | Nombre | Ruta de acceso | Permisos |
|----|--------|----------------|----------|
| 1 | **admin** | `/admin` | Todo el sistema |
| 2 | **empleado** | `/empleado` | Ventas + su horario |
| 3 | **usuario** | `/dashboard` | Reservas + canciones |
| 4 | **dj** | `/dj` | Cola de canciones |
| 5 | **inventario** | `/empleado` | Ventas + productos |

> Un admin puede cambiar el rol de cualquier usuario desde el panel de administración. El cambio tiene efecto **inmediato** sin necesidad de que el usuario cierre sesión.

---

## Requisitos Previos

Antes de instalar, asegúrate de tener instalado:

```
- Node.js  v18 o superior
- MariaDB  v10 o superior  (o MySQL 8)
- npm      v9 o superior
- Git
```

Verificar:
```bash
node --version
npm --version
mysql --version
```

---

## Instalación y Puesta en Marcha

### 1. Clonar el repositorio
```bash
git clone https://github.com/JUBUDASU02/Midnightcode.git
cd Midnightcode
```

### 2. Configurar el Backend

```bash
cd backend/midnightcode

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
# (editar .env con tus datos reales)
cp .env.example .env

# Aplicar el esquema a la base de datos
npx prisma db push

# Iniciar el servidor en modo desarrollo
npm run dev
```
Servidor disponible en: `http://localhost:3000`

### 3. Configurar el Frontend

```bash
cd Fronted

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp .env.example .env

# Iniciar el servidor de desarrollo
npm run dev
```
Aplicación disponible en: `http://localhost:5173`

### 4. Orden correcto de arranque

> **IMPORTANTE**: Siempre arrancar en este orden para evitar errores de conexión.

```
Paso 1: Iniciar MariaDB      (puerto 3306)
Paso 2: Iniciar Backend      (npm run dev — puerto 3000)
Paso 3: Iniciar Frontend     (npm run dev — puerto 5173)
```

---

## Variables de Entorno

### Backend — `backend/midnightcode/.env`

```env
# Servidor
NODE_ENV=development
PORT=3000

# Base de datos
DATABASE_URL=mysql://root:TuPassword@localhost:3306/midnightcode

# Seguridad JWT
JWT_SECRET=una_cadena_aleatoria_muy_larga_de_al_menos_64_caracteres

# URL del frontend (para CORS y links en emails)
FRONTEND_URL=http://localhost:5173

# ── Email ──────────────────────────────────────────────────
# Si no configuras SMTP, en desarrollo se usa Ethereal
# (email de prueba gratuito, sin necesitar cuenta real)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu@gmail.com
SMTP_PASS=tu_app_password

# ── Google OAuth ───────────────────────────────────────────
# Obtener en: console.cloud.google.com
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com

# ── YouTube API ────────────────────────────────────────────
# Para búsqueda de canciones en la cola del DJ
YOUTUBE_API_KEY=AIzaSy...
```

### Frontend — `Fronted/.env`

```env
VITE_API_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

---

## Estructura de Carpetas

```
MidNightCode/
│
├── README.md                        <- Este archivo
│
├── docs/                            <- Documentación detallada
│   ├── ARQUITECTURA.md
│   ├── API.md
│   ├── BASE_DE_DATOS.md
│   ├── FRONTEND.md
│   ├── ROLES_Y_PERMISOS.md
│   ├── CONFIGURACION.md
│   └── GUIA_DESARROLLO.md
│
├── backend/midnightcode/            <- Servidor Node.js/Express
│   ├── src/
│   │   ├── serve.js                 <- Punto de entrada + Socket.io + Cron
│   │   ├── app.js                   <- Express + middlewares globales
│   │   ├── config/
│   │   │   ├── database.js          <- Conexión Prisma/MariaDB
│   │   │   ├── logger.js            <- Configuración Pino
│   │   │   └── email.js             <- Servicio de email (SMTP/Ethereal)
│   │   ├── routes/                  <- Definición de endpoints REST
│   │   ├── controllers/             <- Manejo de request y response
│   │   ├── services/                <- Lógica de negocio
│   │   ├── repositories/            <- Acceso directo a base de datos
│   │   ├── middlewares/             <- Auth, roles, logs, auditoría
│   │   └── jobs/                    <- Tareas cron programadas
│   ├── prisma/
│   │   └── schema.prisma            <- Definición de modelos de BD
│   └── .env
│
└── Fronted/                         <- Aplicación React
    ├── src/
    │   ├── main.jsx                 <- Punto de entrada React
    │   ├── App.jsx                  <- Router principal con rutas protegidas
    │   ├── assets/css/style.css     <- Estilos globales y animaciones
    │   ├── components/
    │   │   ├── auth/                <- PrivateRoute, PublicRoute
    │   │   ├── layout/              <- Navbar, Footer, AuthFooter
    │   │   ├── sections/            <- Secciones de la landing page
    │   │   └── ui/                  <- Componentes reutilizables
    │   ├── context/
    │   │   ├── AuthContext.jsx      <- Estado global de autenticación
    │   │   └── SongContext.jsx      <- Estado global de la cola de canciones
    │   ├── pages/
    │   │   ├── public/              <- Home, Login, Signup, ForgotPassword, ResetPassword
    │   │   └── private/
    │   │       ├── admin/           <- Dashboard de administrador
    │   │       ├── dj/              <- Panel del DJ
    │   │       ├── employee/        <- Dashboard de empleado/inventario
    │   │       └── user/            <- Dashboard de usuario cliente
    │   └── services/
    │       ├── api.js               <- Axios con token JWT automático
    │       ├── publicApi.js         <- Axios sin autenticación (rutas públicas)
    │       └── authService.js       <- Funciones de autenticación
    └── .env
```

---

## Documentación Detallada

| Documento | Descripción |
|-----------|-------------|
| [ARQUITECTURA.md](docs/ARQUITECTURA.md) | Flujo de datos, patrones de diseño, Socket.io, seguridad |
| [API.md](docs/API.md) | Todos los endpoints con ejemplos de request/response |
| [BASE_DE_DATOS.md](docs/BASE_DE_DATOS.md) | Modelos, relaciones y diagrama ER |
| [FRONTEND.md](docs/FRONTEND.md) | Componentes, rutas, contextos y servicios del cliente |
| [ROLES_Y_PERMISOS.md](docs/ROLES_Y_PERMISOS.md) | Matriz completa de permisos por rol |
| [CONFIGURACION.md](docs/CONFIGURACION.md) | Variables de entorno y servicios externos (Google, Gmail) |
| [GUIA_DESARROLLO.md](docs/GUIA_DESARROLLO.md) | Cómo agregar funcionalidades, convenciones y flujo de trabajo |

---

## Scripts Disponibles

### Backend
```bash
npm run dev     # Inicia con nodemon (recarga automática al guardar)
npm start       # Inicia en producción sin recarga
npm test        # Ejecuta tests con Jest
```

### Frontend
```bash
npm run dev     # Inicia el servidor de desarrollo Vite
npm run build   # Construye la aplicación para producción
npm run preview # Vista previa del build de producción
```

---

*NOCTURNA — Bogotá, Colombia*
