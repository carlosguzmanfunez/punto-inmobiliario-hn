import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Punto Inmobiliario HN | Propiedades en Honduras",
  description: "Compra, alquila y descubre oportunidades inmobiliarias en los 18 departamentos de Honduras.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
