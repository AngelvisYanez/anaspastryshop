export const DEFAULT_TEMPLATES = [
  {
    type: "WELCOME",
    label: "Bienvenida al registrarse",
    recipient: "USER",
    subject: "Bienvenido a Ana's Pastry Shop",
    title: "Hola, bienvenido",
    preheader: "Tu cuenta está lista. Empieza hoy.",
  },
  {
    type: "ACCOUNT_APPROVED",
    label: "Cuenta aprobada",
    recipient: "USER",
    subject: "¡Tu cuenta ha sido aprobada! — Ana's Pastry Shop",
    title: "¡Cuenta Aprobada!",
    preheader: "Tu cuenta ha sido verificada y aprobada.",
  },
  {
    type: "PAYMENT_REJECTED",
    label: "Pago rechazado",
    recipient: "USER",
    subject: "No pudimos procesar tu pago — Ana's Pastry Shop",
    title: "Pago No Procesado",
    preheader: "Hubo un problema con tu pago.",
  },
  {
    type: "COURSE_PURCHASE",
    label: "Curso adquirido",
    recipient: "USER",
    subject: "¡Tu taller está listo! — Ana's Pastry Shop",
    title: "¡Acceso al Taller Activado!",
    preheader: "Ya tienes acceso a tu nuevo taller.",
  },
  {
    type: "ADMIN_NEW_USER",
    label: "Admin: Nuevo usuario registrado",
    recipient: "ADMIN",
    subject: "Nuevo registro en la plataforma",
    title: "Nuevo Usuario Registrado",
    preheader: "Alguien se ha unido a Ana's Pastry Shop.",
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
