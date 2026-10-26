// Variables globales
let vidasJugador = 3;
let vidasEnemigo = 3;
let personajeSeleccionado = false;
let personajeJugador = null;
let personajeEnemigo = null;
let personajeJugadorObjeto = null;
let personajeEnemigoObjeto = null;

// Carga del mapa oficial de Avatar
let mapaBackground = new Image();
mapaBackground.src = './img/mapa.jpg';

// Referencias al Canvas
const mapa = document.getElementById('mapa');
const lienzo = mapa ? mapa.getContext('2d') : null;
let intervalo = null;

// Referencias al DOM
const spanHeroeEleccion = document.getElementById("heroe-eleccion");
const spanEnemigoEleccion = document.getElementById("enemigo-eleccion");
const spanVidaJugador = document.getElementById("vida-jugador");
const spanVidaEnemigo = document.getElementById("vida-enemigo");
const pResultadoCombate = document.getElementById("resultado-combate");

const seccionPersonaje = document.getElementById("Escojer-personaje");
const seccionAtaque = document.getElementById("Seleccionar-ataque");
const seccionMensajes = document.getElementById("mensajes");
const seccionReiniciar = document.getElementById("Reiniciar");
const sectionVerMapa = document.getElementById("ver-mapa");

const botonPersonaje = document.getElementById("boton-personaje");
const botonReglas = document.getElementById("boton-reglas");
const botonPatada = document.getElementById("boton-patada");
const botonPunio = document.getElementById("boton-punio");
const botonBarrida = document.getElementById("boton-barrida");
const botonReiniciar = document.getElementById("boton-reiniciar");

function toggleReglas() {
    const reglasDiv = document.getElementById("reglas-contenedor");
    if (!reglasDiv) return;
    if (reglasDiv.style.display === "none" || reglasDiv.style.display === "") {
        reglasDiv.style.display = "block";
        if (botonReglas) botonReglas.textContent = "Ocultar Reglas";
    } else {
        reglasDiv.style.display = "none";
        if (botonReglas) botonReglas.textContent = "Mostrar Reglas";
    }
}

function obtenerObjetoPersonaje(nombre) {
    for (let i = 0; i < avatares.length; i++) {
        if (nombre === avatares[i].nombre) {
            return avatares[i];
        }
    }
    return avatares[0];
}

function posicionarSegunNacion(personajeObjeto) {
    switch (personajeObjeto.nombre) {
        case 'Zuko':
            personajeObjeto.x = 130;
            personajeObjeto.y = 180;
            break;
        case 'Katara':
            personajeObjeto.x = 280;
            personajeObjeto.y = 280;
            break;
        case 'Aang':
            personajeObjeto.x = 230;
            personajeObjeto.y = 250;
            break;
        case 'Toph':
            personajeObjeto.x = 380;
            personajeObjeto.y = 140;
            break;
        default:
            personajeObjeto.x = 50;
            personajeObjeto.y = 50;
            break;
    }
}

function seleccionarPersonajeJugador() {
    const radioSeleccionado = document.querySelector('input[name="personaje"]:checked');
    if (!radioSeleccionado) {
        alert("Debes seleccionar un personaje primero");
        return;
    }

    const indice = Number(radioSeleccionado.value);
    personajeJugador = avatares[indice];
    personajeSeleccionado = true;
    
    let opcionesEnemigo = avatares.filter(a => a.nombre !== personajeJugador.nombre);
    personajeEnemigo = opcionesEnemigo[Math.floor(Math.random() * opcionesEnemigo.length)];

    if (spanHeroeEleccion) spanHeroeEleccion.textContent = personajeJugador.nombre;
    if (spanEnemigoEleccion) spanEnemigoEleccion.textContent = personajeEnemigo.nombre;
    if (pResultadoCombate) pResultadoCombate.textContent = "Recorre el mapa desde tu Nación hasta encontrar a tu rival...";

    if (seccionPersonaje) seccionPersonaje.style.display = "none";
    
    if (sectionVerMapa) {
        sectionVerMapa.style.display = 'flex';
        sectionVerMapa.style.flexDirection = 'column';
        sectionVerMapa.style.alignItems = 'center';
    }

    iniciarMapa();
}

