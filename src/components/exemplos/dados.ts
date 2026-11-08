import { obterJson } from "@/biblioteca/cliente"
import type { DataSimples, TipoFeriado } from "@/biblioteca/tipos"

export interface FeriadoAno {
  id: number
  nome: string
  tipo: TipoFeriado
  data: string | null
}

interface CorpoLista {
  success: boolean
  message?: string
  data?: FeriadoAno[]
}

const pedidos = new Map<number, Promise<FeriadoAno[]>>()

export function feriadosDoAno(ano: number): Promise<FeriadoAno[]> {
  const existente = pedidos.get(ano)
  if (existente) return existente

  const pedido = obterJson<CorpoLista>(`/feriados/ano/${ano}?campos=id,nome,tipo,data`).then(corpo => {
    if (!corpo.success || !corpo.data) throw new Error(corpo.message ?? "Resposta inválida da API")
    return corpo.data
  })

  pedido.catch(() => {
    pedidos.delete(ano)
  })
  pedidos.set(ano, pedido)
  return pedido
}

export function agruparPorData(feriados: FeriadoAno[]): Map<string, FeriadoAno[]> {
  const mapa = new Map<string, FeriadoAno[]>()
  for (const feriado of feriados) {
    if (!feriado.data) continue
    const lista = mapa.get(feriado.data)
    if (lista) lista.push(feriado)
    else mapa.set(feriado.data, [feriado])
  }
  return mapa
}

export function lerIso(texto: string): DataSimples | null {
  const correspondencia = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto)
  if (!correspondencia) return null
  return { ano: Number(correspondencia[1]), mes: Number(correspondencia[2]), dia: Number(correspondencia[3]) }
}

export function somarDias({ ano, mes, dia }: DataSimples, dias: number): DataSimples {
  const resultado = new Date(Date.UTC(ano, mes - 1, dia + dias))
  return { ano: resultado.getUTCFullYear(), mes: resultado.getUTCMonth() + 1, dia: resultado.getUTCDate() }
}
