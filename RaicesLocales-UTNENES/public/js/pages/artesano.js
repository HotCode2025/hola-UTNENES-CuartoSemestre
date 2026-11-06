import { ArtesanoService } from '../services/ArtesanoService.js';

document.addEventListener('DOMContentLoaded', async () => {
  const artesanoService = new ArtesanoService();
  
  // Lee la URL para ver qué ID de artesano mostrar (?id=1)
  const urlParams = new URLSearchParams(window.location.search);
  const artesanoId = urlParams.get('id') || 1;

  try {
    const artesano = await artesanoService.obtenerArtesanoPorId(artesanoId);
    
    // Uso de GETTERS para respetar la encapsulación
    document.getElementById('artesano-nombre').textContent = artesano.getNombre();
    document.getElementById('artesano-nombre-catalogo').textContent = artesano.getNombre();
    document.getElementById('artesano-historia-texto').textContent = artesano.getHistoria();
    document.getElementById('artesano-foto').src = `img/${artesano.getFotoPerfil() || 'default.jpg'}`;
    document.getElementById('artesano-ubicacion').textContent = `📍 ${artesano.getUbicacion() || 'Ubicación no disponible'}`;

    const badge = document.getElementById('artesano-badge');
    const suscripcion = artesano.getSuscripcion();
    badge.textContent = suscripcion === 'Premium' ? '⭐ Suscripción Premium' : '🌱 Artesano Local';

    // Renderizado de productos
    const contenedor = document.getElementById("grid-productos-artesano");
    contenedor.replaceChildren();

    const productos = artesano.getProductos();
    if (productos.length === 0) {
      const mensaje = document.createElement("p");
      mensaje.textContent = "Este artesano aún no tiene productos publicados.";
      contenedor.append(mensaje);
      return;
    }

    productos.forEach((producto) => {
      const card = document.createElement("article");
      card.className = "card-producto";

      const nombre = document.createElement("h3");
      nombre.textContent = producto.getNombre();
      const categoria = document.createElement("p");
      categoria.className = "categoria";
      categoria.textContent = producto.getCategoria();
      const precio = document.createElement("p");
      precio.className = "precio";
      precio.textContent = new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
      }).format(producto.getPrecio());

      card.append(nombre, categoria, precio);
      contenedor.append(card);
    });

  } catch (error) {
    console.error(error);
    document.getElementById('perfil-artesano').innerHTML = `
      <p class="error">Ocurrió un error al cargar el perfil del artesano.</p>
    `;
  }
});