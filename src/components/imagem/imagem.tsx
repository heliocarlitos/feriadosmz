"use client"

import { useEffect, useRef, useState } from "react"
import { VscCalendar } from "react-icons/vsc"
import { juntarClasses } from "@/biblioteca/cliente"
import "./imagem.css"

interface Props {
  url: string
  alt: string
  prioridade?: boolean
  classe?: string
}

export default function Imagem({ url, alt, prioridade = false, classe }: Props) {
  const [falhou, definirFalhou] = useState(false)
  const elemento = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const imagem = elemento.current
    definirFalhou(Boolean(imagem?.complete && imagem.naturalWidth === 0))
  }, [url])

  if (falhou) {
    return (
      <div className={juntarClasses("imagem", "imagem--vazia", classe)} role="img" aria-label={alt}>
        <VscCalendar aria-hidden="true" />
      </div>
    )
  }

  return <img ref={elemento} className={juntarClasses("imagem", classe)} src={url} alt={alt} loading={prioridade ? "eager" : "lazy"} decoding="async" onError={() => definirFalhou(true)} />
}
