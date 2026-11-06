/**
 * ============================================================
 *  Servidor de pagos — Raíces Locales
 *  Responsable: Matías Tobares (Checkout y Mercado Pago)
 * ------------------------------------------------------------
 *  ¿Por qué hace falta un servidor?
 *  Mercado Pago exige crear la "preferencia de pago" con el
 *  ACCESS TOKEN (clave privada). Si la ponemos en el JavaScript
 *  del navegador, cualquiera la puede ver. Por eso vive acá,
 *  en el archivo .env, y el navegador nunca la conoce.
 *
 *  Este servidor además sirve todo el sitio (HTML, CSS, JS),
 *  así con UN solo túnel queda todo online.
 *
 *  Endpoints:
 *    /api/auth/*                    -> registro, sesión y cierre de sesión
 *    /api/pedidos                   -> creación e historial de pedidos
 *    POST /api/crear-preferencia    -> crea el pago desde el pedido guardado
 * ============================================================
 */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const path = require("path");
const express = require("express");
const { randomBytes } = require("node:crypto");
const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");
const { ArtesanoRepositorioDB } = require("./db/ArtesanoRepositorioDB.js");
const { probarConexion } = require("./db/conexion.js");
const { PedidoRepositorioDB } = require("./db/PedidoRepositorioDB.js");
const { ProductoRepositorioDB } = require("./db/ProductoRepositorioDB.js");
const { UsuarioRepositorioDB } = require("./db/UsuarioRepositorioDB.js");
const {
  borrarCookie,
  crearSesion,
  generarPassword,
  hashToken,
  requiereSesion,
  verificarPassword,
} = require("./auth.js");

const PUERTO = process.env.PORT || 3000;
const COSTO_ENVIO_DOMICILIO = 3500;
const ACCESS_TOKEN = (process.env.MP_ACCESS_TOKEN || "").trim();
const CARPETA_SITIO = path.join(__dirname, "..", "..", "public");
const PAGINA_RETORNO = "checkout.html"; // Mercado Pago vuelve acá con el resultado

const mpConfigurado = ACCESS_TOKEN.length > 20 && !ACCESS_TOKEN.includes("XXXX");
const clienteMP = mpConfigurado ? new MercadoPagoConfig({ accessToken: ACCESS_TOKEN }) : null;

const app = express();
app.set("trust proxy", true); // necesario detrás del túnel para detectar https
app.use(express.json());

// ---------------- Utilidades ----------------

/**
 * URL pública del sitio. Si está definida en .env (BASE_URL) se usa esa;
 * si no, se arma con el host desde el que llegó la petición (sirve con el túnel).
 */
function obtenerUrlBase(req) {
  if (process.env.BASE_URL) return process.env.BASE_URL.replace(/\/$/, "");
  return `${req.protocol}://${req.get("host")}`;
}

function estadoMercadoPago(estado) {
  if (estado === "approved") return "aprobado";
  if (["pending", "in_process", "authorized", "in_mediation"].includes(estado)) return "pendiente";
  return "rechazado";
}

function validarItemsSolicitados(items) {
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) return null;
  const normalizados = [];
  const ids = new Set();
  for (const item of items) {
    const id = String(item?.id ?? "");
    const cantidad = Number(item?.cantidad);
    if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)) ||
        !Number.isSafeInteger(cantidad) || cantidad < 1 || cantidad > 99 || ids.has(id)) {
      return null;
    }
    ids.add(id);
    normalizados.push({ id, cantidad });
  }
  normalizados.sort((a, b) => Number(a.id) - Number(b.id));
  return normalizados;
}

// ---------------- API ----------------

app.get("/api/salud/base-datos", async (req, res) => {
  try {
    const ahora = await probarConexion();
    res.json({ estado: "conectada", horaServidor: ahora });
  } catch (error) {
    console.error("✖ No se pudo conectar a PostgreSQL:", error?.message || error);
    res.status(503).json({ error: "No se pudo conectar a PostgreSQL." });
  }
});

