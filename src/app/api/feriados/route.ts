import { listarFeriados } from "@/biblioteca/feriados"
import { falha } from "@/biblioteca/respostas"
import { respostaLista } from "@/biblioteca/saida"
import { lerAnoOpcional } from "@/biblioteca/validacao"

export function GET(pedido: Request) {
  const ano = lerAnoOpcional(new URL(pedido.url).searchParams)
  if (!ano.valido) return falha(400, ano.mensagem)

  return respostaLista(pedido, listarFeriados(ano.valor), { ano: ano.valor })
}
