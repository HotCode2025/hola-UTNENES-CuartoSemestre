// Servicio de productos conectado a la API del servidor.

export class ProductoService {
  #fuente;
  #cache = null;

  constructor(fuente) {
    this.#fuente = fuente;
  }

  async obtenerTodos() {
    if (!this.#cache) {
      this.#cache = await this.#fuente.obtenerProductos();
    }
    return [...this.#cache];
  }

  async obtenerPorId(id) {
    const productos = await this.obtenerTodos();
    return productos.find((p) => p.getId() === Number(id)) ?? null;
  }

  // Fuerza a releer los datos la próxima vez.
  limpiarCache() {
    this.#cache = null;
  }
}
