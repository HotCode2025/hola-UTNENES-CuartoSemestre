// Funciones que dibujan las tarjetas y los filtros del catálogo en el DOM.
// Se usa textContent (no innerHTML) para no inyectar HTML desde los datos.

const formateadorPrecio = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export const formatearPrecio = (precio) => formateadorPrecio.format(precio);

function crearElemento(etiqueta, clase, texto) {
  const el = document.createElement(etiqueta);
  if (clase) el.className = clase;
  if (texto !== undefined) el.textContent = texto;
  return el;
}

function rutaImagen(imagen) {
  if (!imagen) return "";
  if (/^(https?:|data:|\/|\.{1,2}\/|assets\/|img\/)/.test(imagen)) return imagen;
  return `img/${imagen}`;
}

function crearImagen(producto) {
  const contenedor = crearElemento("div", "card__imagen");
  const img = document.createElement("img");
  img.alt = producto.getNombre();
  img.loading = "lazy";
  // Si la imagen no existe, mostramos un recuadro con la categoría.
  img.onerror = () => {
    contenedor.replaceChildren(crearElemento("span", "card__sin-imagen", producto.getCategoria()));
  };
  img.src = rutaImagen(producto.getImagen());
  contenedor.append(img);
  return contenedor;
}

export function crearCard(producto) {
  const card = crearElemento("article", "card");
  card.dataset.id = producto.getId();
  if (producto.isDestacado()) card.classList.add("card--destacada");

  const cuerpo = crearElemento("div", "card__cuerpo");
  cuerpo.append(
    crearElemento("h3", "card__nombre", producto.getNombre()),
    crearElemento("p", "card__categoria", producto.getCategoria()),
    crearElemento("p", "card__precio", formatearPrecio(producto.getPrecio()))
  );

  if (producto.isDestacado()) {
    cuerpo.append(crearElemento("span", "card__badge", "⭐ Destacado"));
  }

  const acciones = crearElemento("div", "card__acciones");
  const btnDetalle = crearElemento("button", "btn btn--secundario", "Ver Detalle");
  btnDetalle.type = "button";
  btnDetalle.dataset.accion = "detalle";

  const btnComprar = crearElemento("button", "btn btn--primario", producto.hayStock() ? "Comprar" : "Sin stock");
  btnComprar.type = "button";
  btnComprar.dataset.accion = "comprar";
  btnComprar.disabled = !producto.hayStock();

  acciones.append(btnDetalle, btnComprar);
  cuerpo.append(acciones);
  card.append(crearImagen(producto), cuerpo);
  return card;
}

export function renderizarProductos(contenedor, productos) {
  if (productos.length === 0) {
    contenedor.replaceChildren(crearElemento("p", "catalogo__vacio", "No se encontraron productos."));
    return;
  }
  contenedor.replaceChildren(...productos.map(crearCard));
}

export function renderizarCategorias(select, categorias) {
  const opciones = [new Option("Todas las categorías", ""), ...categorias.map((c) => new Option(c, c))];
  select.replaceChildren(...opciones);
}

// Un solo listener para todas las cards (delegación de eventos).
export function conectarAccionesCards(contenedor, { onVerDetalle, onComprar }) {
  contenedor.addEventListener("click", (evento) => {
    const boton = evento.target.closest("button[data-accion]");
    if (!boton) return;
    const id = Number(boton.closest(".card").dataset.id);
    if (boton.dataset.accion === "detalle") onVerDetalle?.(id);
    if (boton.dataset.accion === "comprar") onComprar?.(id);
  });
}
