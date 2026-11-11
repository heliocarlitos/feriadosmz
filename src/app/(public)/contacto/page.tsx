import type { Metadata } from "next"
import FormContacto from "@/components/formcontacto/formcontacto"
import IntroContacto from "@/components/introcontacto/introcontacto"

const descricao = "Corrige um feriado, sugere um novo ou pede ajuda para integrar a API de Feriados de Moçambique."

export const metadata: Metadata = {
  title: "Contacto · API de Feriados de Moçambique",
  description: descricao,
  alternates: { canonical: "/contacto" },
  openGraph: {
    title: "Contacto · API de Feriados de Moçambique",
    description: descricao,
    url: "/contacto",
    type: "website",
    locale: "pt_MZ"
  }
}

export default function PaginaContacto() {
  return (
    <div className="contentor">
      <FormContacto>
        <IntroContacto />
      </FormContacto>
    </div>
  )
}
