class Avatar {
    constructor(nombre, foto, emoji, vida) {
        this.nombre = nombre;
        this.foto = foto;
        this.emoji = emoji;
        this.vida = vida;
        this.ataques = [];
        this.x = 20;
        this.y = 20;
        this.ancho = 50;
        this.alto = 50;
        this.mapaFoto = new Image();
        this.mapaFoto.src = foto;
        this.velocidadX = 0;
        this.velocidadY = 0;
    }

    pintarAvatar(lienzo) {
        if (this.mapaFoto.complete && this.mapaFoto.naturalWidth !== 0) {
            lienzo.drawImage(this.mapaFoto, this.x, this.y, this.ancho, this.alto);
        } else {
            lienzo.fillStyle = '#ff0055';
            lienzo.beginPath();
            lienzo.arc(this.x + 25, this.y + 25, 25, 0, Math.PI * 2);
            lienzo.fill();
        }
    }
}

// Instanciación de los 4 personajes
let zuko = new Avatar('Zuko', './img/zuko.jpg', '🔥', 3);
let katara = new Avatar('Katara', './img/katara.jpg', '💦', 3);
let aang = new Avatar('Aang', './img/aang.jpg', '🌪️', 3);
let toph = new Avatar('Toph', './img/toph.jpg', '🌱', 3);

zuko.ataques.push({ nombre: 'Patada', id: 'boton-patada' }, { nombre: 'Puño', id: 'boton-punio' }, { nombre: 'Barrida', id: 'boton-barrida' });
katara.ataques.push({ nombre: 'Patada', id: 'boton-patada' }, { nombre: 'Puño', id: 'boton-punio' }, { nombre: 'Barrida', id: 'boton-barrida' });
aang.ataques.push({ nombre: 'Patada', id: 'boton-patada' }, { nombre: 'Puño', id: 'boton-punio' }, { nombre: 'Barrida', id: 'boton-barrida' });
toph.ataques.push({ nombre: 'Patada', id: 'boton-patada' }, { nombre: 'Puño', id: 'boton-punio' }, { nombre: 'Barrida', id: 'boton-barrida' });

const avatares = [zuko, katara, aang, toph];

// Renderizado dinámico de tarjetas fijando dimensiones parejas
function renderizarTarjetas() {
    const contenedorTarjetas = document.getElementById('contenedorTarjetas');
    if (!contenedorTarjetas) return;
    
    contenedorTarjetas.innerHTML = "";

    avatares.forEach((avatar, indice) => {
        let opcionAvatares = `
            <div class="personaje-card" style="height: 250px !important; display: flex !important; flex-direction: column !important; justify-content: space-between !important; align-items: center !important;">
                <img src="${avatar.foto}" alt="${avatar.nombre}" class="personaje-img" style="height: 130px !important; width: 100% !important; object-fit: cover !important; object-position: top !important; border-radius: 6px !important;" />
                <label for="personaje-${indice}" style="margin: 6px 0 !important;">${avatar.emoji} ${avatar.nombre}</label>
                <input type="radio" name="personaje" id="personaje-${indice}" value="${indice}" style="margin-bottom: 8px !important;" />
            </div>
        `;
        contenedorTarjetas.innerHTML += opcionAvatares;
    });
}

renderizarTarjetas();