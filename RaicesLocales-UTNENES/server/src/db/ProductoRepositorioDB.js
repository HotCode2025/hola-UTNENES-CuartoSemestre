const { consultar } = require("./conexion.js");

const COLUMNAS = `id, nombre, descripcion, precio, stock, categoria, imagen, destacado, artesano_id`;

const ProductoRepositorioDB = {
  obtenerTodos() {
    return consultar(`SELECT ${COLUMNAS} FROM productos ORDER BY destacado DESC, nombre`);
  },

  async obtenerPorId(id) {
    const filas = await consultar(`SELECT ${COLUMNAS} FROM productos WHERE id = $1`, [id]);
    return filas[0] ?? null;
  },

  obtenerPorCategoria(categoria) {
    return consultar(`SELECT ${COLUMNAS} FROM productos WHERE categoria = $1 ORDER BY nombre`, [categoria]);
  },

  obtenerDestacados() {
    return consultar(`SELECT ${COLUMNAS} FROM productos WHERE destacado = TRUE ORDER BY nombre`);
  },

  obtenerPorArtesano(artesanoId) {
    return consultar(`SELECT ${COLUMNAS} FROM productos WHERE artesano_id = $1 ORDER BY nombre`, [artesanoId]);
  },

  async obtenerCategorias() {
    const filas = await consultar(
      `SELECT DISTINCT categoria FROM productos WHERE categoria IS NOT NULL ORDER BY categoria`
    );
    return filas.map((f) => f.categoria);
  },
};

module.exports = { ProductoRepositorioDB };
