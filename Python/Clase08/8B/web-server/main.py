from requests import RequestException

from store import obtener_razas

if __name__ == "__main__":
    try:
        for raza in obtener_razas():
            print(raza)
    except RequestException as error:
        raise SystemExit(f"No se pudo consultar la API: {error}")
