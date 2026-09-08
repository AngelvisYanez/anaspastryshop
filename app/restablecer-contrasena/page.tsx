import type { Metadata } from "next";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Restablecer Contraseña | Ana's Pastry Shop",
  description: "Establece una nueva contraseña para tu cuenta de Ana's Pastry Shop.",
  robots: { index: false, follow: false },
};

export default function RestablecerContrasenaPage() {
  return <ResetPasswordForm />;
}
