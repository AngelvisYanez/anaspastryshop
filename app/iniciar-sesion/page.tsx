import type { Metadata } from "next";
import LoginPage from "@/app/auth/login/page";

export const metadata: Metadata = {
  title: "Iniciar Sesión",
  description: "Accede a tu cuenta en Academia Credito USA y continúa tu aprendizaje sobre crédito y finanzas personales en Estados Unidos.",
  robots: { index: false, follow: false },
};

export default function IniciarSesionPage() {
  return <LoginPage />;
}
