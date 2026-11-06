const { createHash, randomBytes, scrypt, timingSafeEqual } = require("node:crypto");
const { promisify } = require("node:util");
const { UsuarioRepositorioDB } = require("./db/UsuarioRepositorioDB.js");

const scryptAsync = promisify(scrypt);
const DURACION_SESION_MS = 7 * 24 * 60 * 60 * 1000;

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function leerCookie(req, nombre) {
  const cookies = (req.headers.cookie || "").split(";");
  const cookie = cookies.find((parte) => parte.trim().startsWith(`${nombre}=`));
  const token = cookie ? cookie.trim().slice(nombre.length + 1) : "";
  return /^[A-Za-z0-9_-]{43}$/.test(token) ? token : null;
}

function configurarCookie(res, req, token) {
  const secure = req.secure ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `raices_sesion=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${DURACION_SESION_MS / 1000}${secure}`
  );
}

function borrarCookie(res, req) {
  const secure = req.secure ? "; Secure" : "";
  res.setHeader("Set-Cookie", `raices_sesion=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
}

async function crearSesion(usuario, req, res) {
  const token = randomBytes(32).toString("base64url");
  const venceEn = new Date(Date.now() + DURACION_SESION_MS);
  await UsuarioRepositorioDB.guardarSesion(hashToken(token), usuario.id, venceEn);
  configurarCookie(res, req, token);
}

async function requiereSesion(req, res, next) {
  res.setHeader("Cache-Control", "no-store");
  const token = leerCookie(req, "raices_sesion");
  if (!token) return res.status(401).json({ error: "Iniciá sesión para continuar." });

  try {
    const usuario = await UsuarioRepositorioDB.obtenerSesion(hashToken(token));
    if (!usuario) {
      borrarCookie(res, req);
      return res.status(401).json({ error: "La sesión venció. Iniciá sesión nuevamente." });
    }
    req.usuario = usuario;
    req.tokenSesion = token;
    next();
  } catch (error) {
    next(error);
  }
}

async function verificarPassword(password, saltHex, hashHex) {
  const hashGuardado = Buffer.from(hashHex, "hex");
  const hashCalculado = await scryptAsync(password, Buffer.from(saltHex, "hex"), hashGuardado.length);
  return timingSafeEqual(hashGuardado, hashCalculado);
}

async function generarPassword(password) {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, 64);
  return { salt: salt.toString("hex"), hash: hash.toString("hex") };
}

module.exports = {
  borrarCookie,
  crearSesion,
  generarPassword,
  hashToken,
  requiereSesion,
  verificarPassword,
};
