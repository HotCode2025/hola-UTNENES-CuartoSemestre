# Clase 05 – Sistema de Estudiantes con Spring Boot (Parte 4)

Aplicación de **consola** con Spring Boot que implementa un CRUD completo de estudiantes a través de un menú.

## Arquitectura

```
@SpringBootApplication (presentación: menú de consola)
        │  @Autowired
        ▼
EstudianteServicio (@Service)  implements IEstudianteServicio
        │  @Autowired
        ▼
EstudianteRepositorio  extends JpaRepository<Estudiantes2022, Integer>
        │
        ▼
Estudiantes2022 (@Entity, Lombok)  ──►  Base de datos
```

## Menú

```
******* Sistema de Estudiantes *******
1. Listar Estudiantes      → findAll()
2. Buscar Estudiante       → findById(id).orElse(null)
3. Agregar Estudiante      → save()  (INSERT, sin id)
4. Modificar Estudiante    → save()  (UPDATE, con id)
5. Eliminar Estudiante     → delete()
6. Salir
```

## Base de datos

El video usa **MySQL** (`jdbc:mysql://localhost:3306/estudiantes`, tabla `estudiantes2022`).
Como MySQL no estaba instalado, el proyecto usa **H2 en archivo** (`./data/estudiantes`), que no requiere instalación y conserva los datos entre ejecuciones. El código Java es idéntico; para volver a MySQL:

1. En `pom.xml`: reemplazar la dependencia `h2` por `mysql-connector-j` (está comentada).
2. En `application.properties`: comentar el bloque H2 y descomentar el de MySQL.

`data.sql` carga dos estudiantes de ejemplo (Juan Juarez y Carla Roldan) si la tabla está vacía.

## Cómo ejecutarlo

Abrir la carpeta en **IntelliJ IDEA** → ejecutar `EstudiantesApplication` (▶).
O por consola con Maven: `mvn spring-boot:run`

Requiere **Java 21**.

## Videos de la clase

| Video | Tema | Lo que se hizo |
|---|---|---|
| 1 | 5.1 Orientación hacia la buena configuración | Repaso: BD, entidad `Estudiantes2022`, `application.properties`, interfaz de servicio, repositorio |
| 2 | 5.2 Aplicación en las teorías | `EstudianteServicio` (`@Service`, `@Autowired`), clase principal con `CommandLineRunner` y `Logger` |
| 3 | 5.3 Teoría y menú | Arquitectura con Spring (`@Component`, capas). `run()` con `while`, `mostrarMenu()` con text block |
| 4 | Parte 1 | `ejecutarOpciones()` + `case 1` listarEstudiantes |
| 5 | Parte 2 | `case 2` buscarEstudiantePorId y `case 3` agregarEstudiante |
| 6 | Parte 3 | `case 4` modificarEstudiante |
| 7 | Parte 4 | `case 5` eliminarEstudiante, `case 6` salir y `default` |
| 8 | 5.5 Pruebas | Ejecución y prueba de todas las opciones |

## Extra: captura de excepción (desafío de la clase)

Si el usuario escribe una **letra** donde se espera un número, `Integer.parseInt` lanza `NumberFormatException`. Se captura en el ciclo del menú:

```java
try {
    salir = ejecutarOpciones(consola);
} catch (NumberFormatException e) {
    logger.info(nl + "ERROR: debe ingresar un número, no una letra. Intente de nuevo." + nl);
}
```

Así el programa no se cae y vuelve a mostrar el menú.
