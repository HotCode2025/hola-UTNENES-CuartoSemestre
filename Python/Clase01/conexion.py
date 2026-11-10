"""
Módulo de Conexión a Base de Datos PostgreSQL
Maneja la obtención de cursores usando el pool
"""

import psycopg2
from pool import Pool
from logger_base import LoggerBase


class Conexion:
    """
    Gestiona la conexión a PostgreSQL usando el pool.
    Se encarga de obtener cursores y ejecutar consultas.
    """

    @classmethod
    def obtener_conexion(cls):
        # Trae una conexión disponible del pool
        try:
            conexion_bd = Pool.obtener_conexion()
            LoggerBase.info("Conexión obtenida del pool")
            return CursorDelPool(conexion_bd)
        except (Exception, psycopg2.DatabaseError) as error:
            LoggerBase.error(f"Error al obtener conexión: {error}")
            raise

    @classmethod
    def cerrar_conexiones(cls):
        # Cierra el pool (cuando termina la app)
        try:
            Pool.cerrar_pool()
        except (Exception, psycopg2.DatabaseError) as error:
            LoggerBase.error(f"Error al cerrar conexiones: {error}")


class CursorDelPool:
    """
    Encapsula una conexión y su cursor.
    Administra la conexión y el cursor obtenidos del pool.
    """

    def __init__(self, conexion_bd):
        # Guarda la conexión y crea el cursor
        self._conexion = conexion_bd
        self._cursor = self._conexion.cursor()

    def __enter__(self):
        # Permite usar "with CursorDelPool(...) as cursor"
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        # Se ejecuta al salir del with, cierra cursor y libera conexión
        self._cursor.close()
        Pool.liberar_conexion(self._conexion)

    def ejecutar(self, consulta, parametros=None):
        # Ejecuta una consulta SQL
        try:
            if parametros:
                self._cursor.execute(consulta, parametros)
            else:
                self._cursor.execute(consulta)
            self._conexion.commit()
            LoggerBase.info(f"Consulta ejecutada. Filas afectadas: {self._cursor.rowcount}")
            return self._cursor.rowcount
        except (Exception, psycopg2.DatabaseError) as error:
            self._conexion.rollback()
            LoggerBase.error(f"Error al ejecutar consulta: {error}")
            raise

    def obtener_resultado(self):
        # Trae una fila del resultado
        try:
            resultado = self._cursor.fetchone()
            return resultado
        except (Exception, psycopg2.DatabaseError) as error:
            LoggerBase.error(f"Error al obtener resultado: {error}")
            raise

    def obtener_todos_resultados(self):
        # Trae todas las filas del resultado
        try:
            resultados = self._cursor.fetchall()
            return resultados
        except (Exception, psycopg2.DatabaseError) as error:
            LoggerBase.error(f"Error al obtener resultados: {error}")
            raise


# PRUEBAS
if __name__ == "__main__":
    LoggerBase.configurar_logger()
    print("\n=== PRUEBAS DE CONEXION A POSTGRESQL ===\n")

    try:
        print("[PRUEBA 1] Obteniendo conexion del pool...")
        cursor_pool = Conexion.obtener_conexion()
        print("OK - Conexion obtenida\n")

        print("[PRUEBA 2] Trayendo todos los usuarios...")
        cursor_pool.ejecutar("SELECT * FROM usuarios")
        usuarios = cursor_pool.obtener_todos_resultados()
        print(f"OK - Se encontraron {len(usuarios)} usuario(s):")
        for usuario in usuarios:
            print(f"   ID: {usuario[0]}, Nombre: {usuario[1]}, Password: {usuario[2]}")
        print()

        print("[PRUEBA 3] Trayendo usuario con ID = 1...")
        cursor_pool.ejecutar("SELECT * FROM usuarios WHERE id = %s", (1,))
        usuario_uno = cursor_pool.obtener_resultado()
        if usuario_uno:
            print(f"OK - Usuario encontrado: {usuario_uno}\n")
        else:
            print("ERROR - No se encontro usuario con ID 1\n")

        print("[PRUEBA 4] Contando usuarios...")
        cursor_pool.ejecutar("SELECT COUNT(*) FROM usuarios")
        total = cursor_pool.obtener_resultado()
        print(f"OK - Total de usuarios: {total[0]}\n")

        print("[PRUEBA 5] Liberando conexion...")
        cursor_pool._cursor.close()
        Pool.liberar_conexion(cursor_pool._conexion)
        print("OK - Conexion liberada\n")

        print("[PRUEBA 6] Obteniendo segunda conexion...")
        cursor_pool2 = Conexion.obtener_conexion()
        cursor_pool2.ejecutar("SELECT COUNT(*) FROM usuarios")
        total2 = cursor_pool2.obtener_resultado()
        print(f"OK - Segunda conexion funciona. Total: {total2[0]}\n")

        cursor_pool2._cursor.close()
        Pool.liberar_conexion(cursor_pool2._conexion)

        print("[PRUEBA 7] Cerrando todas las conexiones...")
        Conexion.cerrar_conexiones()
        print("OK - Todas las conexiones cerradas\n")

        print("=== TODAS LAS PRUEBAS COMPLETADAS ===\n")

    except Exception as error:
        print(f"ERROR: {error}\n")