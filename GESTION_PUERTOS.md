# Guía de Gestión de Puertos y Reinicio

Esta guía te ayudará a liberar los puertos ocupados (especialmente cuando el servidor se queda "colgado") y reiniciar el proyecto `ARTICADEMY`.

## 1. Liberar Puertos con `kill-port`

Si al intentar ejecutar el proyecto recibes un error tipo `EADDRINUSE`, significa que el puerto ya está siendo usado por otro proceso. Puedes cerrarlo fácilmente usando `kill-port`.

### Sin instalar nada (Recomendado)
Puedes ejecutarlo directamente usando `npx`:

```bash
# Para cerrar el puerto de Next.js (por defecto 3000)
npx kill-port 3000

# Para cerrar el puerto de Prisma Studio (por defecto 5555)
npx kill-port 5555
```

### Comandos nativos (Windows)
Si prefieres no usar dependencias externas, puedes usar el CMD/PowerShell:

```powershell
# Buscar el PID que usa el puerto 3000
netstat -ano | findstr :3000

# Cerrar el proceso (reemplaza PID por el número que salió arriba)
taskkill /F /PID <PID>
```

---

## 2. Reiniciar el Proyecto

Una vez liberados los puertos, sigue estos pasos para volver a ejecutar el entorno completo:

1. **Sincronizar Base de Datos:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

2. **Ejecutar Servidor de Desarrollo:**
   ```bash
   npm run dev
   ```

3. **Ejecutar Prisma Studio (Opcional):**
   ```bash
   npx prisma studio
   ```

---

## 3. Automatización (Opcional)

Si deseas añadir accesos directos a tu `package.json`, puedes agregar estos scripts:

```json
"scripts": {
  "stop": "npx kill-port 3000 5555",
  "clean-start": "npm run stop && npm run dev"
}
```

> [!IMPORTANT]
> **Permisos de Administrador**: En algunos casos, cerrar puertos requiere que la terminal tenga permisos de administrador si el proceso fue iniciado por un servicio del sistema.
