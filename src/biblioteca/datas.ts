import type { CalculoMovel, DataSimples } from "./tipos"

const FUSO_HORARIO = "Africa/Maputo"

export const NOMES_MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]

const DIAS_SEMANA = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"]

const formatadorMaputo = new Intl.DateTimeFormat("en-CA", {
  timeZone: FUSO_HORARIO,
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
})

export function hojeEmMaputo(agora: Date = new Date()): DataSimples {
  const partes = formatadorMaputo.formatToParts(agora)
  const ler = (tipo: string) => Number(partes.find(parte => parte.type === tipo)?.value)
  return { ano: ler("year"), mes: ler("month"), dia: ler("day") }
}

export function obterAnoActual(): number {
  return hojeEmMaputo().ano
}

export function formatarDataIso({ ano, mes, dia }: DataSimples): string {
  return `${String(ano).padStart(4, "0")}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`
}

export function obterDiaSemana({ ano, mes, dia }: DataSimples): string {
  return DIAS_SEMANA[new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay()]
}

export function calcularPascoa(ano: number): DataSimples {
  const a = ano % 19
  const b = Math.floor(ano / 100)
  const c = ano % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const mes = Math.floor((h + l - 7 * m + 114) / 31)
  const dia = ((h + l - 7 * m + 114) % 31) + 1
  return { ano, mes, dia }
}

function somarDias({ ano, mes, dia }: DataSimples, dias: number): DataSimples {
  const resultado = new Date(Date.UTC(ano, mes - 1, dia + dias))
  return {
    ano: resultado.getUTCFullYear(),
    mes: resultado.getUTCMonth() + 1,
    dia: resultado.getUTCDate()
  }
}

const CALCULOS_MOVEIS: Record<CalculoMovel, (ano: number) => DataSimples> = {
  "sexta-feira-santa": ano => somarDias(calcularPascoa(ano), -2)
}

export function calcularDataMovel(calculo: CalculoMovel, ano: number): DataSimples {
  return CALCULOS_MOVEIS[calculo](ano)
}
