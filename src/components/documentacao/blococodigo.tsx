import { realcar } from "@/biblioteca/realce"
import type { Linguagem } from "@/biblioteca/realce"
import BotaoCopiar from "./botaocopiar"
import CodigoRealcado from "./codigorealcado"

const ROTULO_LINGUAGEM: Record<Linguagem, string> = {
  json: "JSON",
  bash: "Terminal",
  javascript: "JavaScript",
  python: "Python",
  php: "PHP",
  texto: "Texto"
}

interface Propriedades {
  codigo: string
  linguagem: Linguagem
  titulo?: string
}

export default function BlocoCodigo({ codigo, linguagem, titulo }: Propriedades) {
  const nome = titulo ?? ROTULO_LINGUAGEM[linguagem]
  const tokens = realcar(codigo, linguagem)

  return (
    <figure className="bloco">
      <figcaption className="bloco__topo">
        <span className="bloco__titulo">
          {nome}
          {titulo ? <span className="bloco__linguagem">{ROTULO_LINGUAGEM[linguagem]}</span> : null}
        </span>
        <BotaoCopiar codigo={codigo} rotulo={`código ${nome}`} />
      </figcaption>
      <pre className="bloco__corpo" tabIndex={0} role="region" aria-label={`Código: ${nome}`}>
        <code className="codigo">
          <CodigoRealcado tokens={tokens} />
        </code>
      </pre>
    </figure>
  )
}
