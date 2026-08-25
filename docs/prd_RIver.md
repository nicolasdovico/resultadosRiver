# Product Requirements Document (PRD): Resultados River

## 1. Resumen del Proyecto

El proyecto consiste en el desarrollo de una plataforma integral (Backend, Web y Mobile) para la carga y visualización en tiempo real e histórica de partidos de fútbol del Club Atlético River Plate (CARP). La información es administrada internamente y consumida por usuarios (Free y Premium) con diferentes niveles de acceso a estadísticas, filtros y visualizaciones avanzadas.

## 2. Roles de Usuario y Permisos (RBAC)

Para garantizar la seguridad y correcta delegación de tareas, el sistema implementará un Control de Acceso Basado en Roles (RBAC):

- **Super Administrador:** Acceso total al sistema. Gestiona la configuración global, define el valor monetario de la suscripción Premium y administra todos los usuarios (internos y externos).
- **Data Entry:** Acceso restringido únicamente a la gestión operativa. Puede dar de alta, borrar y editar registros de catálogos (Árbitros, Estadios, Jugadores, Rivales, Torneos, Técnicos, Fases) y la carga de los partidos.
- **Usuario Free:** Usuario visitante registrado. Acceso a un set de información estadística reducida y filtros de búsqueda limitados.
- **Usuario Premium:** Usuario con suscripción activa. Acceso total a toda la información histórica y en vivo, sin límites de filtros, e incluye la visualización de gráficos avanzados para el análisis de datos.

## 3. Requerimientos Funcionales

### 3.1. Panel Administrativo (Backend)

- Interfaz CRUD completa para catálogos: Árbitros, Estadios, Jugadores, Rivales, Torneos, Técnicos y Fases / Instancias.
- Módulo de gestión de Partidos con carga detallada de eventos.
- Módulo de administración de usuarios (cambio de roles, altas, bajas).
- Módulo de configuración financiera para actualizar el precio de la suscripción Premium.

### 3.2. Autenticación y Seguridad

- Registro de usuarios visitantes habilitado tanto en Web como en Mobile.
- Validación de cuenta y recuperación de contraseña vía correo electrónico utilizando un código OTP (One-Time Password).
- **Ciclo de vida del OTP:** Los códigos generados tendrán una validez máxima de 5 minutos y el sistema bloqueará temporalmente la cuenta tras 3 intentos fallidos consecutivos para prevenir ataques de fuerza bruta.
- Contraseña de acceso autogestionable desde el perfil del usuario.

### 3.3. Interfaz de Usuario (Frontend Web/Mobile)

- Buscador y motor de filtrado por: Nivel del torneo (Nacional/Internacional), Nombre del Torneo, Rango de Fechas, Rival, Árbitro, Estadio y Técnico.
- Dashboard diferenciado según el rol (Free vs. Premium).
- Los usuarios Premium contarán con una sección exclusiva de gráficos interactivos de rendimiento y estadísticas.

### 3.4. Monetización e Integración de Pagos

- Suscripción de categoría Premium con facturación semestral.
- Integración con la pasarela de pago **MercadoPago**.
- **Webhooks (IPN):** El backend debe exponer un endpoint seguro para recibir notificaciones (Webhooks) de MercadoPago. Esto actualizará automáticamente el rol del usuario a Premium tras la confirmación de pago exitoso y gestionará la revocación del rol si la suscripción semestral expira o es cancelada.

## 4. Requerimientos No Funcionales

### 4.1. Base de Datos

- Motor: **PostgreSQL**.
- **Migración Histórica:** Es obligatorio mantener la estructura de la base de datos histórica existente. El primer paso de datos será realizar un `dump` y `restore` de la información actual.
- Las modificaciones estructurales (nuevas tablas para roles, pagos, webhooks) se realizarán mediante migraciones de Laravel *después* de asegurar la integridad de los datos históricos.

### 4.2. Stack Tecnológico y Arquitectura

