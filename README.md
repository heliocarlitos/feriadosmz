<a id='topo'></a>

<div align='center'>

<a href="https://feriadosmz.vercel.app/" target="_blank">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://feriadosmz.vercel.app/logo.webp">
  <source media="(prefers-color-scheme: light)" srcset="https://feriadosmz.vercel.app/logo.webp">
  <img alt="Logótipo da API de Feriados de Moçambique" src="https://feriadosmz.vercel.app/logo.webp" width="120">
</picture>
</a>

# API de Feriados de Moçambique

**Feriados nacionais, provinciais e municipais em JSON.** <br/>
_Aberta, gratuita e ~~com chave~~ sem chave de acesso._

<a href="https://feriadosmz.vercel.app/" target="_blank"><img src="https://img.shields.io/badge/site-feriadosmz.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Site"/></a>
<a href="https://feriadosmz.vercel.app/doc" target="_blank"><img src="https://img.shields.io/badge/documenta%C3%A7%C3%A3o-online-0E5E4B?style=for-the-badge&logo=readthedocs&logoColor=white" alt="Documentação"/></a>
<a href="https://github.com/heliocarlitos/api-feriados-mocambique" target="_blank"><img src="https://img.shields.io/badge/github-reposit%C3%B3rio-181717?style=for-the-badge&logo=github&logoColor=white" alt="Repositório"/></a>

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)&nbsp;
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)&nbsp;
![JSON](https://img.shields.io/badge/JSON-000000?style=for-the-badge&logo=json&logoColor=white)&nbsp;
![Licença MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-yellow?style=for-the-badge)&nbsp;

### <a href='#fundo'>Ir ao Fundo</a>

</div>

##

# Introdução

Esta API devolve os feriados de Moçambique: **nacionais**, **provinciais**, **municipais**, **religiosos** e as **tolerâncias de ponto**. Cada feriado traz data, descrição, local, intervenientes e imagens, e tu escolhes apenas os campos de que precisas.

Endereço base:

```
https://feriadosmz.vercel.app/api/feriados
```

Este guia explica, passo a passo, como fazer o teu primeiro pedido, como ler a resposta, como tratar datas por confirmar e como integrar a API em projectos reais: HTML, Node.js, React, Next.js, Vue, Python, PHP, Laravel, React Native, Flutter, Go, C#, Google Sheets e Shell.

<details>

<summary> Índice </summary>

- <a href='#1-sobre-a-api'>1. Sobre a API</a>
  - <a href='#11-como-tratar-datas-nulas'>1.1 Como tratar datas nulas</a>

- <a href='#2-primeiro-pedido'>2. Primeiro pedido</a>

- <a href='#3-formato-das-respostas'>3. Formato das respostas</a>

- <a href='#4-rotas'>4. Rotas</a>

- <a href='#5-par%C3%A2metros'>5. Parâmetros</a>

- <a href='#6-escolher-campos'>6. Escolher campos</a>

- <a href='#7-campos-de-um-feriado'>7. Campos de um feriado</a>

- <a href='#8-erros'>8. Erros</a>

- <a href='#9-usar-em-cada-tipo-de-projecto'>9. Usar em cada tipo de projecto</a>

- <a href='#10-casos-pr%C3%A1ticos'>10. Casos práticos</a>

- <a href='#11-boas-pr%C3%A1ticas'>11. Boas práticas</a>

- <a href='#12-correr-localmente'>12. Correr localmente</a>

- <a href='#13-estrutura-do-projecto'>13. Estrutura do projecto</a>

- <a href='#14-contribuir'>14. Contribuir</a>

- <a href='#15-fontes-e-licen%C3%A7a'>15. Fontes e licença</a>

</details>

##

## 1. Sobre a API

| Característica         |           Detalhe           |
| :--------------------- | :-------------------------: |
| Método                 |            `GET`            |
| Formato                |         JSON, UTF-8         |
| Autenticação           |    ~~Token~~ **nenhuma**    |
| Anos suportados        |         2000 a 2100         |
| Fuso horário de "hoje" |       `Africa/Maputo`       |
| Pesquisa               | ignora acentos e maiúsculas |

Como as datas são tratadas:

1. Feriados de data fixa
   - repetem-se em todos os anos
2. Feriados móveis
   - a Sexta-Feira Santa é calculada a partir da Páscoa de cada ano
   - as tolerâncias de ponto islâmicas (Eid al-Fitr e Eid al-Adha) só têm data depois de confirmadas oficialmente

> [!IMPORTANT]
> Alguns feriados não têm data confirmada. Enquanto isso acontece, a API devolve `null` nos campos `data`, `mes`, `mesNome`, `dia` e `diaSemana`. Se usares estes campos sem verificar, o teu código pode falhar com erros como `Cannot read properties of null`.
>
> **O que deves fazer, em 3 passos:**
>
> 1. Antes de usar `data`, `mes`, `dia`, `mesNome` ou `diaSemana`, verifica se são diferentes de `null`.
> 2. Mostra um texto alternativo ao utilizador, por exemplo `Data por confirmar`, em vez de um espaço vazio.
> 3. Se só precisas de feriados com data, filtra a lista antes de a usar.
>
> ```javascript
> const texto = feriado.data ?? "Data por confirmar"
> const confirmados = feriados.filter(feriado => feriado.data !== null)
> ```
>
> Guia completo, com exemplos em várias linguagens, em [1.1 Como tratar datas nulas](#11-como-tratar-datas-nulas).

### 1.1 Como tratar datas nulas

**a) Porque acontece**

Um feriado é "móvel" (`movel: true`) quando a data muda de ano para ano. Há dois casos:

| Caso                                              | Exemplo                                     |     Resultado     |
| :------------------------------------------------ | :------------------------------------------ | :---------------: |
| Data calculável                                   | Sexta-Feira Santa (depende da Páscoa)       | `data` preenchida |
| Data dependente de decreto ou do calendário lunar | Eid al-Fitr (Ide) e Eid al-Adha (Idul-Adhá) |  `data` a `null`  |

Pedido com data calculada:

```
https://feriadosmz.vercel.app/api/feriados/10?ano=2026&campos=nome,data,diaSemana,movel
```

| Parte    | Valor                       | O que faz                             |
| :------- | :-------------------------- | :------------------------------------ |
| Rota     | `/10`                       | Feriado com id 10 (Sexta-Feira Santa) |
| `ano`    | `2026`                      | Calcula a data para 2026              |
| `campos` | `nome,data,diaSemana,movel` | Devolve só estes campos               |

```json
{
  "success": true,
  "data": {
    "nome": "Sexta-Feira Santa",
    "data": "2026-04-03",
    "diaSemana": "Sexta-feira",
    "movel": true
  }
}
```

Pedido com data por confirmar:

```
https://feriadosmz.vercel.app/api/feriados/tipo/tolerancia-ponto?campos=id,nome,data,mes,dia,diaSemana
```

| Parte    | Valor                            | O que faz                                  |
| :------- | :------------------------------- | :----------------------------------------- |
| Rota     | `/tipo/tolerancia-ponto`         | Só as tolerâncias de ponto                 |
| `campos` | `id,nome,data,mes,dia,diaSemana` | Inclui todos os campos que podem ser nulos |

```json
{
  "success": true,
  "data": [
    { "id": 11, "nome": "Eid al-Fitr (Ide)", "data": null, "mes": null, "dia": null, "diaSemana": null },
    { "id": 12, "nome": "Eid al-Adha (Idul-Adhá)", "data": null, "mes": null, "dia": null, "diaSemana": null }
  ],
  "total": 2
}
```

**b) Onde os feriados sem data aparecem**

| Rota                                          |     Feriados sem data      |
| :-------------------------------------------- | :------------------------: |
| `/api/feriados` e `/api/feriados/tipo/{tipo}` | aparecem, com campos nulos |
| `/api/feriados/{id}`                          | aparece, com campos nulos  |
| `/api/feriados/mes/{mes}`                     |        não aparecem        |
| `/api/feriados/proximos`                      |        não aparecem        |
| `/api/feriados/hoje`                          |  nunca coincidem com hoje  |
| `/api/feriados/estatisticas`                  |   contados em `semData`    |

**c) Como tratar em cada linguagem**

| Linguagem  | Tipo do campo      | Verificação                                |
| :--------- | :----------------- | :----------------------------------------- |
| JavaScript | `string` ou `null` | `feriado.data ?? "Data por confirmar"`     |
| TypeScript | `string \| null`   | `feriado.data ?? "Data por confirmar"`     |
| Python     | `str` ou `None`    | `feriado["data"] or "Data por confirmar"`  |
| PHP        | `string` ou `null` | `$feriado["data"] ?? "Data por confirmar"` |
| Go         | `*string`          | `if feriado.Data != nil { ... }`           |
| C#         | `string?`          | `feriado.Data ?? "data por confirmar"`     |
| Dart       | `String?`          | `feriado.data ?? 'Data por confirmar'`     |

**d) Exemplo completo em JavaScript**

Ficheiro `datas-nulas.mjs`:

```javascript
const URL_API = "https://feriadosmz.vercel.app/api/feriados/tipo/tolerancia-ponto?campos=id,nome,data,mes,dia,diaSemana"

const resposta = await fetch(URL_API)
const corpo = await resposta.json()

if (!resposta.ok || !corpo.success) {
  throw new Error(corpo.message)
}

const comData = corpo.data.filter(feriado => feriado.data !== null)
const porConfirmar = corpo.data.filter(feriado => feriado.data === null)

console.log(`Com data confirmada: ${comData.length}`)
for (const feriado of comData) {
  console.log(`  ${feriado.data} (${feriado.diaSemana}) - ${feriado.nome}`)
}

console.log(`Por confirmar: ${porConfirmar.length}`)
for (const feriado of porConfirmar) {
  console.log(`  ${feriado.nome} - Data por confirmar`)
}
```

Executar:

```bash
node datas-nulas.mjs
```

Resultado esperado:

```text
Com data confirmada: 0
Por confirmar: 2
  Eid al-Fitr (Ide) - Data por confirmar
  Eid al-Adha (Idul-Adhá) - Data por confirmar
```

> Quando as datas forem confirmadas, a primeira secção passa a listar os feriados e a segunda fica vazia, sem alterar o código.

##

<div align='center'>

### <a href='#topo'>Ir ao topo</a>

</div>

##

## 2. Primeiro pedido

**a) Anatomia de uma URL**

```
https://feriadosmz.vercel.app/api/feriados/mes/9?ano=2026&campos=nome,dia
```

| Parte                 | Valor                           | O que significa                          |
| :-------------------- | :------------------------------ | :--------------------------------------- |
| Domínio               | `https://feriadosmz.vercel.app` | Onde a API está alojada                  |
| Prefixo               | `/api/feriados`                 | Início de todas as rotas                 |
| Rota                  | `/mes/9`                        | Feriados do mês 9 (Setembro)             |
| Início dos parâmetros | `?`                             | Separa a rota dos parâmetros             |
| Parâmetro `ano`       | `ano=2026`                      | Ano das datas                            |
| Separador             | `&`                             | Junta vários parâmetros                  |
| Parâmetro `campos`    | `campos=nome,dia`               | Campos a devolver, separados por vírgula |

