import { filtrarPorTipo } from "@/biblioteca/feriados"
import { falha } from "@/biblioteca/respostas"
import { respostaLista } from "@/biblioteca/saida"
import { lerAnoOpcional, lerTipo } from "@/biblioteca/validacao"

export async function GET(pedido: Request, contexto: { params: Promise<{ tipo: string }> }) {
  const tipo = lerTipo((await contexto.params).tipo)
  if (!tipo.valido) return falha(400, tipo.mensagem)

  const ano = lerAnoOpcional(new URL(pedido.url).searchParams)
  if (!ano.valido) return falha(400, ano.mensagem)

  return respostaLista(pedido, filtrarPorTipo(tipo.valor, ano.valor), { tipo: tipo.valor, ano: ano.valor })
}
