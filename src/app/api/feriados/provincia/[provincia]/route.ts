import { filtrarPorProvincia } from "@/biblioteca/feriados"
import { falha } from "@/biblioteca/respostas"
import { respostaLista } from "@/biblioteca/saida"
import { decodificarSegmento, lerAnoOpcional } from "@/biblioteca/validacao"

export async function GET(pedido: Request, contexto: { params: Promise<{ provincia: string }> }) {
  const provincia = decodificarSegmento((await contexto.params).provincia).trim()
  if (!provincia) return falha(400, "Nome da província é obrigatório")

  const ano = lerAnoOpcional(new URL(pedido.url).searchParams)
  if (!ano.valido) return falha(400, ano.mensagem)

  const feriados = filtrarPorProvincia(provincia, ano.valor)
  if (feriados.length === 0) {
    return falha(404, `Nenhum feriado encontrado para a província ${provincia}`)
  }

  return respostaLista(pedido, feriados, { provincia, ano: ano.valor })
}
