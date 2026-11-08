import type { FeriadoCompleto } from "./tipos"

export const BASE_API = "/api"
export const URL_DOCUMENTACAO = "/documentacao"
export const URL_REPOSITORIO = "https://github.com/heliocarlitos/feriadosmz"

export const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]

export const DIAS_SEMANA = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"]

export type FeriadoResumo = Pick<FeriadoCompleto, "id" | "nome" | "mes" | "dia" | "tipo">

export interface Estatisticas {
  total: number
  nacional: number
  provincial: number
  municipal: number
}

export async function obterJson<T = unknown>(caminho: string): Promise<T> {
  const resposta = await fetch(`${BASE_API}${caminho}`, { cache: "no-store" })
  return (await resposta.json()) as T
}

export function formatarData(feriado: Pick<FeriadoResumo, "mes" | "dia">): string {
  if (!feriado.mes || !feriado.dia) return "Data variável"
  return `${feriado.dia} ${MESES[feriado.mes - 1].slice(0, 3).toLowerCase()}.`
}

export function juntarClasses(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ")
}
