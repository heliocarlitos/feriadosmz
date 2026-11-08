"use client"

import { useEffect, useId, useRef, useState } from "react"
import type { ChangeEvent } from "react"
import { ROTULO_TIPO } from "@/biblioteca/apresentacao"
import { MESES } from "@/biblioteca/cliente"
import { formatarDataIso, hojeEmMaputo, obterDiaSemana } from "@/biblioteca/datas"
import type { DataSimples } from "@/biblioteca/tipos"
import { agruparPorData, feriadosDoAno, lerIso, somarDias } from "../dados"
import type { FeriadoAno } from "../dados"

import "./diautil.css"

type Motivo = "fim-de-semana" | "feriado"

interface Veredicto {
  util: boolean
  motivo: Motivo | null
  feriados: FeriadoAno[]
}

interface Resultado {
  data: DataSimples
  veredicto: Veredicto
  proximo: DataSimples | null
}

const TIPOS_OFICIAIS = ["nacional", "religioso"]

function eFimDeSemana({ ano, mes, dia }: DataSimples): boolean {
  const diaSemana = new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay()
  return diaSemana === 0 || diaSemana === 6
}

function descrever(data: DataSimples): string {
  return `${obterDiaSemana(data)}, ${data.dia} de ${MESES[data.mes - 1]} de ${data.ano}`
}

async function avaliar(data: DataSimples, incluirLocais: boolean): Promise<Veredicto> {
  const lista = await feriadosDoAno(data.ano)
  const doDia = agruparPorData(lista).get(formatarDataIso(data)) ?? []
  const contam = doDia.filter(feriado => incluirLocais || TIPOS_OFICIAIS.includes(feriado.tipo))

  if (eFimDeSemana(data)) return { util: false, motivo: "fim-de-semana", feriados: doDia }
  if (contam.length > 0) return { util: false, motivo: "feriado", feriados: doDia }
  return { util: true, motivo: null, feriados: doDia }
}

async function procurarProximoUtil(inicio: DataSimples, incluirLocais: boolean): Promise<DataSimples | null> {
  let actual = inicio
  for (let tentativa = 0; tentativa < 30; tentativa++) {
    actual = somarDias(actual, 1)
    if (actual.ano > 2100) return null
    const veredicto = await avaliar(actual, incluirLocais)
    if (veredicto.util) return actual
  }
  return null
}

export default function DiaUtil() {
  const identificador = useId()
  const [valor, definirValor] = useState("")
  const [incluirLocais, definirIncluirLocais] = useState(false)
  const [resultado, definirResultado] = useState<Resultado | null>(null)
  const [carregando, definirCarregando] = useState(false)
  const [erro, definirErro] = useState<string | null>(null)
  const pedidoActual = useRef(0)

  useEffect(() => {
    definirValor(formatarDataIso(hojeEmMaputo()))
  }, [])

  useEffect(() => {
    const data = lerIso(valor)

    if (!data || data.ano < 2000 || data.ano > 2100) {
      pedidoActual.current += 1
      definirResultado(null)
      definirCarregando(false)
      definirErro(valor ? "Escolhe uma data entre 2000 e 2100." : null)
      return
    }

    pedidoActual.current += 1
    const numero = pedidoActual.current
    definirCarregando(true)
    definirErro(null)

    async function executar(dataEscolhida: DataSimples) {
      try {
        const veredicto = await avaliar(dataEscolhida, incluirLocais)
        const proximo = veredicto.util ? null : await procurarProximoUtil(dataEscolhida, incluirLocais)
        if (numero !== pedidoActual.current) return
        definirResultado({ data: dataEscolhida, veredicto, proximo })
      } catch (e) {
        if (numero !== pedidoActual.current) return
        definirResultado(null)
        definirErro(e instanceof Error ? e.message : "Não foi possível verificar a data.")
      } finally {
        if (numero === pedidoActual.current) definirCarregando(false)
      }
    }

    executar(data)
  }, [valor, incluirLocais])

  function aoMudarData(evento: ChangeEvent<HTMLInputElement>) {
    definirValor(evento.target.value)
  }

  function usarDia(deslocamento: number) {
    definirValor(formatarDataIso(somarDias(hojeEmMaputo(), deslocamento)))
  }

  const util = resultado?.veredicto.util ?? false
  const locaisIgnorados = resultado !== null && resultado.veredicto.util && resultado.veredicto.feriados.length > 0

  return (
    <div className="diautil">
      <div className="exemplos__formulario">
        <label className="exemplos__rotulo" htmlFor={`${identificador}-data`}>
          Data a verificar
        </label>
        <input id={`${identificador}-data`} className="exemplos__campo" type="date" min="2000-01-01" max="2100-12-31" value={valor} onChange={aoMudarData} />

        <div className="exemplos__chips" role="group" aria-label="Atalhos de data">
          <button type="button" className="exemplos__chip" onClick={() => usarDia(0)}>
            Hoje
          </button>
          <button type="button" className="exemplos__chip" onClick={() => usarDia(1)}>
            Amanhã
          </button>
        </div>

        <label className="diautil__opcao">
          <input type="checkbox" checked={incluirLocais} onChange={evento => definirIncluirLocais(evento.target.checked)} />
          <span>Contar também feriados municipais e provinciais</span>
        </label>
      </div>

      <div className="diautil__resultado" aria-live="polite" aria-busy={carregando} data-util={resultado ? util : undefined}>
        {erro ? (
          <p className="exemplos__erro" role="alert">
            {erro}
          </p>
        ) : resultado ? (
          <>
            <p className="diautil__veredicto">
              <span className="diautil__icone" aria-hidden="true">
                {util ? (
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 8.5 3.25 3.25L13 4.5" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m4 4 8 8M12 4l-8 8" />
                  </svg>
                )}
              </span>
              {util ? "É dia útil" : "Não é dia útil"}
            </p>
            <p className="diautil__data">{descrever(resultado.data)}</p>

            {resultado.veredicto.motivo === "fim-de-semana" ? <p className="diautil__motivo">Cai a {obterDiaSemana(resultado.data)}.</p> : null}

            {resultado.veredicto.feriados.length > 0 ? (
              <ul className="diautil__feriados">
                {resultado.veredicto.feriados.map(feriado => (
                  <li key={feriado.id}>
                    <span className={`marca marca--${feriado.tipo}`} aria-hidden="true" />
                    <span>
                      {feriado.nome}
                      <span className="diautil__tipo"> · {ROTULO_TIPO[feriado.tipo]}</span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}

            {locaisIgnorados ? <p className="diautil__nota">Este feriado só vale no respectivo território. Activa a opção acima para o contar.</p> : null}

            {resultado.proximo ? (
              <button type="button" className="diautil__proximo" onClick={() => definirValor(formatarDataIso(resultado.proximo as DataSimples))}>
                <span className="diautil__proximoRotulo">Próximo dia útil</span>
                <span>{descrever(resultado.proximo)}</span>
              </button>
            ) : null}
          </>
        ) : (
          <p className="exemplos__vazio">{carregando ? "A verificar…" : "Escolhe uma data para ver o resultado."}</p>
        )}
      </div>
    </div>
  )
}
