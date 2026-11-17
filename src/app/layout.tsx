import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HijrahApp — Bertumbuh dalam Iman",
  description: "Teman perjalanan ibadah dan belajar Islam, satu hari demi satu hari."
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#10382e"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}