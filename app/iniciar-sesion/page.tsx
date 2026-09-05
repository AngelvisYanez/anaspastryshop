import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Iniciar Sesión",
  description: "Accede a tu cuenta en Academia Omnia y continúa tu aprendizaje sobre herramientas digitales.",
  robots: { index: false, follow: false },
};

export default function IniciarSesionPage() {
  return <LoginForm />;
}
