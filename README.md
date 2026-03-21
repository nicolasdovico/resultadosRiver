# Resultados River - Monorepo

Sistema integral para el seguimiento de resultados históricos y en tiempo real del Club Atlético River Plate.

## Estructura del Proyecto

- `/backend`: API REST construida con Laravel 11 + PostgreSQL + Redis.
- `/frontend-web`: Aplicación web interactiva y PWA con Next.js + Tailwind CSS.
- `/frontend-mobile`: Aplicación móvil multiplataforma con Expo (React Native).
- `/docs`: Documentación técnica, PRD y guías de desarrollo.

## Requisitos Previos

- Docker & Docker Compose
- Node.js (v18+)
- PHP 8.2+ & Composer (opcional para desarrollo local fuera de Docker)

## Levantamiento del Entorno Local

Para iniciar todos los servicios con Docker:

```bash
docker-compose up -d
```

### Configuración del Backend

1. Entrar al contenedor: `docker-compose exec backend bash`
2. Instalar dependencias: `composer install`
3. Generar App Key: `php artisan key:generate`
4. Ejecutar migraciones: `php artisan migrate`

### Configuración del Frontend Web

1. Entrar al contenedor o directorio: `cd frontend-web`
2. Instalar dependencias: `npm install`
3. Iniciar desarrollo: `npm run dev`

### Configuración del Frontend Mobile

1. Entrar al directorio: `cd frontend-mobile`
2. Instalar dependencias: `npm install`
3. Iniciar Expo: `npx expo start`

## Documentación

Consulta la carpeta `/docs` para más detalles sobre la metodología de trabajo y requerimientos del producto.
