package utn.estudiantes.servicio;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import utn.estudiantes.modelo.Estudiante;
import utn.estudiantes.repositorio.EstudianteRepositorio;
import java.util.List;

@Service
public class EstudianteServicio implements IEstudianteServicio {

    @Autowired
    private EstudianteRepositorio estudianteRepositorio;

    @Override
    public List<Estudiante> listarEstudiantes() {
        return estudianteRepositorio.findAll();
    }

    @Override
    public Estudiante buscarEstudiantePorId(Integer idEstudiante) {
        // Retorna el estudiante si lo encuentra, o null si no existe
        return estudianteRepositorio.findById(idEstudiante).orElse(null);
    }

    @Override
    public void guardarEstudiante(Estudiante estudiante) {
        // Si el id viene nulo, hace un INSERT. Si el id ya existe, hace un UPDATE.
        estudianteRepositorio.save(estudiante);
    }

    @Override
    public void eliminarEstudiante(Estudiante estudiante) {
        estudianteRepositorio.delete(estudiante);
    }
}
