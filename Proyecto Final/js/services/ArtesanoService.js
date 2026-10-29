import { Artesano } from '../models/Artesano.js';
import { Producto } from '../models/Producto.js';

export class ArtesanoService {
  constructor(jsonPath = './js/data/artesanos.json') {
    this.jsonPath = jsonPath;
  }

  async obtenerArtesanoPorId(id) {
    try {
      const response = await fetch(this.jsonPath);
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const artesanos = await response.json();
      const data = artesanos.find(a => a.id === parseInt(id));

      if (!data) {
        throw new Error(`Artesano con ID ${id} no encontrado.`);
      }

      // Mapea los productos instanciando la clase Producto
      const productosInstanciados = (data.productos || []).map(p => new Producto(
        p.id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.stock,
        p.categoria,
        p.imagen,
        p.artesano_id,
        p.destacado
      ));

      // Retorna la instancia de la clase Artesano
      return new Artesano(
        data.id,
        data.nombre,
        data.foto_perfil,
        data.categoria,
        data.ubicacion,
        data.historia,
        data.suscripcion,
        productosInstanciados
      );
    } catch (error) {
      console.error('Error en ArtesanoService:', error);
      throw error;
    }
  }
}