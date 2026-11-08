import { lerCamposOpcionais, projetar } from "@/biblioteca/campos"
import { hojeEmMaputo } from "@/biblioteca/datas"
import { feriadosDeHoje, proximosFeriados } from "@/biblioteca/feriados"
import { falha, sucesso } from "@/biblioteca/respostas"

export const dynamic = "force-dynamic"

export function GET(pedido: Request) {
  const campos = lerCamposOpcionais(new URL(pedido.url).searchParams)
  if (!campos.valido) return falha(400, campos.mensagem)

  const hoje = hojeEmMaputo()
  const feriados = feriadosDeHoje(hoje)

  if (feriados.length > 0) {
    return sucesso({
      isFeriado: true,
      data: feriados.map(feriado => projetar(feriado, campos.valor)),
      message: `Hoje é ${feriados.map(feriado => feriado.nome).join(", ")}!`
    })
  }

  return sucesso({
    isFeriado: false,
    message: "Hoje não é feriado",
    proximosFeriados: proximosFeriados(3, hoje).map(feriado => projetar(feriado, campos.valor))
  })
}
