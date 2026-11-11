import { MOTIVOS, esquemaContacto } from "@/biblioteca/contacto"
import { ehRobo, entregar, escapar, falhaValidacao, lerPedido, resposta, verificarEmail } from "@/biblioteca/email"

// nodemailer e dns só existem no ambiente Node.js
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(pedido: Request) {
  const leitura = await lerPedido(pedido)
  if (!leitura.ok) return leitura.resposta

  const { ip, corpo } = leitura

  // Os robôs recebem um "sucesso" para não saberem que foram detectados.
  if (ehRobo(corpo)) return resposta({ ok: true })

  const analise = esquemaContacto.safeParse(corpo)
  if (!analise.success) return falhaValidacao(analise.error.issues)

  const dados = analise.data

  const emailInvalido = await verificarEmail(dados.email)
  if (emailInvalido) return emailInvalido

  const rotuloMotivo = MOTIVOS.find(motivo => motivo.id === dados.motivo)?.rotulo ?? "Contacto"

  const texto = [`Motivo: ${rotuloMotivo}`, `Nome: ${dados.nome}`, `E-mail: ${dados.email}`, "", dados.mensagem].join("\n")

  // HTML sem estilos: o essencial para ler a mensagem em qualquer cliente de e-mail.
  const html =
    `<p><strong>Motivo:</strong> ${escapar(rotuloMotivo)}<br>` +
    `<strong>Nome:</strong> ${escapar(dados.nome)}<br>` +
    `<strong>E-mail:</strong> ${escapar(dados.email)}</p>` +
    `<p>${escapar(dados.mensagem).replace(/\n/g, "<br>")}</p>`

  return entregar(ip, {
    replyTo: { name: dados.nome, address: dados.email },
    subject: `[Feriados MZ · ${rotuloMotivo}] ${dados.assunto}`,
    text: texto,
    html
  })
}
