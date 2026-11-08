import requests

def obtener_razas():
    respuesta = requests.get("https://dog.ceo/api/breeds/list/all", timeout=10)
    respuesta.raise_for_status()
    # La API devuelve los nombres de las razas como claves del objeto "message".
    return sorted(respuesta.json()["message"])
