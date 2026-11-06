# Raíces Locales

> **Conecta con el arte de tu gente**

Proyecto académico del equipo **HOLA UTNENES**: una tienda en línea de productos artesanales que conecta a compradores con los emprendedores y sus historias.

## Descripción

Raíces Locales permite explorar productos artesanales y conocer a los artesanos asociados a ellos. La aplicación cuenta con catálogo, perfiles, carrito, cuentas de usuario, checkout e historial de pedidos.

El frontend consume una API Node/Express conectada a PostgreSQL. No hay productos ni usuarios de respaldo en el navegador. Los datos iniciales se pueden cargar manualmente desde pgAdmin con el SQL del proyecto; la aplicación no ofrece un panel administrativo.

## Estado actual

- **Implementado:** catálogo y perfiles consultados desde PostgreSQL.
- **Implementado:** registro, inicio de sesión con contraseñas almacenadas como hash y sesión mediante cookie protegida.
- **Implementado:** carrito temporal en el navegador. Al confirmar una compra, el servidor valida IDs, precios y stock contra PostgreSQL.
- **Implementado:** pedidos, estados de pago e historial asociados a la cuenta y guardados en PostgreSQL.
- **Pago de prueba local:** no cobra dinero; requiere servidor, sesión y PostgreSQL, y guarda el resultado del pedido en la base.
- **Pendiente de configurar/probar:** Mercado Pago Checkout Pro con credenciales de prueba. La ruta externa de pago y los webhooks deben verificarse con esas credenciales.
- **Sin panel de administración:** la carga y actualización de artesanos y productos se realiza mediante SQL en pgAdmin.

Las imágenes no se guardan en la base de datos. PostgreSQL conserva el nombre del archivo; las imágenes se sirven desde `public/img/`.

## Funcionalidades

### Operativas

- Catálogo dinámico desde PostgreSQL con búsqueda, filtros por categoría, orden y destacados.
- Vista detallada del producto y enlace al perfil de su artesano.
- Perfil del artesano con historia y sus productos.
- Carrito conectado al catálogo y al checkout.
- Registro, inicio y cierre de sesión.
- Creación de pedidos con precios leídos desde la base, validación de stock y persistencia del historial.
- Resultado de pago de prueba local persistido en la base.
- Integración de backend preparada para Mercado Pago Checkout Pro en modo de prueba.

### Informativas y futuras

- Las categorías de suscripción **Básica** y **Premium** se muestran como información del artesano; no se contratan ni modifican desde la aplicación.
- El proyecto original propone explicar un sistema de comisiones. Las comisiones no forman parte del cálculo actual del carrito ni del checkout.
- Estadísticas de venta, valoraciones, gestión de suscripciones y publicación de productos desde una interfaz son posibles extensiones, no funcionalidades implementadas.

## Identidad visual

El README original define esta paleta oficial para el diseño del sitio:

| Uso | Color | Aplicación sugerida |
|---|---|---|
| Verde principal | `#2E7D32` | Botones principales, navegación y acciones positivas |
| Terracota | `#C65D3B` | Destacados y llamadas a la acción secundarias |
| Crema | `#F8F5F0` | Fondo principal |
| Gris oscuro | `#333333` | Texto principal |
| Dorado premium | `#D4AF37` | Distintivos Premium y productos destacados |
| Blanco | `#FFFFFF` | Tarjetas y superficies |

Variables sugeridas para la hoja global:

```css
:root {
  --primary: #2E7D32;
  --secondary: #C65D3B;
  --background: #F8F5F0;
  --dark: #333333;
  --premium: #D4AF37;
  --white: #FFFFFF;
}
```

La hoja de estilos compartida ya existe en [`public/css/styles.css`](public/css/styles.css) y está enlazada desde las páginas HTML. La paleta anterior es la referencia de marca para el trabajo visual; se puede aplicar y ampliar en esa misma hoja.

### Imágenes

- Guardar fotos de productos y artesanos en `public/img/`.
- Como referencia, usar imágenes cuadradas: productos de **1200 × 1200 px** y perfiles de **800 × 800 px**.
- Preferir JPG/JPEG comprimido para fotografías, idealmente menos de **300 KB** por imagen; WebP también es válido si la extensión coincide con la guardada en la base.
- Reservar PNG para transparencia y SVG para logos o iconos vectoriales.
- Usar nombres simples, en minúsculas y sin espacios ni tildes. El nombre y la extensión deben coincidir exactamente con las columnas `imagen` o `foto_perfil`.
- Las cards de producto se generan dinámicamente desde JavaScript; no reemplazar sus datos por contenido escrito a mano en el HTML.