- **Backend:** Laravel (PHP) + Sanctum (Autenticación API) + L5-Swagger.
- **Caché y Colas:** Redis. Crítico para el manejo de sesiones, encolado de pronósticos/estadísticas pesadas y procesamiento de Webhooks en segundo plano.
- **Frontend Mobile:** React Native con Expo (Managed Workflow).
- **Frontend Web:** **Next.js**. Se define Next.js para garantizar un excelente SEO (vital para una plataforma de resultados deportivos), consumiendo la misma API y compartiendo la lógica de tipos.
- **CORS:** Configuración estricta en Laravel para permitir peticiones únicamente desde el dominio de Next.js y los esquemas de la aplicación móvil de Expo.
- **Infraestructura:** Despliegue en Debian/Ubuntu. Entorno local orquestado 100% con Docker Compose.

### 4.3. Estructura del Repositorio (Monorepo GitHub)

- `/backend`: API en Laravel, migraciones, workers y configuración de Redis/Postgres.
- `/frontend-web`: Proyecto Next.js (PWA soportada con `manifest.json`).
- `/frontend-mobile`: Proyecto Expo React Native.
- `/docs`: Especificaciones, Swagger, assets y este PRD.

### 4.4. Metodología "Agent-First" (Mandatoria)

Orden estricto para la ejecución del agente IA:

1. **API Contract:** Definición de Modelos, Relaciones y Endpoints.
2. **Documentación:** Generación de OpenAPI (Swagger) a través de L5-Swagger.
3. **Generación de Cliente:** Consumo del Swagger para autogenerar servicios, tipos y hooks de React/Next.js.
4. **UI:** Construcción de las pantallas conectando los servicios autogenerados.

------

## 5. Fases de Trabajo e Implementación

### Fase 1: Setup de Infraestructura y Migración de Datos

- Inicialización del repositorio en GitHub (Monorepo).
- Creación de los archivos `docker-compose.yml` (PostgreSQL, Redis, Laravel, Node).
- Ejecución del `dump y restore` de la base de datos histórica en el contenedor de PostgreSQL.
- Configuración inicial de los proyectos (Laravel, Next.js, Expo).

### Fase 2: Backend Core y Contratos de API (Agent-First: Pasos 1 y 2)

- Creación de migraciones en Laravel para las nuevas funcionalidades (Roles, OTP, Transacciones de MercadoPago), respetando la estructura histórica.
- Desarrollo de los Modelos y Controladores principales.
- Implementación del sistema RBAC (Super Admin, Data Entry, Free, Premium).
- Generación de la documentación OpenAPI (Swagger) de todos los endpoints.

### Fase 3: Lógica de Negocio y Seguridad

- Implementación de Laravel Sanctum para el manejo de tokens de sesión.
- Desarrollo del flujo de autenticación OTP (generación, envío por mail, validación de 5 minutos, bloqueo tras 3 intentos).
- Integración del SDK de MercadoPago.
- Desarrollo y securización del Webhook para recibir notificaciones de pago y actualizar roles.
- Configuración de Redis para el manejo de colas (envío de correos y procesamiento de webhooks).

### Fase 4: Desarrollo Frontend y Mobile (Agent-First: Pasos 3 y 4)

- Generación automática de clientes HTTP (Axios/Fetch) en frontend basados en el archivo Swagger.
- Desarrollo del Panel Administrativo (CRUDs de catálogos y partidos).
- Desarrollo de la interfaz web en Next.js (enfocado en SEO, SSR para estadísticas) e implementación de PWA (`manifest.json`).
- Desarrollo de la aplicación Mobile en Expo.
- Implementación de las bibliotecas de gráficos interactivos exclusivas para usuarios Premium.

### Fase 5: Testing, Optimización y Pase a Producción

- Pruebas de estrés y validación del sistema de Webhooks en entorno local/sandbox.
- Pruebas de regresión sobre los datos históricos.
- Configuración del servidor de producción (Debian/Ubuntu).
- Despliegue utilizando los contenedores Docker.