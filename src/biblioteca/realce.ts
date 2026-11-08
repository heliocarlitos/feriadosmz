export type Linguagem = "json" | "bash" | "javascript" | "python" | "php" | "texto"

export type TipoToken = "normal" | "chave" | "texto" | "numero" | "palavra" | "funcao" | "variavel" | "opcao" | "pontuacao"

export interface Token {
  tipo: TipoToken
  valor: string
}

const PALAVRAS: Record<Exclude<Linguagem, "texto">, ReadonlySet<string>> = {
  json: new Set(["true", "false", "null"]),
  bash: new Set(["curl", "echo", "export"]),
  javascript: new Set(["const", "let", "var", "await", "async", "import", "from", "return", "if", "else", "new", "for", "of", "throw", "true", "false", "null", "undefined"]),
  python: new Set(["import", "from", "as", "if", "else", "for", "in", "return", "with", "print", "True", "False", "None"]),
  php: new Set(["echo", "foreach", "as", "if", "else", "function", "return", "true", "false", "null"])
}

const MODELO = /("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|((?<![\w$-])-{1,2}[A-Za-z][\w-]*)|(\b\d+(?:\.\d+)?\b)|(\$?[A-Za-z_]\w*)|(\s+)|([\s\S])/g

const PONTUACAO = /[{}[\](),:;.=<>+\-*/?&|!]/

export function realcar(codigo: string, linguagem: Linguagem): Token[] {
  if (linguagem === "texto") return [{ tipo: "normal", valor: codigo }]

  const palavras = PALAVRAS[linguagem]
  const regra = new RegExp(MODELO.source, "g")
  const tokens: Token[] = []

  let correspondencia: RegExpExecArray | null
  while ((correspondencia = regra.exec(codigo)) !== null) {
    const [valor, cadeia, opcao, numero, nome, espaco] = correspondencia
    let tipo: TipoToken = "normal"

    if (cadeia !== undefined) {
      const resto = codigo.slice(regra.lastIndex).trimStart()
      tipo = linguagem === "json" && resto.startsWith(":") ? "chave" : "texto"
    } else if (opcao !== undefined) {
      tipo = linguagem === "bash" ? "opcao" : "normal"
    } else if (numero !== undefined) {
      tipo = "numero"
    } else if (nome !== undefined) {
      if (nome.startsWith("$")) tipo = "variavel"
      else if (palavras.has(nome)) tipo = "palavra"
      else if (codigo.charAt(regra.lastIndex) === "(") tipo = "funcao"
    } else if (espaco === undefined && PONTUACAO.test(valor)) {
      tipo = "pontuacao"
    }

    tokens.push({ tipo, valor })
  }

  const unidos: Token[] = []
  for (const token of tokens) {
    const ultimo = unidos[unidos.length - 1]
    if (ultimo && ultimo.tipo === token.tipo) ultimo.valor += token.valor
    else unidos.push({ ...token })
  }
  return unidos
}