app.get("/api/estado", (req, res) => {
  res.json({ mercadoPago: mpConfigurado });
});

app.post("/api/auth/registro", async (req, res) => {
  const nombre = String(req.body?.nombre || "").trim();
  const apellido = String(req.body?.apellido || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  if (nombre.length < 2 || nombre.length > 80 || apellido.length < 2 || apellido.length > 80) {
    return res.status(400).json({ error: "Ingresá un nombre y apellido válidos." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
    return res.status(400).json({ error: "Ingresá un e-mail válido." });
  }
  if (password.length < 8 || password.length > 128) {
    return res.status(400).json({ error: "La contraseña debe tener entre 8 y 128 caracteres." });
  }

  try {
    const credenciales = await generarPassword(password);
    const usuario = await UsuarioRepositorioDB.crear({
      nombre,
      apellido,
      email,
      passwordHash: credenciales.hash,
      passwordSalt: credenciales.salt,
    });
    await crearSesion(usuario, req, res);
    res.status(201).json({ usuario });
  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ error: "Ese e-mail ya tiene una cuenta." });
    console.error("✖ No se pudo registrar el usuario:", error?.message || error);
    res.status(500).json({ error: "No se pudo completar el registro." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  try {
    const usuario = await UsuarioRepositorioDB.obtenerPorEmail(email);
    const credencialesValidas = usuario
      ? await verificarPassword(password, usuario.password_salt, usuario.password_hash)
      : false;
    if (!credencialesValidas) {
      return res.status(401).json({ error: "E-mail o contraseña incorrectos." });
    }
    await crearSesion(usuario, req, res);
    res.json({
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
      },
    });
  } catch (error) {
    console.error("✖ No se pudo iniciar sesión:", error?.message || error);
    res.status(500).json({ error: "No se pudo iniciar sesión." });
  }
});

app.get("/api/auth/me", requiereSesion, (req, res) => {
  res.json({ usuario: req.usuario });
});

app.post("/api/auth/logout", requiereSesion, async (req, res) => {
  try {
    await UsuarioRepositorioDB.eliminarSesion(hashToken(req.tokenSesion));
    borrarCookie(res, req);
    res.status(204).end();
  } catch (error) {
    console.error("✖ No se pudo cerrar la sesión:", error?.message || error);
    res.status(500).json({ error: "No se pudo cerrar la sesión." });
  }
});

app.get("/api/productos", async (req, res) => {
  try {
    res.json(await ProductoRepositorioDB.obtenerTodos());
  } catch (error) {
    console.error("✖ No se pudieron consultar los productos:", error?.message || error);
    res.status(500).json({ error: "No se pudieron consultar los productos." });
  }
});

app.get("/api/artesanos", async (req, res) => {
  try {
    res.json(await ArtesanoRepositorioDB.obtenerTodos());
  } catch (error) {
    console.error("✖ No se pudieron consultar los artesanos:", error?.message || error);
    res.status(500).json({ error: "No se pudieron consultar los artesanos." });
  }
});

app.get("/api/artesanos/:id", async (req, res) => {
  if (!/^\d+$/.test(req.params.id)) {
    return res.status(400).json({ error: "ID de artesano inválido." });
  }

  try {
    const artesano = await ArtesanoRepositorioDB.obtenerPorId(Number(req.params.id));
    if (!artesano) {
      return res.status(404).json({ error: "No se encontró el artesano solicitado." });
    }

    artesano.productos = await ProductoRepositorioDB.obtenerPorArtesano(Number(req.params.id));
    res.json(artesano);
  } catch (error) {
    console.error("✖ No se pudo consultar el perfil del artesano:", error?.message || error);
    res.status(500).json({ error: "No se pudo consultar el perfil del artesano." });
  }
});

app.post("/api/pedidos", requiereSesion, async (req, res) => {
  const nombre = String(req.body?.comprador?.nombre || "").trim();
  const apellido = String(req.body?.comprador?.apellido || "").trim();
  const telefono = String(req.body?.comprador?.telefono || "").trim();
  const envioSolicitado = req.body?.envio || {};
  const itemsSolicitados = validarItemsSolicitados(req.body?.items);

  if (nombre.length < 2 || nombre.length > 80 || apellido.length < 2 || apellido.length > 80) {
    return res.status(400).json({ error: "Los datos del comprador no son válidos." });
  }
  if (telefono.replace(/\D/g, "").length < 8 || telefono.length > 40) {
    return res.status(400).json({ error: "Ingresá un teléfono válido." });
  }
  if (!itemsSolicitados) {
    return res.status(400).json({ error: "El carrito tiene productos o cantidades inválidas." });
  }
  if (!["retiro", "domicilio"].includes(envioSolicitado.tipo)) {
    return res.status(400).json({ error: "Elegí un método de entrega válido." });
  }

  const direccion = envioSolicitado.tipo === "domicilio"
    ? String(envioSolicitado.direccion || "").trim().slice(0, 300)
    : null;
  if (envioSolicitado.tipo === "domicilio" && direccion.length < 8) {
    return res.status(400).json({ error: "La dirección de entrega está incompleta." });
  }

  try {
    const pedido = await PedidoRepositorioDB.crear({
      numero: `RL-${randomBytes(6).toString("hex").toUpperCase()}`,
      usuarioId: req.usuario.id,
      comprador: { nombre, apellido, email: req.usuario.email, telefono },
      envio: {
        tipo: envioSolicitado.tipo,
        costo: envioSolicitado.tipo === "domicilio" ? COSTO_ENVIO_DOMICILIO : 0,
        direccion,
      },
      itemsSolicitados,
    });
    res.status(201).json({ pedido });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    if (error.code === "23505") return res.status(409).json({ error: "No se pudo generar el número de pedido. Intentá nuevamente." });
    console.error("✖ No se pudo guardar el pedido:", error?.message || error);
    res.status(500).json({ error: "No se pudo guardar el pedido." });
  }
});

app.get("/api/pedidos", requiereSesion, async (req, res) => {
  try {
    res.json({ pedidos: await PedidoRepositorioDB.obtenerHistorial(req.usuario.id) });
  } catch (error) {
    console.error("✖ No se pudo consultar el historial:", error?.message || error);
    res.status(500).json({ error: "No se pudo consultar el historial de compras." });
  }
});

app.get("/api/pedidos/:numero", requiereSesion, async (req, res) => {
  try {
    const pedido = await PedidoRepositorioDB.obtenerPorNumero(req.params.numero, req.usuario.id);
    if (!pedido) return res.status(404).json({ error: "No se encontró el pedido." });
    res.json({ pedido });
  } catch (error) {
    console.error("✖ No se pudo consultar el pedido:", error?.message || error);
    res.status(500).json({ error: "No se pudo consultar el pedido." });
  }
});

app.post("/api/pedidos/:numero/simular-pago", requiereSesion, async (req, res) => {
  if (mpConfigurado) {
    return res.status(409).json({ error: "El pago simulado está desactivado mientras Mercado Pago está configurado." });
  }
  const estado = req.body?.estado;
  const metodo = String(req.body?.metodo || "");
  if (!["aprobado", "pendiente", "rechazado"].includes(estado)) {
    return res.status(400).json({ error: "El resultado de pago no es válido." });
  }
  if (!["credito", "debito", "efectivo"].includes(metodo)) {
    return res.status(400).json({ error: "El medio de pago no es válido." });
  }

  try {
    const pago = { modo: "simulado", metodo, fecha: new Date().toISOString() };
    const pedido = await PedidoRepositorioDB.actualizarEstado({
      numero: req.params.numero,
      usuarioId: req.usuario.id,
      estado,
      pago,
    });
    if (!pedido) return res.status(404).json({ error: "No se encontró el pedido." });
    res.json({ pedido });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    console.error("✖ No se pudo guardar el resultado simulado:", error?.message || error);
    res.status(500).json({ error: "No se pudo guardar el resultado del pago." });
  }
});

app.post("/api/crear-preferencia", requiereSesion, async (req, res) => {
  if (!mpConfigurado) {
    return res.status(503).json({ error: "Falta configurar MP_ACCESS_TOKEN en server/.env" });
  }

  const numeroPedido = String(req.body?.numeroPedido || "");
  try {
    const pedido = await PedidoRepositorioDB.obtenerPorNumero(numeroPedido, req.usuario.id);
    if (!pedido) return res.status(404).json({ error: "No se encontró el pedido." });
    if (pedido.estado === "aprobado") return res.status(409).json({ error: "Este pedido ya fue aprobado." });

    const productos = pedido.items.map((item) => ({
      id: String(item.id),
      title: item.nombre.slice(0, 120),
      quantity: item.cantidad,
      unit_price: item.precio,
      currency_id: "ARS",
    }));
    if (pedido.envio.costo > 0) {
      productos.push({
        id: "envio",
        title: "Envío a domicilio",
        quantity: 1,
        unit_price: pedido.envio.costo,
        currency_id: "ARS",
      });
    }

    const base = obtenerUrlBase(req);
    const urlRetorno = `${base}/${PAGINA_RETORNO}?pedido=${encodeURIComponent(numeroPedido)}`;
    const esHttps = base.startsWith("https://");

    const cuerpo = {
      items: productos,
      external_reference: numeroPedido,
      statement_descriptor: "RAICES LOCALES",
      back_urls: { success: urlRetorno, pending: urlRetorno, failure: urlRetorno },
    };
    if (esHttps) {
      cuerpo.auto_return = "approved";
      cuerpo.notification_url = `${base}/api/webhooks/mercado-pago`;
    }

    const preferencia = await new Preference(clienteMP).create({ body: cuerpo });
    console.log(`✔ Preferencia creada ${preferencia.id} para el pedido ${numeroPedido}`);
    res.json({ id: preferencia.id, init_point: preferencia.init_point, autoReturn: esHttps });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    console.error("✖ Error de Mercado Pago:", error?.message || error);
    res.status(502).json({ error: "Mercado Pago rechazó la creación del pago." });
  }
});

app.post("/api/webhooks/mercado-pago", async (req, res) => {
  if (!mpConfigurado) return res.status(503).end();
  const tipo = String(req.body?.type || req.query.type || "");
  if (tipo !== "payment") return res.sendStatus(200);

  const paymentId = String(req.body?.data?.id || req.query["data.id"] || "");
  if (!/^\d+$/.test(paymentId)) return res.status(400).end();

  let numero;
  try {
    const pagoMP = await new Payment(clienteMP).get({ id: paymentId });
    numero = String(pagoMP.external_reference || "");
    const pedido = await PedidoRepositorioDB.obtenerPorNumero(numero);
    if (!pedido) return res.sendStatus(200);

    const montoPago = Number(pagoMP.transaction_amount);
    if (
      String(pagoMP.id) !== paymentId ||
      pagoMP.currency_id !== "ARS" ||
      !Number.isFinite(montoPago) ||
      Math.abs(montoPago - pedido.total) > 0.01
    ) {
      console.error(`✖ La notificación de Mercado Pago no coincide con el pedido ${numero}.`);
      return res.status(400).end();
    }

    const estado = estadoMercadoPago(pagoMP.status);
    const pago = {
      modo: "mercado_pago",
      idTransaccion: paymentId,
      estadoOriginal: pagoMP.status,
      metodo: pagoMP.payment_type_id || null,
      marca: pagoMP.payment_method_id || null,
      ultimos4: pagoMP.card?.last_four_digits || null,
      cuotas: pagoMP.installments || 1,
      fecha: new Date().toISOString(),
    };
    await PedidoRepositorioDB.actualizarEstado({
      numero,
      usuarioId: null,
      estado,
      pago,
    });
    res.sendStatus(200);
  } catch (error) {
    if (error.status === 409 && numero) {
      try {
        const pedido = await PedidoRepositorioDB.obtenerPorNumero(numero);
        if (pedido?.estado === "aprobado") return res.sendStatus(200);
      } catch (consultaError) {
        console.error("✖ No se pudo confirmar el estado del pedido:", consultaError?.message || consultaError);
      }
    }
    console.error("✖ No se pudo procesar la notificación de Mercado Pago:", error?.message || error);
    res.status(502).end();
  }
});

app.post("/api/pedidos/:numero/verificar-pago", requiereSesion, async (req, res) => {
  if (!mpConfigurado) return res.status(503).json({ error: "Mercado Pago no está configurado." });
  const paymentId = String(req.body?.paymentId || "");
  if (!/^\d+$/.test(paymentId)) return res.status(400).json({ error: "ID de pago inválido." });

  try {
    const pedido = await PedidoRepositorioDB.obtenerPorNumero(req.params.numero, req.usuario.id);
    if (!pedido) return res.status(404).json({ error: "No se encontró el pedido." });
    const pagoMP = await new Payment(clienteMP).get({ id: paymentId });
    if (String(pagoMP.id) !== paymentId) {
      return res.status(403).json({ error: "Mercado Pago no confirmó el ID de pago." });
    }
    if (String(pagoMP.external_reference || "") !== pedido.numero) {
      return res.status(403).json({ error: "El pago no corresponde a este pedido." });
    }
    if (pagoMP.currency_id !== "ARS") {
      return res.status(409).json({ error: "La moneda del pago no coincide con el pedido." });
    }
    const montoPago = Number(pagoMP.transaction_amount);
    if (!Number.isFinite(montoPago) || Math.abs(montoPago - pedido.total) > 0.01) {
      return res.status(409).json({ error: "El monto del pago no coincide con el pedido." });
    }

    const estado = estadoMercadoPago(pagoMP.status);
    const pago = {
      modo: "mercado_pago",
      idTransaccion: String(pagoMP.id),
      estadoOriginal: pagoMP.status,
      metodo: pagoMP.payment_type_id || null,
      marca: pagoMP.payment_method_id || null,
      ultimos4: pagoMP.card?.last_four_digits || null,
      cuotas: pagoMP.installments || 1,
      fecha: new Date().toISOString(),
    };
    const actualizado = await PedidoRepositorioDB.actualizarEstado({
      numero: pedido.numero,
      usuarioId: req.usuario.id,
      estado,
      pago,
    });
    res.json({ pedido: actualizado });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    console.error("✖ No se pudo verificar el pago:", error?.message || error);
    res.status(502).json({ error: "No se pudo verificar el pago con Mercado Pago." });
  }
});

// ---------------- Sitio estático ----------------

// Nunca servir la carpeta del servidor (ahí está el .env con la clave)
app.use("/server", (req, res) => res.status(404).end());
app.use(express.static(CARPETA_SITIO, { dotfiles: "deny" }));

app.listen(PUERTO, () => {
  console.log("");
  console.log("🌱 Raíces Locales corriendo en  http://localhost:" + PUERTO + "/");
  console.log(mpConfigurado
    ? "💳 Mercado Pago: CONFIGURADO (pagos de prueba reales)"
    : "⚠️ Mercado Pago: SIN CONFIGURAR -> el checkout usa el pago de prueba local");
  console.log("👉 Para acceder desde otra red, abrí el túnel en otra terminal (ver GUIA-CHECKOUT.md)");
  console.log("");
});
