export class Carrito {
  #productos = [];
  #clave = "carrito";

  constructor() {
    const guardado = localStorage.getItem(this.#clave);
    const anterior = guardado ? null : localStorage.getItem("raices-locales:carrito");
    const datos = guardado ?? anterior;
    if (datos) {
      const productos = JSON.parse(datos);
      if (!Array.isArray(productos)) {
        throw new Error("El carrito guardado tiene un formato inválido.");
      }
      this.#productos = productos;
      if (anterior) {
        this.#guardar();
        localStorage.removeItem("raices-locales:carrito");
      }
    }
  }

  #guardar() {
    localStorage.setItem(this.#clave, JSON.stringify(this.#productos));
  }

  // El catálogo entrega los datos del producto. Agregarlo otra vez suma una unidad.
  agregarProducto(producto) {
    const { id, stock, precio } = producto;
    const item = this.#productos.find(producto => producto.id === id);
    if (item) return this.actualizarCantidad(id, item.cantidad + 1);
    if (!Number.isInteger(stock) || stock < 1 || !Number.isFinite(Number(precio)) || Number(precio) < 0) {
      return false;
    }
    this.#productos.push({ ...producto, cantidad: 1 });
    this.#guardar();
    return true;
  }

  eliminarProducto(id) {
    this.#productos = this.#productos.filter(producto => producto.id !== id);
    this.#guardar();
  }

  actualizarCantidad(id, cantidad) {
    const item = this.#productos.find(producto => producto.id === id);
    if (!item || !Number.isInteger(cantidad) || cantidad < 1 || cantidad > item.stock) return false;
    item.cantidad = cantidad;
    this.#guardar();
    return true;
  }

  vaciarCarrito() {
    this.#productos = [];
    this.#guardar();
  }

  calcularTotal() {
    // Sumamos centavos enteros para evitar errores de precisión con precios decimales.
    const centavos = this.obtenerProductos().reduce((suma, item) => suma + Math.round(item.subtotal * 100), 0);
    return centavos / 100;
  }

  // Devolvemos copias con su subtotal para que las vistas no modifiquen el estado privado.
  obtenerProductos() {
    return this.#productos.map(item => ({
      ...item,
      subtotal: Math.round(item.precio * 100) * item.cantidad / 100
    }));
  }
}
