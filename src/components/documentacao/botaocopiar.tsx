"use client"

import { useEffect, useRef, useState } from "react"

type Estado = "parado" | "copiado" | "erro"

export default function BotaoCopiar({ codigo, rotulo }: { codigo: string; rotulo: string }) {
  const [estado, definirEstado] = useState<Estado>("parado")
  const temporizador = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(temporizador.current), [])

  async function copiar() {
    try {
      await navigator.clipboard.writeText(codigo)
      definirEstado("copiado")
    } catch {
      definirEstado("erro")
    }
    window.clearTimeout(temporizador.current)
    temporizador.current = window.setTimeout(() => definirEstado("parado"), 2200)
  }

  const texto = estado === "copiado" ? "Copiado" : estado === "erro" ? "Falhou" : "Copiar"

  return (
    <>
      <button type="button" className="copiar" data-estado={estado} onClick={copiar} aria-label={`Copiar ${rotulo}`}>
        <svg className="copiar__icone" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
          <path d="M10.5 3.5v-.5a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 3v5A1.5 1.5 0 0 0 4 9.5h.5" />
        </svg>
        <svg className="copiar__visto" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m3 8.5 3.25 3.25L13 4.5" />
        </svg>
        <span aria-hidden="true">{texto}</span>
      </button>
      <span className="visualmente-oculto" role="status">
        {estado === "copiado" ? "Código copiado para a área de transferência" : estado === "erro" ? "Não foi possível copiar o código" : ""}
      </span>
    </>
  )
}
