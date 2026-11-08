import Link from "next/link"
import { caminhoTipo, criarIdentificador } from "@/biblioteca/apresentacao"
import { juntarClasses } from "@/biblioteca/cliente"
import { formatarDataIso, hojeEmMaputo } from "@/biblioteca/datas"
import { compararPorData, filtrarPorTipo } from "@/biblioteca/feriados"
import { TIPOS_FERIADO } from "@/biblioteca/tipos"
import type { FeriadoCompleto, TipoFeriado } from "@/biblioteca/tipos"
import CartaoFeriado from "@componentes/cartaoferiado/cartaoferiado"
import "./feriados.css"

export const INFORMACAO_TIPOS: Record<TipoFeriado, { aba: string; titulo: string; descricao: string }> = {
  nacional: {
    aba: "Nacionais",
    titulo: "Feriados nacionais",
    descricao: "Datas celebradas em todo o território moçambicano."
  },
  provincial: {
    aba: "Provinciais",
    titulo: "Feriados provinciais",
    descricao: "Datas em que cada província celebra a sua elevação e a sua história."
  },
  municipal: {
    aba: "Municipais",
    titulo: "Feriados municipais",
    descricao: "Dias de cidades, vilas e distritos, agrupados por província."
  },
  religioso: {
    aba: "Religiosos",
    titulo: "Feriados religiosos",
    descricao: "Datas religiosas observadas no país, com data que muda de ano para ano."
  },
  tolerancia_ponto: {
    aba: "Tolerâncias de ponto",
    titulo: "Tolerâncias de ponto",
    descricao: "Dias em que o Governo dispensa os trabalhadores de uma confissão religiosa, sem serem feriados nacionais."
  }
}

const NOME_GRUPO_UNICO: Partial<Record<TipoFeriado, string>> = {
  nacional: "Outros feriados nacionais",
  religioso: "Outros feriados religiosos",
  tolerancia_ponto: "Outras tolerâncias de ponto"
}

function agrupar(tipo: TipoFeriado, feriados: FeriadoCompleto[]) {
  if (feriados.length === 0) return []
  if (tipo !== "provincial" && tipo !== "municipal") {
    return [{ id: "outros", nome: NOME_GRUPO_UNICO[tipo] ?? "Outros feriados", feriados }]
  }

  const grupos = new Map<string, FeriadoCompleto[]>()
  for (const feriado of feriados) {
    const chave = feriado.provincia ?? "Sem província"
    grupos.set(chave, [...(grupos.get(chave) ?? []), feriado])
  }
  return [...grupos].sort(([a], [b]) => a.localeCompare(b, "pt")).map(([nome, lista]) => ({ id: criarIdentificador(nome), nome, feriados: lista }))
}

export default function PaginaFeriados({ tipo }: { tipo: TipoFeriado }) {
  const hoje = hojeEmMaputo()
  const chaveHoje = formatarDataIso(hoje)
  const feriados = [...filtrarPorTipo(tipo, hoje.ano)].sort(compararPorData)

  const proximo = feriados.find(feriado => feriado.data !== null && feriado.data >= chaveHoje)
  const destaque = proximo ?? feriados[0]
  const grupos = agrupar(tipo, destaque ? feriados.filter(feriado => feriado.id !== destaque.id) : [])
  const { titulo, descricao } = INFORMACAO_TIPOS[tipo]

  return (
    <div className="contentor feriados">
      <header className="feriados__cabecalho">
        <span className="rotulo">Feriados {hoje.ano}</span>
        <h1 className="feriados__titulo">{titulo}</h1>
        <p className="feriados__descricao">{descricao}</p>
      </header>

      <nav className="feriados__abas" aria-label="Tipo de feriado">
        {TIPOS_FERIADO.map(item => (
          <Link key={item} href={caminhoTipo(item)} className={juntarClasses("feriados__aba", item === tipo && "feriados__aba--activa")} aria-current={item === tipo ? "page" : undefined}>
            {INFORMACAO_TIPOS[item].aba}
            <span className="feriados__abaContagem">{filtrarPorTipo(item, hoje.ano).length}</span>
          </Link>
        ))}
      </nav>

      {destaque && (
        <div className="feriados__destaque">
          <CartaoFeriado feriado={destaque} variante="destaque" nivel="h2" etiqueta={proximo ? "Próximo feriado" : "Em destaque"} prioridade />
        </div>
      )}

      {grupos.length > 1 && (
        <nav className="feriados__provincias" aria-label="Ir para a província">
          {grupos.map(grupo => (
            <a key={grupo.id} className="feriados__chip" href={`#${grupo.id}`}>
              {grupo.nome}
              <span className="feriados__chipContagem">{grupo.feriados.length}</span>
            </a>
          ))}
        </nav>
      )}

      {grupos.map(grupo => (
        <section key={grupo.id} id={grupo.id} className="feriados__grupo">
          <h2 className="feriados__grupoTitulo">
            {grupo.nome}
            <span className="feriados__grupoContagem">{grupo.feriados.length}</span>
          </h2>

          <div className="feriados__grelha">
            {grupo.feriados.map(feriado => (
              <CartaoFeriado key={feriado.id} feriado={feriado} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
