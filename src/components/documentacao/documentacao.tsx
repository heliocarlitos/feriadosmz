import { Fragment } from "react"
import type { CSSProperties, ReactNode } from "react"
import Link from "next/link"
import { ROTULO_TIPO_PLURAL, caminhoTipo } from "@/biblioteca/apresentacao"
import { CAMPOS_FERIADO, INFORMACAO_CAMPOS, campoParaCaminho } from "@/biblioteca/campos"
import { URL_REPOSITORIO } from "@/biblioteca/cliente"
import { obterAnoActual } from "@/biblioteca/datas"
import { BASE_API_PUBLICA, BOAS_PRATICAS, ERROS, EXEMPLOS_LINGUAGENS, EXEMPLO_PEDIDO, EXEMPLO_RESPOSTA, GRUPOS, INDICE, RECEITAS, RESPOSTA_ERRO, SITE_URL } from "@/biblioteca/documentacao"
import { listarFeriados } from "@/biblioteca/feriados"
import { TIPOS_FERIADO } from "@/biblioteca/tipos"
import Abas from "./abas"
import BlocoCodigo from "./blococodigo"
import Experimentar from "./experimentar"
import Indice from "./indice"
import "./documentacao.css"

const PALAVRAS_TITULO = ["Documentação", "da", "API", "de", "Feriados", "de", "Moçambique"]

function atraso(indice: number): CSSProperties {
  return { "--i": indice } as CSSProperties
}

function Caminho({ valor }: { valor: string }) {
  return (
    <code className="codigo documentacao__caminho">
      {valor.split(/(\{[^}]+\})/).map((parte, indice) =>
        parte.startsWith("{") ? (
          <span key={indice} className="documentacao__variavel">
            {parte}
          </span>
        ) : (
          parte
        )
      )}
    </code>
  )
}

function Secao({ id, titulo, resumo, children }: { id: string; titulo: string; resumo?: string; children: ReactNode }) {
  return (
    <section id={id} className="documentacao__secao" aria-labelledby={`${id}-titulo`}>
      <header className="documentacao__secaoCabecalho documentacao__revelar">
        <h2 id={`${id}-titulo`} className="documentacao__subtitulo">
          {titulo}{" "}
          <a className="documentacao__ancora" href={`#${id}`} aria-label={`Ligação directa para ${titulo}`}>
            <span aria-hidden="true">#</span>
          </a>
        </h2>
        {resumo ? <p className="documentacao__resumoSecao">{resumo}</p> : null}
      </header>
      {children}
    </section>
  )
}

function curl(pedido: string): string {
  return `curl "${SITE_URL}${pedido}"`
}

