# 🔐 Guía de Autenticación y Roles - Articademy

Este documento explica el flujo técnico y lógico de cómo funciona el inicio de sesión y la gestión de permisos en **Articademy**, basado en los tres roles principales: `ADMIN`, `MENTOR` y `USER` (Alumno).

---

## 🏗️ Estructura de Seguridad
La seguridad no solo se verifica al entrar, sino que existe un triple candado:
1.  **Pre-Login Check:** Valida el estado antes de iniciar sesión para dar feedback inmediato.
2.  **Auth Guard (NextAuth):** Bloqueo a nivel de servidor durante la creación del token.
3.  **Real-Time Guard:** Sincronización cada 5 segundos para expulsar o reactivar usuarios sin que refresquen la página.

---

## 👥 Flujo por Rol

### 1. 🛡️ Administrador (`ADMIN`)
*   **Acceso:** Total e inmediato.
*   **Gestión:** Puede aprobar mentores, desactivar alumnos y gestionar todo el contenido.
*   **Seguridad:** El sistema impide que un administrador se elimine a sí mismo para evitar bloqueos de emergencia.

### 2. 🎓 Mentor (`MENTOR`)
Los mentores pasan por un proceso de validación manual.
*   **Registro:** Se registran a través de `/auth/signup-mentor`.
*   **Estado Pendiente:** Si un mentor intenta entrar y no ha sido aprobado (`isApproved: false`):
    *   El sistema intercepta el login.
    *   Muestra una pantalla de **"Cuenta en revisión"** con un progreso de 3 pasos.
    *   No se genera sesión de usuario en el navegador.
*   **Aprobación:** Una vez que el `ADMIN` lo aprueba desde el panel, el mentor puede entrar a su Dashboard privado.

### 3. 📖 Alumno / Usuario (`USER`)
Los alumnos son usuarios activos por defecto, pero sujetos a políticas de seguridad.
*   **Estado Activo:** Acceso normal al Dashboard y sus cursos.
*   **Suspensión Temporal (`isActive: false`):** Un administrador puede suspender a un alumno seleccionando una razón específica:
    *   *Uso de tarjetas dudosas.*
    *   *Inyección de código.*
    *   *Compartir credenciales.*
    *   *Piratería / Grabación de contenido.*
    *   *Distribución de materiales.*
*   **Bloqueo en vivo:** Si el alumno está dentro del sistema y es suspendido:
    *   En menos de **5 segundos**, su pantalla se bloquea automáticamente.
    *   Aparece una pantalla roja de **"Sesión Terminada"** con el motivo exacto.
    *   Se le obliga a cerrar sesión.

---

## ⚙️ Componentes Técnicos Clave

### `checkPreloginStatus` (Acción de Servidor)
Ubicada en `lib/actions/auth.ts`, esta función se ejecuta en el cliente antes de llamar a NextAuth. Valida contra la base de datos si el usuario tiene permitido el paso según su rol y estado.

### `RealTimeGuard` (Componente React)
Ubicado en `components/RealTimeGuard.tsx`, este componente se inyecta en el layout del dashboard. Utiliza el `SessionProvider` con un `refetchInterval` de 5 segundos para detectar cambios en el campo `isActive` de la base de datos y forzar la recarga del sitio si detecta una anomalía.

### `lib/auth.ts` (Configuración NextAuth)
Configura los callbacks de `jwt` y `session`. Es el responsable de incluir los campos `role`, `isApproved` e `isActive` dentro del token encriptado que viaja en la cookie del navegador.

---

> [!IMPORTANT]
> **Articademy** prioriza la integridad de los contenidos. Cualquier intento de piratería o inyección detectado por el administrador resulta en una expulsión inmediata del sistema sin pérdida de logs de actividad para auditoría futura.
