"use client"

import { useId, useMemo, useState } from "react"
import type { FormEvent } from "react"
import { realcar } from "@/biblioteca/realce"
import BotaoCopiar from "./botaocopiar"
import CodigoRealcado from "./codigorealcado"

const SUGESTOES = ["/api/feriados/hoje", "/api/feriados/proximos?limite=3&campos=nome,data", "/api/feriados/tipo/nacional?campos=nome,dia,mesNome", "/api/feriados/buscar?q=independencia&campos=nome,data"]

const LIMITE_CARACTERES = 12000

interface Resultado {
  estado: number
  duracao: number
  corpo: string
  truncado: boolean
}

export default function Experimentar() {
  const identificador = useId()
  const [caminho, definirCaminho] = useState(SUGESTOES[0])
  const [carregando, definirCarregando] = useState(false)
  const [resultado, definirResultado] = useState<Resultado | null>(null)
  const [erro, definirErro] = useState<string | null>(null)

  const tokens = useMemo(() => (resultado ? realcar(resultado.corpo, "json") : []), [resultado])

  async function executar(destino: string) {
    const limpo = destino.trim()
    definirErro(null)

    if (!limpo.startsWith("/api/feriados")) {
      definirErro("O caminho deve começar por /api/feriados.")
      return
    }

    definirCarregando(true)
    const inicio = performance.now()

    try {
      const resposta = await fetch(limpo, { headers: { Accept: "application/json" } })
      const texto = await resposta.text()
      let corpo = texto
      try {
        corpo = JSON.stringify(JSON.parse(texto), null, 2)
      } catch {
        corpo = texto
      }
      const truncado = corpo.length > LIMITE_CARACTERES
      definirResultado({
        estado: resposta.status,
        duracao: Math.round(performance.now() - inicio),
        corpo: truncado ? corpo.slice(0, LIMITE_CARACTERES) : corpo,
        truncado
      })
    } catch {
      definirErro("Não foi possível contactar a API. Verifica a ligação e tenta de novo.")
    } finally {
      definirCarregando(false)
    }
  }

  function aoSubmeter(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    executar(caminho)
  }

  function usarSugestao(sugestao: string) {
    definirCaminho(sugestao)
    executar(sugestao)
  }

  return (
    <div className="experimentar">
      <form className="experimentar__formulario" onSubmit={aoSubmeter}>
        <label htmlFor={`${identificador}-caminho`} className="visualmente-oculto">
          Caminho do pedido
        </label>
        <div className="experimentar__linha">
          <span className="experimentar__metodo" aria-hidden="true">
            GET
          </span>
          <input id={`${identificador}-caminho`} className="experimentar__campo" type="text" inputMode="url" spellCheck={false} autoComplete="off" autoCapitalize="off" value={caminho} onChange={evento => definirCaminho(evento.target.value)} />
          <button type="submit" className="botao botao-primario experimentar__executar" disabled={carregando}>
            {carregando ? "A pedir…" : "Executar"}
          </button>
        </div>
      </form>

      <div className="experimentar__sugestoes" role="group" aria-label="Pedidos de exemplo">
        {SUGESTOES.map(sugestao => (
          <button key={sugestao} type="button" className="experimentar__sugestao" onClick={() => usarSugestao(sugestao)} disabled={carregando}>
            {sugestao.replace("/api/feriados", "") || "/"}
          </button>
        ))}
      </div>

      <div className="experimentar__resultado" aria-live="polite" aria-busy={carregando}>
        {erro ? (
          <p className="experimentar__erro" role="alert">
            {erro}
          </p>
        ) : resultado ? (
          <figure className="bloco">
            <figcaption className="bloco__topo">
              <span className="bloco__titulo">
                <span className="experimentar__estado" data-ok={resultado.estado >= 200 && resultado.estado < 300}>
                  {resultado.estado}
                </span>
                <span className="bloco__linguagem">{resultado.duracao} ms</span>
              </span>
              <BotaoCopiar codigo={resultado.corpo} rotulo="resposta" />
            </figcaption>
            <pre className="bloco__corpo bloco__corpo--limitado" tabIndex={0} role="region" aria-label="Resposta da API">
              <code className="codigo">
                <CodigoRealcado tokens={tokens} />
              </code>
            </pre>
            {resultado.truncado ? <p className="experimentar__nota">Resposta cortada nesta pré-visualização. Usa campos para pedir menos dados.</p> : null}
          </figure>
        ) : (
          <p className="experimentar__vazio">Escolhe um pedido de exemplo ou escreve o teu e carrega em Executar.</p>
        )}
      </div>
    </div>
  )
}
