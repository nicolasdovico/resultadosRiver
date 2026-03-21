# Resultados River

## Project Overview
Resultados River is a web system that show final scores and stats for the Club Atletico River Plate. The project is designed for social virality and simplicity, following an **Agent-First** development methodology to leverage AI assistance efficiently.

### Core Architecture
- **API-First & Decoupled:** Strict separation between the Backend (Business Logic) and Frontend (UI).
- **Agent-First:** Development follows a strict order (API Contract -> Swagger -> Frontend) to provide AI agents with precise context and minimize hallucinations.
- **Monorepo Structure (Planned):**
  - `/backend`: Laravel API, Sanctum, and Workers.
  - `/frontend`: Expo App (React Native for Mobile & Web).
  - `/docs`: Technical and product documentation.

### Tech Stack
- **Backend:** Laravel 12 (PHP 8.4), PostgreSQL 16, Redis (for queuing and cache).
- **Admin Panel:** Laravel Filament.
- **Frontend:** React Native + Expo (TypeScript) using Expo Router.
- **Documentation:** OpenAPI 3.0 (Swagger) via L5-Swagger.
- **Authentication:** Google OAuth 2.0 & Email/Password (Sanctum).
- **Infrastructure:** Custom Docker Compose (No Sail).

## Building and Running
*Note: The project is in the initial definition phase. Commands below are planned for the implementation stage.*

### Backend (Planned)
- **Setup:** `docker compose up -d`
- **Migrations:** `docker compose exec backend php artisan migrate --seed`
- **Swagger:** `docker compose exec backend php artisan l5-swagger:generate`
- **Tests:** `./test.sh` (runs all tests) or `docker compose exec backend php artisan test`

### Frontend (Planned)
- **Setup:** `npm install`
- **Start:** `npx expo start`
- **Build:** `eas build --platform all`
- **Tests:** `./test.sh` (runs all tests) or `docker compose exec frontend npm test`

## Development Conventions
1. **API-First Workflow:**
   - Always define/update the API contract in the backend before implementing frontend features.
   - Provide the `swagger.json/yaml` to the AI agent to generate frontend services and hooks.
3. **Concurrency & Performance:**
   - Use **Redis Queue** for forecast writes during the 15-minute window before match start.
   - Implement **Optimistic UI** in the frontend for a "saved" perception.
4. **Mantenimiento de Estado:**
   - Cada vez que se complete una tarea o se cambie de fase, es OBLIGATORIO actualizar `docs/status.md` y `docs/progress.txt`.
   - El archivo `docs/status.md` actúa como la única fuente de verdad sobre la fase actual del proyecto.
7. **Garantía de No Regresión (CRITICAL):**
   - Antes de dar por finalizada cualquier tarea, es OBLIGATORIO ejecutar `./test.sh` para asegurar que el sistema completo (Backend y Frontend) sigue funcionando correctamente.
   - No se permiten regresiones; si un cambio rompe algo previo, la prioridad absoluta es repararlo antes de continuar.

## Key Documentation
- `docs/prd.md`: Product Requirements Document (MVP).
- `docs/metodologia.md`: "Agent-First" development workflow.
- `docs/old/`: Legacy documentation and draft notes.

## Aditional Notes

- If you use docker compose, always run `docker compose` instead of `docker-compose` to avoid version conflicts.
- If you need to run a command inside a container, use `docker compose exec <service> <command>` instead of `docker exec` to ensure it works with the current Docker Compose version.
- if you must be a commit, always be a conventional commit. Additionally, ensure that each commit grouped logical changes, performing multiple commits if was necessary.
- Every time you change code, check for potential permission issues outside the container.