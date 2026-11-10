
import pygame
import sys
import random
import os

from personaje import Personaje, Enemigo, Explosion
from constantes import SCREEN_WIDTH, SCREEN_HEIGHT, IMAGES_PATH, SOUNDS_PATH

def cargar_imagen(nombre, tamano=None):
    ruta = os.path.join(IMAGES_PATH, nombre)
    imagen = pygame.image.load(ruta).convert_alpha()

    if tamano:
        imagen = pygame.transform.scale(imagen, tamano)

    return imagen


def cargar_sonido(nombre):
    ruta = os.path.join(SOUNDS_PATH, nombre)

    try:
        return pygame.mixer.Sound(ruta)
    except (pygame.error, FileNotFoundError) as error:
        print(f"No se pudo cargar {nombre}: {error}")
        return None


def texto_centrado(screen, texto, fuente, color, y):
    superficie = fuente.render(texto, True, color)
    rect = superficie.get_rect(
        center=(SCREEN_WIDTH // 2, y)
    )
    screen.blit(superficie, rect)


def dibujar_boton(screen, texto, rect, mouse_pos, fuente):
    # Usa tonos pastel al pasar el cursor y los colores habituales en reposo.
    esta_seleccionado = rect.collidepoint(mouse_pos)
    color_borde = (186, 220, 255) if esta_seleccionado else VIOLETA
    color_fondo = (225, 218, 255) if esta_seleccionado else (10, 15, 42)
    color_detalle = (255, 220, 235) if esta_seleccionado else CELESTE
    color_texto = (38, 39, 76) if esta_seleccionado else BLANCO

    # La sombra separa visualmente el botón del fondo sin mover su zona de clic.
    sombra = rect.move(0, 6)
    pygame.draw.rect(
        screen, (2, 4, 16), sombra, border_radius=16
    )

    # El relleno y el contorno redondeados dan al botón su aspecto de panel futurista.
    pygame.draw.rect(screen, color_fondo, rect, border_radius=16)
    pygame.draw.rect(
        screen, color_borde, rect, 2, border_radius=16
    )

    # Una línea brillante en el lado izquierdo mantiene el estilo consistente en ambos menús.
    franja = pygame.Rect(rect.left + 9, rect.top + 12, 4, rect.height - 24)
    pygame.draw.rect(screen, color_detalle, franja, border_radius=2)

    # El pequeño indicador derecho refuerza la apariencia de interfaz de nave.
    indicador = pygame.Rect(rect.right - 20, rect.centery - 3, 6, 6)
    pygame.draw.ellipse(screen, color_detalle, indicador)

    # Centra el texto para conservar la misma alineación en todos los botones.
    etiqueta = fuente.render(texto, True, color_texto)
    screen.blit(etiqueta, etiqueta.get_rect(center=rect.center))


def dibujar_fondo_oscuro(screen):
    # Esta capa semitransparente ayuda a leer los textos sobre la imagen de fondo.
    capa = pygame.Surface(
        (SCREEN_WIDTH, SCREEN_HEIGHT),
        pygame.SRCALPHA
    )
    capa.fill((3, 5, 25, 165))
    screen.blit(capa, (0, 0))

def dibujar_icono_hamburguesa(screen, rect, abierto, mouse_pos):
    # El icono cambia de tres líneas a una X para indicar que el panel está abierto.
    esta_seleccionado = rect.collidepoint(mouse_pos)
    color_fondo = (225, 218, 255) if esta_seleccionado else (10, 15, 42)
    color_lineas = (38, 39, 76) if esta_seleccionado else BLANCO

    pygame.draw.rect(screen, color_fondo, rect, border_radius=12)
    pygame.draw.rect(screen, VIOLETA, rect, 2, border_radius=12)

    margen = 15
    izquierda = rect.left + margen
    derecha = rect.right - margen

    if abierto:
        pygame.draw.line(
            screen, color_lineas,
            (izquierda, rect.top + margen), (derecha, rect.bottom - margen), 4
        )
        pygame.draw.line(
            screen, color_lineas,
            (izquierda, rect.bottom - margen), (derecha, rect.top + margen), 4
        )
    else:
        for desplazamiento in (-10, 0, 10):
            y = rect.centery + desplazamiento
            pygame.draw.line(
                screen, color_lineas, (izquierda, y), (derecha, y), 4
            )


def menu_principal(screen, fondo, reloj):
    fuente_titulo = pygame.font.Font(None, 68)
    fuente_subtitulo = pygame.font.Font(None, 28)
    fuente_panel = pygame.font.Font(None, 40)
    fuente_seccion = pygame.font.Font(None, 24)
    fuente_boton = pygame.font.Font(None, 32)

    boton_menu = pygame.Rect(24, 24, 56, 56)
    ancho_panel = 360
    ancho_boton = ancho_panel - 60
    alto_boton = 56

    # Cada opción guarda su posición vertical dentro del panel y lo que devuelve.
    opciones = (
        ("NIVEL 1 - FACIL", "facil", 175),
        ("NIVEL 2 - MEDIO", "medio", 247),
        ("NIVEL 3 - DIFICIL", "dificil", 319),
        ("SALIR", None, SCREEN_HEIGHT - 110)
    )

    abierto = False
    apertura = 0.0

    while True:
        mouse_pos = pygame.mouse.get_pos()

        # El panel se desliza desde la izquierda según cuánto está abierto.
        panel_x = int(-ancho_panel + ancho_panel * apertura)
        panel = pygame.Rect(panel_x, 0, ancho_panel, SCREEN_HEIGHT)
        botones = [
            (
                pygame.Rect(panel_x + 30, y, ancho_boton, alto_boton),
                texto, valor
            )
            for texto, valor, y in opciones
        ]

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                return None

            if event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE:
                abierto = False

            if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
                if boton_menu.collidepoint(event.pos):
                    abierto = not abierto
                elif abierto:
                    for rect, texto, valor in botones:
                        if rect.collidepoint(event.pos):
                            return valor

                    # Un clic fuera del panel lo cierra, como en cualquier menú lateral.
                    if not panel.collidepoint(event.pos):
                        abierto = False

        objetivo = 1.0 if abierto else 0.0
        apertura += (objetivo - apertura) * 0.2
        if abs(objetivo - apertura) < 0.01:
            apertura = objetivo

        screen.blit(fondo, (0, 0))
        dibujar_fondo_oscuro(screen)

        texto_centrado(
            screen, "MICHI-INVADERS",
            fuente_titulo, CELESTE, SCREEN_HEIGHT // 3
        )

        texto_centrado(
            screen, "La galaxia necesita un michi-piloto",
            fuente_subtitulo, BLANCO, SCREEN_HEIGHT // 3 + 50
        )

        texto_centrado(
            screen, "Abre el menu para empezar",
            fuente_subtitulo, VIOLETA, SCREEN_HEIGHT // 3 + 100
        )

        if apertura > 0:
            # Oscurece el resto de la pantalla para que el panel quede en primer plano.
            capa = pygame.Surface(
                (SCREEN_WIDTH, SCREEN_HEIGHT), pygame.SRCALPHA
            )
            capa.fill((0, 0, 0, int(120 * apertura)))
            screen.blit(capa, (0, 0))

            pygame.draw.rect(screen, NEGRO, panel)
            pygame.draw.line(
                screen, VIOLETA, panel.topright, panel.bottomright, 3
            )

            titulo_panel = fuente_panel.render("MENU", True, CELESTE)
            screen.blit(
                titulo_panel,
                titulo_panel.get_rect(midleft=(panel_x + 100, boton_menu.centery))
            )

            seccion = fuente_seccion.render("JUGAR", True, VIOLETA)
            screen.blit(seccion, (panel_x + 32, 140))

            for rect, texto, valor in botones:
                dibujar_boton(
                    screen, texto, rect,
                    mouse_pos if abierto else (-1, -1), fuente_boton
                )

        dibujar_icono_hamburguesa(screen, boton_menu, abierto, mouse_pos)

        pygame.display.flip()
        reloj.tick(60)


BLANCO = (245, 248, 255)
CELESTE = (60, 200, 255)
VIOLETA = (145, 90, 255)
NEGRO = (5, 8, 25)
ROJO = (255, 65, 75)
VERDE = (40, 230, 130)


def dibujar_vidas(screen, vidas, icono_vida):
    # Cada nave pequeña representa una vida; desaparece una por cada choque.
    for indice in range(vidas):
        screen.blit(
            icono_vida,
            (20 + indice * (icono_vida.get_width() + 10), 16)
        )


def pantalla_game_over(
    screen, fondo, reloj, puntos, enemigos_matados, enemigos_escapados,
    nivel
):
    fuente_grande = pygame.font.Font(None, 62)
    fuente_puntos = pygame.font.Font(None, 48)
    fuente_pequena = pygame.font.Font(None, 32)
    fuente_boton = pygame.font.Font(None, 34)
    ancho_boton = 240
    alto_boton = 60
    espacio_entre_botones = 28
    ancho_total = ancho_boton * 3 + espacio_entre_botones * 2
    inicio_x = (SCREEN_WIDTH - ancho_total) // 2
    posicion_y = SCREEN_HEIGHT // 2 + 120

    # Las opciones finales se eligen solo con el mouse.
    botones = [
        (
            pygame.Rect(
                inicio_x + (ancho_boton + espacio_entre_botones) * indice,
                posicion_y, ancho_boton, alto_boton
            ),
            texto, opcion
        )
        for indice, (texto, opcion) in enumerate((
            ("REINICIAR", "reiniciar"),
            ("MENU", "menu"),
            ("SALIR", "salir")
        ))
    ]

    while True:
        mouse_pos = pygame.mouse.get_pos()
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                return "salir"
            elif event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
                for rect, texto, opcion in botones:
                    if rect.collidepoint(event.pos):
                        return opcion

        screen.blit(fondo, (0, 0))
        dibujar_fondo_oscuro(screen)

        texto_centrado(
            screen, "Los Aliens se llevaron todas las vacas.",
            fuente_grande, ROJO, SCREEN_HEIGHT // 2 - 130
        )

        # El nivel cuenta como completado si se superaron los primeros 250 puntos.
        resultado_nivel = "COMPLETADO" if nivel > 1 else "FALLIDO"

        texto_centrado(
            screen, f"PUNTUACION: {puntos}",
            fuente_puntos, CELESTE, SCREEN_HEIGHT // 2 - 55
        )

        texto_centrado(
            screen,
            f"Eliminados: {enemigos_matados}   |   Abducciones: {enemigos_escapados}   |   Nivel: {resultado_nivel}",
            fuente_pequena,
            BLANCO,
            SCREEN_HEIGHT // 2 + 5
        )

        for rect, texto, opcion in botones:
            dibujar_boton(screen, texto, rect, mouse_pos, fuente_boton)

        pygame.display.flip()
        reloj.tick(60)



def jugar_partida(
    screen, fondo, reloj, dificultad, sonido_laser, sonido_explosion,
    sonido_muerte
):
    # Usa la configuración escogida para determinar cuántos enemigos aparecen.
    dificultades = {
        "facil": (0.012, 0.002, 0.045),
        "medio": (0.020, 0.003, 0.080),
        "dificil": (0.035, 0.005, 0.120)
    }

    probabilidad_inicial, incremento, probabilidad_maxima = dificultades[dificultad]

    personaje = Personaje(
        SCREEN_WIDTH // 2,
        SCREEN_HEIGHT - 100
    )
    icono_vida = cargar_imagen("nave.png", (42, 42))

    enemigos = []
    explosiones = []

    puntos = 0
    enemigos_matados = 0
    enemigos_escapados = 0
    nivel = 1
    siguiente_nivel = 250

    running = True
    personaje_muerto = False

    ultimo_disparo = 0
    intervalo_disparo = 250

    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    running = False

        if not running:
            break

        
        keys = pygame.key.get_pressed()
        dx = 0
        dy = 0

        if keys[pygame.K_LEFT]:
            dx -= 5
        if keys[pygame.K_RIGHT]:
            dx += 5
        if keys[pygame.K_UP]:
            dy -= 5
        if keys[pygame.K_DOWN]:
            dy += 5

        personaje.mover(dx, dy)

        personaje.shape.clamp_ip(
            pygame.Rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)
        )

     
        tiempo_actual = pygame.time.get_ticks()

        if (
            keys[pygame.K_SPACE]
            and tiempo_actual - ultimo_disparo >= intervalo_disparo
        ):
            personaje.lanzar_laser()
            ultimo_disparo = tiempo_actual

            if sonido_laser:
                sonido_laser.play()

        
        for enemigo in enemigos[:]:
            enemigo.mover()

            if enemigo.rect.top > SCREEN_HEIGHT:
                enemigos.remove(enemigo)
                enemigos_escapados += 1
                continue

            if enemigo.rect.colliderect(personaje.shape):
                enemigos.remove(enemigo)
                explosiones.append(
                    Explosion(
                        enemigo.rect.centerx,
                        enemigo.rect.centery
                    )
                )

                if not personaje.recibir_dano():
                    personaje_muerto = True
                    if sonido_muerte:
                        sonido_muerte.play()
                    running = False
                    break

                if sonido_explosion:
                    sonido_explosion.play()

                continue

            for laser in personaje.lasers[:]:
                if enemigo.rect.colliderect(laser.rect):
                    explosiones.append(
                        Explosion(
                            enemigo.rect.centerx,
                            enemigo.rect.centery
                        )
                    )

                    if enemigo in enemigos:
                        enemigos.remove(enemigo)
                        enemigos_matados += 1

                    if laser in personaje.lasers:
                        personaje.lasers.remove(laser)

                    puntos += 10

                    if sonido_explosion:
                        sonido_explosion.play()

                    break

        if not running:
            break

        # Aumenta gradualmente la posibilidad de que aparezca un enemigo al subir de nivel.
        probabilidad = min(
            probabilidad_inicial + (nivel - 1) * incremento,
            probabilidad_maxima
        )

        if random.random() < probabilidad:
            x = random.randint(0, SCREEN_WIDTH - 80)
            enemigos.append(Enemigo(x, 0))

        # Conserva solo los láseres que todavía se ven en la pantalla.
        personaje.lasers = [
            laser for laser in personaje.lasers
            if laser.rect.bottom > 0
        ]

        # Avanza cada animación y retira las explosiones que ya terminaron.
        explosiones = [
            explosion for explosion in explosiones
            if explosion.actualizar()
        ]

        # Sube un nivel por cada umbral de puntos alcanzado.
        while puntos >= siguiente_nivel:
            nivel += 1
            siguiente_nivel += 250

        screen.blit(fondo, (0, 0))

        personaje.dibujar(screen)

        for enemigo in enemigos:
            enemigo.dibujar(screen)

        for explosion in explosiones:
            explosion.dibujar(screen)

        # Durante la partida solo se muestran las vidas; el puntaje se ve al final.
        dibujar_vidas(screen, personaje.vidas, icono_vida)

        pygame.display.flip()
        reloj.tick(60)

    return (
        personaje_muerto,
        puntos,
        enemigos_matados,
        enemigos_escapados,
        nivel
    )