Las instrucciones de instalación, rutas de imágenes y pautas para modificar estilos están en [`docs/INSTRUCCIONES-COMPANERO.txt`](docs/INSTRUCCIONES-COMPANERO.txt).

## Tecnologías

- HTML5, CSS3 y JavaScript ES6+ (módulos).
- Node.js y Express.
- PostgreSQL y pgAdmin 4.
- `pg` para la conexión del servidor con PostgreSQL.
- `localStorage` solamente para el carrito en curso y la copia temporal del pedido al regresar de Mercado Pago.
- SDK de Mercado Pago para la integración opcional de Checkout Pro.
- Git, GitHub y Visual Studio Code.

## Arquitectura

El navegador no se conecta directamente a PostgreSQL. Las páginas consumen endpoints de Express; los repositorios del backend consultan o actualizan la base.

```text
Navegador (HTML/CSS/JS)
        │
        ├── páginas y módulos JavaScript
        │
        ▼
Servidor Node.js / Express
        │
        ├── autenticación y sesiones
        ├── API de catálogo, artesanos y pedidos
        ├── validación de precio y stock
        └── integración opcional con Mercado Pago
        │
        ▼
PostgreSQL
```

No existe una interfaz de administración. La carga inicial o modificación de productos y artesanos se hace manualmente con SQL desde pgAdmin.

## Estructura del proyecto

```text
RaicesLocales-UTNENES/
├── docs/
│   ├── GUIA-BASE-DATOS.md
│   ├── GUIA-CHECKOUT.md
│   └── INSTRUCCIONES-COMPANERO.txt
├── public/
│   ├── index.html
│   ├── catalogo.html
│   ├── catalogo-prueba.html
│   ├── artesano.html
│   ├── carrito.html
│   ├── checkout.html
│   ├── css/
│   │   └── styles.css
│   ├── img/                       # Imágenes del proyecto
│   ├── js/
│   │   ├── catalogo/
│   │   ├── models/
│   │   ├── pages/
│   │   ├── services/
│   │   └── usuario/
│   └── usuario/
│       ├── historial.html
│       ├── login.html
│       ├── perfil.html
│       └── registro.html
├── server/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── auth.js
│       ├── server.js
│       └── db/
│           ├── conexion.js
│           ├── ArtesanoRepositorioDB.js
│           ├── ProductoRepositorioDB.js
│           ├── UsuarioRepositorioDB.js
│           ├── PedidoRepositorioDB.js
│           ├── schema.sql
│           └── seed.sql
├── tests/
│   └── catalogo.test.js
└── README.md
```

`catalogo-prueba.html` conserva la dirección anterior y redirige al catálogo principal.

## Base de datos

La base de datos configurada por defecto se llama `artesanos`. El esquema se encuentra en `server/src/db/schema.sql` y crea:

- `artesanos`: perfil, historia, ubicación, categoría y suscripción.
- `productos`: precio, stock, categoría, imagen y relación con el artesano.
- `usuarios`: datos de cuenta y hash/salt de contraseña.
- `sesiones`: sesiones asociadas a usuarios y su vencimiento.
- `pedidos`: comprador, entrega, totales y estado.
- `pedido_items`: productos y precios históricos de cada pedido.

Para poblar las tablas con artesanos y productos iniciales, se puede ejecutar manualmente `server/src/db/seed.sql` en pgAdmin. Ese archivo es opcional, no se ejecuta al iniciar el sitio y no reemplaza registros existentes. También se pueden insertar o modificar datos manualmente con consultas SQL.

La configuración local se guarda en `server/.env`, que no debe subirse al repositorio. Usa [`server/.env.example`](server/.env.example) como plantilla. Las instrucciones detalladas de pgAdmin están en [`docs/GUIA-BASE-DATOS.md`](docs/GUIA-BASE-DATOS.md).

## Páginas

| Sección | Ruta |
|---|---|
| Inicio | `/` o `/index.html` |
| Catálogo desde PostgreSQL | `/catalogo.html` |
| Dirección anterior del catálogo | `/catalogo-prueba.html` (redirige a `/catalogo.html`) |
| Perfil del artesano | `/artesano.html?id=1` |
| Carrito | `/carrito.html` |
| Checkout | `/checkout.html` |
| Registro | `/usuario/registro.html` |
| Inicio de sesión | `/usuario/login.html` |
| Perfil de usuario | `/usuario/perfil.html` |
| Historial de pedidos | `/usuario/historial.html` |

Las páginas deben abrirse desde el servidor Express para que funcionen la API y las sesiones; no se debe usar `file://` ni un servidor estático independiente.

## API

Los endpoints se implementan en `server/src/server.js`:

