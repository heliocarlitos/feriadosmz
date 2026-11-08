"use client"

import { useEffect, useId, useState } from "react"
import { ROTULO_TIPO } from "@/biblioteca/apresentacao"
import { MESES } from "@/biblioteca/cliente"
import type { TipoFeriado } from "@/biblioteca/tipos"
import { lerIso } from "../dados"
import { usePedido } from "../usepedido"

import "./pesquisa.css"

interface Resultado {
  id: number
  nome: string
  tipo: TipoFeriado
  data: string | null
}

const SUGESTOES = ["independência", "paz", "cidade", "natal", "heróis"]

function formatarCurta(iso: string | null): string {
  const data = iso ? lerIso(iso) : null
  if (!data) return "Por confirmar"
  return `${data.dia} ${MESES[data.mes - 1].slice(0, 3)}`
}

export default function Pesquisa() {
  const identificador = useId()
  const [termo, definirTermo] = useState("independência")
  const [termoAtrasado, definirTermoAtrasado] = useState("independência")
  const [tentativa, definirTentativa] = useState(0)

  useEffect(() => {
    const temporizador = window.setTimeout(() => definirTermoAtrasado(termo), 300)
    return () => window.clearTimeout(temporizador)
  }, [termo])

  const limpo = termoAtrasado.trim()
  const caminho = limpo.length >= 2 ? `/feriados/buscar?q=${encodeURIComponent(limpo)}&campos=id,nome,tipo,data` : null
  const pedido = usePedido<Resultado[]>(caminho, tentativa)
  const resultados = caminho === null ? [] : (pedido.dados ?? [])
  const total = resultados.length

  return (
    <div className="pesquisa">
      <div className="exemplos__formulario">
        <label className="exemplos__rotulo" htmlFor={`${identificador}-termo`}>
          Procurar feriado
        </label>
        <input id={`${identificador}-termo`} className="exemplos__campo" type="search" value={termo} placeholder="independência, paz, cidade…" autoComplete="off" spellCheck={false} onChange={evento => definirTermo(evento.target.value)} />
        <div className="exemplos__chips" role="group" aria-label="Sugestões de pesquisa">
          {SUGESTOES.map(sugestao => (
            <button key={sugestao} type="button" className="exemplos__chip" aria-pressed={termo === sugestao} onClick={() => definirTermo(sugestao)}>
              {sugestao}
            </button>
          ))}
        </div>
      </div>

      <div aria-live="polite" aria-busy={pedido.estado === "carregando"}>
        {caminho === null ? (
          <p className="exemplos__vazio">Escreve pelo menos duas letras.</p>
        ) : pedido.estado === "erro" ? (
          <p className="exemplos__erro" role="alert">
            {pedido.mensagem}
            <button type="button" className="exemplos__repetir" onClick={() => definirTentativa(valor => valor + 1)}>
              Tentar de novo
            </button>
          </p>
        ) : pedido.estado === "carregando" && pedido.dados === null ? (
          <span className="exemplos__esqueleto pesquisa__esqueleto" />
        ) : total === 0 ? (
          <p className="exemplos__vazio">Nenhum feriado encontrado para “{limpo}”.</p>
        ) : (
          <>
            <p className="exemplos__contagem">{total === 1 ? "1 feriado encontrado" : `${total} feriados encontrados`}</p>
            <div className="exemplos__rolagem" role="region" aria-label="Resultados da pesquisa" tabIndex={0}>
              <ul>
                {resultados.map(feriado => (
                  <li key={feriado.id} className="exemplos__linha">
                    <span className={`marca marca--${feriado.tipo}`} aria-hidden="true" />
                    <span className="exemplos__linhaTexto">
                      <span className="exemplos__linhaNome">{feriado.nome}</span>
                      <span className="exemplos__linhaMeta">{ROTULO_TIPO[feriado.tipo]}</span>
                    </span>
                    {feriado.data ? (
                      <time className="exemplos__linhaData" dateTime={feriado.data}>
                        {formatarCurta(feriado.data)}
                      </time>
                    ) : (
                      <span className="exemplos__linhaData">Por confirmar</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
