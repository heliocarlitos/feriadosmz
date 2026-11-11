import { z } from "zod"
import { dominiosDescartaveis } from "./descartaveis"
import { dominiosExtra } from "./descartaveis-extra"

export const limites = { nome: 100, email: 254, assunto: 120, mensagem: 1000 } as const

/** Motivos do contacto. Servem de sugestão no formulário e de etiqueta no assunto do e-mail. */
export const MOTIVOS = [
  {
    id: "dados",
    rotulo: "Corrigir dados",
    assunto: "Ex.: o Dia da Vitória está com a data errada",
    mensagem: "Indica o feriado, a data correcta e a fonte (lei, despacho ou boletim)."
  },
  {
    id: "feriado",
    rotulo: "Sugerir feriado",
    assunto: "Ex.: falta o feriado municipal de…",
    mensagem: "Diz o nome, a data, o âmbito (nacional, provincial ou municipal) e o diploma que o institui."
  },
  {
    id: "integracao",
    rotulo: "Integração",
    assunto: "Ex.: dúvida sobre o parâmetro ?campos=",
    mensagem: "Conta o que estás a construir e o que gostarias que a API fizesse."
  },
  {
    id: "outro",
    rotulo: "Outro assunto",
    assunto: "Sobre o que queres falar?",
    mensagem: "Escreve a tua mensagem."
  }
] as const

export type MotivoId = (typeof MOTIVOS)[number]["id"]

const controlo = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2028\u2029\uFEFF]/g

export const higienizar = (valor: string, multilinha = false) => {
  const base = valor.normalize("NFKC").replace(controlo, "")
  if (multilinha) {
    return base
      .replace(/\r\n?/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  }
  return base.replace(/\s+/g, " ").trim()
}

const padroesAleatorios = [/^[a-z]{3,14}-[a-z]{3,14}\d{2,4}-[0-9a-f]{6,12}$/, /^(?=.*\d)(?=.*[a-f])[0-9a-f]{10,}$/]

export const emailDescartavel = (email: string) => {
  const [local = "", dominio = ""] = email.split("@")
  const partes = dominio.split(".")
  for (let i = 0; i < partes.length - 1; i++) {
    const sufixo = partes.slice(i).join(".")
    if (dominiosDescartaveis.has(sufixo) || dominiosExtra.has(sufixo)) return true
  }
  return padroesAleatorios.some(p => p.test(local))
}

const regexEmail = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/

const emailSintaxeValida = (email: string) => {
  const [local = "", dominio = ""] = email.split("@")
  if (local.length === 0 || local.length > 64) return false
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) return false
  const tld = dominio.split(".").pop() ?? ""
  return /^[a-z]{2,24}$/.test(tld)
}

const nome = z
  .string()
  .transform(v => higienizar(v))
  .pipe(
    z
      .string()
      .min(3, "Indica o teu nome completo.")
      .max(limites.nome, "O nome é demasiado longo.")
      .regex(/^[\p{L}\p{M}][\p{L}\p{M}'’.\- ]*$/u, "O nome só pode ter letras, espaços, apóstrofos e hífens.")
      .refine(v => v.includes(" "), "Indica nome e apelido.")
  )

const email = z
  .string()
  .transform(v => higienizar(v).toLowerCase())
  .pipe(
    z
      .string()
      .min(1, "Indica o teu e-mail.")
      .max(limites.email, "O e-mail é demasiado longo.")
      .regex(regexEmail, "Indica um e-mail válido.")
      .refine(emailSintaxeValida, "Indica um e-mail válido.")
      .refine(v => !emailDescartavel(v), "E-mails temporários não são aceites.")
  )

const assunto = z
  .string()
  .transform(v => higienizar(v))
  .pipe(z.string().min(3, "Indica o assunto.").max(limites.assunto, "O assunto é demasiado longo."))

const mensagem = z
  .string()
  .transform(v => higienizar(v, true))
  .pipe(
    z
      .string()
      .min(10, "Escreve pelo menos 10 caracteres.")
      .max(limites.mensagem, "A mensagem excede 1000 caracteres.")
      .refine(v => (v.match(/https?:\/\//gi) ?? []).length <= 2, "A mensagem tem demasiadas ligações.")
  )

const motivo = z.enum(MOTIVOS.map(m => m.id) as [MotivoId, ...MotivoId[]], { message: "Escolhe um motivo válido." })

/** Campos de texto, validados um a um no formulário. */
export const esquemas = { nome, email, assunto, mensagem }

export type CampoNome = keyof typeof esquemas

export const campos: readonly CampoNome[] = ["nome", "email", "assunto", "mensagem"]

export const esquemaContacto = z.object({ motivo, ...esquemas })

export const validarCampo = (campo: CampoNome, valor: string): string | null => {
  const resultado = esquemas[campo].safeParse(valor)
  if (resultado.success) return null
  return resultado.error.issues[0]?.message ?? "Valor inválido."
}
