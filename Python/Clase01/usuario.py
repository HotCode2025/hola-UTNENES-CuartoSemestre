"""
Clase Usuario - Modelo de datos para un usuario
"""


class Usuario:
    """
    Representa un usuario del sistema.
    Contiene los datos básicos: id, nombre y contraseña.
    """

    def __init__(self, id_usuario=None, usuario_nombre=None, password=None):
        # Constructor que inicializa los atributos del usuario
        self._id_usuario = id_usuario
        self._usuario_nombre = usuario_nombre
        self._password = password

    # Getter y setter para id_usuario
    def get_id_usuario(self):
        # Retorna el ID del usuario
        return self._id_usuario

    def set_id_usuario(self, id_usuario):
        # Establece el ID del usuario
        self._id_usuario = id_usuario

    # Getter y setter para usuario_nombre
    def get_usuario_nombre(self):
        # Retorna el nombre del usuario
        return self._usuario_nombre

    def set_usuario_nombre(self, usuario_nombre):
        # Establece el nombre del usuario
        self._usuario_nombre = usuario_nombre

    # Getter y setter para password
    def get_password(self):
        # Retorna la contraseña del usuario
        return self._password

    def set_password(self, password):
        # Establece la contraseña del usuario
        self._password = password

    def __str__(self):
        # Retorna una representación en texto del usuario
        return f"Usuario(id={self._id_usuario}, nombre={self._usuario_nombre}, password={self._password})"


# PRUEBAS
if __name__ == "__main__":
    print("\n=== PRUEBAS DE LA CLASE USUARIO ===\n")

    # Prueba 1: Crear usuario vacío
    print("[PRUEBA 1] Creando usuario vacío...")
    usuario1 = Usuario()
    print(f"OK - Usuario creado: {usuario1}\n")

    # Prueba 2: Crear usuario con parámetros
    print("[PRUEBA 2] Creando usuario con parámetros...")
    usuario2 = Usuario(1, "admin", "123456")
    print(f"OK - Usuario creado: {usuario2}\n")

    # Prueba 3: Usar getters
    print("[PRUEBA 3] Obteniendo datos con getters...")
    print(f"ID: {usuario2.get_id_usuario()}")
    print(f"Nombre: {usuario2.get_usuario_nombre()}")
    print(f"Password: {usuario2.get_password()}\n")

    # Prueba 4: Usar setters
    print("[PRUEBA 4] Modificando datos con setters...")
    usuario1.set_id_usuario(2)
    usuario1.set_usuario_nombre("mago_de_oz")
    usuario1.set_password("contraseña123")
    print(f"OK - Usuario modificado: {usuario1}\n")

    # Prueba 5: Verificar cambios
    print("[PRUEBA 5] Verificando que los cambios se guardaron...")
    print(f"ID: {usuario1.get_id_usuario()}")
    print(f"Nombre: {usuario1.get_usuario_nombre()}")
    print(f"Password: {usuario1.get_password()}\n")

    print("=== TODAS LAS PRUEBAS COMPLETADAS ===\n")