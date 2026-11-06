import assert from "node:assert/strict";
import test from "node:test";

import { Catalogo, ORDENES } from "../public/js/catalogo/Catalogo.js";
import { Carrito } from "../public/js/models/Carrito.js";
import { Producto } from "../public/js/models/Producto.js";

const productos = [
  new Producto({
    id: 1,
    nombre: "Manta Andina",
    descripcion: "Tejida a mano",
    precio: 25000,
    stock: 3,
    categoria: "Textiles",
    artesanoId: 7,
    destacado: true,
  }),
  new Producto(2, "Bufanda", "Lana natural", 12000, 0, "Textiles", "", 7),
  new Producto({
    id: 3,
    nombre: "Jarrón",
    descripcion: "Cerámica artesanal",
    precio: 18000,
    stock: 2,
    categoria: "Cerámica",
    artesanoId: 8,
  }),
];

test("filtra por categoría, texto sin tildes y destacados", () => {
  const catalogo = new Catalogo(productos);

  assert.deepEqual(
    catalogo.aplicarFiltros({ categoria: "Textiles", texto: "tejida", soloDestacados: true })
      .map((producto) => producto.getId()),
    [1]
  );
  assert.deepEqual(catalogo.buscarPorTexto("ceramica").map((producto) => producto.getId()), [3]);
});

test("ordena sin mutar la colección y busca por identificador", () => {
  const catalogo = new Catalogo(productos);

  assert.deepEqual(
    catalogo.ordenar(catalogo.obtenerTodos(), ORDENES.PRECIO_ASC).map((producto) => producto.getId()),
    [2, 3, 1]
  );
  assert.deepEqual(catalogo.obtenerTodos().map((producto) => producto.getId()), [1, 2, 3]);
  assert.equal(catalogo.buscarPorId("2").getNombre(), "Bufanda");
  assert.equal(catalogo.buscarPorId(99), null);
});

test("convierte filas de base de datos y conserva el constructor posicional", () => {
  const producto = Producto.desdeFilaDB({
    id: "4",
    nombre: "Miel",
    precio: "7200",
    stock: 1,
    categoria: "Alimentos",
    artesano_id: 9,
    destacado: true,
  });
  const posicional = new Producto(5, "Taza", "", 50, 0, "Cerámica", "", 1);

  assert.equal(producto.getId(), 4);
  assert.equal(producto.getPrecio(), 7200);
  assert.equal(producto.getArtesanoId(), 9);
  assert.equal(producto.isDestacado(), true);
  assert.deepEqual(posicional.toJSON(), {
    id: 5,
    nombre: "Taza",
    descripcion: "",
    precio: 50,
    stock: 0,
    categoria: "Cerámica",
    imagen: "",
    artesanoId: 1,
    destacado: false,
  });
});

test("el carrito comparte datos con checkout, conserva el producto y respeta el stock", () => {
  const almacenamientoOriginal = globalThis.localStorage;
  const datos = new Map([
    ["raices-locales:carrito", JSON.stringify([
      { id: 9, nombre: "Producto anterior", precio: 100, stock: 2, cantidad: 1 },
    ])],
  ]);
  globalThis.localStorage = {
    getItem: (clave) => datos.get(clave) ?? null,
    setItem: (clave, valor) => datos.set(clave, valor),
    removeItem: (clave) => datos.delete(clave),
  };

  try {
    const carrito = new Carrito();
    assert.ok(datos.has("carrito"));
    assert.equal(datos.has("raices-locales:carrito"), false);
    assert.deepEqual(carrito.obtenerProductos().map((item) => item.id), [9]);

    const producto = {
      id: 10,
      nombre: "Manta",
      precio: 25000,
      stock: 2,
      imagen: "manta.jpg",
      categoria: "Textiles",
      artesanoId: 1,
    };

    assert.equal(carrito.agregarProducto(producto), true);
    assert.equal(carrito.agregarProducto(producto), true);
    assert.equal(carrito.agregarProducto(producto), false);
    assert.equal(carrito.calcularTotal(), 50100);
    assert.deepEqual(
      JSON.parse(datos.get("carrito")).find((item) => item.id === 10),
      { ...producto, cantidad: 2 }
    );

    assert.equal(carrito.actualizarCantidad(10, 3), false);
    carrito.eliminarProducto(9);
    assert.deepEqual(carrito.obtenerProductos().map((item) => item.id), [10]);
    carrito.vaciarCarrito();
    assert.deepEqual(JSON.parse(datos.get("carrito")), []);
  } finally {
    if (almacenamientoOriginal === undefined) {
      delete globalThis.localStorage;
    } else {
      globalThis.localStorage = almacenamientoOriginal;
    }
  }
});
