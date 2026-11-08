"use client"

import Link from "next/link"
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react"
import type { FormEvent, KeyboardEvent as TeclaReact } from "react"
import { VscClose, VscSearch } from "react-icons/vsc"
import { ROTULO_TIPO, caminhoFeriado, formatarDataLonga } from "@/biblioteca/apresentacao"
import { destacar, extrairTermos, pesquisarFeriados, sugerirProximos, textoDeApoio, type FeriadoPesquisavel, type Segmento } from "@/biblioteca/pesquisa"
import { carregarIndice } from "./indice"
import "./pesquisa.css"

const LIMITE_RESULTADOS = 8
const LIMITE_SUGESTOES = 5
const EXEMPLOS = ["25 junho", "independência", "Zambézia", "municipal agosto", "2027"]

type Estado = "inactivo" | "a-carregar" | "pronto" | "erro"

interface Props {
  aoAbrir?: () => void
}

function escrevendoEmCampo(alvo: EventTarget | null): boolean {
  return alvo instanceof HTMLElement && (alvo.isContentEditable || alvo.tagName === "INPUT" || alvo.tagName === "TEXTAREA" || alvo.tagName === "SELECT")
}

function montarMeta(feriado: FeriadoPesquisavel): string {
  return [ROTULO_TIPO[feriado.tipo], formatarDataLonga(feriado), feriado.diaSemana, feriado.municipio ?? feriado.provincia].filter(Boolean).join(" · ")
}

function Realce({ segmentos }: { segmentos: Segmento[] }) {
  return (
    <>
      {segmentos.map((segmento, indice) =>
        segmento.marca ? (
          <mark key={indice} className="pesquisa__marca">
            {segmento.texto}
          </mark>
        ) : (
          <span key={indice}>{segmento.texto}</span>
        )
      )}
    </>
  )
}

function Resultado({ feriado, termos, aoEscolher }: { feriado: FeriadoPesquisavel; termos: string[]; aoEscolher: () => void }) {
  const meta = montarMeta(feriado)
  const apoio = textoDeApoio(feriado, termos)

  return (
    <li>
      <Link className="pesquisa__ligacao" href={caminhoFeriado(feriado)} onClick={aoEscolher} aria-label={`${feriado.nome}. ${meta}`}>
        <span className="pesquisa__data" aria-hidden="true">
          <span className="pesquisa__dia">{feriado.dia ?? "·"}</span>
          <span className="pesquisa__mes">{feriado.mesNome ? feriado.mesNome.slice(0, 3) : "·"}</span>
        </span>

        <span className="pesquisa__texto" aria-hidden="true">
          <span className="pesquisa__nome">
            <Realce segmentos={destacar(feriado.nome, termos)} />
          </span>
          <span className="pesquisa__meta">
            <Realce segmentos={destacar(meta, termos)} />
          </span>
          {apoio && (
            <span className="pesquisa__trecho">
              <Realce segmentos={destacar(apoio, termos)} />
            </span>
          )}
        </span>

        <span className="pesquisa__seta" aria-hidden="true">
          →
        </span>
      </Link>
    </li>
  )
}

function Exemplos({ aoEscolher }: { aoEscolher: (texto: string) => void }) {
  return (
    <div className="pesquisa__exemplos">
      <span className="pesquisa__exemplosRotulo">Experimenta</span>
      {EXEMPLOS.map(exemplo => (
        <button key={exemplo} type="button" className="pesquisa__exemplo" onClick={() => aoEscolher(exemplo)}>
          {exemplo}
        </button>
      ))}
    </div>
  )
}

