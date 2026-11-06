async function pedirUsuarioAPI(ruta, opciones = {}) {
  const respuesta = await fetch(`/api${ruta}`, {
    ...opciones,
    headers: {
      "Content-Type": "application/json",
      ...(opciones.headers || {}),
    },
  });
  const datos = respuesta.status === 204 ? {} : await respuesta.json();
  if (!respuesta.ok) {
    const error = new Error(datos.error || "No se pudo completar la operación.");
    error.status = respuesta.status;
    throw error;
  }
  return datos;
}

function obtenerDestinoSeguro() {
  const destino = new URLSearchParams(location.search).get("next");
  if (!destino || !destino.startsWith("/") || destino.startsWith("//")) return "perfil.html";
  try {
    const url = new URL(destino, location.origin);
    return url.origin === location.origin ? `${url.pathname}${url.search}${url.hash}` : "perfil.html";
  } catch {
    return "perfil.html";
  }
}

function propagarDestino(selector) {
  const destino = new URLSearchParams(location.search).get("next");
  if (!destino) return;
  document.querySelectorAll(selector).forEach((enlace) => {
    enlace.href += `?next=${encodeURIComponent(destino)}`;
  });
}
