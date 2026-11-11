import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import type { SendMailOptions } from "nodemailer"
import MailChecker from "mailchecker"
import { promises as dns } from "node:dns"

const lerEnv = (nome: string) => {
  const valor = process.env[nome]
  if (!valor) return ""
  return valor
    .trim()
    .replace(/^["']+|["']+$/g, "")
    .trim()
}

export const DESTINO = lerEnv("EMAIL_DESTINO") || "hutautadev@gmail.com"

const JANELA = 10 * 60 * 1000
const TAMANHO_MAXIMO = 12000

const cabecalhos = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" }

export const resposta = (corpo: Record<string, unknown>, status = 200) => NextResponse.json(corpo, { status, headers: cabecalhos })

const criarLimite = (maximo: number) => {
  const mapa = new Map<string, number[]>()
  const atuais = (ip: string) => {
    const agora = Date.now()
    const validas = (mapa.get(ip) ?? []).filter(t => agora - t < JANELA)
    if (validas.length > 0) mapa.set(ip, validas)
    else mapa.delete(ip)
    return validas
  }
  return {
    excedeu: (ip: string) => atuais(ip).length >= maximo,
    registar: (ip: string) => {
      mapa.set(ip, [...atuais(ip), Date.now()])
    }
  }
}

const tentativas = criarLimite(25)
const envios = criarLimite(3)

const obterIp = (req: Request) => (req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "desconhecido").slice(0, 64)

const mesmaOrigem = (req: Request) => {
  try {
    const origem = req.headers.get("origin")
    const anfitriao = req.headers.get("x-forwarded-host") ?? req.headers.get("host")
    if (!origem || !anfitriao) return false
    return new URL(origem).host === anfitriao
  } catch {
    return false
  }
}

export const escapar = (texto: string) => texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;")

export type Leitura = { ok: true; ip: string; corpo: Record<string, unknown> } | { ok: false; resposta: NextResponse }

export const lerPedido = async (req: Request): Promise<Leitura> => {
  if (!mesmaOrigem(req)) return { ok: false, resposta: resposta({ ok: false, mensagem: "Pedido não autorizado." }, 403) }

  if (!(req.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) {
    return { ok: false, resposta: resposta({ ok: false, mensagem: "Formato inválido." }, 415) }
  }

  const ip = obterIp(req)
  if (tentativas.excedeu(ip) || envios.excedeu(ip)) {
    return { ok: false, resposta: resposta({ ok: false, mensagem: "Demasiados pedidos. Tenta novamente dentro de alguns minutos." }, 429) }
  }
  tentativas.registar(ip)

  const texto = await req.text()
  if (texto.length > TAMANHO_MAXIMO) return { ok: false, resposta: resposta({ ok: false, mensagem: "Pedido demasiado grande." }, 413) }

  let corpo: unknown
  try {
    corpo = JSON.parse(texto)
  } catch {
    return { ok: false, resposta: resposta({ ok: false, mensagem: "Pedido inválido." }, 400) }
  }

  if (typeof corpo !== "object" || corpo === null || Array.isArray(corpo)) {
    return { ok: false, resposta: resposta({ ok: false, mensagem: "Pedido inválido." }, 400) }
  }

  return { ok: true, ip, corpo: corpo as Record<string, unknown> }
}

/** Campo-armadilha preenchido, ou formulário enviado depressa demais para ter sido preenchido por uma pessoa. */
export const ehRobo = (corpo: Record<string, unknown>) => {
  if (typeof corpo.website === "string" && corpo.website.length > 0) return true
  const iniciado = typeof corpo.iniciado === "number" ? corpo.iniciado : 0
  return !iniciado || Date.now() - iniciado < 2500
}

export const falhaValidacao = (problemas: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message: string }>) => {
  const erros: Record<string, string> = {}
  for (const problema of problemas) {
    const chave = String(problema.path[0] ?? "geral")
    if (!erros[chave]) erros[chave] = problema.message
  }
  return resposta({ ok: false, erros, mensagem: "Corrige os campos assinalados." }, 422)
}

const dominioRecebeEmail = async (dominio: string) => {
  let temporizador: ReturnType<typeof setTimeout> | undefined
  const limite = new Promise<never>((_, rejeitar) => {
    temporizador = setTimeout(() => rejeitar(new Error("tempo")), 4000)
  })
  try {
    const registosMx = await Promise.race([dns.resolveMx(dominio), limite])
    return registosMx.some(r => r.exchange && r.exchange !== ".")
  } catch (erro) {
    const codigo = (erro as NodeJS.ErrnoException).code
    return !(codigo === "ENOTFOUND" || codigo === "ENODATA")
  } finally {
    if (temporizador) clearTimeout(temporizador)
  }
}

export const verificarEmail = async (email: string) => {
  if (!MailChecker.isValid(email)) {
    return resposta({ ok: false, erros: { email: "E-mails temporários não são aceites." }, mensagem: "Corrige os campos assinalados." }, 422)
  }
  if (!(await dominioRecebeEmail(email.split("@")[1]))) {
    return resposta({ ok: false, erros: { email: "Este domínio de e-mail não existe." }, mensagem: "Corrige os campos assinalados." }, 422)
  }
  return null
}

const enviarEmail = async (utilizador: string, senha: string, mensagem: SendMailOptions) => {
  const enderecos = await dns.resolve4("smtp.gmail.com").catch(() => [] as string[])
  const anfitrioes = [...enderecos.slice(0, 1), "smtp.gmail.com"]
  const portas = [
    { port: 465, secure: true },
    { port: 587, secure: false }
  ]

  for (const host of anfitrioes) {
    for (const porta of portas) {
      const transporte = nodemailer.createTransport({
        host,
        port: porta.port,
        secure: porta.secure,
        requireTLS: !porta.secure,
        auth: { user: utilizador, pass: senha },
        tls: { servername: "smtp.gmail.com" },
        connectionTimeout: 6000,
        greetingTimeout: 6000,
        socketTimeout: 20000
      })
      try {
        await transporte.sendMail(mensagem)
        transporte.close()
        return true
      } catch (erro) {
        transporte.close()
        const e = erro as NodeJS.ErrnoException
        console.error("[email] falha SMTP", host, porta.port, e.code, e.message)
        if (e.code === "EAUTH") return false
      }
    }
  }
  return false
}

export const entregar = async (ip: string, mensagem: Omit<SendMailOptions, "from" | "to">) => {
  const utilizador = lerEnv("SMTP_USER")
  const palavraPasse = lerEnv("SMTP_PASS").replace(/\s+/g, "")

  if (!utilizador || !palavraPasse) {
    console.error("[email] variáveis de ambiente em falta", {
      SMTP_USER: Boolean(utilizador),
      SMTP_PASS: Boolean(palavraPasse),
      ambiente: process.env.VERCEL_ENV ?? process.env.NODE_ENV
    })
    return resposta({ ok: false, mensagem: "Serviço de e-mail indisponível." }, 500)
  }

  const enviado = await enviarEmail(utilizador, palavraPasse, {
    from: { name: "Formulário Feriados MZ", address: utilizador },
    to: DESTINO,
    ...mensagem
  })

  if (!enviado) return resposta({ ok: false, mensagem: "Não foi possível enviar agora. Tenta novamente mais tarde." }, 502)

  envios.registar(ip)
  return resposta({ ok: true })
}
