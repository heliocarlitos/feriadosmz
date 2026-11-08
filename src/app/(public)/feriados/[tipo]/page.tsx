import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { slugTipo } from "@/biblioteca/apresentacao"
import { TIPOS_FERIADO } from "@/biblioteca/tipos"
import { lerTipo } from "@/biblioteca/validacao"
import PaginaFeriados, { INFORMACAO_TIPOS } from "@componentes/feriados/feriados"

export const dynamicParams = false
export const revalidate = 3600

export function generateStaticParams() {
  return TIPOS_FERIADO.map(tipo => ({ tipo: slugTipo(tipo) }))
}

export async function generateMetadata({ params }: { params: Promise<{ tipo: string }> }): Promise<Metadata> {
  const tipo = lerTipo((await params).tipo)
  if (!tipo.valido) return {}
  const { titulo, descricao } = INFORMACAO_TIPOS[tipo.valor]
  return { title: `${titulo} · Feriados MZ`, description: descricao }
}

export default async function Pagina({ params }: { params: Promise<{ tipo: string }> }) {
  const tipo = lerTipo((await params).tipo)
  if (!tipo.valido) notFound()
  return <PaginaFeriados tipo={tipo.valor} />
}
