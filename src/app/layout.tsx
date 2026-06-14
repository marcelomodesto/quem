import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GuiaQuem",
  description: "Diretório Institucional de Pessoas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
