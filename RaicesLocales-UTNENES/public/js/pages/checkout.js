/**
 * ============================================================
 *  checkout.js
 *  Responsable: Matías Tobares (Checkout y Mercado Pago)
 * ------------------------------------------------------------
 *  Lógica de la página checkout.html:
 *   1. Lee el carrito desde LocalStorage (lo guarda Fernando).
 *   2. Muestra el resumen y valida los datos del comprador.
 *   3. Guarda el pedido validado por el servidor y procesa el pago.
 *   4. Muestra el resultado: aprobado / pendiente / rechazado.
 *
 *  Depende de: js/models/Pedido.js y js/services/MercadoPagoService.js
 * ============================================================
 */

// ---------------- Configuración (acordar con el equipo) ----------------

const CLAVE_CARRITO = "carrito";   // Clave donde el módulo Carrito guarda los productos
const RUTA_IMAGENES = "img/";
const COSTO_ENVIO_DOMICILIO = 3500;
const CLAVE_PEDIDO_EN_CURSO = "pedidoEnCurso"; // Pedido guardado mientras el usuario está en Mercado Pago
// Páginas a las que puede volver el usuario después de completar la compra.
const PAGINAS_CANDIDATAS = {
  inicio: ["index.html", "catalogo.html"],
  catalogo: ["catalogo.html"],
  carrito: ["carrito.html"],
};
const destinos = { inicio: "index.html", catalogo: "catalogo.html", carrito: "carrito.html" };
const SEGUNDOS_REDIRECCION = 6;
const API_PAGOS = "/api";                      // Servidor Node (carpeta server/)

// ---------------- Estado de la página ----------------

let itemsCarrito = [];
let pedidoActual = null;
let metodoSeleccionado = null;
let modoReal = false; // true = Mercado Pago real (sandbox) | false = simulación local

// Atajo para seleccionar elementos
const $ = (selector) => document.querySelector(selector);

// ============================================================
//  1. LECTURA DEL CARRITO
// ============================================================

/**
 * Lee el carrito de LocalStorage y lo normaliza.
 * Acepta los formatos más probables del módulo Carrito:
 *   [{ id, nombre, precio, ..., cantidad }]            (producto + cantidad)
 *   [{ producto: { id, nombre, precio, ... }, cantidad }] (producto anidado)
 *   { productos: [ ...cualquiera de los anteriores ] }
 */
function leerCarrito() {
  let datos;
  try {
    datos = JSON.parse(localStorage.getItem(CLAVE_CARRITO));
  } catch (error) {
    console.warn("El carrito guardado no es un JSON válido.", error);
    return [];
  }

  const lista = Array.isArray(datos) ? datos : datos?.productos ?? [];

  return lista
    .map((item) => {
      const producto = item.producto ?? item; // soporta producto anidado o plano
      return {
        id: producto.id,
        nombre: producto.nombre ?? "Producto",
        precio: Number(producto.precio) || 0,
        cantidad: Number(item.cantidad ?? 1) || 1,
        imagen: producto.imagen ?? "",
        categoria: producto.categoria ?? "",
        stock: producto.stock ?? null,
      };
    })
    .filter((item) => item.precio > 0 && item.cantidad > 0);
}

/** Devuelve los productos cuya cantidad supera el stock disponible */
function productosSinStock(items) {
  return items.filter((item) => item.stock !== null && item.cantidad > item.stock);
}

function vaciarCarrito() {
  localStorage.removeItem(CLAVE_CARRITO);
}

function construirPedido(datos, pago = datos.pago) {
  return Pedido.desdeJSON({ ...datos, pago });
}

async function pedirAPI(ruta, opciones = {}) {
  const respuesta = await fetch(`${API_PAGOS}${ruta}`, {
    ...opciones,
    headers: {
      "Content-Type": "application/json",
      ...(opciones.headers || {}),
    },
  });
  const datos = respuesta.status === 204 ? {} : await respuesta.json();
  if (!respuesta.ok) {
    const error = new Error(datos.error || "No se pudo completar la operación.");
    error.status = respuesta.status;
    throw error;
  }
  return datos;
}