def main():
    pygame.init()

    try:
        pygame.mixer.init()
    except pygame.error as error:
        print("El audio no está disponible:", error)

    screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
    pygame.display.set_caption("MICHI-INVADERS")
    reloj = pygame.time.Clock()

    try:
        fondo = cargar_imagen(
            "fondo.jfif", (SCREEN_WIDTH, SCREEN_HEIGHT)
        )
        fondo_juego = cargar_imagen(
            "fondomgue.jpeg", (SCREEN_WIDTH, SCREEN_HEIGHT)
        )
        fondo_game_over = cargar_imagen(
            "Fondo Malargue.jpg", (SCREEN_WIDTH, SCREEN_HEIGHT)
        )

        try:
            pygame.display.set_icon(cargar_imagen("001.jfif"))
        except (pygame.error, FileNotFoundError) as error:
            print("No se pudo cargar el icono:", error)
    except (pygame.error, FileNotFoundError) as error:
        print("Error al cargar los fondos:", error)
        pygame.quit()
        return

    sonido_laser = cargar_sonido("disparo.mp3")
    sonido_explosion = cargar_sonido("explosion.mp3")
    sonido_muerte = cargar_sonido("muerte.mp3")

    if sonido_laser:
        sonido_laser.set_volume(0.20)

    if sonido_explosion:
        sonido_explosion.set_volume(0.30)

    if sonido_muerte:
        sonido_muerte.set_volume(0.45)

    ruta_musica = os.path.join(SOUNDS_PATH, "fondo.mp3")
    try:
        pygame.mixer.music.load(ruta_musica)
        pygame.mixer.music.set_volume(0.20)
        pygame.mixer.music.play(-1)
    except (pygame.error, FileNotFoundError) as error:
        print("No se pudo cargar la música:", error)

    # El menú hamburguesa devuelve la dificultad elegida, o None para salir.
    dificultad = menu_principal(screen, fondo, reloj)

    while dificultad is not None:
        (
            personaje_muerto,
            puntos,
            enemigos_matados,
            enemigos_escapados,
            nivel
        ) = jugar_partida(
            screen, fondo_juego, reloj, dificultad,
            sonido_laser, sonido_explosion, sonido_muerte
        )

        if not personaje_muerto:
            break

        opcion = pantalla_game_over(
            screen, fondo_game_over, reloj, puntos,
            enemigos_matados, enemigos_escapados, nivel
        )

        # Reiniciar repite la misma dificultad; menú vuelve a elegir nivel.
        if opcion == "menu":
            dificultad = menu_principal(screen, fondo, reloj)
        elif opcion == "salir":
            break

    pygame.quit()


if __name__ == "__main__":
    main()
