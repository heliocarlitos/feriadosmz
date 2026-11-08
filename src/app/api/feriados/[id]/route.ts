import { procurarPorId } from "@/biblioteca/feriados"
import { MENSAGEM_NAO_ENCONTRADO, falha } from "@/biblioteca/respostas"
import { respostaUnica } from "@/biblioteca/saida"
import { lerAnoOpcional, lerId } from "@/biblioteca/validacao"

export async function GET(pedido: Request, contexto: { params: Promise<{ id: string }> }) {
  const id = lerId((await contexto.params).id)
  if (!id.valido) return falha(400, id.mensagem)

  const ano = lerAnoOpcional(new URL(pedido.url).searchParams)
  if (!ano.valido) return falha(400, ano.mensagem)

  const feriado = procurarPorId(id.valor, ano.valor)
  if (!feriado) return falha(404, MENSAGEM_NAO_ENCONTRADO)

  return respostaUnica(pedido, feriado, { ano: ano.valor })
}
