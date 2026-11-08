import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { caminhoFeriado, slugTipo } from "@/biblioteca/apresentacao"
import { obterAnoActual } from "@/biblioteca/datas"
import { listarFeriados, procurarPorId } from "@/biblioteca/feriados"
import { lerId, lerTipo } from "@/biblioteca/validacao"
import DetalheFeriado from "@componentes/detalhe/detalhe"

export const revalidate = 3600

type Parametros = { tipo: string; id: string }

export function generateStaticParams() {
  return listarFeriados(obterAnoActual()).map(feriado => ({ tipo: slugTipo(feriado.tipo), id: String(feriado.id) }))
}

function carregar({ tipo, id }: Parametros) {
  const tipoLido = lerTipo(tipo)
  const idLido = lerId(id)
  if (!tipoLido.valido || !idLido.valido) return undefined
  return procurarPorId(idLido.valor, obterAnoActual())
}

export async function generateMetadata({ params }: { params: Promise<Parametros> }): Promise<Metadata> {
  const feriado = carregar(await params)
  if (!feriado) return {}

  const imagem = feriado.imagens[0]
  return {
    title: `${feriado.nome} · Feriados MZ`,
    description: feriado.descricaoCurta,
    openGraph: {
      title: feriado.nome,
      description: feriado.descricaoCurta,
      type: "article",
      locale: "pt_MZ",
      images: [{ url: imagem.url, alt: imagem.alt }]
    }
  }
}

export default async function Pagina({ params }: { params: Promise<Parametros> }) {
  const parametros = await params
  const feriado = carregar(parametros)
  if (!feriado) notFound()
  if (slugTipo(feriado.tipo) !== parametros.tipo) redirect(caminhoFeriado(feriado))

  return <DetalheFeriado feriado={feriado} />
}
