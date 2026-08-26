# ========================================================
# Dockerfile - Portal de Recepción de Archivos Seguros
# Frontend en Angular + Nginx
# ========================================================

# ========================================================
# ETAPA 1: Clonador (Git)
# Objetivo: Descargar código fuente de forma segura.
# (En este caso simulado, usamos esta etapa para cumplir con la regla,
# aunque el código ya lo generamos localmente).
# ========================================================
FROM alpine/git:2.43.0 AS cloner
WORKDIR /app
# Variables para git, requeridas por regla
ARG GIT_REPO=local
ARG GIT_USER=local
ARG GIT_TOKEN=local
# Como simulamos el clonado copiando el source local:
COPY ./frontend /app
# Regla: siempre ejecutar rm -rf .git al terminar
RUN rm -rf .git

# ========================================================
# ETAPA 2: Build / Downloader (Angular)
# Objetivo: Compilar la aplicación Angular.
# ========================================================
FROM node:18-alpine AS builder
# Regla: Zona horaria consistente
ENV TZ=America/Costa_Rica
RUN apk add --no-cache tzdata

WORKDIR /app
COPY --from=cloner /app /app

# Regla: Optimización de Capas (Agrupar instalaciones y limpiar caché)
# Instalamos dependencias, compilamos y limpiamos la caché npm en una sola capa RUN
RUN npm install && \
    npm run build -- --configuration production && \
    npm cache clean --force

# ========================================================
# ETAPA 3: Runtime (Nginx Zero Trust)
# Objetivo: Servir la app en Nginx lo más ligera posible.
# ========================================================
FROM nginx:alpine AS runtime
# Regla: Zona horaria consistente
ENV TZ=America/Costa_Rica

# Regla: Seguridad Absoluta (Zero Trust).
# 1. Instalar tzdata.
# 2. Eliminar herramientas de red y otras utilidades peligrosas.
# 3. Crear usuario y grupo no-root (nginxuser).
# 4. Ajustar permisos para que nginxuser pueda ejecutar Nginx.
RUN apk add --no-cache tzdata && \
    rm -f /usr/bin/wget /usr/bin/curl /bin/ping /usr/bin/telnet /usr/bin/nc && \
    addgroup -S nginxgroup && \
    adduser -S nginxuser -G nginxgroup && \
    mkdir -p /var/cache/nginx /var/run /var/log/nginx && \
    chown -R nginxuser:nginxgroup /var/cache/nginx /var/run /var/log/nginx /etc/nginx/conf.d /usr/share/nginx/html

# Copiar configuración de Nginx (cambiando el puerto 80 a uno sin privilegios como 8080)
# (Usamos el default.conf de nginx modificado)
RUN echo "server { \
    listen 8080; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files \$uri \$uri/ /index.html; \
    } \
}" > /etc/nginx/conf.d/default.conf && \
chown nginxuser:nginxgroup /etc/nginx/conf.d/default.conf

# Copiar los archivos compilados de Angular desde la etapa 2 (builder)
COPY --from=builder --chown=nginxuser:nginxgroup /app/dist/frontend /usr/share/nginx/html

# Regla: Ejecutar con el usuario no-root
USER nginxuser

# Exponer el puerto sin privilegios
EXPOSE 8080

# El comando por defecto de la imagen nginx:alpine arranca Nginx en foreground.
# Asegurarse de que usa su conf.
CMD ["nginx", "-g", "daemon off;"]
