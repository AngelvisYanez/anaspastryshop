import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PagarLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar forceSolid />
      {children}
      <Footer />
    </>
  );
}
