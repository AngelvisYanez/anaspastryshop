export const DEFAULT_TEMPLATES = [
  {
    type: "WELCOME",
    label: "Bienvenida al registrarse",
    recipient: "USER",
    subject: "Bienvenido a Academia Crédito USA",
    title: "Hola, bienvenido",
    preheader: "Tu cuenta está lista. Empieza hoy.",
  },
  {
    type: "SUBSCRIPTION_CONFIRMED",
    label: "Membresía activada",
    recipient: "USER",
    subject: "¡Tu membresía está activa! — Academia Crédito USA",
    title: "¡Membresía Activada!",
    preheader: "Tu acceso completo ha sido desbloqueado.",
  },
  {
    type: "SUBSCRIPTION_CANCELED",
    label: "Membresía cancelada",
    recipient: "USER",
    subject: "Tu membresía ha sido cancelada — Academia Crédito USA",
    title: "Membresía Cancelada",
    preheader: "Lo sentimos, tu membresía ha sido cancelada.",
  },
  {
    type: "SUBSCRIPTION_PENDING",
    label: "Pago en revisión",
    recipient: "USER",
    subject: "Pago recibido — Revisando tu membresía",
    title: "Tu Pago está en Revisión",
    preheader: "Recibimos tu pago, lo estamos verificando.",
  },
  {
    type: "ACCOUNT_APPROVED",
    label: "Cuenta aprobada",
    recipient: "USER",
    subject: "¡Tu cuenta ha sido aprobada! — Academia Crédito USA",
    title: "¡Cuenta Aprobada!",
    preheader: "Tu cuenta ha sido verificada y aprobada.",
  },
  {
    type: "PAYMENT_REJECTED",
    label: "Pago rechazado",
    recipient: "USER",
    subject: "No pudimos procesar tu pago — Academia Crédito USA",
    title: "Pago No Procesado",
    preheader: "Hubo un problema con tu pago.",
  },
  {
    type: "COURSE_PURCHASE",
    label: "Curso adquirido",
    recipient: "USER",
    subject: "¡Tu curso está listo! — Academia Crédito USA",
    title: "¡Acceso al Curso Activado!",
    preheader: "Ya tienes acceso a tu nuevo curso.",
  },
  {
    type: "ADMIN_NEW_USER",
    label: "Admin: Nuevo usuario registrado",
    recipient: "ADMIN",
    subject: "Nuevo registro en la plataforma",
    title: "Nuevo Usuario Registrado",
    preheader: "Alguien se ha unido a la academia.",
  },
  {
    type: "ADMIN_NEW_SUBSCRIPTION",
    label: "Admin: Nueva suscripción activa",
    recipient: "ADMIN",
    subject: "Nueva suscripción activada",
    title: "Nueva Suscripción Activada",
    preheader: "Un usuario ha activado su membresía.",
  },
  {
    type: "SUBSCRIPTION_EXPIRING_SOON",
    label: "Membresía por vencer (3 días)",
    recipient: "USER",
    subject: "Tu membresía vence pronto — Academia Crédito USA",
    title: "Tu membresía está por vencer",
    preheader: "Solo te quedan 3 días de acceso. No pierdas tu progreso.",
  },
  {
    type: "SUBSCRIPTION_EXPIRED",
    label: "Membresía vencida",
    recipient: "USER",
    subject: "Tu membresía ha vencido — Academia Crédito USA",
    title: "Tu acceso ha expirado",
    preheader: "Tu membresía ha vencido. Renueva ahora para continuar.",
  },
] as const;

export type EmailTemplateData = {
  id: string;
  type: string;
  label: string;
  recipient: string;
  subject: string;
  title: string;
  preheader: string;
  isEnabled: boolean;
};
