export const CODIGOS = {
  calendario: `const ano = 2026
const resposta = await fetch(\`https://feriadosmz.vercel.app/api/feriados/ano/\${ano}?campos=id,nome,tipo,data\`)
const { success, data, message } = await resposta.json()

if (!success) throw new Error(message)

const porData = new Map()
for (const feriado of data) {
  if (!feriado.data) continue
  porData.set(feriado.data, [...(porData.get(feriado.data) ?? []), feriado])
}

console.log(porData.get("2026-06-25"))`,

  contagem: `const resposta = await fetch("https://feriadosmz.vercel.app/api/feriados/proximos?limite=1&campos=nome,data")
const { data } = await resposta.json()
const [proximo] = data

const [ano, mes, dia] = proximo.data.split("-").map(Number)
const alvo = Date.UTC(ano, mes - 1, dia) - 2 * 3600 * 1000
const dias = Math.floor((alvo - Date.now()) / 86400000)

console.log(\`Faltam \${dias} dias para \${proximo.nome}\`)`,

  diaUtil: `async function ehDiaUtil(iso) {
  const diaSemana = new Date(\`\${iso}T00:00:00Z\`).getUTCDay()
  if (diaSemana === 0 || diaSemana === 6) return false

  const resposta = await fetch(\`https://feriadosmz.vercel.app/api/feriados/ano/\${iso.slice(0, 4)}?campos=data,tipo\`)
  const { data } = await resposta.json()

  return !data.some(feriado => feriado.data === iso && ["nacional", "religioso"].includes(feriado.tipo))
}

console.log(await ehDiaUtil("2026-06-25"))`,

  pesquisa: `async function pesquisar(termo) {
  const url = \`https://feriadosmz.vercel.app/api/feriados/buscar?q=\${encodeURIComponent(termo)}&campos=id,nome,tipo,data\`
  const { success, data } = await (await fetch(url)).json()
  return success ? data : []
}

console.log(await pesquisar("independencia"))`,

  provincia: `const provincia = "Zambézia"
const url = \`https://feriadosmz.vercel.app/api/feriados/provincia/\${encodeURIComponent(provincia)}?campos=id,nome,municipio,data\`

const { success, data, message } = await (await fetch(url)).json()
if (!success) throw new Error(message)

for (const feriado of data) {
  console.log(feriado.data ?? "Data por confirmar", feriado.nome)
}`
}
