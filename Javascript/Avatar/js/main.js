// Variables globales del juego
let vidasJugador = 3;
let vidasEnemigo = 3;
let personajeSeleccionado = false;
let personajeJugador = null;
let personajeEnemigo = null;

const contenedorPersonajes = document.querySelector(".personajes-container");

// Referencias al DOM - inputs
// Referencias al DOM - spans de texto
const spanHeroeEleccion = document.getElementById("heroe-eleccion");
const spanEnemigoEleccion = document.getElementById("enemigo-eleccion");
const spanVidaJugador = document.getElementById("vida-jugador");
const spanVidaEnemigo = document.getElementById("vida-enemigo");
const pResultadoCombate = document.getElementById("resultado-combate");

// Referencias al DOM - secciones
const seccionPersonaje = document.getElementById("Escojer-personaje");
const seccionAtaque = document.getElementById("Seleccionar-ataque");
const seccionMensajes = document.getElementById("mensajes");
const seccionReiniciar = document.getElementById("Reiniciar");

// Referencias al DOM - botones
const botonPersonaje = document.getElementById("boton-personaje");
const botonReglas = document.getElementById("boton-reglas");
const botonPatada = document.getElementById("boton-patada");
const botonPunio = document.getElementById("boton-punio");
const botonBarrida = document.getElementById("boton-barrida");
const botonReiniciar = document.getElementById("boton-reiniciar");

function mostrarPersonajes() {
    contenedorPersonajes.innerHTML = personajes.map((personaje, indice) => `
        <div class="personaje-card">
            ${personaje.imagen
            ? `<img src="${personaje.imagen}" alt="${personaje.nombre}" class="personaje-img" />`
            : `<div class="personaje-img personaje-placeholder" aria-label="${personaje.nombre}">${personaje.emoji}</div>`}
            <label for="personaje-${indice}">${personaje.emoji} ${personaje.nombre}</label>
            <input type="radio" name="personaje" id="personaje-${indice}" value="${indice}" />
        </div>
    `).join("");
}

mostrarPersonajes();

// Navegación entre secciones
function mostrarSeccion(seccion) {
    seccion.style.display = "block";
    seccion.scrollIntoView({ behavior: "smooth" });
}

function toggleReglas() {
    const reglasDiv = document.getElementById("reglas-contenedor");
    if (reglasDiv.style.display === "none") {
        reglasDiv.style.display = "block";
        botonReglas.textContent = "Ocultar Reglas";
    } else {
        reglasDiv.style.display = "none";
        botonReglas.textContent = "Mostrar Reglas";
    }
}

function seleccionarPersonajeJugador() {
    const radioSeleccionado = document.querySelector('input[name="personaje"]:checked');
    if (!radioSeleccionado) {
        alert("Debes seleccionar un personaje");
        return;
    }

    personajeJugador = personajes[Number(radioSeleccionado.value)];
    personajeSeleccionado = true;
    personajeEnemigo = personajes[Math.floor(Math.random() * personajes.length)];

    spanHeroeEleccion.textContent = personajeJugador.nombre;
    spanEnemigoEleccion.textContent = personajeEnemigo.nombre;
    pResultadoCombate.textContent = "¡" + personajeJugador.nombre + " vs " + personajeEnemigo.nombre + "! Elige tu ataque.";

    seccionPersonaje.style.display = "none";
    mostrarSeccion(seccionMensajes);
    mostrarSeccion(seccionAtaque);
}

function generaAtaqueEnemigo() {
    const ataques = ["Patada", "Puño", "Barrida"];
    return ataques[Math.floor(Math.random() * ataques.length)];
}

function determinarGanador(ataqueJugador, ataqueEnemigo) {
    if (ataqueJugador === ataqueEnemigo) return "empate";
    if (
        (ataqueJugador === "Patada" && ataqueEnemigo === "Puño") ||
        (ataqueJugador === "Puño" && ataqueEnemigo === "Barrida") ||
        (ataqueJugador === "Barrida" && ataqueEnemigo === "Patada")
    ) {
        return "jugador";
    }
    return "enemigo";
}

function ejecutarCombate(ataqueJugador) {
    if (!personajeSeleccionado) {
        alert("Debes seleccionar un personaje primero");
        return;
    }

    const ataqueEnemigo = personajeEnemigo.atacar(generaAtaqueEnemigo());
    const ganador = determinarGanador(personajeJugador.atacar(ataqueJugador), ataqueEnemigo);

    spanHeroeEleccion.textContent = ataqueJugador;
    spanEnemigoEleccion.textContent = ataqueEnemigo;

    if (ganador === "empate") {
        pResultadoCombate.textContent = "¡EMPATE! Ambos atacaron con " + ataqueJugador;
    } else if (ganador === "jugador") {
        vidasEnemigo--;
        pResultadoCombate.textContent = "¡GANASTE! Tu " + ataqueJugador + " venció al " + ataqueEnemigo + " del enemigo. Vidas del enemigo: " + vidasEnemigo;
    } else {
        vidasJugador--;
        pResultadoCombate.textContent = "¡PERDISTE! Su " + ataqueEnemigo + " venció a tu " + ataqueJugador + ". Tus vidas: " + vidasJugador;
    }

    spanVidaJugador.textContent = vidasJugador;
    spanVidaEnemigo.textContent = vidasEnemigo;
    mostrarSeccion(seccionMensajes);

    if (vidasJugador === 0) {
        pResultadoCombate.textContent += " | ¡JUEGO TERMINADO! El enemigo ganó.";
        deshabilitarBotones();
        mostrarSeccion(seccionReiniciar);
    } else if (vidasEnemigo === 0) {
        pResultadoCombate.textContent += " | ¡JUEGO TERMINADO! ¡Ganaste!";
        deshabilitarBotones();
        mostrarSeccion(seccionReiniciar);
    }
}

function deshabilitarBotones() {
    botonPatada.disabled = true;
    botonPunio.disabled = true;
    botonBarrida.disabled = true;
}

function reiniciarJuego() {
    vidasJugador = 3;
    vidasEnemigo = 3;
    personajeSeleccionado = false;
    personajeJugador = null;
    personajeEnemigo = null;

    document.querySelectorAll('input[name="personaje"]').forEach((radio) => {
        radio.checked = false;
    });

    personajeJugador = null;
    personajeEnemigo = null;
    spanHeroeEleccion.textContent = "-";
    spanEnemigoEleccion.textContent = "-";
    pResultadoCombate.textContent = "Selecciona un personaje y comienza el combate...";

    spanVidaJugador.textContent = "3";
    spanVidaEnemigo.textContent = "3";

    botonPatada.disabled = false;
    botonPunio.disabled = false;
    botonBarrida.disabled = false;

    seccionAtaque.style.display = "none";
    seccionMensajes.style.display = "none";
    seccionPersonaje.style.display = "block";

    seccionPersonaje.scrollIntoView({ behavior: "smooth" });
}

// Event listeners
botonReglas.addEventListener("click", toggleReglas);
botonPersonaje.addEventListener("click", seleccionarPersonajeJugador);
botonPatada.addEventListener("click", () => ejecutarCombate("Patada"));
botonPunio.addEventListener("click", () => ejecutarCombate("Puño"));
botonBarrida.addEventListener("click", () => ejecutarCombate("Barrida"));
botonReiniciar.addEventListener("click", reiniciarJuego);