async function cargarUsuarioCheckout() {
  try {
    const datos = await pedirAPI("/auth/me");
    $("#nombre").value = datos.usuario.nombre;
    $("#apellido").value = datos.usuario.apellido;
    $("#email").value = datos.usuario.email;
    $("#email").readOnly = true;
    return true;
  } catch (error) {
    if (error.status === 401) {
      const destino = `${window.location.pathname}${window.location.search}`;
      window.location.href = `usuario/login.html?next=${encodeURIComponent(destino)}`;
      return false;
    }
    throw error;
  }
}

async function crearPedidoEnServidor(datos, envio) {
  const respuesta = await pedirAPI("/pedidos", {
    method: "POST",
    body: JSON.stringify({
      comprador: {
        nombre: datos.nombre,
        apellido: datos.apellido,
        telefono: datos.telefono,
      },
      envio,
      items: itemsCarrito.map((item) => ({ id: item.id, cantidad: item.cantidad })),
    }),
  });
  pedidoActual = construirPedido(respuesta.pedido);
  itemsCarrito = pedidoActual.getItems();
  renderizarResumen();
}

// ============================================================
//  2. UTILIDADES DE PRESENTACIÓN
// ============================================================

const formatoPesos = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

function formatearPrecio(valor) {
  return formatoPesos.format(valor);
}

/** Escapa texto antes de insertarlo como HTML (evita inyección de código) */
function escaparHTML(texto) {
  const div = document.createElement("div");
  div.textContent = String(texto);
  return div.innerHTML;
}

/** Arma la ruta de la imagen: acepta nombre de archivo o URL completa */
function rutaImagen(imagen) {
  if (!imagen) return "";
  if (/^(https?:|data:|\/|\.{1,2}\/|assets\/)/.test(imagen)) return imagen;
  return RUTA_IMAGENES + imagen;
}

