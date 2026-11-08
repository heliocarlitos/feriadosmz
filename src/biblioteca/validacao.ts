import { obterAnoActual } from "./datas"
import { TIPOS_FERIADO } from "./tipos"
import type { TipoFeriado } from "./tipos"

export type Resultado<T> = { valido: true; valor: T } | { valido: false; mensagem: string }

const TIPOS: readonly TipoFeriado[] = ["nacional", "provincial", "municipal"]

const LIMITE_PREDEFINIDO = 5
const LIMITE_MAXIMO = 50

function lerInteiro(texto: string | null | undefined): number | null {
  if (texto === null || texto === undefined || !/^\d+$/.test(texto.trim())) return null
  return Number.parseInt(texto, 10)
}

export function lerId(texto: string): Resultado<number> {
  const numero = lerInteiro(texto)
  if (numero === null || numero < 1) return { valido: false, mensagem: "ID deve ser um número positivo" }
  return { valido: true, valor: numero }
}

export function lerMes(texto: string): Resultado<number> {
  const numero = lerInteiro(texto)
  if (numero === null || numero < 1 || numero > 12) {
    return { valido: false, mensagem: "Mês deve ser um número entre 1 e 12" }
  }
  return { valido: true, valor: numero }
}

export function lerAno(texto: string): Resultado<number> {
  const numero = lerInteiro(texto)
  if (numero === null || numero < 2000 || numero > 2100) {
    return { valido: false, mensagem: "Ano deve ser um número entre 2000 e 2100" }
  }
  return { valido: true, valor: numero }
}

export function lerTipo(texto: string): Resultado<TipoFeriado> {
  const tipo = texto.trim().toLowerCase().replace(/-/g, "_") as TipoFeriado
  if (!TIPOS_FERIADO.includes(tipo)) {
    return { valido: false, mensagem: `Tipo deve ser um destes: ${TIPOS_FERIADO.join(", ")}` }
  }
  return { valido: true, valor: tipo }
}

/** Lê ?ano= dos parâmetros; se não vier, usa o ano actual. */
export function lerAnoOpcional(parametros: URLSearchParams): Resultado<number> {
  const texto = parametros.get("ano")
  if (texto === null) return { valido: true, valor: obterAnoActual() }
  return lerAno(texto)
}

/** Lê ?limite= dos parâmetros; se não vier, usa 5. */
export function lerLimiteOpcional(parametros: URLSearchParams): Resultado<number> {
  const texto = parametros.get("limite")
  if (texto === null) return { valido: true, valor: LIMITE_PREDEFINIDO }
  const numero = lerInteiro(texto)
  if (numero === null || numero < 1 || numero > LIMITE_MAXIMO) {
    return { valido: false, mensagem: `Limite deve ser um número entre 1 e ${LIMITE_MAXIMO}` }
  }
  return { valido: true, valor: numero }
}

/** Os segmentos de rota podem chegar codificados (ex.: Zamb%C3%A9zia); descodifica sem rebentar. */
export function decodificarSegmento(texto: string): string {
  try {
    return decodeURIComponent(texto)
  } catch {
    return texto
  }
}
