export function iniciarCarregamento() {
  window.dispatchEvent(new Event("carregamento:iniciar"))
}

export function terminarCarregamento() {
  window.dispatchEvent(new Event("carregamento:terminar"))
}
