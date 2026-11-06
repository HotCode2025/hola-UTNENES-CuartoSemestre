import { FuenteAPI } from "../services/fuentes/FuenteAPI.js";
import { ProductoService } from "../services/ProductoService.js";
import { Catalogo } from "../catalogo/Catalogo.js";
import { Carrito } from "../models/Carrito.js";
import {
  renderizarProductos,
  renderizarCategorias,
  conectarAccionesCards,
  formatearPrecio,
} from "../catalogo/renderCatalogo.js";

const servicio = new ProductoService(new FuenteAPI("/api"));

const $ = (id) => document.getElementById(id);
const ui = {
  catalogo: $("catalogo"),
  buscador: $("buscador"),
  categoria: $("filtro-categoria"),
  orden: $("orden"),
  soloDestacados: $("solo-destacados"),
  contador: $("contador"),
  detalle: $("detalle"),
  aviso: $("aviso"),
};

let catalogo;
const carrito = new Carrito();

function actualizar() {
  const productos = catalogo.aplicarFiltros({
    categoria: ui.categoria.value,
    texto: ui.buscador.value,
    soloDestacados: ui.soloDestacados.checked,
    orden: ui.orden.value,
  });
  renderizarProductos(ui.catalogo, productos);
  ui.contador.textContent = `${productos.length} producto(s)`;
}

function verDetalle(id) {
  const p = catalogo.buscarPorId(id);
  if (!p) return;
  $("detalle-nombre").textContent = p.getNombre();
  $("detalle-categoria").textContent = p.getCategoria();
  $("detalle-descripcion").textContent = p.getDescripcion();
  $("detalle-precio").textContent = formatearPrecio(p.getPrecio());
  $("detalle-stock").textContent = p.hayStock() ? `Stock: ${p.getStock()}` : "Sin stock";
  const enlaceArtesano = $("detalle-artesano");
  enlaceArtesano.textContent = `Ver perfil del artesano #${p.getArtesanoId()}`;
  enlaceArtesano.href = `artesano.html?id=${encodeURIComponent(p.getArtesanoId())}`;
  ui.detalle.showModal();
}

function comprar(id) {
  const p = catalogo.buscarPorId(id);
  if (!p) return;
  document.dispatchEvent(new CustomEvent("carrito:agregar", {
    detail: { producto: p.toJSON() },
  }));
}

function agregarAlCarrito(evento) {
  const producto = evento.detail?.producto;
  if (!producto) return;

  mostrarAviso(
    carrito.agregarProducto(producto)
      ? `"${producto.nombre}" agregado al carrito.`
      : `No se pudo agregar "${producto.nombre}": revisá el stock disponible.`
  );
}

function mostrarAviso(texto) {
  ui.aviso.textContent = texto;
  ui.aviso.classList.add("aviso--visible");
  clearTimeout(mostrarAviso.timer);
  mostrarAviso.timer = setTimeout(() => ui.aviso.classList.remove("aviso--visible"), 2000);
}

async function iniciar() {
  document.addEventListener("carrito:agregar", agregarAlCarrito);

  try {
    catalogo = new Catalogo(await servicio.obtenerTodos());
  } catch (error) {
    ui.catalogo.textContent = "No se pudieron cargar los productos. Verificá que el servidor esté conectado a PostgreSQL.";
    console.error(error);
    return;
  }

  renderizarCategorias(ui.categoria, catalogo.obtenerCategorias());
  conectarAccionesCards(ui.catalogo, { onVerDetalle: verDetalle, onComprar: comprar });

  ui.buscador.addEventListener("input", actualizar);
  [ui.categoria, ui.orden, ui.soloDestacados].forEach((el) => el.addEventListener("change", actualizar));

  actualizar();
}

iniciar();
