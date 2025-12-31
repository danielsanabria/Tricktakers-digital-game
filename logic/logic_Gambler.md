Para implementar correctamente al Gambler (Tahúr - 2A) en la versión digital, la IA debe gestionar un flujo de juego que prioriza la predicción y el riesgo calculado. Su prioridad 2A es la segunda más alta del juego, lo que le da una gran ventaja competitiva, especialmente para asegurar bazas o reclamar coronas en caso de empate.
Aquí tienes la configuración lógica detallada para la IA:
1. Configuración Inicial (Setup)
Esta fase es crítica y ocurre antes de que comience la primera baza de la ronda:
• Bonificación de Entrada: El sistema debe otorgar inmediatamente +20 puntos al jugador al seleccionar este personaje.
• Filtrado de Mano (Mecánica de Descarte): La IA debe permitir al jugador descartar cualquier número de cartas de su mano y robar la misma cantidad del mazo. Esta acción puede realizarse hasta dos veces.
• La Apuesta de Bazas (Bid): El jugador debe declarar exactamente cuántas bazas (0 a 5) cree que ganará en la ronda.
• Apuesta de Puntos (Bet):
    ◦ El sistema debe permitir al jugador apostar puntos de su reserva actual a que cumplirá su predicción.
    ◦ Límite estándar: Hasta 50 puntos.
    ◦ Ronda 3 (The Final Battle): El límite aumenta hasta 100 puntos.
2. Condiciones de Victoria Instantánea
La IA debe monitorizar dos condiciones que terminan la partida inmediatamente si el Tahúr las cumple:
1. Predicción Perfecta de 4: Si el jugador apuesta que ganará exactamente 4 bazas y lo logra, gana la partida automáticamente.
2. Maestría de Bazas: Si el jugador logra ganar las 5 bazas de la ronda (independientemente de su apuesta inicial), gana la partida automáticamente.
3. Lógica de Puntuación al Final de la Ronda
Si no se cumplen las condiciones de victoria instantánea, la IA calcula los puntos basándose en si la apuesta (bid) fue exitosa (Bid Made) o fallida (Bid Missed):
Si el número de bazas ganadas coincide con la apuesta:
• 0 bazas apostadas y ganadas: +30 pts.
• 1 baza apostada y ganada: +60 pts.
• 2 bazas apostadas y ganadas: +90 pts.
• 3 bazas apostadas y ganadas: +150 pts.
• Ajuste de apuesta: Sumar los puntos apostados en el Setup (+BET pts).
Si el número de bazas ganadas NO coincide con la apuesta:
• Puntos de tabla: 0 pts (no recibe bonificación por bazas).
• Penalización de apuesta: Restar los puntos apostados en el Setup (-BET pts).
Resumen de Lógica para el Desarrollador (IA)
La IA debe tratar al Tahúr como un "optimizador de probabilidades":
1. Fase Setup: Ejecutar AddPoints(20) -> Repeat(2) { DiscardAndDraw() } -> Input(BidWins, BetPoints).
2. Durante las bazas: Contador de CurrentWins.
3. Resolución:
    ◦ if CurrentWins == 5 OR (BidWins == 4 AND CurrentWins == 4) then TriggerVictory().
    ◦ if CurrentWins == BidWins then Score = Table[BidWins] + BetPoints.
    ◦ else Score = -BetPoints.
Analogía para entender al personaje: El Tahúr es como un arquero que hace su propia diana: primero ajusta su equipo (descartes), luego anuncia dónde va a dar la flecha (apuesta de bazas) y pone dinero sobre la mesa. Si acierta exactamente donde dijo, el premio es enorme; si se queda corto o se pasa por una sola baza, pierde su dinero.