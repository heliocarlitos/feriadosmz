/** Resposta de sucesso: { success: true, ...corpo } */
export function sucesso<T extends object>(corpo: T, estado = 200): Response {
  return Response.json({ success: true, ...corpo }, { status: estado })
}

/** Resposta de erro: { success: false, message } */
export function falha(estado: number, mensagem: string): Response {
  return Response.json({ success: false, message: mensagem }, { status: estado })
}

export const MENSAGEM_NAO_ENCONTRADO = "Feriado não encontrado"
