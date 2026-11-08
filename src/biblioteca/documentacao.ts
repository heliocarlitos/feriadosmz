export const SITE_URL = "https://feriadosmz.vercel.app"
export const CAMINHO_DOCUMENTACAO = "/doc"
export const BASE_API_PUBLICA = `${SITE_URL}/api/feriados`

export const INDICE = [
  { id: "introducao", rotulo: "Introdução" },
  { id: "inicio-rapido", rotulo: "Início rápido" },
  { id: "experimentar", rotulo: "Experimentar" },
  { id: "respostas", rotulo: "Formato das respostas" },
  { id: "rotas", rotulo: "Rotas" },
  { id: "parametros", rotulo: "Parâmetros" },
  { id: "campos-escolhidos", rotulo: "Escolher campos" },
  { id: "receitas", rotulo: "Receitas" },
  { id: "erros", rotulo: "Erros" },
  { id: "campos", rotulo: "Campos" },
  { id: "boas-praticas", rotulo: "Boas práticas" }
]

export interface Parametro {
  nome: string
  local: "caminho" | "consulta"
  tipo: string
  descricao: string
  obrigatorio?: boolean
}

export interface Endpoint {
  caminho: string
  descricao: string
  detalhe: string
  parametros: Parametro[]
  pedido: string
  resposta?: string
}

export interface GrupoEndpoints {
  id: string
  titulo: string
  descricao: string
  endpoints: Endpoint[]
}

const CAMPOS: Parametro = {
  nome: "campos",
  local: "consulta",
  tipo: "texto",
  descricao: "Nomes dos campos separados por vírgula. Sem este parâmetro, vêm todos."
}

const ANO: Parametro = {
  nome: "ano",
  local: "consulta",
  tipo: "número",
  descricao: "Ano entre 2000 e 2100. Sem este parâmetro, usa o ano actual em Maputo."
}

export const EXEMPLO_PEDIDO = `curl "${BASE_API_PUBLICA}/mes/9?campos=nome,dia"`

export const EXEMPLO_RESPOSTA = `{
  "success": true,
  "data": [
    { "nome": "Dia da Vitória", "dia": 7 },
    { "nome": "Dia das Forças Armadas de Defesa de Moçambique (FADM)", "dia": 25 },
    { "nome": "Dia da Cidade da Ilha de Moçambique", "dia": 17 },
    { "nome": "Dia da Cidade de Nacala-Porto", "dia": 16 }
  ],
  "total": 4
}`

export const RESPOSTA_ERRO = `{
  "success": false,
  "message": "Mês deve ser um número entre 1 e 12"
}`

