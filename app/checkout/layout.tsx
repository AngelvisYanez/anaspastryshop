import Navbar from "@/components/Navbar";

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
