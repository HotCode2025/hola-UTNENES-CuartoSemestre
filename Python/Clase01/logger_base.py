"""
Clase LoggerBase - Centraliza el logging de toda la aplicación
Configura y proporciona métodos para registrar eventos en archivos
"""

import logging
from logging.handlers import RotatingFileHandler
import os


class LoggerBase:
    """
    LoggerBase: Gestiona el logging centralizado de la aplicación.
    Registra eventos en archivos y en consola.
    """

    _logger = None
    _log_file = "logs/aplicacion.log"

    @classmethod
    def configurar_logger(cls):
        # Crea el directorio de logs si no existe
        if not os.path.exists("logs"):
            os.makedirs("logs")

        # Crea el logger
        cls._logger = logging.getLogger("AplicacionUsuarios")
        cls._logger.setLevel(logging.DEBUG)

        # Formato de los logs
        formato = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )

        # Handler para archivo con rotación
        file_handler = RotatingFileHandler(
            cls._log_file,
            maxBytes=5*1024*1024,  # 5 MB
            backupCount=3  # Mantiene 3 archivos backup
        )
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(formato)

        # Handler para consola
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        console_handler.setFormatter(formato)

        # Agrega los handlers al logger
        cls._logger.addHandler(file_handler)
        cls._logger.addHandler(console_handler)

    @classmethod
    def obtener_logger(cls):
        # Retorna el logger configurado
        if cls._logger is None:
            cls.configurar_logger()
        return cls._logger

    @classmethod
    def info(cls, mensaje):
        # Registra un mensaje de información
        cls.obtener_logger().info(mensaje)

    @classmethod
    def error(cls, mensaje):
        # Registra un mensaje de error
        cls.obtener_logger().error(mensaje)

    @classmethod
    def warning(cls, mensaje):
        # Registra un mensaje de advertencia
        cls.obtener_logger().warning(mensaje)

    @classmethod
    def debug(cls, mensaje):
        # Registra un mensaje de debug
        cls.obtener_logger().debug(mensaje)


# PRUEBAS
if __name__ == "__main__":
    print("\n=== PRUEBAS DE LoggerBase ===\n")

    # Prueba 1: Configurar logger
    print("[PRUEBA 1] Configurando logger...")
    LoggerBase.configurar_logger()
    print("OK - Logger configurado\n")

    # Prueba 2: Registrar mensaje info
    print("[PRUEBA 2] Registrando mensaje INFO...")
    LoggerBase.info("Este es un mensaje de información")
    print("OK - Mensaje info registrado\n")

    # Prueba 3: Registrar mensaje error
    print("[PRUEBA 3] Registrando mensaje ERROR...")
    LoggerBase.error("Este es un mensaje de error")
    print("OK - Mensaje error registrado\n")

    # Prueba 4: Registrar mensaje warning
    print("[PRUEBA 4] Registrando mensaje WARNING...")
    LoggerBase.warning("Este es un mensaje de advertencia")
    print("OK - Mensaje warning registrado\n")

    # Prueba 5: Registrar mensaje debug
    print("[PRUEBA 5] Registrando mensaje DEBUG...")
    LoggerBase.debug("Este es un mensaje de debug")
    print("OK - Mensaje debug registrado\n")

    # Prueba 6: Verificar archivo de logs
    print("[PRUEBA 6] Verificando archivo de logs...")
    if os.path.exists("logs/aplicacion.log"):
        print("OK - Archivo de logs creado en logs/aplicacion.log")
        with open("logs/aplicacion.log", "r") as archivo:
            print("\nContenido del archivo:")
            print(archivo.read())
    else:
        print("ERROR - Archivo de logs no encontrado\n")

    print("\n=== TODAS LAS PRUEBAS COMPLETADAS ===\n")