"use client"

import { useId, useRef, useState } from "react"
import type { KeyboardEvent, ReactNode } from "react"

export interface Aba {
  id: string
  rotulo: string
  conteudo: ReactNode
}

export default function Abas({ abas, rotulo }: { abas: Aba[]; rotulo: string }) {
  const base = useId()
  const [activa, definirActiva] = useState(0)
  const botoes = useRef<Array<HTMLButtonElement | null>>([])

  function aoTeclar(evento: KeyboardEvent<HTMLButtonElement>, indice: number) {
    let destino = indice
    if (evento.key === "ArrowRight") destino = (indice + 1) % abas.length
    else if (evento.key === "ArrowLeft") destino = (indice - 1 + abas.length) % abas.length
    else if (evento.key === "Home") destino = 0
    else if (evento.key === "End") destino = abas.length - 1
    else return

    evento.preventDefault()
    definirActiva(destino)
    botoes.current[destino]?.focus()
  }

  return (
    <div className="abas">
      <div role="tablist" aria-label={rotulo} className="abas__lista">
        {abas.map((aba, indice) => (
          <button
            key={aba.id}
            ref={elemento => {
              botoes.current[indice] = elemento
            }}
            type="button"
            role="tab"
            id={`${base}-aba-${aba.id}`}
            aria-selected={indice === activa}
            aria-controls={`${base}-painel-${aba.id}`}
            tabIndex={indice === activa ? 0 : -1}
            className="abas__botao"
            onClick={() => definirActiva(indice)}
            onKeyDown={evento => aoTeclar(evento, indice)}>
            {aba.rotulo}
          </button>
        ))}
      </div>
      {abas.map((aba, indice) => (
        <div key={aba.id} role="tabpanel" id={`${base}-painel-${aba.id}`} aria-labelledby={`${base}-aba-${aba.id}`} hidden={indice !== activa} className="abas__painel">
          {aba.conteudo}
        </div>
      ))}
    </div>
  )
}
