import { ArtesanoService } from './services/ArtesanoService.js';

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
    document.getElementById('artesano-foto').src = `assets/img/${artesano.getFotoPerfil() || 'default.jpg'}`;
    document.getElementById('artesano-ubicacion').textContent = `📍 ${artesano.getUbicacion() || 'Ubicación no disponible'}`;

    const badge = document.getElementById('artesano-badge');
    const suscripcion = artesano.getSuscripcion();
    badge.textContent = suscripcion === 'Premium' ? '⭐ Suscripción Premium' : '🌱 Artesano Local';

    // Renderizado de productos
    const contenedor = document.getElementById('grid-productos-artesano');
    contenedor.innerHTML = '';

    const productos = artesano.getProductos();
    if (productos.length === 0) {
      contenedor.innerHTML = '<p>Este artesano aún no tiene productos publicados.</p>';
      return;
    }

    productos.forEach(prod => {
      const card = document.createElement('div');
      card.className = 'card-producto';
      card.innerHTML = `
        <div class="card-content">
          <h3>${prod.getNombre()}</h3>
          <p class="categoria">${prod.getCategoria()}</p>
          <p class="precio">$${prod.getPrecio().toLocaleString('es-AR')}</p>
          <a href="producto.html?id=${prod.getId()}" class="btn-detalle">Ver Detalle</a>
        </div>
      `;
      contenedor.appendChild(card);
    });

  } catch (error) {
    console.error(error);
    document.getElementById('perfil-artesano').innerHTML = `
      <p class="error">Ocurrió un error al cargar el perfil del artesano.</p>
    `;
  }
});