Regras que se aplicam a todas as URLs:

- Os valores variáveis das rotas ficam entre chavetas na documentação, por exemplo `{id}`. Substitui-os pelo valor real: `/api/feriados/5`.
- Caracteres especiais vão codificados: `Zambézia` passa a `Zamb%C3%A9zia`.
- Todos os pedidos são `GET`. Não precisas de cabeçalhos nem de corpo.

**b) Quatro formas de testar, sem escrever código**

**No navegador**

1. Abre o navegador.
2. Cola na barra de endereços: `https://feriadosmz.vercel.app/api/feriados/mes/9?campos=nome,dia`
3. Carrega em Enter. O JSON aparece no ecrã.

**No terminal (cURL)**

```bash
curl "https://feriadosmz.vercel.app/api/feriados/mes/9?campos=nome,dia"
```

> [!NOTE]
> No PowerShell do Windows, `curl` é um atalho de outro comando. Usa `curl.exe` ou `Invoke-RestMethod`.

```powershell
Invoke-RestMethod "https://feriadosmz.vercel.app/api/feriados/mes/9?campos=nome,dia" | ConvertTo-Json -Depth 5
```

**No Postman ou Insomnia**

1. Cria um pedido novo.
2. Escolhe o método `GET`.
3. Cola `https://feriadosmz.vercel.app/api/feriados/mes/9`.
4. Em **Params**, adiciona `campos` com o valor `nome,dia`.
5. Carrega em **Send**.

**c) Resposta recebida**

```json
{
  "success": true,
  "data": [
    { "nome": "Dia da Vitória", "dia": 7 },
    { "nome": "Dia das Forças Armadas de Defesa de Moçambique (FADM)", "dia": 25 },
    { "nome": "Dia da Cidade da Ilha de Moçambique", "dia": 17 },
    { "nome": "Dia da Cidade de Nacala-Porto", "dia": 16 }
  ],
  "total": 4
}
```

Como ler:

- `success: true` indica que o pedido correu bem.
- `data` é a lista de feriados, com apenas os campos pedidos.
- `total` é o número de feriados na lista.

**d) Qual rota escolher**

| Quero                       | Rota                     | URL completa                                                         |
| :-------------------------- | :----------------------- | :------------------------------------------------------------------- |
| Os próximos feriados        | `/proximos`              | `https://feriadosmz.vercel.app/api/feriados/proximos?limite=5`       |
| Saber se hoje é feriado     | `/hoje`                  | `https://feriadosmz.vercel.app/api/feriados/hoje`                    |
| Todos os feriados de um ano | `/ano/{ano}`             | `https://feriadosmz.vercel.app/api/feriados/ano/2027`                |
| Feriados de um mês          | `/mes/{mes}`             | `https://feriadosmz.vercel.app/api/feriados/mes/6`                   |
| Só os feriados nacionais    | `/tipo/{tipo}`           | `https://feriadosmz.vercel.app/api/feriados/tipo/nacional`           |
| Feriados de uma província   | `/provincia/{provincia}` | `https://feriadosmz.vercel.app/api/feriados/provincia/Zamb%C3%A9zia` |
| Pesquisar por palavra       | `/buscar`                | `https://feriadosmz.vercel.app/api/feriados/buscar?q=paz`            |
| Um feriado em concreto      | `/{id}`                  | `https://feriadosmz.vercel.app/api/feriados/5`                       |
| Contagens por tipo e mês    | `/estatisticas`          | `https://feriadosmz.vercel.app/api/feriados/estatisticas`            |

##

<div align='center'>

### <a href='#topo'>Ir ao topo</a>

</div>

##

## 3. Formato das respostas

Todas as rotas seguem a mesma estrutura.

**a) Sucesso**

- Listas vêm em `data`, com o número de itens em `total`.
- Um único feriado vem em `data` como objecto.

Lista:

```json
{
  "success": true,
  "data": [
    { "nome": "Dia da Vitória", "dia": 7 }
  ],
  "total": 1
}
```

Feriado único:

```json
{
  "success": true,
  "data": {
    "nome": "Dia da Independência Nacional",
    "data": "2026-06-25",
    "diaSemana": "Quinta-feira"
  }
}
```

**b) Erro**

- `success` é `false`.
- `message` explica o problema.
- O estado HTTP é 400 para pedidos inválidos e 404 quando o feriado não existe.

```json
{
  "success": false,
  "message": "Mês deve ser um número entre 1 e 12"
}
```

> A API pode acrescentar campos novos no futuro. Lê só os campos de que precisas e ignora os restantes.

##

<div align='center'>

### <a href='#topo'>Ir ao topo</a>

</div>

##

## 4. Rotas

Todas as rotas começam em `https://feriadosmz.vercel.app`.

**a) Listagens e consultas**

| Método | Rota                                   | Descrição                                                     |
| :----: | :------------------------------------- | :------------------------------------------------------------ |
| `GET`  | `/api/feriados`                        | Todos os feriados do ano actual                               |
| `GET`  | `/api/feriados/campos`                 | Campos disponíveis, com tipo e descrição                      |
| `GET`  | `/api/feriados/hoje`                   | Diz se hoje é feriado e, se não for, devolve os próximos três |
| `GET`  | `/api/feriados/proximos?limite=5`      | Próximos feriados a partir de hoje, até 50                    |
| `GET`  | `/api/feriados/estatisticas`           | Totais por tipo e por mês                                     |
| `GET`  | `/api/feriados/buscar?q=independência` | Pesquisa por nome ou descrição, sem depender de acentos       |

**b) Filtros por calendário e território**

| Método | Rota                                  | Descrição                                                                         |
| :----: | :------------------------------------ | :-------------------------------------------------------------------------------- |
| `GET`  | `/api/feriados/ano/actual`            | Ano actual em Maputo                                                              |
| `GET`  | `/api/feriados/ano/{ano}`             | Feriados de um ano entre 2000 e 2100                                              |
| `GET`  | `/api/feriados/mes/{mes}`             | Feriados de um mês, de 1 a 12                                                     |
| `GET`  | `/api/feriados/tipo/{tipo}`           | Feriados `nacional`, `provincial`, `municipal`, `religioso` ou `tolerancia_ponto` |
| `GET`  | `/api/feriados/provincia/{provincia}` | Feriados de uma província, por exemplo `Zambézia`                                 |

**c) Um feriado em detalhe**

| Método | Rota                                | Descrição                                     |
| :----: | :---------------------------------- | :-------------------------------------------- |
| `GET`  | `/api/feriados/{id}`                | Um feriado pelo seu id                        |
| `GET`  | `/api/feriados/{id}/{campo}`        | Um único campo, por exemplo `descricao-curta` |
| `GET`  | `/api/feriados/{id}/local`          | Local, província, distrito e município        |
| `GET`  | `/api/feriados/{id}/intervenientes` | Intervenientes e personalidades               |
| `GET`  | `/api/feriados/{id}/imagens`        | Imagens do feriado                            |

##

<div align='center'>

### <a href='#topo'>Ir ao topo</a>

</div>

##

## 5. Parâmetros

| Parâmetro   |   Onde   | Valores                                                                | Descrição                                                     |
| :---------- | :------: | :--------------------------------------------------------------------- | :------------------------------------------------------------ |
| `campos`    | consulta | nomes separados por vírgula                                            | Escolhe os campos devolvidos. Aceita `mesNome` ou `mes-nome`  |
| `ano`       | consulta | 2000 a 2100                                                            | Ano das datas. Por omissão, o ano actual em Maputo            |
| `limite`    | consulta | 1 a 50                                                                 | Quantidade de resultados em `/proximos`. Por omissão, 5       |
| `q`         | consulta | texto                                                                  | Termo de pesquisa em `/buscar`                                |
| `id`        | caminho  | inteiro maior que 0                                                    | Identificador do feriado                                      |
| `mes`       | caminho  | 1 a 12                                                                 | Mês do calendário                                             |
| `tipo`      | caminho  | `nacional`, `provincial`, `municipal`, `religioso`, `tolerancia_ponto` | O hífen vale como sublinhado                                  |
| `provincia` | caminho  | texto                                                                  | Nome da província, sem distinção de acentos nem de maiúsculas |
| `campo`     | caminho  | campo em kebab-case                                                    | Nome do campo numa rota individual                            |

> [!NOTE]
> **Consulta** significa que o parâmetro vai depois do `?`, por exemplo `?ano=2026`. **Caminho** significa que faz parte da própria rota, por exemplo `/mes/9`.

##

<div align='center'>

### <a href='#topo'>Ir ao topo</a>

</div>

##

## 6. Escolher campos

Junta `?campos=` com os nomes separados por vírgula. Os campos chegam pela ordem em que os pedires e os nomes repetidos são ignorados. Sem `campos`, vêm todos.

**a) Dia e mês dos feriados nacionais**

```
https://feriadosmz.vercel.app/api/feriados/tipo/nacional?campos=nome,dia,mes,mesNome
```

| Parte    | Valor                  | O que faz                              |
| :------- | :--------------------- | :------------------------------------- |
| Rota     | `/tipo/nacional`       | Só os feriados nacionais               |
| `campos` | `nome,dia,mes,mesNome` | Nome, dia, número do mês e nome do mês |

```json
{
  "success": true,
  "data": [
    { "nome": "Dia da Fraternidade Universal (Ano Novo)", "dia": 1, "mes": 1, "mesNome": "Janeiro" },
    { "nome": "Dia dos Heróis Moçambicanos", "dia": 3, "mes": 2, "mesNome": "Fevereiro" },
    { "nome": "Dia da Mulher Moçambicana", "dia": 7, "mes": 4, "mesNome": "Abril" },
    { "nome": "Dia Internacional dos Trabalhadores", "dia": 1, "mes": 5, "mesNome": "Maio" },
    { "nome": "Dia da Independência Nacional", "dia": 25, "mes": 6, "mesNome": "Junho" },
    { "nome": "Dia da Vitória", "dia": 7, "mes": 9, "mesNome": "Setembro" },
    { "nome": "Dia das Forças Armadas de Defesa de Moçambique (FADM)", "dia": 25, "mes": 9, "mesNome": "Setembro" },
    { "nome": "Dia da Paz e Reconciliação", "dia": 4, "mes": 10, "mesNome": "Outubro" },
    { "nome": "Dia da Família (Natal)", "dia": 25, "mes": 12, "mesNome": "Dezembro" }
  ],
  "total": 9
}
```

**b) Feriados de uma província**

```
https://feriadosmz.vercel.app/api/feriados/provincia/Zamb%C3%A9zia?campos=nome,municipio
```

| Parte    | Valor                      | O que faz                                     |
| :------- | :------------------------- | :-------------------------------------------- |
| Rota     | `/provincia/Zamb%C3%A9zia` | Feriados da Zambézia, com o acento codificado |
| `campos` | `nome,municipio`           | Nome e município                              |

