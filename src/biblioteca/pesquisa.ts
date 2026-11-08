import { ROTULO_TIPO, ROTULO_TIPO_PLURAL } from "./apresentacao"
import type { TipoFeriado } from "./tipos"

export interface FeriadoPesquisavel {
  id: number
  nome: string
  tipo: TipoFeriado
  data: string | null
  ano: number
  mes: number | null
  mesNome: string | null
  dia: number | null
  diaSemana: string | null
  movel: boolean
  descricaoCurta?: string | null
  descricao?: string | null
  local?: string | null
  provincia?: string | null
  distrito?: string | null
  municipio?: string | null
  intervenientes?: string[] | null
  personalidades?: { nome: string; papel: string }[] | null
  anoEvento?: number | null
  anoInstituicao?: number | null
  observancia?: string | null
}

export interface ResultadoPesquisa<T extends FeriadoPesquisavel = FeriadoPesquisavel> {
  feriado: T
  pontos: number
}

export interface Segmento {
  texto: string
  marca: boolean
}

interface Preparado {
  nome: string
  calendario: string
  etiquetas: string
  lugares: string
  pessoas: string
  resumo: string
  descricao: string
}

const CAMPOS_PESO: ReadonlyArray<readonly [keyof Preparado, number]> = [
  ["nome", 10],
  ["calendario", 6],
  ["lugares", 5],
  ["etiquetas", 4],
  ["pessoas", 3],
  ["resumo", 2],
  ["descricao", 1]
]

const preparados = new WeakMap<object, Preparado>()

export function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

export function extrairTermos(consulta: string): string[] {
  return [...new Set(normalizarTexto(consulta).split(" ").filter(Boolean))]
}

function juntar(partes: Array<string | null | undefined>): string {
  return normalizarTexto(partes.filter(Boolean).join(" "))
}

function preparar(feriado: FeriadoPesquisavel): Preparado {
  let preparado = preparados.get(feriado)
  if (!preparado) {
    preparado = {
      nome: normalizarTexto(feriado.nome),
      calendario: juntar([feriado.mesNome, feriado.diaSemana, feriado.data]),
      etiquetas: juntar([ROTULO_TIPO[feriado.tipo], ROTULO_TIPO_PLURAL[feriado.tipo], feriado.movel ? "movel" : null, feriado.observancia]),
      lugares: juntar([feriado.local, feriado.provincia, feriado.distrito, feriado.municipio]),
      pessoas: juntar([...(feriado.intervenientes ?? []), ...(feriado.personalidades ?? []).map(personalidade => personalidade.nome)]),
      resumo: normalizarTexto(feriado.descricaoCurta ?? ""),
      descricao: normalizarTexto(feriado.descricao ?? "")
    }
    preparados.set(feriado, preparado)
  }
  return preparado
}

function pontosCampo(texto: string, termo: string, peso: number): number {
  if (!texto) return 0
  if (texto.startsWith(termo)) return peso * 1.5
  if (texto.includes(` ${termo}`)) return peso * 1.2
  if (texto.includes(termo)) return peso * 0.6
  return 0
}

function pontosNumericos(feriado: FeriadoPesquisavel, termo: string): number {
  const valor = Number(termo)
  if (!(valor > 0)) return 0

  let pontos = 0
  if (feriado.dia === valor) pontos = Math.max(pontos, 8)
  if (feriado.ano === valor) pontos = Math.max(pontos, 6)
  if (feriado.mes === valor) pontos = Math.max(pontos, 5)
  if (feriado.anoEvento === valor || feriado.anoInstituicao === valor) pontos = Math.max(pontos, 3)
  return pontos
}

function pontosTermo(feriado: FeriadoPesquisavel, preparado: Preparado, termo: string): number {
  let melhor = 0
  for (const [campo, peso] of CAMPOS_PESO) {
    melhor = Math.max(melhor, pontosCampo(preparado[campo], termo, peso))
  }
  if (/^\d+$/.test(termo)) melhor = Math.max(melhor, pontosNumericos(feriado, termo))
  return melhor
}

function compararDatas(a: string | null, b: string | null): number {
  if (a === b) return 0
  if (a === null) return 1
  if (b === null) return -1
  return a.localeCompare(b)
}

