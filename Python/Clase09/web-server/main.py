from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI()

@app.get("/")
def listar():
    return [1, 2, 3]

@app.get("/contact", response_class=HTMLResponse)
def contacto():
    return "<h1>Contacto</h1><p>Servidor de la clase 9 de Python.</p>"
