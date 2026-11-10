CREATE TABLE tareas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) UNIQUE NOT NULL,
    descripcion TEXT
);

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