```json
{
  "success": true,
  "data": [
    { "nome": "Dia da Cidade de Quelimane", "municipio": "Quelimane" },
    { "nome": "Dia da Cidade de Mocuba", "municipio": "Mocuba" },
    { "nome": "Dia da Cidade de Gurué", "municipio": "Gurué" }
  ],
  "total": 3
}
```

**c) Descrição completa e imagens de um feriado**

```
https://feriadosmz.vercel.app/api/feriados/5?campos=descricao,imagens
```

| Parte    | Valor               | O que faz                     |
| :------- | :------------------ | :---------------------------- |
| Rota     | `/5`                | Dia da Independência Nacional |
| `campos` | `descricao,imagens` | Os dois campos mais pesados   |

```json
{
  "success": true,
  "data": {
    "descricao": "O Dia da Independência Nacional celebra-se a 25 de Junho, data em que Moçambique proclamou a independência de Portugal, em 1975, após mais de 470 anos de domínio colonial. A cerimónia ocorreu no Estádio da Machava, em Maputo, onde Samora Machel proferiu o histórico discurso “A Hora é Nossa”. A data simboliza a conquista da soberania nacional e é celebrada com cerimónias oficiais, desfiles e manifestações culturais em todo o país.",
    "imagens": [
      {
        "url": "/images/image_default.webp",
        "alt": "Imagem padrão de feriado moçambicano",
        "tipo": "ilustracao"
      }
    ]
  }
}
```

> Se um feriado não tiver imagens próprias, a API devolve a imagem padrão. O campo `imagens` nunca vem vazio.

**d) Mais combinações**

| Quero                            | URL                                                                         |
| :------------------------------- | :-------------------------------------------------------------------------- |
| Nome e data de todos os feriados | `https://feriadosmz.vercel.app/api/feriados?campos=nome,data`               |
| Só a descrição curta             | `https://feriadosmz.vercel.app/api/feriados/5/descricao-curta`              |
| Setembro de 2027                 | `https://feriadosmz.vercel.app/api/feriados/mes/9?ano=2027&campos=nome,dia` |

> [!NOTE]
> Na rota individual, o nome do campo vai em kebab-case: `descricaoCurta` passa a `descricao-curta` e `mesNome` passa a `mes-nome`.

##

<div align='center'>

### <a href='#topo'>Ir ao topo</a>

</div>

##

## 7. Campos de um feriado

| Campo                                                                                                                                                   | Tipo            |        Pode ser `null`        |
| :------------------------------------------------------------------------------------------------------------------------------------------------------ | :-------------- | :---------------------------: |
| `id`, `nome`, `tipo`, `ano`, `movel`, `intervenientes`, `personalidades`, `imagens`                                                                     | vários          |              não              |
| `data`, `mes`, `mesNome`, `dia`, `diaSemana`                                                                                                            | texto ou número | **sim** (data por confirmar)  |
| `regra`, `descricaoCurta`, `descricao`, `local`, `provincia`, `distrito`, `municipio`, `anoEvento`, `anoInstituicao`, `instrumentoLegal`, `observancia` | texto ou número | **sim** (informação em falta) |

<details>

<summary>Ver os 24 campos, um a um</summary>

| Campo              |       Tipo        | Descrição                                                                |
| :----------------- | :---------------: | :----------------------------------------------------------------------- |
| `id`               |      número       | Identificador único                                                      |
| `nome`             |       texto       | Nome do feriado                                                          |
| `tipo`             |       texto       | `nacional`, `provincial`, `municipal`, `religioso` ou `tolerancia_ponto` |
| `data`             |   texto ou nulo   | `AAAA-MM-DD`, nula se ainda não estiver confirmada                       |
| `ano`              |      número       | Ano a que a data se refere                                               |
| `mes`              |  número ou nulo   | Mês, de 1 a 12                                                           |
| `mesNome`          |   texto ou nulo   | Nome do mês por extenso                                                  |
| `dia`              |  número ou nulo   | Dia do mês                                                               |
| `diaSemana`        |   texto ou nulo   | Dia da semana em que o feriado cai                                       |
| `movel`            |     booleano      | Se a data muda de ano para ano                                           |
| `regra`            |   texto ou nulo   | Regra de cálculo dos feriados móveis                                     |
| `descricaoCurta`   |   texto ou nulo   | Resumo de uma frase                                                      |
| `descricao`        |   texto ou nulo   | Descrição completa e contexto histórico                                  |
| `local`            |   texto ou nulo   | Local associado                                                          |
| `provincia`        |   texto ou nulo   | Província                                                                |
| `distrito`         |   texto ou nulo   | Distrito                                                                 |
| `municipio`        |   texto ou nulo   | Município                                                                |
| `intervenientes`   |  lista de textos  | Pessoas e organizações envolvidas                                        |
| `personalidades`   | lista de objectos | Nome, papel, nascimento e morte                                          |
| `anoEvento`        |  número ou nulo   | Ano do acontecimento recordado                                           |
| `anoInstituicao`   |  número ou nulo   | Ano em que o feriado foi instituído                                      |
| `instrumentoLegal` |   texto ou nulo   | Lei ou diploma que o institui                                            |
| `observancia`      |   texto ou nulo   | Natureza da observância                                                  |
| `imagens`          | lista de objectos | `url`, `alt`, `credito` e `tipo`                                         |

</details>

<details>

<summary>Ver um feriado completo (id 5, ano 2026)</summary>

```
https://feriadosmz.vercel.app/api/feriados/5?ano=2026
```

```json
{
  "success": true,
  "data": {
    "id": 5,
    "nome": "Dia da Independência Nacional",
    "tipo": "nacional",
    "data": "2026-06-25",
    "ano": 2026,
    "mes": 6,
    "mesNome": "Junho",
    "dia": 25,
    "diaSemana": "Quinta-feira",
    "movel": false,
    "regra": null,
    "descricaoCurta": "Proclamação da independência de Moçambique de Portugal, em 1975.",
    "descricao": "O Dia da Independência Nacional celebra-se a 25 de Junho, data em que Moçambique proclamou a independência de Portugal, em 1975, após mais de 470 anos de domínio colonial. A cerimónia ocorreu no Estádio da Machava, em Maputo, onde Samora Machel proferiu o histórico discurso “A Hora é Nossa”. A data simboliza a conquista da soberania nacional e é celebrada com cerimónias oficiais, desfiles e manifestações culturais em todo o país.",
    "local": "Estádio da Machava, Maputo",
    "provincia": "Maputo",
    "distrito": null,
    "municipio": "Maputo",
    "intervenientes": ["Samora Machel", "Eduardo Mondlane", "FRELIMO"],
    "personalidades": [
      {
        "nome": "Samora Moisés Machel",
        "papel": "Presidente da FRELIMO e primeiro Presidente de Moçambique",
        "nascimento": "1933-09-29",
        "morte": "1986-10-19"
      },
      {
        "nome": "Eduardo Chivambo Mondlane",
        "papel": "Fundador e primeiro Presidente da FRELIMO",
        "nascimento": "1920-06-20",
        "morte": "1969-02-03"
      }
    ],
    "anoEvento": 1975,
    "anoInstituicao": 1975,
    "instrumentoLegal": null,
    "observancia": "Feriado nacional",
    "imagens": [
      {
        "url": "/images/image_default.webp",
        "alt": "Imagem padrão de feriado moçambicano",
        "tipo": "ilustracao"
      }
    ]
  }
}
```

</details>

##

<div align='center'>

### <a href='#topo'>Ir ao topo</a>

</div>

##

## 8. Erros

| Estado | Mensagem                                      | Causa                                |
| :----: | :-------------------------------------------- | :----------------------------------- |
| `400`  | `ID deve ser um número positivo`              | O id não é um inteiro maior que zero |
| `400`  | `Mês deve ser um número entre 1 e 12`         | Mês fora do intervalo                |
| `400`  | `Ano deve ser um número entre 2000 e 2100`    | Ano fora do intervalo                |
| `400`  | `Limite deve ser um número entre 1 e 50`      | Limite fora do intervalo             |
| `400`  | `Tipo deve ser um destes: ...`                | Tipo inexistente                     |
| `400`  | `Parâmetro 'campos' está vazio`               | `campos=` sem nomes                  |
| `400`  | `Campo desconhecido. Campos disponíveis: ...` | Nome de campo inexistente            |
| `404`  | `Feriado não encontrado`                      | Nenhum feriado com esse id           |

**a) Mês inválido (400)**

```
https://feriadosmz.vercel.app/api/feriados/mes/13
```

```json
{
  "success": false,
  "message": "Mês deve ser um número entre 1 e 12"
}
```

**b) Feriado inexistente (404)**

```
https://feriadosmz.vercel.app/api/feriados/999
```

```json
{
  "success": false,
  "message": "Feriado não encontrado"
}
```

**c) Como tratar erros no teu código**

```javascript
const resposta = await fetch("https://feriadosmz.vercel.app/api/feriados/mes/13")
const corpo = await resposta.json()

if (!resposta.ok || !corpo.success) {
  console.error(`Erro ${resposta.status}: ${corpo.message}`)
} else {
  console.log(corpo.data)
}
```

Resultado:

```text
Erro 400: Mês deve ser um número entre 1 e 12
```

##

<div align='center'>

### <a href='#topo'>Ir ao topo</a>

</div>

##

## 9. Usar em cada tipo de projecto

**Receita geral**, igual em todas as linguagens:

