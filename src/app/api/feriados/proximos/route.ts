import { proximosFeriados } from "@/biblioteca/feriados"
import { falha } from "@/biblioteca/respostas"
import { respostaLista } from "@/biblioteca/saida"
import { lerLimiteOpcional } from "@/biblioteca/validacao"

export const dynamic = "force-dynamic"

export function GET(pedido: Request) {
  const limite = lerLimiteOpcional(new URL(pedido.url).searchParams)
  if (!limite.valido) return falha(400, limite.mensagem)

  return respostaLista(pedido, proximosFeriados(limite.valor), { limite: limite.valor })
}