/** Imagen de reemplazo (SVG) con la inicial del producto, si falta la foto */
function imagenReemplazo(nombre) {
  const inicial = (nombre || "?").trim().charAt(0).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
    <rect width="120" height="120" fill="#EADFD3"/>
    <text x="50%" y="54%" font-family="Arial" font-size="52" font-weight="bold"
      fill="#C65D3B" text-anchor="middle" dominant-baseline="middle">${inicial}</text></svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

function mostrarVista(id) {
  ["#vista-vacio", "#vista-checkout", "#vista-resultado"].forEach((vista) => {
    $(vista).hidden = vista !== id;
  });
}

function marcarPaso(paso) {
  const orden = ["paso-datos", "paso-pago", "paso-confirmacion"];
  const indice = orden.indexOf(paso);
  orden.forEach((id, i) => {
    const li = document.getElementById(id);
    li.classList.toggle("hecho", i < indice);
    li.classList.toggle("activo", i === indice);
  });
}

// ============================================================
//  3. RESUMEN DEL PEDIDO
// ============================================================

function obtenerCostoEnvio() {
  const tipo = document.querySelector('input[name="envio"]:checked').value;
  return tipo === "domicilio" ? COSTO_ENVIO_DOMICILIO : 0;
}

function renderizarResumen() {
  const lista = $("#lista-items");
  lista.innerHTML = itemsCarrito
    .map(
      (item) => `
      <li class="co-item">
        <img src="${escaparHTML(rutaImagen(item.imagen) || imagenReemplazo(item.nombre))}"
             alt="${escaparHTML(item.nombre)}" data-nombre="${escaparHTML(item.nombre)}">
        <div class="co-item-info">
          <strong>${escaparHTML(item.nombre)}</strong>
          <small>${item.cantidad} × ${formatearPrecio(item.precio)}</small>
          ${item.stock !== null && item.cantidad > item.stock ? `<small class="co-item-stock">⚠️ Sólo quedan ${item.stock} unidades</small>` : ""}
        </div>
        <span class="co-item-precio">${formatearPrecio(item.precio * item.cantidad)}</span>
      </li>`
    )
    .join("");

  // Si una imagen no existe, mostramos la de reemplazo
  lista.querySelectorAll("img").forEach((img) => {
    img.addEventListener("error", () => {
      img.src = imagenReemplazo(img.dataset.nombre);
    }, { once: true });
  });

  actualizarTotales();
}

function actualizarTotales() {
  const subtotal = itemsCarrito.reduce((t, i) => t + i.precio * i.cantidad, 0);
  const envio = obtenerCostoEnvio();
  $("#subtotal").textContent = formatearPrecio(subtotal);
  $("#envio").textContent = envio === 0 ? "Gratis" : formatearPrecio(envio);
  $("#total").textContent = formatearPrecio(subtotal + envio);
}

// ============================================================
//  4. VALIDACIÓN DEL FORMULARIO DEL COMPRADOR
// ============================================================

function mostrarErrores(contenedor, errores) {
  contenedor.querySelectorAll(".error").forEach((small) => {
    const campo = small.dataset.error;
    small.textContent = errores[campo] || "";
    const input = small.parentElement.querySelector("input, select");
    if (input) input.classList.toggle("invalido", Boolean(errores[campo]));
  });
  // Llevamos el foco al primer campo con error
  const primero = contenedor.querySelector(".invalido");
  if (primero) primero.focus();
}

function validarComprador(datos) {
  const errores = {};
  if (datos.nombre.length < 2) errores.nombre = "Ingresá tu nombre.";
  if (datos.apellido.length < 2) errores.apellido = "Ingresá tu apellido.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(datos.email)) errores.email = "Ingresá un e-mail válido.";
  if (datos.telefono.replace(/\D/g, "").length < 8) errores.telefono = "Ingresá un teléfono con código de área.";

  if (datos.envio === "domicilio") {
    if (datos.direccion.length < 4) errores.direccion = "Ingresá calle y número.";
    if (datos.ciudad.length < 2) errores.ciudad = "Ingresá la ciudad.";
    if (!/^[A-Za-z]?\d{4}[A-Za-z]{0,3}$/.test(datos.cp)) errores.cp = "Código postal inválido.";
  }
  return errores;
}

function leerFormularioComprador() {
  const form = $("#form-checkout");
  const valor = (nombre) => (form.elements[nombre]?.value || "").trim();
  return {
    nombre: valor("nombre"),
    apellido: valor("apellido"),
    email: valor("email"),
    telefono: valor("telefono"),
    envio: form.elements["envio"].value,
    direccion: valor("direccion"),
    ciudad: valor("ciudad"),
    cp: valor("cp"),
  };
}

async function manejarEnvioFormulario(evento) {
  evento.preventDefault();
  const datos = leerFormularioComprador();
  const errores = validarComprador(datos);
  mostrarErrores($("#form-checkout"), errores);
  if (Object.keys(errores).length > 0) return;

  // Creamos el Pedido (POO) con los datos validados
  const comprador = {
    nombre: datos.nombre,
    apellido: datos.apellido,
    email: datos.email,
    telefono: datos.telefono,
  };
  const envio = {
    tipo: datos.envio,
    costo: obtenerCostoEnvio(),
    direccion: datos.envio === "domicilio" ? `${datos.direccion}, ${datos.ciudad} (CP ${datos.cp})` : null,
  };

  // Regla de negocio: no se puede pagar más unidades que el stock disponible
  const sinStock = productosSinStock(itemsCarrito);
  if (sinStock.length > 0) {
    $("#error-pago").textContent =
      `⚠️ No hay stock suficiente de: ${sinStock.map((i) => i.nombre).join(", ")}. Ajustá las cantidades en el carrito.`;
    return;
  }
  $("#error-pago").textContent = "";

  const boton = $("#form-checkout button[type=submit]");
  boton.disabled = true;
  $("#error-pago").textContent = "";
  try {
    if (!pedidoActual) {
      await crearPedidoEnServidor(comprador, envio);
    }
    if (modoReal) {
      await iniciarPagoReal();
    } else {
      abrirMercadoPago();
    }
  } catch (error) {
    console.error("No se pudo iniciar el pedido:", error);
    $("#error-pago").textContent = `⚠️ ${error.message}`;
  } finally {
    boton.disabled = false;
  }
}

// ============================================================
//  4.b MERCADO PAGO REAL (Checkout Pro en modo prueba)
// ============================================================

/** Pregunta al servidor si Mercado Pago está configurado */
async function detectarModoPago() {
  const respuesta = await fetch(`${API_PAGOS}/estado`, { signal: AbortSignal.timeout(3000) });
  if (!respuesta.ok) throw new Error(`No se pudo consultar la configuración de pago (${respuesta.status}).`);
  const datos = await respuesta.json();
  return datos.mercadoPago === true;
}

function mostrarModo() {
  $("#modo-pago").textContent = modoReal
    ? "🟢 Mercado Pago conectado (modo prueba): vas a ser redirigido para pagar."
    : "🧪 Pago de prueba local: no se realizará un cobro real.";
  $("#modo-pago").classList.toggle("real", modoReal);
}

async function iniciarPagoReal() {
  const boton = $("#form-checkout button[type=submit]");
  const textoOriginal = boton.textContent;
  boton.disabled = true;
  boton.textContent = "Conectando con Mercado Pago…";
  $("#error-pago").textContent = "";

  try {
    const respuesta = await fetch(`${API_PAGOS}/crear-preferencia`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        numeroPedido: pedidoActual.getNumero(),
      }),
    });
    const datos = await respuesta.json();
    if (!respuesta.ok || !datos.init_point) {
      throw new Error(datos.error || "No se pudo crear el pago.");
    }

    // Guardamos el pedido: al volver de Mercado Pago la página se recarga
    localStorage.setItem(CLAVE_PEDIDO_EN_CURSO, JSON.stringify(pedidoActual.toJSON()));
    marcarPaso("paso-pago");
    window.location.href = datos.init_point; // nos vamos a Mercado Pago
  } catch (error) {
    console.error(error);
    $("#error-pago").textContent = `⚠️ ${error.message} Revisá que el servidor esté corriendo e intentá de nuevo.`;
    boton.disabled = false;
    boton.textContent = textoOriginal;
  }
}