1. Escolhe a rota certa na [tabela da secção 2](#2-primeiro-pedido).
2. Monta a URL: `https://feriadosmz.vercel.app/api/feriados` + rota + `?parâmetros`.
3. Faz um pedido `GET`.
4. Lê o JSON e verifica `success`. Se for `false`, mostra `message`.
5. Usa `data`. Trata os campos que podem ser `null`.

> [!WARNING]
> Se o navegador bloquear um pedido por CORS, faz a chamada a partir do teu servidor. Os exemplos de Next.js e Laravel já seguem este caminho.

Abre o guia da plataforma que usas. Cada guia indica o que instalar, onde criar cada ficheiro, o que colar, como executar e o que deves ver.

<details open>

<summary>cURL e Shell (Linux, macOS, Git Bash, WSL)</summary>

![Bash](https://img.shields.io/badge/Shell-4EAA25?style=for-the-badge&logo=gnubash&logoColor=white)&nbsp;

**O que vais fazer:** consultar a API no terminal e criar um comando que diz se uma data é feriado.

**Requisitos:** `curl` e `jq` instalados (`sudo apt install jq` no Ubuntu, `brew install jq` no macOS).

**Passo 1. Fazer um pedido simples**

```
https://feriadosmz.vercel.app/api/feriados/mes/9?campos=nome,dia
```

| Parte    | Valor      | O que faz            |
| :------- | :--------- | :------------------- |
| Rota     | `/mes/9`   | Feriados de Setembro |
| `campos` | `nome,dia` | Só o nome e o dia    |

```bash
curl -s "https://feriadosmz.vercel.app/api/feriados/mes/9?campos=nome,dia"
```

A opção `-s` esconde a barra de progresso. Resposta:

```json
{"success":true,"data":[{"nome":"Dia da Vitória","dia":7},{"nome":"Dia das Forças Armadas de Defesa de Moçambique (FADM)","dia":25},{"nome":"Dia da Cidade da Ilha de Moçambique","dia":17},{"nome":"Dia da Cidade de Nacala-Porto","dia":16}],"total":4}
```

**Passo 2. Formatar com `jq`**

```bash
curl -s "https://feriadosmz.vercel.app/api/feriados/mes/9?campos=nome,dia" | jq -r '.data[] | "\(.dia)  \(.nome)"'
```

Resultado:

```text
7  Dia da Vitória
25  Dia das Forças Armadas de Defesa de Moçambique (FADM)
17  Dia da Cidade da Ilha de Moçambique
16  Dia da Cidade de Nacala-Porto
```

**Passo 3. Criar um script que diz se uma data é feriado**

Ficheiro `eh-feriado.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

DATA="${1:-$(TZ=Africa/Maputo date +%F)}"
ANO="${DATA%%-*}"

NOME=$(curl -fsS "https://feriadosmz.vercel.app/api/feriados?ano=${ANO}&campos=nome,data" | jq -r --arg data "$DATA" '.data[] | select(.data == $data) | .nome')

if [ -n "$NOME" ]; then
  echo "${DATA} é feriado: ${NOME}"
else
  echo "${DATA} não é feriado"
fi
```

| Parte    | Valor           | O que faz                        |
| :------- | :-------------- | :------------------------------- |
| Rota     | `/api/feriados` | Todos os feriados                |
| `ano`    | `${ANO}`        | Ano extraído da data recebida    |
| `campos` | `nome,data`     | Só o que é preciso para comparar |

**Passo 4. Dar permissão e executar**

```bash
chmod +x eh-feriado.sh
./eh-feriado.sh 2026-06-25
./eh-feriado.sh 2026-11-08
```

Resultado:

```text
2026-06-25 é feriado: Dia da Independência Nacional
2026-11-08 não é feriado
```

Sem argumento, o script usa a data de hoje em Maputo.

</details>

<details>

<summary>HTML e JavaScript (sem instalar nada)</summary>

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)&nbsp;

**O que vais fazer:** uma página que mostra os próximos 5 feriados.

**Requisitos:** um editor de texto e um navegador.

**Passo 1. Criar a pasta e o ficheiro**

Cria uma pasta `feriados-html` e, dentro dela, um ficheiro `index.html`.

**Passo 2. Colar o código**

Ficheiro `index.html`:

```html
<!doctype html>
<html lang="pt">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Próximos feriados</title>
</head>
<body>
  <h1>Próximos feriados</h1>
  <p id="estado">A carregar…</p>
  <ul id="lista"></ul>

  <script type="module">
    const URL_API = "https://feriadosmz.vercel.app/api/feriados/proximos?limite=5&campos=nome,data,diaSemana"

    const estado = document.querySelector("#estado")
    const lista = document.querySelector("#lista")

    try {
      const resposta = await fetch(URL_API)
      const corpo = await resposta.json()

      if (!resposta.ok || !corpo.success) {
        throw new Error(corpo.message)
      }

      for (const feriado of corpo.data) {
        const item = document.createElement("li")
        const data = feriado.data ?? "Data por confirmar"
        item.textContent = `${data} (${feriado.diaSemana ?? "-"}) - ${feriado.nome}`
        lista.append(item)
      }

      estado.hidden = true
    } catch (erro) {
      estado.textContent = `Não foi possível carregar os feriados: ${erro.message}`
    }
  </script>
</body>
</html>
```

**URL usada**

```
https://feriadosmz.vercel.app/api/feriados/proximos?limite=5&campos=nome,data,diaSemana
```

| Parte    | Valor                 | O que faz                          |
| :------- | :-------------------- | :--------------------------------- |
| Rota     | `/proximos`           | Próximos feriados a partir de hoje |
| `limite` | `5`                   | Quantos feriados devolver          |
| `campos` | `nome,data,diaSemana` | Campos de cada feriado             |

**Passo 3. Abrir**

Faz duplo clique em `index.html`. A página abre no navegador.

**Resultado esperado** (a 8 de Novembro de 2026):

```text
Próximos feriados

2026-11-10 (Terça-feira) - Dia da Cidade de Maputo
2026-11-18 (Quarta-feira) - Dia da Cidade de Maxixe
2026-12-05 (Sábado) - Dia da Cidade de Manica
2026-12-25 (Sexta-feira) - Dia da Família (Natal)
2027-01-01 (Sexta-feira) - Dia da Fraternidade Universal (Ano Novo)
```

> `textContent` insere o texto sem interpretar HTML. É a forma segura de mostrar dados recebidos.

</details>

<details>

<summary>Node.js</summary>

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)&nbsp;

**O que vais fazer:** um comando que diz se uma data é feriado.

**Requisitos:** Node.js 18 ou superior (`node --version` mostra a versão).

**Passo 1. Criar o projecto**

```bash
mkdir feriados-node
cd feriados-node
npm init -y
npm pkg set type=module
```

`type=module` permite usar `import` e `await` no topo do ficheiro.

**Passo 2. Criar o ficheiro**

Ficheiro `feriados.js`:

```javascript
const BASE = "https://feriadosmz.vercel.app/api/feriados"

function hojeEmMaputo() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Maputo" }).format(new Date())
}

async function pedir(caminho) {
  const resposta = await fetch(`${BASE}${caminho}`)
  const corpo = await resposta.json()

  if (!resposta.ok || !corpo.success) {
    throw new Error(corpo.message ?? `Erro ${resposta.status}`)
  }

  return corpo
}

async function procurarFeriado(data) {
  const ano = data.slice(0, 4)
  const { data: feriados } = await pedir(`?ano=${ano}&campos=nome,data`)
  return feriados.find(feriado => feriado.data === data) ?? null
}

const data = process.argv[2] ?? hojeEmMaputo()
const feriado = await procurarFeriado(data)

console.log(feriado ? `${data} é feriado: ${feriado.nome}` : `${data} não é feriado`)
```

**URL usada**

```
https://feriadosmz.vercel.app/api/feriados?ano=2026&campos=nome,data
```

| Parte    | Valor           | O que faz                         |
| :------- | :-------------- | :-------------------------------- |
| Rota     | `/api/feriados` | Todos os feriados                 |
| `ano`    | `2026`          | Ano retirado da data que passaste |
| `campos` | `nome,data`     | Só o necessário para comparar     |

**Passo 3. Executar**

```bash
node feriados.js 2026-06-25
node feriados.js 2026-11-08
node feriados.js
```

**Resultado esperado**

```text
2026-06-25 é feriado: Dia da Independência Nacional
2026-11-08 não é feriado
2026-11-08 não é feriado
```

O último comando usa a data de hoje em Maputo.

</details>

<details>

<summary>React (Vite)</summary>

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)&nbsp;

**O que vais fazer:** uma página com um seletor de tipo de feriado que pede à API a lista do tipo escolhido.

**Requisitos:** Node.js 18 ou superior.

**Passo 1. Criar o projecto**

```bash
npm create vite@latest feriados-react -- --template react
cd feriados-react
npm install
```

**Passo 2. Substituir o conteúdo de `src/App.jsx`**

Ficheiro `src/App.jsx`:

```jsx
import { useEffect, useState } from "react"

const BASE = "https://feriadosmz.vercel.app/api/feriados"

const TIPOS = [
  { valor: "nacional", rotulo: "Nacionais" },
  { valor: "municipal", rotulo: "Municipais" },
  { valor: "religioso", rotulo: "Religiosos" },
  { valor: "tolerancia-ponto", rotulo: "Tolerâncias de ponto" }
]

function useFeriados(tipo) {
  const [estado, definirEstado] = useState({ carregando: true, erro: null, feriados: [] })

  useEffect(() => {
    const controlador = new AbortController()
    definirEstado({ carregando: true, erro: null, feriados: [] })

    fetch(`${BASE}/tipo/${tipo}?campos=id,nome,data`, { signal: controlador.signal })
      .then(resposta => resposta.json())
      .then(corpo => {
        if (!corpo.success) throw new Error(corpo.message)
        definirEstado({ carregando: false, erro: null, feriados: corpo.data })
      })
      .catch(erro => {
        if (erro.name !== "AbortError") {
          definirEstado({ carregando: false, erro: erro.message, feriados: [] })
        }
      })

    return () => controlador.abort()
  }, [tipo])

  return estado
}

export default function App() {
  const [tipo, definirTipo] = useState("nacional")
  const { carregando, erro, feriados } = useFeriados(tipo)

  return (
    <main style={{ maxWidth: 640, margin: "2rem auto", padding: "0 1rem", fontFamily: "system-ui" }}>
      <h1>Feriados de Moçambique</h1>

      <label>
        Tipo{" "}
        <select value={tipo} onChange={evento => definirTipo(evento.target.value)}>
          {TIPOS.map(item => (
            <option key={item.valor} value={item.valor}>
              {item.rotulo}
            </option>
          ))}
        </select>
      </label>

      {carregando && <p>A carregar…</p>}
      {erro && <p role="alert">{erro}</p>}

      <ul>
        {feriados.map(feriado => (
          <li key={feriado.id}>
            {feriado.data ?? "Data por confirmar"} - {feriado.nome}
          </li>
        ))}
      </ul>
    </main>
  )
}
```

**URL usada**

```
https://feriadosmz.vercel.app/api/feriados/tipo/nacional?campos=id,nome,data
```

| Parte    | Valor           | O que faz                                  |
| :------- | :-------------- | :----------------------------------------- |
| Rota     | `/tipo/${tipo}` | Muda conforme a opção escolhida no seletor |
| `campos` | `id,nome,data`  | `id` serve de chave da lista no React      |

**Passo 3. Executar**

```bash
npm run dev
```

Abre o endereço que o terminal mostra, normalmente `http://localhost:5173`.

**Resultado esperado**

Em **Nacionais**:

```text
2026-01-01 - Dia da Fraternidade Universal (Ano Novo)
2026-02-03 - Dia dos Heróis Moçambicanos
2026-04-07 - Dia da Mulher Moçambicana
2026-05-01 - Dia Internacional dos Trabalhadores
2026-06-25 - Dia da Independência Nacional
2026-09-07 - Dia da Vitória
2026-09-25 - Dia das Forças Armadas de Defesa de Moçambique (FADM)
2026-10-04 - Dia da Paz e Reconciliação
2026-12-25 - Dia da Família (Natal)
```

Em **Tolerâncias de ponto**, as datas ainda não confirmadas:

```text
Data por confirmar - Eid al-Fitr (Ide)
Data por confirmar - Eid al-Adha (Idul-Adhá)
```

</details>

<details>

<summary>Next.js (App Router)</summary>

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)&nbsp;

**O que vais fazer:** uma página `/feriados` renderizada no servidor, com cache de 24 horas, e uma rota interna que serve de intermediário para o navegador.

**Requisitos:** Node.js 18 ou superior.

**Passo 1. Criar o projecto**

```bash
npx create-next-app@latest feriados-next
cd feriados-next
```

Responde **Yes** a TypeScript e a App Router.