function iniciarMapa() {
    if (!mapa) return;
    mapa.width = 600;
    mapa.height = 360;
    
    personajeJugadorObjeto = obtenerObjetoPersonaje(personajeJugador.nombre);
    personajeEnemigoObjeto = obtenerObjetoPersonaje(personajeEnemigo.nombre);

    posicionarSegunNacion(personajeJugadorObjeto);
    posicionarSegunNacion(personajeEnemigoObjeto);
    
    window.addEventListener('keydown', sePresionoUnaTecla);
    window.addEventListener('keyup', detenerMovimiento);
    
    if (intervalo) clearInterval(intervalo);
    intervalo = setInterval(pintarCanvas, 50);
}

function pintarCanvas() {
    if (!personajeJugadorObjeto || !lienzo) return;

    personajeJugadorObjeto.x += personajeJugadorObjeto.velocidadX;
    personajeJugadorObjeto.y += personajeJugadorObjeto.velocidadY;

    if (personajeJugadorObjeto.x < 0) personajeJugadorObjeto.x = 0;
    if (personajeJugadorObjeto.x > mapa.width - personajeJugadorObjeto.ancho) personajeJugadorObjeto.x = mapa.width - personajeJugadorObjeto.ancho;
    if (personajeJugadorObjeto.y < 0) personajeJugadorObjeto.y = 0;
    if (personajeJugadorObjeto.y > mapa.height - personajeJugadorObjeto.alto) personajeJugadorObjeto.y = mapa.height - personajeJugadorObjeto.alto;

    lienzo.clearRect(0, 0, mapa.width, mapa.height);

    if (mapaBackground.complete && mapaBackground.naturalWidth !== 0) {
        lienzo.drawImage(mapaBackground, 0, 0, mapa.width, mapa.height);
    } else {
        lienzo.fillStyle = '#101728';
        lienzo.fillRect(0, 0, mapa.width, mapa.height);
    }

    personajeJugadorObjeto.pintarAvatar(lienzo);
    personajeEnemigoObjeto.pintarAvatar(lienzo);

    revisarColision();
}

function revisarColision() {
    const p1 = personajeJugadorObjeto;
    const p2 = personajeEnemigoObjeto;

    if (
        p1.x < p2.x + p2.ancho &&
        p1.x + p1.ancho > p2.x &&
        p1.y < p2.y + p2.alto &&
        p1.y + p1.alto > p2.y
    ) {
        detenerMovimiento();
        clearInterval(intervalo);
        if (pResultadoCombate) pResultadoCombate.textContent = "¡Encontraste a " + personajeEnemigo.nombre + "! ¡Elige tu ataque!";
        if (seccionMensajes) seccionMensajes.style.display = "block";
        if (seccionAtaque) seccionAtaque.style.display = "block";
    }
}

function moverDerecha() { personajeJugadorObjeto.velocidadX = 6; }
function moverIzquierda() { personajeJugadorObjeto.velocidadX = -6; }
function moverAbajo() { personajeJugadorObjeto.velocidadY = 6; }
function moverArriba() { personajeJugadorObjeto.velocidadY = -6; }

function detenerMovimiento() {
    if (!personajeJugadorObjeto) return;
    personajeJugadorObjeto.velocidadX = 0;
    personajeJugadorObjeto.velocidadY = 0;
}

