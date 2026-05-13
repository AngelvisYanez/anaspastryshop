import type { Metadata } from "next";
import ResetPasswordPage from "@/app/auth/reset-password/page";

export const metadata: Metadata = {
  title: "Restablecer Contraseña",
  description: "Establece una nueva contraseña para tu cuenta de Academia Credito USA.",
  robots: { index: false, follow: false },
};

export default function RestablecerContrasenaPage() {
  return <ResetPasswordPage />;
}