**Passo 2. Criar a função que fala com a API**

Ficheiro `app/lib/feriados.ts`:

```typescript
const BASE = "https://feriadosmz.vercel.app/api/feriados"

export interface Feriado {
  id: number
  nome: string
  data: string | null
  diaSemana: string | null
}

interface Resposta {
  success: boolean
  message?: string
  data: Feriado[]
}

export async function obterFeriados(caminho: string): Promise<Feriado[]> {
  const resposta = await fetch(`${BASE}${caminho}`, { next: { revalidate: 86400 } })
  const corpo: Resposta = await resposta.json()

  if (!resposta.ok || !corpo.success) {
    throw new Error(corpo.message ?? `Erro ${resposta.status}`)
  }

  return corpo.data
}
```

**Passo 3. Criar a página**

Ficheiro `app/feriados/page.tsx`:

```tsx
import { obterFeriados } from "../lib/feriados"

export const metadata = {
  title: "Feriados nacionais de Moçambique"
}

export default async function PaginaFeriados() {
  const feriados = await obterFeriados("/tipo/nacional?ano=2026&campos=id,nome,data,diaSemana")

  return (
    <main>
      <h1>Feriados nacionais de 2026</h1>
      <ul>
        {feriados.map(feriado => (
          <li key={feriado.id}>
            {feriado.data ? `${feriado.data} (${feriado.diaSemana})` : "Data por confirmar"} - {feriado.nome}
          </li>
        ))}
      </ul>
    </main>
  )
}
```

**URL usada**

```
https://feriadosmz.vercel.app/api/feriados/tipo/nacional?ano=2026&campos=id,nome,data,diaSemana
```

| Parte    | Valor                    | O que faz                |
| :------- | :----------------------- | :----------------------- |
| Rota     | `/tipo/nacional`         | Só os feriados nacionais |
| `ano`    | `2026`                   | Datas de 2026            |
| `campos` | `id,nome,data,diaSemana` | Campos de cada feriado   |

**Passo 4. Criar a rota intermediária (opcional, para componentes de cliente)**

Ficheiro `app/api/proximos/route.ts`:

```typescript
import { NextResponse } from "next/server"

export async function GET() {
  const resposta = await fetch("https://feriadosmz.vercel.app/api/feriados/proximos?limite=5&campos=id,nome,data", {
    next: { revalidate: 3600 }
  })
  const corpo = await resposta.json()

  return NextResponse.json(corpo, { status: resposta.status })
}
```

Num componente de cliente, chama `fetch("/api/proximos")`. O pedido vai para o teu próprio domínio e não sofre bloqueios de CORS.

**Passo 5. Executar**

```bash
npm run dev
```

Abre `http://localhost:3000/feriados`.

**Resultado esperado**

```text
Feriados nacionais de 2026

2026-01-01 (Quinta-feira) - Dia da Fraternidade Universal (Ano Novo)
2026-02-03 (Terça-feira) - Dia dos Heróis Moçambicanos
2026-04-07 (Terça-feira) - Dia da Mulher Moçambicana
2026-05-01 (Sexta-feira) - Dia Internacional dos Trabalhadores
2026-06-25 (Quinta-feira) - Dia da Independência Nacional
2026-09-07 (Segunda-feira) - Dia da Vitória
2026-09-25 (Sexta-feira) - Dia das Forças Armadas de Defesa de Moçambique (FADM)
2026-10-04 (Domingo) - Dia da Paz e Reconciliação
2026-12-25 (Sexta-feira) - Dia da Família (Natal)
```

</details>

<details>

<summary>Vue 3 (Vite)</summary>

![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white)&nbsp;

**O que vais fazer:** uma caixa de pesquisa que consulta `/buscar` enquanto escreves.

**Requisitos:** Node.js 18 ou superior.

**Passo 1. Criar o projecto**

```bash
npm create vite@latest feriados-vue -- --template vue
cd feriados-vue
npm install
```

**Passo 2. Substituir o conteúdo de `src/App.vue`**

Ficheiro `src/App.vue`:

```vue
<script setup>
import { onBeforeUnmount, ref, watch } from "vue"

const BASE = "https://feriadosmz.vercel.app/api/feriados"

const termo = ref("independencia")
const feriados = ref([])
const carregando = ref(false)
const erro = ref(null)

let controlador = null
let temporizador = null

async function pesquisar(texto) {
  controlador?.abort()

  if (!texto.trim()) {
    feriados.value = []
    return
  }

  controlador = new AbortController()
  const sinal = controlador.signal
  carregando.value = true
  erro.value = null

  try {
    const url = `${BASE}/buscar?q=${encodeURIComponent(texto)}&campos=id,nome,data`
    const resposta = await fetch(url, { signal: sinal })
    const corpo = await resposta.json()

    if (!corpo.success) throw new Error(corpo.message)
    feriados.value = corpo.data
  } catch (e) {
    if (e.name !== "AbortError") erro.value = e.message
  } finally {
    if (!sinal.aborted) carregando.value = false
  }
}

watch(
  termo,
  valor => {
    clearTimeout(temporizador)
    temporizador = setTimeout(() => pesquisar(valor), 300)
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  clearTimeout(temporizador)
  controlador?.abort()
})
</script>

<template>
  <main>
    <h1>Pesquisar feriados</h1>

    <label for="termo">Palavra</label>
    <input id="termo" v-model="termo" type="search" placeholder="independência, paz, cidade..." />

    <p v-if="carregando">A pesquisar…</p>
    <p v-if="erro" role="alert">{{ erro }}</p>

    <ul>
      <li v-for="feriado in feriados" :key="feriado.id">
        {{ feriado.data ?? "Data por confirmar" }} - {{ feriado.nome }}
      </li>
    </ul>
  </main>
</template>
```

**URL usada**

```
https://feriadosmz.vercel.app/api/feriados/buscar?q=independencia&campos=id,nome,data
```

| Parte    | Valor           | O que faz                                                            |
| :------- | :-------------- | :------------------------------------------------------------------- |
| Rota     | `/buscar`       | Pesquisa por nome ou descrição                                       |
| `q`      | `independencia` | Palavra procurada, sem acento. `encodeURIComponent` codifica o texto |
| `campos` | `id,nome,data`  | Campos de cada resultado                                             |

**Passo 3. Executar**

```bash
npm run dev
```

Abre `http://localhost:5173`.

**Resultado esperado** para `independencia`:

```text
2026-02-03 - Dia dos Heróis Moçambicanos
2026-04-07 - Dia da Mulher Moçambicana
2026-06-25 - Dia da Independência Nacional
2026-09-07 - Dia da Vitória
```

A pesquisa também encontra feriados cuja **descrição** menciona a independência, não só o nome.

</details>

<details>

<summary>React Native (Expo)</summary>

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)&nbsp;

**O que vais fazer:** uma aplicação móvel com a lista dos próximos feriados e puxar-para-actualizar.

**Requisitos:** Node.js 18 ou superior e a aplicação **Expo Go** no telemóvel.

**Passo 1. Criar o projecto**

```bash
npx create-expo-app@latest feriados-mobile --template blank
cd feriados-mobile
```

**Passo 2. Substituir o conteúdo de `App.js`**

Ficheiro `App.js`:

```jsx
import { useCallback, useEffect, useState } from "react"
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native"

const URL_API = "https://feriadosmz.vercel.app/api/feriados/proximos?limite=5&campos=id,nome,data,diaSemana"

export default function App() {
  const [feriados, setFeriados] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [aActualizar, setAActualizar] = useState(false)
  const [erro, setErro] = useState(null)

  const carregar = useCallback(async () => {
    try {
      const resposta = await fetch(URL_API)
      const corpo = await resposta.json()
      if (!corpo.success) throw new Error(corpo.message)
      setFeriados(corpo.data)
      setErro(null)
    } catch (e) {
      setErro(e.message)
    } finally {
      setCarregando(false)
      setAActualizar(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  function actualizar() {
    setAActualizar(true)
    carregar()
  }

  if (carregando) {
    return (
      <View style={estilos.centro}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <View style={estilos.ecra}>
      <Text style={estilos.titulo}>Próximos feriados</Text>
      {erro ? <Text style={estilos.erro}>{erro}</Text> : null}
      <FlatList
        data={feriados}
        keyExtractor={feriado => String(feriado.id)}
        refreshControl={<RefreshControl refreshing={aActualizar} onRefresh={actualizar} />}
        renderItem={({ item }) => (
          <View style={estilos.linha}>
            <Text style={estilos.nome}>{item.nome}</Text>
            <Text style={estilos.data}>{item.data ? `${item.diaSemana}, ${item.data}` : "Data por confirmar"}</Text>
          </View>
        )}
      />
    </View>
  )
}

const estilos = StyleSheet.create({
  ecra: { flex: 1, paddingTop: 64, paddingHorizontal: 20, backgroundColor: "#ffffff" },
  centro: { flex: 1, alignItems: "center", justifyContent: "center" },
  titulo: { fontSize: 26, fontWeight: "700", marginBottom: 16 },
  erro: { color: "#b00020", marginBottom: 12 },
  linha: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#e5e5e5" },
  nome: { fontSize: 16, fontWeight: "600" },
  data: { fontSize: 14, color: "#555555", marginTop: 2 }
})
```

**URL usada**

```
https://feriadosmz.vercel.app/api/feriados/proximos?limite=5&campos=id,nome,data,diaSemana
```

| Parte    | Valor                    | O que faz                          |
| :------- | :----------------------- | :--------------------------------- |
| Rota     | `/proximos`              | Próximos feriados a partir de hoje |
| `limite` | `5`                      | Quantidade de feriados             |
| `campos` | `id,nome,data,diaSemana` | `id` serve de chave da lista       |

**Passo 3. Executar**

```bash
npx expo start
```

Abre o **Expo Go** no telemóvel e lê o código QR que aparece no terminal. O telemóvel e o computador têm de estar na mesma rede.

**Resultado esperado** (a 8 de Novembro de 2026):

```text
Próximos feriados

Dia da Cidade de Maputo
Terça-feira, 2026-11-10

Dia da Cidade de Maxixe
Quarta-feira, 2026-11-18

Dia da Cidade de Manica
Sábado, 2026-12-05

Dia da Família (Natal)
Sexta-feira, 2026-12-25

Dia da Fraternidade Universal (Ano Novo)
Sexta-feira, 2027-01-01
```

</details>

<details>

<summary>Flutter (Dart)</summary>

