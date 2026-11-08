"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type PointerEvent } from "react"
import Pesquisa from "@componentes/pesquisa/pesquisa"
import { VscClose, VscLock } from "react-icons/vsc"
import { juntarClasses } from "@/biblioteca/cliente"

import "./header.css"
import BotaoTema from "../botaotema/botaotema"

const ROTAS = [
  { href: "/", rotulo: "Home", titulo: "Home", numero: "01" },
  { href: "/feriados/nacional", rotulo: "Nacional", titulo: "Feriado nacional", numero: "02" },
  { href: "/feriados/provincial", rotulo: "Provincial", titulo: "Feriado provincial", numero: "03" },
  { href: "/feriados/municipal", rotulo: "Municipal", titulo: "Feriado municipal", numero: "04" },
  { href: "/doc", rotulo: "Documentação", titulo: "Documentação", numero: "05" }
] as const

type RotaHref = (typeof ROTAS)[number]["href"]

type Hoje = { data: string; dia: number; total: number; ano: number }

function rotaActiva(caminho: string): RotaHref | null {
  const encontrada = ROTAS.find(rota => (rota.href === "/" ? caminho === "/" : caminho === rota.href || caminho.startsWith(`${rota.href}/`)))
  return encontrada ? encontrada.href : null
}

export default function Header() {
  const caminho = usePathname()
  const idPainel = useId()
  const activa = rotaActiva(caminho ?? "")

  const [rolou, definirRolou] = useState(false)
  const [oculto, definirOculto] = useState(false)
  const [pairado, definirPairado] = useState<RotaHref | null>(null)
  const [painelAberto, definirPainelAberto] = useState(false)
  const [hoje, definirHoje] = useState<Hoje | null>(null)

  const painelRef = useRef<HTMLDivElement>(null)
  const gatilhoRef = useRef<HTMLButtonElement>(null)
  const listaRef = useRef<HTMLUListElement>(null)
  const ligacoes = useRef<(HTMLAnchorElement | null)[]>([])
  const ultimoScroll = useRef(0)

  const alvo = pairado ?? activa

  useEffect(() => {
    const agora = new Date()
    const ano = agora.getFullYear()
    const inicio = new Date(ano, 0, 0)
    const dia = Math.floor((agora.getTime() - inicio.getTime()) / 86400000)
    const total = new Date(ano, 1, 29).getMonth() === 1 ? 366 : 365
    const data = agora.toLocaleDateString("pt-MZ", { weekday: "long", day: "numeric", month: "long" })
    definirHoje({ data, dia, total, ano })
  }, [])

  useEffect(() => {
    function aoScroll() {
      const y = window.scrollY
      definirRolou(y > 4)

      if (painelAberto) {
        ultimoScroll.current = y
        return
      }

      const delta = y - ultimoScroll.current
      if (y < 80) {
        definirOculto(false)
      } else if (delta > 6) {
        definirOculto(true)
      } else if (delta < -6) {
        definirOculto(false)
      }
      ultimoScroll.current = y
    }
    aoScroll()
    window.addEventListener("scroll", aoScroll, { passive: true })
    return () => window.removeEventListener("scroll", aoScroll)
  }, [painelAberto])

  useEffect(() => {
    const lista = listaRef.current
    if (!lista) return

    function medir() {
      if (!lista) return
      const indice = ROTAS.findIndex(rota => rota.href === alvo)
      const ligacao = indice >= 0 ? ligacoes.current[indice] : null
      if (!ligacao) {
        lista.removeAttribute("data-indicador")
        return
      }
      lista.style.setProperty("--indicador-x", `${ligacao.offsetLeft}px`)
      lista.style.setProperty("--indicador-l", `${ligacao.offsetWidth}px`)
      lista.setAttribute("data-indicador", "")
    }

    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(lista)
    return () => observador.disconnect()
  }, [alvo])

  useEffect(() => {
    if (!painelAberto) return

    const anteriorFoco = document.activeElement as HTMLElement | null
    const anteriorOverflow = document.body.style.overflow
    const anteriorOverflowHtml = document.documentElement.style.overflow
    document.body.style.overflow = "hidden"
    document.documentElement.style.overflow = "hidden"

    const focaveis = () => painelRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? []

    focaveis()[0]?.focus()

    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        evento.preventDefault()
        definirPainelAberto(false)
        return
      }
      if (evento.key !== "Tab") return
      const lista = Array.from(focaveis())
      if (lista.length === 0) return
      const inicio = lista[0]
      const fim = lista[lista.length - 1]
      if (evento.shiftKey && document.activeElement === inicio) {
        evento.preventDefault()
        fim.focus()
      } else if (!evento.shiftKey && document.activeElement === fim) {
        evento.preventDefault()
        inicio.focus()
      }
    }

    document.addEventListener("keydown", aoTeclar)
    return () => {
      document.removeEventListener("keydown", aoTeclar)
      document.body.style.overflow = anteriorOverflow
      document.documentElement.style.overflow = anteriorOverflowHtml
      anteriorFoco?.focus()
    }
  }, [painelAberto])

  useEffect(() => {
    definirPainelAberto(false)
  }, [caminho])

  const fechar = useCallback(() => definirPainelAberto(false), [])

  function alternarPainel() {
    if (!painelAberto) {
      const caixa = gatilhoRef.current?.getBoundingClientRect()
      if (caixa && painelRef.current) {
        painelRef.current.style.setProperty("--origem-x", `${caixa.left + caixa.width / 2}px`)
        painelRef.current.style.setProperty("--origem-y", `${caixa.top + caixa.height / 2}px`)
      }
    }
    definirPainelAberto(valor => !valor)
  }

  function aoMoverPonteiro(evento: PointerEvent<HTMLDivElement>) {
    const caixa = evento.currentTarget.getBoundingClientRect()
    evento.currentTarget.style.setProperty("--rato-x", `${evento.clientX - caixa.left}px`)
    evento.currentTarget.style.setProperty("--rato-y", `${evento.clientY - caixa.top}px`)
  }

  return (
    <header className={juntarClasses("header", rolou && "header--rolado", oculto && "header--oculto", painelAberto && "header--aberto")} data-painel={painelAberto || undefined}>
      <div className="header__ilha" onPointerMove={aoMoverPonteiro}>
        <Link className="header__marca" href="/" aria-label="Feriados MZ — início">
          <span className="header__simbolo" aria-hidden="true">
            <Image className="header__logo" src="/logo.webp" alt="" width={80} height={80} priority />
          </span>
          <span className="header__marcaTexto">
            Feriados<span className="header__marcaDestaque">MZ</span>
          </span>
        </Link>

        <nav className="header__nav" aria-label="Navegação principal">
          <ul ref={listaRef} className="header__lista" onPointerLeave={() => definirPairado(null)}>
            {ROTAS.map((rota, indice) => {
              const activo = activa === rota.href
              return (
                <li key={rota.href} onPointerEnter={() => definirPairado(rota.href)}>
                  <Link
                    ref={elemento => {
                      ligacoes.current[indice] = elemento
                    }}
                    className={juntarClasses("header__ligacao", activo && "header__ligacao--activa", rota.href === "/doc" && "header__ligacao--destaque")}
                    href={rota.href}
                    aria-current={activo ? "page" : undefined}
                    onFocus={() => definirPairado(rota.href)}
                    onBlur={() => definirPairado(null)}>
                    <span>{rota.rotulo}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="header__accoes">
          <Pesquisa aoAbrir={fechar} />
          <BotaoTema />

          <button ref={gatilhoRef} type="button" className="header__gatilho" aria-expanded={painelAberto} aria-controls={idPainel} aria-label={painelAberto ? "Fechar menu" : "Abrir menu"} onClick={alternarPainel}>
            <span className="header__linha" aria-hidden="true" />
            <span className="header__linha" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div ref={painelRef} id={idPainel} className="header__painel" data-aberto={painelAberto || undefined} role="dialog" aria-modal="true" aria-label="Menu de navegação">
        <div className="header__painelTopo">
          <span className="header__painelRisco" aria-hidden="true" />
          <span className="header__painelEtiqueta">Índice</span>
          <span className="header__painelAno">{hoje?.ano}</span>
        </div>

        <ul className="header__painelLista">
          {ROTAS.map((rota, indice) => {
            const activo = activa === rota.href
            return (
              <li key={rota.href} className="header__painelItem" style={{ "--i": indice } as CSSProperties}>
                <Link className={juntarClasses("header__painelLigacao", activo && "header__painelLigacao--activa", rota.href === "/doc" && "header__painelLigacao--destaque")} href={rota.href} aria-current={activo ? "page" : undefined} onClick={fechar}>
                  <span className="header__painelNumero" aria-hidden="true">
                    {rota.numero}
                  </span>
                  <span className="header__painelRotulo">{rota.titulo}</span>
                  <span className="header__painelSeta" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>

        {hoje && (
          <div className="header__painelHoje" style={{ "--progresso": hoje.dia / hoje.total } as CSSProperties}>
            <span className="header__painelData">{hoje.data}</span>
            <span className="header__medidor" aria-hidden="true">
              <span className="header__medidorPreenchimento" />
            </span>
            <span className="header__painelDia">
              Dia {hoje.dia} de {hoje.total}
            </span>
          </div>
        )}

        <div className="header__painelRodape">
          <span className="header__painelNota">
            <VscLock aria-hidden="true" />
            API aberta · sem chave
          </span>
          <button type="button" className="header__painelFechar" aria-label="Fechar menu" onClick={fechar}>
            <VscClose aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  )
}
