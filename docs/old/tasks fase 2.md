# Plan de Ejecución: Fase 2 - Backend Core y Contratos de API

El objetivo de esta fase es transformar la base de datos histórica importada en una API funcional, documentada y segura bajo el estándar OpenAPI.



## 2.1. Refactorización y Extensión de Base de Datos (PostgreSQL)

- [ ] **Migraciones de Adaptación:** Crear migraciones en Laravel para las tablas históricas existentes a fin de que el framework las reconozca (agregando `timestamps` si es necesario).

  

  

- [ ] **Tablas de Seguridad (RBAC):** Implementar las tablas para Roles (Super Admin, Data Entry, Free, Premium) y Permisos.

  

  

- [ ] **Tabla de Auditoría OTP:** Crear la estructura para almacenar los códigos OTP, su timestamp de creación y contador de intentos fallidos.

  

  

- [ ] **Tablas de Suscripción:** Crear las tablas `subscriptions` y `payments` para registrar las transacciones de MercadoPago y la vigencia semestral.

  

  

## 2.2. API Contract: Modelos y Relaciones (Agent-First: Paso 1)

- [ ] **Modelos Eloquent:** Definir los modelos para Árbitros, Estadios, Jugadores, Rivales, Torneos, Técnicos, Fases y Partidos, asegurando que reflejen fielmente la estructura histórica.

  

  

- [ ] **Definición de Relaciones:** Establecer las relaciones `hasMany`, `belongsTo` y `belongsToMany` (ej. Jugadores en un Partido, Torneos y sus Fases).

  

  

- [ ] **Resources (Transformación):** Crear Laravel API Resources para estandarizar la salida JSON de cada entidad hacia el frontend.

## 2.3. Endpoints de Gestión y Consulta

- [ ] **Endpoints Administrativos (CRUD):** Desarrollar los controladores con los métodos `index`, `store`, `update` y `destroy` para todos los catálogos (solo accesibles para Super Admin/Data Entry).

  

  

- [ ] **Endpoints de Búsqueda y Filtros:** Implementar la lógica de filtrado para los usuarios:

  - Por nivel de torneo, nombre, fechas, rival, árbitro, estadio y técnico.

    

    

- [ ] **Lógica de Acceso Diferenciado:** Implementar Middleware para restringir la profundidad de la información y la visualización de gráficos según el rol (Free vs. Premium).

  

  

## 2.4. Documentación Automática (Agent-First: Paso 2)

- [ ] **Anotaciones OpenAPI:** Integrar las etiquetas de **L5-Swagger** en los controladores y modelos para definir parámetros, tipos de datos y respuestas esperadas.

  

  

- [ ] **Generación del JSON/YAML:** Ejecutar el comando de generación para producir el archivo `swagger.json` que servirá de insumo para los agentes de IA del frontend.

  

  

- [ ] **Publicación de UI Swagger:** Habilitar la ruta `/api/documentation` para que el equipo (o agentes) puedan testear los endpoints en tiempo real.

  

  

## 2.5. Configuración de Seguridad y API Auth

- [ ] **Sanctum Setup:** Configurar **Laravel Sanctum** para el manejo de tokens de API persistentes.

  

  

- [ ] **CORS Policy:** Configurar las políticas de acceso para permitir peticiones únicamente desde los dominios del frontend web y mobile.

  

  