// Variables globales
let vidasJugador = 3;
let vidasEnemigo = 3;
let personajeSeleccionado = false;
let personajeJugador = null;
let personajeEnemigo = null;
let personajeJugadorObjeto = null;
let personajeEnemigoObjeto = null;

// Elementos de Audio HTML5
const musicaFondo = document.getElementById("musica-fondo");
const sonidoAtaque = document.getElementById("sonido-ataque");
const botonMusica = document.getElementById("boton-musica");

// Inicializamos la música desactivada por defecto para evitar bloqueos del navegador
let musicaEncendida = false;

if (musicaFondo) {
    musicaFondo.volume = 0.08; // Volumen sutil (8%)
}

if (botonMusica) {
    botonMusica.textContent = "🔇 Música OFF";
}

// Carga del mapa de fondo
let mapaBackground = new Image();
mapaBackground.src = './img/mapa.jpg';

// Canvas
const mapa = document.getElementById('mapa');
const lienzo = mapa ? mapa.getContext('2d') : null;
let intervalo = null;

// DOM
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

// Función Mute / Unmute manual
function toggleMusica() {
    if (!musicaFondo) return;
    
    if (musicaEncendida) {
        musicaFondo.pause();
        musicaEncendida = false;
        if (botonMusica) botonMusica.textContent = "🔇 Música OFF";
    } else {
        musicaFondo.volume = 0.08; // Volumen ambiental sutil
        musicaFondo.play().then(() => {
            musicaEncendida = true;
            if (botonMusica) botonMusica.textContent = "🔊 Música ON";
        }).catch(e => console.log("Error al reproducir música:", e));
    }
}

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

function reproducirSonidoAtaque() {
    if (!sonidoAtaque) return;
    sonidoAtaque.currentTime = 0; // Reinicia el audio WAV al instante
    sonidoAtaque.volume = 1.0;
    sonidoAtaque.play().catch(e => console.log("Error al reproducir ataque:", e));
}

function obtenerObjetoPersonaje(nombre) {
    for (let i = 0; i < avatares.length; i++) {
        if (nombre === avatares[i].nombre) {
            return avatares[i];
        }
    }
    return avatares[0];
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
    if (pResultadoCombate) pResultadoCombate.textContent = "Mueve tu personaje con las flechas hasta encontrar a tu rival en el mapa...";

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
    
    personajeEnemigoObjeto = new Avatar(
        personajeEnemigo.nombre,
        personajeEnemigo.foto,
        5,
        personajeEnemigo.fotoMapa,
        380,
        130
    );

    personajeJugadorObjeto.x = 60;
    personajeJugadorObjeto.y = 130;

    window.addEventListener('keydown', sePresionoUnaTecla);
    window.addEventListener('keyup', detenerMovimiento);
    
    if (intervalo) clearInterval(intervalo);
    intervalo = setInterval(pintarCanvas, 30);
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

    personajeJugadorObjeto.pintarAvatares();
    if (personajeEnemigoObjeto) {
        personajeEnemigoObjeto.pintarAvatares();
    }

    if (personajeJugadorObjeto.velocidadX !== 0 || personajeJugadorObjeto.velocidadY !== 0) {
        revisarColision();
    }
}

function revisarColision() {
    if (!personajeEnemigoObjeto) return;

    const arribaEnemigo = personajeEnemigoObjeto.y;
    const abajoEnemigo = personajeEnemigoObjeto.y + personajeEnemigoObjeto.alto;
    const derechaEnemigo = personajeEnemigoObjeto.x + personajeEnemigoObjeto.ancho;
    const izquierdaEnemigo = personajeEnemigoObjeto.x;

    const arribaPersonaje = personajeJugadorObjeto.y;
    const abajoPersonaje = personajeJugadorObjeto.y + personajeJugadorObjeto.alto;
    const derechaPersonaje = personajeJugadorObjeto.x + personajeJugadorObjeto.ancho;
    const izquierdaPersonaje = personajeJugadorObjeto.x;

    if (
        abajoPersonaje < arribaEnemigo ||
        arribaPersonaje > abajoEnemigo ||
        derechaPersonaje < izquierdaEnemigo ||
        izquierdaPersonaje > derechaEnemigo
    ) {
        return;
    }

    detenerMovimiento();

    if (seccionAtaque) seccionAtaque.style.display = 'block';
    if (seccionMensajes) seccionMensajes.style.display = 'block';

    pResultadoCombate.textContent = "¡Encontraste a " + personajeEnemigo.nombre + "! Elige tu ataque para luchar en el mapa.";
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

function animarAtaqueCanvas(atacante, victima) {
    reproducirSonidoAtaque();

    let xOriginal = atacante.x;
    let yOriginal = atacante.y;
    let xDestino = victima.x;
    let yDestino = victima.y;

    let frames = 0;
    let totalFrames = 10;

    let intervalAnim = setInterval(() => {
        frames++;
        
        if (frames <= totalFrames / 2) {
            atacante.x += (xDestino - xOriginal) / (totalFrames / 2);
            atacante.y += (yDestino - yOriginal) / (totalFrames / 2);
        } else if (frames <= totalFrames) {
            atacante.x -= (xDestino - xOriginal) / (totalFrames / 2);
            atacante.y -= (yDestino - yOriginal) / (totalFrames / 2);
        } else {
            atacante.x = xOriginal;
            atacante.y = yOriginal;
            clearInterval(intervalAnim);

            victima.recibiendoDanio = true;
            setTimeout(() => { victima.recibiendoDanio = false; }, 250);
        }
        pintarCanvas();
    }, 20);
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
    if (!personajeSeleccionado || !personajeEnemigoObjeto) return;

    const ataqueEnemigo = generaAtaqueEnemigo();
    const ganador = determinarGanador(ataqueJugador, ataqueEnemigo);

    if (spanHeroeEleccion) spanHeroeEleccion.textContent = ataqueJugador;
    if (spanEnemigoEleccion) spanEnemigoEleccion.textContent = ataqueEnemigo;

    if (ganador === "empate") {
        animarAtaqueCanvas(personajeJugadorObjeto, personajeEnemigoObjeto);
        if (pResultadoCombate) pResultadoCombate.textContent = "¡EMPATE! Ambos atacaron con " + ataqueJugador;
    } else if (ganador === "jugador") {
        animarAtaqueCanvas(personajeJugadorObjeto, personajeEnemigoObjeto);
        vidasEnemigo--;
        if (pResultadoCombate) pResultadoCombate.textContent = "¡GANASTE! Tu " + ataqueJugador + " venció al " + ataqueEnemigo + " de " + personajeEnemigo.nombre + ".";
    } else {
        animarAtaqueCanvas(personajeEnemigoObjeto, personajeJugadorObjeto);
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
    personajeEnemigoObjeto = null;
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

if (botonMusica) botonMusica.addEventListener("click", toggleMusica);
if (botonReglas) botonReglas.addEventListener("click", toggleReglas);
if (botonPersonaje) botonPersonaje.addEventListener("click", seleccionarPersonajeJugador);
if (botonPatada) botonPatada.addEventListener("click", () => ejecutarCombate("Patada"));
if (botonPunio) botonPunio.addEventListener("click", () => ejecutarCombate("Puño"));
if (botonBarrida) botonBarrida.addEventListener("click", () => ejecutarCombate("Barrida"));
if (botonReiniciar) botonReiniciar.addEventListener("click", reiniciarJuego);