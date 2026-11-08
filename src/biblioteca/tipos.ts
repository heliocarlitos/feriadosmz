export const TIPOS_FERIADO = ["nacional", "provincial", "municipal", "religioso", "tolerancia_ponto"] as const

export type TipoFeriado = (typeof TIPOS_FERIADO)[number]

export type CalculoMovel = "sexta-feira-santa"

export interface ImagemFeriado {
  url: string
  alt: string
  credito?: string
  tipo?: "foto" | "ilustracao" | "cartaz" | "bandeira"
}

export interface Personalidade {
  nome: string
  papel: string
  nascimento?: string
  morte?: string
}

export interface Feriado {
  id: number
  nome: string
  tipo: TipoFeriado
  mes: number | null
  dia: number | null
  movel: boolean
  regra?: string
  calculo?: CalculoMovel
  datas?: Record<string, string>
  descricaoCurta?: string
  descricao?: string
  local?: string
  provincia?: string
  distrito?: string
  municipio?: string
  intervenientes?: string[]
  personalidades?: Personalidade[]
  anoEvento?: number
  anoInstituicao?: number
  instrumentoLegal?: string
  observancia?: string
  imagens?: ImagemFeriado[]
}

export interface FeriadoCompleto extends Omit<Feriado, "mes" | "dia" | "imagens"> {
  ano: number
  mes: number | null
  mesNome: string | null
  dia: number | null
  data: string | null
  diaSemana: string | null
  imagens: ImagemFeriado[]
}

export interface ConjuntoFeriados {
  meta: {
    nome: string
    versao: string
    idioma: string
    pais: string
    total: number
    licenca: string
    autor?: string
    fontes?: string[]
  }
  feriados: Feriado[]
}

export interface DataSimples {
  ano: number
  mes: number
  dia: number
}