export const GRUPOS: GrupoEndpoints[] = [
  {
    id: "listagens",
    titulo: "Listagens e consultas",
    descricao: "Rotas para obter vários feriados de uma só vez, sem filtros de calendário.",
    endpoints: [
      {
        caminho: "/api/feriados",
        descricao: "Lista todos os feriados do ano actual.",
        detalhe: "Devolve todos os feriados do ano pedido. Os feriados móveis sem data confirmada vêm com data, mês, dia e dia da semana nulos.",
        parametros: [CAMPOS, ANO],
        pedido: "/api/feriados?campos=nome,data"
      },
      {
        caminho: "/api/feriados/campos",
        descricao: "Lista os campos disponíveis, com tipo e descrição.",
        detalhe: "Útil para gerar formulários ou validar nomes de campos no teu código antes de os pedires.",
        parametros: [],
        pedido: "/api/feriados/campos"
      },
      {
        caminho: "/api/feriados/hoje",
        descricao: "Diz se hoje é feriado e, se não for, devolve os próximos três.",
        detalhe: "A data de hoje é calculada no fuso horário de Maputo (Africa/Maputo), por isso a resposta não depende do fuso do servidor nem do teu.",
        parametros: [CAMPOS],
        pedido: "/api/feriados/hoje"
      },
      {
        caminho: "/api/feriados/proximos?limite=5",
        descricao: "Próximos feriados a partir de hoje, até 50.",
        detalhe: "Considera o ano actual e o seguinte, ordena por data e ignora feriados sem data confirmada.",
        parametros: [{ nome: "limite", local: "consulta", tipo: "número", descricao: "Quantidade de feriados a devolver, de 1 a 50. Por omissão, 5." }, CAMPOS],
        pedido: "/api/feriados/proximos?limite=3&campos=nome,data"
      },
      {
        caminho: "/api/feriados/estatisticas",
        descricao: "Totais por tipo e por mês.",
        detalhe: "Devolve o total de feriados, a contagem por tipo, a contagem por mês e quantos ainda não têm data confirmada.",
        parametros: [ANO],
        pedido: "/api/feriados/estatisticas",
        resposta: `{
  "success": true,
  "total": 38,
  "porTipo": {
    "nacional": 9,
    "provincial": 0,
    "municipal": 26,
    "religioso": 1,
    "tolerancia_ponto": 2
  },
  "porMes": {
    "1": 1, "2": 6, "3": 1, "4": 5, "5": 2, "6": 1,
    "7": 2, "8": 5, "9": 4, "10": 5, "11": 2, "12": 2
  },
  "semData": 2
}`
      },
      {
        caminho: "/api/feriados/buscar?q=independência",
        descricao: "Pesquisa por nome ou descrição, sem depender de acentos.",
        detalhe: "A pesquisa ignora maiúsculas, minúsculas e acentos: independencia e Independência dão o mesmo resultado.",
        parametros: [{ nome: "q", local: "consulta", tipo: "texto", descricao: "Termo a procurar no nome e na descrição.", obrigatorio: true }, ANO, CAMPOS],
        pedido: "/api/feriados/buscar?q=independencia&campos=nome,data"
      }
    ]
  },
  {
    id: "filtros",
    titulo: "Filtros por calendário e território",
    descricao: "Rotas que reduzem a lista por ano, mês, tipo ou província.",
    endpoints: [
      {
        caminho: "/api/feriados/ano/actual",
        descricao: "Devolve o ano actual em Maputo.",
        detalhe: "Serve para sincronizar o teu calendário com o ano que a API está a usar.",
        parametros: [],
        pedido: "/api/feriados/ano/actual"
      },
      {
        caminho: "/api/feriados/ano/{ano}",
        descricao: "Feriados de um ano entre 2000 e 2100.",
        detalhe: "Os feriados de data fixa repetem-se todos os anos. A Sexta-Feira Santa é calculada a partir da Páscoa de cada ano.",
        parametros: [{ nome: "ano", local: "caminho", tipo: "número", descricao: "Ano entre 2000 e 2100.", obrigatorio: true }, CAMPOS],
        pedido: "/api/feriados/ano/2027?campos=nome,data"
      },
      {
        caminho: "/api/feriados/mes/{mes}",
        descricao: "Feriados de um mês, de 1 a 12.",
        detalhe: "Feriados móveis sem data confirmada não aparecem em nenhum mês.",
        parametros: [{ nome: "mes", local: "caminho", tipo: "número", descricao: "Mês de 1 (Janeiro) a 12 (Dezembro).", obrigatorio: true }, ANO, CAMPOS],
        pedido: "/api/feriados/mes/9?campos=nome,dia",
        resposta: EXEMPLO_RESPOSTA
      },
      {
        caminho: "/api/feriados/tipo/{tipo}",
        descricao: "Feriados nacional, provincial, municipal, religioso ou tolerancia_ponto.",
        detalhe: "O tipo aceita o hífen no lugar do sublinhado, por isso tolerancia-ponto também funciona.",
        parametros: [{ nome: "tipo", local: "caminho", tipo: "texto", descricao: "nacional, provincial, municipal, religioso ou tolerancia_ponto.", obrigatorio: true }, ANO, CAMPOS],
        pedido: "/api/feriados/tipo/nacional?campos=nome,dia,mesNome"
      },
      {
        caminho: "/api/feriados/provincia/{provincia}",
        descricao: "Feriados de uma província, por exemplo Zambézia.",
        detalhe: "O nome da província ignora maiúsculas e acentos. Se usares acentos, codifica-os no endereço, por exemplo Zamb%C3%A9zia.",
        parametros: [{ nome: "provincia", local: "caminho", tipo: "texto", descricao: "Nome da província, como Zambézia ou Cabo Delgado.", obrigatorio: true }, ANO, CAMPOS],
        pedido: "/api/feriados/provincia/Zamb%C3%A9zia?campos=nome,municipio"
      }
    ]
  },
  {
    id: "um-feriado",
    titulo: "Um feriado em detalhe",
    descricao: "Rotas que trabalham sobre o identificador de um feriado.",
    endpoints: [
      {
        caminho: "/api/feriados/{id}",
        descricao: "Um feriado, pelo seu id.",
        detalhe: "Devolve todos os campos do feriado, ou apenas os que pedires com campos.",
        parametros: [{ nome: "id", local: "caminho", tipo: "número", descricao: "Identificador do feriado, inteiro maior que zero.", obrigatorio: true }, ANO, CAMPOS],
        pedido: "/api/feriados/5?campos=nome,data,diaSemana",
        resposta: `{
  "success": true,
  "data": {
    "nome": "Dia da Independência Nacional",
    "data": "2026-06-25",
    "diaSemana": "Quinta-feira"
  }
}`
      },
      {
        caminho: "/api/feriados/{id}/{campo}",
        descricao: "Apenas um campo de um feriado, por exemplo nome ou descricao-curta.",
        detalhe: "O nome do campo vai em kebab-case: descricaoCurta passa a descricao-curta e mesNome passa a mes-nome.",
        parametros: [{ nome: "id", local: "caminho", tipo: "número", descricao: "Identificador do feriado.", obrigatorio: true }, { nome: "campo", local: "caminho", tipo: "texto", descricao: "Nome do campo em kebab-case.", obrigatorio: true }, ANO],
        pedido: "/api/feriados/5/descricao-curta"
      },
      {
        caminho: "/api/feriados/{id}/local",
        descricao: "Local, província, distrito e município.",
        detalhe: "Reúne a informação geográfica do feriado numa única resposta.",
        parametros: [{ nome: "id", local: "caminho", tipo: "número", descricao: "Identificador do feriado.", obrigatorio: true }],
        pedido: "/api/feriados/5/local"
      },
      {
        caminho: "/api/feriados/{id}/intervenientes",
        descricao: "Intervenientes e personalidades ligados ao feriado.",
        detalhe: "Inclui as organizações e as personalidades, com papel, nascimento e morte quando conhecidos.",
        parametros: [{ nome: "id", local: "caminho", tipo: "número", descricao: "Identificador do feriado.", obrigatorio: true }],
        pedido: "/api/feriados/2/intervenientes"
      },
      {
        caminho: "/api/feriados/{id}/imagens",
        descricao: "Imagens associadas ao feriado.",
        detalhe: "Cada imagem traz url, texto alternativo, crédito e tipo. Se o feriado não tiver imagens próprias, devolve a imagem padrão.",
        parametros: [{ nome: "id", local: "caminho", tipo: "número", descricao: "Identificador do feriado.", obrigatorio: true }],
        pedido: "/api/feriados/5/imagens"
      }
    ]
  }
]