function sePresionoUnaTecla(event) {
    switch (event.key) {
        case 'ArrowUp':
            moverArriba();
            break;
        case 'ArrowDown':
            moverAbajo();
            break;
        case 'ArrowLeft':
            moverIzquierda();
            break;
        case 'ArrowRight':
            moverDerecha();
            break;
        default:
            break;
    }
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
    if (!personajeSeleccionado) return;

    const ataqueEnemigo = generaAtaqueEnemigo();
    const ganador = determinarGanador(ataqueJugador, ataqueEnemigo);

    if (spanHeroeEleccion) spanHeroeEleccion.textContent = ataqueJugador;
    if (spanEnemigoEleccion) spanEnemigoEleccion.textContent = ataqueEnemigo;

    if (ganador === "empate") {
        if (pResultadoCombate) pResultadoCombate.textContent = "¡EMPATE! Ambos atacaron con " + ataqueJugador;
    } else if (ganador === "jugador") {
        vidasEnemigo--;
        if (pResultadoCombate) pResultadoCombate.textContent = "¡GANASTE! Tu " + ataqueJugador + " venció al " + ataqueEnemigo + " de " + personajeEnemigo.nombre + ".";
    } else {
        vidasJugador--;
        if (pResultadoCombate) pResultadoCombate.textContent = "¡PERDISTE! El " + ataqueEnemigo + " de " + personajeEnemigo.nombre + " venció a tu " + ataqueJugador + ".";
    }

    if (spanVidaJugador) spanVidaJugador.textContent = vidasJugador;
    if (spanVidaEnemigo) spanVidaEnemigo.textContent = vidasEnemigo;

    if (vidasJugador === 0) {
        if (pResultadoCombate) pResultadoCombate.textContent += " | ¡JUEGO TERMINADO! " + personajeEnemigo.nombre + " ganó la batalla.";
        deshabilitarBotones();
        if (seccionReiniciar) seccionReiniciar.style.display = "block";
    } else if (vidasEnemigo === 0) {
        if (pResultadoCombate) pResultadoCombate.textContent += " | ¡JUEGO TERMINADO! ¡Ganaste la batalla!";
        deshabilitarBotones();
        if (seccionReiniciar) seccionReiniciar.style.display = "block";
    }
}

function deshabilitarBotones() {
    if (botonPatada) botonPatada.disabled = true;
    if (botonPunio) botonPunio.disabled = true;
    if (botonBarrida) botonBarrida.disabled = true;
}

function reiniciarJuego() {
    vidasJugador = 3;
    vidasEnemigo = 3;
    personajeSeleccionado = false;
    personajeJugador = null;
    personajeEnemigo = null;
    if (intervalo) clearInterval(intervalo);

    document.querySelectorAll('input[name="personaje"]').forEach((radio) => {
        radio.checked = false;
    });

    if (spanHeroeEleccion) spanHeroeEleccion.textContent = "-";
    if (spanEnemigoEleccion) spanEnemigoEleccion.textContent = "-";
    if (pResultadoCombate) pResultadoCombate.textContent = "Selecciona un personaje y comienza el combate...";

    if (spanVidaJugador) spanVidaJugador.textContent = "3";
    if (spanVidaEnemigo) spanVidaEnemigo.textContent = "3";

    if (botonPatada) botonPatada.disabled = false;
    if (botonPunio) botonPunio.disabled = false;
    if (botonBarrida) botonBarrida.disabled = false;

    if (seccionAtaque) seccionAtaque.style.display = "none";
    if (seccionMensajes) seccionMensajes.style.display = "none";
    if (sectionVerMapa) sectionVerMapa.style.display = "none";
    if (seccionReiniciar) seccionReiniciar.style.display = "none";
    if (seccionPersonaje) seccionPersonaje.style.display = "block";
}

if (botonReglas) botonReglas.addEventListener("click", toggleReglas);
if (botonPersonaje) botonPersonaje.addEventListener("click", seleccionarPersonajeJugador);
if (botonPatada) botonPatada.addEventListener("click", () => ejecutarCombate("Patada"));
if (botonPunio) botonPunio.addEventListener("click", () => ejecutarCombate("Puño"));
if (botonBarrida) botonBarrida.addEventListener("click", () => ejecutarCombate("Barrida"));
if (botonReiniciar) botonReiniciar.addEventListener("click", reiniciarJuego);