const { consultar } = require("./conexion.js");

const COLUMNAS = `id, nombre, foto_perfil, categoria, ubicacion, historia, suscripcion`;

const ArtesanoRepositorioDB = {
  obtenerTodos() {
    return consultar(`SELECT ${COLUMNAS} FROM artesanos ORDER BY nombre`);
  },

  async obtenerPorId(id) {
    const filas = await consultar(`SELECT ${COLUMNAS} FROM artesanos WHERE id = $1`, [id]);
    return filas[0] ?? null;
  },
};

module.exports = { ArtesanoRepositorioDB };
