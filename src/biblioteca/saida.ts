import { lerCamposOpcionais, projetar } from "./campos"
import { falha, sucesso } from "./respostas"
import type { FeriadoCompleto } from "./tipos"

export function respostaLista(pedido: Request, feriados: FeriadoCompleto[], extra: Record<string, unknown> = {}): Response {
  const campos = lerCamposOpcionais(new URL(pedido.url).searchParams)
  if (!campos.valido) return falha(400, campos.mensagem)

  return sucesso({
    data: feriados.map(feriado => projetar(feriado, campos.valor)),
    total: feriados.length,
    ...extra
  })
}

export function respostaUnica(pedido: Request, feriado: FeriadoCompleto, extra: Record<string, unknown> = {}): Response {
  const campos = lerCamposOpcionais(new URL(pedido.url).searchParams)
  if (!campos.valido) return falha(400, campos.mensagem)

  return sucesso({ data: projetar(feriado, campos.valor), ...extra })
}
