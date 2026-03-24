import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Resultados River Plate",
  description: "Historial completo de resultados, estadísticas y rendimiento de River Plate.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#b91c1c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <Providers>
          <Header />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