![Flutter](https://img.shields.io/badge/Flutter-02569B?style=for-the-badge&logo=flutter&logoColor=white)&nbsp;

**O que vais fazer:** uma aplicação com a lista dos próximos feriados e puxar-para-actualizar.

**Requisitos:** Flutter SDK instalado (`flutter doctor` sem erros) e um emulador ou telemóvel ligado.

**Passo 1. Criar o projecto e instalar o pacote `http`**

```bash
flutter create feriados_flutter
cd feriados_flutter
flutter pub add http
```

**Passo 2. Substituir o conteúdo de `lib/main.dart`**

Ficheiro `lib/main.dart`:

```dart
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class Feriado {
  final int id;
  final String nome;
  final String? data;
  final String? diaSemana;

  const Feriado({
    required this.id,
    required this.nome,
    required this.data,
    required this.diaSemana,
  });

  factory Feriado.fromJson(Map<String, dynamic> json) {
    return Feriado(
      id: json['id'] as int,
      nome: json['nome'] as String,
      data: json['data'] as String?,
      diaSemana: json['diaSemana'] as String?,
    );
  }
}

Future<List<Feriado>> proximosFeriados({int limite = 5}) async {
  final uri = Uri.https('feriadosmz.vercel.app', '/api/feriados/proximos', {
    'limite': '$limite',
    'campos': 'id,nome,data,diaSemana',
  });

  final resposta = await http.get(uri);
  final corpo = jsonDecode(utf8.decode(resposta.bodyBytes)) as Map<String, dynamic>;

  if (corpo['success'] != true) {
    throw Exception(corpo['message']);
  }

  return (corpo['data'] as List)
      .map((item) => Feriado.fromJson(item as Map<String, dynamic>))
      .toList();
}

void main() {
  runApp(const AplicacaoFeriados());
}

class AplicacaoFeriados extends StatelessWidget {
  const AplicacaoFeriados({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Feriados MZ',
      theme: ThemeData(colorSchemeSeed: const Color(0xFF0E5E4B), useMaterial3: true),
      home: const PaginaFeriados(),
    );
  }
}

class PaginaFeriados extends StatefulWidget {
  const PaginaFeriados({super.key});

  @override
  State<PaginaFeriados> createState() => _PaginaFeriadosState();
}

class _PaginaFeriadosState extends State<PaginaFeriados> {
  late Future<List<Feriado>> _futuro;

  @override
  void initState() {
    super.initState();
    _futuro = proximosFeriados();
  }

  Future<void> _actualizar() async {
    final novo = proximosFeriados();
    setState(() {
      _futuro = novo;
    });
    try {
      await novo;
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Próximos feriados')),
      body: RefreshIndicator(
        onRefresh: _actualizar,
        child: FutureBuilder<List<Feriado>>(
          future: _futuro,
          builder: (context, snapshot) {
            if (snapshot.connectionState != ConnectionState.done) {
              return const Center(child: CircularProgressIndicator());
            }
            if (snapshot.hasError) {
              return ListView(
                children: [
                  Padding(
                    padding: const EdgeInsets.all(24),
                    child: Text('${snapshot.error}'),
                  ),
                ],
              );
            }
            final feriados = snapshot.data!;
            return ListView.separated(
              itemCount: feriados.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (context, indice) {
                final feriado = feriados[indice];
                return ListTile(
                  title: Text(feriado.nome),
                  subtitle: Text(
                    feriado.data == null
                        ? 'Data por confirmar'
                        : '${feriado.diaSemana}, ${feriado.data}',
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }
}
```

**URL usada**

```
https://feriadosmz.vercel.app/api/feriados/proximos?limite=5&campos=id,nome,data,diaSemana
```

| Parte               | Valor                    | O que faz                                 |
| :------------------ | :----------------------- | :---------------------------------------- |
| Domínio             | `feriadosmz.vercel.app`  | Primeiro argumento de `Uri.https`         |
| Rota                | `/api/feriados/proximos` | Segundo argumento de `Uri.https`          |
| `limite` e `campos` | mapa de parâmetros       | `Uri.https` codifica os parâmetros por ti |

**Passo 3. Executar**

```bash
flutter run
```

> Para publicar no Android, confirma que `android/app/src/main/AndroidManifest.xml` tem `<uses-permission android:name="android.permission.INTERNET" />`.

**Resultado esperado** (a 8 de Novembro de 2026): uma lista com cinco itens, cada um com o nome e a linha `Terça-feira, 2026-11-10`, `Quarta-feira, 2026-11-18`, `Sábado, 2026-12-05`, `Sexta-feira, 2026-12-25` e `Sexta-feira, 2027-01-01`.

</details>

<details>

<summary>Python</summary>

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)&nbsp;

**O que vais fazer:** um comando que mostra os feriados de um mês.

**Requisitos:** Python 3.9 ou superior.

**Passo 1. Criar o ambiente e instalar a biblioteca**

```bash
mkdir feriados-python
cd feriados-python
python -m venv .venv
```

Activar o ambiente:

```bash
source .venv/bin/activate
```

No Windows (PowerShell):

```powershell
.venv\Scripts\Activate.ps1
```

Instalar:

```bash
pip install requests
```

**Passo 2. Criar o ficheiro**

Ficheiro `feriados.py`:

```python
import sys
from datetime import date

import requests

BASE = "https://feriadosmz.vercel.app/api/feriados"


def pedir(caminho, parametros=None):
    resposta = requests.get(f"{BASE}{caminho}", params=parametros, timeout=10)
    corpo = resposta.json()

    if not resposta.ok or not corpo["success"]:
        raise RuntimeError(corpo.get("message", f"Erro {resposta.status_code}"))

    return corpo["data"]


def feriados_do_mes(mes, ano):
    parametros = {"ano": ano, "campos": "nome,dia,diaSemana"}
    feriados = pedir(f"/mes/{mes}", parametros)
    return sorted(feriados, key=lambda feriado: feriado["dia"] or 0)


mes = int(sys.argv[1]) if len(sys.argv) > 1 else date.today().month
ano = int(sys.argv[2]) if len(sys.argv) > 2 else date.today().year

print(f"Feriados de {mes}/{ano}")
for feriado in feriados_do_mes(mes, ano):
    dia = feriado["dia"]
    texto_dia = f"{dia:02d}" if dia is not None else "--"
    semana = feriado["diaSemana"] or "-"
    print(f"{texto_dia}  {semana:<13}  {feriado['nome']}")
```

**URL usada**

```
https://feriadosmz.vercel.app/api/feriados/mes/9?ano=2026&campos=nome,dia,diaSemana
```

| Parte    | Valor                | O que faz                                   |
| :------- | :------------------- | :------------------------------------------ |
| Rota     | `/mes/9`             | Feriados do mês pedido na linha de comandos |
| `ano`    | `2026`               | Ano pedido ou o actual                      |
| `campos` | `nome,dia,diaSemana` | Só o necessário para a tabela               |

`requests` monta e codifica os parâmetros a partir do dicionário.

**Passo 3. Executar**

```bash
python feriados.py 9 2026
```

**Resultado esperado**

```text
Feriados de 9/2026
07  Segunda-feira  Dia da Vitória
16  Quarta-feira   Dia da Cidade de Nacala-Porto
17  Quinta-feira   Dia da Cidade da Ilha de Moçambique
25  Sexta-feira    Dia das Forças Armadas de Defesa de Moçambique (FADM)
```

A lista é ordenada no código, porque não deves assumir uma ordem dos resultados.

</details>

<details>

<summary>PHP (linha de comandos)</summary>

![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)&nbsp;

**O que vais fazer:** um script que lista os feriados de um tipo.

**Requisitos:** PHP 8.0 ou superior com `allow_url_fopen` activo (por omissão está activo).

**Passo 1. Criar a pasta**

```bash
mkdir feriados-php
cd feriados-php
```

**Passo 2. Criar o ficheiro**

Ficheiro `feriados.php`:

```php
<?php

const BASE = "https://feriadosmz.vercel.app/api/feriados";

function pedir(string $caminho): array
{
    $contexto = stream_context_create([
        "http" => [
            "timeout" => 10,
            "ignore_errors" => true,
            "header" => "Accept: application/json\r\n",
        ],
    ]);

    $texto = file_get_contents(BASE . $caminho, false, $contexto);

    if ($texto === false) {
        throw new RuntimeException("Não foi possível contactar a API");
    }

    $corpo = json_decode($texto, true, 512, JSON_THROW_ON_ERROR);

    if (!($corpo["success"] ?? false)) {
        throw new RuntimeException($corpo["message"] ?? "Erro desconhecido");
    }

    return $corpo;
}

$tipo = $argv[1] ?? "nacional";
$corpo = pedir("/tipo/" . rawurlencode($tipo) . "?ano=2026&campos=nome,dia,mesNome");

foreach ($corpo["data"] as $feriado) {
    $data = $feriado["dia"] === null
        ? "Data por confirmar"
        : $feriado["dia"] . " de " . $feriado["mesNome"];

    echo str_pad($data, 20) . $feriado["nome"] . PHP_EOL;
}
```

**URL usada**

```
https://feriadosmz.vercel.app/api/feriados/tipo/nacional?ano=2026&campos=nome,dia,mesNome
```

| Parte    | Valor              | O que faz                          |
| :------- | :----------------- | :--------------------------------- |
| Rota     | `/tipo/nacional`   | Tipo recebido na linha de comandos |
| `ano`    | `2026`             | Datas de 2026                      |
| `campos` | `nome,dia,mesNome` | Campos usados no texto             |

**Passo 3. Executar**

```bash
php feriados.php nacional
```

**Resultado esperado**

```text
1 de Janeiro        Dia da Fraternidade Universal (Ano Novo)
3 de Fevereiro      Dia dos Heróis Moçambicanos
7 de Abril          Dia da Mulher Moçambicana
1 de Maio           Dia Internacional dos Trabalhadores
25 de Junho         Dia da Independência Nacional
7 de Setembro       Dia da Vitória
25 de Setembro      Dia das Forças Armadas de Defesa de Moçambique (FADM)
4 de Outubro        Dia da Paz e Reconciliação
25 de Dezembro      Dia da Família (Natal)
```

Com `php feriados.php tolerancia-ponto`, as datas por confirmar aparecem como `Data por confirmar`.

</details>

<details>

<summary>Laravel</summary>

![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)&nbsp;

**O que vais fazer:** uma página `/feriados` que pede os dados à API no servidor e guarda-os em cache durante 24 horas.

**Requisitos:** PHP 8.2 ou superior e Composer.

**Passo 1. Criar o projecto**

```bash
composer create-project laravel/laravel feriados-laravel
cd feriados-laravel
```

**Passo 2. Criar o serviço**

Ficheiro `app/Services/FeriadosService.php` (cria a pasta `Services` se não existir):

```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class FeriadosService
{
    public function nacionais(int $ano): array
    {
        return Cache::remember("feriados.nacionais.$ano", now()->addDay(), function () use ($ano) {
            $corpo = Http::baseUrl("https://feriadosmz.vercel.app/api/feriados")
                ->timeout(10)
                ->acceptJson()
                ->get("/tipo/nacional", [
                    "ano" => $ano,
                    "campos" => "nome,data,diaSemana",
                ])
                ->throw()
                ->json();

            return $corpo["data"];
        });
    }
}
```

**Passo 3. Registar a rota**

Acrescenta no ficheiro `routes/web.php`:

```php
use App\Services\FeriadosService;
use Illuminate\Support\Facades\Route;

Route::get('/feriados', function (FeriadosService $servico) {
    $ano = 2026;

    return view('feriados', [
        'ano' => $ano,
        'feriados' => $servico->nacionais($ano),
    ]);
});
```

**Passo 4. Criar a vista**

Ficheiro `resources/views/feriados.blade.php`:

```blade
<!doctype html>
<html lang="pt">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Feriados nacionais {{ $ano }}</title>
</head>
<body>
    <h1>Feriados nacionais de {{ $ano }}</h1>
    <ul>
        @foreach ($feriados as $feriado)
            <li>{{ $feriado['data'] ?? 'Data por confirmar' }} - {{ $feriado['nome'] }}</li>
        @endforeach
    </ul>
</body>
</html>
```

**URL usada**

```
https://feriadosmz.vercel.app/api/feriados/tipo/nacional?ano=2026&campos=nome,data,diaSemana
```

| Parte      | Valor                                        | O que faz                             |
| :--------- | :------------------------------------------- | :------------------------------------ |
| `baseUrl`  | `https://feriadosmz.vercel.app/api/feriados` | Prefixo comum                         |
| Rota       | `/tipo/nacional`                             | Só os feriados nacionais              |
| Parâmetros | `ano`, `campos`                              | O Laravel monta e codifica a consulta |

**Passo 5. Executar**

```bash
php artisan serve
```

Abre `http://127.0.0.1:8000/feriados`.

**Resultado esperado**

```text
Feriados nacionais de 2026

2026-01-01 - Dia da Fraternidade Universal (Ano Novo)
2026-02-03 - Dia dos Heróis Moçambicanos
2026-04-07 - Dia da Mulher Moçambicana
2026-05-01 - Dia Internacional dos Trabalhadores
2026-06-25 - Dia da Independência Nacional
2026-09-07 - Dia da Vitória
2026-09-25 - Dia das Forças Armadas de Defesa de Moçambique (FADM)
2026-10-04 - Dia da Paz e Reconciliação
2026-12-25 - Dia da Família (Natal)
```

> Se o Laravel se queixar da cache, define `CACHE_STORE=file` no ficheiro `.env`.

</details>

<details>

<summary>Go</summary>

![Go](https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white)&nbsp;

**O que vais fazer:** um programa que lista os feriados de um mês.

**Requisitos:** Go 1.20 ou superior.

**Passo 1. Criar o módulo**

```bash
mkdir feriados-go
cd feriados-go
go mod init feriados
```

**Passo 2. Criar o ficheiro**

Ficheiro `main.go`:

```go
package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"sort"
	"time"
)

const base = "https://feriadosmz.vercel.app/api/feriados"

type Feriado struct {
	Nome      string  `json:"nome"`
	Dia       *int    `json:"dia"`
	DiaSemana *string `json:"diaSemana"`
}

type Resposta struct {
	Success bool      `json:"success"`
	Message string    `json:"message"`
	Data    []Feriado `json:"data"`
}

func pedir(caminho string) (Resposta, error) {
	cliente := http.Client{Timeout: 10 * time.Second}

	resp, err := cliente.Get(base + caminho)
	if err != nil {
		return Resposta{}, err
	}
	defer resp.Body.Close()

	var corpo Resposta
	if err := json.NewDecoder(resp.Body).Decode(&corpo); err != nil {
		return Resposta{}, err
	}
	if !corpo.Success {
		return Resposta{}, fmt.Errorf("%s", corpo.Message)
	}

	return corpo, nil
}

func main() {
	mes := "9"
	if len(os.Args) > 1 {
		mes = os.Args[1]
	}

	parametros := url.Values{}
	parametros.Set("ano", "2026")
	parametros.Set("campos", "nome,dia,diaSemana")

	corpo, err := pedir("/mes/" + url.PathEscape(mes) + "?" + parametros.Encode())
	if err != nil {
		fmt.Fprintln(os.Stderr, "erro:", err)
		os.Exit(1)
	}

	confirmados := make([]Feriado, 0, len(corpo.Data))
	for _, feriado := range corpo.Data {
		if feriado.Dia != nil && feriado.DiaSemana != nil {
			confirmados = append(confirmados, feriado)
		}
	}

	sort.Slice(confirmados, func(i, j int) bool {
		return *confirmados[i].Dia < *confirmados[j].Dia
	})

	for _, feriado := range confirmados {
		fmt.Printf("%02d  %-13s  %s\n", *feriado.Dia, *feriado.DiaSemana, feriado.Nome)
	}
}
```

**URL usada**

```
https://feriadosmz.vercel.app/api/feriados/mes/9?ano=2026&campos=nome%2Cdia%2CdiaSemana
```

| Parte    | Valor                    | O que faz                                                              |
| :------- | :----------------------- | :--------------------------------------------------------------------- |
| Rota     | `/mes/9`                 | Mês recebido na linha de comandos                                      |
| `ano`    | `2026`                   | Ano das datas                                                          |
| `campos` | `nome%2Cdia%2CdiaSemana` | `url.Values.Encode()` escreve a vírgula como `%2C`, o que a API aceita |

Os campos opcionais são ponteiros (`*int`, `*string`) porque podem ser `null`.

**Passo 3. Executar**

```bash
go run . 9
```

**Resultado esperado**

```text
07  Segunda-feira  Dia da Vitória
16  Quarta-feira   Dia da Cidade de Nacala-Porto
17  Quinta-feira   Dia da Cidade da Ilha de Moçambique
25  Sexta-feira    Dia das Forças Armadas de Defesa de Moçambique (FADM)
```

</details>

<details>

<summary>C# (.NET)</summary>

