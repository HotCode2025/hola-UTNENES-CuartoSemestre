# 💳 Módulo Checkout y Mercado Pago — Guía

**Responsable:** Matías Tobares · Proyecto Raíces Locales · Equipo HOLA UTNENES

## 1. Archivos del módulo

```text
public/checkout.html                → Página de checkout
public/css/styles.css               → Estilos generales compartidos por las páginas
public/js/models/Pedido.js          → Clase Pedido (POO, campos privados, getters)
public/js/services/MercadoPagoService.js → Pago de prueba local y conexión con Mercado Pago
public/js/pages/checkout.js         → Lógica de la página
server/src/server.js                → Servidor Node: crea el pago real en Mercado Pago
server/src/auth.js                  → Sesiones de cuenta con cookie protegida
server/src/db/PedidoRepositorioDB.js → Guarda pedidos y valida precios/stock en PostgreSQL
server/package.json                 → Dependencias (express, mercadopago, dotenv)
server/.env.example                 → Plantilla de la clave (copiar como .env)
server/.gitignore                   → Evita subir la clave y node_modules a GitHub
```

### ¿Por qué hay un servidor si el proyecto es "solo frontend"?

Mercado Pago exige crear el pago con el **Access Token**, que es una clave privada.
Si se pone en el JavaScript del navegador, cualquiera la puede ver con F12.
Por eso vive en `server/.env` y el navegador nunca la conoce. El servidor también
sirve todo el sitio, así que **con un solo túnel queda todo online**.

### Dos modos automáticos

| Cómo está configurado el servidor | Modo |
|---|---|
| Con el servidor y `MP_ACCESS_TOKEN` de prueba | 🟢 **Mercado Pago de prueba** |
| Con el servidor, sin token | 🧪 **Pago de prueba local**, sin cobro real |

El checkout con historial necesita PostgreSQL, el esquema actualizado y una
cuenta iniciada. En ambos modos, el pedido y su estado quedan guardados en la
base. El pago de prueba local no usa productos ni usuarios ficticios.

---

## Flujo integrado con productos de PostgreSQL

1. Iniciá el servidor con `npm start` desde `server/`.
2. Abrí `http://localhost:3000/catalogo.html` y agregá un producto.
3. Entrá al carrito, ajustá cantidades y seleccioná **Finalizar pedido**.
4. Iniciá sesión o registrate cuando te lo pida.
5. El servidor valida productos, precios y stock antes de guardar el pedido.
6. Elegí el resultado del pago de prueba local o completá el pago de prueba en Mercado Pago.
7. Consultá los pedidos guardados en **Mi cuenta → Historial**.

El carrito comparte la clave `carrito` en `localStorage` con el checkout y conserva los datos del producto. Si había un carrito guardado con la clave anterior `raices-locales:carrito`, el modelo lo migra a la nueva clave al abrirlo.

## Prueba de compra con datos de PostgreSQL

1. Abrí el sitio desde `http://localhost:3000` (el servidor debe estar conectado a PostgreSQL).
2. Registrate o iniciá sesión.
3. En `catalogo.html`, agregá productos; luego abrí el carrito y finalizá la compra.
4. En el checkout, confirmá entrega y teléfono. El servidor obtiene los precios y valida el stock consultando PostgreSQL.
5. Si Mercado Pago no está configurado, elegí un resultado en el pago de prueba local. No se realizará un cobro.
6. Confirmá que el pedido y su resultado aparecen en **Mi cuenta → Historial**.

El catálogo no usa archivos JSON ni productos cargados desde el frontend. Si no hay productos en la base, se mostrará una lista vacía; cargá `server/src/db/seed.sql` en pgAdmin o ingresá tus propios datos.

## 2. (Opcional) Configurar Mercado Pago en modo de prueba

### Paso 1 — Crear las cuentas de prueba (una sola vez)

1. Entrá a **mercadopago.com.ar/developers** con tu cuenta normal.
2. **Tus integraciones → Crear aplicación** (nombre: Raíces Locales · producto: **Checkout Pro**).
3. Menú izquierdo → **Cuentas de prueba → + Crear cuenta de prueba**:
   - Una de tipo **Vendedor** (país Argentina).
   - Otra de tipo **Comprador** (país Argentina), con dinero ficticio, por ejemplo $500.000.
4. Anotá el **usuario y contraseña** de las dos (aparecen en la tabla).

### Paso 2 — Sacar el Access Token del vendedor de prueba

1. Abrí una **ventana de incógnito** e iniciá sesión en Mercado Pago con el **usuario VENDEDOR de prueba**.
   - Si pide un código por e-mail, poné los **últimos 6 dígitos del User ID** de esa cuenta de prueba.
2. Entrá a **mercadopago.com.ar/developers → Tus integraciones → Crear aplicación** (con esta cuenta) → Checkout Pro.
3. En la aplicación: **Credenciales de producción** → copiá el **Access Token** (empieza con `APP_USR-`).

> Son "de producción" pero de una cuenta ficticia: no mueven plata real.

### Paso 3 — Configurar y prender el servidor

En VS Code: **Terminal → New Terminal**:

```bash
cd server
npm install
copy .env.example .env
```

Abrí `server/.env` y pegá tu token:

```text
MP_ACCESS_TOKEN=APP_USR-1234...tu-token...
```

Prendé el servidor:

```bash
npm start
```

Tiene que decir: `💳 Mercado Pago: CONFIGURADO`.
Antes de probar, verificá que ejecutaste la versión actualizada de
`server/src/db/schema.sql` en la base y que el sitio abre desde el servidor.
Creá una cuenta desde **Registro** e iniciá sesión antes de ir al checkout.