export function pesquisarFeriados<T extends FeriadoPesquisavel>(feriados: readonly T[], termos: readonly string[]): ResultadoPesquisa<T>[] {
  if (termos.length === 0) return []

  const consulta = termos.join(" ")
  const resultados: ResultadoPesquisa<T>[] = []

  for (const feriado of feriados) {
    const preparado = preparar(feriado)
    let pontos = 0
    let completo = true

    for (const termo of termos) {
      const parcial = pontosTermo(feriado, preparado, termo)
      if (parcial === 0) {
        completo = false
        break
      }
      pontos += parcial
    }

    if (!completo) continue

    if (preparado.nome.startsWith(consulta)) pontos += 6
    else if (preparado.nome.includes(consulta)) pontos += 3

    resultados.push({ feriado, pontos })
  }

  return resultados.sort((a, b) => b.pontos - a.pontos || compararDatas(a.feriado.data, b.feriado.data) || a.feriado.id - b.feriado.id)
}

export function sugerirProximos<T extends FeriadoPesquisavel>(feriados: readonly T[], hoje: string, limite: number): T[] {
  return feriados
    .filter(feriado => feriado.data !== null && feriado.data >= hoje)
    .sort((a, b) => compararDatas(a.data, b.data) || a.id - b.id)
    .slice(0, limite)
}

function mapear(texto: string): { normalizado: string; mapa: number[] } {
  let normalizado = ""
  const mapa: number[] = []

  for (let indice = 0; indice < texto.length; indice++) {
    const pedaco = texto[indice]
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, " ")

    for (const letra of pedaco) {
      normalizado += letra
      mapa.push(indice)
    }
  }

  return { normalizado, mapa }
}

function encontrarIntervalos(normalizado: string, termos: readonly string[]): [number, number][] {
  const lista: [number, number][] = []

  for (const termo of termos) {
    if (!termo) continue
    for (let posicao = normalizado.indexOf(termo); posicao !== -1; posicao = normalizado.indexOf(termo, posicao + termo.length)) {
      lista.push([posicao, posicao + termo.length])
    }
  }

  lista.sort((a, b) => a[0] - b[0])

  const fundidos: [number, number][] = []
  for (const intervalo of lista) {
    const ultimo = fundidos[fundidos.length - 1]
    if (ultimo && intervalo[0] <= ultimo[1]) ultimo[1] = Math.max(ultimo[1], intervalo[1])
    else fundidos.push([intervalo[0], intervalo[1]])
  }
  return fundidos
}

export function destacar(texto: string, termos: readonly string[]): Segmento[] {
  if (!texto) return []
  if (termos.length === 0) return [{ texto, marca: false }]

  const { normalizado, mapa } = mapear(texto)
  const segmentos: Segmento[] = []
  let cursor = 0

  for (const [inicio, fim] of encontrarIntervalos(normalizado, termos)) {
    const de = Math.max(mapa[inicio], cursor)
    const ate = mapa[fim - 1] + 1
    if (ate <= de) continue
    if (de > cursor) segmentos.push({ texto: texto.slice(cursor, de), marca: false })
    segmentos.push({ texto: texto.slice(de, ate), marca: true })
    cursor = ate
  }

  if (cursor < texto.length) segmentos.push({ texto: texto.slice(cursor), marca: false })
  return segmentos.length > 0 ? segmentos : [{ texto, marca: false }]
}

export function trechoRelevante(texto: string, termos: readonly string[], tamanho = 140): string {
  if (texto.length <= tamanho) return texto

  const { normalizado, mapa } = mapear(texto)
  const primeiro = encontrarIntervalos(normalizado, termos)[0]
  if (!primeiro) return `${texto.slice(0, tamanho).trimEnd()}…`

  const centro = mapa[primeiro[0]]
  let fim = Math.min(texto.length, Math.max(0, centro - Math.floor(tamanho / 3)) + tamanho)
  let inicio = Math.max(0, fim - tamanho)

  if (inicio > 0) {
    const espaco = texto.indexOf(" ", inicio)
    if (espaco !== -1 && espaco < centro) inicio = espaco + 1
  }
  if (fim < texto.length) {
    const espaco = texto.lastIndexOf(" ", fim)
    if (espaco > centro) fim = espaco
  }

  return `${inicio > 0 ? "…" : ""}${texto.slice(inicio, fim).trim()}${fim < texto.length ? "…" : ""}`
}

export function textoDeApoio(feriado: FeriadoPesquisavel, termos: readonly string[]): string {
  const resumo = feriado.descricaoCurta ?? ""
  if (termos.length === 0) return resumo

  const preparado = preparar(feriado)
  const combina = (texto: string) => termos.some(termo => texto.includes(termo))

  if (combina(preparado.resumo)) return resumo
  if (feriado.descricao && combina(preparado.descricao)) return trechoRelevante(feriado.descricao, termos)
  return resumo
}