export default function Pesquisa({ aoAbrir }: Props) {
  const idBase = useId()
  const idTitulo = `${idBase}-titulo`
  const idEntrada = `${idBase}-entrada`
  const idAjuda = `${idBase}-ajuda`
  const idResultados = `${idBase}-resultados`

  const dialogo = useRef<HTMLDialogElement>(null)
  const entrada = useRef<HTMLInputElement>(null)
  const corpo = useRef<HTMLDivElement>(null)

  const [aberto, definirAberto] = useState(false)
  const [consulta, definirConsulta] = useState("")
  const [estado, definirEstado] = useState<Estado>("inactivo")
  const [indice, definirIndice] = useState<FeriadoPesquisavel[]>([])
  const [anoBase, definirAnoBase] = useState<number | null>(null)
  const [tentativa, definirTentativa] = useState(0)

  const termos = useMemo(() => extrairTermos(consulta), [consulta])

  const anoPedido = useMemo(() => {
    const termo = termos.find(item => /^\d{4}$/.test(item) && Number(item) >= 2000 && Number(item) <= 2100)
    if (!termo) return undefined
    const ano = Number(termo)
    return ano === anoBase ? undefined : ano
  }, [termos, anoBase])

  useEffect(() => {
    if (!aberto) return

    let cancelado = false
    definirEstado("a-carregar")

    carregarIndice(anoPedido)
      .then(dados => {
        if (cancelado) return
        definirIndice(dados)
        if (anoPedido === undefined && dados.length > 0) definirAnoBase(dados[0].ano)
        definirEstado("pronto")
      })
      .catch(() => {
        if (!cancelado) definirEstado("erro")
      })

    return () => {
      cancelado = true
    }
  }, [aberto, anoPedido, tentativa])

  const hoje = useMemo(() => (aberto ? new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Maputo" }).format(new Date()) : ""), [aberto])

  const todos = useMemo(() => (estado === "pronto" && termos.length > 0 ? pesquisarFeriados(indice, termos) : []), [estado, indice, termos])

  const resultados = useMemo(() => todos.slice(0, LIMITE_RESULTADOS).map(resultado => resultado.feriado), [todos])

  const sugestoes = useMemo(() => {
    if (estado !== "pronto" || termos.length > 0) return []
    const proximos = sugerirProximos(indice, hoje, LIMITE_SUGESTOES)
    return proximos.length > 0 ? proximos : indice.slice(0, LIMITE_SUGESTOES)
  }, [estado, termos, indice, hoje])

  const mensagem = useMemo(() => {
    if (estado === "a-carregar") return "A carregar feriados"
    if (estado === "erro") return "Não foi possível carregar os feriados"
    if (estado !== "pronto") return ""
    if (termos.length === 0) return `${sugestoes.length} sugestões: próximos feriados`
    if (todos.length === 0) return `Sem resultados para ${consulta.trim()}`
    const total = `${todos.length} ${todos.length === 1 ? "resultado" : "resultados"}`
    return todos.length > resultados.length ? `${total}, a mostrar os primeiros ${resultados.length}` : total
  }, [estado, termos, sugestoes, todos, resultados, consulta])

  const abrir = useCallback(() => {
    const elemento = dialogo.current
    if (!elemento || elemento.open) return

    aoAbrir?.()
    elemento.showModal()
    definirAberto(true)
    entrada.current?.focus()
    entrada.current?.select()
  }, [aoAbrir])

  const fechar = useCallback(() => {
    dialogo.current?.close()
  }, [])

  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.defaultPrevented || evento.altKey) return

      const atalhoControlo = (evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === "k"
      const atalhoBarra = evento.key === "/" && !evento.ctrlKey && !evento.metaKey && !escrevendoEmCampo(evento.target)
      if (!atalhoControlo && !atalhoBarra) return

      evento.preventDefault()
      abrir()
    }

    document.addEventListener("keydown", aoTeclar)
    return () => document.removeEventListener("keydown", aoTeclar)
  }, [abrir])

  function aoTeclarNoDialogo(evento: TeclaReact<HTMLDialogElement>) {
    if (evento.key === "Escape") {
      evento.preventDefault()
      fechar()
      return
    }

    if (evento.key !== "ArrowDown" && evento.key !== "ArrowUp") return

    const ligacoes = Array.from(corpo.current?.querySelectorAll<HTMLElement>("a[href]") ?? [])
    const itens = [entrada.current, ...ligacoes].filter((item): item is HTMLElement => item !== null)
    const actual = itens.indexOf(document.activeElement as HTMLElement)
    if (actual === -1) return

    evento.preventDefault()
    const proximo = evento.key === "ArrowDown" ? Math.min(actual + 1, itens.length - 1) : Math.max(actual - 1, 0)
    itens[proximo].focus()
  }

  function aoSubmeter(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    corpo.current?.querySelector<HTMLAnchorElement>("a[href]")?.click()
  }

  function escolherExemplo(texto: string) {
    definirConsulta(texto)
    entrada.current?.focus()
  }

  function limpar() {
    definirConsulta("")
    entrada.current?.focus()
  }

  const temConsulta = termos.length > 0

  return (
    <>
      <button type="button" className="pesquisa__gatilho" onClick={abrir} aria-haspopup="dialog" aria-expanded={aberto} aria-keyshortcuts="Control+K Meta+K /" aria-label="Pesquisar feriados" title="Pesquisar feriados (Ctrl+K)">
        <VscSearch aria-hidden="true" />
      </button>

      <dialog
        ref={dialogo}
        className="pesquisa__dialogo"
        aria-labelledby={idTitulo}
        aria-describedby={idAjuda}
        onKeyDown={aoTeclarNoDialogo}
        onClose={() => definirAberto(false)}
        onClick={evento => {
          if (evento.target === evento.currentTarget) fechar()
        }}>
        <div className="pesquisa__caixa">
          <h2 id={idTitulo} className="visualmente-oculto">
            Pesquisar feriados
          </h2>
          <p id={idAjuda} className="visualmente-oculto">
            Escreve o nome, o dia, o mês, o ano ou uma palavra da descrição. Usa as setas para percorrer os resultados e Enter para abrir o primeiro.
          </p>

          <form className="pesquisa__formulario" role="search" aria-label="Pesquisar feriados" onSubmit={aoSubmeter}>
            <VscSearch className="pesquisa__lupa" aria-hidden="true" />
            <label htmlFor={idEntrada} className="visualmente-oculto">
              Pesquisar feriados por nome, data, mês, ano ou descrição
            </label>
            <input ref={entrada} id={idEntrada} className="pesquisa__entrada" type="search" name="q" value={consulta} onChange={evento => definirConsulta(evento.target.value)} placeholder="Nome, dia, mês, ano, descrição…" aria-controls={idResultados} autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} enterKeyHint="search" />
            {consulta && (
              <button type="button" className="pesquisa__limpar" onClick={limpar} aria-label="Limpar pesquisa">
                <VscClose aria-hidden="true" />
              </button>
            )}
          </form>

          <div ref={corpo} id={idResultados} className="pesquisa__corpo" aria-busy={estado === "a-carregar"}>
            {estado === "a-carregar" && (
              <ul className="pesquisa__esqueleto" aria-hidden="true">
                {[0, 1, 2, 3].map(posicao => (
                  <li key={posicao} className="pesquisa__esqueletoLinha">
                    <span className="pesquisa__esqueletoData" />
                    <span className="pesquisa__esqueletoTexto">
                      <span />
                      <span />
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {estado === "erro" && (
              <div className="pesquisa__vazio">
                <p className="pesquisa__vazioTitulo">Não foi possível carregar os feriados</p>
                <p>Verifica a ligação e tenta outra vez.</p>
                <button type="button" className="pesquisa__exemplo" onClick={() => definirTentativa(valor => valor + 1)}>
                  Tentar de novo
                </button>
              </div>
            )}

            {estado === "pronto" && !temConsulta && (
              <>
                <p className="pesquisa__secao">Próximos feriados</p>
                <ul className="pesquisa__lista" aria-label="Próximos feriados">
                  {sugestoes.map(feriado => (
                    <Resultado key={feriado.id} feriado={feriado} termos={termos} aoEscolher={fechar} />
                  ))}
                </ul>
                <Exemplos aoEscolher={escolherExemplo} />
              </>
            )}

            {estado === "pronto" && temConsulta && resultados.length > 0 && (
              <>
                <ul className="pesquisa__lista" aria-label="Resultados da pesquisa">
                  {resultados.map(feriado => (
                    <Resultado key={feriado.id} feriado={feriado} termos={termos} aoEscolher={fechar} />
                  ))}
                </ul>
                {todos.length > resultados.length && (
                  <p className="pesquisa__nota">
                    A mostrar {resultados.length} de {todos.length}. Acrescenta uma palavra para refinar.
                  </p>
                )}
              </>
            )}

            {estado === "pronto" && temConsulta && resultados.length === 0 && (
              <div className="pesquisa__vazio">
                <p className="pesquisa__vazioTitulo">Sem resultados para «{consulta.trim()}»</p>
                <p>Tenta outra palavra, só o mês ou o ano.</p>
                <Exemplos aoEscolher={escolherExemplo} />
              </div>
            )}
          </div>

          <p className="visualmente-oculto" role="status" aria-live="polite" aria-atomic="true">
            {aberto ? mensagem : ""}
          </p>

          <footer className="pesquisa__rodape" aria-hidden="true">
            <span>
              <kbd>↑</kbd>
              <kbd>↓</kbd> navegar
            </span>
            <span>
              <kbd>↵</kbd> abrir
            </span>
            <span>
              <kbd>esc</kbd> fechar
            </span>
          </footer>

          <button type="button" className="pesquisa__fechar" onClick={fechar} aria-label="Fechar pesquisa">
            <span className="pesquisa__fecharTexto" aria-hidden="true">
              Esc
            </span>
            <VscClose className="pesquisa__fecharIcone" aria-hidden="true" />
          </button>
        </div>
      </dialog>
    </>
  )
}
