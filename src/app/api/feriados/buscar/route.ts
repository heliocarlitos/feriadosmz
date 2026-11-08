import { pesquisar } from "@/biblioteca/feriados"
import { falha } from "@/biblioteca/respostas"
import { respostaLista } from "@/biblioteca/saida"
import { lerAnoOpcional } from "@/biblioteca/validacao"

export function GET(pedido: Request) {
  const parametros = new URL(pedido.url).searchParams

  const termo = parametros.get("q")?.trim()
  if (!termo) return falha(400, "Parâmetro de busca 'q' é obrigatório")

  const ano = lerAnoOpcional(parametros)
  if (!ano.valido) return falha(400, ano.mensagem)

  return respostaLista(pedido, pesquisar(termo, ano.valor), { query: termo, ano: ano.valor })
}
