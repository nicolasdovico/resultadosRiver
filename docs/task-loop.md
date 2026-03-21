# Task Resolve Loop (RALPH Methodology)

Este documento define el flujo de trabajo automatizado para la resolución de tareas. 

## Principios Core
- **Feature-Driven:** Cada tarea debe completar el ciclo funcional (Backend -> API -> Frontend).
- **Test-Driven:** Ningún cambio de lógica se considera terminado sin pasar los tests unitarios y de integración.
- **Containerized:** Todos los tests y comandos DEBEN ejecutarse dentro de contenedores Docker.
- **Atomic Commits:** Cada resolución de tarea resulta en un commit convencional bajo la autoría del usuario configurado.

## El Bucle de Iteración (Loop)
1.  **Context Check:** Leer `docs/progress.txt` y `docs/status.md` para entender el estado actual.
2.  **Selección:** Identificar la siguiente tarea pendiente en el backlog activo (ej: `docs/tasks_fase3_frontend.md`).
3.  **Implementación Backend:**
    *   Crear Modelos/Migraciones/Filament.
    *   Ejecutar `docker compose exec backend php artisan test`.
4.  **Actualización de Contrato (API):**
    *   Crear/Actualizar controlador de API y JsonResources.
    *   Ejecutar `docker compose exec backend php artisan l5-swagger:generate`.
    *   Verificar que `storage/api-docs/api-docs.json` refleje los cambios.
5. **Implementación Frontend:**
    * Crear/Actualizar servicios en TypeScript.
    * Desarrollar componentes y pantallas.
    * Verificar visualmente (o con tests si existen).
6.  **Validación de Regresión (OBLIGATORIO):**
    * Ejecutar `./test.sh` en la raíz del proyecto.
    * Verificar que los tests de la tarea actual Y los tests previos pasan al 100%.
7.  **Persistencia:**
    * `git add .`
    * `git commit -m "type: descripción clara del cambio"`
    * Marcar tarea como `[x]` en el archivo de backlog correspondiente.
    * Actualizar `docs/progress.txt` y `docs/status.md`.
8.  **Push:** Realizar `git push` al repositorio remoto.

## Logging
El historial de ejecución se guarda en `ralph-log.md`. Este archivo se mantiene rotado para eficiencia del contexto.
