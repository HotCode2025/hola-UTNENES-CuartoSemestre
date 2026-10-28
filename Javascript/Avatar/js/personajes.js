class Avatar {
    constructor(nombre, foto, vida, fotoMapa, x = 10, y = 10) {
        this.nombre = nombre;
        this.foto = foto;
        this.vida = vida;
        this.fotoMapa = fotoMapa;
        this.x = x;
        this.y = y;
        
        // Sprites visibles y amplios para el Canvas
        this.ancho = 100;
        this.alto = 100;
        
        this.mapaFoto = new Image();
        this.mapaFoto.src = fotoMapa;
        this.ataques = [];
        this.velocidadX = 0;
        this.velocidadY = 0;
        this.recibiendoDanio = false;
    }

    pintarAvatares() {
        if (!lienzo || !this.mapaFoto.complete) return;

        if (this.recibiendoDanio) {
            lienzo.globalAlpha = 0.2;
        } else {
            lienzo.globalAlpha = 1.0;
        }

        lienzo.drawImage(
            this.mapaFoto,
            this.x,
            this.y,
            this.ancho,
            this.alto
        );

        lienzo.globalAlpha = 1.0;
    }
}

// Instanciación de personajes con las imágenes PNG transparentes[cite: 14]
let zuko = new Avatar('Zuko', './img/zuco.png', 5, './img/zuco.png');
let katara = new Avatar('Katara', './img/katara.png', 5, './img/katara.png');
let aang = new Avatar('Aang', './img/aang.png', 5, './img/aang.png');
let toph = new Avatar('Toph', './img/toph.png', 5, './img/toph.png');

zuko.ataques.push({ nombre: 'Patada', id: 'boton-patada' }, { nombre: 'Puño', id: 'boton-punio' }, { nombre: 'Barrida', id: 'boton-barrida' });
katara.ataques.push({ nombre: 'Patada', id: 'boton-patada' }, { nombre: 'Puño', id: 'boton-punio' }, { nombre: 'Barrida', id: 'boton-barrida' });
aang.ataques.push({ nombre: 'Patada', id: 'boton-patada' }, { nombre: 'Puño', id: 'boton-punio' }, { nombre: 'Barrida', id: 'boton-barrida' });
toph.ataques.push({ nombre: 'Patada', id: 'boton-patada' }, { nombre: 'Puño', id: 'boton-punio' }, { nombre: 'Barrida', id: 'boton-barrida' });

const avatares = [zuko, katara, aang, toph];

function renderizarTarjetas() {
    const contenedorTarjetas = document.getElementById('contenedorTarjetas');
    if (!contenedorTarjetas) return;
    
    contenedorTarjetas.innerHTML = "";

    avatares.forEach((avatar, indice) => {
        let opcionAvatares = `
            <div class="personaje-card" style="height: 250px !important; display: flex !important; flex-direction: column !important; justify-content: space-between !important; align-items: center !important;">
                <img src="${avatar.foto}" alt="${avatar.nombre}" class="personaje-img" style="height: 140px !important; width: 100% !important; object-fit: contain !important; border-radius: 6px !important;" />
                <label for="personaje-${indice}">${avatar.nombre}</label>
                <input type="radio" name="personaje" id="personaje-${indice}" value="${indice}" />
            </div>
        `;
        contenedorTarjetas.innerHTML += opcionAvatares;
    });
}

renderizarTarjetas();