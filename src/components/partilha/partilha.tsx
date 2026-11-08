"use client"

import { useEffect, useRef, useState } from "react"
import { FaCheck, FaEnvelope, FaFacebookF, FaLink, FaShareNodes, FaWhatsapp, FaXTwitter } from "react-icons/fa6"
import { juntarClasses } from "@/biblioteca/cliente"
import "./partilha.css"

interface Props {
  caminho: string
  titulo: string
  texto?: string
}

export default function Partilha({ caminho, titulo, texto }: Props) {
  const [nativa, definirNativa] = useState(false)
  const [copiado, definirCopiado] = useState(false)
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    definirNativa(typeof navigator.share === "function")
    return () => clearTimeout(temporizador.current)
  }, [])

  function ligacao() {
    return new URL(caminho, window.location.origin).toString()
  }

  function abrir(endereco: string) {
    window.open(endereco, "_blank", "noopener,noreferrer")
  }

  async function partilharNativa() {
    try {
      await navigator.share({ title: titulo, text: texto, url: ligacao() })
    } catch {
      return
    }
  }

  function partilharWhatsapp() {
    abrir(`https://wa.me/?text=${encodeURIComponent(`${titulo} ${ligacao()}`)}`)
  }

  function partilharFacebook() {
    abrir(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(ligacao())}`)
  }

  function partilharX() {
    abrir(`https://twitter.com/intent/tweet?text=${encodeURIComponent(titulo)}&url=${encodeURIComponent(ligacao())}`)
  }

  function partilharEmail() {
    const assunto = encodeURIComponent(titulo)
    const corpo = encodeURIComponent(`${texto ?? titulo}\n\n${ligacao()}`)
    window.location.href = `mailto:?subject=${assunto}&body=${corpo}`
  }

  async function copiar() {
    const endereco = ligacao()
    try {
      await navigator.clipboard.writeText(endereco)
    } catch {
      const campo = document.createElement("textarea")
      campo.className = "partilha__campo"
      campo.value = endereco
      campo.setAttribute("readonly", "")
      document.body.append(campo)
      campo.select()
      document.execCommand("copy")
      campo.remove()
    }
    definirCopiado(true)
    clearTimeout(temporizador.current)
    temporizador.current = setTimeout(() => definirCopiado(false), 2200)
  }

  return (
    <div className="partilha" role="group" aria-label="Partilhar este feriado">
      <span className="partilha__rotulo">Partilhar</span>

      <div className="partilha__botoes">
        {nativa && (
          <button type="button" className="partilha__botao partilha__botao--destaque" onClick={partilharNativa}>
            <FaShareNodes aria-hidden="true" />
            <span>Partilhar</span>
          </button>
        )}

        <button type="button" className="partilha__botao" onClick={partilharWhatsapp}>
          <FaWhatsapp aria-hidden="true" />
          <span>WhatsApp</span>
        </button>

        <button type="button" className="partilha__botao" onClick={partilharFacebook}>
          <FaFacebookF aria-hidden="true" />
          <span>Facebook</span>
        </button>

        <button type="button" className="partilha__botao" onClick={partilharX}>
          <FaXTwitter aria-hidden="true" />
          <span>X</span>
        </button>

        <button type="button" className="partilha__botao" onClick={partilharEmail}>
          <FaEnvelope aria-hidden="true" />
          <span>E-mail</span>
        </button>

        <button type="button" className={juntarClasses("partilha__botao", copiado && "partilha__botao--copiado")} onClick={copiar}>
          {copiado ? <FaCheck aria-hidden="true" /> : <FaLink aria-hidden="true" />}
          <span>{copiado ? "Link copiado" : "Copiar link"}</span>
        </button>
      </div>

      <span className="visualmente-oculto" role="status" aria-live="polite">
        {copiado ? "Link copiado para a área de transferência" : ""}
      </span>
    </div>
  )
}