![C#](https://img.shields.io/badge/C%23-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)&nbsp;

**O que vais fazer:** uma aplicação de consola que lista os feriados de um tipo e trata datas por confirmar.

**Requisitos:** .NET SDK 8 ou superior (`dotnet --version`).

**Passo 1. Criar o projecto**

```bash
dotnet new console -n FeriadosCs
cd FeriadosCs
```

**Passo 2. Substituir o conteúdo de `Program.cs`**

Ficheiro `Program.cs`:

```csharp
using System.Net.Http.Json;
using System.Text.Json.Serialization;

var tipo = args.Length > 0 ? args[0] : "tolerancia-ponto";

using var cliente = new HttpClient
{
    BaseAddress = new Uri("https://feriadosmz.vercel.app/api/feriados/"),
    Timeout = TimeSpan.FromSeconds(10)
};

using var resposta = await cliente.GetAsync($"tipo/{Uri.EscapeDataString(tipo)}?ano=2026&campos=nome,data");
var corpo = await resposta.Content.ReadFromJsonAsync<Resposta>();

if (corpo is null || !corpo.Success)
{
    Console.Error.WriteLine(corpo?.Message ?? $"Erro {(int)resposta.StatusCode}");
    return 1;
}

foreach (var feriado in corpo.Data)
{
    Console.WriteLine($"{feriado.Nome}: {feriado.Data ?? "data por confirmar"}");
}

return 0;

record Feriado(
    [property: JsonPropertyName("nome")] string Nome,
    [property: JsonPropertyName("data")] string? Data);

record Resposta(
    [property: JsonPropertyName("success")] bool Success,
    [property: JsonPropertyName("message")] string? Message,
    [property: JsonPropertyName("data")] List<Feriado> Data);
```

**URL usada**

```
https://feriadosmz.vercel.app/api/feriados/tipo/tolerancia-ponto?ano=2026&campos=nome,data
```

| Parte            | Valor                                         | O que faz                              |
| :--------------- | :-------------------------------------------- | :------------------------------------- |
| `BaseAddress`    | `https://feriadosmz.vercel.app/api/feriados/` | Termina em `/` para a rota ser anexada |
| Rota             | `tipo/tolerancia-ponto`                       | Tipo recebido na linha de comandos     |
| `ano` e `campos` | `2026`, `nome,data`                           | Ano e campos devolvidos                |

**Passo 3. Executar**

```bash
dotnet run
dotnet run -- nacional
```

**Resultado esperado**

```text
Eid al-Fitr (Ide): data por confirmar
Eid al-Adha (Idul-Adhá): data por confirmar
```

```text
Dia da Fraternidade Universal (Ano Novo): 2026-01-01
Dia dos Heróis Moçambicanos: 2026-02-03
Dia da Mulher Moçambicana: 2026-04-07
Dia Internacional dos Trabalhadores: 2026-05-01
Dia da Independência Nacional: 2026-06-25
Dia da Vitória: 2026-09-07
Dia das Forças Armadas de Defesa de Moçambique (FADM): 2026-09-25
Dia da Paz e Reconciliação: 2026-10-04
Dia da Família (Natal): 2026-12-25
```

</details>

<details>

<summary>Google Sheets (Apps Script)</summary>

![Google Sheets](https://img.shields.io/badge/Google_Sheets-34A853?style=for-the-badge&logo=googlesheets&logoColor=white)&nbsp;

**O que vais fazer:** preencher uma folha com os feriados nacionais do ano, com um clique.

**Requisitos:** uma conta Google.

**Passo 1. Criar a folha e abrir o editor de scripts**

1. Cria uma folha nova em https://sheets.new
2. No menu, escolhe **Extensões** e depois **Apps Script**.
3. Apaga o código que aparece.

**Passo 2. Colar o código**

```javascript
function importarFeriados() {
  const ano = 2026
  const url = "https://feriadosmz.vercel.app/api/feriados/tipo/nacional?ano=" + ano + "&campos=nome,data,diaSemana"
  const resposta = UrlFetchApp.fetch(url, { muteHttpExceptions: true })
  const corpo = JSON.parse(resposta.getContentText())

  if (!corpo.success) {
    throw new Error(corpo.message)
  }

  const folha = SpreadsheetApp.getActiveSheet()
  folha.clear()

  const cabecalho = [["Nome", "Data", "Dia da semana"]]
  const linhas = corpo.data.map(feriado => [
    feriado.nome,
    feriado.data || "Data por confirmar",
    feriado.diaSemana || ""
  ])

  folha.getRange(1, 1, 1, 3).setValues(cabecalho).setFontWeight("bold")
  folha.getRange(2, 1, linhas.length, 3).setValues(linhas)
  folha.autoResizeColumns(1, 3)
}
```

**URL usada**

```
https://feriadosmz.vercel.app/api/feriados/tipo/nacional?ano=2026&campos=nome,data,diaSemana
```

| Parte    | Valor                 | O que faz                      |
| :------- | :-------------------- | :----------------------------- |
| Rota     | `/tipo/nacional`      | Só os feriados nacionais       |
| `ano`    | `2026`                | Muda este valor para outro ano |
| `campos` | `nome,data,diaSemana` | Uma coluna para cada campo     |

**Passo 3. Executar**

1. Carrega no ícone de gravar e dá um nome ao projecto.
2. Escolhe a função `importarFeriados` e carrega em **Executar**.
3. Na primeira vez, o Google pede autorização. Aceita.
4. Volta à folha.

**Resultado esperado**

| Nome                                                  | Data       | Dia da semana |
| :---------------------------------------------------- | :--------- | :------------ |
| Dia da Fraternidade Universal (Ano Novo)              | 2026-01-01 | Quinta-feira  |
| Dia dos Heróis Moçambicanos                           | 2026-02-03 | Terça-feira   |
| Dia da Mulher Moçambicana                             | 2026-04-07 | Terça-feira   |
| Dia Internacional dos Trabalhadores                   | 2026-05-01 | Sexta-feira   |
| Dia da Independência Nacional                         | 2026-06-25 | Quinta-feira  |
| Dia da Vitória                                        | 2026-09-07 | Segunda-feira |
| Dia das Forças Armadas de Defesa de Moçambique (FADM) | 2026-09-25 | Sexta-feira   |
| Dia da Paz e Reconciliação                            | 2026-10-04 | Domingo       |
| Dia da Família (Natal)                                | 2026-12-25 | Sexta-feira   |

**Passo 4 (opcional). Actualizar automaticamente**

No editor, abre **Acionadores**, cria um acionador para `importarFeriados` baseado em tempo, por exemplo uma vez por mês.

</details>

##

<div align='center'>

### <a href='#topo'>Ir ao topo</a>

</div>

##

## 10. Casos práticos

Cada caso prático indica o ficheiro, a URL e o resultado. Os ficheiros `.mjs` correm com `node ficheiro.mjs` (Node.js 18 ou superior).

<details>

<summary>Contagem decrescente para o próximo feriado</summary>

Ficheiro `contagem.mjs`:

```javascript
const URL_API = "https://feriadosmz.vercel.app/api/feriados/proximos?limite=1&campos=nome,data"

const resposta = await fetch(URL_API)
const { data } = await resposta.json()
const [proximo] = data

const hoje = new Date(new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Maputo" }).format(new Date()))
const alvo = new Date(proximo.data)
const dias = Math.round((alvo - hoje) / 86400000)

console.log(`Faltam ${dias} dias para ${proximo.nome}`)
```

| Parte    | Valor       | O que faz         |
| :------- | :---------- | :---------------- |
| Rota     | `/proximos` | Próximos feriados |
| `limite` | `1`         | Só o primeiro     |
| `campos` | `nome,data` | Nome e data       |

Resultado a 8 de Novembro de 2026:

```text
Faltam 2 dias para Dia da Cidade de Maputo
```

</details>

<details>

<summary>Verificar se uma data é dia útil</summary>

Ficheiro `dia-util.mjs`:

```javascript
const BASE = "https://feriadosmz.vercel.app/api/feriados"

async function ehDiaUtil(data) {
  const diaSemana = new Date(`${data}T00:00:00Z`).getUTCDay()
  if (diaSemana === 0 || diaSemana === 6) return false

  const resposta = await fetch(`${BASE}?ano=${data.slice(0, 4)}&campos=data,tipo`)
  const { data: feriados } = await resposta.json()

  return !feriados.some(feriado => feriado.data === data && feriado.tipo !== "tolerancia_ponto")
}

console.log("2026-06-25:", await ehDiaUtil("2026-06-25"))
console.log("2026-06-26:", await ehDiaUtil("2026-06-26"))
console.log("2026-06-27:", await ehDiaUtil("2026-06-27"))
```

| Parte    | Valor           | O que faz                                   |
| :------- | :-------------- | :------------------------------------------ |
| Rota     | `/api/feriados` | Todos os feriados do ano                    |
| `ano`    | `2026`          | Extraído da data verificada                 |
| `campos` | `data,tipo`     | `tipo` permite ignorar tolerâncias de ponto |

Resultado:

```text
2026-06-25: false
2026-06-26: true
2026-06-27: false
```

25 de Junho é feriado nacional e 27 de Junho é sábado.

</details>

<details>

<summary>Aviso do próximo feriado num bot do Telegram</summary>

**Requisitos:** um bot criado com o **@BotFather** (guarda o token) e o teu identificador de conversa.

Ficheiro `telegram.mjs`:

```javascript
const BASE = "https://feriadosmz.vercel.app/api/feriados"
const TOKEN = process.env.TELEGRAM_TOKEN
const CHAT = process.env.TELEGRAM_CHAT

async function avisarProximoFeriado() {
  const resposta = await fetch(`${BASE}/proximos?limite=1&campos=nome,data,diaSemana`)
  const corpo = await resposta.json()
  if (!corpo.success) throw new Error(corpo.message)

  const [feriado] = corpo.data
  const texto = `Próximo feriado: ${feriado.nome}\n${feriado.diaSemana}, ${feriado.data}`

  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: CHAT, text: texto })
  })
}

await avisarProximoFeriado()
```

Executar:

```bash
TELEGRAM_TOKEN="o-teu-token" TELEGRAM_CHAT="o-teu-chat" node telegram.mjs
```

Mensagem recebida a 8 de Novembro de 2026:

```text
Próximo feriado: Dia da Cidade de Maputo
Terça-feira, 2026-11-10
```

Para enviar todos os dias, agenda o comando com `cron` (Linux e macOS) ou com o Agendador de Tarefas (Windows).

</details>

<details>

<summary>Calendário mensal com feriados</summary>

Ficheiro `calendario.mjs`:

```javascript
const mes = 9
const ano = 2026
const url = `https://feriadosmz.vercel.app/api/feriados/mes/${mes}?ano=${ano}&campos=nome,dia`

const { data } = await (await fetch(url)).json()
const porDia = Object.fromEntries(data.map(feriado => [feriado.dia, feriado.nome]))

const diasNoMes = new Date(ano, mes, 0).getDate()
for (let dia = 1; dia <= diasNoMes; dia++) {
  console.log(String(dia).padStart(2, "0"), porDia[dia] ?? "")
}
```

| Parte    | Valor      | O que faz                                    |
| :------- | :--------- | :------------------------------------------- |
| Rota     | `/mes/9`   | Feriados de Setembro                         |
| `ano`    | `2026`     | Ano do calendário                            |
| `campos` | `nome,dia` | `dia` serve de chave para o objecto `porDia` |

Resultado (excerto):

```text
06
07 Dia da Vitória
08
...
16 Dia da Cidade de Nacala-Porto
17 Dia da Cidade da Ilha de Moçambique
18
...
25 Dia das Forças Armadas de Defesa de Moçambique (FADM)
26
```

</details>

<details>

<summary>Pesquisa com sugestões</summary>

Ficheiro `pesquisa.mjs`:

```javascript
async function pesquisar(termo) {
  const url = `https://feriadosmz.vercel.app/api/feriados/buscar?q=${encodeURIComponent(termo)}&campos=id,nome,data`
  const corpo = await (await fetch(url)).json()
  return corpo.success ? corpo.data : []
}

console.log(await pesquisar("independencia"))
```

| Parte    | Valor           | O que faz                                             |
| :------- | :-------------- | :---------------------------------------------------- |
| Rota     | `/buscar`       | Pesquisa em nome e descrição                          |
| `q`      | `independencia` | Termo sem acento, codificado com `encodeURIComponent` |
| `campos` | `id,nome,data`  | Campos de cada resultado                              |

Resultado:

```text
[
  { id: 2, nome: 'Dia dos Heróis Moçambicanos', data: '2026-02-03' },
  { id: 3, nome: 'Dia da Mulher Moçambicana', data: '2026-04-07' },
  { id: 5, nome: 'Dia da Independência Nacional', data: '2026-06-25' },
  { id: 6, nome: 'Dia da Vitória', data: '2026-09-07' }
]
```

</details>

##

<div align='center'>

### <a href='#topo'>Ir ao topo</a>

</div>

##

## 11. Boas práticas

- [x] Pede só os campos de que precisas. `descricao` e `imagens` são os mais pesados.
- [x] Trata `data: null` nos feriados móveis sem data confirmada ([guia](#11-como-tratar-datas-nulas)).
- [x] Envia sempre `ano` em calendários. Sem ele, a resposta muda quando o ano vira em Maputo.
- [x] Guarda a resposta em cache durante algumas horas. Os dados mudam raramente.
- [x] Codifica os parâmetros com `encodeURIComponent`: `Zambézia` passa a `Zamb%C3%A9zia`.
- [x] Verifica `success` e o estado HTTP antes de usar `data`.
- [x] Não assumas a ordem dos resultados. Ordena no teu código.
- [x] Separa feriados de tolerâncias de ponto filtrando por `tipo`.

> Tolerância de ponto não é feriado obrigatório. Filtra por `tipo=nacional` se precisas só dos feriados oficiais.

##

<div align='center'>

### <a href='#topo'>Ir ao topo</a>

</div>

##

## 12. Correr localmente

Requisitos: **Node.js 20** ou superior.

```bash
git clone https://github.com/heliocarlitos/api-feriados-mocambique.git
cd api-feriados-mocambique
npm install
npm run dev
```

| Serviço      | Endereço                             |
| :----------- | :----------------------------------- |
| Site         | `http://localhost:3000`              |
| API          | `http://localhost:3000/api/feriados` |
| Documentação | `http://localhost:3000/doc`          |

Para usar a tua cópia local nos exemplos, troca `https://feriadosmz.vercel.app` por `http://localhost:3000`.

Validar os dados:

```bash
node src/dados/validar.mjs
```

##

<div align='center'>

### <a href='#topo'>Ir ao topo</a>

</div>

##

## 13. Estrutura do projecto

```text
src/
├── app/
│   ├── (public)/doc/               página de documentação
│   ├── (public)/feriados/[tipo]/   páginas por tipo e por feriado
│   └── api/feriados/               rotas da API
├── biblioteca/                     datas, campos, validação e respostas
├── components/                     componentes e estilos
└── dados/
    ├── feriados.json               conjunto de dados
    ├── feriados.schema.json        esquema JSON
    └── validar.mjs                 validação dos dados
public/                             favicon, tema, logótipo e imagens
```

##

<div align='center'>

### <a href='#topo'>Ir ao topo</a>

</div>

##

## 14. Contribuir

1. Faz um fork do repositório e cria um ramo para a tua alteração.
2. Edita `src/dados/feriados.json` seguindo `feriados.schema.json`.
3. Corre `node src/dados/validar.mjs` e corrige os erros.
4. Abre um pull request com a fonte oficial da informação.

Antes de abrir o pull request:

- [ ] Usei o próximo `id` livre
- [ ] Actualizei `meta.total`
- [ ] A validação passou sem erros
- [ ] Indiquei a fonte da informação

##

<div align='center'>

### <a href='#topo'>Ir ao topo</a>

</div>

##

## 15. Fontes e licença

**Fontes dos dados**

- Lei n.º 13/2023, de 25 de Agosto (Lei do Trabalho)
- CTA, Feriados em Moçambique (2025)
- Wikipedia, Public holidays in Mozambique
- Embaixada da Bélgica, Feriados 2026
- Jornal Notícias, Tolerâncias de ponto (2025)

**Licença**

Distribuído sob a licença **MIT**.

**Autor**

[Hélio Carlitos](https://github.com/heliocarlitos/)

<br/>

<div align='center'>

<sub>Feito em Moçambique · dados validados com `validar.mjs`</sub>

<p align='center'>
<a href='https://feriadosmz.vercel.app/doc' target='_blank'>Documentação online</a> · <a href='https://github.com/heliocarlitos/api-feriados-mocambique' target='_blank'>Repositório</a>
</p>

### <a href='#topo'>Ir ao topo</a>

</div>

<a href='#' id='fundo'></a>
