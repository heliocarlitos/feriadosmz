import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import Header from "@/components/ui/header/header"
import BarraCarregamento from "@/components/ui/barracarregamento/barracarregamento"
import { SCRIPT_TEMA } from "@/biblioteca/scriptTema"
import "./globals.css"

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
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body>
        <BarraCarregamento />
        <Header />
        <main>{children}</main>
      </body>
    </html>
  )
}
