import type { Metadata } from "next"
import Documentacao from "@/components/documentacao/documentacao"
import { BASE_API_PUBLICA, CAMINHO_DOCUMENTACAO, SITE_URL } from "@/biblioteca/documentacao"

const titulo = "Documentação da API de Feriados de Moçambique"
const descricao = "Guia da API aberta de feriados de Moçambique: rotas, parâmetros, campos, erros e exemplos em cURL, JavaScript, Python e PHP. Sem chave de acesso."

export const metadata: Metadata = {
  title: titulo,
  description: descricao,
  keywords: ["API feriados Moçambique", "feriados de Moçambique", "API REST gratuita", "calendário de feriados", "feriados nacionais", "feriados municipais", "JSON"],
  alternates: { canonical: CAMINHO_DOCUMENTACAO },
  openGraph: {
    type: "article",
    locale: "pt_MZ",
    siteName: "API de Feriados de Moçambique",
    title: titulo,
    description: descricao,
    url: CAMINHO_DOCUMENTACAO
  },
  twitter: {
    card: "summary",
    title: titulo,
    description: descricao
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" }
  }
}

const dadosEstruturados = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "TechArticle",
      headline: titulo,
      description: descricao,
      inLanguage: "pt-MZ",
      url: `${SITE_URL}${CAMINHO_DOCUMENTACAO}`,
      author: { "@type": "Person", name: "Hélio Carlitos" },
      about: { "@type": "Country", name: "Moçambique" }
    },
    {
      "@type": "WebAPI",
      name: "API de Feriados de Moçambique",
      description: descricao,
      documentation: `${SITE_URL}${CAMINHO_DOCUMENTACAO}`,
      url: BASE_API_PUBLICA,
      inLanguage: "pt-MZ",
      isAccessibleForFree: true,
      license: "https://opensource.org/licenses/MIT"
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Documentação", item: `${SITE_URL}${CAMINHO_DOCUMENTACAO}` }
      ]
    }
  ]
}

export default function PaginaDocumentacao() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dadosEstruturados).replace(/</g, "\\u003c") }} />
      <Documentacao />
    </>
  )
}
