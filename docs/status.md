# Historial de Tareas por Fase - Resultados River

## Fase 1: Inicialización, Infraestructura y Datos Históricos (Completada)
- [x] **Setup del Monorepo:** Estructuración de directorios `/backend`, `/frontend-web`, `/frontend-mobile` y `/docs`.
- [x] **Configuración de Git:** Inicialización de repositorio y archivos `.gitignore`.
- [x] **Orquestación con Docker:** Configuración de contenedores para PostgreSQL, Redis, PHP-FPM/Nginx y Next.js.
- [x] **Backend Laravel:** Instalación de Laravel 12 y paquetes base (`sanctum`, `l5-swagger`).
- [x] **Frontend Web Next.js:** Inicialización con TypeScript y soporte PWA.
- [x] **Frontend Mobile Expo:** Inicialización con React Native y Expo Router.
- [x] **Importación de Datos Históricos:** Restauración de la base de datos desde `.sql` y auditoría de integridad.

## Fase 2: Backend Core y Contratos de API (Completada)
- [x] **Modelo de Datos Eloquent:** Implementación de modelos (Árbitros, Estadios, Jugadores, Partidos, Rivales, Torneos, Técnicos, Fases, Goles, etc.).
- [x] **API Resources:** Creación de transformadores para estandarizar las respuestas JSON.
- [x] **Endpoints de Consulta:** Implementación de lógica de búsqueda y filtros para usuarios Free y Premium.
- [x] **Documentación de API:** Configuración de L5-Swagger/OpenAPI para la generación automática de contratos.

## Fase 3: Lógica de Negocio, Seguridad y Suscripciones (Completada)
- [x] **Autenticación y Seguridad:** Implementación de Laravel Sanctum y sistema de verificación OTP por correo electrónico.
- [x] **Integración de Pagos:** Configuración del SDK de Mercado Pago, generación de preferencias y gestión de webhooks (IPN).
- [x] **Procesamiento Asíncrono:** Configuración de colas con Redis y Workers (Supervisor) para correos y actualización de roles.

## Fase 4: Panel Administrativo y Visualización MVP (Completada)
- [x] **Dashboard Administrativo:** Implementación de CRUDs completos con Laravel Filament.
- [x] **Frontend Web (Next.js):** 
    - [x] Landing page con "Resumen Histórico".
    - [x] Listado de partidos con filtros y lógica "Un día como hoy".
    - [x] Sistema de tiers de acceso (Guest, Registered, Premium).
- [x] **Frontend Mobile (Expo):** 
    - [x] UI modernizada para resultados y fichas de partidos.
    - [x] Sincronización de modelos de API mediante Orval.
    - [x] Gestión de sesiones con SecureStore.

## Fase 5: Pulido Final y Optimizaciones (En Progreso)
- [x] **Mejoras de UI/UX:**
    - [x] Sistema dinámico de escudos de clubes desde el panel administrativo.
    - [x] Detalles técnicos en obleas (Fase, Nro. Fecha, Condición).
    - [x] Rediseño de cabeceras y estados de carga (Skeletons).
    - [x] Mejora en la visualización de la ficha técnica para usuarios Premium.
    - [x] **Filtros Avanzados en Partidos:** Implementación de selectores para Rival, Estadio, Árbitro, Torneo, Nivel, Condición y rango de fechas con lógica de tiers y etiquetas superiores.
    - [x] **Optimización de Layout:** Rediseño de la grilla de filtros y eliminación de buscadores redundantes.
    - [x] **Racha de Resultados:** Implementación de visualización cronológica (Form Guide) con restricción Premium (efecto blur).
    - [x] **Tablero de Resumen en Partidos:** Implementación de panel de estadísticas globales (PJ, PG, PE, PP, GF, GC, DG) basado en los filtros aplicados, con desglose detallado por condición (Local, Visitante, Neutral) y fondo resaltado (negro), con restricción Premium (efecto blur) en las páginas de Partidos (Web y Mobile).
- [x] **Robustecimiento Técnico:**
    - [x] Refactorización de la suite de tests para usar SQLite en memoria (Aislamiento total).
    - [x] Implementación de paginación para búsquedas Premium en el frontend web.
    - [x] Mejora en el análisis y procesamiento de goles.
- [x] **Correcciones Críticas:**
    - [x] Ajustes de fechas locales y filtros de tiempo ("Hoy", "Un día como hoy").
    - [x] Configuración de Mailpit para entorno de desarrollo.
    - [x] Solución de errores de hidratación en Next.js y manejo de Client Components.

## Fase 6: Estadísticas Avanzadas y Engagement (En Progreso)
- [x] **Sección de Torneos:**
    - [x] **Backend:** 
        - [x] Implementación de filtros de búsqueda (`q`) y año (`año`) en `TorneoController`.
        - [x] Lógica de cálculo de estadísticas avanzadas (PJ, PG, PE, PP, GF, GC, DG, Efectividad, Vallas Invictas) en el modelo `Torneo`.
        - [x] Segmentación de datos en `TorneoResource` según el rol del usuario (Premium vs Free).
        - [x] Soporte de paginación real en la API de torneos.
    - [x] **Frontend Web:** 
        - [x] Implementación de listado de torneos con paginación y búsqueda.
        - [x] Lógica de restricción dinámica para usuarios Free (límite de 10 resultados).
        - [x] Rediseño completo de la ficha de detalle del torneo (`/torneos/[id]`) con:
            - [x] Listado detallado de partidos con escudos y resultados visuales.
            - [x] Visualización de racha (Form Guide) interactiva para usuarios Premium.
            - [x] Gráficos de efectividad y desglose de estadísticas (Puntos, DG, Vallas Invictas).
            - [x] Integración de componentes de análisis de goles (`GoalsAnalysis`, `GoalMethodAnalysis`).
        - [x] **UI/UX:** Ocultamiento del dato "Id" en las tarjetas de torneos para una interfaz más limpia.
    - [x] **Frontend Mobile:** 
        - [x] Rediseño de la pantalla de estadísticas (`stats.tsx`) con tarjetas interactivas y año del torneo.
        - [x] Implementación de gráficos de torta (PieChart) para el desglose de resultados (Premium).
        - [x] Banners de conversión y bloqueo de estadísticas avanzadas para usuarios Free.
- [x] **Mejoras de Navegación y Componentes:**
    - [x] Creación del componente reutilizable `GoBack` para mejorar el flujo de navegación en el frontend web.
    - [x] Unificación de escudos oficiales y de clubes en las vistas de detalle.
- [ ] Sistema de notificaciones push para recordatorios históricos.
- [ ] Refactorización de visualizaciones de estadísticas dinámicas.
