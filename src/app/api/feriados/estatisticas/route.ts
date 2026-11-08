import { calcularEstatisticas } from "@/biblioteca/feriados"
import { falha, sucesso } from "@/biblioteca/respostas"
import { lerAnoOpcional } from "@/biblioteca/validacao"

export function GET(pedido: Request) {
  const ano = lerAnoOpcional(new URL(pedido.url).searchParams)
  if (!ano.valido) return falha(400, ano.mensagem)

  return sucesso({ data: calcularEstatisticas(ano.valor), ano: ano.valor })
}
