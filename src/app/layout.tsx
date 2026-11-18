import type { Metadata, Viewport } from "next";
import { Amiri_Quran } from "next/font/google";
import "./globals.css";

const quranFont = Amiri_Quran({ subsets: ["arabic"], weight: "400", display: "swap", variable: "--font-quran" });

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
  return <html lang="id" className={quranFont.variable}><body>{children}</body></html>;
}