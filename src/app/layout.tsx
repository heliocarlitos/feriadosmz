import type { Metadata, Viewport } from "next"
import Script from "next/script"
import { Geist, Geist_Mono } from "next/font/google"
import Header from "@/components/ui/header/header"
import "./globals.css"
import BarraCarregamento from "@/components/ui/barracarregamento/barracarregamento"

const fonteBase = Geist({ subsets: ["latin"], variable: "--fonte-base", display: "swap" })
const fonteCodigo = Geist_Mono({ subsets: ["latin"], variable: "--fonte-codigo-base", display: "swap" })

export const metadata: Metadata = {
  metadataBase: new URL("https://feriadosmz.vercel.app"),
  title: "API de Feriados de Moçambique",
  description: "API aberta e gratuita com os feriados nacionais, provinciais e municipais de Moçambique.",
  icons: { icon: "/favicon.webp" }
}

export const viewport: Viewport = {
  colorScheme: "light dark"
}

export default function LayoutRaiz({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-MZ" className={`${fonteBase.variable} ${fonteCodigo.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <Script src="/tema.js" strategy="beforeInteractive" />
        <BarraCarregamento />
        <Header />
        <main>{children}</main>
      </body>
    </html>
  )
}
