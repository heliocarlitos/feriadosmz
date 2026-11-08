import Link from "next/link"
import { DATA_POR_CONFIRMAR, ROTULO_TIPO, caminhoFeriado, formatarDataCurta } from "@/biblioteca/apresentacao"
import { juntarClasses } from "@/biblioteca/cliente"
import type { FeriadoCompleto } from "@/biblioteca/tipos"
import Imagem from "@componentes/imagem/imagem"
import "./cartaoferiado.css"

interface Props {
  feriado: FeriadoCompleto
  variante?: "normal" | "destaque"
  nivel?: "h2" | "h3"
  etiqueta?: string
  prioridade?: boolean
}

export default function CartaoFeriado({ feriado, variante = "normal", nivel = "h3", etiqueta, prioridade = false }: Props) {
  const Titulo = nivel
  const imagem = feriado.imagens[0]
  const lugar = feriado.municipio ?? feriado.distrito ?? feriado.provincia

  return (
    <article className={juntarClasses("cartaoferiado", variante === "destaque" && "cartaoferiado--destaque")}>
      <Link className="cartaoferiado__ligacao" href={caminhoFeriado(feriado)}>
        <div className="cartaoferiado__media">
          <Imagem url={imagem.url} alt={imagem.alt} prioridade={prioridade} classe="cartaoferiado__imagem" />
          <span className="cartaoferiado__categoria">{ROTULO_TIPO[feriado.tipo]}</span>
        </div>

        <div className="cartaoferiado__corpo">
          <div className="cartaoferiado__etiquetas">
            {etiqueta && <span className="cartaoferiado__etiqueta cartaoferiado__etiqueta--destaque">{etiqueta}</span>}
            {lugar && <span className="cartaoferiado__etiqueta">{lugar}</span>}
            {feriado.movel && <span className="cartaoferiado__etiqueta">Data móvel</span>}
          </div>

          <Titulo className="cartaoferiado__titulo">{feriado.nome}</Titulo>

          {feriado.descricaoCurta && <p className="cartaoferiado__resumo">{feriado.descricaoCurta}</p>}

          <div className="cartaoferiado__rodape">
            {feriado.data ? (
              <time dateTime={feriado.data}>
                {formatarDataCurta(feriado)} · {feriado.diaSemana}
              </time>
            ) : (
              <span>{DATA_POR_CONFIRMAR}</span>
            )}
            <span className="cartaoferiado__ler">
              Ler mais <span aria-hidden="true">→</span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}
