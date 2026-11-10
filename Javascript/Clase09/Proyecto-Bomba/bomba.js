const tiempo = document.querySelector("#tiempo");
const estado = document.querySelector("#estado");
const activar = document.querySelector("#activar");
const abortar = document.querySelector("#abortar");
const sonido = document.querySelector("#sonido");
const duracion = 9;
let segundos = duracion;
let intervalo;
let audio;
let sonidoActivo = true;

// Generamos los tonos en el navegador para que el ejercicio funcione sin archivos de audio.
function emitirTono(frecuencia, duracionTono) {
  if (!sonidoActivo || !audio) return;
  const tono = audio.createOscillator();
  const volumen = audio.createGain();
  tono.frequency.value = frecuencia;
  volumen.gain.value = 0.08;
  tono.connect(volumen);
  volumen.connect(audio.destination);
  tono.start();
  tono.stop(audio.currentTime + duracionTono);
}

function mostrarTiempo() {
  tiempo.textContent = "00:" + String(segundos).padStart(2, "0");
}

function detener(mensaje) {
  clearInterval(intervalo);
  abortar.disabled = true;
  estado.textContent = mensaje;
}

function restablecer(mensaje) {
  detener(mensaje);
  segundos = duracion;
  mostrarTiempo();
  activar.disabled = false;
}

activar.addEventListener("click", () => {
  if (window.AudioContext) {
    audio ??= new AudioContext();
    audio.resume().catch(() => {});
  }
  activar.disabled = true;
  abortar.disabled = false;
  estado.textContent = "Cuenta regresiva en marcha";
  intervalo = setInterval(() => {
    segundos--;
    mostrarTiempo();
    if (segundos === 0) {
      detener("¡Explosión! Presioná Reiniciar para volver a jugar.");
      emitirTono(80, 0.8);
    } else {
      emitirTono(620, 0.1);
    }
  }, 1000);
});

abortar.addEventListener("click", () => restablecer("Cuenta regresiva abortada"));
document.querySelector("#reiniciar").addEventListener("click", () => restablecer("Listo para activar"));
sonido.addEventListener("click", () => {
  sonidoActivo = !sonidoActivo;
  sonido.setAttribute("aria-pressed", String(sonidoActivo));
  sonido.textContent = sonidoActivo ? "Sonido activado" : "Sonido silenciado";
});
