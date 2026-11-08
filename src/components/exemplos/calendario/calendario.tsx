"use client"

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react"
import type { CSSProperties, KeyboardEvent, PointerEvent } from "react"
import { ROTULO_TIPO } from "@/biblioteca/apresentacao"
import { DIAS_SEMANA, MESES, juntarClasses } from "@/biblioteca/cliente"
import { formatarDataIso, hojeEmMaputo, obterDiaSemana } from "@/biblioteca/datas"
import type { DataSimples, TipoFeriado } from "@/biblioteca/tipos"
import { agruparPorData, feriadosDoAno, lerIso, somarDias } from "../dados"
import type { FeriadoAno } from "../dados"

import "./calendario.css"

const ANO_MIN = 2000
const ANO_MAX = 2100
const ORDEM_SEMANA = [1, 2, 3, 4, 5, 6, 0]
const LEGENDA: TipoFeriado[] = ["nacional", "provincial", "municipal", "religioso"]

interface Vista {
  ano: number
  mes: number
}

function diasNoMes(ano: number, mes: number): number {
  return new Date(Date.UTC(ano, mes, 0)).getUTCDate()
}

function indiceSemana({ ano, mes, dia }: DataSimples): number {
  return (new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay() + 6) % 7
}

function dentroDoIntervalo({ ano }: DataSimples): boolean {
  return ano >= ANO_MIN && ano <= ANO_MAX
}

function descreverData({ ano, mes, dia }: DataSimples): string {
  return `${dia} de ${MESES[mes - 1]} de ${ano}`
}

function mesmoDiaEm(data: DataSimples, delta: number): DataSimples {
  const indice = data.ano * 12 + (data.mes - 1) + delta
  const ano = Math.floor(indice / 12)
  const mes = (indice % 12) + 1
  return { ano, mes, dia: Math.min(data.dia, diasNoMes(ano, mes)) }
}

function etiquetaDia(data: DataSimples, ehHoje: boolean, nomes: string[]): string {
  const partes = [`${descreverData(data)}, ${obterDiaSemana(data)}`]
  if (ehHoje) partes.push("hoje")
  if (nomes.length > 0) partes.push(`${nomes.length === 1 ? "feriado" : "feriados"}: ${nomes.join("; ")}`)
  return partes.join(", ")
}

