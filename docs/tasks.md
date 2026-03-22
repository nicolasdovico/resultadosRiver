# Plan de Ejecución: Fase 4 - Desarrollo Frontend y Mobile

El objetivo es construir las interfaces Web y Mobile consumiendo la API de forma tipada y desarrollando los componentes exclusivos para usuarios Premium.

## 4.1. Generación de Clientes y Tipado (Agent-First: Paso 3) [HECHO]

- [x] **Autogeneración de SDK:** Utilizar el archivo `swagger.json` generado en la Fase 2 para crear automáticamente los servicios, hooks (SWR o React Query) y tipos de TypeScript en `/frontend-web` y `/frontend-mobile`.
- [x] **Capa de Abstracción de API:** Configurar los interceptores de Axios/Fetch para manejar automáticamente el token de **Sanctum** y la renovación de sesiones.
- [x] **Sincronización de Modelos:** Asegurar que las interfaces de TypeScript coincidan exactamente con los modelos de Eloquent (Jugadores, Partidos, etc.).

## 4.2. Desarrollo Web (Next.js) [HECHO]

- [x] **Estructura de Rutas y SEO:** Configurar el enrutamiento dinámico para partidos y torneos, implementando **Server-Side Rendering (SSR)** para maximizar el posicionamiento en buscadores.
- [x] **Dashboard de Resultados:** Crear la vista principal con el motor de filtros (Nivel de torneo, Rival, Técnico, etc.).
- [x] **Implementación de PWA:** Configurar el `manifest.json` y Service Workers para permitir la instalación de la web como una aplicación en el escritorio.
- [x] **Sección Premium (Gráficos):** Desarrollar los componentes de gráficos interactivos (rendimiento, posesión histórica, efectividad) utilizando librerías como Chart.js o Recharts.

## 4.3. Desarrollo Mobile (Expo / React Native) [HECHO]

- [x] **Navegación Mobile:** Configurar React Navigation (Tabs y Stack) para una navegación fluida entre resultados, posiciones y perfil.
- [x] **Vistas Nativas:** Adaptar los componentes de filtrado y búsqueda para una experiencia táctil óptima.
- [x] **Integración de MercadoPago (Mobile):** Implementar el flujo de pago dentro de la app (Webview o integración nativa) para la suscripción Premium.
- [x] **Gráficos Mobile:** Implementar versiones optimizadas de los gráficos de rendimiento para pantallas pequeñas.

## 4.4. Panel Administrativo (Frontend) [HECHO]

- [x] **Módulo Data Entry:** Construir los formularios de carga y edición para todos los catálogos (Árbitros, Estadios, Jugadores, etc.) con validaciones en tiempo real.
- [x] **Gestión de Partidos:** Desarrollar la interfaz compleja para la carga de eventos detallados de cada encuentro.
- [x] **Control de Usuarios:** Crear la tabla de administración para que el Super Administrador gestione roles y precios.