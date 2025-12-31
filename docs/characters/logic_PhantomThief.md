Para implementar correctamente al Phantom Thief (Ladrón Fantasma - 5C), la IA debe gestionar una de las mecánicas más sociales y complejas del juego: la asociación y el robo de recursos al final de la ronda. Su prioridad es 5C, la más baja de todo el juego, lo que significa que siempre pierde los desempates por puntos o coronas.
Aquí tienes la configuración lógica detallada para su implementación:
1. Configuración Inicial (Setup)
El Ladrón Fantasma basa su estrategia en marcar a los demás jugadores:
• Reparto de Cartas de Notificación: La IA debe permitir al Ladrón entregar una Carta de Aviso (Notice) a cada oponente que desee robar, y una Carta de Invitación (Invitation) para designar a un Socio (Partner).
• Posicionamiento del Chip: El jugador debe colocar el Chip de Fantasma en la hoja de "Sol y Luna" en la opción "0" o "±1". Esto determina la diferencia de victorias necesaria entre el Ladrón y su víctima para que el robo sea exitoso.
2. Mecánica de Turno: El Arte del Robo (Art of Theft)
Durante su turno, la IA debe habilitar una ventana de interacción con el socio:
• Intercambio de Cartas: El Ladrón puede proponer intercambiar una carta de su mano por una de su socio.
    ◦ Proceso: El Ladrón pone una carta boca abajo; el socio le da una de su mano; el Ladrón le entrega la carta que puso boca abajo.
    ◦ Rechazo: El socio puede negarse. Si lo hace, la carta del Ladrón se descarta y el Ladrón roba una nueva del mazo.
    ◦ Restricción: No se puede intercambiar la carta del Berserker (5A).
3. Lógica tras una Victoria (Trick Victory)
Si el Ladrón gana una baza, la IA debe permitirle ajustar su plan:
• Reseleccionar: Puede mover el Chip de Fantasma entre las opciones "0" y "±1".
• La Traición: En lugar de moverlo, puede voltear el chip (lado del lobo). Al hacer esto, el objetivo del robo deja de ser los oponentes con "Avisos" y pasa a ser únicamente su propio socio.
4. Conteo Final y Condiciones de Victoria
Al terminar las 5 bazas, la IA ejecuta el robo basándose en la diferencia de victorias:
• Éxito del Robo: Si la diferencia de bazas ganadas entre el Ladrón y su víctima coincide con el valor del chip (0 o ±1), el Ladrón roba a su elección: una Corona Dorada, una Corona Negra o 30 puntos.
    ◦ Nota: Si el Ladrón roba la segunda corona de un rival, evita que este gane la partida por prioridad 2.
• Puntuación y Coronas:
    ◦ 1 victoria: El Ladrón es elegible para ganar una Corona Negra (sustituyendo la regla estándar de 0 victorias) pero pierde -20 puntos.
    ◦ 2 victorias: El Ladrón no gana puntos, pero otorga +50 puntos a su socio.
• Victoria de Prioridad 1: Si el Ladrón gana las 5 bazas de la ronda, gana la partida inmediatamente.
Resumen de Lógica para el Desarrollador (IA)
1. Setup: Assign(Notice/Invitation) -> SetChipValue(0, ±1).
2. Durante el Turno: RequestExchange(Partner) -> if Denied { DiscardAndDraw() }.
3. Al ganar baza: AllowUpdateChipValue() OR ToggleBetrayalMode().
4. Fin de Ronda: CheckDifference(ThiefWins, TargetWins) -> If Match(ChipValue) { StealResource() }.
Analogía para la IA: El Ladrón Fantasma es como un mago que trabaja con un asistente. Durante el espectáculo (la ronda), puede intercambiar accesorios con él. Al final de la función, si el truco sale bien (la diferencia de victorias coincide con su predicción), le quita el reloj de oro a alguien del público o, si decide traicionar a su asistente, le roba la cartera a él mismo en lugar de al público.