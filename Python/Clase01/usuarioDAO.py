"""
Clase UsuarioDAO - Data Access Object para la entidad Usuario
Maneja todas las operaciones CRUD (Create, Read, Update, Delete) con la base de datos
"""

from conexion import Conexion
from usuario import Usuario
from logger_base import LoggerBase


class UsuarioDAO:
    """
    UsuarioDAO: Realiza todas las operaciones de base de datos para Usuario.
    Maneja inserts, updates, deletes y selects de la tabla usuarios.
    """

    @staticmethod
    def crear_usuario(usuario):
        # Inserta un nuevo usuario en la base de datos
        try:
            cursor_pool = Conexion.obtener_conexion()
            consulta = "INSERT INTO usuarios (usuario_nombre, password) VALUES (%s, %s)"
            parametros = (usuario.get_usuario_nombre(), usuario.get_password())
            cursor_pool.ejecutar(consulta, parametros)
            LoggerBase.info(f"Usuario '{usuario.get_usuario_nombre()}' creado")
            cursor_pool._cursor.close()
            return True
        except Exception as error:
            LoggerBase.error(f"Error al crear usuario: {error}")
            return False

    @staticmethod
    def obtener_usuario(id_usuario):
        # Obtiene un usuario por su ID
        try:
            cursor_pool = Conexion.obtener_conexion()
            consulta = "SELECT * FROM usuarios WHERE id = %s"
            parametros = (id_usuario,)
            cursor_pool.ejecutar(consulta, parametros)
            resultado = cursor_pool.obtener_resultado()
            cursor_pool._cursor.close()
            
            if resultado:
                usuario = Usuario(resultado[0], resultado[1], resultado[2])
                LoggerBase.debug(f"Usuario con ID {id_usuario} obtenido")
                return usuario
            else:
                LoggerBase.warning(f"Usuario con ID {id_usuario} no encontrado")
                return None
        except Exception as error:
            LoggerBase.error(f"Error al obtener usuario: {error}")
            return None

    @staticmethod
    def obtener_todos_usuarios():
        # Obtiene todos los usuarios de la base de datos
        try:
            cursor_pool = Conexion.obtener_conexion()
            consulta = "SELECT * FROM usuarios"
            cursor_pool.ejecutar(consulta)
            resultados = cursor_pool.obtener_todos_resultados()
            cursor_pool._cursor.close()
            
            usuarios = []
            for resultado in resultados:
                usuario = Usuario(resultado[0], resultado[1], resultado[2])
                usuarios.append(usuario)
            LoggerBase.info(f"Se obtuvieron {len(usuarios)} usuarios")
            return usuarios
        except Exception as error:
            LoggerBase.error(f"Error al obtener usuarios: {error}")
            return []

    @staticmethod
    def actualizar_usuario(usuario):
        # Actualiza un usuario existente
        try:
            cursor_pool = Conexion.obtener_conexion()
            consulta = "UPDATE usuarios SET usuario_nombre = %s, password = %s WHERE id = %s"
            parametros = (usuario.get_usuario_nombre(), usuario.get_password(), usuario.get_id_usuario())
            cursor_pool.ejecutar(consulta, parametros)
            LoggerBase.info(f"Usuario con ID {usuario.get_id_usuario()} actualizado")
            cursor_pool._cursor.close()
            return True
        except Exception as error:
            LoggerBase.error(f"Error al actualizar usuario: {error}")
            return False

    @staticmethod
    def eliminar_usuario(id_usuario):
        # Elimina un usuario por su ID
        try:
            cursor_pool = Conexion.obtener_conexion()
            consulta = "DELETE FROM usuarios WHERE id = %s"
            parametros = (id_usuario,)
            cursor_pool.ejecutar(consulta, parametros)
            LoggerBase.info(f"Usuario con ID {id_usuario} eliminado")
            cursor_pool._cursor.close()
            return True
        except Exception as error:
            LoggerBase.error(f"Error al eliminar usuario: {error}")
            return False


# PRUEBAS
if __name__ == "__main__":
    LoggerBase.configurar_logger()
    print("\n=== PRUEBAS DE UsuarioDAO ===\n")

    # Prueba 1: Obtener todos los usuarios
    print("[PRUEBA 1] Obteniendo todos los usuarios...")
    usuarios = UsuarioDAO.obtener_todos_usuarios()
    print(f"OK - Se encontraron {len(usuarios)} usuario(s):")
    for usuario in usuarios:
        print(f"   {usuario}")
    print()

    # Prueba 2: Obtener un usuario específico
    print("[PRUEBA 2] Obteniendo usuario con ID = 1...")
    usuario = UsuarioDAO.obtener_usuario(1)
    if usuario:
        print(f"OK - Usuario encontrado: {usuario}\n")
    else:
        print("ERROR - No se encontro usuario\n")

    # Prueba 3: Crear un nuevo usuario
    print("[PRUEBA 3] Creando nuevo usuario...")
    usuario_nuevo = Usuario(None, "usuario_test", "pass123")
    if UsuarioDAO.crear_usuario(usuario_nuevo):
        print("OK - Nuevo usuario creado\n")
    else:
        print("ERROR - No se pudo crear el usuario\n")

    # Prueba 4: Obtener todos de nuevo para ver el nuevo
    print("[PRUEBA 4] Obteniendo todos los usuarios nuevamente...")
    usuarios = UsuarioDAO.obtener_todos_usuarios()
    print(f"OK - Total de usuarios ahora: {len(usuarios)}")
    for usuario in usuarios:
        print(f"   {usuario}")
    print()

    print("=== TODAS LAS PRUEBAS COMPLETADAS ===\n")

    # Cerrar todas las conexiones
    from pool import Pool
    Pool.cerrar_pool()