export default function Documentacao() {
  const total = listarFeriados(obterAnoActual()).length

  return (
    <div className="documentacao">
      <div className="documentacao__progresso" aria-hidden="true" />

      <header className="documentacao__hero contentor">
        <div className="documentacao__heroTexto">
          <p className="rotulo documentacao__entrada" style={atraso(0)}>
            API aberta · sem chave · JSON
          </p>
          <h1 className="documentacao__titulo">
            {PALAVRAS_TITULO.map((palavra, indice) => (
              <Fragment key={indice}>
                <span className="documentacao__palavra">
                  <span style={atraso(indice)}>{palavra}</span>
                </span>{" "}
              </Fragment>
            ))}
          </h1>
          <p className="documentacao__descricao documentacao__entrada" style={atraso(2)}>
            Uma API REST gratuita, sem registo e sem chave, com os feriados nacionais, provinciais e municipais de Moçambique. Cada informação vem num campo próprio, para pedires só o que precisas.
          </p>
          <div className="documentacao__accoes documentacao__entrada" style={atraso(3)}>
            <a className="botao botao-primario" href="#inicio-rapido">
              Fazer o primeiro pedido
            </a>
            <a className="botao botao-secundario" href={URL_REPOSITORIO} rel="noopener noreferrer" target="_blank">
              Código no GitHub
            </a>
          </div>
        </div>

        <div className="documentacao__heroCodigo documentacao__entrada" style={atraso(4)}>
          <BlocoCodigo codigo={EXEMPLO_PEDIDO} linguagem="bash" titulo="Pedido" />
          <BlocoCodigo codigo={EXEMPLO_RESPOSTA} linguagem="json" titulo="Resposta" />
        </div>

        <dl className="documentacao__factos">
          <div>
            <dt>Endereço base</dt>
            <dd>
              <code className="codigo">{BASE_API_PUBLICA}</code>
            </dd>
          </div>
          <div>
            <dt>Método</dt>
            <dd>GET</dd>
          </div>
          <div>
            <dt>Autenticação</dt>
            <dd>Nenhuma</dd>
          </div>
          <div>
            <dt>Formato</dt>
            <dd>JSON, UTF-8</dd>
          </div>
          <div>
            <dt>Feriados</dt>
            <dd>{total}</dd>
          </div>
          <div>
            <dt>Anos</dt>
            <dd>2000 a 2100</dd>
          </div>
        </dl>
      </header>

      <div className="documentacao__corpo contentor">
        <aside className="documentacao__lateral">
          <Indice itens={INDICE} />
        </aside>

        <div className="documentacao__conteudo">
          <Secao id="introducao" titulo="Introdução" resumo="O que a API oferece e como as datas são tratadas.">
            <div className="documentacao__prosa">
              <p>
                A API de Feriados de Moçambique devolve os feriados nacionais, provinciais e municipais, a Sexta-Feira Santa e as tolerâncias de ponto, todos com descrição, local, intervenientes e imagens. Todas as rotas usam o método <code className="codigo">GET</code> e respondem em JSON.
              </p>
              <p>
                Os feriados de data fixa repetem-se em todos os anos. A Sexta-Feira Santa é calculada a partir da Páscoa de cada ano. As tolerâncias de ponto ligadas ao calendário islâmico só têm data depois de confirmadas, e até lá a data vem a <code className="codigo">null</code>.
              </p>
              <p>
                Os dados seguem a Lei n.º 13/2023, de 25 de Agosto (Lei do Trabalho), e outras fontes oficiais e jornalísticas listadas no repositório. Qualquer rota que devolve feriados aceita <code className="codigo">?campos=</code> e <code className="codigo">?ano=</code>.
              </p>
            </div>
            <div className="documentacao__cartoes">
              <article className="documentacao__cartao documentacao__revelar">
                <h3>Sem chave nem registo</h3>
                <p>Faz o pedido e recebe a resposta. Não há tokens, limites de conta nem formulários.</p>
              </article>
              <article className="documentacao__cartao documentacao__revelar">
                <h3>Só o que precisas</h3>
                <p>Escolhe os campos de cada resposta e poupa dados, tempo e código de limpeza.</p>
              </article>
              <article className="documentacao__cartao documentacao__revelar">
                <h3>Datas calculadas</h3>
                <p>Pede qualquer ano entre 2000 e 2100 e recebe as datas e o dia da semana já resolvidos.</p>
              </article>
            </div>
          </Secao>

          <Secao id="inicio-rapido" titulo="Início rápido" resumo="Três passos para ver os próximos feriados na tua aplicação.">
            <ol className="documentacao__passos">
              <li>
                <h3>Escolhe a rota</h3>
                <p>
                  <code className="codigo">/api/feriados/proximos</code> devolve os próximos feriados a partir de hoje. O parâmetro <code className="codigo">limite</code> define quantos, de 1 a 50.
                </p>
              </li>
              <li>
                <h3>Reduz a resposta</h3>
                <p>
                  Junta <code className="codigo">campos=nome,data</code> para receber apenas o nome e a data de cada feriado.
                </p>
              </li>
              <li>
                <h3>Lê o resultado</h3>
                <p>
                  Verifica <code className="codigo">success</code> e usa a lista em <code className="codigo">data</code>. Em caso de erro, o texto está em <code className="codigo">message</code>.
                </p>
              </li>
            </ol>
            <Abas
              rotulo="Linguagem do exemplo"
              abas={EXEMPLOS_LINGUAGENS.map(exemplo => ({
                id: exemplo.id,
                rotulo: exemplo.rotulo,
                conteudo: <BlocoCodigo codigo={exemplo.codigo} linguagem={exemplo.linguagem} titulo={`Próximos 3 feriados em ${exemplo.rotulo}`} />
              }))}
            />
          </Secao>

          <Secao id="experimentar" titulo="Experimentar" resumo="Faz pedidos reais à API e vê a resposta sem sair desta página.">
            <Experimentar />
          </Secao>

          <Secao id="respostas" titulo="Formato das respostas" resumo="Todas as rotas seguem a mesma estrutura.">
            <div className="documentacao__prosa">
              <p>
                Uma resposta bem-sucedida tem sempre <code className="codigo">success: true</code>. As listas vêm em <code className="codigo">data</code> com o número de itens em <code className="codigo">total</code>, e um único feriado vem em <code className="codigo">data</code> como objecto.
              </p>
            </div>
            <div className="documentacao__duplo">
              <BlocoCodigo codigo={EXEMPLO_RESPOSTA} linguagem="json" titulo="Sucesso: lista" />
              <BlocoCodigo codigo={RESPOSTA_ERRO} linguagem="json" titulo="Erro" />
            </div>
            <div className="documentacao__prosa">
              <p>
                Um erro tem <code className="codigo">success: false</code>, uma mensagem em <code className="codigo">message</code> e o estado HTTP correspondente, 400 para pedidos inválidos e 404 quando o feriado não existe.
              </p>
            </div>
          </Secao>

          <Secao id="rotas" titulo="Rotas" resumo="Abre cada rota para veres parâmetros, pedido de exemplo e resposta.">
            {GRUPOS.map(grupo => (
              <div key={grupo.id} className="documentacao__grupo">
                <h3 className="documentacao__grupoTitulo documentacao__revelar">{grupo.titulo}</h3>
                <p className="documentacao__texto">{grupo.descricao}</p>
                <ul className="documentacao__lista">
                  {grupo.endpoints.map(endpoint => (
                    <li key={endpoint.caminho}>
                      <details className="endpoint">
                        <summary className="endpoint__resumo">
                          <span className="documentacao__metodo">GET</span>
                          <Caminho valor={endpoint.caminho} />
                          <span className="endpoint__descricao">{endpoint.descricao}</span>
                          <svg className="endpoint__seta" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="m4 6 4 4 4-4" />
                          </svg>
                        </summary>
                        <div className="endpoint__corpo">
                          <p className="documentacao__texto">{endpoint.detalhe}</p>
                          {endpoint.parametros.length > 0 ? (
                            <dl className="endpoint__parametros">
                              {endpoint.parametros.map(parametro => (
                                <div key={`${parametro.local}-${parametro.nome}`} className="endpoint__parametro">
                                  <dt>
                                    <code className="codigo documentacao__chave">{parametro.nome}</code>
                                    <span className="endpoint__meta">
                                      {parametro.local} · {parametro.tipo}
                                      {parametro.obrigatorio ? " · obrigatório" : ""}
                                    </span>
                                  </dt>
                                  <dd>{parametro.descricao}</dd>
                                </div>
                              ))}
                            </dl>
                          ) : null}
                          <BlocoCodigo codigo={curl(endpoint.pedido)} linguagem="bash" titulo="Pedido" />
                          {endpoint.resposta ? <BlocoCodigo codigo={endpoint.resposta} linguagem="json" titulo="Resposta" /> : null}
                        </div>
                      </details>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Secao>

          <Secao id="parametros" titulo="Parâmetros" resumo="Os parâmetros de consulta e de caminho que as rotas aceitam.">
            <div className="documentacao__tabelaContentor" role="region" aria-label="Tabela de parâmetros" tabIndex={0}>
              <table className="documentacao__tabela">
                <caption className="visualmente-oculto">Parâmetros da API</caption>
                <thead>
                  <tr>
                    <th scope="col">Parâmetro</th>
                    <th scope="col">Onde</th>
                    <th scope="col">Valores</th>
                    <th scope="col">Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">
                      <code className="codigo documentacao__chave">campos</code>
                    </th>
                    <td>Consulta</td>
                    <td>Nomes separados por vírgula</td>
                    <td>Escolhe os campos devolvidos. Aceita camelCase ou kebab-case, por exemplo mesNome ou mes-nome.</td>
                  </tr>
                  <tr>
                    <th scope="row">
                      <code className="codigo documentacao__chave">ano</code>
                    </th>
                    <td>Consulta</td>
                    <td>2000 a 2100</td>
                    <td>Ano das datas. Por omissão, o ano actual em Maputo.</td>
                  </tr>
                  <tr>
                    <th scope="row">
                      <code className="codigo documentacao__chave">limite</code>
                    </th>
                    <td>Consulta</td>
                    <td>1 a 50</td>
                    <td>Quantidade de resultados em /proximos. Por omissão, 5.</td>
                  </tr>
                  <tr>
                    <th scope="row">
                      <code className="codigo documentacao__chave">q</code>
                    </th>
                    <td>Consulta</td>
                    <td>Texto</td>
                    <td>Termo de pesquisa em /buscar. Ignora acentos e maiúsculas.</td>
                  </tr>
                  <tr>
                    <th scope="row">
                      <code className="codigo documentacao__chave">id</code>
                    </th>
                    <td>Caminho</td>
                    <td>Inteiro maior que 0</td>
                    <td>Identificador do feriado.</td>
                  </tr>
                  <tr>
                    <th scope="row">
                      <code className="codigo documentacao__chave">mes</code>
                    </th>
                    <td>Caminho</td>
                    <td>1 a 12</td>
                    <td>Mês do calendário, de Janeiro a Dezembro.</td>
                  </tr>
                  <tr>
                    <th scope="row">
                      <code className="codigo documentacao__chave">tipo</code>
                    </th>
                    <td>Caminho</td>
                    <td>{TIPOS_FERIADO.join(", ")}</td>
                    <td>Tipo de feriado. O hífen vale como sublinhado.</td>
                  </tr>
                  <tr>
                    <th scope="row">
                      <code className="codigo documentacao__chave">provincia</code>
                    </th>
                    <td>Caminho</td>
                    <td>Texto</td>
                    <td>Nome da província, sem distinção de acentos nem de maiúsculas.</td>
                  </tr>
                  <tr>
                    <th scope="row">
                      <code className="codigo documentacao__chave">campo</code>
                    </th>
                    <td>Caminho</td>
                    <td>Campo em kebab-case</td>
                    <td>Nome do campo numa rota individual, como descricao-curta.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Secao>

          <Secao id="campos-escolhidos" titulo="Escolher campos" resumo="Recebe só os campos de que precisas, em qualquer rota que devolva feriados.">
            <div className="documentacao__prosa">
              <p>
                Junta <code className="codigo">?campos=</code> com os nomes separados por vírgula. A resposta traz os campos pela ordem em que os pedires, e os nomes repetidos são ignorados. Sem <code className="codigo">campos</code>, vêm todos.
              </p>
              <p>Se algum nome não existir, a API responde com 400 e lista os campos disponíveis. Para um único campo de um feriado, usa a rota individual com o nome em kebab-case.</p>
            </div>
            <div className="documentacao__duplo">
              <BlocoCodigo codigo={curl("/api/feriados/mes/9")} linguagem="bash" titulo="Sem campos: todos os dados" />
              <BlocoCodigo codigo={curl("/api/feriados/mes/9?campos=nome,dia")} linguagem="bash" titulo="Com campos: só o necessário" />
            </div>
            <BlocoCodigo codigo={EXEMPLO_RESPOSTA} linguagem="json" titulo="Resposta com campos=nome,dia" />
          </Secao>

          <Secao id="receitas" titulo="Receitas" resumo="Pedidos prontos para os casos mais comuns. Copia e adapta.">
            <div className="documentacao__receitas">
              {RECEITAS.map(receita => (
                <article key={receita.pedido} className="documentacao__receita documentacao__revelar">
                  <h3>{receita.titulo}</h3>
                  <p>{receita.descricao}</p>
                  <BlocoCodigo codigo={curl(receita.pedido)} linguagem="bash" titulo="Pedido" />
                </article>
              ))}
            </div>
          </Secao>

          <Secao id="erros" titulo="Erros" resumo="Mensagens e estados que podes receber, e o que fazer em cada caso.">
            <div className="documentacao__tabelaContentor" role="region" aria-label="Tabela de erros" tabIndex={0}>
              <table className="documentacao__tabela">
                <caption className="visualmente-oculto">Erros da API</caption>
                <thead>
                  <tr>
                    <th scope="col">Estado</th>
                    <th scope="col">Mensagem</th>
                    <th scope="col">Causa</th>
                  </tr>
                </thead>
                <tbody>
                  {ERROS.map(erro => (
                    <tr key={erro.mensagem}>
                      <th scope="row">
                        <code className="codigo documentacao__chave">{erro.estado}</code>
                      </th>
                      <td>{erro.mensagem}</td>
                      <td>{erro.causa}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <BlocoCodigo
              codigo={`const resposta = await fetch("${BASE_API_PUBLICA}/mes/13")
const corpo = await resposta.json()

if (!resposta.ok || !corpo.success) {
  throw new Error(corpo.message)
}`}
              linguagem="javascript"
              titulo="Tratar um erro"
            />
          </Secao>

          <Secao id="campos" titulo="Campos" resumo="Todos os campos de um feriado, com o tipo, a descrição e a rota individual.">
            <div className="documentacao__tabelaContentor" role="region" aria-label="Tabela de campos" tabIndex={0}>
              <table className="documentacao__tabela">
                <caption className="visualmente-oculto">Campos de um feriado</caption>
                <thead>
                  <tr>
                    <th scope="col">Campo</th>
                    <th scope="col">Tipo</th>
                    <th scope="col">Descrição</th>
                    <th scope="col">Rota individual</th>
                  </tr>
                </thead>
                <tbody>
                  {CAMPOS_FERIADO.map(campo => (
                    <tr key={campo}>
                      <th scope="row">
                        <code className="codigo documentacao__chave">{campo}</code>
                      </th>
                      <td>{INFORMACAO_CAMPOS[campo].tipo}</td>
                      <td>{INFORMACAO_CAMPOS[campo].descricao}</td>
                      <td>
                        <Caminho valor={`/api/feriados/{id}/${campoParaCaminho(campo)}`} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Secao>

          <Secao id="boas-praticas" titulo="Boas práticas" resumo="Hábitos que tornam a integração mais rápida e mais robusta.">
            <ul className="documentacao__cartoes documentacao__cartoes--estreitos">
              {BOAS_PRATICAS.map(pratica => (
                <li key={pratica.titulo} className="documentacao__cartao documentacao__revelar">
                  <h3>{pratica.titulo}</h3>
                  <p>{pratica.texto}</p>
                </li>
              ))}
            </ul>
            <nav className="documentacao__navegar" aria-label="Explorar os feriados no site">
              <p className="rotulo">Explorar no site</p>
              <ul>
                {TIPOS_FERIADO.map(tipo => (
                  <li key={tipo}>
                    <Link href={caminhoTipo(tipo)}>
                      <span>{ROTULO_TIPO_PLURAL[tipo]}</span>
                      <span aria-hidden="true">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </Secao>
        </div>
      </div>
    </div>
  )
}