function traducirMetodoMP(tipo) {
  const metodos = { credit_card: "credito", debit_card: "debito", ticket: "efectivo", account_money: "cuenta" };
  return metodos[tipo] || "mercadopago";
}

function traducirMarcaMP(marca) {
  const marcas = { visa: "Visa", master: "Mastercard", amex: "American Express", debvisa: "Visa", debmaster: "Mastercard", maestro: "Maestro", cabal: "Cabal", naranja: "Naranja" };
  return marcas[marca] || (marca ? marca.charAt(0).toUpperCase() + marca.slice(1) : "");
}

const DETALLES_MP = {
  aprobado: "¡Listo! Mercado Pago acreditó tu pago.",
  pendiente: "Tu pago está pendiente. El historial se actualizará si Mercado Pago confirma la acreditación.",
  rechazado: "El pago no se completó. Podés intentarlo de nuevo con otro medio de pago.",
};

/**
 * Se ejecuta al cargar la página. Si la URL trae los parámetros que
 * agrega Mercado Pago (?status=...&payment_id=...), procesamos el resultado.
 * Devuelve true si había un retorno de Mercado Pago.
 */
async function procesarRetornoMP() {
  const params = new URLSearchParams(window.location.search);
  const idPago = params.get("payment_id") || params.get("collection_id");
  if (!params.has("preference_id") && !params.has("pedido") && !idPago) return false;

  history.replaceState(null, "", window.location.pathname);

  const numeroPedido = params.get("pedido");
  let pedidoEnCurso = null;
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_PEDIDO_EN_CURSO));
    if (guardado) pedidoEnCurso = Pedido.desdeJSON(guardado);
  } catch (error) {
    console.warn("No se pudo recuperar el pedido en curso.", error);
  }

  if (!pedidoEnCurso || pedidoEnCurso.getNumero() !== numeroPedido ||
      !numeroPedido || !idPago || !/^\d+$/.test(idPago)) {
    $("#error-pago").textContent = "No se pudo identificar el pedido o verificar el pago. Consultá tu historial antes de volver a intentarlo.";
    mostrarVista("#vista-checkout");
    return true;
  }

  try {
    const datos = await pedirAPI(`/pedidos/${encodeURIComponent(numeroPedido)}/verificar-pago`, {
      method: "POST",
      body: JSON.stringify({ paymentId: idPago }),
    });
    const pedidoDB = datos.pedido;
    const pagoDB = pedidoDB.pago || {};
    const estado = pedidoDB.estado;
    const pagoVista = {
      estado,
      detalle: DETALLES_MP[estado],
      idTransaccion: pagoDB.idTransaccion || idPago,
      metodo: traducirMetodoMP(pagoDB.metodo),
      marca: traducirMarcaMP(pagoDB.marca),
      ultimos4: pagoDB.ultimos4 || null,
      cuotas: pagoDB.cuotas || 1,
      monto: pedidoDB.total,
      fecha: pagoDB.fecha || new Date().toISOString(),
      real: true,
    };
    pedidoActual = construirPedido(pedidoDB, pagoVista);
    localStorage.removeItem(CLAVE_PEDIDO_EN_CURSO);
    if (estado !== "rechazado") vaciarCarrito();
    mostrarResultado(pedidoActual);
  } catch (error) {
    console.error("No se pudo verificar el resultado del pago:", error);
    $("#error-pago").textContent = `⚠️ ${error.message} El pedido sigue disponible en tu historial.`;
    mostrarVista("#vista-checkout");
  }
  return true;
}

