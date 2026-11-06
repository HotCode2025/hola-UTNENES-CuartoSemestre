export class AuthService {

    static async solicitar(ruta, opciones = {}) {
        const respuesta = await fetch(`/api${ruta}`, {
            ...opciones,
            headers: {
                "Content-Type": "application/json",
                ...(opciones.headers || {}),
            },
        });
        const datos = respuesta.status === 204 ? {} : await respuesta.json();
        if (!respuesta.ok) {
            throw new Error(datos.error || "No se pudo completar la operación.");
        }
        return datos;
    }

    static iniciarSesion(email, password) {
        return this.solicitar("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
    }

    static registrar(datos) {
        return this.solicitar("/auth/registro", {
            method: "POST",
            body: JSON.stringify(datos),
        });
    }
}
