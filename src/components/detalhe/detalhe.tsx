import Link from "next/link"
import type { ReactNode } from "react"
import { VscArrowLeft, VscCalendar, VscLocation } from "react-icons/vsc"
import { DATA_POR_CONFIRMAR, ROTULO_TIPO, ROTULO_TIPO_PLURAL, caminhoFeriado, caminhoTipo, formatarDataLonga, gerarParagrafos } from "@/biblioteca/apresentacao"
import { IMAGEM_PADRAO, listarFeriados } from "@/biblioteca/feriados"
import type { FeriadoCompleto, ImagemFeriado, Personalidade } from "@/biblioteca/tipos"
import CartaoFeriado from "@componentes/cartaoferiado/cartaoferiado"
import Imagem from "@componentes/imagem/imagem"
import Partilha from "@componentes/partilha/partilha"
import "./detalhe.css"

function encontrarSimilares(feriado: FeriadoCompleto, limite = 3): FeriadoCompleto[] {
  const posicao = (item: FeriadoCompleto) => (item.mes ?? 0) * 31 + (item.dia ?? 0)

  return listarFeriados(feriado.ano)
    .filter(item => item.id !== feriado.id)
    .map(item => ({
      item,
      pontos: (item.tipo === feriado.tipo ? 3 : 0) + (feriado.provincia && item.provincia === feriado.provincia ? 2 : 0) + (item.mes !== null && item.mes === feriado.mes ? 1 : 0),
      distancia: Math.abs(posicao(item) - posicao(feriado))
    }))
    .sort((a, b) => b.pontos - a.pontos || a.distancia - b.distancia)
    .slice(0, limite)
    .map(entrada => entrada.item)
}

function anosDeVida(personalidade: Personalidade): string | null {
  const nascimento = personalidade.nascimento?.slice(0, 4)
  const morte = personalidade.morte?.slice(0, 4)
  if (nascimento && morte) return `${nascimento} – ${morte}`
  if (nascimento) return `Nasceu em ${nascimento}`
  return null
}

function legenda(imagem: ImagemFeriado): string | null {
  const partes = [imagem.url === IMAGEM_PADRAO.url ? null : imagem.alt, imagem.credito ? `Crédito: ${imagem.credito}` : null].filter(Boolean)
  return partes.length > 0 ? partes.join(" · ") : null
}