/**
 * Busca qué páginas existen realmente en el sitio y usa la primera disponible.
 * Si no se puede comprobar (por ejemplo, con file://), conserva la ruta principal.
 */
async function resolverDestinos() {
  const existe = async (pagina) => {
    try {
      const respuesta = await fetch(pagina, { method: "HEAD", cache: "no-store" });
      return respuesta.ok;
    } catch {
      return false;
    }
  };

  for (const [clave, candidatas] of Object.entries(PAGINAS_CANDIDATAS)) {
    destinos[clave] = candidatas[candidatas.length - 1];
    for (const pagina of candidatas) {
      if (await existe(pagina)) {
        destinos[clave] = pagina;
        break;
      }
    }
  }

  // Actualizamos los enlaces fijos del HTML (data-destino="catalogo" / "carrito")
  document.querySelectorAll("[data-destino]").forEach((enlace) => {
    enlace.href = destinos[enlace.dataset.destino];
  });
}

/** Cuenta regresiva y redirección a la tienda (requisito del trabajo) */
function iniciarRedireccion(numeroPedido) {
  const urlDestino = numeroPedido
    ? `${destinos.inicio}?compra=${encodeURIComponent(numeroPedido)}`
    : destinos.inicio;
  let segundos = SEGUNDOS_REDIRECCION;
  const aviso = document.createElement("p");
  aviso.className = "res-redireccion";
  $("#vista-resultado").append(aviso);

  const actualizar = () => {
    aviso.innerHTML = `Volviendo a la tienda en <strong>${segundos}</strong> s… <a href="${urlDestino}">Ir ahora</a>`;
  };
  actualizar();
  const intervalo = setInterval(() => {
    segundos--;
    if (segundos <= 0) {
      clearInterval(intervalo);
      window.location.href = urlDestino;
      return;
    }
    actualizar();
  }, 1000);
}

// ============================================================
//  5. MODAL DE MERCADO PAGO (SIMULADO)
// ============================================================

function mostrarPasoMP(id) {
  ["#mp-paso-metodo", "#mp-form-tarjeta", "#mp-paso-efectivo", "#mp-procesando"].forEach((paso) => {
    $(paso).hidden = paso !== id;
  });
  $("#mp-cerrar").hidden = id === "#mp-procesando"; // no se puede cerrar mientras procesa
}

function abrirMercadoPago() {
  $("#mp-monto").textContent = formatearPrecio(pedidoActual.calcularTotal());
  $("#mp-form-tarjeta").reset();
  $(".mp-ayuda").open = false;
  mostrarErrores($("#mp-form-tarjeta"), {});
  $("#mp-marca-detectada").textContent = "";
  mostrarPasoMP("#mp-paso-metodo");
  $("#mp-modal").hidden = false;
  document.body.classList.add("sin-scroll");
  marcarPaso("paso-pago");
  $(".mp-metodo").focus();
}

function cerrarMercadoPago() {
  if (!$("#mp-procesando").hidden) return;
  $("#mp-modal").hidden = true;
  document.body.classList.remove("sin-scroll");
  marcarPaso("paso-datos");
}