export default function Calendario() {
  const base = useId()
  const [hoje, definirHoje] = useState<DataSimples | null>(null)
  const [vista, definirVista] = useState<Vista | null>(null)
  const [foco, definirFoco] = useState<DataSimples | null>(null)
  const [seleccionado, definirSeleccionado] = useState<string | null>(null)
  const [anos, definirAnos] = useState<Record<number, FeriadoAno[]>>({})
  const [erro, definirErro] = useState<string | null>(null)
  const [tentativa, definirTentativa] = useState(0)
  const [sentido, definirSentido] = useState<1 | -1>(1)
  const focarDepois = useRef(false)

  useEffect(() => {
    const agora = hojeEmMaputo()
    definirHoje(agora)
    definirVista({ ano: agora.ano, mes: agora.mes })
    definirFoco(agora)
    definirSeleccionado(formatarDataIso(agora))
  }, [])

  const anoVisto = vista?.ano ?? null

  useEffect(() => {
    if (anoVisto === null) return

    let activo = true
    definirErro(null)

    feriadosDoAno(anoVisto)
      .then(lista => {
        if (activo) definirAnos(anterior => ({ ...anterior, [anoVisto]: lista }))
      })
      .catch((e: unknown) => {
        if (activo) definirErro(e instanceof Error ? e.message : "Não foi possível carregar os feriados")
      })

    return () => {
      activo = false
    }
  }, [anoVisto, tentativa])

  useEffect(() => {
    if (!vista) return
    definirFoco(actual => {
      if (!actual) return actual
      if (actual.ano === vista.ano && actual.mes === vista.mes) return actual
      return { ano: vista.ano, mes: vista.mes, dia: Math.min(actual.dia, diasNoMes(vista.ano, vista.mes)) }
    })
  }, [vista])

  useEffect(() => {
    if (!focarDepois.current || !foco) return
    focarDepois.current = false
    document.getElementById(`${base}-${formatarDataIso(foco)}`)?.focus()
  }, [foco, vista, base])

  const feriadosAno = anoVisto !== null ? anos[anoVisto] : undefined
  const carregando = anoVisto !== null && feriadosAno === undefined && erro === null
  const porData = useMemo(() => agruparPorData(Object.values(anos).flat()), [anos])

  const semanas = useMemo(() => {
    if (!vista) return []
    const total = diasNoMes(vista.ano, vista.mes)
    const inicio = indiceSemana({ ano: vista.ano, mes: vista.mes, dia: 1 })
    const celulas: Array<number | null> = [...Array<null>(inicio).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)]
    while (celulas.length % 7 !== 0) celulas.push(null)
    const linhas: Array<Array<number | null>> = []
    for (let i = 0; i < celulas.length; i += 7) linhas.push(celulas.slice(i, i + 7))
    return linhas
  }, [vista])

  const doMes = useMemo(() => {
    if (!vista || !feriadosAno) return []
    const prefixo = `${vista.ano}-${String(vista.mes).padStart(2, "0")}-`
    return feriadosAno.filter(feriado => feriado.data?.startsWith(prefixo)).sort((a, b) => (a.data ?? "").localeCompare(b.data ?? "") || a.id - b.id)
  }, [vista, feriadosAno])

  const mudarMes = useCallback((delta: number) => {
    definirSentido(delta > 0 ? 1 : -1)
    definirVista(actual => {
      if (!actual) return actual
      const indice = actual.ano * 12 + (actual.mes - 1) + delta
      const ano = Math.floor(indice / 12)
      if (ano < ANO_MIN || ano > ANO_MAX) return actual
      return { ano, mes: (indice % 12) + 1 }
    })
  }, [])

  function irParaHoje() {
    if (!hoje || !vista) return
    const delta = hoje.ano * 12 + hoje.mes - (vista.ano * 12 + vista.mes)
    definirSentido(delta >= 0 ? 1 : -1)
    definirVista({ ano: hoje.ano, mes: hoje.mes })
    definirFoco(hoje)
    definirSeleccionado(formatarDataIso(hoje))
  }

  function seleccionar(data: DataSimples) {
    definirFoco(data)
    definirSeleccionado(formatarDataIso(data))
  }

  function aoTeclar(evento: KeyboardEvent<HTMLTableElement>) {
    if (!foco || !vista) return

    const indice = indiceSemana(foco)
    let destino: DataSimples

    switch (evento.key) {
      case "ArrowLeft":
        destino = somarDias(foco, -1)
        break
      case "ArrowRight":
        destino = somarDias(foco, 1)
        break
      case "ArrowUp":
        destino = somarDias(foco, -7)
        break
      case "ArrowDown":
        destino = somarDias(foco, 7)
        break
      case "Home":
        destino = somarDias(foco, -indice)
        break
      case "End":
        destino = somarDias(foco, 6 - indice)
        break
      case "PageUp":
        destino = mesmoDiaEm(foco, -1)
        break
      case "PageDown":
        destino = mesmoDiaEm(foco, 1)
        break
      default:
        return
    }

    evento.preventDefault()
    if (!dentroDoIntervalo(destino)) return

    if (destino.ano !== vista.ano || destino.mes !== vista.mes) {
      definirSentido(formatarDataIso(destino) > formatarDataIso(foco) ? 1 : -1)
      definirVista({ ano: destino.ano, mes: destino.mes })
    }

    focarDepois.current = true
    definirFoco(destino)
  }

  function aoMoverPonteiro(evento: PointerEvent<HTMLDivElement>) {
    const caixa = evento.currentTarget.getBoundingClientRect()
    evento.currentTarget.style.setProperty("--rato-x", `${evento.clientX - caixa.left}px`)
    evento.currentTarget.style.setProperty("--rato-y", `${evento.clientY - caixa.top}px`)
  }

  if (!vista || !hoje) {
    return (
      <div className="calendario calendario--esqueleto" aria-busy="true">
        <span className="exemplos__esqueleto calendario__esqueletoPrincipal" />
        <span className="exemplos__esqueleto calendario__esqueletoLateral" />
        <span className="visualmente-oculto">A carregar o calendário</span>
      </div>
    )
  }

  const nomeMes = MESES[vista.mes - 1]
  const seleccionadoData = seleccionado ? lerIso(seleccionado) : null
  const feriadosSeleccionado = seleccionado ? (porData.get(seleccionado) ?? []) : []
  const seleccionadoCarregado = seleccionadoData ? anos[seleccionadoData.ano] !== undefined : false
  const noLimiteInferior = vista.ano === ANO_MIN && vista.mes === 1
  const noLimiteSuperior = vista.ano === ANO_MAX && vista.mes === 12

  return (
    <div className="calendario" aria-busy={carregando}>
      <div className="calendario__principal">
        <div className="calendario__barra">
          <h4 className="calendario__mes" id={`${base}-mes`} aria-live="polite">
            <span key={`${vista.ano}-${vista.mes}`} className="calendario__mesNome">
              {nomeMes}
            </span>
            <span className="calendario__ano">{vista.ano}</span>
          </h4>

          <div className="calendario__controlos">
            <button type="button" className="calendario__botao" onClick={() => mudarMes(-1)} disabled={noLimiteInferior} aria-label="Mês anterior">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m10 3-5 5 5 5" />
              </svg>
            </button>
            <button type="button" className="calendario__botao calendario__botao--texto" onClick={irParaHoje}>
              Hoje
            </button>
            <button type="button" className="calendario__botao" onClick={() => mudarMes(1)} disabled={noLimiteSuperior} aria-label="Mês seguinte">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m6 3 5 5-5 5" />
              </svg>
            </button>
          </div>
        </div>

        {erro ? (
          <p className="exemplos__erro" role="alert">
            {erro}
            <button type="button" className="exemplos__repetir" onClick={() => definirTentativa(valor => valor + 1)}>
              Tentar de novo
            </button>
          </p>
        ) : null}

        <div className="calendario__grelhaContentor" onPointerMove={aoMoverPonteiro}>
          <table className="calendario__tabela" role="grid" aria-labelledby={`${base}-mes`} onKeyDown={aoTeclar}>
            <thead>
              <tr>
                {ORDEM_SEMANA.map(indice => (
                  <th key={indice} scope="col" role="columnheader">
                    <abbr title={DIAS_SEMANA[indice]}>{DIAS_SEMANA[indice].slice(0, 3)}</abbr>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody key={`${vista.ano}-${vista.mes}`} className="calendario__corpo" data-sentido={sentido}>
              {semanas.map((semana, linha) => (
                <tr key={linha}>
                  {semana.map((dia, coluna) => {
                    if (dia === null) {
                      return <td key={coluna} role="gridcell" aria-hidden="true" className="calendario__vazio" />
                    }

                    const data: DataSimples = { ano: vista.ano, mes: vista.mes, dia }
                    const iso = formatarDataIso(data)
                    const lista = porData.get(iso) ?? []
                    const ehHoje = hoje.ano === data.ano && hoje.mes === data.mes && hoje.dia === data.dia
                    const ehFoco = foco !== null && foco.ano === data.ano && foco.mes === data.mes && foco.dia === data.dia
                    const ehSeleccionado = seleccionado === iso
                    const nomes = lista.map(feriado => feriado.nome)

                    return (
                      <td key={coluna} role="gridcell" aria-selected={ehSeleccionado} className={juntarClasses("calendario__celula", coluna >= 5 && "calendario__celula--fim", lista.length > 0 && "calendario__celula--feriado", ehHoje && "calendario__celula--hoje")}>
                        <button type="button" id={`${base}-${iso}`} className="calendario__dia" style={{ "--n": linha * 7 + coluna } as CSSProperties} tabIndex={ehFoco ? 0 : -1} aria-label={etiquetaDia(data, ehHoje, nomes)} aria-current={ehHoje ? "date" : undefined} onClick={() => seleccionar(data)} onFocus={() => definirFoco(data)}>
                          <span className="calendario__numero">{dia}</span>
                          <span className="calendario__marcas" aria-hidden="true">
                            {lista.slice(0, 3).map(feriado => (
                              <span key={feriado.id} className={`marca marca--${feriado.tipo}`} />
                            ))}
                          </span>
                        </button>
                        {lista.length > 0 ? (
                          <span className="calendario__dica" aria-hidden="true">
                            {nomes.join(" · ")}
                          </span>
                        ) : null}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="calendario__legenda" aria-label="Legenda dos tipos de feriado">
          {LEGENDA.map(tipo => (
            <li key={tipo}>
              <span className={`marca marca--${tipo}`} aria-hidden="true" />
              {ROTULO_TIPO[tipo]}
            </li>
          ))}
        </ul>
      </div>

      <aside className="calendario__lateral" aria-label="Detalhes dos feriados">
        <section className="calendario__selecionado" aria-live="polite">
          <p className="calendario__etiqueta">Dia seleccionado</p>
          {seleccionadoData ? (
            <>
              <p className="calendario__dataLonga">
                {obterDiaSemana(seleccionadoData)}, {descreverData(seleccionadoData)}
              </p>
              {!seleccionadoCarregado ? (
                <p className="calendario__semFeriado">A carregar…</p>
              ) : feriadosSeleccionado.length > 0 ? (
                <ul className="calendario__feriadosDia">
                  {feriadosSeleccionado.map(feriado => (
                    <li key={feriado.id}>
                      <span className={`marca marca--${feriado.tipo}`} aria-hidden="true" />
                      <span>
                        <strong>{feriado.nome}</strong>
                        <span className="calendario__tipo"> · {ROTULO_TIPO[feriado.tipo]}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="calendario__semFeriado">Sem feriado neste dia.</p>
              )}
            </>
          ) : null}
        </section>

        <section>
          <h5 className="calendario__listaTitulo">
            Feriados em {nomeMes}
            <span className="calendario__total">{feriadosAno ? doMes.length : "…"}</span>
          </h5>
          {feriadosAno === undefined ? (
            <p className="calendario__semFeriado">A carregar…</p>
          ) : doMes.length === 0 ? (
            <p className="calendario__semFeriado">Sem feriados com data neste mês.</p>
          ) : (
            <div className="calendario__rolagem" role="region" aria-label={`Feriados de ${nomeMes}`} tabIndex={0}>
              <ul className="calendario__lista">
                {doMes.map(feriado => {
                  const data = lerIso(feriado.data ?? "")
                  if (!data) return null
                  return (
                    <li key={feriado.id}>
                      <button type="button" className="calendario__item" aria-current={seleccionado === feriado.data ? "true" : undefined} onClick={() => seleccionar(data)}>
                        <span className="calendario__chip">
                          <b>{data.dia}</b>
                          {MESES[data.mes - 1].slice(0, 3)}
                        </span>
                        <span className="calendario__itemTexto">
                          <span className="calendario__itemNome">{feriado.nome}</span>
                          <span className="calendario__itemTipo">
                            <span className={`marca marca--${feriado.tipo}`} aria-hidden="true" />
                            {ROTULO_TIPO[feriado.tipo]}
                          </span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </section>
      </aside>
    </div>
  )
}
