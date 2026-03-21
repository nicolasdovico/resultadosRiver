# Plan de Ejecución: Fase 3 - Lógica de Negocio y Seguridad

El objetivo principal es implementar la autenticación reforzada, la integración con MercadoPago y el procesamiento de tareas en segundo plano mediante Redis.

## 3.1. Autenticación y Seguridad Avanzada

- [x] **Flujo de Registro de Usuarios:** Implementar el endpoint de registro para usuarios visitantes (Free).
- [x] **Sistema de Código OTP:**
  - [x] Desarrollar la lógica de generación de códigos aleatorios únicos.
  - [x] Configurar el envío de correos electrónicos con el código de verificación.
  - [x] Implementar la validación con ciclo de vida de 5 minutos y bloqueo tras 3 intentos fallidos consecutivos para prevenir fuerza bruta.
- [x] **Autogestión de Credenciales:** Desarrollar los endpoints para que el usuario pueda recuperar y cambiar su contraseña de acceso.

## 3.2. Integración de Pagos (MercadoPago)

- [x] **Configuración del SDK:** Integrar el SDK oficial de MercadoPago en el backend de Laravel.
- [x] **Generación de Preferencias:** Crear el servicio para generar "Preferencias de Pago" basadas en el valor de la suscripción definido en el panel administrativo.
- [x] **Gestión de Webhooks (IPN):**
  - [x] Exponer un endpoint seguro para recibir notificaciones de pago en tiempo real.
  - [x] Implementar la validación de firmas de MercadoPago para asegurar la autenticidad de las notificaciones.

## 3.3. Procesamiento en Segundo Plano (Redis & Workers)

- [x] **Configuración de Colas:** Configurar Laravel para utilizar **Redis** como driver de colas para el manejo de tareas pesadas.
- [x] **Workers de Notificación:** Encolar el envío de correos (OTP y confirmaciones de pago) para no bloquear la respuesta de la API.
- [x] **Actualización Automática de Roles:** Desarrollar un Job que se dispare tras el Webhook para elevar el usuario a **Premium** y otro para revocar el acceso al expirar la suscripción semestral.

## 3.4. Panel de Administración y Parámetros

- [x] **Gestión de Usuarios:** Implementar la interfaz administrativa para visualizar, editar roles y dar de baja usuarios.
- [x] **Configuración Financiera:** Desarrollar el módulo de parámetros globales para que el Super Administrador defina el costo de la suscripción semestral.

## 3.5. Finalización del Contrato de API (Agent-First)

- [x] **Actualización de Swagger:** Documentar los nuevos endpoints de autenticación, pagos y perfiles de usuario en L5-Swagger.
- [x] **Validación de Tipos:** Asegurar que todos los esquemas de respuesta para usuarios Premium (gráficos y estadísticas extendidas) estén definidos para la siguiente fase de generación de clientes.
