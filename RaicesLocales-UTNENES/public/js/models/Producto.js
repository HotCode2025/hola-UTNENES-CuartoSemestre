export class Producto {
  #id;
  #nombre;
  #descripcion;
  #precio;
  #stock;
  #categoria;
  #imagen;
  #artesanoId;
  #destacado;

  constructor(id, nombre, descripcion, precio, stock, categoria, imagen, artesanoId, destacado = false) {
    const datos = id !== null && typeof id === "object"
      ? id
      : { id, nombre, descripcion, precio, stock, categoria, imagen, artesanoId, destacado };

    this.#id = datos.id;
    this.#nombre = datos.nombre;
    this.#descripcion = datos.descripcion ?? "";
    this.#precio = datos.precio ?? 0;
    this.#stock = datos.stock ?? 0;
    this.#categoria = datos.categoria ?? "";
    this.#imagen = datos.imagen ?? "";
    this.#artesanoId = datos.artesanoId ?? datos.artesano_id ?? null;
    this.#destacado = datos.destacado ?? false;
  }

  static desdeFilaDB(fila) {
    return new Producto({
      id: Number(fila.id),
      nombre: fila.nombre,
      descripcion: fila.descripcion ?? "",
      precio: Number(fila.precio),
      stock: fila.stock ?? 0,
      categoria: fila.categoria ?? "",
      imagen: fila.imagen ?? "",
      artesanoId: fila.artesano_id == null ? null : Number(fila.artesano_id),
      destacado: fila.destacado,
    });
  }

  getId() {
    return this.#id;
  }

  getNombre() {
    return this.#nombre;
  }

  getDescripcion() {
    return this.#descripcion;
  }

  getPrecio() {
    return this.#precio;
  }

  getStock() {
    return this.#stock;
  }

  getCategoria() {
    return this.#categoria;
  }

  getImagen() {
    return this.#imagen;
  }

  getArtesanoId() {
    return this.#artesanoId;
  }

  isDestacado() {
    return this.#destacado;
  }

  hayStock() {
    return this.#stock > 0;
  }

  toJSON() {
    return {
      id: this.#id,
      nombre: this.#nombre,
      descripcion: this.#descripcion,
      precio: this.#precio,
      stock: this.#stock,
      categoria: this.#categoria,
      imagen: this.#imagen,
      artesanoId: this.#artesanoId,
      destacado: this.#destacado,
    };
  }

  setPrecio(nuevoPrecio) {
    if (nuevoPrecio > 0) this.#precio = nuevoPrecio;
  }

  setStock(nuevoStock) {
    if (nuevoStock >= 0) this.#stock = nuevoStock;
  }
}