import type { Metadata } from "next";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Olvidé mi Contraseña | Ana's Pastry Shop",
  description: "Restablece tu contraseña de acceso a Ana's Pastry Shop.",
  robots: { index: false, follow: false },
};

export default function OlvideMiContrasenaPage() {
  return <ForgotPasswordForm />;
}
