import { Producto } from "../../models/Producto.js";

// Consulta la API del servidor, que obtiene los productos desde PostgreSQL.
export class FuenteAPI {
  #baseUrl;

  constructor(baseUrl) {
    this.#baseUrl = baseUrl.replace(/\/$/, "");
  }

  async obtenerProductos() {
    const respuesta = await fetch(`${this.#baseUrl}/productos`);
    if (!respuesta.ok) {
      throw new Error(`Error al consultar la API (${respuesta.status})`);
    }
    const filas = await respuesta.json();
    return filas.map((fila) => Producto.desdeFilaDB(fila));
  }
}