export const EXEMPLOS_LINGUAGENS = [
  {
    id: "curl",
    rotulo: "cURL",
    linguagem: "bash" as const,
    codigo: `curl "${BASE_API_PUBLICA}/proximos?limite=3&campos=nome,data"`
  },
  {
    id: "javascript",
    rotulo: "JavaScript",
    linguagem: "javascript" as const,
    codigo: `const resposta = await fetch("${BASE_API_PUBLICA}/proximos?limite=3&campos=nome,data")
const { success, data } = await resposta.json()

if (success) {
  for (const feriado of data) {
    console.log(\`\${feriado.data} - \${feriado.nome}\`)
  }
}`
  },
  {
    id: "python",
    rotulo: "Python",
    linguagem: "python" as const,
    codigo: `import requests

resposta = requests.get(
    "${BASE_API_PUBLICA}/proximos",
    params={"limite": 3, "campos": "nome,data"},
    timeout=10,
)
corpo = resposta.json()

if corpo["success"]:
    for feriado in corpo["data"]:
        print(feriado["data"], feriado["nome"])`
  },
  {
    id: "php",
    rotulo: "PHP",
    linguagem: "php" as const,
    codigo: `<?php
$url = "${BASE_API_PUBLICA}/proximos?limite=3&campos=nome,data";
$corpo = json_decode(file_get_contents($url), true);

if ($corpo["success"]) {
    foreach ($corpo["data"] as $feriado) {
        echo $feriado["data"] . " - " . $feriado["nome"] . PHP_EOL;
    }
}`
  }
]

