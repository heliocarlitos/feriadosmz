import { useEffect, useState } from "react"
import { obterJson } from "@/biblioteca/cliente"

interface Corpo<T> {
  success: boolean
  message?: string
  data?: T
}

export interface EstadoPedido<T> {
  estado: "ocioso" | "carregando" | "pronto" | "erro"
  dados: T | null
  mensagem: string | null
}

export function usePedido<T>(caminho: string | null, tentativa = 0): EstadoPedido<T> {
  const [resultado, definirResultado] = useState<EstadoPedido<T>>({ estado: "ocioso", dados: null, mensagem: null })

  useEffect(() => {
    if (caminho === null) {
      definirResultado({ estado: "ocioso", dados: null, mensagem: null })
      return
    }

    let activo = true
    definirResultado(anterior => ({ estado: "carregando", dados: anterior.dados, mensagem: null }))

    obterJson<Corpo<T>>(caminho)
      .then(corpo => {
        if (!activo) return
        if (!corpo.success || corpo.data === undefined) throw new Error(corpo.message ?? "Resposta inválida da API")
        definirResultado({ estado: "pronto", dados: corpo.data, mensagem: null })
      })
      .catch((erro: unknown) => {
        if (!activo) return
        definirResultado({ estado: "erro", dados: null, mensagem: erro instanceof Error ? erro.message : "Não foi possível contactar a API" })
      })

    return () => {
      activo = false
    }
  }, [caminho, tentativa])

  return resultado
}
