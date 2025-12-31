La lógica del Collector (Coleccionista - 4B) es una de las más singulares, ya que cambia el objetivo del juego: no puntúa por el valor de las bazas en sí, sino por la creación de "sets" o combinaciones de póker con las cartas físicas que logra arrebatar de la mesa.
Aquí tienes el protocolo detallado para su implementación en la IA:
1. Restricciones y Atributos Especiales
• Prioridad: 4B (baja-media).
• Bloqueo de Coronas: El sistema debe impedir que este personaje obtenga Coronas Doradas o Coronas Negras, sin importar cuántas bazas gane o pierda.
• Límite de Rarezas: Solo puede usar 1 carta Rare por cada combinación o combo que presente.
2. Flujo de la Baza (Mecánicas de Captura)
El Coleccionista tiene dos formas de obtener cartas para su "vitrina" personal:
• Reserva (Collector's Reservation): En su turno, después de jugar su carta, la IA debe permitirle seleccionar una carta de las que ya están sobre la mesa para "reservarla".
    ◦ Al final de la baza, si el Coleccionista pierde, se lleva esa carta específica a su pila de colección.
• Victoria de Baza (Collection): Si el Coleccionista gana la baza, el sistema debe entregarle todas las cartas jugadas en ese turno (incluyendo la suya) para su colección.
3. Lógica de Puntuación (Sets y Combos)
Al final de la ronda (tras las 5 bazas), la IA debe analizar la pila de cartas recolectadas y permitir al jugador formar hasta 3 combos para sumar puntos:
• Flush de 3 (3 del mismo color): +20 pts.
• Straight de 3 (3 números seguidos): +30 pts.
• 3 of a Kind (3 del mismo número): +40 pts.
• Straight Flush de 3 (3 seguidos del mismo color): +50 pts.
• 4 of a Kind (4 del mismo número): +80 pts.
• Straight Flush de 5 (5 seguidos del mismo color): +100 pts.
• Penalización por "Basura": Por cada 2 cartas no utilizadas en combos, la IA debe restar -10 puntos.
4. Condición de Victoria Instantánea
El Coleccionista posee una condición de victoria de Prioridad 1 que la IA debe verificar al cerrar la ronda:
• La Gran Colección: Si el jugador logra formar un Straight Flush de 9 cartas (9 cartas del mismo color con números consecutivos), gana la partida inmediatamente.
Resumen de Implementación para el Desarrollador (IA)
1. Setup: Inicializar el array CollectedCards y habilitar el ReserveToken.
2. Durante el Turno: Ejecutar PlayCard() -> SelectOneCardFromTable(ReserveSlot).
3. Resolución de Baza:
    ◦ If Winner == Collector -> CollectedCards.Add(AllCardsOnTable).
    ◦ Else -> CollectedCards.Add(ReserveSlot).
4. Fin de Ronda:
    ◦ Algoritmo de optimización: Buscar la mejor combinación de hasta 3 sets.
    ◦ TotalScore = Sum(ComboPoints) - (UnusedCards / 2 * 10).
    ◦ Check: ¿Hay un Straight Flush de 9? -> TriggerVictory().
Analogía para la IA: El Coleccionista es como un comprador en una subasta: no le importa ganar la subasta entera (la baza), a veces solo quiere una pieza específica (la reserva). Al final del día, abre sus cajas y mira si las piezas encajan; si tiene muchas piezas sueltas que no combinan, ha desperdiciado su dinero (penalización), pero si completa una colección perfecta, se convierte en el dueño de la galería (gana la partida).