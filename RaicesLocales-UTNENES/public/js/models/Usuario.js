export class Usuario {

    #id;
    #nombre;
    #apellido;
    #email;
    #password;
    #historialCompras;

    constructor(
        id,
        nombre,
        apellido,
        email,
        password
    ){
        this.#id = id;
        this.#nombre = nombre;
        this.#apellido = apellido;
        this.#email = email;
        this.#password = password;
        this.#historialCompras = [];
    }

    getId(){
        return this.#id;
    }

    getNombre(){
        return this.#nombre;
    }

    getApellido(){
        return this.#apellido;
    }

    getEmail(){
        return this.#email;
    }

    getHistorialCompras(){
        return this.#historialCompras;
    }

    agregarCompra(compra){
        this.#historialCompras.push(compra);
    }
}