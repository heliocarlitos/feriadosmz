import { lerCampo, valorDoCampo } from "@/biblioteca/campos"
import { procurarPorId } from "@/biblioteca/feriados"
import { MENSAGEM_NAO_ENCONTRADO, falha, sucesso } from "@/biblioteca/respostas"
import { decodificarSegmento, lerAnoOpcional, lerId } from "@/biblioteca/validacao"

export async function GET(pedido: Request, contexto: { params: Promise<{ id: string; campo: string }> }) {
  const parametrosRota = await contexto.params

  const id = lerId(parametrosRota.id)
  if (!id.valido) return falha(400, id.mensagem)

  const campo = lerCampo(decodificarSegmento(parametrosRota.campo))
  if (!campo.valido) return falha(400, campo.mensagem)

  const ano = lerAnoOpcional(new URL(pedido.url).searchParams)
  if (!ano.valido) return falha(400, ano.mensagem)

  const feriado = procurarPorId(id.valor, ano.valor)
  if (!feriado) return falha(404, MENSAGEM_NAO_ENCONTRADO)

  return sucesso({
    id: feriado.id,
    campo: campo.valor,
    valor: valorDoCampo(feriado, campo.valor),
    ano: ano.valor
  })
}
