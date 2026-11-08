// El callback avisa que el saludo terminó y permite iniciar la siguiente operación.
function saludar(nombre, alTerminar) {
  setTimeout(() => {
    console.log("Hola, " + nombre);
    alTerminar(nombre);
  }, 100);
}

function despedir(nombre, alTerminar) {
  setTimeout(() => {
    console.log("Hasta luego, " + nombre);
    alTerminar();
  }, 100);
}

console.log("Inicio");
saludar("Fernando", (nombre) => {
  despedir(nombre, () => console.log("Fin"));
});
