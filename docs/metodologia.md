# Metodología de Desarrollo: Ciclo Fullstack Iterativo

Para que el desarrollo fluya sin fricciones, el proyecto sigue un enfoque de **"API-First & Feature-Driven Development"**. 

A diferencia de un enfoque por capas (todo el backend y luego todo el frontend), aquí completamos cada funcionalidad de forma vertical.

---

## El Ciclo de Vida de una Feature (El Bucle Obligatorio)

Cada tarea o funcionalidad nueva debe pasar por estos tres estadios antes de considerarse "Terminada":

### 1. El Cerebro (Backend & Backoffice)
*   **Modelado:** Crear migraciones y modelos.
*   **Admin:** Crear el recurso en **Filament** para que el administrador pueda gestionar los datos inmediatamente.
*   **Lógica:** Implementar servicios, jobs o lógica de negocio necesaria.
*   **Tests:** Crear tests unitarios para validar la lógica.

### 2. El Contrato (API & Swagger)
*   **Endpoints:** Crear controladores de API.
*   **Estandarización:** Utilizar **JsonResources** de Laravel para todas las respuestas.
*   **Documentación:** Anotar los métodos con atributos de **OpenAPI/Swagger**.
*   **Regeneración:** Ejecutar el comando para actualizar `api-docs.json`.
*   **Verificación:** El frontend **nunca** debe adivinar; debe leer el contrato actualizado.

### 3. La Cara (Frontend Mobile/Web)
*   **Servicios:** Crear o actualizar el servicio en TypeScript en `frontend/services/`.
*   **UI/UX:** Desarrollar las pantallas y componentes en Expo/React Native.
*   **Integración:** Conectar con la API y manejar estados de carga, éxito y error.

---

## Reglas de Calidad

1.  **Strict Docker Mode:** Todos los comandos y tests deben ejecutarse dentro de los contenedores Docker.
2.  **No hay Frontend sin API:** No se inicia el desarrollo visual de una feature si su endpoint no está documentado en Swagger.
3.  **Autoría:** Todos los cambios deben realizarse bajo la identidad del usuario configurada (`git config user.name`).
4.  **Zero Regressions Policy:** Ninguna funcionalidad se considera terminada si los tests existentes fallan. El desarrollo es incremental y seguro.

---

## Comandos Frecuentes

*   **Backend Tests:** `docker compose exec backend php artisan test`
*   **Swagger Update:** `docker compose exec backend php artisan l5-swagger:generate`
*   **Frontend Check:** `docker compose exec frontend npm run lint` (si está configurado)
