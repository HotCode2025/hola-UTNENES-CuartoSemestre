import { Artesano } from "../models/Artesano.js";
import { Producto } from "../models/Producto.js";

export class ArtesanoService {
  constructor(baseUrl = "/api/artesanos") {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  async obtenerArtesanoPorId(id) {
    const respuesta = await fetch(`${this.baseUrl}/${encodeURIComponent(id)}`);
    const datos = await respuesta.json();
    if (!respuesta.ok) {
      throw new Error(datos.error || `No se pudo cargar el artesano (${respuesta.status}).`);
    }

    const productos = (datos.productos || []).map((producto) => new Producto(
      Number(producto.id),
      producto.nombre,
      producto.descripcion,
      Number(producto.precio),
      Number(producto.stock),
      producto.categoria,
      producto.imagen,
      Number(producto.artesano_id ?? producto.artesanoId),
      producto.destacado
    ));

    return new Artesano(
      Number(datos.id),
      datos.nombre,
      datos.foto_perfil ?? datos.fotoPerfil,
      datos.categoria,
      datos.ubicacion,
      datos.historia,
      datos.suscripcion,
      productos
    );
  }
}