import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const pasta = dirname(fileURLToPath(import.meta.url))
const conjunto = JSON.parse(readFileSync(join(pasta, "feriados.json"), "utf8"))

const TIPOS = ["nacional", "provincial", "municipal", "religioso", "tolerancia_ponto"]
const PROVINCIAS = ["Maputo", "Gaza", "Inhambane", "Sofala", "Manica", "Tete", "Zambézia", "Nampula", "Cabo Delgado", "Niassa"]
const DATA_ISO = /^\d{4}-\d{2}-\d{2}$/

const erros = []
const avisos = []
const erro = (f, msg) => erros.push(`#${f.id} ${f.nome}: ${msg}`)
const aviso = (f, msg) => avisos.push(`#${f.id} ${f.nome}: ${msg}`)

function diasNoMes(mes) {
  return new Date(2024, mes, 0).getDate()
}

function dataValida(texto) {
  if (!DATA_ISO.test(texto)) return false
  const data = new Date(`${texto}T00:00:00Z`)
  return !Number.isNaN(data.getTime()) && data.toISOString().startsWith(texto)
}

const { meta, feriados } = conjunto
if (meta.total !== feriados.length) {
  erros.push(`meta.total (${meta.total}) difere do número de feriados (${feriados.length})`)
}

const ids = new Set()
const nomes = new Map()

for (const f of feriados) {
  if (ids.has(f.id)) erro(f, "id duplicado")
  ids.add(f.id)

  if (!f.nome?.trim()) erro(f, "nome em falta")
  if (!TIPOS.includes(f.tipo)) erro(f, `tipo inválido: ${f.tipo}`)

  if (f.movel) {
    if (f.mes !== null || f.dia !== null) erro(f, "feriado móvel deve ter mes e dia nulos")
    if (!f.regra) erro(f, "feriado móvel sem regra")
    if (!f.calculo && !f.datas) aviso(f, "feriado móvel sem calculo nem datas: a data aparece como por confirmar")
    for (const [ano, data] of Object.entries(f.datas ?? {})) {
      if (!/^\d{4}$/.test(ano) || !dataValida(data) || !data.startsWith(`${ano}-`)) {
        erro(f, `datas["${ano}"] inválida: ${data}`)
      }
    }
  } else {
    if (f.datas) erro(f, "só feriados móveis podem ter datas")
    if (!Number.isInteger(f.mes) || f.mes < 1 || f.mes > 12) erro(f, `mês inválido: ${f.mes}`)
    else if (!Number.isInteger(f.dia) || f.dia < 1 || f.dia > diasNoMes(f.mes)) erro(f, `dia inválido: ${f.dia}/${f.mes}`)
  }

  if (!f.descricaoCurta) aviso(f, "sem descricaoCurta")
  if (!f.descricao) aviso(f, "sem descricao")

  if (f.provincia && !PROVINCIAS.includes(f.provincia)) erro(f, `província desconhecida: ${f.provincia}`)
  if ((f.tipo === "provincial" || f.tipo === "municipal") && !f.provincia) aviso(f, "sem provincia")
  if (f.tipo === "municipal" && !f.municipio && !f.distrito) aviso(f, "municipal sem municipio nem distrito")

  for (const p of f.personalidades ?? []) {
    for (const campo of ["nascimento", "morte"]) {
      if (p[campo] && !DATA_ISO.test(p[campo])) erro(f, `${p.nome}: ${campo} não está em AAAA-MM-DD`)
    }
    if (p.nascimento && p.morte && p.morte < p.nascimento) erro(f, `${p.nome}: morte anterior ao nascimento`)
  }

  const chaveNome = f.nome.trim().toLowerCase()
  if (nomes.has(chaveNome)) erro(f, `nome repetido (também no #${nomes.get(chaveNome)})`)
  nomes.set(chaveNome, f.id)
}

const porData = new Map()
for (const f of feriados.filter(x => !x.movel)) {
  const chave = `${String(f.dia).padStart(2, "0")}/${String(f.mes).padStart(2, "0")}`
  porData.set(chave, [...(porData.get(chave) ?? []), f.id])
}
const coincidencias = [...porData].filter(([, lista]) => lista.length > 1)

const contagem = Object.fromEntries(TIPOS.map(t => [t, feriados.filter(f => f.tipo === t).length]))
console.log(`Total: ${feriados.length}  |  ${TIPOS.map(t => `${t}: ${contagem[t]}`).join("  |  ")}`)
console.log(`Móveis: ${feriados.filter(f => f.movel).length}  |  Datas partilhadas por vários feriados: ${coincidencias.length}`)

if (avisos.length) {
  console.log(`\nAvisos (${avisos.length}):`)
  avisos.forEach(a => console.log(`  - ${a}`))
}
if (erros.length) {
  console.error(`\nErros (${erros.length}):`)
  erros.forEach(e => console.error(`  - ${e}`))
  process.exit(1)
}
console.log("\nValidação concluída sem erros.")
