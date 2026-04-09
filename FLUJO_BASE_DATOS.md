# Arquitectura y Flujo de Datos - ARTICADEMY

Este documento detalla la estructura de la base de datos (ERD) y los flujos lógicos principales de la plataforma.

## 1. Diagrama de Entidad Relación (ERD)

A continuación se muestra la estructura actual de las tablas y sus conexiones.

```mermaid
erDiagram
    USER ||--o{ CURSO : "instruye"
    USER ||--o{ TALLER : "imparte"
    USER ||--o{ INSCRIPCION : "realiza"
    USER ||--o| SUBSCRIPTION : "posee"
    USER ||--o| ACTIVITY_LOG : "genera"

    SUBSCRIPTION {
        string plan "BASIC | STANDARD | PREMIUM"
        string status "ACTIVE | EXPIRED"
    }

    CURSO ||--o{ COURSE_MODULE : "contiene"
    COURSE_MODULE ||--o{ LESSON : "tiene"
    CURSO ||--o{ INSCRIPCION : "recibe"

    TALLER ||--o{ TALLER_MODULE : "organiza"
    TALLER_MODULE ||--o{ TALLER_TOPIC : "desglosa"
    TALLER ||--o{ INSCRIPCION : "recibe"

    INSCRIPCION {
        string status "PENDING | APPROVED | REJECTED"
        float amountPaid
        string method "Zelle | USDT | BCV"
    }
```

---

## 2. Flujo Lógico de Inscripción

El siguiente proceso describe cómo un Alumno accede a un curso o taller:

```mermaid
graph TD
    A[Alumno selecciona Curso/Taller] --> B{¿Está registrado?}
    B -- No --> C[Redirigir a Registro]
    B -- Sí --> D[Seleccionar Método de Pago]
    D --> E[Subir Comprobante / Referencia]
    E --> F[Crear Inscripción: PENDING]
    F --> G[Admin revisa Auditoría/Pagos]
    G --> H{¿Pago Válido?}
    H -- Sí --> I[Cambiar Status: APPROVED]
    H -- No --> J[Cambiar Status: REJECTED]
    I --> K[Curso desbloqueado para el Alumno]
```

---

## 3. Lógica de Suscripciones vs Pagos Únicos

La plataforma permite dos modelos de negocio paralelos:

| Modelo | Funcionamiento | Relación en BD |
| :--- | :--- | :--- |
| **Pago Único** | El alumno paga por un curso específico una sola vez. | Genera una `Inscription` vinculada a ese `CursoId`. |
| **Suscripción** | El alumno paga una membresía mensual para acceder a múltiples cursos. | Genera un registro en `Subscription` con un `plan`. |

### Niveles de Acceso por Plan:
- **Plan Esencial (BASIC)**: Solo permite ver cursos donde `level == "Principiante"`.
- **Plan Profesional (STANDARD)**: Permite `Principiante` e `Intermedio`.
- **Plan Elite (PREMIUM)**: Acceso total a todo el catálogo.

---

## 4. Auditoría y Seguridad
Cada acción crítica (crear curso, borrar usuario, aprobar pago) genera un registro en **ActivityLog**, permitiendo al Administrador ver quién hizo qué y cuándo en el módulo de Auditoría.
