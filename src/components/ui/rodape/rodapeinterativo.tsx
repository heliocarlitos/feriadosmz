"use client"

import { useEffect, useRef, useState } from "react"
import type { PointerEvent, ReactNode } from "react"

const formatadorMaputo = new Intl.DateTimeFormat("pt-MZ", {
  timeZone: "Africa/Maputo",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23"
})

type EstadoCopia = "parado" | "copiado" | "erro"

export function EfeitosRodape({ children }: { children: ReactNode }) {
  const referencia = useRef<HTMLElement>(null)

  useEffect(() => {
    const elemento = referencia.current
    if (!elemento) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    elemento.setAttribute("data-animar", "")

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return
        elemento.setAttribute("data-visivel", "")
        observador.disconnect()
      },
      { threshold: 0.05, rootMargin: "0px 0px -8% 0px" }
    )

    observador.observe(elemento)

    return () => observador.disconnect()
  }, [])

  function aoMover(evento: PointerEvent<HTMLElement>) {
    if (evento.pointerType !== "mouse") return
    const caixa = evento.currentTarget.getBoundingClientRect()
    const x = evento.clientX - caixa.left
    const y = evento.clientY - caixa.top
    evento.currentTarget.style.setProperty("--rato-x", `${x}px`)
    evento.currentTarget.style.setProperty("--rato-y", `${y}px`)
    evento.currentTarget.style.setProperty("--rato-nx", (x / caixa.width - 0.5).toFixed(3))
    evento.currentTarget.style.setProperty("--rato-ny", (y / caixa.height - 0.5).toFixed(3))
  }

  function aoSair(evento: PointerEvent<HTMLElement>) {
    evento.currentTarget.style.removeProperty("--rato-x")
    evento.currentTarget.style.removeProperty("--rato-y")
    evento.currentTarget.style.removeProperty("--rato-nx")
    evento.currentTarget.style.removeProperty("--rato-ny")
  }

  return (
    <footer ref={referencia} className="rodape" itemScope itemType="https://schema.org/WPFooter" onPointerMove={aoMover} onPointerLeave={aoSair}>
      {children}
    </footer>
  )
}

export function ContadorRodape({ valor }: { valor: number }) {
  const [mostrado, definirMostrado] = useState(valor)
  const referencia = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const elemento = referencia.current
    if (!elemento || valor === 0) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let quadro = 0

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return
        observador.disconnect()

        definirMostrado(0)
        const inicio = performance.now()
        const duracao = 1600

        const passo = (agora: number) => {
          const progresso = Math.min((agora - inicio) / duracao, 1)
          const suave = 1 - Math.pow(1 - progresso, 4)
          definirMostrado(Math.round(valor * suave))
          if (progresso < 1) quadro = requestAnimationFrame(passo)
        }

        quadro = requestAnimationFrame(passo)
      },
      { threshold: 0.8 }
    )

    observador.observe(elemento)

    return () => {
      observador.disconnect()
      cancelAnimationFrame(quadro)
    }
  }, [valor])

  return (
    <>
      <span ref={referencia} aria-hidden="true">
        {mostrado}
      </span>
      <span className="visualmente-oculto">{valor}</span>
    </>
  )
}

export function RelogioMaputo() {
  const [hora, definirHora] = useState<string | null>(null)

  useEffect(() => {
    const actualizar = () => definirHora(formatadorMaputo.format(new Date()))
    actualizar()
    const intervalo = window.setInterval(actualizar, 1000)
    return () => window.clearInterval(intervalo)
  }, [])

  return (
    <p className="rodape__relogio">
      <span className="rodape__relogioPonto" aria-hidden="true" />
      <span className="rodape__relogioRotulo">Hora em Maputo</span>
      <span className="rodape__relogioHora">{hora ?? "--:--:--"}</span>
    </p>
  )
}

export function BotaoCopiarRodape({ caminho }: { caminho: string }) {
  const [estado, definirEstado] = useState<EstadoCopia>("parado")
  const temporizador = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(temporizador.current), [])

  async function copiar() {
    try {
      await navigator.clipboard.writeText(`curl "${window.location.origin}${caminho}"`)
      definirEstado("copiado")
    } catch {
      definirEstado("erro")
    }
    window.clearTimeout(temporizador.current)
    temporizador.current = window.setTimeout(() => definirEstado("parado"), 2200)
  }

  return (
    <>
      <button type="button" className="rodape__copiar" data-estado={estado} onClick={copiar}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {estado === "copiado" ? (
            <path d="m3 8.5 3.25 3.25L13 4.5" />
          ) : (
            <>
              <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
              <path d="M10.5 3.5V3A1.5 1.5 0 0 0 9 1.5H4A1.5 1.5 0 0 0 2.5 3v5A1.5 1.5 0 0 0 4 9.5h.5" />
            </>
          )}
        </svg>
        <span>{estado === "copiado" ? "Copiado" : estado === "erro" ? "Falhou" : "Copiar cURL"}</span>
      </button>
      <span className="visualmente-oculto" role="status">
        {estado === "copiado" ? "Comando copiado para a área de transferência" : estado === "erro" ? "Não foi possível copiar o comando" : ""}
      </span>
    </>
  )
}

export function BotaoPausaFaixa({ alvo }: { alvo: string }) {
  const [pausado, definirPausado] = useState(false)

  function alternar() {
    const proximo = !pausado
    definirPausado(proximo)
    document.getElementById(alvo)?.toggleAttribute("data-pausado", proximo)
  }

  return (
    <button type="button" className="rodape__pausa" aria-pressed={pausado} aria-controls={alvo} onClick={alternar}>
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path className="rodape__pausaIcone" d="M4 2.5h2.75v11H4zM9.25 2.5H12v11H9.25z" />
        <path className="rodape__retomaIcone" d="M4.5 2.5v11l9-5.5z" />
      </svg>
      <span className="visualmente-oculto">Pausar a animação da lista de feriados</span>
    </button>
  )
}
