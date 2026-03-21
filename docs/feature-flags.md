# Mecanismo de Feature Flags (ProDeportivo)

Este proyecto implementa un sistema de **Feature Flags** con un esquema de **Override Jerárquico**. Su objetivo principal es permitir el testeo de funcionalidades críticas (como pasarelas de pago) en el entorno de producción de forma segura, habilitándolas solo para usuarios específicos (testers) antes del lanzamiento global.

## 1. Arquitectura y Lógica de Precedencia

La evaluación de una Feature Flag sigue este orden de prioridad estricto:

1.  **User Override (Alta Precedencia):** Se define en la tabla pivote `feature_user`. Si un usuario tiene asignado un valor (ON u OFF) para una flag específica, este valor prevalece sobre cualquier otra configuración.
2.  **Global Status (Media Precedencia):** Se define en la tabla `features`. Es el estado por defecto para todos los usuarios que no tienen un override asignado.
3.  **Fallback (Baja Precedencia):** Si la flag no existe en la base de datos o hay un error de conexión, el sistema devuelve `false` por seguridad.

---

## 2. Implementación en el Backend (Laravel)

### Componentes Clave
- **Modelo:** `App\Models\Feature`. Gestiona la configuración global.
- **Relación:** El modelo `User` tiene una relación `belongsToMany(Feature::class)` para gestionar los overrides a través de la tabla `feature_user`.
- **Servicio:** `App\Services\FeatureService`. Centraliza la lógica de evaluación:
    - `isEnabled(string $key, ?User $user)`: Retorna si la flag está activa para ese usuario.
    - `getAllForUser(?User $user)`: Retorna un mapa de todas las flags y sus estados.
- **API:** Endpoint `GET /api/features` (protegido por `auth:sanctum`) para que el Frontend consuma los estados actualizados.

### Gestión Administrativa (Filament)
La gestión se realiza desde el panel de administración en **Settings > Features**.
- **Crear/Editar Flag:** Permite definir el `key` único, descripción y estado global.
- **Gestionar Overrides:** Dentro de la edición de una Flag, la sección **Users** permite añadir usuarios específicos y forzar su estado individualmente (Toggle "Override status").

---

## 3. Implementación en el Frontend (React Native / Expo)

### Infraestructura
- **Servicio:** `frontend/services/features.ts`. Realiza la llamada a la API.
- **Contexto:** `FeatureProvider` en `frontend/context/FeatureContext.tsx`. Envuelve la aplicación para proveer el estado de las flags de forma global.
- **Hook:** `useFeatures()`. Proporciona acceso a las flags y a la función de verificación.

### Ejemplo de Uso en Componentes
```tsx
import { useFeatures } from '@/context/FeatureContext';

export default function MiComponente() {
  const { isFeatureEnabled, isLoading } = useFeatures();

  if (isLoading) return <ActivityIndicator />;

  return (
    <View>
      {isFeatureEnabled('nueva_funcionalidad') && (
        <BotonEspecial />
      )}
    </View>
  );
}
```

---

## 4. Guía para Desarrolladores: Cómo agregar una nueva Flag

1.  **Registro:** Crea la flag en el panel de administración de Filament (o añádela al `FeatureSeeder.php` si debe persistir entre instalaciones limpias).
2.  **Backend (Opcional):** Si la lógica de negocio en el servidor debe estar protegida, usa `FeatureService::isEnabled()`.
3.  **Frontend:** Usa el hook `useFeatures()` y el método `isFeatureEnabled('tu_key')` para condicionar el renderizado de la UI o la lógica de navegación.

---

## 5. Flags Iniciales Configuradas

- `premium_access`: Controla la visibilidad de la sección de beneficios Premium y botones de compra.
- `payment_gateway_mercadopago`: Habilita/Deshabilita específicamente la opción de MercadoPago.
- `payment_gateway_stripe`: Habilita/Deshabilita específicamente la opción de Stripe.
