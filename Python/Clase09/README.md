# Clase 9 · Python en entorno profesional
Desde esta carpeta, con Docker activo, ejecutá los pasos siguientes.

1. **Pandas y Docker para scripts.** Ejecutá `docker compose build analisis` y luego `docker compose run --rm analisis Argentina`. El script lee el CSV, filtra por continente y genera dos gráficos en `app/resultados/`. Podés pasar otro país del CSV.
2. **FastAPI y Docker para servidores.** Ejecutá `docker compose up --build servidor`. Abrí http://localhost:8000 para ver JSON, /contact para la página HTML y /docs para consultar las rutas.
3. **Vinculación de archivos.** Los volúmenes de compose.yaml enlazan cada carpeta local con /curso dentro de su contenedor. Cambiá el texto de /contact en web-server/main.py y recargá la página. Uvicorn detecta la edición automáticamente. Para detener el servidor usá Ctrl+C y luego docker compose down.

El archivo data.csv es el conjunto de datos de población usado en la práctica del grupo Código Crítico (HotCode2025, Python en Entorno Profesional, parte 7).
