import type { FeriadoPesquisavel } from "@/biblioteca/pesquisa"

const CAMPOS = ["id", "nome", "tipo", "data", "ano", "mes", "mesNome", "dia", "diaSemana", "movel", "descricaoCurta", "descricao", "local", "provincia", "distrito", "municipio", "intervenientes", "personalidades", "anoEvento", "anoInstituicao", "observancia"].join(",")

const memoria = new Map<string, Promise<FeriadoPesquisavel[]>>()

export function carregarIndice(ano?: number): Promise<FeriadoPesquisavel[]> {
  const chave = ano === undefined ? "actual" : String(ano)
  let pedido = memoria.get(chave)

  if (!pedido) {
    const parametros = new URLSearchParams({ campos: CAMPOS })
    if (ano !== undefined) parametros.set("ano", String(ano))

    pedido = fetch(`/api/feriados?${parametros.toString()}`).then(async resposta => {
      const corpo = await resposta.json()
      if (!resposta.ok || !corpo.success) throw new Error(corpo.message ?? `Erro ${resposta.status}`)
      return corpo.data as FeriadoPesquisavel[]
    })

    pedido.catch(() => memoria.delete(chave))
    memoria.set(chave, pedido)
  }

  return pedido
}
