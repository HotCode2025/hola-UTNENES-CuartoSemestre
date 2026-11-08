# Consulta de razas con Requests
Desde esta carpeta, en macOS:
```sh
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python main.py
python -m pip freeze
```
La consulta necesita internet. Para practicar cómo guardar todas las versiones instaladas en este entorno, ejecutá `python -m pip freeze > requirements-congelados.txt`. En un entorno nuevo podés reinstalarlas con `python -m pip install -r requirements-congelados.txt`.

Para guardar la clase en Git, volvé a la raíz de tu repositorio y comprobá tu rama antes del commit:
```sh
git branch --show-current
git status --short
git add Python/.gitignore Python/Clase08
git commit -m "Python clase 8: entornos virtuales y Requests"
```
