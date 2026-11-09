-- Estudiantes de ejemplo: solo se insertan si la tabla esta vacia
INSERT INTO estudiantes2022 (nombre, apellido, telefono, email)
SELECT nombre, apellido, telefono, email FROM (VALUES
    ('Juan',  'Juarez', '7766554433', 'juan@mail.com'),
    ('Carla', 'Roldan', '2614561235', 'roldanc@mail.com')
) AS v(nombre, apellido, telefono, email)
WHERE NOT EXISTS (SELECT 1 FROM estudiantes2022);
