import { Carrito } from "../models/Carrito.js";

const carrito = new Carrito();
const moneda = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });
const pedido = document.querySelector("#pedido");
const finalizar = document.querySelector("#finalizar");
const vaciar = document.querySelector("#vaciar");

function boton(texto, accion) {
  const elemento = document.createElement("button");
  elemento.textContent = texto;
  elemento.addEventListener("click", () => {
    accion();
    mostrarPedido();
  });
  return elemento;
}

// Volvemos a dibujar el pedido después de cada cambio para mantener los importes al día.
function mostrarPedido() {
  pedido.replaceChildren();
  const productos = carrito.obtenerProductos();
  for (const item of productos) {
    const fila = document.createElement("li");
    fila.textContent = `${item.nombre} · ${moneda.format(item.precio)} × ${item.cantidad} = ${moneda.format(item.subtotal)} `;
    const menos = boton("Restar uno", () => carrito.actualizarCantidad(item.id, item.cantidad - 1));
    const mas = boton("Sumar uno", () => carrito.actualizarCantidad(item.id, item.cantidad + 1));
    menos.disabled = item.cantidad === 1;
    mas.disabled = item.cantidad >= item.stock;
    fila.append(
      menos,
      mas,
      boton("Quitar producto", () => carrito.eliminarProducto(item.id))
    );
    pedido.append(fila);
  }
  finalizar.disabled = productos.length === 0;
  vaciar.disabled = productos.length === 0;
  document.querySelector("#total").textContent = productos.length
    ? `Total: ${moneda.format(carrito.calcularTotal())}`
    : "Tu carrito está vacío.";
}

vaciar.addEventListener("click", () => {
  carrito.vaciarCarrito();
  mostrarPedido();
});

// Checkout recupera el pedido guardado. Cambiar de página debe conservar sus productos.
finalizar.addEventListener("click", () => {
  window.location.assign("./checkout.html");
});

mostrarPedido();
