function hablar(alTerminar) {
  setTimeout(() => {
    console.log("Estoy hablando");
    alTerminar();
  }, 100);
}

// Repetir llamadas anidadas agrega un nivel por cada intervención.
function conversacionAnidada(alTerminar) {
  hablar(() => {
    hablar(() => {
      hablar(alTerminar);
    });
  });
}

// La cantidad de intervenciones pasa a ser un parámetro.
function conversar(veces, alTerminar) {
  if (veces === 0) {
    alTerminar();
    return;
  }
  hablar(() => conversar(veces - 1, alTerminar));
}

console.log("Versión anidada");
conversacionAnidada(() => {
  console.log("Versión con una función reutilizable");
  conversar(3, () => console.log("Fin"));
});
