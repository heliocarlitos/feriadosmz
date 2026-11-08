import { listarFeriados } from "@/biblioteca/feriados"
import { falha } from "@/biblioteca/respostas"
import { respostaLista } from "@/biblioteca/saida"
import { lerAno } from "@/biblioteca/validacao"

export async function GET(pedido: Request, contexto: { params: Promise<{ ano: string }> }) {
  const ano = lerAno((await contexto.params).ano)
  if (!ano.valido) return falha(400, ano.mensagem)

  return respostaLista(pedido, listarFeriados(ano.valor), { ano: ano.valor })
}
