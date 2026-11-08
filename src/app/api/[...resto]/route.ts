import { falha } from "@/biblioteca/respostas"

/** Qualquer rota /api/... que não exista devolve JSON em vez da página 404 do site. */
export function GET() {
  return falha(404, "Rota não encontrada")
}