| Método | Ruta | Uso |
|---|---|---|
| `GET` | `/api/salud/base-datos` | Comprueba la conexión a PostgreSQL. |
| `GET` | `/api/productos` | Lista productos de la base. |
| `GET` | `/api/artesanos` | Lista artesanos de la base. |
| `GET` | `/api/artesanos/:id` | Devuelve un artesano y sus productos. |
| `GET` | `/api/estado` | Indica si Mercado Pago está configurado. |
| `POST` | `/api/auth/registro` | Registra una cuenta e inicia sesión. |
| `POST` | `/api/auth/login` | Inicia sesión. |
| `GET` | `/api/auth/me` | Consulta la cuenta de la sesión actual. |
| `POST` | `/api/auth/logout` | Cierra la sesión. |
| `POST` | `/api/pedidos` | Crea un pedido con precios de PostgreSQL. Requiere sesión. |
| `GET` | `/api/pedidos` | Consulta el historial de la cuenta actual. Requiere sesión. |
| `POST` | `/api/pedidos/:numero/simular-pago` | Guarda el resultado del pago de prueba local. Requiere sesión. |
| `POST` | `/api/pedidos/:numero/verificar-pago` | Verifica y actualiza un pago de Mercado Pago. Requiere sesión. |
| `POST` | `/api/crear-preferencia` | Crea la preferencia de Checkout Pro. Requiere sesión. |
| `POST` | `/api/webhooks/mercado-pago` | Procesa notificaciones verificando el pago con Mercado Pago. |

## Configuración y ejecución

Requisitos: Node.js, PostgreSQL y pgAdmin 4.

1. Crea la base `artesanos` en PostgreSQL si todavía no existe.
2. Desde pgAdmin, conectado a esa base, ejecuta `server/src/db/schema.sql`.
3. Opcionalmente, ejecuta `server/src/db/seed.sql` para cargar productos y artesanos iniciales.
4. Copia `server/.env.example` a `server/.env` y configura `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER` y `PGPASSWORD` según tu instalación local. No compartas ese archivo.
5. Inicia el servidor desde una terminal:

   ```powershell
   cd server
   npm install
   npm start
   ```

   Si PowerShell bloquea `npm.ps1`, usa `npm.cmd install` y `npm.cmd start`.

6. Abre `http://localhost:3000/`.
7. Para comprobar la conexión y los datos, visita:
   - `http://localhost:3000/api/salud/base-datos`
   - `http://localhost:3000/api/productos`
   - `http://localhost:3000/api/artesanos`

Si las tablas de productos o artesanos están vacías, el catálogo también aparecerá vacío. Ejecuta el seed o agrega filas desde pgAdmin.

## Pagos

- **Pago de prueba local:** disponible sin un token de Mercado Pago. No realiza cobros, pero requiere sesión y PostgreSQL; el pedido y su resultado se guardan en la base.
- **Mercado Pago Checkout Pro:** la integración está en el servidor y requiere `MP_ACCESS_TOKEN` de prueba en `server/.env`. No se debe poner el token en el frontend ni subirlo a GitHub.
- La integración externa, sus retornos y webhooks deben probarse con credenciales válidas. Las instrucciones están en [`docs/GUIA-CHECKOUT.md`](docs/GUIA-CHECKOUT.md).

## Pruebas automatizadas

Desde la raíz del proyecto:

```powershell
node --experimental-default-type=module --test tests/catalogo.test.js
```

Las pruebas actuales cubren filtros y orden del catálogo, compatibilidad del modelo de producto y almacenamiento/stock del carrito.

## Alcance futuro

- Configurar y validar Mercado Pago con credenciales de prueba.
- Completar la revisión integral del recorrido de usuario, compra e historial.
- Incorporar la identidad visual e imágenes siguiendo la paleta oficial.
- Considerar más adelante administración de productos, suscripciones, valoraciones y estadísticas, si el alcance del equipo lo requiere.
- Preparar `README-ecxplicacion.md` para documentar qué desarrolló cada integrante.

## Equipo HOLA UTNENES

| Integrante | Responsabilidad principal |
|---|---|
| Otar Kebadze | Arquitectura, integración general, pruebas y entrega |
| Matías Tobares | Checkout y Mercado Pago |
| Joaquín | Modelado de datos y PostgreSQL |
| Gabriel | Catálogo y productos |
| Serena | Perfiles e historias de artesanos |
| Fernando | Carrito de compras |
| Emmanuel | UI/UX e identidad visual |

---

Raíces Locales combina comercio electrónico, programación orientada a objetos y persistencia en PostgreSQL para dar visibilidad a emprendimientos artesanales locales.