function generarOpcionesCuotas() {
  const total = pedidoActual.calcularTotal();
  // Simulación: 1 y 3 cuotas sin interés, 6 cuotas con 15% de recargo
  const opciones = [
    { cuotas: 1, recargo: 0 },
    { cuotas: 3, recargo: 0 },
    { cuotas: 6, recargo: 0.15 },
  ];
  $("#mp-cuotas").innerHTML = opciones
    .map(({ cuotas, recargo }) => {
      const valorCuota = (total * (1 + recargo)) / cuotas;
      const texto = recargo === 0 ? "sin interés" : `total ${formatearPrecio(total * (1 + recargo))}`;
      return `<option value="${cuotas}">${cuotas} ${cuotas === 1 ? "cuota" : "cuotas"} de ${formatearPrecio(valorCuota)} (${texto})</option>`;
    })
    .join("");
}

function elegirMetodo(metodo) {
  metodoSeleccionado = metodo;
  if (metodo === "efectivo") {
    mostrarPasoMP("#mp-paso-efectivo");
    $("#mp-btn-efectivo").focus();
    return;
  }
  $("#mp-titulo-tarjeta").textContent = metodo === "credito" ? "Tarjeta de crédito" : "Tarjeta de débito";
  $("#mp-campo-cuotas").hidden = metodo !== "credito";
  if (metodo === "credito") generarOpcionesCuotas();
  mostrarPasoMP("#mp-form-tarjeta");
  $("#mp-numero").focus();
}

/** Formatea el número de tarjeta en grupos de 4 mientras se escribe */
function formatearNumeroTarjeta(evento) {
  const digitos = evento.target.value.replace(/\D/g, "").slice(0, 16);
  evento.target.value = digitos.replace(/(\d{4})(?=\d)/g, "$1 ");
  $("#mp-marca-detectada").textContent = MercadoPagoService.detectarMarca(digitos) || "";
}

function formatearVencimiento(evento) {
  const digitos = evento.target.value.replace(/\D/g, "").slice(0, 4);
  evento.target.value = digitos.length > 2 ? `${digitos.slice(0, 2)}/${digitos.slice(2)}` : digitos;
}

function soloNumeros(evento) {
  evento.target.value = evento.target.value.replace(/\D/g, "");
}

function autocompletarPrueba() {
  $("#mp-numero").value = "4509 9535 6623 3704";
  $("#mp-marca-detectada").textContent = "Visa";
  $("#mp-titular").value = "APRO";
  $("#mp-vencimiento").value = "11/30";
  $("#mp-cvv").value = "123";
  $("#mp-dni").value = "12345678";
  $("#mp-titular").focus();
  $("#mp-titular").select();
}

async function pagarConTarjeta(evento) {
  evento.preventDefault();
  const datosTarjeta = {
    numero: $("#mp-numero").value,
    titular: $("#mp-titular").value,
    vencimiento: $("#mp-vencimiento").value,
    cvv: $("#mp-cvv").value,
    dni: $("#mp-dni").value,
  };

  const { valido, errores } = MercadoPagoService.validarTarjeta(datosTarjeta);
  mostrarErrores($("#mp-form-tarjeta"), errores);
  if (!valido) return;

  // Sólo enviamos al servicio lo necesario; CVV y vencimiento no se guardan
  await procesar({
    metodo: metodoSeleccionado,
    numero: datosTarjeta.numero,
    titular: datosTarjeta.titular,
    cuotas: $("#mp-cuotas").value,
  });
}

async function pagarEnEfectivo() {
  await procesar({ metodo: "efectivo" });
}

async function procesar(datosPago) {
  mostrarPasoMP("#mp-procesando");
  try {
    const resultado = await MercadoPagoService.procesarPago(pedidoActual, datosPago);
    pedidoActual.registrarPago(resultado);
    const guardado = await pedirAPI(`/pedidos/${encodeURIComponent(pedidoActual.getNumero())}/simular-pago`, {
      method: "POST",
      body: JSON.stringify({
        estado: resultado.estado,
        metodo: datosPago.metodo,
      }),
    });
    pedidoActual = construirPedido(guardado.pedido, pedidoActual.getPago());

    // Aprobado o pendiente: el pedido queda generado, se vacía el carrito.
    // Rechazado: el carrito se conserva para poder reintentar.
    if (resultado.estado !== MercadoPagoService.ESTADOS.RECHAZADO) {
      vaciarCarrito();
    }
    $("#mp-modal").hidden = true;
    document.body.classList.remove("sin-scroll");
    mostrarResultado(pedidoActual);
  } catch (error) {
    console.error("Error al procesar el pago:", error);
    mostrarPasoMP("#mp-paso-metodo");
    alertaInline("Ocurrió un error inesperado. Intentá nuevamente.");
  }
}

