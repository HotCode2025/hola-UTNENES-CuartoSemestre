console.log('Inicio del programa');

setTimeout(() => {
    console.log('Primer Timeout');
}, 3000); // Se ejecutará tras 3000 ms (3 segundos)

setTimeout(() => {
    console.log('Segundo Timeout');
}, 0); // Delay de 0 ms

setTimeout(() => {
    console.log('Tercer Timeout');
}, 0); // Delay de 0 ms

console.log('Fin de programa');