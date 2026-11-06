const formatoPesos = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 2,
});

function mostrarPedido(pedido) {
  const tarjeta = document.createElement("article");
  tarjeta.className = "tarjeta historial-pedido";

  const titulo = document.createElement("h2");
  titulo.textContent = `Pedido ${pedido.numero}`;
  tarjeta.append(titulo);

  const fecha = document.createElement("p");
  fecha.textContent = `Fecha: ${new Date(pedido.fecha).toLocaleString("es-AR")}`;
  tarjeta.append(fecha);

  const estado = document.createElement("p");
  estado.textContent = `Estado: ${pedido.estado}`;
  tarjeta.append(estado);

  const lista = document.createElement("ul");
  for (const item of pedido.items) {
    const fila = document.createElement("li");
    fila.textContent = `${item.cantidad} × ${item.nombre} — ${formatoPesos.format(item.precio)}`;
    lista.append(fila);
  }
  tarjeta.append(lista);

  const total = document.createElement("p");
  total.textContent = `Total: ${formatoPesos.format(pedido.total)}`;
  tarjeta.append(total);
  return tarjeta;
}

async function cargarHistorial() {
  const contenedor = document.getElementById("historial");
  try {
    const datos = await pedirUsuarioAPI("/pedidos");
    if (datos.pedidos.length === 0) {
      contenedor.textContent = "Todavía no hay pedidos en tu historial.";
      return;
    }
    for (const pedido of datos.pedidos) contenedor.append(mostrarPedido(pedido));
  } catch (error) {
    if (error.status === 401) {
      location.href = "login.html";
      return;
    }
    contenedor.textContent = error.message;
  }
}

cargarHistorial();