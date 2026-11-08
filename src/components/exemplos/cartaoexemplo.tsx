import type { ReactNode } from "react"
import Integracao from "./integracao"

interface Propriedades {
  id: string
  numero: string
  titulo: string
  descricao: string
  rota: string
  codigo: string
  larga?: boolean
  children: ReactNode
}

export default function CartaoExemplo({ id, numero, titulo, descricao, rota, codigo, larga = false, children }: Propriedades) {
  return (
    <article id={id} className={larga ? "exemplo exemplo--larga" : "exemplo"} aria-labelledby={`${id}-titulo`}>
      <header className="exemplo__cabecalho">
        <span className="exemplo__numero" aria-hidden="true">
          {numero}
        </span>
        <div className="exemplo__intro">
          <h3 id={`${id}-titulo`} className="exemplo__titulo">
            {titulo}
          </h3>
          <p className="exemplo__descricao">{descricao}</p>
        </div>
        <p className="exemplo__rota">
          <span className="exemplo__metodo">GET</span>
          <code className="codigo">{rota}</code>
        </p>
      </header>

      <div className="exemplo__palco">{children}</div>

      <Integracao codigo={codigo} />
    </article>
  )
}
