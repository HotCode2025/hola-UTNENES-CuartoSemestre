const fs = require('fs');

function leer(ruta, cb){
    fs.readFile(ruta, (err, data) => {
        cb(data.toString());
    })
}

function escribir(ruta, contenido) {
    fs.writeFile(ruta, contenido, function (err){
        if (err) {
            console.log('No se ha podido escribir', err);
        } else {
            console.log('Se ha escrito correctamente');
        }
    })
}

function borrar(ruta, cb) {
    fs.unlink(ruta, cb);
}

borrar(`${__dirname}/archivo1.txt`, console.log);
