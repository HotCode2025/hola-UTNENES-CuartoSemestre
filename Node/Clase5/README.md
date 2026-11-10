# Clase 05 – Node: asincronía y monohilo

Archivo de trabajo: `01-Hola-Mundo/monohilo.js`

## Cómo ejecutarlo

```bash
cd 01-Hola-Mundo
node monohilo
```

El `setInterval` mantiene el programa vivo: se corta con **Ctrl + C**.

## Videos de la clase

| Video | Tema | Lo que se hizo |
|---|---|---|
| 1 | 5.1 Explicación con `monohilo.js` | Crear el archivo con `console.log` y ejecutarlo con `node monohilo` |
| 2 | 5.2 `setInterval` iterado como un `for` | `setInterval(fn, 1000)` imprime "Sigo activo" cada segundo; luego un contador `i++` (0, 1, 2…) |
| 3 | 5.3 Creamos un error | Cuando `i === 5` se usa una variable inexistente (`3 + z`) → `ReferenceError: z is not defined` y el proceso **se cae** |
| 4 | 5.4 Ejecutamos para aclarar conceptos | Se comenta el error y se agrega `console.log('Segunda instrucción')` **después** del `setInterval` |

## Resultado final

```
Hola a toda la cohorte 2026
Segunda instrucción
0
1
2
...
```

## Conceptos

- **Monohilo:** Node ejecuta el código JavaScript en **un solo hilo**, una instrucción a la vez.
- **Asíncrono / no bloqueante:** el `setInterval` no frena el programa. Node lo registra, lo delega y **sigue con la línea siguiente**. Por eso `'Segunda instrucción'` aparece **antes** del `0`, aunque esté escrita después.
- **Event loop:** cuando el call stack queda vacío, el event loop toma de la cola las funciones pendientes (cada tick del `setInterval`) y las ejecuta.
- **Errores no capturados:** como hay un único hilo, un error sin capturar dentro de una tarea asíncrona (video 3) **termina todo el proceso**, incluido el intervalo.
