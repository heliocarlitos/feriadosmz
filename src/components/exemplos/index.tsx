import CartaoExemplo from "./cartaoexemplo"
import Calendario from "./calendario/calendario"
import Contagem from "./contagem/contagem"
import DiaUtil from "./diautil/diautil"
import Pesquisa from "./pesquisa/pesquisa"
import Provincia from "./provincia/provincia"
import { CODIGOS } from "./codigos"
import Link from "next/link"

import "./exemplos.css"

const ATALHOS = [
  { id: "exemplo-calendario", rotulo: "Calendário" },
  { id: "exemplo-contagem", rotulo: "Contagem decrescente" },
  { id: "exemplo-diautil", rotulo: "Dia útil" },
  { id: "exemplo-pesquisa", rotulo: "Pesquisa" },
  { id: "exemplo-provincia", rotulo: "Por província" }
]

export default function Exemplos() {
  return (
    <section id="exemplos" className="exemplos" aria-labelledby="exemplos-titulo">
      <div className="contentor">
        <header className="exemplos__cabecalho">
          <p className="rotulo">Exemplos</p>
          <h2 id="exemplos-titulo" className="exemplos__titulo">
            O que podes construir com esta API
          </h2>
          <p className="exemplos__descricao">Cada exemplo abaixo corre com dados reais da API. Experimenta, vê a rota usada e copia o código para o teu projecto.</p>
          <nav className="exemplos__atalhos" aria-label="Saltar para um exemplo">
            <ul>
              {ATALHOS.map(atalho => (
                <li key={atalho.id}>
                  <a href={`#${atalho.id}`}>{atalho.rotulo}</a>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <div className="exemplos__grelha">
          <CartaoExemplo id="exemplo-calendario" numero="01" titulo="Calendário de feriados" descricao="Os feriados de cada mês num calendário navegável, com cor e forma por tipo. Usa as setas do teclado para percorrer os dias." rota="/api/feriados/ano/{ano}" codigo={CODIGOS.calendario} larga>
            <Calendario />
          </CartaoExemplo>

          <CartaoExemplo id="exemplo-contagem" numero="02" titulo="Contagem decrescente" descricao="Mostra o tempo que falta para o próximo feriado e lista os seguintes." rota="/api/feriados/proximos?limite=4" codigo={CODIGOS.contagem}>
            <Contagem />
          </CartaoExemplo>

          <CartaoExemplo id="exemplo-diautil" numero="03" titulo="Verificador de dia útil" descricao="Diz se uma data é dia útil, ignorando fins-de-semana e feriados, e sugere o próximo dia útil." rota="/api/feriados/ano/{ano}" codigo={CODIGOS.diaUtil}>
            <DiaUtil />
          </CartaoExemplo>

          <CartaoExemplo id="exemplo-pesquisa" numero="04" titulo="Pesquisa instantânea" descricao="Procura feriados por nome ou descrição, sem depender de acentos." rota="/api/feriados/buscar?q={termo}" codigo={CODIGOS.pesquisa}>
            <Pesquisa />
          </CartaoExemplo>

          <CartaoExemplo id="exemplo-provincia" numero="05" titulo="Feriados por província" descricao="Filtra os feriados de qualquer província, incluindo os municipais." rota="/api/feriados/provincia/{provincia}" codigo={CODIGOS.provincia}>
            <Provincia />
          </CartaoExemplo>
        </div>

        <p className="exemplos__rodape">
          <Link className="botao botao-secundario" href="/doc">
            Ver todas as rotas na documentação
          </Link>
        </p>
      </div>
    </section>
  )
}
