"use client"

import { useEffect, useState } from "react"
import { MESES } from "@/biblioteca/cliente"
import { lerIso } from "../dados"
import { usePedido } from "../usepedido"

import "./contagem.css"

interface Proximo {
  id: number
  nome: string
  data: string | null
  diaSemana: string | null
}

const DESLOCAMENTO_MAPUTO = 2 * 60 * 60 * 1000

function instanteDoDia(iso: string): number | null {
  const data = lerIso(iso)
  if (!data) return null
  return Date.UTC(data.ano, data.mes - 1, data.dia) - DESLOCAMENTO_MAPUTO
}

function dividir(restante: number) {
  const total = Math.max(0, Math.floor(restante / 1000))
  return {
    dias: Math.floor(total / 86400),
    horas: Math.floor((total % 86400) / 3600),
    minutos: Math.floor((total % 3600) / 60),
    segundos: total % 60
  }
}

function dois(valor: number): string {
  return String(valor).padStart(2, "0")
}

function dataLonga(iso: string): string {
  const data = lerIso(iso)
  if (!data) return iso
  return `${data.dia} de ${MESES[data.mes - 1]} de ${data.ano}`
}

export default function Contagem() {
  const [tentativa, definirTentativa] = useState(0)
  const [agora, definirAgora] = useState<number | null>(null)
  const pedido = usePedido<Proximo[]>("/feriados/proximos?limite=4&campos=id,nome,data,diaSemana", tentativa)

  useEffect(() => {
    definirAgora(Date.now())
    const intervalo = window.setInterval(() => definirAgora(Date.now()), 1000)
    return () => window.clearInterval(intervalo)
  }, [])

  const lista = pedido.dados ?? []
  const principal = lista[0] ?? null
  const seguintes = lista.slice(1)
  const alvo = principal?.data ? instanteDoDia(principal.data) : null
  const restante = alvo !== null && agora !== null ? alvo - agora : null
  const ehHoje = restante !== null && restante <= 0
  const partes = restante !== null ? dividir(restante) : null

  if (pedido.estado === "erro") {
    return (
      <div className="contagem">
        <p className="exemplos__erro" role="alert">
          {pedido.mensagem}
          <button type="button" className="exemplos__repetir" onClick={() => definirTentativa(valor => valor + 1)}>
            Tentar de novo
          </button>
        </p>
      </div>
    )
  }

  if (!principal || !principal.data || partes === null) {
    return (
      <div className="contagem" aria-busy="true">
        <span className="exemplos__esqueleto contagem__esqueletoTitulo" />
        <span className="exemplos__esqueleto contagem__esqueletoRelogio" />
        <span className="visualmente-oculto">A carregar o próximo feriado</span>
      </div>
    )
  }

  const unidades = [
    { rotulo: "dias", valor: partes.dias },
    { rotulo: "horas", valor: partes.horas },
    { rotulo: "min", valor: partes.minutos },
    { rotulo: "seg", valor: partes.segundos }
  ]

  return (
    <div className="contagem">
      <p className="contagem__etiqueta">{ehHoje ? "Hoje é feriado" : "Próximo feriado"}</p>
      <h4 className="contagem__nome">{principal.nome}</h4>
      <p className="contagem__data">
        {principal.diaSemana}, {dataLonga(principal.data)}
      </p>

      {ehHoje ? (
        <p className="contagem__hoje">Aproveita o dia.</p>
      ) : (
        <div className="contagem__relogio" role="timer">
          {unidades.map(unidade => (
            <div key={unidade.rotulo} className="contagem__celula" aria-hidden="true">
              <span key={unidade.valor} className="contagem__numero">
                {dois(unidade.valor)}
              </span>
              <span className="contagem__unidade">{unidade.rotulo}</span>
            </div>
          ))}
          <span className="visualmente-oculto">
            Faltam {partes.dias} dias e {partes.horas} horas para {principal.nome}.
          </span>
        </div>
      )}

      {seguintes.length > 0 ? (
        <div className="contagem__seguintes">
          <p className="contagem__subtitulo">Depois deste</p>
          <ol>
            {seguintes.map(feriado => {
              const data = feriado.data ? lerIso(feriado.data) : null
              return (
                <li key={feriado.id}>
                  <span className="contagem__quando">{data ? `${data.dia} ${MESES[data.mes - 1].slice(0, 3)}` : "—"}</span>
                  <span>{feriado.nome}</span>
                </li>
              )
            })}
          </ol>
        </div>
      ) : null}

      <p className="contagem__nota">A contagem usa o fuso horário de Maputo (UTC+2).</p>
    </div>
  )
}
