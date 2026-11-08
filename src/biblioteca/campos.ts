import type { FeriadoCompleto } from "./tipos"
import type { Resultado } from "./validacao"

export const CAMPOS_FERIADO = ["id", "nome", "tipo", "data", "ano", "mes", "mesNome", "dia", "diaSemana", "movel", "regra", "descricaoCurta", "descricao", "local", "provincia", "distrito", "municipio", "intervenientes", "personalidades", "anoEvento", "anoInstituicao", "instrumentoLegal", "observancia", "imagens"] as const

export type CampoFeriado = (typeof CAMPOS_FERIADO)[number]

export const INFORMACAO_CAMPOS: Record<CampoFeriado, { tipo: string; descricao: string }> = {
  id: { tipo: "número", descricao: "Identificador único do feriado" },
  tipo: { tipo: "texto", descricao: "nacional, provincial, municipal, religioso ou tolerancia_ponto" },
  nome: { tipo: "texto", descricao: "Nome do feriado" },
  data: { tipo: "texto ou nulo", descricao: "Data completa no formato AAAA-MM-DD, nula se ainda não estiver confirmada" },
  ano: { tipo: "número", descricao: "Ano a que a data se refere" },
  mes: { tipo: "número ou nulo", descricao: "Mês, de 1 a 12" },
  mesNome: { tipo: "texto ou nulo", descricao: "Nome do mês por extenso" },
  dia: { tipo: "número ou nulo", descricao: "Dia do mês" },
  diaSemana: { tipo: "texto ou nulo", descricao: "Dia da semana em que o feriado cai" },
  movel: { tipo: "booleano", descricao: "Se a data muda de ano para ano" },
  regra: { tipo: "texto ou nulo", descricao: "Regra de cálculo dos feriados móveis" },
  descricaoCurta: { tipo: "texto ou nulo", descricao: "Resumo de uma frase" },
  descricao: { tipo: "texto ou nulo", descricao: "Descrição completa e contexto histórico" },
  local: { tipo: "texto ou nulo", descricao: "Local associado ao feriado" },
  provincia: { tipo: "texto ou nulo", descricao: "Província" },
  distrito: { tipo: "texto ou nulo", descricao: "Distrito" },
  municipio: { tipo: "texto ou nulo", descricao: "Município" },
  intervenientes: { tipo: "lista de textos", descricao: "Pessoas e organizações envolvidas" },
  personalidades: { tipo: "lista de objectos", descricao: "Personalidades com nome, papel, nascimento e morte" },
  anoEvento: { tipo: "número ou nulo", descricao: "Ano do acontecimento que o feriado recorda" },
  anoInstituicao: { tipo: "número ou nulo", descricao: "Ano em que o feriado foi instituído" },
  instrumentoLegal: { tipo: "texto ou nulo", descricao: "Lei ou diploma que o institui" },
  observancia: { tipo: "texto ou nulo", descricao: "Natureza da observância do feriado" },
  imagens: { tipo: "lista de objectos", descricao: "Imagens com url, alt, crédito e tipo" }
}

export function campoParaCaminho(campo: string): string {
  return campo.replace(/[A-Z]/g, letra => `-${letra.toLowerCase()}`)
}

function normalizarCampo(texto: string): string {
  return texto.trim().replace(/-([a-z])/g, (_, letra: string) => letra.toUpperCase())
}

export function lerCampo(texto: string): Resultado<CampoFeriado> {
  const campo = normalizarCampo(texto)
  if (!(CAMPOS_FERIADO as readonly string[]).includes(campo)) {
    return { valido: false, mensagem: `Campo desconhecido. Campos disponíveis: ${CAMPOS_FERIADO.join(", ")}` }
  }
  return { valido: true, valor: campo as CampoFeriado }
}

export function lerCamposOpcionais(parametros: URLSearchParams): Resultado<CampoFeriado[] | null> {
  const texto = parametros.get("campos")
  if (texto === null) return { valido: true, valor: null }

  const nomes = texto
    .split(",")
    .map(nome => nome.trim())
    .filter(Boolean)
  if (nomes.length === 0) return { valido: false, mensagem: "Parâmetro 'campos' está vazio" }

  const campos: CampoFeriado[] = []
  for (const nome of nomes) {
    const campo = lerCampo(nome)
    if (!campo.valido) return campo
    if (!campos.includes(campo.valor)) campos.push(campo.valor)
  }
  return { valido: true, valor: campos }
}

export function valorDoCampo(feriado: FeriadoCompleto, campo: CampoFeriado) {
  return feriado[campo] ?? null
}

export function projetar(feriado: FeriadoCompleto, campos: CampoFeriado[] | null): Record<string, unknown> {
  const resultado: Record<string, unknown> = {}
  for (const campo of campos ?? CAMPOS_FERIADO) resultado[campo] = valorDoCampo(feriado, campo)
  return resultado
}
