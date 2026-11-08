import { filtrarPorMes } from "@/biblioteca/feriados"
import { falha } from "@/biblioteca/respostas"
import { respostaLista } from "@/biblioteca/saida"
import { lerAnoOpcional, lerMes } from "@/biblioteca/validacao"

export async function GET(pedido: Request, contexto: { params: Promise<{ mes: string }> }) {
  const mes = lerMes((await contexto.params).mes)
  if (!mes.valido) return falha(400, mes.mensagem)

  const ano = lerAnoOpcional(new URL(pedido.url).searchParams)
  if (!ano.valido) return falha(400, ano.mensagem)

  return respostaLista(pedido, filtrarPorMes(mes.valor, ano.valor), { mes: mes.valor, ano: ano.valor })
}
