# Entornos virtuales
Cada proyecto puede tener su propio intérprete y sus propias dependencias. En macOS, desde esta carpeta, ejecutá los comandos uno por uno.
```sh
python3 -m venv .venv
source .venv/bin/activate
python -c "import sys; print(sys.executable); print(sys.prefix != sys.base_prefix)"
python -m pip list
deactivate
```
El segundo valor debería ser True. Para repetir la práctica solo hace falta activar el entorno existente. Git ignora la carpeta .venv porque se recrea en cada computadora.
