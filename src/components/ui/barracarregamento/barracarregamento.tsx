"use client"

import { usePathname } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import "./barracarregamento.css"

const ATRASOS = [40, 150, 250, 400, 650, 1000, 1500, 2200, 3200]
const PASSO_FINAL = 10
const LIMITE_NAVEGACAO = 8000

export default function BarraCarregamento() {
  const caminho = usePathname()
  const [passo, definirPasso] = useState(0)
  const [visivel, definirVisivel] = useState(false)

  const pendentes = useRef(0)
  const activo = useRef(false)
  const navegando = useRef(false)
  const caminhoRef = useRef(caminho)
  const passos = useRef<ReturnType<typeof setTimeout>[]>([])
  const fim = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const seguranca = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const cancelarPassos = useCallback(() => {
    passos.current.forEach(clearTimeout)
    passos.current = []
  }, [])

  const comecar = useCallback(() => {
    clearTimeout(fim.current)
    if (activo.current) return
    activo.current = true
    cancelarPassos()
    definirPasso(0)
    definirVisivel(true)

    let acumulado = 0
    ATRASOS.forEach((atraso, indice) => {
      acumulado += atraso
      passos.current.push(setTimeout(() => definirPasso(indice + 1), acumulado))
    })
  }, [cancelarPassos])

  const concluir = useCallback(() => {
    if (!activo.current) return
    activo.current = false
    cancelarPassos()
    definirPasso(PASSO_FINAL)
    passos.current.push(setTimeout(() => definirVisivel(false), 300))
    passos.current.push(setTimeout(() => definirPasso(0), 800))
  }, [cancelarPassos])

  const pedir = useCallback(() => {
    pendentes.current += 1
    comecar()
  }, [comecar])

  const liberar = useCallback(() => {
    pendentes.current = Math.max(0, pendentes.current - 1)
    if (pendentes.current > 0) return
    clearTimeout(fim.current)
    fim.current = setTimeout(concluir, 150)
  }, [concluir])

  const terminarNavegacao = useCallback(() => {
    if (!navegando.current) return
    navegando.current = false
    clearTimeout(seguranca.current)
    liberar()
  }, [liberar])

  const iniciarNavegacao = useCallback(() => {
    if (navegando.current) return
    navegando.current = true
    pedir()
    clearTimeout(seguranca.current)
    seguranca.current = setTimeout(terminarNavegacao, LIMITE_NAVEGACAO)
  }, [pedir, terminarNavegacao])

  useEffect(() => {
    caminhoRef.current = caminho
    terminarNavegacao()
  }, [caminho, terminarNavegacao])

  useEffect(() => {
    function aoClicar(evento: MouseEvent) {
      if (evento.defaultPrevented || evento.button !== 0) return
      if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return

      const ancora = evento.target instanceof Element ? evento.target.closest("a") : null
      if (!(ancora instanceof HTMLAnchorElement)) return
      if (ancora.target === "_blank" || ancora.hasAttribute("download")) return

      const destino = new URL(ancora.href, window.location.href)
      if (destino.origin !== window.location.origin) return
      if (destino.pathname === window.location.pathname) return
      if (destino.pathname.startsWith("/api/")) return

      iniciarNavegacao()
    }

    function aoVoltar() {
      if (window.location.pathname === caminhoRef.current) return
      iniciarNavegacao()
    }

    document.addEventListener("click", aoClicar, true)
    window.addEventListener("popstate", aoVoltar)
    window.addEventListener("carregamento:iniciar", pedir)
    window.addEventListener("carregamento:terminar", liberar)

    return () => {
      document.removeEventListener("click", aoClicar, true)
      window.removeEventListener("popstate", aoVoltar)
      window.removeEventListener("carregamento:iniciar", pedir)
      window.removeEventListener("carregamento:terminar", liberar)
    }
  }, [iniciarNavegacao, pedir, liberar])

  useEffect(() => {
    if (document.readyState === "complete") return

    let pendente = true
    pedir()

    const terminar = () => {
      if (!pendente) return
      pendente = false
      liberar()
    }

    window.addEventListener("load", terminar, { once: true })
    return () => {
      window.removeEventListener("load", terminar)
      terminar()
    }
  }, [pedir, liberar])

  useEffect(() => {
    const original = window.fetch

    window.fetch = (entrada: RequestInfo | URL, inicio?: RequestInit) => {
      const endereco = new URL(entrada instanceof Request ? entrada.url : String(entrada), window.location.href)
      const rastrear = endereco.origin === window.location.origin && endereco.pathname.startsWith("/api/")
      if (!rastrear) return original.call(window, entrada, inicio)

      pedir()
      return original.call(window, entrada, inicio).finally(liberar)
    }

    return () => {
      window.fetch = original
    }
  }, [pedir, liberar])

  useEffect(() => {
    return () => {
      cancelarPassos()
      clearTimeout(fim.current)
      clearTimeout(seguranca.current)
    }
  }, [cancelarPassos])

  return (
    <>
      <div className="carregamento" data-visivel={visivel || undefined} data-passo={passo} aria-hidden="true">
        <div className="carregamento__barra" />
      </div>
      <span className="visualmente-oculto" role="status" aria-live="polite">
        {visivel ? "A carregar" : ""}
      </span>
    </>
  )
}
