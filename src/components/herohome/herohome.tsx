"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import type { CSSProperties, PointerEvent, ReactNode } from "react"
import { ROTULO_TIPO_PLURAL, caminhoTipo } from "@/biblioteca/apresentacao"
import { MESES, obterJson } from "@/biblioteca/cliente"
import type { TipoFeriado } from "@/biblioteca/tipos"

import "./herohome.css"

interface ProximoFeriado {
  id: number
  nome: string
  data: string | null
  diaSemana: string | null
}

interface RespostaProximos {
  success: boolean
  data?: ProximoFeriado[]
}

type EstadoCarregamento = "carregando" | "pronto" | "erro"
type EstadoCopia = "parado" | "copiado" | "erro"

const TITULO = [
  ["Os", "feriados"],
  ["de", "Moçambique"],
  ["numa", "só", "API."]
]

const DESLOCAMENTOS = [0, 2, 4]

const TIPOS_ROTATIVOS = ["nacionais", "municipais", "religiosos", "móveis"]

const TIPOS_NAVEGACAO: TipoFeriado[] = ["nacional", "provincial", "municipal"]

const FAIXA = ["Feriados nacionais", "Feriados municipais", "Feriados religiosos", "Tolerâncias de ponto", "Sexta-Feira Santa calculada", "Anos de 2000 a 2100", "Fuso Africa/Maputo", "JSON em UTF-8", "Sem chave de acesso"]

const ROTA_COMANDO = "/api/feriados/hoje"

function atraso(indice: number): CSSProperties {
  return { "--i": indice } as CSSProperties
}

function diasAte(data: string): number {
  const hoje = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Maputo" }).format(new Date())
  const [anoHoje, mesHoje, diaHoje] = hoje.split("-").map(Number)
  const [ano, mes, dia] = data.split("-").map(Number)
  return Math.round((Date.UTC(ano, mes - 1, dia) - Date.UTC(anoHoje, mesHoje - 1, diaHoje)) / 86400000)
}

function textoFaltam(dias: number): string {
  if (dias <= 0) return "É hoje"
  if (dias === 1) return "Amanhã"
  return `Faltam ${dias} dias`
}

function Linha({ i, nivel = 0, children }: { i: number; nivel?: number; children: ReactNode }) {
  return (
    <span className="herohome__linhaCodigo" style={{ "--i": i, "--nivel": nivel } as CSSProperties}>
      {children}
    </span>
  )
}

function Contador({ valor }: { valor: number }) {
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

        const inicio = performance.now()
        const duracao = 1400

        const passo = (agora: number) => {
          const progresso = Math.min((agora - inicio) / duracao, 1)
          const suave = 1 - Math.pow(1 - progresso, 3)
          definirMostrado(Math.round(valor * suave))
          if (progresso < 1) quadro = requestAnimationFrame(passo)
        }

        quadro = requestAnimationFrame(passo)
      },
      { threshold: 0.6 }
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

