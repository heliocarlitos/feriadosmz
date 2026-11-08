import type { Token } from "@/biblioteca/realce"

export default function CodigoRealcado({ tokens }: { tokens: Token[] }) {
  return (
    <>
      {tokens.map((token, indice) =>
        token.tipo === "normal" ? (
          token.valor
        ) : (
          <span key={indice} className={`t-${token.tipo}`}>
            {token.valor}
          </span>
        )
      )}
    </>
  )
}
