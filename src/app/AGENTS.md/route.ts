import { readFileSync } from "node:fs"
import { join } from "node:path"

export const dynamic = "force-static"

export async function GET() {
  const texto = readFileSync(join(process.cwd(), "AGENTS.md"), "utf8")

  return new Response(texto, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800"
    }
  })
}
