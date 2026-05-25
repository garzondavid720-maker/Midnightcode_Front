# ─────────────────────────────────────────────────────────────────────────────
# STAGE 1 — BUILD
# Usa Node para instalar dependencias y compilar el bundle de producción
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar package.json y package-lock.json primero
# (capa separada para aprovechar el cache de Docker)
COPY package.json package-lock.json ./

# Instalar dependencias (incluyendo devDependencies para el build)
RUN npm ci

# Copiar el resto del código fuente
COPY . .

# Variable de entorno para el build
# Se puede sobreescribir con --build-arg al hacer docker build
ARG VITE_API_URL=http://localhost:3000/api
ENV VITE_API_URL=$VITE_API_URL

# Compilar la app React para producción
# Genera la carpeta /app/dist
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# STAGE 2 — SERVE
# Imagen final: solo Nginx + los archivos estáticos del build
# Imagen mucho más liviana (~20MB vs ~400MB del stage 1)
# ─────────────────────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS production

# Eliminar la config por defecto de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar los archivos compilados del stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar nuestra configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx escucha en el puerto 80
EXPOSE 80

# Nginx corre en foreground (requerido por Docker)
CMD ["nginx", "-g", "daemon off;"]
