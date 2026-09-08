import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Iniciar Sesión",
  description: "Accede a tu cuenta en Ana's Pastry Shop y continúa tu formación en pastelería y panadería.",
  robots: { index: false, follow: false },
};

export default function IniciarSesionPage() {
  return <LoginForm />;
}
