import { AuthService } from "./AuthService.js";

export class SessionService {

    static async obtenerSesion() {
        const datos = await AuthService.solicitar("/auth/me");
        return datos.usuario;
    }

    static cerrarSesion() {
        return AuthService.solicitar("/auth/logout", { method: "POST" });
    }
}