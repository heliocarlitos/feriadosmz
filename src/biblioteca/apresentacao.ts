import type { FeriadoCompleto, TipoFeriado } from "./tipos"

export const DATA_POR_CONFIRMAR = "Data por confirmar"

export const ROTULO_TIPO: Record<TipoFeriado, string> = {
  nacional: "Nacional",
  provincial: "Provincial",
  municipal: "Municipal",
  religioso: "Religioso",
  tolerancia_ponto: "Tolerância de ponto"
}

export const ROTULO_TIPO_PLURAL: Record<TipoFeriado, string> = {
  nacional: "Feriados nacionais",
  provincial: "Feriados provinciais",
  municipal: "Feriados municipais",
  religioso: "Feriados religiosos",
  tolerancia_ponto: "Tolerâncias de ponto"
}

export function slugTipo(tipo: TipoFeriado): string {
  return tipo.replace(/_/g, "-")
}

export function caminhoTipo(tipo: TipoFeriado): string {
  return `/feriados/${slugTipo(tipo)}`
}

export function caminhoFeriado(feriado: Pick<FeriadoCompleto, "id" | "tipo">): string {
  return `${caminhoTipo(feriado.tipo)}/${feriado.id}`
}

export function formatarDataCurta(feriado: Pick<FeriadoCompleto, "dia" | "mesNome">): string {
  if (feriado.dia === null || feriado.mesNome === null) return DATA_POR_CONFIRMAR
  return `${feriado.dia} de ${feriado.mesNome}`
}

export function formatarDataLonga(feriado: Pick<FeriadoCompleto, "dia" | "mesNome" | "ano">): string {
  if (feriado.dia === null || feriado.mesNome === null) return DATA_POR_CONFIRMAR
  return `${feriado.dia} de ${feriado.mesNome} de ${feriado.ano}`
}

export function criarIdentificador(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export function gerarParagrafos(texto: string, frasesPorParagrafo = 3): string[] {
  const frases = texto
    .split(/(?<=[.!?])(?<!\bD\.)\s+(?=[A-ZÀ-ÖØ-Ý])/)
    .map(frase => frase.trim())
    .filter(Boolean)

  const paragrafos: string[] = []
  for (let indice = 0; indice < frases.length; indice += frasesPorParagrafo) {
    paragrafos.push(frases.slice(indice, indice + frasesPorParagrafo).join(" "))
  }
  return paragrafos
}
