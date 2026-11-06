# Preparar PostgreSQL para Raíces Locales

Este archivo crea las tablas que usa la aplicación. No crea una base de datos
ni inserta datos de ejemplo.

## Requisitos

- PostgreSQL instalado y en ejecución.
- pgAdmin 4 conectado al servidor local.
- Permisos para crear una base de datos y ejecutar SQL.

## Crear la base de datos

1. En pgAdmin, conectate al servidor PostgreSQL.
2. En el árbol del servidor, hacé clic derecho en **Databases** y elegí
   **Create > Database...**.
3. Elegí el nombre de la base. En la configuración actual del proyecto es
   `artesanos`.
4. Seleccioná la base nueva, abrí **Tools > Query Tool**.
5. Abrí `server/src/db/schema.sql` en el editor, ejecutá el contenido y
   comprobá que termine sin errores.

El esquema es idempotente: volver a ejecutarlo no borra ni sobrescribe las
tablas existentes. Si una tabla ya existe con otra estructura, el archivo no la
modifica; revisá esa estructura antes de continuar.

Si ya habías ejecutado una versión anterior, volvé a ejecutar ahora el
`schema.sql` actualizado. Agrega las tablas de cuentas, sesiones y pedidos sin
eliminar artesanos, productos ni los datos existentes. En pgAdmin, refrescá
**Schemas > public > Tables** al terminar.

## Cargar productos y artesanos desde pgAdmin

1. En el mismo Query Tool, conectado a la base correcta, abrí
   `server/src/db/seed.sql`.
2. Ejecutá el archivo y comprobá que termine sin errores.
3. Actualizá (**Refresh**) el árbol **Schemas > public > Tables**. Para ver
   registros, hacé clic derecho sobre `artesanos` o `productos`, elegí
   **View/Edit Data > All Rows**, o ejecutá las consultas de abajo.

El archivo de carga inicial crea cinco artesanos y diez productos, relacionados
por su nombre de artesano. Se ejecuta manualmente desde pgAdmin; la aplicación
no incluye esos objetos ni carga datos automáticamente. Es seguro volver a
ejecutarlo: agrega los registros que falten y no reemplaza datos existentes.
Si ya hay filas con los mismos nombres, las deja sin cambios.

## Tablas y relación

- `artesanos`: perfil, categoría, ubicación, historia y tipo de suscripción.
- `productos`: descripción, precio, stock, categoría, imagen y estado destacado.
- `usuarios`: cuentas con hash de contraseña; la contraseña original no se guarda.
- `sesiones`: tokens de sesión almacenados como hash y con fecha de vencimiento.
- `pedidos`: comprador, entrega, totales y estado del pago.
- `pedido_items`: copia del nombre y precio de cada producto al momento del pedido.
- Cada producto requiere un artesano existente mediante `artesano_id`.
- Cada pedido pertenece a una cuenta y su historial solo se devuelve a esa cuenta.
- Los pedidos conservan el precio histórico aunque luego cambie el precio del producto.
- Los identificadores admiten inserción explícita, para poder importar IDs
  acordados por el equipo.
- Precio y stock no pueden ser negativos; los nombres y categorías no pueden
  quedar vacíos.
- Eliminar un artesano con productos asociados se bloquea para proteger esos
  datos. Primero habría que reasignar o eliminar sus productos explícitamente.

Los campos siguen los nombres usados por el código actual: `foto_perfil` y
`artesano_id` en PostgreSQL. La API convierte `artesano_id` a `artesanoId` al
devolver los datos al frontend. Los nombres de imagen se guardan como texto en
la base; el proyecto no trae imágenes de ejemplo.

Podés revisar las tablas desde **Schemas > public > Tables** y consultar los
datos desde el Query Tool:

```sql
SELECT id, nombre, categoria, ubicacion, suscripcion
FROM public.artesanos
ORDER BY id;

SELECT id, nombre, precio, stock, categoria, destacado, artesano_id
FROM public.productos
ORDER BY id;
```

## Configurar y comprobar la conexión de la aplicación

1. Copiá `server/.env.example` como `server/.env`.
2. Confirmá que `PGDATABASE` tenga el nombre de tu base (en este caso,
   `artesanos`) y completá localmente `PGUSER` y `PGPASSWORD` según tu
   instalación. No compartas la contraseña ni subas `server/.env`.
3. Desde la carpeta `server`, instalá las dependencias con `npm install`.
4. Iniciá el sitio con `npm start`.
5. Abrí `http://localhost:3000/api/salud/base-datos`. Si conecta, responde con
   `"estado": "conectada"`.
6. Probá `http://localhost:3000/api/productos` y
   `http://localhost:3000/api/artesanos`. Devolverán únicamente las filas
   existentes en PostgreSQL. Si cargaste `seed.sql`, aparecerán sus registros;
   si no, las listas pueden estar vacías.

La página de catálogo consulta `/api/productos`; el perfil de artesano consulta
`/api/artesanos/:id`. El registro, el inicio de sesión, el checkout y el
historial también requieren el servidor Node para validar la cuenta y guardar
los pedidos. Abrí el sitio desde `http://localhost:3000`, no desde `file://` ni
desde un servidor estático independiente.

Antes de importar datos del profesor, confirmá que las columnas e identificadores
de su archivo coincidan con este esquema.
