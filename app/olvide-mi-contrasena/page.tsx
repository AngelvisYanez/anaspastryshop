import type { Metadata } from "next";
import ForgotPasswordPage from "@/app/auth/forgot-password/page";

export const metadata: Metadata = {
  title: "Olvidé mi Contraseña",
  description: "Restablece tu contraseña de Academia Credito USA.",
  robots: { index: false, follow: false },
};

export default function OlvideMiContrasenaPage() {
  return <ForgotPasswordPage />;
}
