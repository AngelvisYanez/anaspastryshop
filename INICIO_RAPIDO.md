# ARTICADEMY - Comandos de Inicio

Este archivo contiene los comandos básicos para inicializar y ejecutar el proyecto rápidamente.

## 🚀 Inicio del Proyecto (Entorno de Desarrollo)

Para iniciar el servidor de desarrollo de Next.js, ejecuta:

```bash
npm run dev
```

---

## 🗄️ Inicializar Prisma (Base de Datos)

Si acabas de clonar el proyecto o has realizado cambios en el esquema de la base de datos (`prisma/schema.prisma`), ejecuta estos comandos en orden:

### 1. Generar el Cliente
Genera el cliente de Prisma para que TypeScript reconozca tus modelos:

```bash
npx prisma generate
```

### 2. Sincronizar Base de Datos
Sincroniza el esquema con tu base de datos actual (crea tablas o aplica cambios):

```bash
npx prisma db push
```

### 3. Visualizador de Base de Datos (Studio)
Para abrir el administrador gráfico de base de datos en el navegador:

```bash
npx prisma studio
```

---

*Nota: Asegúrate de tener configurado tu archivo `.env` antes de ejecutar los comandos de Prisma.*
