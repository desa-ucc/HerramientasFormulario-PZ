# Portal de Recepción de Archivos Seguros

Este proyecto implementa una interfaz web minimalista (estilo SharePoint) que permite a usuarios externos cargar documentos. El Frontend está construido en Angular y envía el archivo junto con datos de formulario (Nombre y Apellidos) a un Webhook (n8n). El registro de los envíos se almacena en una base de datos SQL Server. Todo está orquestado con Docker.

## Arquitectura

- **Frontend:** Angular Standalone Components, Reactive Forms, SCSS estricto. Nginx ligero.
- **Base de Datos:** SQL Server 2022 con Procedimiento Almacenado optimizado.
- **Infraestructura:** Docker Compose, Redes Internas (bridge), Multi-stage builds con políticas de *Zero Trust* (Sin wget/curl).

## Estructura de Carpetas

```text
/portal-recepcion/
├── docker-compose.yml     # Orquestación de contenedores
├── Dockerfile             # Multi-stage build para el Frontend Angular
├── .env.example           # Variables de entorno (Copiar a .env)
├── init.sql               # Script de inicialización SQL Server (Tablas, Vistas, SP)
├── README.md              # Documentación
└── frontend/              # Código fuente de Angular
    ├── src/
    │   ├── app/
    │   │   └── file-upload/
    │   │       ├── file-upload.component.ts
    │   │       ├── file-upload.component.html
    │   │       ├── file-upload.component.scss
    │   │       └── file-upload.service.ts
    │   ├── environments/
    │   │   ├── environment.ts
    │   │   └── environment.prod.ts
    │   ├── index.html
    │   ├── main.ts
    │   └── styles.scss
    ├── package.json
    ├── angular.json
    ├── tsconfig.json
    └── tsconfig.app.json
```

## Instrucciones de Configuración y Despliegue

### Paso 1: Configurar Variables de Entorno

Copie el archivo `.env.example` a un nuevo archivo llamado `.env` y ajuste los valores.

```bash
cp .env.example .env
```

Asegúrese de modificar `DB_SA_PASSWORD` por una contraseña fuerte que cumpla con los requisitos de SQL Server (mayúsculas, minúsculas, números y caracteres especiales).

### Paso 2: Compilar e Iniciar Contenedores

Para compilar el frontend y levantar la base de datos SQL Server, ejecute el siguiente comando:

```bash
docker-compose up --build -d
```

Este proceso hará lo siguiente:
1. Levantará el contenedor `portal_db` (SQL Server) y ejecutará el script `init.sql` para crear la tabla `RegistroArchivos`, la vista y el Stored Procedure.
2. Compilará el Frontend Angular usando un build *Multi-stage* (pasando por alpine/git, nodo builder y finalmente un Nginx ultraligero).
3. Asegurará que el frontend solo se levante una vez que la base de datos informe que está `healthy`.

### Paso 3: Verificar el Despliegue

- **Frontend:** Abra un navegador web y navegue a `http://localhost:8080` (o el puerto configurado en `FRONTEND_PORT`). Debería ver el portal de recepción de archivos.
- **Base de Datos:** Puede conectarse a SQL Server en `localhost:1433` (usuario `sa`, contraseña configurada) para verificar la base de datos, la tabla, vistas y procedimientos.

## Seguridad y Decisiones Técnicas

- **Zero Trust:** La imagen final del Dockerfile (`nginx:alpine`) ha sido limpiada para no incluir herramientas de red como `curl`, `wget`, `ping`, o `telnet`.
- **Usuario No Privilegiado:** Nginx se ejecuta con un usuario específico `nginxuser` y atiende peticiones en un puerto sin privilegios (`8080`).
- **Healthchecks Nativos:** Para mantener el principio de Zero Trust y ante la ausencia de `curl`, los healthchecks utilizan comandos como `netstat` en el frontend y `sqlcmd` nativo en el backend.
