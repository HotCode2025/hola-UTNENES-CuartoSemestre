package utn.tienda_libros.vista;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import utn.tienda_libros.modelo.Libro;
import utn.tienda_libros.servicio.ILibroServicio;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;

@Component
public class LibroForm extends JFrame {

    @Autowired
    private ILibroServicio libroServicio;

    private JTextField txtNombre;
    private JTextField txtAutor;
    private JTextField txtPrecio;
    private JTextField txtExistencias;

    private JButton btnAgregar;
    private JButton btnLimpiar;

    private JTable tablaLibros;
    private DefaultTableModel modeloTabla;

    public LibroForm() {
        iniciarComponentes();
    }

    private void iniciarComponentes() {
        setTitle("Tienda de Libros");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(800, 500);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout(10, 10));

        JLabel lblTitulo = new JLabel("Tienda de Libros", SwingConstants.CENTER);
        lblTitulo.setFont(new Font("Arial", Font.BOLD, 22));
        add(lblTitulo, BorderLayout.NORTH);

        JPanel panelCentral = new JPanel(new GridLayout(1, 2, 10, 10));

        JPanel panelForm = new JPanel(new GridLayout(4, 2, 5, 10));
        panelForm.setBorder(BorderFactory.createTitledBorder("Datos del Libro"));


        txtNombre = new JTextField();
        txtAutor = new JTextField();
        txtPrecio = new JTextField();
        txtExistencias = new JTextField();

        panelForm.add(new JLabel("Libro:"));
        panelForm.add(txtNombre);
        panelForm.add(new JLabel("Autor:"));
        panelForm.add(txtAutor);
        panelForm.add(new JLabel("Precio:"));
        panelForm.add(txtPrecio);
        panelForm.add(new JLabel("Existencias:"));
        panelForm.add(txtExistencias);

        panelCentral.add(panelForm);

        String[] columnas = {"Id", "Libro", "Autor", "Precio", "Existencias"};
        modeloTabla = new DefaultTableModel(null, columnas) {
            @Override
            public boolean isCellEditable(int row, int col) { return false; }
        };

        tablaLibros = new JTable(modeloTabla);
        tablaLibros.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);

        panelCentral.add(new JScrollPane(tablaLibros));
        add(panelCentral, BorderLayout.CENTER);

        JPanel panelBotones = new JPanel(new FlowLayout());
        btnAgregar = new JButton("Agregar");
        btnLimpiar = new JButton("Limpiar");

        btnAgregar.addActionListener(e -> agregarLibro());
        btnLimpiar.addActionListener(e -> limpiarCampos());

        panelBotones.add(btnAgregar);
        panelBotones.add(btnLimpiar);

        add(panelBotones, BorderLayout.SOUTH);
    }

    public void listarLibros() {
        modeloTabla.setRowCount(0);
        var libros = libroServicio.listarLibros();
        libros.forEach(libro -> {
            Object[] fila = {
                libro.getIdLibro(),
                libro.getNombreLibro(),
                libro.getAutor(),
                libro.getPrecio(),
                libro.getExistencias()
            };
            modeloTabla.addRow(fila);
        });
    }

    private void agregarLibro() {
        if (txtNombre.getText().isBlank() || txtPrecio.getText().isBlank()) {
            JOptionPane.showMessageDialog(this, "Completa los campos obligatorios.");
            return;
        }
        var libro = new Libro();
        libro.setNombreLibro(txtNombre.getText());
        libro.setAutor(txtAutor.getText());
        libro.setPrecio(Double.parseDouble(txtPrecio.getText()));
        libro.setExistencias(Integer.parseInt(txtExistencias.getText()));

        libroServicio.guardarLibro(libro);
        limpiarCampos();
        listarLibros();
    }

    private void limpiarCampos() {
        txtNombre.setText("");
        txtAutor.setText("");
        txtPrecio.setText("");
        txtExistencias.setText("");
        tablaLibros.clearSelection();
    }
}