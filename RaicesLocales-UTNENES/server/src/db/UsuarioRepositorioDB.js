const { consultar } = require("./conexion.js");

const UsuarioRepositorioDB = {
  async obtenerPorEmail(email) {
    const filas = await consultar(
      `SELECT id, nombre, apellido, email, password_hash, password_salt
       FROM public.usuarios
       WHERE LOWER(email) = LOWER($1)`,
      [email]
    );
    return filas[0] ?? null;
  },

  async crear({ nombre, apellido, email, passwordHash, passwordSalt }) {
    const filas = await consultar(
      `INSERT INTO public.usuarios (nombre, apellido, email, password_hash, password_salt)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nombre, apellido, email`,
      [nombre, apellido, email, passwordHash, passwordSalt]
    );
    return filas[0];
  },

  async guardarSesion(tokenHash, usuarioId, venceEn) {
    await consultar(`DELETE FROM public.sesiones WHERE vence_en <= NOW()`);
    await consultar(
      `INSERT INTO public.sesiones (token_hash, usuario_id, vence_en)
       VALUES ($1, $2, $3)`,
      [tokenHash, usuarioId, venceEn]
    );
  },

  async obtenerSesion(tokenHash) {
    const filas = await consultar(
      `SELECT u.id, u.nombre, u.apellido, u.email
       FROM public.sesiones s
       JOIN public.usuarios u ON u.id = s.usuario_id
       WHERE s.token_hash = $1 AND s.vence_en > NOW()`,
      [tokenHash]
    );
    return filas[0] ?? null;
  },

  eliminarSesion(tokenHash) {
    return consultar(`DELETE FROM public.sesiones WHERE token_hash = $1`, [tokenHash]);
  },
};

module.exports = { UsuarioRepositorioDB };
