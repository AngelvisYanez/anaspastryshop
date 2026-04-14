---
name: "Webinar Participant Controls"
overview: "Extender el panel de control de participantes del host con expulsión, toggle de audio/video, y reforzar en el backend los límites de aforo y entrada múltiple por dispositivo."
todos:
  - id: "host-panel-controls"
    content: "Actualizar WebinarHostPanel.tsx: toggle bidireccional de audio/video, añadir función kick y botón Expulsar (UserX) en las secciones on-stage y off-stage"
    status: not_started
  - id: "api-limits"
    content: "Actualizar app/api/webinars/[id]/room/route.ts: consultar participants activos de RTK para validar límite de aforo y bloquear sesiones duplicadas por userId"
    status: not_started
createdAt: "2026-04-14T18:22:29.000Z"
updatedAt: "2026-04-14T18:22:29.000Z"
---

# Plan: Mejoras al Control de Participantes en Webinars

## Archivos a modificar

| Archivo | Cambio |
|---|---|
| `app/webinars/[id]/WebinarHostPanel.tsx` | Botón expulsar, toggle audio/video bidireccional |
| `app/api/webinars/[id]/room/route.ts` | Límite de aforo + bloqueo multi-dispositivo |

## Cambios detallados

### 1. `WebinarHostPanel.tsx` — Controles de host mejorados

**Toggle audio/video bidireccional (actualmente solo deshabilita):**
```ts
async function toggleAudio(participant: any) {
  try {
    if (participant.audioEnabled) await participant.disableAudio();
    else await participant.enableAudio();
  } catch {}
}
async function toggleVideo(participant: any) {
  try {
    if (participant.videoEnabled) await participant.disableVideo();
    else await participant.enableVideo();
  } catch {}
}
```

**Expulsar participante:**
```ts
async function kickParticipant(participant: any) {
  try { await participant.kick(); } catch {}
}
```

**UI:** Agregar botón "Expulsar" (icono `UserX`) en las secciones "En escenario" y "Espectadores". Mostrar el conteo actual en el header del panel.

### 2. `app/api/webinars/[id]/room/route.ts` — Límites server-side

Después de validar la suscripción y antes de generar el token, si el meeting ya existe (`meetingId`) hacer un solo GET a la API de RTK:

```ts
const participantsRes = await fetch(`${BASE}/meetings/${meetingId}/participants`, { headers: HEADERS });
const participantsJson = await participantsRes.json();
const activeParticipants: any[] = participantsJson.data ?? [];
```

**Límite de aforo (`maxParticipants`):**
- Solo aplica a no-staff
- Si `activeParticipants.length >= webinar.maxParticipants` → `403` con mensaje claro

**Bloqueo multi-dispositivo:**
- Para todos (incluyendo staff)
- Si algún participante tiene `custom_participant_id === session.user.id` ya en la lista → `403` con "Ya tienes una sesión activa en este webinar"

## Scope

**IN:**
- Toggle audio/video del host sobre participantes en escenario
- Botón expulsar para participantes en escenario y espectadores
- Enforcement de `maxParticipants` (ya existe en BD) en el API route
- Bloqueo de entrada desde múltiples dispositivos (mismo `userId`)

**OUT:**
- Cambios al formulario de creación/edición de webinar
- Schema de Prisma (no se requieren cambios)
- Panel del participante (`WebinarParticipantBar.tsx`)
- Lógica de grants de stage (ya funciona correctamente)

## Verificación

1. Host puede silenciar/activar audio de un participante en escenario
2. Host puede apagar/encender video de un participante en escenario
3. Botón "Expulsar" remueve al participante de la sala completamente
4. Si el webinar tiene `maxParticipants = 5` y hay 5 activos, el 6to recibe error
5. Si el usuario intenta abrir el webinar en un segundo navegador/tab, recibe error "sesión activa"
