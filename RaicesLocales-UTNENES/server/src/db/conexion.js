const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PGHOST ?? "localhost",
  port: Number(process.env.PGPORT ?? 5432),
  database: process.env.PGDATABASE ?? "artesanos",
  user: process.env.PGUSER ?? "postgres",
  password: process.env.PGPASSWORD,
});

async function consultar(sql, parametros = []) {
  const resultado = await pool.query(sql, parametros);
  return resultado.rows;
}

async function probarConexion() {
  const [fila] = await consultar("SELECT NOW() AS ahora");
  return fila.ahora;
}

module.exports = { pool, consultar, probarConexion };