export default function DetalheFeriado({ feriado }: { feriado: FeriadoCompleto }) {
  const [capa, ...restantes] = feriado.imagens
  const paragrafos = gerarParagrafos(feriado.descricao ?? "")
  const similares = encontrarSimilares(feriado)
  const lugar = feriado.local ?? feriado.provincia
  const intervenientes = feriado.intervenientes ?? []
  const personalidades = feriado.personalidades ?? []
  const legendaCapa = legenda(capa)
  const caminhoLista = caminhoTipo(feriado.tipo)

  const fatos: { rotulo: string; valor: ReactNode }[] = [
    { rotulo: "Data", valor: formatarDataLonga(feriado) },
    { rotulo: "Dia da semana", valor: feriado.diaSemana },
    { rotulo: "Categoria", valor: ROTULO_TIPO[feriado.tipo] },
    { rotulo: "Data móvel", valor: feriado.movel ? (feriado.regra ?? "Sim") : null },
    { rotulo: "Província", valor: feriado.provincia },
    { rotulo: "Distrito", valor: feriado.distrito },
    { rotulo: "Município", valor: feriado.municipio },
    { rotulo: "Local", valor: feriado.local },
    { rotulo: "Ano do acontecimento", valor: feriado.anoEvento || null },
    { rotulo: "Instituído em", valor: feriado.anoInstituicao },
    { rotulo: "Instrumento legal", valor: feriado.instrumentoLegal },
    { rotulo: "Observância", valor: feriado.observancia }
  ].filter(fato => fato.valor !== null && fato.valor !== undefined && fato.valor !== "")

  return (
    <article className="contentor detalhe">
      <nav className="detalhe__migalhas" aria-label="Localização">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href={caminhoLista}>{ROTULO_TIPO_PLURAL[feriado.tipo]}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{feriado.nome}</span>
      </nav>

      <header className="detalhe__cabecalho">
        <div className="detalhe__etiquetas">
          <Link className="detalhe__categoria" href={caminhoLista}>
            {ROTULO_TIPO[feriado.tipo]}
          </Link>
          {feriado.provincia && <span className="detalhe__etiqueta">{feriado.provincia}</span>}
          {feriado.movel && <span className="detalhe__etiqueta">Data móvel</span>}
        </div>

        <h1 className="detalhe__titulo">{feriado.nome}</h1>

        {feriado.descricaoCurta && <p className="detalhe__resumo">{feriado.descricaoCurta}</p>}

        <ul className="detalhe__meta">
          <li>
            <VscCalendar aria-hidden="true" />
            {feriado.data ? (
              <time dateTime={feriado.data}>
                {formatarDataLonga(feriado)} · {feriado.diaSemana}
              </time>
            ) : (
              <span>{DATA_POR_CONFIRMAR}</span>
            )}
          </li>
          {lugar && (
            <li>
              <VscLocation aria-hidden="true" />
              <span>{lugar}</span>
            </li>
          )}
        </ul>

        <Partilha caminho={caminhoFeriado(feriado)} titulo={feriado.nome} texto={feriado.descricaoCurta} />
      </header>

      <figure className="detalhe__capa">
        <div className="detalhe__capaMedia">
          <Imagem url={capa.url} alt={capa.alt} prioridade />
        </div>
        {legendaCapa && <figcaption className="detalhe__legenda">{legendaCapa}</figcaption>}
      </figure>

      <div className="detalhe__corpo">
        <div className="detalhe__texto">
          <h2 className="detalhe__subtitulo">Sobre este feriado</h2>

          {paragrafos.length > 0 ? (
            paragrafos.map((paragrafo, indice) => (
              <p key={indice} className="detalhe__paragrafo">
                {paragrafo}
              </p>
            ))
          ) : (
            <p className="detalhe__paragrafo detalhe__paragrafo--vazio">Ainda não há descrição completa para este feriado.</p>
          )}

          {personalidades.length > 0 && (
            <section className="detalhe__bloco" aria-labelledby="titulo-personalidades">
              <h2 id="titulo-personalidades" className="detalhe__subtitulo">
                Personalidades
              </h2>
              <ul className="detalhe__personalidades">
                {personalidades.map(personalidade => (
                  <li key={personalidade.nome} className="detalhe__personalidade">
                    <span className="detalhe__nome">{personalidade.nome}</span>
                    <span className="detalhe__papel">{personalidade.papel}</span>
                    {anosDeVida(personalidade) && <span className="detalhe__anos">{anosDeVida(personalidade)}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {restantes.length > 0 && (
            <section className="detalhe__bloco" aria-labelledby="titulo-galeria">
              <h2 id="titulo-galeria" className="detalhe__subtitulo">
                Galeria
              </h2>
              <div className="detalhe__galeria">
                {restantes.map(imagem => (
                  <figure key={imagem.url} className="detalhe__galeriaItem">
                    <div className="detalhe__galeriaMedia">
                      <Imagem url={imagem.url} alt={imagem.alt} />
                    </div>
                    {legenda(imagem) && <figcaption className="detalhe__legenda">{legenda(imagem)}</figcaption>}
                  </figure>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="detalhe__lateral">
          <section className="detalhe__caixa" aria-labelledby="titulo-ficha">
            <h2 id="titulo-ficha" className="detalhe__caixaTitulo">
              Ficha do feriado
            </h2>
            <dl className="detalhe__fatos">
              {fatos.map(fato => (
                <div key={fato.rotulo} className="detalhe__fato">
                  <dt>{fato.rotulo}</dt>
                  <dd>{fato.valor}</dd>
                </div>
              ))}
            </dl>
          </section>

          {intervenientes.length > 0 && (
            <section className="detalhe__caixa" aria-labelledby="titulo-intervenientes">
              <h2 id="titulo-intervenientes" className="detalhe__caixaTitulo">
                Intervenientes
              </h2>
              <ul className="detalhe__chips">
                {intervenientes.map(nome => (
                  <li key={nome} className="detalhe__chip">
                    {nome}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="detalhe__caixa" aria-labelledby="titulo-api">
            <h2 id="titulo-api" className="detalhe__caixaTitulo">
              Dados na API
            </h2>
            <div className="detalhe__api">
              <code className="codigo detalhe__apiCodigo">GET /api/feriados/{feriado.id}</code>
              <code className="codigo detalhe__apiCodigo">GET /api/feriados/{feriado.id}?campos=nome,data</code>
              <a className="detalhe__apiLigacao" href={`/api/feriados/${feriado.id}`} target="_blank" rel="noopener noreferrer">
                Abrir JSON →
              </a>
            </div>
          </section>
        </aside>
      </div>

      {similares.length > 0 && (
        <section className="detalhe__similares" aria-labelledby="titulo-similares">
          <h2 id="titulo-similares" className="detalhe__subtitulo">
            Feriados parecidos
          </h2>
          <div className="detalhe__grelha">
            {similares.map(item => (
              <CartaoFeriado key={item.id} feriado={item} />
            ))}
          </div>
        </section>
      )}

      <Link className="detalhe__voltar" href={caminhoLista}>
        <VscArrowLeft aria-hidden="true" />
        Voltar a {ROTULO_TIPO_PLURAL[feriado.tipo].toLowerCase()}
      </Link>
    </article>
  )
}
