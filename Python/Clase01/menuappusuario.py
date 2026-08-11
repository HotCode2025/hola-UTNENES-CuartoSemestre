"""
Clase MenuAppUsuario - Menú interactivo para el usuario
Permite listar, agregar, actualizar y eliminar usuarios
"""

from usuarioDAO import UsuarioDAO
from usuario import Usuario


class MenuAppUsuario:
    """
    MenuAppUsuario: Menú principal de la aplicación.
    Muestra las opciones y gestiona la interacción con el usuario.
    """

    @staticmethod
    def mostrar_menu():
        # Muestra las opciones disponibles
        print("\n" + "="*50)
        print("MENU - GESTIÓN DE USUARIOS")
        print("="*50)
        print("1. Listar usuarios")
        print("2. Agregar usuario")
        print("3. Actualizar usuario")
        print("4. Eliminar usuario")
        print("5. Salir")
        print("="*50)

    @staticmethod
    def listar_usuarios():
        # Obtiene y muestra todos los usuarios
        print("\n--- LISTADO DE USUARIOS ---")
        usuarios = UsuarioDAO.obtener_todos_usuarios()
        if usuarios:
            for usuario in usuarios:
                print(usuario)
        else:
            print("No hay usuarios registrados")

    @staticmethod
    def agregar_usuario():
        # Pide datos al usuario y crea uno nuevo
        print("\n--- AGREGAR USUARIO ---")
        try:
            nombre = input("Ingresa el nombre del usuario: ")
            print(f"DEBUG - Nombre ingresado: '{nombre}'")  # Para ver qué capturaste
            if not nombre:
                print("ERROR - El nombre no puede estar vacio")
                return
            
            password = input("Ingresa la contraseña: ")
            if not password:
                print("ERROR - La contraseña no puede estar vacia")
                return
            
            usuario = Usuario(None, nombre, password)
            if UsuarioDAO.crear_usuario(usuario):
                print("OK - Usuario agregado correctamente")
            else:
                print("ERROR - No se pudo agregar el usuario")
        except Exception as error:
            print(f"ERROR - {error}")

    @staticmethod
    def actualizar_usuario():
        # Pide el ID y los nuevos datos del usuario
        print("\n--- ACTUALIZAR USUARIO ---")
        try:
            id_usuario = input("Ingresa el ID del usuario a actualizar: ")
            
            # Verifica que el usuario existe
            usuario = UsuarioDAO.obtener_usuario(int(id_usuario))
            if not usuario:
                print("ERROR - Usuario no encontrado")
                return
            
            nombre = input("Ingresa el nuevo nombre (o presiona Enter para mantener el actual): ")
            if not nombre:
                nombre = usuario.get_usuario_nombre()
            
            password = input("Ingresa la nueva contraseña (o presiona Enter para mantener la actual): ")
            if not password:
                password = usuario.get_password()
            
            usuario.set_usuario_nombre(nombre)
            usuario.set_password(password)
            
            if UsuarioDAO.actualizar_usuario(usuario):
                print("OK - Usuario actualizado correctamente")
            else:
                print("ERROR - No se pudo actualizar el usuario")
        except ValueError:
            print("ERROR - El ID debe ser un número")
        except Exception as error:
            print(f"ERROR - {error}")

    @staticmethod
    def eliminar_usuario():
        # Pide el ID y elimina el usuario
        print("\n--- ELIMINAR USUARIO ---")
        try:
            id_usuario = input("Ingresa el ID del usuario a eliminar: ")
            
            # Verifica que el usuario existe
            usuario = UsuarioDAO.obtener_usuario(int(id_usuario))
            if not usuario:
                print("ERROR - Usuario no encontrado")
                return
            
            confirmacion = input(f"Estas seguro que quieres eliminar a {usuario.get_usuario_nombre()}? (s/n): ")
            if confirmacion.lower() == 's':
                if UsuarioDAO.eliminar_usuario(int(id_usuario)):
                    print("OK - Usuario eliminado correctamente")
                else:
                    print("ERROR - No se pudo eliminar el usuario")
            else:
                print("Operación cancelada")
        except ValueError:
            print("ERROR - El ID debe ser un número")
        except Exception as error:
            print(f"ERROR - {error}")

    @staticmethod
    def ejecutar():
        # Loop principal del menú
        while True:
            try:
                MenuAppUsuario.mostrar_menu()
                opcion = input("Ingresa una opción (1-5): ")
                
                if opcion == "1":
                    MenuAppUsuario.listar_usuarios()
                elif opcion == "2":
                    MenuAppUsuario.agregar_usuario()
                elif opcion == "3":
                    MenuAppUsuario.actualizar_usuario()
                elif opcion == "4":
                    MenuAppUsuario.eliminar_usuario()
                elif opcion == "5":
                    print("\nHasta luego!")
                    break
                else:
                    print("ERROR - Opción no válida. Ingresa un número entre 1 y 5")
            except Exception as error:
                print(f"ERROR - {error}")


# PRUEBAS / EJECUCIÓN
if __name__ == "__main__":
    print("\n" + "="*50)
    print("INICIANDO APLICACIÓN DE GESTIÓN DE USUARIOS")
    print("="*50)
    
    # Ejecuta el menú
    MenuAppUsuario.ejecutar()