function alertaInline(mensaje) {
  const aviso = document.createElement("p");
  aviso.className = "mp-alerta";
  aviso.textContent = mensaje;
  $("#mp-paso-metodo").prepend(aviso);
  setTimeout(() => aviso.remove(), 4000);
}

// ============================================================
//  6. PANTALLA DE RESULTADO
// ============================================================

const CONFIG_RESULTADO = {
  aprobado: { icono: "✓", clase: "ok", titulo: "¡Pago aprobado!" },
  pendiente: { icono: "⏳", clase: "pendiente", titulo: "Pago pendiente" },
  rechazado: { icono: "✕", clase: "rechazado", titulo: "Pago rechazado" },
};

function textoMedioPago(pago) {
  if (pago.metodo === "efectivo") return "Efectivo (Rapipago / Pago Fácil)";
  if (pago.metodo === "cuenta") return "Dinero en cuenta de Mercado Pago";
  if (pago.metodo === "mercadopago" || !pago.ultimos4) return "Mercado Pago";
  const tipo = pago.metodo === "credito" ? "crédito" : "débito";
  const cuotas = pago.metodo === "credito" ? ` · ${pago.cuotas} ${pago.cuotas === 1 ? "cuota" : "cuotas"}` : "";
  return `${pago.marca} ${tipo} terminada en ${pago.ultimos4}${cuotas}`;
}

function mostrarResultado(pedido) {
  const pago = pedido.getPago();
  const comprador = pedido.getComprador();
  const envio = pedido.getEnvio();
  const config = CONFIG_RESULTADO[pedido.getEstado()];
  const fecha = pedido.getFecha().toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });
  const avisoPedido =
    `El pedido quedó asociado a <strong>${escaparHTML(comprador.email)}</strong> y está disponible en tu historial.`;

  let acciones;
  if (pedido.getEstado() === "rechazado") {
    acciones = `
      <button type="button" class="btn btn-primario" id="btn-reintentar">Reintentar el pago</button>
      <a href="${destinos.carrito}" class="btn btn-link">Volver al carrito</a>`;
  } else {
    acciones = `
      <a href="${destinos.inicio}" class="btn btn-primario">Volver a la tienda</a>
      <a href="${destinos.catalogo}" class="btn btn-link">Seguir comprando</a>`;
  }

  const cupon = pago.codigoCupon
    ? `<div class="res-cupon"><small>Código de pago</small><strong>${pago.codigoCupon}</strong></div>`
    : "";

  $("#vista-resultado").innerHTML = `
    <div class="res-icono res-${config.clase}" aria-hidden="true">${config.icono}</div>
    <h1>${config.titulo}</h1>
    <p class="res-detalle">${escaparHTML(pago.detalle)}</p>
    ${cupon}
    <dl class="res-datos">
      <div><dt>N.º de pedido</dt><dd>${pedido.getNumero()}</dd></div>
      <div><dt>Operación MP</dt><dd>${pago.idTransaccion}</dd></div>
      <div><dt>Fecha</dt><dd>${fecha}</dd></div>
      <div><dt>Medio de pago</dt><dd>${escaparHTML(textoMedioPago(pago))}</dd></div>
      <div><dt>Entrega</dt><dd>${envio.tipo === "domicilio" ? escaparHTML(envio.direccion) : "Retiro en el taller"}</dd></div>
      <div><dt>Productos</dt><dd>${pedido.getCantidadUnidades()} unidades</dd></div>
      <div class="res-total"><dt>Total</dt><dd>${formatearPrecio(pedido.calcularTotal())}</dd></div>
    </dl>
    ${pedido.getEstado() !== "rechazado" ? `<p class="res-email">${avisoPedido}</p>` : ""}
    <div class="res-acciones">${acciones}</div>`;

  mostrarVista("#vista-resultado");
  marcarPaso(pedido.getEstado() === "rechazado" ? "paso-pago" : "paso-confirmacion");
  window.scrollTo({ top: 0, behavior: "smooth" });

  const reintentar = $("#btn-reintentar");
  if (reintentar) {
    reintentar.addEventListener("click", () => {
      if (pago.real) {
        // Volvemos al checkout con el carrito intacto para generar un nuevo pago
        window.location.href = window.location.pathname;
        return;
      }
      mostrarVista("#vista-checkout");
      abrirMercadoPago();
    });
  }

  // Requisito: después de un pago aprobado se vuelve a la tienda
  if (pedido.getEstado() === "aprobado") iniciarRedireccion(pedido.getNumero());
}

