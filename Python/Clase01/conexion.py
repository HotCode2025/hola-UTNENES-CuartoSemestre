"""
Módulo de Conexión a Base de Datos PostgreSQL
Maneja el pool de conexiones y la obtención de cursores
"""

import psycopg2
from psycopg2 import pool
import logging

# Configuración de logging (usar logger_base después)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class Conexion:
    """
    Gestiona la conexión a PostgreSQL y el pool de conexiones.
    Se encarga de reutilizar conexiones en lugar de crear nuevas cada vez.
    """

    # Configuración de la base de datos
    _DATABASE = "laboratorio_usuarios"
    _USERNAME = "postgres"
    _PASSWORD = "admin"
    _DB_PORT = "5432"
    _HOST = "localhost"
    _MIN_CON = 2  # Mínimo de conexiones activas
    _MAX_CON = 5  # Máximo de conexiones
    _pool = None

    @classmethod
    def obtener_pool(cls):
        # Crea el pool si no existe
        if cls._pool is None:
            try:
                cls._pool = pool.SimpleConnectionPool(
    cls._MIN_CON,
    cls._MAX_CON,
    host=cls._HOST,
    database=cls._DATABASE,
    user=cls._USERNAME,
    password=cls._PASSWORD,
    port=cls._DB_PORT,
    client_encoding='UTF8'
)
                logger.info("Pool de conexiones creado")
            except (Exception, psycopg2.DatabaseError) as error:
                logger.error(f"Error al crear el pool: {error}")
                raise
        return cls._pool

    @classmethod
    def obtener_conexion(cls):
        # Trae una conexión disponible del pool
        try:
            conexion_bd = cls.obtener_pool().getconn()
            logger.info("Conexión obtenida del pool")
            return CursorDelPool(conexion_bd, cls.obtener_pool())
        except (Exception, psycopg2.DatabaseError) as error:
            logger.error(f"Error al obtener conexión: {error}")
            raise

    @classmethod
    def liberar_conexion(cls, conexion_bd, pool_conexiones):
        # Devuelve la conexión al pool para que otro la use
        if conexion_bd:
            try:
                pool_conexiones.putconn(conexion_bd)
                logger.info("Conexión liberada al pool")
            except (Exception, psycopg2.DatabaseError) as error:
                logger.error(f"Error al liberar conexión: {error}")

    @classmethod
    def cerrar_conexiones(cls):
        # Cierra todas las conexiones del pool (cuando termina la app)
        if cls._pool:
            try:
                cls._pool.closeall()
                cls._pool = None
                logger.info("Todas las conexiones cerradas")
            except (Exception, psycopg2.DatabaseError) as error:
                logger.error(f"Error al cerrar el pool: {error}")


class CursorDelPool:
    """
    Encapsula una conexión y su cursor.
    Administra la conexión y el cursor obtenidos del pool.
    """

    def __init__(self, conexion_bd, pool_conexiones):
        # Guarda la conexión y el pool, crea el cursor
        self._conexion = conexion_bd
        self._pool = pool_conexiones
        self._cursor = self._conexion.cursor()

    def __enter__(self):
        # Permite usar "with CursorDelPool(...) as cursor"
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        # Se ejecuta al salir del with, cierra cursor y libera conexión
        self._cursor.close()
        Conexion.liberar_conexion(self._conexion, self._pool)

    def ejecutar(self, consulta, parametros=None):
        # Ejecuta una consulta SQL
        try:
            if parametros:
                self._cursor.execute(consulta, parametros)
            else:
                self._cursor.execute(consulta)
            self._conexion.commit()
            logger.info(f"Consulta ejecutada. Filas afectadas: {self._cursor.rowcount}")
            return self._cursor.rowcount
        except (Exception, psycopg2.DatabaseError) as error:
            self._conexion.rollback()
            logger.error(f"Error al ejecutar consulta: {error}")
            raise

    def obtener_resultado(self):
        # Trae una fila del resultado
        try:
            resultado = self._cursor.fetchone()
            return resultado
        except (Exception, psycopg2.DatabaseError) as error:
            logger.error(f"Error al obtener resultado: {error}")
            raise

    def obtener_todos_resultados(self):
        # Trae todas las filas del resultado
        try:
            resultados = self._cursor.fetchall()
            return resultados
        except (Exception, psycopg2.DatabaseError) as error:
            logger.error(f"Error al obtener resultados: {error}")
            raise


# PRUEBAS
if __name__ == "__main__":
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
        cursor_pool.ejecutar("SELECT * FROM usuarios WHERE id= %s", (1,))
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
        Conexion.liberar_conexion(cursor_pool._conexion, cursor_pool._pool)
        print("OK - Conexion liberada\n")

        print("[PRUEBA 6] Obteniendo segunda conexion...")
        cursor_pool2 = Conexion.obtener_conexion()
        cursor_pool2.ejecutar("SELECT COUNT(*) FROM usuarios")
        total2 = cursor_pool2.obtener_resultado()
        print(f"OK - Segunda conexion funciona. Total: {total2[0]}\n")

        cursor_pool2._cursor.close()
        Conexion.liberar_conexion(cursor_pool2._conexion, cursor_pool2._pool)

        print("[PRUEBA 7] Cerrando todas las conexiones...")
        Conexion.cerrar_conexiones()
        print("OK - Todas las conexiones cerradas\n")

        print("=== TODAS LAS PRUEBAS COMPLETADAS ===\n")

    except Exception as error:
        print(f"ERROR: {error}\n")