class Personaje {
    constructor(nombre, elemento, emoji, imagen) {
        this.nombre = nombre;
        this.elemento = elemento;
        this.emoji = emoji;
        this.imagen = imagen;
        this.vidas = 3;
    }

    atacar(ataque) {
        return ataque;
    }
}

const personajes = [
    new Personaje("Zuko", "Fuego", "🔥", "./img/zuko.jpg"),
    new Personaje("Katara", "Agua", "💦", "./img/katara.jpg"),
    new Personaje("Aang", "Aire", "🌪️", "./img/aang.jpg"),
    new Personaje("Toph", "Tierra", "🌱", "./img/toph.jpg"),
    new Personaje("Sokka", "Agua", "🪃", ""),
    new Personaje("Azula", "Fuego", "🔥", "")
];

function agregarPersonaje(nombre, elemento, emoji, imagen) {
    const nuevoPersonaje = new Personaje(nombre, elemento, emoji, imagen);
    personajes.push(nuevoPersonaje);
    return nuevoPersonaje;
}