### Paso 4 — Abrir el túnel (dejarlo online)

Abrí una **segunda terminal** (el servidor sigue corriendo en la primera).

**Opción A — Cloudflare (no pide cuenta):**

```bash
winget install --id Cloudflare.cloudflared
cloudflared tunnel --url http://localhost:3000
```

**Opción B — ngrok (si ya lo tenés configurado):**

```bash
ngrok http 3000
```

Copiá la URL `https://....trycloudflare.com` (o `https://....ngrok-free.app`) y abrí:

```text
https://TU-URL/checkout.html
```

⚠️ Abrí siempre la URL **del túnel**, no `localhost`. Mercado Pago solo vuelve
automáticamente a tu página si la dirección es pública y `https`.

### Paso 5 — Hacer la compra de prueba

1. Iniciá sesión en Raíces Locales y agregá al carrito un producto de la base.
2. En el checkout tiene que decir **"🟢 Mercado Pago conectado (modo prueba)"**.
3. Completá los datos y elegí **Pagar con Mercado Pago**.
4. En Mercado Pago, iniciá sesión con el **usuario COMPRADOR de prueba**. Lo mejor es hacerlo en otra ventana de incógnito y **nunca con la cuenta vendedora**: Mercado Pago no deja pagarse a uno mismo.
5. Pagá con tarjeta de prueba:
   - Mastercard `5031 7557 3453 0604` · Visa `4509 9535 6623 3704`
   - Vencimiento `11/30` · Código `123` · DNI `12345678`
   - **Nombre del titular**: `APRO` (aprobado) · `CONT` (pendiente) · `OTHE` (rechazado)
6. Con **APRO**, Mercado Pago vuelve a `checkout.html`; el servidor verifica el pago contra el pedido y guarda el resultado antes de mostrarlo. El pedido se puede consultar desde **Mi cuenta → Historial**.

### Si algo falla

| Síntoma | Causa probable |
|---|---|
| Dice "Pago de prueba local" | Mercado Pago no está configurado; el resultado de prueba sigue guardándose en PostgreSQL |
| "Mercado Pago rechazó la creación del pago" | Token mal copiado o de otra cuenta. Mirá el error en la terminal del servidor |
| Mercado Pago dice "no podés pagarte a vos mismo" | Estás logueado con la cuenta vendedora. Usá la compradora en incógnito |
| No vuelve solo a la página | Abriste por `localhost` en vez de la URL `https://` del túnel. Tocá "Volver al sitio" |
| Después de pagar da 404 | Revisá que el servidor esté sirviendo `public/` y que la página de retorno exista |

---

## 3. Contrato con el módulo Carrito (Fernando)

- El carrito en curso se guarda temporalmente con la clave `"carrito"` en `localStorage`.
- Contiene identificadores de productos existentes y cantidades; al confirmar la compra, el servidor vuelve a consultar sus precios y disponibilidad en PostgreSQL.
- `JSON.stringify(instanciaDeCarrito)` guarda `{}` porque **los campos privados (#) no se serializan**: hay que guardar `obtenerProductos()`.
- El botón "Finalizar compra" del carrito tiene que llevar a `public/checkout.html`.
- El sitio debe abrirse desde el servidor (`npm start`), no con Live Server, para que funcionen la API y PostgreSQL.

## 4. Qué guarda el checkout

- PostgreSQL guarda pedidos, comprador, entrega, precios históricos, estado y productos.
- `localStorage["pedidoEnCurso"]` conserva temporalmente una copia del pedido para mostrarlo al volver de Mercado Pago; la base de datos sigue siendo la fuente de verdad.
- Los datos de la tarjeta **nunca pasan por nuestro sitio**: se cargan en Mercado Pago.

## 5. Cambios del módulo

Antes de subir cambios, revisá `git status` y agregá solo los archivos de esta
etapa que realmente quieras compartir. **Nunca subas `server/.env`**: contiene
credenciales locales.

## 6. Para la defensa: qué explicar

1. **Flujo Checkout Pro:** checkout → el servidor crea una *preferencia* → redirección a Mercado Pago → pago → Mercado Pago vuelve por `back_urls` → `auto_return: "approved"` → mostramos el resultado → redirección al inicio.
2. **Seguridad:** el Access Token está en el servidor (`.env`), no en el navegador. Al volver, el backend verifica el pago con Mercado Pago y comprueba su referencia y monto antes de cambiar el estado.
3. **POO:** `Pedido` con campos privados y getters. `setEstado()` valida los estados. `toJSON()` y `desdeJSON()` resuelven que los campos privados no se serializan, para guardar el pedido antes de ir a Mercado Pago y reconstruirlo al volver.
4. **Asincronía:** `fetch` + `async/await` con el servidor y manejo de errores con `try/catch`.
5. **Cuentas:** las contraseñas se guardan como hash y el navegador recibe una cookie de sesión `HttpOnly`; el historial se consulta por la sesión, no por un ID enviado por el usuario.
6. **Reglas de negocio:** el servidor calcula precios y envío; el stock se descuenta una sola vez cuando el pago queda aprobado. El pago de prueba local no cobra dinero, pero su resultado se guarda en PostgreSQL.
7. **Notificaciones y alcance:** el servidor confirma los *webhooks* consultando el pago a Mercado Pago. Solo se envían si `BASE_URL` apunta a una URL pública HTTPS. El pago de prueba local también requiere que el servidor y PostgreSQL estén activos.
8. **Pendiente antes de producción:** revisar reservas de stock, protección adicional del webhook, límites de intentos de inicio de sesión y configuración del despliegue.
