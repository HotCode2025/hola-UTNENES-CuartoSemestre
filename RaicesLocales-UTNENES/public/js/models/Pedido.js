/**
 * ============================================================
 *  Clase Pedido
 *  Responsable: Matías Tobares (Checkout y Mercado Pago)
 * ------------------------------------------------------------
 *  Representa una orden de compra generada en el checkout.
 *  Aplica encapsulación con campos privados (#) y expone
 *  la información únicamente mediante getters y métodos.
 * ============================================================
 */
class Pedido {

  // Estados válidos que puede tener un pedido a lo largo del checkout
  static ESTADOS = ["iniciado", "aprobado", "pendiente", "rechazado"];

  #numero;
  #fecha;
  #comprador;   // { nombre, apellido, email, telefono, dni }
  #items;       // [{ id, nombre, precio, cantidad, imagen, categoria }]
  #envio;       // { tipo: "retiro" | "domicilio", costo, direccion }
  #estado;
  #pago;        // resultado devuelto por MercadoPagoService

  constructor(comprador, items, envio) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("No se puede crear un pedido sin productos.");
    }

    this.#numero = Pedido.generarNumero();
    this.#fecha = new Date();
    this.#comprador = { ...comprador };
    // Copiamos cada item para que el pedido no dependa del carrito original
    this.#items = items.map((item) => ({ ...item }));
    this.#envio = { ...envio };
    this.#estado = "iniciado";
    this.#pago = null;
  }

  /**
   * Reconstruye un Pedido a partir del objeto guardado con toJSON().
   * Se usa cuando Mercado Pago nos devuelve a la página: el navegador
   * recargó y perdimos el objeto, pero lo teníamos en LocalStorage.
   * (Un método static de la clase SÍ puede escribir los campos privados.)
   */
  static desdeJSON(datos) {
    const pedido = new Pedido(datos.comprador, datos.items, datos.envio);
    pedido.#numero = datos.numero;
    pedido.#fecha = new Date(datos.fecha);
    pedido.#estado = datos.estado;
    pedido.#pago = datos.pago;
    return pedido;
  }

  /** Genera un número de orden legible, ej: RL-48213907 */
  static generarNumero() {
    return "RL-" + Date.now().toString().slice(-8);
  }

  // ---------------- Getters ----------------

  getNumero() {
    return this.#numero;
  }

  getFecha() {
    return this.#fecha;
  }

  getComprador() {
    return { ...this.#comprador };
  }

  getItems() {
    return this.#items.map((item) => ({ ...item }));
  }

  getEnvio() {
    return { ...this.#envio };
  }

  getEstado() {
    return this.#estado;
  }

  getPago() {
    return this.#pago ? { ...this.#pago } : null;
  }

  // ---------------- Cálculos ----------------

  /** Suma de precio x cantidad de todos los productos */
  calcularSubtotal() {
    return this.#items.reduce(
      (total, item) => total + item.precio * item.cantidad,
      0
    );
  }

  /** Subtotal + costo de envío (las comisiones NO afectan al total en esta versión) */
  calcularTotal() {
    return this.calcularSubtotal() + this.#envio.costo;
  }

  /** Cantidad total de unidades (no de productos distintos) */
  getCantidadUnidades() {
    return this.#items.reduce((total, item) => total + item.cantidad, 0);
  }

  // ---------------- Setters / métodos ----------------

  /** Cambia el estado validando que sea uno de los permitidos */
  setEstado(estado) {
    if (!Pedido.ESTADOS.includes(estado)) {
      throw new Error(`Estado de pedido inválido: ${estado}`);
    }
    this.#estado = estado;
  }

  /** Guarda el resultado del pago y actualiza el estado del pedido */
  registrarPago(resultadoPago) {
    this.#pago = { ...resultadoPago };
    this.setEstado(resultadoPago.estado);
  }

  /**
   * JSON.stringify NO puede leer campos privados (#). Este objeto plano
   * permite conservar el pedido mientras se completa el pago externo;
   * PostgreSQL sigue siendo la fuente de verdad del historial.
   */
  toJSON() {
    return {
      numero: this.#numero,
      fecha: this.#fecha.toISOString(),
      comprador: this.#comprador,
      items: this.#items,
      envio: this.#envio,
      subtotal: this.calcularSubtotal(),
      total: this.calcularTotal(),
      estado: this.#estado,
      pago: this.#pago,
    };
  }
}
