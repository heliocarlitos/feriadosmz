"use client"

import { useEffect, useState } from "react"

export interface ItemIndice {
  id: string
  rotulo: string
}

export default function Indice({ itens }: { itens: ItemIndice[] }) {
  const [activo, definirActivo] = useState(itens[0]?.id ?? "")

  useEffect(() => {
    const elementos = itens.map(item => document.getElementById(item.id)).filter((elemento): elemento is HTMLElement => elemento !== null)

    const observador = new IntersectionObserver(
      entradas => {
        const visivel = entradas.find(entrada => entrada.isIntersecting)
        if (visivel) definirActivo(visivel.target.id)
      },
      { rootMargin: "-18% 0px -72% 0px" }
    )

    elementos.forEach(elemento => observador.observe(elemento))
    return () => observador.disconnect()
  }, [itens])

  return (
    <nav className="indice" aria-label="Índice da documentação">
      <p className="rotulo indice__titulo">Nesta página</p>
      <ol className="indice__lista">
        {itens.map(item => (
          <li key={item.id}>
            <a href={`#${item.id}`} className="indice__ligacao" aria-current={activo === item.id ? "location" : undefined}>
              {item.rotulo}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
