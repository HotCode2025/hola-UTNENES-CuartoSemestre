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

  constructor(
    id,
    nombre,
    descripcion,
    precio,
    stock,
    categoria,
    imagen,
    artesanoId,
    destacado = false
  ) {
    this.#id = id;
    this.#nombre = nombre;
    this.#descripcion = descripcion;
    this.#precio = precio;
    this.#stock = stock;
    this.#categoria = categoria;
    this.#imagen = imagen;
    this.#artesanoId = artesanoId;
    this.#destacado = destacado;
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

  setPrecio(nuevoPrecio) {
    if (nuevoPrecio > 0) this.#precio = nuevoPrecio;
  }

  setStock(nuevoStock) {
    if (nuevoStock >= 0) this.#stock = nuevoStock;
  }
}