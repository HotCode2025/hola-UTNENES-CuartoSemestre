const { pool } = require("./conexion.js");

const ESTADOS = new Set(["iniciado", "aprobado", "pendiente", "rechazado"]);

function convertirPedido(fila, items) {
  const envio = {
    tipo: fila.envio_tipo,
    costo: Number(fila.envio_costo),
    direccion: fila.envio_direccion,
  };
  const subtotal = Number(fila.subtotal);

  return {
    numero: fila.numero,
    fecha: fila.creado_en,
    comprador: {
      nombre: fila.comprador_nombre,
      apellido: fila.comprador_apellido,
      email: fila.comprador_email,
      telefono: fila.comprador_telefono,
    },
    items: items.map((item) => ({
      id: item.producto_id,
      nombre: item.producto_nombre,
      imagen: item.producto_imagen,
      categoria: item.producto_categoria,
      precio: Number(item.precio_unitario),
      cantidad: item.cantidad,
      origen: "postgresql",
    })),
    envio,
    subtotal,
    total: Number(fila.total),
    estado: fila.estado,
    pago: fila.pago,
  };
}

async function buscarItems(client, pedidoId) {
  const resultado = await client.query(
    `SELECT producto_id, producto_nombre, producto_imagen, producto_categoria,
            precio_unitario, cantidad
     FROM public.pedido_items
     WHERE pedido_id = $1
     ORDER BY id`,
    [pedidoId]
  );
  return resultado.rows;
}

const PedidoRepositorioDB = {
  async crear({ numero, usuarioId, comprador, envio, itemsSolicitados }) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const ids = itemsSolicitados.map((item) => item.id);
      const productos = await client.query(
        `SELECT id, nombre, precio, stock, categoria, imagen
         FROM public.productos
         WHERE id = ANY($1::bigint[])
         ORDER BY id
         FOR UPDATE`,
        [ids]
      );
      const porId = new Map(productos.rows.map((producto) => [String(producto.id), producto]));

      if (porId.size !== itemsSolicitados.length) {
        const error = new Error("Uno o más productos ya no están disponibles.");
        error.status = 409;
        throw error;
      }

      let subtotal = 0;
      const items = itemsSolicitados.map((solicitado) => {
        const producto = porId.get(String(solicitado.id));
        if (solicitado.cantidad > producto.stock) {
          const error = new Error(`No hay stock suficiente de ${producto.nombre}.`);
          error.status = 409;
          throw error;
        }

        const precio = Number(producto.precio);
        subtotal += precio * solicitado.cantidad;
        return { producto, cantidad: solicitado.cantidad, precio };
      });

      subtotal = Math.round(subtotal * 100) / 100;
      const total = subtotal + envio.costo;
      const insertado = await client.query(
        `INSERT INTO public.pedidos
           (numero, usuario_id, comprador_nombre, comprador_apellido, comprador_email,
            comprador_telefono, envio_tipo, envio_costo, envio_direccion, subtotal, total)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [
          numero,
          usuarioId,
          comprador.nombre,
          comprador.apellido,
          comprador.email,
          comprador.telefono,
          envio.tipo,
          envio.costo,
          envio.direccion,
          subtotal,
          total,
        ]
      );

      for (const item of items) {
        await client.query(
          `INSERT INTO public.pedido_items
             (pedido_id, producto_id, producto_nombre, producto_imagen,
              producto_categoria, precio_unitario, cantidad)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            insertado.rows[0].id,
            item.producto.id,
            item.producto.nombre,
            item.producto.imagen,
            item.producto.categoria,
            item.precio,
            item.cantidad,
          ]
        );
      }

      await client.query("COMMIT");
      return convertirPedido(insertado.rows[0], items.map((item) => ({
        producto_id: item.producto.id,
        producto_nombre: item.producto.nombre,
        producto_imagen: item.producto.imagen,
        producto_categoria: item.producto.categoria,
        precio_unitario: item.precio,
        cantidad: item.cantidad,
      })));
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async obtenerPorNumero(numero, usuarioId = null) {
    const client = await pool.connect();
    try {
      const filtroUsuario = usuarioId === null ? "" : " AND usuario_id = $2";
      const parametros = usuarioId === null ? [numero] : [numero, usuarioId];
      const resultado = await client.query(
        `SELECT * FROM public.pedidos WHERE numero = $1${filtroUsuario}`,
        parametros
      );
      if (resultado.rowCount === 0) return null;
      const fila = resultado.rows[0];
      return convertirPedido(fila, await buscarItems(client, fila.id));
    } finally {
      client.release();
    }
  },

  async obtenerHistorial(usuarioId) {
    const resultado = await pool.query(
      `SELECT p.*, i.id AS item_id, i.producto_id, i.producto_nombre,
              i.producto_imagen, i.producto_categoria, i.precio_unitario, i.cantidad
       FROM public.pedidos p
       LEFT JOIN public.pedido_items i ON i.pedido_id = p.id
       WHERE p.usuario_id = $1
       ORDER BY p.creado_en DESC, i.id`,
      [usuarioId]
    );
    const agrupados = new Map();
    for (const fila of resultado.rows) {
      if (!agrupados.has(fila.id)) agrupados.set(fila.id, { fila, items: [] });
      if (fila.item_id !== null) agrupados.get(fila.id).items.push(fila);
    }
    return [...agrupados.values()].map(({ fila, items }) => convertirPedido(fila, items));
  },

  async actualizarEstado({ numero, usuarioId, estado, pago }) {
    if (!ESTADOS.has(estado)) {
      const error = new Error("El estado de pedido no es válido.");
      error.status = 400;
      throw error;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const filtroUsuario = usuarioId === null ? "" : " AND usuario_id = $2";
      const parametros = usuarioId === null ? [numero] : [numero, usuarioId];
      const resultado = await client.query(
        `SELECT * FROM public.pedidos
         WHERE numero = $1${filtroUsuario}
         FOR UPDATE`,
        parametros
      );
      if (resultado.rowCount === 0) {
        await client.query("ROLLBACK");
        return null;
      }

      const fila = resultado.rows[0];
      if (fila.estado === "aprobado" && estado !== "aprobado") {
        const error = new Error("Un pedido aprobado no puede cambiar a otro estado.");
        error.status = 409;
        throw error;
      }

      const items = await buscarItems(client, fila.id);
      if (estado === "aprobado" && fila.estado !== "aprobado") {
        for (const item of items) {
          if (item.producto_id === null) {
            const error = new Error("Un producto del pedido ya no está disponible.");
            error.status = 409;
            throw error;
          }
          const actualizado = await client.query(
            `UPDATE public.productos
             SET stock = stock - $1
             WHERE id = $2 AND stock >= $1
             RETURNING id`,
            [item.cantidad, item.producto_id]
          );
          if (actualizado.rowCount === 0) {
            const error = new Error(`No hay stock suficiente de ${item.producto_nombre}.`);
            error.status = 409;
            throw error;
          }
        }
      }

      const actualizado = await client.query(
        `UPDATE public.pedidos
         SET estado = $1, pago = $2, actualizado_en = NOW()
         WHERE id = $3
         RETURNING *`,
        [estado, JSON.stringify(pago), fila.id]
      );
      await client.query("COMMIT");
      return convertirPedido(actualizado.rows[0], items);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },
};

module.exports = { PedidoRepositorioDB };
