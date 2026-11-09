import Image from "next/image"
import Link from "next/link"
import { Fragment } from "react"
import type { CSSProperties } from "react"
import { VscArrowUp, VscLinkExternal } from "react-icons/vsc"
import { caminhoFeriado, formatarDataCurta } from "@/biblioteca/apresentacao"
import { obterAnoActual } from "@/biblioteca/datas"
import { compararPorData, listarFeriados } from "@/biblioteca/feriados"
import { realcar } from "@/biblioteca/realce"
import { TIPOS_FERIADO } from "@/biblioteca/tipos"
import { BotaoCopiarRodape, BotaoPausaFaixa, ContadorRodape, EfeitosRodape, RelogioMaputo } from "./rodapeinterativo"
import "./rodape.css"

type Destino = "pagina" | "recurso" | "externa"

interface ItemLigacao {
  rotulo: string
  href: string
  destino: Destino
}

const REPOSITORIO = "https://github.com/heliocarlitos/feriadosmz"

const PEDIDO = "/api/feriados/5?ano=2026&campos=nome,data,diaSemana"

const RESPOSTA = `{
  "success": true,
  "data": {
    "nome": "Dia da Independência Nacional",
    "data": "2026-06-25",
    "diaSemana": "Quinta-feira"
  }
}`

const LINHAS_RESPOSTA = RESPOSTA.split("\n")

const TITULO = ["Os", "feriados", "de", "Moçambique,", "em", "JSON."]

const LETRAS = ["F", "e", "r", "i", "a", "d", "o", "s", "M", "Z"]

const COLUNAS: { titulo: string; ligacoes: ItemLigacao[] }[] = [
  {
    titulo: "Feriados",
    ligacoes: [
      { rotulo: "Início", href: "/", destino: "pagina" },
      { rotulo: "Nacionais", href: "/feriados/nacional", destino: "pagina" },
      { rotulo: "Provinciais", href: "/feriados/provincial", destino: "pagina" },
      { rotulo: "Municipais", href: "/feriados/municipal", destino: "pagina" },
      { rotulo: "Religiosos", href: "/feriados/religioso", destino: "pagina" },
      { rotulo: "Tolerâncias de ponto", href: "/feriados/tolerancia-ponto", destino: "pagina" }
    ]
  },
  {
    titulo: "Para programadores",
    ligacoes: [
      { rotulo: "Documentação", href: "/doc", destino: "pagina" },
      { rotulo: "Base da API", href: "/api/feriados", destino: "recurso" },
      { rotulo: "Feriado de hoje", href: "/api/feriados/hoje", destino: "recurso" },
      { rotulo: "Lista de campos", href: "/api/feriados/campos", destino: "recurso" },
      { rotulo: "llms.txt", href: "/llms.txt", destino: "recurso" }
    ]
  },
  {
    titulo: "Projecto",
    ligacoes: [
      { rotulo: "Código no GitHub", href: REPOSITORIO, destino: "externa" },
      { rotulo: "Reportar um problema", href: `${REPOSITORIO}/issues`, destino: "externa" },
      { rotulo: "Contribuir com dados", href: `${REPOSITORIO}#14-contribuir`, destino: "externa" },
      { rotulo: "Mapa do site", href: "/sitemap.xml", destino: "recurso" }
    ]
  }
]

function atraso(indice: number): CSSProperties {
  return { "--i": indice } as CSSProperties
}

function LigacaoRodape({ rotulo, href, destino }: ItemLigacao) {
  if (destino === "externa") {
    return (
      <a className="rodape__ligacao" href={href} target="_blank" rel="noopener noreferrer">
        <span className="rodape__texto">{rotulo}</span>
        <VscLinkExternal className="rodape__externa" aria-hidden="true" />
        <span className="visualmente-oculto"> (abre noutro separador)</span>
      </a>
    )
  }

  const conteudo = (
    <>
      <span className="rodape__texto">{rotulo}</span>
      <span className="rodape__seta" aria-hidden="true">
        →
      </span>
    </>
  )

  if (destino === "pagina") {
    return (
      <Link className="rodape__ligacao" href={href}>
        {conteudo}
      </Link>
    )
  }

  return (
    <a className="rodape__ligacao" href={href}>
      {conteudo}
    </a>
  )
}

