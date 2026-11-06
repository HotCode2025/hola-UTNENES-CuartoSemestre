-- Datos iniciales de prueba para cargar manualmente desde pgAdmin.
-- Requiere haber ejecutado schema.sql en la base seleccionada.
-- Es seguro volver a ejecutarlo: no reemplaza registros existentes.

BEGIN;

INSERT INTO public.artesanos (nombre, foto_perfil, categoria, ubicacion, historia, suscripcion)
SELECT datos.nombre, datos.foto_perfil, datos.categoria, datos.ubicacion, datos.historia, datos.suscripcion
FROM (
  VALUES
    (
      'María Gómez',
      'maria.jpg',
      'Textiles',
      'Valle de Uco, Mendoza',
      'Tejedora artesanal. Mantiene vivas las técnicas del telar y trabaja con lana natural.',
      'Premium'
    ),
    (
      'Taller Barro Vivo',
      'barro-vivo.jpg',
      'Cerámica',
      'Tupungato, Mendoza',
      'Taller familiar que modela piezas de cerámica con arcillas de la región.',
      'Básica'
    ),
    (
      'Raúl Quiroga',
      'raul-quiroga.jpg',
      'Madera',
      'San Rafael, Mendoza',
      'Artesano en madera. Talla utensilios y objetos con maderas de la zona.',
      'Básica'
    ),
    (
      'Taller Cuyano',
      'taller-cuyano.jpg',
      'Cuero',
      'Mendoza, Argentina',
      'Pequeño taller dedicado a la marroquinería y al trabajo artesanal del cuero.',
      'Básica'
    ),
    (
      'Huerta del Valle',
      'huerta-del-valle.jpg',
      'Alimentos',
      'Valle de Uco, Mendoza',
      'Emprendimiento familiar que elabora conservas y productos con frutos de la región.',
      'Básica'
    )
) AS datos(nombre, foto_perfil, categoria, ubicacion, historia, suscripcion)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.artesanos existentes
  WHERE existentes.nombre = datos.nombre
);

INSERT INTO public.productos (
  nombre,
  descripcion,
  precio,
  stock,
  categoria,
  imagen,
  destacado,
  artesano_id
)
SELECT
  datos.nombre,
  datos.descripcion,
  datos.precio,
  datos.stock,
  datos.categoria,
  datos.imagen,
  datos.destacado,
  artesano.id
FROM (
  VALUES
    (
      'Manta Andina',
      'Manta artesanal tejida a mano con lana de oveja.',
      25000.00,
      10,
      'Textiles',
      'manta-andina.jpg',
      TRUE,
      'María Gómez'
    ),
    (
      'Bufanda Patagónica',
      'Bufanda de lana teñida con tintes naturales.',
      12000.00,
      15,
      'Textiles',
      'bufanda.jpg',
      FALSE,
      'María Gómez'
    ),
    (
      'Gorro Artesanal',
      'Gorro tejido a dos agujas, ideal para el invierno.',
      8500.00,
      0,
      'Textiles',
      'gorro.jpg',
      FALSE,
      'María Gómez'
    ),
    (
      'Jarrón de Barro Cocido',
      'Jarrón modelado a mano y cocido en horno de leña.',
      18000.00,
      5,
      'Cerámica',
      'jarron.jpg',
      TRUE,
      'Taller Barro Vivo'
    ),
    (
      'Set de Mates de Cerámica',
      'Dos mates esmaltados con diseños pintados a mano.',
      9500.00,
      20,
      'Cerámica',
      'mates.jpg',
      FALSE,
      'Taller Barro Vivo'
    ),
    (
      'Tabla de Algarrobo',
      'Tabla para picadas tallada en madera de algarrobo.',
      15000.00,
      8,
      'Madera',
      'tabla.jpg',
      TRUE,
      'Raúl Quiroga'
    ),
    (
      'Cuchara de Madera Tallada',
      'Cuchara de cocina tallada en una sola pieza.',
      4500.00,
      30,
      'Madera',
      'cuchara.jpg',
      FALSE,
      'Raúl Quiroga'
    ),
    (
      'Billetera de Cuero',
      'Billetera de cuero vacuno cosida a mano.',
      14000.00,
      12,
      'Cuero',
      'billetera.jpg',
      FALSE,
      'Taller Cuyano'
    ),
    (
      'Dulce de Membrillo Casero',
      'Frasco de 500 g elaborado con membrillos de la huerta.',
      3800.00,
      25,
      'Alimentos',
      'membrillo.jpg',
      FALSE,
      'Huerta del Valle'
    ),
    (
      'Miel de Monte',
      'Miel pura de flores silvestres, frasco de 1 kg.',
      7200.00,
      18,
      'Alimentos',
      'miel.jpg',
      TRUE,
      'Huerta del Valle'
    )
) AS datos(nombre, descripcion, precio, stock, categoria, imagen, destacado, nombre_artesano)
CROSS JOIN LATERAL (
  SELECT existente.id
  FROM public.artesanos existente
  WHERE existente.nombre = datos.nombre_artesano
  ORDER BY existente.id
  LIMIT 1
) AS artesano
WHERE NOT EXISTS (
  SELECT 1
  FROM public.productos existente
  WHERE existente.nombre = datos.nombre
    AND existente.artesano_id = artesano.id
);

COMMIT;
