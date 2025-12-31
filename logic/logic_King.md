Protocolo y Configuración del Personaje Rey 1A
Para configurar correctamente al personaje King (Rey - 1A) en la versión digital, la IA debe integrar reglas que afectan tanto la composición de la mano como el flujo de selección de personajes entre rondas y el cálculo de puntuación final.
Aquí tienes las configuraciones detalladas divididas por fases del juego:
1. Atributos Base del Personaje
• Nombre: King (Rey) [1].
• ID/Prioridad: 1A (Es la prioridad más alta de todo el juego) [2, 3].
• Condición de Victoria Instantánea: Si gana las 5 bazas (5 wins) en una sola ronda, gana la partida automáticamente [1, 4].
2. Configuración Inicial (Setup)
• Modificación de Mano: Al inicio de la ronda, tras repartir las 5 cartas iniciales, el sistema debe añadir la carta Rara del Rey (King Rare card) a su mano [1, 5].
• Compensación: Para mantener el límite de mano, el jugador debe elegir y descartar cualquier otra carta de su elección [1, 6].
3. Lógica de Puntuación (Scoring)
La IA debe aplicar la siguiente tabla de puntos al finalizar las 5 bazas (si no se cumplió la victoria instantánea):
• 0 bazas: +0 pts [1, 4].
• 1 baza: +20 pts [1, 4].
• 2 bazas: +50 pts [1, 4].
• 3 bazas: +80 pts [1, 4].
• 4 bazas: +120 pts [1, 4].
4. Reglas Especiales por Ronda
• Ronda 3 (The Final Battle): La IA debe aplicar un multiplicador de x2 a todos los puntos ganados en esta ronda [1, 4].
    ◦ Ejemplo de cálculo: Si gana 3 bazas, el sistema otorga 160 pts (+80 pts base x 2) [1, 5].
• Orden de Selección (Next Round): El jugador que haya controlado al Rey en la ronda actual tiene el privilegio de elegir personaje de primero en la siguiente ronda [1, 7].
• Restricción de Repetición: El sistema debe bloquear la selección del Rey (1A) para este jugador específico en la ronda inmediatamente posterior a haberlo usado [1, 5, 8].
5. Resolución de Conflictos y Prioridad
• Desempates de Puntos: En caso de empate en puntos de victoria al final del juego, el personaje con mayor prioridad gana. El Rey (1A) siempre gana cualquier desempate por ser el 1A en la jerarquía [2, 3].
• Jerarquía de Selección: Si hay empates en puntos para determinar el orden de selección de personajes en las rondas 2 y 3, el jugador que tuvo al personaje de mayor prioridad en la ronda anterior (el Rey) elige primero [3].
Resumen de Lógica para la IA
Para que la IA no cometa errores, debe tratar al Rey como un "acelerador de partida":
1. En el Setup: Forzar la entrada de la carta Rara.
2. En la Selección: Actuar como un puntero que redefine quién va primero en el siguiente turno de selección, invalidando la opción 1A para ese usuario.
3. En la Ronda 3: Activar un interruptor global de MultiplicadorRey = 2 para el cálculo de su puntaje final de ronda.
**Analogía para el desarrollador:**El Rey es como el "jugador con el balón" en un campo de juego: tiene la prioridad más alta para decidir la siguiente jugada (selección), pero las reglas le prohíben quedarse con el balón de forma infinita (restricción de repetición) para mantener el equilibrio del juego.