import { ThemeModeScript } from "flowbite-react";
import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { ThemeInit } from "../.flowbite-react/init";
import "./globals.css";
import { Header } from "./components/Header";

const interSans = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Título padrão e modelo para outras páginas
  title: {
    template: "%s | Voto Certo", // Ex: "Deputados | Voto Certo"
    default: "Voto Certo - Acompanhe a Política Brasileira",
  },
  description:
    "Acompanhe de forma fácil e transparente as proposições, deputados, votações e gastos da Câmara dos Deputados do Brasil.",
  keywords: [
    "Voto Certo",
    "Câmara dos Deputados",
    "Deputados Federais",
    "Proposições",
    "Transparência",
    "Política",
    "Brasil",
    "Portal da Transparência",
  ],
  openGraph: {
    title: "Voto Certo - Acompanhe a Política Brasileira",
    description:
      "Acompanhe de forma fácil proposições, votações e gastos da Câmara.",
    url: "https://seusite.vercel.app",
    siteName: "Voto Certo",
    images: [
      {
        url: "/og-image.png", // ⚠️ CRIE ESTE ARQUIVO
        width: 1200,
        height: 630,
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Voto Certo - Acompanhe a Política Brasileira",
    description:
      "Acompanhe de forma fácil proposições, votações e gastos da Câmara.",
    images: ["/og-image.png"], // ⚠️ CRIE ESTE ARQUIVO
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <ThemeModeScript />
      </head>
      <body
        className={`${interSans.variable} ${geistMono.variable} min-h-screen overflow-x-hidden! bg-gray-100 font-sans text-gray-900 antialiased dark:bg-gray-900 dark:text-white`}
      >
        <ThemeInit />
        <Header />
        {children}
      </body>
    </html>
  );
}
