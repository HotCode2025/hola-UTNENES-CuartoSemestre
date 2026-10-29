export class Artesano {
  #id;
  #nombre;
  #fotoPerfil;
  #categoria;
  #ubicacion;
  #historia;
  #suscripcion;
  #productos;

  constructor(
    id,
    nombre,
    fotoPerfil,
    categoria,
    ubicacion,
    historia,
    suscripcion,
    productos = []
  ) {
    this.#id = id;
    this.#nombre = nombre;
    this.#fotoPerfil = fotoPerfil;
    this.#categoria = categoria;
    this.#ubicacion = ubicacion;
    this.#historia = historia;
    this.#suscripcion = suscripcion;
    this.#productos = productos;
  }

  getId() {
    return this.#id;
  }

  getNombre() {
    return this.#nombre;
  }

  getFotoPerfil() {
    return this.#fotoPerfil;
  }

  getCategoria() {
    return this.#categoria;
  }

  getUbicacion() {
    return this.#ubicacion;
  }

  getHistoria() {
    return this.#historia;
  }

  getSuscripcion() {
    return this.#suscripcion;
  }

  getProductos() {
    return this.#productos;
  }

  setSuscripcion(nuevaSuscripcion) {
    this.#suscripcion = nuevaSuscripcion;
  }

  agregarProducto(producto) {
    this.#productos.push(producto);
  }
}