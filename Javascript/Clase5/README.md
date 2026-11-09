# Clase 05 – Stack PERN (Parte 1: Backend con Node + Express)

Primera parte del proyecto **PERN** (PostgreSQL · Express · React · Node). En esta clase se arma el **backend**: servidor Express, middlewares, manejo de errores y rutas REST organizadas en `router/` y `controllers/`.

## Arquitectura del stack

- **Frontend:** React + React Router + React Hook Form + Axios + Context + Tailwind CSS
- **Backend:** Node.js + Express (REST API que responde JSON) + JWT
- **Base de datos:** PostgreSQL (librería `pg`)
- **Deploy:** Railway

## Cómo ejecutarlo

```bash
pnpm install
pnpm dev      # nodemon, se reinicia al guardar
# o
pnpm start    # node .
```

Servidor en **http://localhost:3000**

## Estructura

```
database/
  init.sql                 # (vacío) tablas de PostgreSQL
src/
  index.js                 # arranca el servidor (app.listen)
  app.js                   # configuración de Express, middlewares y rutas
  config.js / db.js        # (vacíos) configuración y conexión a la BD
  router/
    tareas.routes.js       # CRUD de tareas
    auth.routes.js         # signin / signup / signout / profile
  controllers/
    tareas.controller.js   # lógica de tareas
    auth.controller.js     # lógica de autenticación
  libs/ middlewares/ schemas/   # para las próximas clases
```

## Endpoints

| Método | Ruta | Controller |
|---|---|---|
| GET | `/` | Mensaje de bienvenida (JSON) |
| GET | `/api/tareas` | `listarTareas` |
| GET | `/api/tareas/:id` | `listarTarea` |
| POST | `/api/tareas` | `crearTarea` |
| PUT | `/api/tareas/:id` | `actualizarTarea` |
| DELETE | `/api/tareas/:id` | `eliminarTarea` |
| POST | `/api/signin` | `signin` |
| POST | `/api/signup` | `signup` |
| POST | `/api/signout` | `signout` |
| GET | `/api/profile` | `profile` |

Probadas con **Thunder Client** (extensión de VS Code).

## Videos de la clase

| Video | Tema | Lo que hicimos |
|---|---|---|
| 1–2 | 5.1 Introducción | Arquitectura del stack PERN |
| 3 | 5.2 Dependencias de producción | `pnpm init` + `express cookie-parser cors morgan pg zod md5 jsonwebtoken express-promise-router` |
| 4 | 5.3 Dependencias de desarrollo | `nodemon eslint -D`, `"type": "module"`, scripts `dev` y `start` |
| 5 | 5.4 Carpetas del backend | `controllers, libs, middlewares, router, schemas` + `app.js, config.js, db.js` |
| 6 | 5.5 Carpeta de base de datos | `database/init.sql`, `.gitignore` |
| 7 | 5.6 Servidor Express | `app.js` con morgan y ruta `/`, `index.js` con `app.listen(3000)` |
| 8 | 5.7 Lanzar el servidor (1) | Middleware de errores `(err, req, res, next)` → 500 + JSON |
| 9 | 5.7 Lanzar el servidor (2) | `express.json()` y `express.urlencoded()` |
| 10 | 5.8 Rutas (1) | `tareas.routes.js` con GET/POST/PUT/DELETE |
| 11 | 5.8 Rutas (2) | `auth.routes.js`, prefijo `/api`, prueba con Thunder Client |
| 12 | 5.8 Rutas (3) | Lógica movida a `controllers/` |

## Notas

- Se usa **pnpm** en lugar de npm (consigna del curso).
- Versiones fijadas como en el curso: **express 4** y **zod 3** (`express-promise-router` requiere Express 4).
- `node_modules/` y `.env` están en `.gitignore`.
