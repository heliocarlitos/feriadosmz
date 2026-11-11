import Link from "next/link"
import "./introcontacto.css"

const dicas = [
  { titulo: "Corrigir dados", texto: "Uma data errada ou um nome mal escrito? Diz-nos qual e onde está a fonte." },
  { titulo: "Sugerir feriado", texto: "Falta um feriado municipal ou provincial? Envia o diploma que o institui." },
  { titulo: "Integração", texto: "Dúvidas ao consumir a API? Conta-nos o que estás a construir." }
]

export default function IntroContacto() {
  return (
    <header className="introcontacto">
      <p className="rotulo">Contacto</p>
      <h1 className="introcontacto__titulo">Algum feriado errado ou em falta?</h1>
      <p className="introcontacto__texto">
        A API de Feriados de Moçambique é mantida à mão e melhora com a ajuda de quem a usa. Escreve-nos e respondemos por e-mail.
      </p>

      <ul className="introcontacto__lista">
        {dicas.map(dica => (
          <li key={dica.titulo} className="introcontacto__item">
            <strong className="introcontacto__item-titulo">{dica.titulo}</strong>
            <span className="introcontacto__item-texto">{dica.texto}</span>
          </li>
        ))}
      </ul>

      <p className="introcontacto__ligacoes">
        Preferes técnico?{" "}
        <a className="introcontacto__ligacao" href="https://github.com/heliocarlitos/feriadosmz/issues" target="_blank" rel="noopener noreferrer">
          Abre uma issue no GitHub<span className="visualmente-oculto"> (abre num novo separador)</span>
        </a>{" "}
        ou consulta a <Link className="introcontacto__ligacao" href="/doc">documentação</Link>.
      </p>
    </header>
  )
}
