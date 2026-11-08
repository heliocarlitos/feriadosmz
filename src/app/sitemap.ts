import type { MetadataRoute } from "next"
import { caminhoFeriado, caminhoTipo } from "@/biblioteca/apresentacao"
import { obterAnoActual } from "@/biblioteca/datas"
import { CAMINHO_DOCUMENTACAO, SITE_URL } from "@/biblioteca/documentacao"
import { listarFeriados } from "@/biblioteca/feriados"
import { TIPOS_FERIADO } from "@/biblioteca/tipos"

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE_URL, changeFrequency: "monthly", priority: 1 }, { url: `${SITE_URL}${CAMINHO_DOCUMENTACAO}`, changeFrequency: "monthly", priority: 0.9 }, ...TIPOS_FERIADO.map(tipo => ({ url: `${SITE_URL}${caminhoTipo(tipo)}`, changeFrequency: "monthly" as const, priority: 0.7 })), ...listarFeriados(obterAnoActual()).map(feriado => ({ url: `${SITE_URL}${caminhoFeriado(feriado)}`, changeFrequency: "yearly" as const, priority: 0.5 }))]
}