export default function Rodape() {
  const ano = obterAnoActual()
  const todos = listarFeriados(ano)
  const total = todos.length
  const nacionais = todos.filter(feriado => feriado.tipo === "nacional" && feriado.data !== null).sort(compararPorData)

  return (
    <EfeitosRodape>
      <h2 className="visualmente-oculto">Informações e ligações do site</h2>

      <div className="rodape__fundo" aria-hidden="true">
        <span className="rodape__aurora" />
        <span className="rodape__pontos" />
        <span className="rodape__luz" />
      </div>

      <div className="contentor rodape__interior">
        <section className="rodape__destaque rodape__revelar" aria-labelledby="rodape-api">
          <div className="rodape__destaqueTexto">
            <p className="rotulo">API aberta</p>
            <h3 id="rodape-api" className="rodape__destaqueTitulo">
              {TITULO.map((palavra, indice) => (
                <Fragment key={indice}>
                  <span className="rodape__palavra">
                    <span className={palavra === "JSON." ? "rodape__json" : undefined} style={atraso(indice)}>
                      {palavra}
                    </span>
                  </span>{" "}
                </Fragment>
              ))}
            </h3>
            <p className="rodape__destaqueDescricao">Uma API gratuita, sem registo nem chave de acesso. Escolhe só os campos de que precisas e usa-a em qualquer linguagem.</p>

            <ul className="rodape__numeros">
              <li className="rodape__numeroItem">
                <strong className="rodape__numero">
                  <ContadorRodape valor={total} />
                </strong>
                <span>feriados catalogados</span>
              </li>
              <li className="rodape__numeroItem">
                <strong className="rodape__numero">
                  <ContadorRodape valor={TIPOS_FERIADO.length} />
                </strong>
                <span>tipos de feriado</span>
              </li>
              <li className="rodape__numeroItem">
                <strong className="rodape__numero">
                  <ContadorRodape valor={101} />
                </strong>
                <span>anos calculados</span>
              </li>
              <li className="rodape__numeroItem">
                <strong className="rodape__numero">
                  <ContadorRodape valor={0} />
                </strong>
                <span>chaves de acesso</span>
              </li>
            </ul>

            <div className="rodape__accoes">
              <Link className="botao botao-primario rodape__botao" href="/doc">
                Ler a documentação
                <span className="rodape__botaoSeta" aria-hidden="true">
                  →
                </span>
              </Link>
              <a className="botao botao-secundario rodape__botao" href={REPOSITORIO} target="_blank" rel="noopener noreferrer">
                Ver no GitHub
                <VscLinkExternal aria-hidden="true" />
                <span className="visualmente-oculto"> (abre noutro separador)</span>
              </a>
            </div>
          </div>

          <div className="rodape__terminal">
            <div className="rodape__terminalTopo">
              <span className="rodape__semaforo" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <span className="rodape__terminalTitulo">Exemplo de pedido</span>
              <BotaoCopiarRodape caminho={PEDIDO} />
            </div>
            <pre className="rodape__codigo" tabIndex={0} role="region" aria-label="Exemplo de pedido e de resposta da API">
              <code>
                <span className="rodape__linha" style={atraso(0)}>
                  <span className="rodape__metodo">GET</span> {PEDIDO}
                </span>
                {LINHAS_RESPOSTA.map((linha, indice) => (
                  <span key={indice} className="rodape__linha" style={atraso(indice + 2)}>
                    {realcar(linha, "json").map((token, posicao) =>
                      token.tipo === "normal" ? (
                        token.valor
                      ) : (
                        <span key={posicao} className={`t-${token.tipo}`}>
                          {token.valor}
                        </span>
                      )
                    )}
                  </span>
                ))}
                <span className="rodape__cursor" aria-hidden="true" />
              </code>
            </pre>
          </div>
        </section>

        <section className="rodape__faixa rodape__revelar" aria-labelledby="rodape-faixa-titulo">
          <header className="rodape__faixaTopo">
            <h3 id="rodape-faixa-titulo" className="rodape__faixaTitulo">
              Feriados nacionais de {ano}
            </h3>
            <BotaoPausaFaixa alvo="rodape-faixa" />
          </header>

          <div id="rodape-faixa" className="rodape__faixaJanela">
            <div className="rodape__faixaTrilho">
              <ul className="rodape__faixaLista">
                {nacionais.map(feriado => (
                  <li key={feriado.id}>
                    <Link className="rodape__faixaLigacao" href={caminhoFeriado(feriado)}>
                      <span className="rodape__faixaData">{formatarDataCurta(feriado)}</span>
                      <span className="rodape__faixaNome">{feriado.nome}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <ul className="rodape__faixaLista rodape__faixaLista--copia" aria-hidden="true">
                {nacionais.map(feriado => (
                  <li key={feriado.id}>
                    <span className="rodape__faixaLigacao">
                      <span className="rodape__faixaData">{formatarDataCurta(feriado)}</span>
                      <span className="rodape__faixaNome">{feriado.nome}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <div className="rodape__corpo">
          <div className="rodape__marca rodape__revelar" style={atraso(0)}>
            <Link className="rodape__logotipo" href="/" aria-label="Feriados MZ — início">
              <Image className="rodape__logo" src="/logo.webp" alt="" width={80} height={80} />
              <span className="rodape__logotipoTexto">
                Feriados<span className="rodape__logotipoDestaque">MZ</span>
              </span>
            </Link>
            <p className="rodape__descricao">Feriados nacionais, provinciais, municipais e religiosos e as tolerâncias de ponto de Moçambique, com datas calculadas para qualquer ano entre 2000 e 2100.</p>
            <p className="rodape__fontes">Fonte principal: Lei n.º 13/2023, de 25 de Agosto (Lei do Trabalho).</p>
          </div>

          {COLUNAS.map((coluna, indice) => (
            <nav key={coluna.titulo} className="rodape__coluna rodape__revelar" style={atraso(indice + 1)} aria-labelledby={`rodape-coluna-${indice}`}>
              <h3 id={`rodape-coluna-${indice}`} className="rodape__titulo">
                {coluna.titulo}
              </h3>
              <ul className="rodape__lista">
                {coluna.ligacoes.map(ligacao => (
                  <li key={ligacao.href}>
                    <LigacaoRodape {...ligacao} />
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="rodape__fim">
          <p className="rodape__direitos">
            © <time dateTime={String(ano)}>{ano}</time> Feriados MZ. Distribuído sob a licença MIT.
          </p>

          <address className="rodape__autor">
            Um produto da{" "}
            <a href="https://hutadev.vercel.app/" target="_blank" rel="noopener noreferrer">
              Huta Dev
              <span className="visualmente-oculto"> (abre noutro separador)</span>
            </a>
          </address>

          <RelogioMaputo />

          <a className="rodape__topo" href="#" aria-label="Voltar ao topo da página">
            <VscArrowUp aria-hidden="true" />
            <span>Topo</span>
          </a>
        </div>
      </div>

      <div className="rodape__nome" aria-hidden="true">
        <span className="rodape__nomeTexto">
          {LETRAS.map((letra, indice) => (
            <span key={indice} className={indice >= 8 ? "rodape__letra rodape__letra--destaque" : "rodape__letra"} style={atraso(indice)}>
              {letra}
            </span>
          ))}
        </span>
      </div>
    </EfeitosRodape>
  )
}
