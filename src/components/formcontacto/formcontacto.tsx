"use client"

import { useEffect, useId, useRef, useState } from "react"
import type { FormEvent, ReactNode } from "react"
import { MOTIVOS, campos, limites, validarCampo } from "@/biblioteca/contacto"
import type { CampoNome, MotivoId } from "@/biblioteca/contacto"
import "./formcontacto.css"

type Valores = Record<CampoNome, string>
type Erros = Partial<Record<CampoNome, string>>
type Estado = "livre" | "a-enviar" | "enviado"
type Resposta = { status: number; texto: string; corpo: string }

const valoresVazios: Valores = { nome: "", email: "", assunto: "", mensagem: "" }

const textosHttp: Record<number, string> = {
  200: "OK",
  403: "Forbidden",
  413: "Payload Too Large",
  415: "Unsupported Media Type",
  422: "Unprocessable Content",
  429: "Too Many Requests",
  500: "Internal Server Error",
  502: "Bad Gateway"
}

const rotulos: Record<CampoNome, string> = { nome: "Nome completo", email: "E-mail", assunto: "Assunto", mensagem: "Mensagem" }

const resumir = (texto: string, maximo = 44) => (texto.length > maximo ? `${texto.slice(0, maximo)}…` : texto)

export default function FormContacto({ children }: { children?: ReactNode }) {
  const prefixo = useId()
  const [motivo, setMotivo] = useState<MotivoId>("dados")
  const [valores, setValores] = useState<Valores>(valoresVazios)
  const [erros, setErros] = useState<Erros>({})
  const [estado, setEstado] = useState<Estado>("livre")
  const [aviso, setAviso] = useState("")
  const [campoActivo, setCampoActivo] = useState<CampoNome | "motivo" | null>(null)
  const [resposta, setResposta] = useState<Resposta | null>(null)

  const iniciado = useRef(0)
  const temporizadores = useRef<Partial<Record<CampoNome, ReturnType<typeof setTimeout>>>>({})
  const elementos = useRef<Partial<Record<CampoNome, HTMLInputElement | HTMLTextAreaElement | null>>>({})
  const tituloSucesso = useRef<HTMLHeadingElement>(null)

  const dadosMotivo = MOTIVOS.find(m => m.id === motivo) ?? MOTIVOS[0]
  const id = (nome: string) => `${prefixo}-${nome}`

  useEffect(() => {
    iniciado.current = Date.now()
    const pendentes = temporizadores.current
    return () => {
      Object.values(pendentes).forEach(t => t && clearTimeout(t))
    }
  }, [])

  useEffect(() => {
    if (estado === "enviado") tituloSucesso.current?.focus()
  }, [estado])

  const validar = (campo: CampoNome, valor: string) => {
    const erro = validarCampo(campo, valor)
    setErros(actuais => {
      const seguinte = { ...actuais }
      if (erro) seguinte[campo] = erro
      else delete seguinte[campo]
      return seguinte
    })
    return erro
  }

  const alterar = (campo: CampoNome, valor: string) => {
    setValores(actuais => ({ ...actuais, [campo]: valor }))
    setAviso("")
    clearTimeout(temporizadores.current[campo])
    temporizadores.current[campo] = setTimeout(() => validar(campo, valor), 700)
  }

  const sair = (campo: CampoNome) => {
    setCampoActivo(null)
    clearTimeout(temporizadores.current[campo])
    if (valores[campo].length > 0) validar(campo, valores[campo])
  }

  const preenchidos = campos.filter(c => valores[c].trim().length > 0 && !erros[c] && validarCampo(c, valores[c]) === null)
  const total = valores.mensagem.length

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    if (estado === "a-enviar") return

    const novos: Erros = {}
    for (const campo of campos) {
      const erro = validarCampo(campo, valores[campo])
      if (erro) novos[campo] = erro
    }
    setErros(novos)

    const primeiro = campos.find(c => novos[c])
    if (primeiro) {
      setAviso("Corrige os campos assinalados antes de enviar.")
      elementos.current[primeiro]?.focus()
      return
    }

    setEstado("a-enviar")
    setAviso("")

    const dados = new FormData(evento.currentTarget)
    const pedido = { motivo, ...valores, website: String(dados.get("website") ?? ""), iniciado: iniciado.current }

    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido)
      })
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; mensagem?: string; erros?: Erros }
      setResposta({
        status: res.status,
        texto: textosHttp[res.status] ?? "",
        corpo: JSON.stringify(json.ok ? { ok: true } : { ok: false, mensagem: json.mensagem ?? "Erro" })
      })

      if (res.ok && json.ok) {
        setEstado("enviado")
        return
      }

      setEstado("livre")
      if (json.erros) {
        setErros(json.erros)
        const campoErro = campos.find(c => json.erros?.[c])
        if (campoErro) elementos.current[campoErro]?.focus()
      }
      setAviso(json.mensagem ?? "Não foi possível enviar. Tenta novamente.")
    } catch {
      setEstado("livre")
      setResposta(null)
      setAviso("Sem ligação. Verifica a internet e tenta novamente.")
    }
  }

  const reiniciar = () => {
    setValores(valoresVazios)
    setErros({})
    setResposta(null)
    setAviso("")
    setEstado("livre")
    iniciado.current = Date.now()
  }

  const linhasPedido: { campo: CampoNome | "motivo"; chave: string; valor: string }[] = [
    { campo: "motivo", chave: "motivo", valor: motivo },
    { campo: "nome", chave: "nome", valor: valores.nome },
    { campo: "email", chave: "email", valor: valores.email },
    { campo: "assunto", chave: "assunto", valor: valores.assunto },
    { campo: "mensagem", chave: "mensagem", valor: valores.mensagem }
  ]

  const propriedades = (campo: CampoNome) => ({
    id: id(campo),
    name: campo,
    value: valores[campo],
    maxLength: limites[campo] + 20,
    "aria-invalid": erros[campo] ? (true as const) : undefined,
    "aria-describedby": erros[campo] ? id(`${campo}-erro`) : undefined,
    onChange: (e: { target: { value: string } }) => alterar(campo, e.target.value),
    onFocus: () => setCampoActivo(campo),
    onBlur: () => sair(campo),
    ref: (el: HTMLInputElement | HTMLTextAreaElement | null) => {
      elementos.current[campo] = el
    }
  })

  const erroDe = (campo: CampoNome) =>
    erros[campo] ? (
      <p id={id(`${campo}-erro`)} className="formcontacto__erro">
        {erros[campo]}
      </p>
    ) : null

  return (
    <div className="formcontacto">
      <div className="formcontacto__intro">{children}</div>

      <div className="formcontacto__formulario">
        {estado === "enviado" ? (
          <div className="formcontacto__sucesso">
            <p className="rotulo">Enviado</p>
            <h2 ref={tituloSucesso} tabIndex={-1} className="formcontacto__sucesso-titulo">
              Mensagem recebida. Obrigado!
            </h2>
            <p className="formcontacto__sucesso-texto">
              Respondemos para <strong>{valores.email}</strong> assim que possível.
            </p>
            <button type="button" className="botao botao-secundario" onClick={reiniciar}>
              Enviar outra mensagem
            </button>
          </div>
        ) : (
          <form noValidate onSubmit={enviar} className="formcontacto__form" aria-label="Formulário de contacto">
            <fieldset className="formcontacto__motivos">
              <legend className="formcontacto__legenda">Sobre o quê?</legend>
              {MOTIVOS.map(m => (
                <label key={m.id} className="formcontacto__motivo">
                  <input type="radio" name="motivo" value={m.id} checked={motivo === m.id} onChange={() => setMotivo(m.id)} onFocus={() => setCampoActivo("motivo")} className="formcontacto__motivo-radio" />
                  <span className="formcontacto__motivo-texto">{m.rotulo}</span>
                </label>
              ))}
            </fieldset>

            <div className="formcontacto__grupo">
              <div className="formcontacto__campo">
                <label htmlFor={id("nome")} className="formcontacto__rotulo">
                  {rotulos.nome}
                </label>
                <input type="text" autoComplete="name" placeholder="Maria Machava" className="formcontacto__entrada" {...propriedades("nome")} />
                {erroDe("nome")}
              </div>

              <div className="formcontacto__campo">
                <label htmlFor={id("email")} className="formcontacto__rotulo">
                  {rotulos.email}
                </label>
                <input type="email" autoComplete="email" inputMode="email" placeholder="maria@exemplo.co.mz" className="formcontacto__entrada" {...propriedades("email")} />
                {erroDe("email")}
              </div>
            </div>

            <div className="formcontacto__campo">
              <label htmlFor={id("assunto")} className="formcontacto__rotulo">
                {rotulos.assunto}
              </label>
              <input type="text" autoComplete="off" placeholder={dadosMotivo.assunto} className="formcontacto__entrada" {...propriedades("assunto")} />
              {erroDe("assunto")}
            </div>

            <div className="formcontacto__campo">
              <label htmlFor={id("mensagem")} className="formcontacto__rotulo">
                {rotulos.mensagem}
              </label>
              <textarea rows={6} placeholder={dadosMotivo.mensagem} className="formcontacto__entrada formcontacto__entrada--area" {...propriedades("mensagem")} />
              <div className="formcontacto__rodape-campo">
                {erroDe("mensagem") ?? <span />}
                <span className="formcontacto__contador" aria-hidden="true">
                  <progress className="formcontacto__medidor" value={Math.min(total, limites.mensagem)} max={limites.mensagem} />
                  {total}/{limites.mensagem}
                </span>
              </div>
            </div>

            {/* Campo-armadilha: invisível e fora da ordem de tabulação. */}
            <div className="formcontacto__armadilha" aria-hidden="true">
              <label>
                Não preencher
                <input type="text" name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <div className="formcontacto__accoes">
              <ol className="formcontacto__progresso" aria-hidden="true">
                {campos.map(c => (
                  <li key={c} className="formcontacto__segmento" data-ok={preenchidos.includes(c) || undefined} />
                ))}
              </ol>
              <button type="submit" className="botao botao-primario formcontacto__enviar" aria-disabled={estado === "a-enviar"}>
                {estado === "a-enviar" ? "A enviar…" : "Enviar mensagem"}
              </button>
            </div>

            <p role="status" className="formcontacto__aviso" data-visivel={aviso ? true : undefined}>
              {aviso}
            </p>
          </form>
        )}
      </div>

      <aside className="formcontacto__painel" aria-hidden="true">
        <p className="formcontacto__painel-titulo">
          <span className="formcontacto__verbo">POST</span> /api/contacto
        </p>
        <pre className="formcontacto__codigo">
          <code>
            {"{\n"}
            {linhasPedido.map((linha, i) => (
              <span key={linha.chave} className="formcontacto__linha" data-activa={campoActivo === linha.campo || undefined}>
                {"  "}
                <span className="formcontacto__chave">&quot;{linha.chave}&quot;</span>: <span className="formcontacto__valor">{JSON.stringify(resumir(linha.valor))}</span>
                {i < linhasPedido.length - 1 ? "," : ""}
                {"\n"}
              </span>
            ))}
            {"}"}
          </code>
        </pre>

        <div className="formcontacto__resposta" data-estado={estado}>
          {resposta ? (
            <>
              <p className="formcontacto__estado" data-sucesso={resposta.status === 200 || undefined}>
                HTTP/1.1 {resposta.status} {resposta.texto}
              </p>
              <pre className="formcontacto__codigo">
                <code>{resposta.corpo}</code>
              </pre>
            </>
          ) : (
            <p className="formcontacto__estado">{estado === "a-enviar" ? "A aguardar resposta…" : "Resposta do servidor aparece aqui."}</p>
          )}
        </div>
      </aside>
    </div>
  )
}