// ============================================================
//  7. INICIALIZACIÓN
// ============================================================

function iniciarCheckout() {
  itemsCarrito = leerCarrito();

  if (itemsCarrito.length === 0) {
    mostrarVista("#vista-vacio");
    return;
  }

  $("#precio-envio").textContent = formatearPrecio(COSTO_ENVIO_DOMICILIO);
  renderizarResumen();
  mostrarVista("#vista-checkout");
  marcarPaso("paso-datos");
}

function registrarEventos() {
  // Formulario principal
  $("#form-checkout").addEventListener("submit", manejarEnvioFormulario);
  document.querySelectorAll('input[name="envio"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      $("#datos-domicilio").hidden = obtenerCostoEnvio() === 0;
      actualizarTotales();
    });
  });

  // Al corregir un campo, se borra su mensaje de error
  ["#form-checkout", "#mp-form-tarjeta"].forEach((selector) => {
    $(selector).addEventListener("input", (e) => {
      const campo = e.target.closest(".campo");
      if (!campo || !e.target.classList.contains("invalido")) return;
      e.target.classList.remove("invalido");
      const error = campo.querySelector(".error");
      if (error) error.textContent = "";
    });
  });

  // Modal de Mercado Pago
  $("#mp-cerrar").addEventListener("click", cerrarMercadoPago);
  $("#mp-modal").addEventListener("click", (e) => {
    if (e.target.id === "mp-modal") cerrarMercadoPago();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("#mp-modal").hidden) cerrarMercadoPago();
  });
  document.querySelectorAll(".mp-metodo").forEach((boton) => {
    boton.addEventListener("click", () => elegirMetodo(boton.dataset.metodo));
  });
  document.querySelectorAll(".mp-volver").forEach((boton) => {
    boton.addEventListener("click", () => mostrarPasoMP("#mp-paso-metodo"));
  });

  $("#mp-numero").addEventListener("input", formatearNumeroTarjeta);
  $("#mp-vencimiento").addEventListener("input", formatearVencimiento);
  $("#mp-cvv").addEventListener("input", soloNumeros);
  $("#mp-dni").addEventListener("input", soloNumeros);
  $("#mp-autocompletar").addEventListener("click", autocompletarPrueba);
  $("#mp-form-tarjeta").addEventListener("submit", pagarConTarjeta);
  $("#mp-btn-efectivo").addEventListener("click", pagarEnEfectivo);
}

document.addEventListener("DOMContentLoaded", async () => {
  registrarEventos();
  try {
    if (!(await cargarUsuarioCheckout())) return;
  } catch (error) {
    console.error("No se pudo verificar la sesión:", error);
    $("#error-pago").textContent = "No se pudo verificar tu sesión. Recargá la página o iniciá sesión nuevamente.";
    mostrarVista("#vista-checkout");
    return;
  }
  await resolverDestinos();
  try {
    modoReal = await detectarModoPago();
  } catch (error) {
    console.error("No se pudo consultar la configuración de Mercado Pago:", error);
    $("#error-pago").textContent = "No se pudo consultar el servidor de pagos. Recargá la página e intentá nuevamente.";
    mostrarVista("#vista-checkout");
    return;
  }
  mostrarModo();

  // ¿Venimos de vuelta desde Mercado Pago? Entonces mostramos el resultado
  const volvioDeMP = modoReal && (await procesarRetornoMP());
  if (!volvioDeMP) iniciarCheckout();
});