export default function HeroHome() {
  const [estado, definirEstado] = useState<EstadoCarregamento>("carregando")
  const [proximo, definirProximo] = useState<ProximoFeriado | null>(null)
  const [dias, definirDias] = useState<number | null>(null)
  const [copia, definirCopia] = useState<EstadoCopia>("parado")

  const ponteiroFino = useRef(false)
  const temporizadorCopia = useRef<number | undefined>(undefined)

  useEffect(() => {
    ponteiroFino.current = window.matchMedia("(hover: hover) and (pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])

  useEffect(() => {
    let activo = true

    obterJson<RespostaProximos>("/feriados/proximos?limite=1&campos=id,nome,data,diaSemana")
      .then(corpo => {
        if (!activo) return
        const primeiro = corpo.success ? (corpo.data?.[0] ?? null) : null
        if (primeiro && primeiro.data) {
          definirProximo(primeiro)
          definirDias(diasAte(primeiro.data))
          definirEstado("pronto")
        } else {
          definirEstado("erro")
        }
      })
      .catch(() => {
        if (activo) definirEstado("erro")
      })

    return () => {
      activo = false
    }
  }, [])

  useEffect(() => () => window.clearTimeout(temporizadorCopia.current), [])

  function aoMoverSeccao(evento: PointerEvent<HTMLElement>) {
    if (!ponteiroFino.current) return
    const caixa = evento.currentTarget.getBoundingClientRect()
    const x = evento.clientX - caixa.left
    const y = evento.clientY - caixa.top
    evento.currentTarget.style.setProperty("--rato-x", `${x}px`)
    evento.currentTarget.style.setProperty("--rato-y", `${y}px`)
    evento.currentTarget.style.setProperty("--rato-nx", (x / caixa.width - 0.5).toFixed(3))
    evento.currentTarget.style.setProperty("--rato-ny", (y / caixa.height - 0.5).toFixed(3))
  }

  function aoMoverCartao(evento: PointerEvent<HTMLElement>) {
    if (!ponteiroFino.current) return
    const caixa = evento.currentTarget.getBoundingClientRect()
    const x = (evento.clientX - caixa.left) / caixa.width - 0.5
    const y = (evento.clientY - caixa.top) / caixa.height - 0.5
    evento.currentTarget.style.setProperty("--inclinar-x", `${(-y * 10).toFixed(2)}deg`)
    evento.currentTarget.style.setProperty("--inclinar-y", `${(x * 12).toFixed(2)}deg`)
    evento.currentTarget.style.setProperty("--brilho-x", `${((x + 0.5) * 100).toFixed(1)}%`)
    evento.currentTarget.style.setProperty("--brilho-y", `${((y + 0.5) * 100).toFixed(1)}%`)
  }

  function aoSairCartao(evento: PointerEvent<HTMLElement>) {
    evento.currentTarget.style.removeProperty("--inclinar-x")
    evento.currentTarget.style.removeProperty("--inclinar-y")
  }

  function aoMoverMagnetico(evento: PointerEvent<HTMLElement>) {
    if (!ponteiroFino.current) return
    const caixa = evento.currentTarget.getBoundingClientRect()
    const x = evento.clientX - (caixa.left + caixa.width / 2)
    const y = evento.clientY - (caixa.top + caixa.height / 2)
    evento.currentTarget.style.setProperty("--mx", `${(x * 0.18).toFixed(1)}px`)
    evento.currentTarget.style.setProperty("--my", `${(y * 0.28).toFixed(1)}px`)
  }

  function aoSairMagnetico(evento: PointerEvent<HTMLElement>) {
    evento.currentTarget.style.removeProperty("--mx")
    evento.currentTarget.style.removeProperty("--my")
  }

  async function copiarRota() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${ROTA_COMANDO}`)
      definirCopia("copiado")
    } catch {
      definirCopia("erro")
    }
    window.clearTimeout(temporizadorCopia.current)
    temporizadorCopia.current = window.setTimeout(() => definirCopia("parado"), 2200)
  }

  const partes = proximo?.data ? proximo.data.split("-").map(Number) : null
  const nome = proximo?.nome ?? "…"
  const data = proximo?.data ?? "…"
  const diaSemana = proximo?.diaSemana ?? "…"

  return (
    <section className="herohome" aria-labelledby="herohome-titulo" onPointerMove={aoMoverSeccao}>
      <div className="herohome__fundo" aria-hidden="true">
        <span className="herohome__granulado" />
      </div>

      <div className="herohome__grade contentor">
        <div className="herohome__texto">
          <p className="herohome__etiqueta herohome__entrada" style={atraso(0)}>
            <span className="herohome__pulso" aria-hidden="true" />
            API aberta · sem chave · JSON
          </p>

          <h1 id="herohome-titulo" className="herohome__titulo">
            {TITULO.map((linha, l) => (
              <span key={l} className="herohome__linhaTitulo">
                {linha.map((palavra, p) => (
                  <span key={p}>
                    <span className="herohome__palavra">
                      <span className={palavra === "Moçambique" ? "herohome__destaque" : undefined} style={atraso(DESLOCAMENTOS[l] + p)}>
                        {palavra}
                      </span>
                    </span>{" "}
                  </span>
                ))}
              </span>
            ))}
          </h1>

          <p className="herohome__descricao herohome__entrada" style={atraso(3)}>
            Datas, descrições e contexto histórico de feriados{" "}
            <span className="herohome__rodar" aria-hidden="true">
              {TIPOS_ROTATIVOS.map((tipo, indice) => (
                <span key={tipo} style={atraso(indice)}>
                  {tipo}
                </span>
              ))}
            </span>
            <span className="visualmente-oculto">nacionais, municipais, religiosos e móveis</span>, prontos a usar. Escolhe os campos de que precisas e recebe tudo calculado para qualquer ano entre 2000 e 2100.
          </p>

          <div className="herohome__accoes herohome__entrada" style={atraso(4)}>
            <Link className="botao botao-primario herohome__botao herohome__magnetico" href="/doc" onPointerMove={aoMoverMagnetico} onPointerLeave={aoSairMagnetico}>
              Ver a documentação
              <svg className="herohome__seta" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </Link>
            <Link className="botao botao-secundario herohome__botao herohome__magnetico" href="/doc#experimentar" onPointerMove={aoMoverMagnetico} onPointerLeave={aoSairMagnetico}>
              Experimentar a API
            </Link>
          </div>

          <div className="herohome__comando herohome__entrada" style={atraso(5)}>
            <span className="herohome__metodo" aria-hidden="true">
              GET
            </span>
            <code className="herohome__caminho">{ROTA_COMANDO}</code>
            <button type="button" className="herohome__copiar" data-estado={copia} onClick={copiarRota} aria-label={`Copiar o endereço completo da rota ${ROTA_COMANDO}`}>
              {copia === "copiado" ? "Copiado" : copia === "erro" ? "Falhou" : "Copiar"}
            </button>
            <span className="visualmente-oculto" role="status">
              {copia === "copiado" ? "Endereço copiado para a área de transferência" : copia === "erro" ? "Não foi possível copiar o endereço" : ""}
            </span>
          </div>

          <nav className="herohome__tipos herohome__entrada" style={atraso(6)} aria-label="Explorar feriados por tipo">
            <ul>
              {TIPOS_NAVEGACAO.map(tipo => (
                <li key={tipo}>
                  <Link href={caminhoTipo(tipo)}>{ROTULO_TIPO_PLURAL[tipo]}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="herohome__visual">
          <span className="herohome__flutuante herohome__flutuante--a" aria-hidden="true">
            campos=nome,data
          </span>
          <span className="herohome__flutuante herohome__flutuante--b" aria-hidden="true">
            ano=2027
          </span>

          <article className="herohome__cartao" aria-labelledby="herohome-cartao" onPointerMove={aoMoverCartao} onPointerLeave={aoSairCartao}>
            <header className="herohome__cartaoTopo">
              <h2 id="herohome-cartao" className="herohome__cartaoTitulo">
                Próximo feriado
              </h2>
              <span className="herohome__vivo">
                <span className="herohome__pulso" aria-hidden="true" />
                Ao vivo
              </span>
            </header>

            <div className="herohome__cartaoCorpo" aria-live="polite" aria-busy={estado === "carregando"}>
              {estado === "pronto" && partes ? (
                <>
                  <p className="herohome__calendario">
                    <span className="herohome__dia">{partes[2]}</span>
                    <span className="herohome__mes">{MESES[partes[1] - 1]}</span>
                  </p>
                  <div className="herohome__detalhes">
                    <p className="herohome__nome">{nome}</p>
                    <p className="herohome__semana">{diaSemana}</p>
                    {dias !== null ? <p className="herohome__faltam">{textoFaltam(dias)}</p> : null}
                  </div>
                </>
              ) : estado === "carregando" ? (
                <>
                  <span className="herohome__esqueleto herohome__esqueleto--data" />
                  <span className="herohome__esqueleto herohome__esqueleto--texto" />
                  <span className="visualmente-oculto">A carregar o próximo feriado</span>
                </>
              ) : (
                <p className="herohome__semana">Não foi possível carregar o próximo feriado agora.</p>
              )}
            </div>

            <pre className="herohome__terminal" aria-hidden="true">
              <code className="codigo">
                <Linha i={0}>
                  <b className="herohome__tkMetodo">GET</b> /api/feriados/proximos?limite=1
                </Linha>
                <Linha i={1}>{"{"}</Linha>
                <Linha i={2} nivel={1}>
                  <span className="herohome__tkChave">&quot;success&quot;</span>: <span className="herohome__tkBool">true</span>,
                </Linha>
                <Linha i={3} nivel={1}>
                  <span className="herohome__tkChave">&quot;data&quot;</span>: [{"{"}
                </Linha>
                <Linha i={4} nivel={2}>
                  <span className="herohome__tkChave">&quot;nome&quot;</span>: <span className="herohome__tkTexto">&quot;{nome}&quot;</span>,
                </Linha>
                <Linha i={5} nivel={2}>
                  <span className="herohome__tkChave">&quot;data&quot;</span>: <span className="herohome__tkTexto">&quot;{data}&quot;</span>,
                </Linha>
                <Linha i={6} nivel={2}>
                  <span className="herohome__tkChave">&quot;diaSemana&quot;</span>: <span className="herohome__tkTexto">&quot;{diaSemana}&quot;</span>
                </Linha>
                <Linha i={7} nivel={1}>
                  {"}"}]
                </Linha>
                <Linha i={8}>{"}"}</Linha>
              </code>
            </pre>
          </article>
        </div>
      </div>

      <dl className="herohome__estatisticas contentor">
        <div>
          <dt>Anos suportados</dt>
          <dd>
            <Contador valor={101} />
          </dd>
        </div>
        <div>
          <dt>Rotas disponíveis</dt>
          <dd>
            <Contador valor={16} />
          </dd>
        </div>
        <div>
          <dt>Campos por feriado</dt>
          <dd>
            <Contador valor={24} />
          </dd>
        </div>
        <div>
          <dt>Chaves de acesso</dt>
          <dd>
            <Contador valor={0} />
          </dd>
        </div>
      </dl>

      <div className="herohome__faixa">
        <div className="herohome__faixaTrilho">
          <ul className="herohome__faixaLista">
            {FAIXA.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <ul className="herohome__faixaLista" aria-hidden="true">
            {FAIXA.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
