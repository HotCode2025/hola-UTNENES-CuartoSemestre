from pathlib import Path
import sys

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd

carpeta = Path(__file__).resolve().parent
datos = pd.read_csv(carpeta / "data.csv")
salida = carpeta / "resultados"
salida.mkdir(exist_ok=True)

# El gráfico muestra cómo se distribuye la población entre los países del continente.
africa = datos.loc[datos["Continent"] == "Africa"]
figura, eje = plt.subplots()
eje.pie(africa["World Population Percentage"])
eje.set_title("Distribución de la población de África por país")
figura.savefig(salida / "africa.png")
plt.close(figura)

pais = sys.argv[1] if len(sys.argv) > 1 else "Argentina"
filas = datos.loc[datos["Country"].str.casefold() == pais.casefold()]
if filas.empty:
    raise SystemExit(f"El país {pais} no figura en el CSV.")
registro = filas.iloc[0]
anios = sorted(columna[:4] for columna in datos if columna.endswith(" Population") and columna[:4].isdigit())
figura, eje = plt.subplots()
eje.bar(anios, [registro[f"{anio} Population"] for anio in anios])
eje.set_title(f"Población de {registro['Country']}")
figura.savefig(salida / "poblacion.png")
plt.close(figura)
print(f"Gráficos guardados en {salida}")
