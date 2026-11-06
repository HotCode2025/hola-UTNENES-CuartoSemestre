/**
 * ============================================================
 *  MercadoPagoService  (SIMULACIÓN)
 *  Responsable: Matías Tobares
 * ------------------------------------------------------------
 *  Simula el comportamiento de la pasarela de Mercado Pago.
 *  NO se conecta a ningún servidor y NO realiza cobros reales.
 *  Los datos de tarjeta nunca se guardan: sólo los últimos 4
 *  dígitos para mostrar el comprobante.
 *
 *  Cómo se decide el resultado (igual que el modo de prueba
 *  oficial de Mercado Pago, según el NOMBRE DEL TITULAR):
 *    APRO  -> ✅ pago aprobado
 *    CONT  -> ⏳ pago pendiente
 *    OTHE  -> ❌ pago rechazado
 *    Efectivo (Rapipago / Pago Fácil) -> ⏳ pendiente
 *    Cualquier otro nombre -> ✅ aprobado
 * ============================================================
 */
class MercadoPagoService {

  static ESTADOS = {
    APROBADO: "aprobado",
    PENDIENTE: "pendiente",
    RECHAZADO: "rechazado",
  };

  // Tiempo que tarda la "pasarela" en responder (milisegundos)
  static #DEMORA_MS = 2200;

  static #DETALLES = {
    aprobado: "¡Listo! Se acreditó tu pago.",
    pendiente_tarjeta: "Estamos procesando tu pago. En menos de 2 días hábiles te avisaremos por e-mail si se acreditó.",
    pendiente_efectivo: "Pagá el cupón en Rapipago o Pago Fácil antes de 3 días. Al acreditarse te avisamos por e-mail.",
    rechazado: "Tu pago fue rechazado. El banco no autorizó la operación (fondos insuficientes).",
  };

  // ---------------- Utilidades de tarjeta ----------------

  /** Detecta la marca según el primer dígito (simplificado) */
  static detectarMarca(numero) {
    const limpio = String(numero).replace(/\D/g, "");
    if (/^4/.test(limpio)) return "Visa";
    if (/^5[1-5]/.test(limpio) || /^50/.test(limpio)) return "Mastercard";
    if (/^3[47]/.test(limpio)) return "American Express";
    return null;
  }

  /** Algoritmo de Luhn: valida que el número de tarjeta sea coherente */
  static #pasaLuhn(numero) {
    let suma = 0;
    let duplicar = false;
    for (let i = numero.length - 1; i >= 0; i--) {
      let digito = Number(numero[i]);
      if (duplicar) {
        digito *= 2;
        if (digito > 9) digito -= 9;
      }
      suma += digito;
      duplicar = !duplicar;
    }
    return suma % 10 === 0;
  }

  /**
   * Valida los datos de la tarjeta.
   * Devuelve { valido: boolean, errores: { campo: mensaje } }
   */
  static validarTarjeta({ numero, titular, vencimiento, cvv, dni }) {
    const errores = {};
    const num = String(numero || "").replace(/\D/g, "");

    if (num.length < 15 || num.length > 16 || !MercadoPagoService.#pasaLuhn(num)) {
      errores.numero = "Revisá el número de tarjeta.";
    } else if (!MercadoPagoService.detectarMarca(num)) {
      errores.numero = "Aceptamos Visa, Mastercard y American Express.";
    }

    if (!titular || titular.trim().length < 3) {
      errores.titular = "Ingresá el nombre como figura en la tarjeta.";
    }

    const venc = String(vencimiento || "").match(/^(\d{2})\/(\d{2})$/);
    if (!venc) {
      errores.vencimiento = "Usá el formato MM/AA.";
    } else {
      const mes = Number(venc[1]);
      const anio = 2000 + Number(venc[2]);
      const hoy = new Date();
      // Último día del mes de vencimiento
      const fechaVenc = new Date(anio, mes, 0, 23, 59, 59);
      if (mes < 1 || mes > 12) {
        errores.vencimiento = "Mes inválido.";
      } else if (fechaVenc < hoy) {
        errores.vencimiento = "La tarjeta está vencida.";
      }
    }

    const largoCvv = MercadoPagoService.detectarMarca(num) === "American Express" ? 4 : 3;
    if (!new RegExp(`^\\d{${largoCvv}}$`).test(String(cvv || ""))) {
      errores.cvv = `Ingresá los ${largoCvv} dígitos del código.`;
    }

    if (!/^\d{7,8}$/.test(String(dni || ""))) {
      errores.dni = "El DNI debe tener 7 u 8 números.";
    }

    return { valido: Object.keys(errores).length === 0, errores };
  }

  // ---------------- Proceso de pago ----------------

  /** Decide el estado del pago según las reglas del modo de prueba */
  static #resolverEstado(datosPago) {
    if (datosPago.metodo === "efectivo") {
      return MercadoPagoService.ESTADOS.PENDIENTE;
    }
    const titular = (datosPago.titular || "").trim().toUpperCase();
    if (titular === "OTHE") return MercadoPagoService.ESTADOS.RECHAZADO;
    if (titular === "CONT") return MercadoPagoService.ESTADOS.PENDIENTE;
    return MercadoPagoService.ESTADOS.APROBADO; // "APRO" o cualquier otro nombre
  }

  static #generarId(prefijo) {
    return prefijo + Math.floor(Math.random() * 1e10).toString().padStart(10, "0");
  }

  /**
   * Simula el envío del pago a Mercado Pago.
   * Es asíncrono (devuelve una Promise) igual que una API real,
   * así el código de checkout.js queda preparado para una
   * integración real en el futuro.
   *
   * @param {Pedido} pedido
   * @param {Object} datosPago { metodo: "credito"|"debito"|"efectivo", numero, titular, cuotas }
   * @returns {Promise<Object>} resultado del pago
   */
  static procesarPago(pedido, datosPago) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const estado = MercadoPagoService.#resolverEstado(datosPago);
        const esEfectivo = datosPago.metodo === "efectivo";
        const num = String(datosPago.numero || "").replace(/\D/g, "");

        let detalle = MercadoPagoService.#DETALLES[estado];
        if (estado === "pendiente") {
          detalle = esEfectivo
            ? MercadoPagoService.#DETALLES.pendiente_efectivo
            : MercadoPagoService.#DETALLES.pendiente_tarjeta;
        }

        resolve({
          estado,
          detalle,
          idTransaccion: MercadoPagoService.#generarId("MP-"),
          metodo: datosPago.metodo,
          marca: esEfectivo ? null : MercadoPagoService.detectarMarca(num),
          ultimos4: esEfectivo ? null : num.slice(-4),
          cuotas: datosPago.metodo === "credito" ? Number(datosPago.cuotas) || 1 : 1,
          codigoCupon: esEfectivo ? MercadoPagoService.#generarId("") : null,
          monto: pedido.calcularTotal(),
          fecha: new Date().toISOString(),
        });
      }, MercadoPagoService.#DEMORA_MS);
    });
  }
}
