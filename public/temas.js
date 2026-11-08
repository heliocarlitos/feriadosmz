// Aplica o tema guardado antes da primeira pintura, para evitar o flash de tema errado.
(function () {
  try {
    var guardado = localStorage.getItem("tema")
    if (guardado === "claro" || guardado === "escuro") {
      document.documentElement.dataset.tema = guardado
    }
  } catch (erro) {}
})()
