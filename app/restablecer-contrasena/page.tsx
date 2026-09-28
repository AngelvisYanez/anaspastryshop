import type { Metadata } from "next";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Restablecer Contraseña",
  description: "Establece una nueva contraseña para tu cuenta de Ana's Pastry Shop.",
  robots: { index: false, follow: false },
};

export default function RestablecerContrasenaPage() {
  return <ResetPasswordForm />;
}
