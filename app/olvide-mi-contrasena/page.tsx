import type { Metadata } from "next";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Olvidé mi Contraseña",
  description: "Restablece tu contraseña de Academia Omnia.",
  robots: { index: false, follow: false },
};

export default function OlvideMiContrasenaPage() {
  return <ForgotPasswordForm />;
}
