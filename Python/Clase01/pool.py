"""
Módulo Pool - Gestiona el pool de conexiones a PostgreSQL
"""

import psycopg2
from psycopg2 import pool
from logger_base import LoggerBase


class Pool:
    """
    Pool: Gestiona el pool de conexiones a PostgreSQL.
    Centraliza la creación y administración de conexiones reutilizables.
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
                LoggerBase.info("Pool de conexiones creado")
            except (Exception, psycopg2.DatabaseError) as error:
                LoggerBase.error(f"Error al crear el pool: {error}")
                raise
        return cls._pool

    @classmethod
    def obtener_conexion(cls):
        # Obtiene una conexión del pool
        try:
            conexion_bd = cls.obtener_pool().getconn()
            LoggerBase.info("Conexión obtenida del pool")
            return conexion_bd
        except (Exception, psycopg2.DatabaseError) as error:
            LoggerBase.error(f"Error al obtener conexión: {error}")
            raise

    @classmethod
    def liberar_conexion(cls, conexion_bd):
        # Devuelve la conexión al pool
        if conexion_bd:
            try:
                cls.obtener_pool().putconn(conexion_bd)
                LoggerBase.info("Conexión liberada al pool")
            except (Exception, psycopg2.DatabaseError) as error:
                LoggerBase.error(f"Error al liberar conexión: {error}")

    @classmethod
    def cerrar_pool(cls):
        # Cierra todas las conexiones del pool
        if cls._pool:
            try:
                cls._pool.closeall()
                cls._pool = None
                LoggerBase.info("Pool de conexiones cerrado")
            except (Exception, psycopg2.DatabaseError) as error:
                LoggerBase.error(f"Error al cerrar el pool: {error}")


# PRUEBAS
if __name__ == "__main__":
    LoggerBase.configurar_logger()
    print("\n=== PRUEBAS DEL POOL ===\n")

    try:
        print("[PRUEBA 1] Obteniendo conexión del pool...")
        conexion = Pool.obtener_conexion()
        print("OK - Conexión obtenida\n")

        print("[PRUEBA 2] Liberando conexión...")
        Pool.liberar_conexion(conexion)
        print("OK - Conexión liberada\n")

        print("[PRUEBA 3] Obteniendo segunda conexión...")
        conexion2 = Pool.obtener_conexion()
        print("OK - Segunda conexión obtenida\n")

        print("[PRUEBA 4] Liberando segunda conexión...")
        Pool.liberar_conexion(conexion2)
        print("OK - Segunda conexión liberada\n")

        print("[PRUEBA 5] Cerrando pool...")
        Pool.cerrar_pool()
        print("OK - Pool cerrado\n")

        print("=== TODAS LAS PRUEBAS COMPLETADAS ===\n")

    except Exception as error:
        print(f"ERROR: {error}\n")
        LoggerBase.error(f"Error en pruebas del pool: {error}")