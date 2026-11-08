import { CAMPOS_FERIADO, INFORMACAO_CAMPOS } from "@/biblioteca/campos"
import { sucesso } from "@/biblioteca/respostas"

export function GET() {
  return sucesso({
    data: CAMPOS_FERIADO.map(campo => ({ campo, ...INFORMACAO_CAMPOS[campo] })),
    total: CAMPOS_FERIADO.length
  })
}
