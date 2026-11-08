@'

# AGENTS.md

## Visão geral do projecto

API REST e site público com os feriados de Moçambique. Construído em Next.js 16 com App Router, TypeScript e CSS puro. Os dados vivem num ficheiro JSON versionado em `src/dados/feriados.json` e são validados por um script Node sem dependências.

- Domínio em produção: `https://feriadosmz.vercel.app`
- Repositório: `https://github.com/heliocarlitos/feriadosmz`
- Licença: MIT
- Autor: Hélio Carlitos

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript 5
- CSS puro com `light-dark()` e `oklch()`
- Node.js 20 ou superior
- Sem base de dados, sem ORM, sem autenticação

## Estrutura de pastas

```text
src/
├── app/
│   ├── (public)/doc/               página de documentação
│   ├── (public)/feriados/[tipo]/   páginas por tipo e por feriado
│   ├── api/feriados/               rotas da API
│   ├── AGENTS.md/route.ts          serve este ficheiro em /AGENTS.md
│   ├── globals.css                 estilos globais e variáveis de tema
│   ├── layout.tsx                  layout raiz
│   ├── page.tsx                    página inicial
│   ├── robots.ts                   robots.txt
│   └── sitemap.ts                  sitemap.xml
├── biblioteca/                     lógica partilhada (datas, campos, validação, respostas)
├── components/                     componentes e estilos
│   ├── ui/header/                  cabeçalho
│   ├── ui/botaotema/               botão de tema
│   ├── ui/barracarregamento/       barra de carregamento
│   ├── documentacao/               componentes da documentação
│   ├── feriados/                   listagens
│   ├── detalhe/                    página de detalhe
│   ├── cartaoferiado/              cartão de feriado
│   ├── imagem/                     imagens com fallback
│   └── partilha/                   botões de partilha
└── dados/
    ├── feriados.json               conjunto de dados
    ├── feriados.schema.json        esquema JSON
    └── validar.mjs                 validação dos dados
public/
├── favicon.webp
├── logo.webp
├── logo-png.png
├── tema.js
├── llms.txt
└── images/
    ├── image_default.webp
    └── feriados/
```
