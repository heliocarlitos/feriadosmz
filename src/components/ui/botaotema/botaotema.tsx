"use client"

import type { MouseEvent } from "react"
import "./botaotema.css"

type Tema = "claro" | "escuro"

type Transicao = { ready: Promise<unknown>; finished: Promise<unknown> }

type DocumentoComTransicao = Document & {
  startViewTransition?: (aoMudar: () => void) => Transicao
}

function temaActual(): Tema {
  const definido = document.documentElement.dataset.tema
  if (definido === "claro" || definido === "escuro") return definido
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "escuro" : "claro"
}

function aplicar(tema: Tema) {
  document.documentElement.dataset.tema = tema
  try {
    localStorage.setItem("tema", tema)
  } catch {
    return
  }
}

export default function BotaoTema() {
  function alternar(evento: MouseEvent<HTMLButtonElement>) {
    const proximo: Tema = temaActual() === "escuro" ? "claro" : "escuro"
    const documento = document as DocumentoComTransicao
    const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (!documento.startViewTransition || reduzirMovimento) {
      aplicar(proximo)
      return
    }

    const caixa = evento.currentTarget.getBoundingClientRect()
    const porRato = evento.detail > 0
    const x = porRato ? evento.clientX : caixa.left + caixa.width / 2
    const y = porRato ? evento.clientY : caixa.top + caixa.height / 2
    const raio = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
    const raiz = document.documentElement

    raiz.classList.add("tema-a-mudar")

    const transicao = documento.startViewTransition(() => aplicar(proximo))

    transicao.ready
      .then(() => {
        raiz.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${raio}px at ${x}px ${y}px)`] }, { duration: 750, easing: "cubic-bezier(0.65, 0, 0.35, 1)", pseudoElement: "::view-transition-new(root)" })
      })
      .catch(() => undefined)

    transicao.finished.finally(() => raiz.classList.remove("tema-a-mudar"))
  }

  return (
    <button type="button" className="botaotema" onClick={alternar} aria-label="Alternar tema claro ou escuro" title="Alternar tema">
      <svg className="botaotema__icone botaotema__icone--sol" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
      <svg className="botaotema__icone botaotema__icone--lua" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  )
}
