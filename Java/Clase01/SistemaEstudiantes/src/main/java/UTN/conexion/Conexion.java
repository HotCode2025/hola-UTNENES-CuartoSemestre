package UTN.conexion;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

// Centraliza la conexión con la base de datos.
public class Conexion {
    public static java.sql.Connection getConnection(){
        java.sql.Connection conexion = null;
        //Vars para conectarnos a la db
        var baseDatos = "estudiantes";
        var url = "jdbc:mysql://localhost:3306/"+baseDatos;
        var usuario = System.getenv().getOrDefault("DB_USER", "root");
        var password = System.getenv("DB_PASSWORD");

        if (password == null) {
            System.out.println("Configura la variable de entorno DB_PASSWORD para conectar.");
            return null;
        }

        //Cargamos la clase del driver de mysql en memoria
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            // Abrimos la conexión usando los datos configurados.
            conexion = DriverManager.getConnection(url, usuario, password);
        }catch(ClassNotFoundException | SQLException e) {
            System.out.println("Ocurrió un error en la conexión." + e.getMessage());
            };
        return conexion;
    }
}