export const RECEITAS = [
  { titulo: "Hoje é feriado?", descricao: "Resposta imediata, calculada no fuso de Maputo.", pedido: "/api/feriados/hoje" },
  { titulo: "Nome e data de todos os feriados", descricao: "Lista leve, ideal para calendários.", pedido: "/api/feriados?campos=nome,data" },
  { titulo: "Dia e mês dos feriados nacionais", descricao: "Combina um filtro por tipo com a escolha de campos.", pedido: "/api/feriados/tipo/nacional?campos=nome,dia,mes,mesNome" },
  { titulo: "Descrição completa e imagens", descricao: "Os dois campos mais pesados de um feriado.", pedido: "/api/feriados/5?campos=descricao,imagens" },
  { titulo: "Só a descrição curta", descricao: "Um único campo, numa rota própria.", pedido: "/api/feriados/5/descricao-curta" },
  { titulo: "Feriados de outro ano", descricao: "Setembro de 2027, apenas com nome e dia.", pedido: "/api/feriados/mes/9?ano=2027&campos=nome,dia" },
  { titulo: "Pesquisar sem acentos", descricao: "Encontra Independência escrevendo independencia.", pedido: "/api/feriados/buscar?q=independencia" },
  { titulo: "Feriados de uma província", descricao: "O nome acentuado vai codificado no endereço.", pedido: "/api/feriados/provincia/Zamb%C3%A9zia?campos=nome,municipio" }
]

export const ERROS = [
  { estado: "400", mensagem: "ID deve ser um número positivo", causa: "O id não é um número inteiro maior que zero." },
  { estado: "400", mensagem: "Mês deve ser um número entre 1 e 12", causa: "O mês está fora do intervalo ou não é numérico." },
  { estado: "400", mensagem: "Ano deve ser um número entre 2000 e 2100", causa: "O ano está fora do intervalo suportado." },
  { estado: "400", mensagem: "Limite deve ser um número entre 1 e 50", causa: "O parâmetro limite está fora do intervalo." },
  { estado: "400", mensagem: "Tipo deve ser um destes: nacional, provincial, municipal, religioso, tolerancia_ponto", causa: "O tipo pedido não existe." },
  { estado: "400", mensagem: "Parâmetro 'campos' está vazio", causa: "Foi enviado campos= sem nenhum nome." },
  { estado: "400", mensagem: "Campo desconhecido. Campos disponíveis: id, nome, tipo, …", causa: "Um dos nomes em campos, ou na rota individual, não existe." },
  { estado: "404", mensagem: "Feriado não encontrado", causa: "Nenhum feriado tem o id pedido." }
]

export const BOAS_PRATICAS = [
  { titulo: "Pede só o que precisas", texto: "descricao e imagens são os campos mais pesados. Com campos=nome,data a resposta fica muito mais pequena e rápida." },
  { titulo: "Trata datas nulas", texto: "Feriados móveis sem data confirmada, como as tolerâncias de ponto islâmicas, trazem data, mes, dia e diaSemana a null." },
  { titulo: "Fixa o ano", texto: "Em calendários, envia sempre ano explicitamente. Sem ele, a resposta muda quando o ano vira em Maputo." },
  { titulo: "Guarda em cache", texto: "Os dados mudam raramente. Guardar a resposta durante algumas horas poupa pedidos e acelera a tua aplicação." },
  { titulo: "Codifica os parâmetros", texto: "Usa encodeURIComponent, ou o equivalente da tua linguagem, em nomes com acentos ou espaços, como Zambézia." },
  { titulo: "Verifica success", texto: "Confirma o campo success e o estado HTTP antes de usar data. Em caso de erro, message explica o problema." },
  { titulo: "Separa feriados de tolerâncias", texto: "Tolerância de ponto não é feriado obrigatório. Filtra por tipo se precisas só de feriados nacionais." }
]
