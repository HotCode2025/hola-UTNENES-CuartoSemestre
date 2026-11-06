// Lógica pura del catálogo: filtrar, buscar y ordenar productos.
// No toca el DOM, así se puede reutilizar en cualquier página.

const normalizar = (texto) =>
  String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, ""); // quita tildes

export const ORDENES = {
  RELEVANCIA: "relevancia", // destacados primero
  PRECIO_ASC: "precio-asc",
  PRECIO_DESC: "precio-desc",
  NOMBRE: "nombre",
};

export class Catalogo {
  #productos;

  constructor(productos = []) {
    this.#productos = [...productos];
  }

  obtenerTodos() {
    return [...this.#productos];
  }

  obtenerCategorias() {
    const categorias = new Set(this.#productos.map((p) => p.getCategoria()).filter(Boolean));
    return [...categorias].sort((a, b) => a.localeCompare(b, "es"));
  }

  buscarPorId(id) {
    return this.#productos.find((p) => p.getId() === Number(id)) ?? null;
  }

  obtenerDestacados() {
    return this.#productos.filter((p) => p.isDestacado());
  }

  // Para la navegación hacia la vista del artesano (Serena).
  obtenerPorArtesano(artesanoId) {
    return this.#productos.filter((p) => p.getArtesanoId() === Number(artesanoId));
  }

  filtrarPorCategoria(categoria, productos = this.#productos) {
    if (!categoria) return [...productos];
    return productos.filter((p) => p.getCategoria() === categoria);
  }

  buscarPorTexto(texto, productos = this.#productos) {
    const buscado = normalizar(texto.trim());
    if (!buscado) return [...productos];
    return productos.filter(
      (p) =>
        normalizar(p.getNombre()).includes(buscado) ||
        normalizar(p.getDescripcion()).includes(buscado)
    );
  }

  ordenar(productos, criterio = ORDENES.RELEVANCIA) {
    const copia = [...productos];
    switch (criterio) {
      case ORDENES.PRECIO_ASC:
        return copia.sort((a, b) => a.getPrecio() - b.getPrecio());
      case ORDENES.PRECIO_DESC:
        return copia.sort((a, b) => b.getPrecio() - a.getPrecio());
      case ORDENES.NOMBRE:
        return copia.sort((a, b) => a.getNombre().localeCompare(b.getNombre(), "es"));
      default:
        return copia.sort((a, b) => Number(b.isDestacado()) - Number(a.isDestacado()));
    }
  }

  // Aplica todos los filtros juntos. Es lo que usa la página del catálogo.
  aplicarFiltros({ categoria = "", texto = "", soloDestacados = false, orden = ORDENES.RELEVANCIA } = {}) {
    let resultado = this.filtrarPorCategoria(categoria);
    resultado = this.buscarPorTexto(texto, resultado);
    if (soloDestacados) resultado = resultado.filter((p) => p.isDestacado());
    return this.ordenar(resultado, orden);
  }
}
