# Integración de Videos y Streaming (Preparación para Cloudflare Stream)

Este documento detalla los ajustes realizados en la plataforma para permitir la inclusión de videos y streaming en vivo, dejando el sistema preparado para **Cloudflare Stream** o cualquier otro proveedor *serverless video delivery*.

## 1. Estructura de Base de Datos
Se ha flexibilizado la forma en la que los cursos y módulos manejan el contenido de video:

- **En la tabla `Curso`**: 
  - `introVideo`: Guarda la URL obligatoria/opcional o el ID de Cloudflare Stream del tráiler comercial.
  - `isLive`: Bandera (booleano) que determina si el curso tiene un evento en vivo.
  - `liveUrl`: URL del streaming en vivo (En el futuro, esto apuntará a el endpoint HLS / WebRTC de Cloudflare).

- **En la tabla `CourseModule` (Nueva Estructura)**:
  - Hemos movido la propiedad del video para que pertenezca al **Módulo** (`videoUrl`).
  - Las tareas o "lecciones" (`Lesson`) dentro del módulo ahora son exclusivamente descripciones textuales y referencias a tiempos. El video madre gobierna el módulo completo.

## 2. Flexibilidad de Enlaces (`getEmbedUrl`)
Actualmente todos los inputs para "Video URL" reciben simples cadenas de texto de tipo URL.

**Cómo funciona en modo Desarrollo Local:**
El sistema procesa y limpia automáticamente URLs de YouTube y Vimeo convirtiéndolas a su respectiva versión `/embed/`. 

**Preparación para Cloudflare:**
El parser de URLs está diseñado para pasar inyectar URLs nativas. Si pegas un Iframe Link nativo de Cloudflare Stream (Ejemplo: `https://iframe.videodelivery.net/5d5bc37ffcf54c9b82e996823bffbb81`), el sistema simplemente lo pasará al reproductor de la interfaz sin romper el diseño, puesto que los iframes tienen aplicadas clases `absolute inset-0 w-full h-full` de Tailwind.

## 3. Manejo de Fallbacks (Estados opcionales)
Como estamos trabajando en local, se implementaron "Fallbacks" para evitar cierres de UI o iframes rotos en caso de que los mentores dejen links vacíos:

- **Si la URL del Intro no existe:** El sistema oculta el ifame y muestra un recuadro de diseño oscuro (`#1A1A2E`) con un botón de Play translúcido que indica **"Tráiler no configurado"**.
- Debajo del video se integró una etiqueta estilizada (`¿De qué trata este curso?`) que evita que el botón y el precio floten sin sentido.

## 4. Próximos pasos para pasar a Producción (Cloudflare Stream)

Cuando estemos listos para integrar **Cloudflare Stream** de forma oficial, implementaremos el siguiente **Flujo de Carga "Invisible"** para optimizar el rendimiento de los servidores de la Academia:

### Flujo de Subida del Mentor (Ej: Michelle)
1. **Solicitud de Permiso**: Cuando el Mentor hace clic en "Subir Video" en el Dashboard, la plataforma envía una petición silenciosa a Cloudflare para solicitar una `"Direct Creator Upload URL"` temporal y única.
2. **Carga Directa**: El navegador del Mentor toma el archivo `.mp4` y lo comienza a subir **directamente** a los servidores de Cloudflare a través de esa URL generada, sin pasar por los servidores de Articademy. Durante este proceso, se mostrará una barra de progreso en vivo en la interfaz de creación.
3. **Confirmación**: Una vez completada la subida, Cloudflare emite una respuesta de éxito confirmando que ya tiene procesado el archivo e informando a la academia el ID único generado (Ej: `videoUid: "abcd-1234"`).
4. **Registro local de Prisma**: El Server Action intercepta este `videoUid` y es esto lo que verdaderamente se guarda en la base de datos (SQLite/PostgreSQL) vinculándolo directamente al módulo y curso correspondiente.

### Adaptación de Componentes Finales
Para hacer posible lo anterior, editaremos:
- **`CreateCoursePage`**: Reemplazando los inputs de texto por zonas tipo *Drag'n'Drop*.
- **`CourseDetailClient` / `LessonPage`**: Reemplazando los reproductores clásicos `<iframe>` por el `<Stream>` React Component proporcionado nativamente por la librería `@cloudflare/stream-react`.

## 5. Arquitectura de Transmisión en Vivo (Cloudflare Live)

Para las clases en vivo, la plataforma seguirá un flujo de 3 fases diseñado para maximizar la calidad y minimizar el uso de recursos locales:

### Fase 1: Generación de Credenciales (Panel del Mentor)
Al activar la opción "Clases en Vivo", Articademy interactúa con la API de Cloudflare (`POST /stream/live_inputs`) para obtener:
- **RTMPS Server URL**: El punto de entrada para los datos de video.
- **Stream Key**: La llave única y privada de ese curso.
*Nota: Actualmente estas llaves se presentan como un "mockup" visual en el panel de gestión hasta completar la integración de la API.*

### Fase 2: Conexión del Mentor (OBS / Streamyard)
El mentor no transmite desde el navegador. Utiliza software especializado (OBS Studio es el estándar):
1. El mentor copia la URL y la Key de Articademy.
2. Las pega en la configuración de **Emisión** de su software.
3. Al iniciar la transmisión (Start Streaming), los datos viajan directamente a la red global de Cloudflare.

### Fase 3: Visualización y Grabación Automática
- **Alumno**: El reproductor en `CourseDetail` detecta la señal activa y muestra el estado `🔴 EN VIVO`.
- **Grabación**: Cloudflare graba la sesión de forma nativa. Al terminar el directo, el video se procesa automáticamente y queda disponible como "Replay" para los alumnos que no pudieron asistir, sin intervención manual del mentor.

## 6. Lógica de Interfaz (Local Sync)
Para evitar confusión en el Mentor:
- Si **In Live** está activo: El campo de "Video del Módulo" se oculta automáticamente.
- El sistema prioriza el "Streaming URL" (Campo naranja) sobre los videos pregrabados individuales por módulo.
