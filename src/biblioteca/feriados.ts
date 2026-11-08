import conjunto from "@/dados/feriados.json"
import { NOMES_MESES, calcularDataMovel, formatarDataIso, hojeEmMaputo, obterDiaSemana } from "./datas"
import { TIPOS_FERIADO } from "./tipos"
import type { ConjuntoFeriados, DataSimples, Feriado, FeriadoCompleto, ImagemFeriado, TipoFeriado } from "./tipos"
import { extrairTermos, pesquisarFeriados } from "./pesquisa"

const feriadosBase = (conjunto as unknown as ConjuntoFeriados).feriados

export const IMAGEM_PADRAO: ImagemFeriado = {
  url: "/images/image_default.webp",
  alt: "Imagem padrão de feriado moçambicano",
  tipo: "ilustracao"
}

export function obterImagens(feriado: Feriado): ImagemFeriado[] {
  return feriado.imagens && feriado.imagens.length > 0 ? feriado.imagens : [IMAGEM_PADRAO]
}

export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
}

function lerDataIso(texto: string | undefined): DataSimples | null {
  const correspondencia = texto?.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!correspondencia) return null
  return { ano: Number(correspondencia[1]), mes: Number(correspondencia[2]), dia: Number(correspondencia[3]) }
}

function resolverData(feriado: Feriado, ano: number): DataSimples | null {
  if (feriado.movel) {
    if (feriado.calculo) return calcularDataMovel(feriado.calculo, ano)
    return lerDataIso(feriado.datas?.[String(ano)])
  }
  return { ano, mes: feriado.mes as number, dia: feriado.dia as number }
}

function paraCompleto(feriado: Feriado, ano: number): FeriadoCompleto {
  const data = resolverData(feriado, ano)
  return {
    ...feriado,
    ano,
    mes: data ? data.mes : null,
    mesNome: data ? NOMES_MESES[data.mes - 1] : null,
    dia: data ? data.dia : null,
    data: data ? formatarDataIso(data) : null,
    diaSemana: data ? obterDiaSemana(data) : null,
    imagens: obterImagens(feriado)
  }
}

export function compararPorData(a: Pick<FeriadoCompleto, "id" | "data">, b: Pick<FeriadoCompleto, "id" | "data">): number {
  if (a.data === b.data) return a.id - b.id
  if (a.data === null) return 1
  if (b.data === null) return -1
  return a.data.localeCompare(b.data)
}

const memoria = new Map<number, FeriadoCompleto[]>()

export function listarFeriados(ano: number): FeriadoCompleto[] {
  let lista = memoria.get(ano)
  if (!lista) {
    lista = feriadosBase.map(feriado => paraCompleto(feriado, ano))
    memoria.set(ano, lista)
  }
  return lista
}

export function procurarPorId(id: number, ano: number): FeriadoCompleto | undefined {
  return listarFeriados(ano).find(feriado => feriado.id === id)
}

export function filtrarPorTipo(tipo: TipoFeriado, ano: number): FeriadoCompleto[] {
  return listarFeriados(ano).filter(feriado => feriado.tipo === tipo)
}

export function filtrarPorMes(mes: number, ano: number): FeriadoCompleto[] {
  return listarFeriados(ano).filter(feriado => feriado.mes === mes)
}

export function filtrarPorProvincia(provincia: string, ano: number): FeriadoCompleto[] {
  const procurada = normalizar(provincia)
  return listarFeriados(ano).filter(feriado => feriado.provincia && normalizar(feriado.provincia) === procurada)
}

export function pesquisar(termo: string, ano: number): FeriadoCompleto[] {
  return pesquisarFeriados(listarFeriados(ano), extrairTermos(termo)).map(resultado => resultado.feriado)
}

export function feriadosDeHoje(hoje: DataSimples = hojeEmMaputo()): FeriadoCompleto[] {
  const chave = formatarDataIso(hoje)
  return listarFeriados(hoje.ano).filter(feriado => feriado.data === chave)
}

export function proximosFeriados(limite: number, hoje: DataSimples = hojeEmMaputo()): FeriadoCompleto[] {
  const chave = formatarDataIso(hoje)
  return [...listarFeriados(hoje.ano), ...listarFeriados(hoje.ano + 1)]
    .filter(feriado => feriado.data !== null && feriado.data >= chave)
    .sort(compararPorData)
    .slice(0, limite)
}

export function calcularEstatisticas(ano: number) {
  const completos = listarFeriados(ano)

  const porMes: Record<number, number> = {}
  for (const feriado of completos) {
    if (feriado.mes !== null) porMes[feriado.mes] = (porMes[feriado.mes] ?? 0) + 1
  }

  return {
    total: feriadosBase.length,
    porTipo: Object.fromEntries(TIPOS_FERIADO.map(tipo => [tipo, feriadosBase.filter(feriado => feriado.tipo === tipo).length])),
    porMes,
    semData: completos.filter(feriado => feriado.data === null).length,
    feriados: completos
  }
}
