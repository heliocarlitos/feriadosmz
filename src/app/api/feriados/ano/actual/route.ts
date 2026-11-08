import { obterAnoActual } from "@/biblioteca/datas"
import { sucesso } from "@/biblioteca/respostas"

export const dynamic = "force-dynamic"

export function GET() {
  return sucesso({ ano: obterAnoActual() })
}
