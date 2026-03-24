# Resultados River - Monorepo

Sistema integral para el seguimiento de resultados históricos y en tiempo real del Club Atlético River Plate.

## Estructura del Proyecto

- `/backend`: API REST construida con Laravel 11 + PostgreSQL + Redis.
- `/frontend-web`: Aplicación web interactiva y PWA con Next.js + Tailwind CSS.
- `/frontend-mobile`: Aplicación móvil multiplataforma con Expo (React Native).
- `/docs`: Documentación técnica, PRD y guías de desarrollo.

## Levantamiento del Entorno Local

Para iniciar todos los servicios con Docker:

```bash
docker compose up -d
```

## Acceso al Backend (API)

El backend está configurado para ser accesible desde el host a través de los siguientes parámetros:

- **URL Base:** `http://localhost:8000`
- **Prefijo API:** `/api/v1`
- **Documentación Swagger:** `http://localhost:8000/api/documentation` (Actualmente en revisión)
- **Estado de Salud:** `http://localhost:8000/up`

### Endpoints Principales

| Recurso | Método | Endpoint | Acceso |
| :--- | :--- | :--- | :--- |
| Registro | POST | `/api/v1/auth/register` | Público |
| Login | POST | `/api/v1/auth/login` | Público |
| Verificación OTP | POST | `/api/v1/auth/verify-otp` | Público |
| Crear Pago (MP) | POST | `/api/v1/payments/create-preference` | Autenticado |
| Webhook Pagos | POST | `/api/v1/payments/webhook` | Público |
| Usuarios | GET/PUT | `/api/v1/users` | Admin |

### Comandos Útiles (Docker Compose)

- **Ver logs del backend:** `docker compose logs -f backend`
- **Ejecutar Artisan:** `docker compose exec backend php artisan [comando]`
- **Reiniciar worker de colas:** `docker compose exec backend php artisan queue:restart`
- **Acceder a la base de datos (PSQL):** `docker compose exec db psql -U river_user -d resultados_river`

## Configuración del Frontend Web

1. Entrar al directorio: `cd frontend-web`
2. Instalar dependencias: `npm install`
3. Iniciar desarrollo: `npm run dev` (Disponible en `http://localhost:3000`)

## Configuración del Frontend Mobile

1. Entrar al directorio: `cd frontend-mobile`
2. Instalar dependencias: `npm install`
3. Iniciar Expo: `npx expo start`

## Documentación Técnica

Consulta la carpeta `/docs` para más detalles sobre la metodología de trabajo, PRD y el loop de tareas.

## URL acceso a backend
'http://localhost:8000/admin'

## Crear usuario Admin
'docker exec -it river-backend php artisan make:filament-user'

## Backup de la base de datos
'docker exec -t river-db pg_dump -U river_user resultados_river > backup_$(date +%Y%m%d_%H%M%S).sql'
