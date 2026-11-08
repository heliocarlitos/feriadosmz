"use client"

import { useId, useMemo, useState } from "react"
import type { ChangeEvent } from "react"
import { ROTULO_TIPO } from "@/biblioteca/apresentacao"
import { MESES } from "@/biblioteca/cliente"
import type { TipoFeriado } from "@/biblioteca/tipos"
import { lerIso } from "../dados"
import { usePedido } from "../usepedido"

import "./provincia.css"

interface FeriadoProvincia {
  id: number
  nome: string
  tipo: TipoFeriado
  data: string | null
  municipio: string | null
}

const PROVINCIAS = ["Maputo", "Gaza", "Inhambane", "Sofala", "Manica", "Tete", "Zambézia", "Nampula", "Cabo Delgado", "Niassa"]

function formatarCurta(iso: string | null): string {
  const data = iso ? lerIso(iso) : null
  if (!data) return "Por confirmar"
  return `${data.dia} ${MESES[data.mes - 1].slice(0, 3)}`
}

export default function Provincia() {
  const identificador = useId()
  const [provincia, definirProvincia] = useState("Zambézia")
  const [tentativa, definirTentativa] = useState(0)
  const pedido = usePedido<FeriadoProvincia[]>(`/feriados/provincia/${encodeURIComponent(provincia)}?campos=id,nome,tipo,data,municipio`, tentativa)

  const lista = useMemo(() => [...(pedido.dados ?? [])].sort((a, b) => (a.data ?? "9999").localeCompare(b.data ?? "9999") || a.id - b.id), [pedido.dados])

  function aoMudar(evento: ChangeEvent<HTMLSelectElement>) {
    definirProvincia(evento.target.value)
  }

  return (
    <div className="provincia">
      <div className="exemplos__formulario">
        <label className="exemplos__rotulo" htmlFor={`${identificador}-provincia`}>
          Província
        </label>
        <select id={`${identificador}-provincia`} className="exemplos__campo" value={provincia} onChange={aoMudar}>
          {PROVINCIAS.map(nome => (
            <option key={nome} value={nome}>
              {nome}
            </option>
          ))}
        </select>
      </div>

      <div aria-live="polite" aria-busy={pedido.estado === "carregando"}>
        {pedido.estado === "erro" ? (
          <p className="exemplos__erro" role="alert">
            {pedido.mensagem}
            <button type="button" className="exemplos__repetir" onClick={() => definirTentativa(valor => valor + 1)}>
              Tentar de novo
            </button>
          </p>
        ) : pedido.dados === null ? (
          <span className="exemplos__esqueleto provincia__esqueleto" />
        ) : lista.length === 0 ? (
          <p className="exemplos__vazio">Sem feriados registados para {provincia}.</p>
        ) : (
          <>
            <p className="exemplos__contagem">
              {lista.length === 1 ? "1 feriado em " : `${lista.length} feriados em `}
              {provincia}
            </p>
            <div className="exemplos__rolagem" role="region" aria-label={`Feriados de ${provincia}`} tabIndex={0}>
              <ul>
                {lista.map(feriado => (
                  <li key={feriado.id} className="exemplos__linha">
                    <span className={`marca marca--${feriado.tipo}`} aria-hidden="true" />
                    <span className="exemplos__linhaTexto">
                      <span className="exemplos__linhaNome">{feriado.nome}</span>
                      <span className="exemplos__linhaMeta">
                        {ROTULO_TIPO[feriado.tipo]}
                        {feriado.municipio ? ` · ${feriado.municipio}` : ""}
                      </span>
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
