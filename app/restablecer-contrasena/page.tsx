import type { Metadata } from "next";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Restablecer Contraseña",
  description: "Establece una nueva contraseña para tu cuenta de Academia Omnia.",
  robots: { index: false, follow: false },
};

export default function RestablecerContrasenaPage() {
  return <ResetPasswordForm />;
}
