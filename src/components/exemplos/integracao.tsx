"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { realcar } from "@/biblioteca/realce"

type Estado = "parado" | "copiado" | "erro"

export default function Integracao({ codigo }: { codigo: string }) {
  const [estado, definirEstado] = useState<Estado>("parado")
  const temporizador = useRef<number | undefined>(undefined)
  const tokens = useMemo(() => realcar(codigo, "javascript"), [codigo])

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

  return (
    <details className="integracao">
      <summary className="integracao__resumo">
        <span>Como integrar no teu projecto</span>
        <svg className="integracao__seta" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m4 6 4 4 4-4" />
        </svg>
      </summary>

      <div className="integracao__corpo">
        <div className="integracao__topo">
          <span className="integracao__linguagem">JavaScript</span>
          <button type="button" className="integracao__copiar" data-estado={estado} onClick={copiar}>
            {estado === "copiado" ? "Copiado" : estado === "erro" ? "Falhou" : "Copiar"}
          </button>
          <span className="visualmente-oculto" role="status">
            {estado === "copiado" ? "Código copiado para a área de transferência" : estado === "erro" ? "Não foi possível copiar o código" : ""}
          </span>
        </div>
        <pre className="integracao__codigo" tabIndex={0} role="region" aria-label="Código de exemplo">
          <code className="codigo">
            {tokens.map((token, indice) =>
              token.tipo === "normal" ? (
                token.valor
              ) : (
                <span key={indice} className={`t-${token.tipo}`}>
                  {token.valor}
                </span>
              )
            )}
          </code>
        </pre>
      </div>
    </details>
  )
}
