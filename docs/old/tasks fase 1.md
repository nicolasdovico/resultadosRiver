# Plan de Ejecución: Fase 1 - Setup e Infraestructura

Esta fase sienta las bases del **Monorepo** y asegura la integridad de la información histórica de River Plate antes de comenzar con la lógica de negocio.

## 1.1. Inicialización del Ecosistema (Monorepo)

- [x] **Estructura de Directorios:** Crear la estructura base del repositorio siguiendo el estándar definido: `/backend`, `/frontend-web`, `/frontend-mobile` y `/docs`.
- [x] **Configuración de Git:** Inicializar el repositorio Git, configurar el archivo `.gitignore` global para evitar subir binarios de Node, dependencias de Composer, variables de entorno (`.env`) y volúmenes de Docker.
- [x] **Documentación Inicial:** Mover el archivo `prd.md` a la carpeta `/docs` e inicializar un `README.md` principal con las instrucciones de levantamiento del entorno.

## 1.2. Orquestación con Docker (Entorno Local)

- [x] **Definición de Redes y Volúmenes:** Configurar en `docker-compose.yml` redes internas para la comunicación entre servicios y volúmenes persistentes para PostgreSQL y Redis.
- [x] **Servicio de Base de Datos:** Configurar la imagen oficial de **PostgreSQL**, definiendo credenciales, puerto y healthchecks.
- [x] **Servicio de Caché:** Configurar **Redis** para la gestión de sesiones y colas futuras.
- [x] **Servicio Backend (PHP-FPM/Nginx):** Crear el `Dockerfile` para Laravel con las extensiones necesarias (pdo_pgsql, redis, bcmath) y servidor Nginx.
- [x] **Servicio Frontend:** Configurar los contenedores para **Next.js** en modo desarrollo.
- [x] **Variables de Env:** Crear archivos `.env.example` para cada servicio con las conexiones inter-container pre-configuradas.

## 1.3. Setup de Proyectos (Skeleton)

- [x] **Backend Laravel:** Instalar Laravel 11 (o versión estable actual) dentro de `/backend`. Instalar paquetes base: `laravel/sanctum` y `darkaonline/l5-swagger`.
- [x] **Frontend Web Next.js:** Inicializar el proyecto Next.js en `/frontend-web` con TypeScript y soporte para PWA (`next-pwa`).
- [x] **Frontend Mobile Expo:** Inicializar el proyecto React Native con Expo (Managed Workflow) en `/frontend-mobile`.
- [x] **Verificación de Comunicación:** Realizar una prueba de conectividad básica (Ping) entre el contenedor de Next.js y la API de Laravel.

## 1.4. Migración de Datos Históricos (Crítico)

- [x] **Preparación del Dump:** Obtener el archivo `.sql` de la base de datos histórica existente.
- [x] **Proceso de Restore:** Ejecutar el comando `psql` o `pg_restore` dentro del contenedor de PostgreSQL para importar los datos.
- [x] **Auditoría de Integridad:** Verificar que las tablas históricas (Árbitros, Jugadores, Partidos, etc.) se hayan importado correctamente y que los encodings de caracteres sean consistentes.
- [x] **Baseline de Base de Datos:** Documentar el esquema actual importado para que sirva de referencia antes de las nuevas migraciones de Laravel en la Fase 2.
