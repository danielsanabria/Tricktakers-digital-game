Para implementar correctamente al personaje Hermit (Ermitaño - 4A) en la versión digital, la IA debe gestionar una mecánica de filtrado de mano y una alteración específica en la jerarquía de cartas que genera bonificaciones inmediatas.
Aquí tienes la configuración lógica detallada:
1. Atributos Base y Prioridad
• ID/Prioridad: 4A (Se sitúa en la mitad de la tabla de resolución de conflictos, por debajo del Aventurero 3B y por encima del Coleccionista 4B).
• Condición de Victoria Instantánea: Gana la partida automáticamente si logra ganar exactamente 5 bazas en una sola ronda.
2. Habilidad Activa: Mano Diestra (Dexterous Hand)
Esta es una acción que la IA debe habilitar en cada baza:
• Fase de Ejecución: Estrictamente antes de jugar una carta en cada una de las 5 bazas.
• Lógica de IA:
    1. El sistema permite al jugador robar 1 carta del mazo común.
    2. Inmediatamente después, el jugador debe descartar 1 carta de su mano (puede ser la misma que acaba de robar o cualquier otra de las 5 que ya tenía).
    3. Esta acción es opcional pero altamente estratégica para buscar la "Bandera Blanca" (White Flag) o cartas Raras.
3. Lógica de Combate: Banderas Blancas vs. Raras
El Ermitaño rompe la jerarquía estándar de cartas de una forma única:
• Regla Especial: Sus cartas de Bandera Blanca (White Flag) son más fuertes que las cartas Raras (Rare).
• Validación de IA: En el evaluador de bazas, si un oponente juega una carta Rara y el Ermitaño juega una Bandera Blanca, la IA debe asignar la victoria al Ermitaño (a menos que se apliquen reglas de "Must Follow" o "Revolt" que digan lo contrario).
• Bonificación Inmediata:
    ◦ Si el Ermitaño gana una baza usando esta regla (Bandera Blanca vence a Rara), recibe +30 puntos al instante.
    ◦ En la Ronda 3 (Last Round): Esta bonificación aumenta a +100 puntos inmediatos en lugar de 30.
4. Tabla de Puntuación (Fin de Ronda)
Al finalizar las 5 bazas, la IA debe calcular los puntos basándose en el número de victorias (si no alcanzó la victoria instantánea):
• 0 bazas: +50 pts.
• 1 baza: -10 pts.
• 2 bazas: -30 pts.
• 3 bazas: +70 pts.
• 4 bazas: +100 pts.
Resumen de Lógica para el Desarrollador (IA)
La IA debe tratar al Ermitaño como un "especialista en contraataque":
1. Ciclo de Baza: Antes de cada PlayCard, activar el trigger DexterousHand(draw, discard).
2. Modificador de Fuerza: Insertar una excepción en el motor de comparación: if Hermit plays WhiteFlag and Opponent plays Rare then HermitWins = True.
3. Gestor de Eventos: Si se cumple el modificador anterior, ejecutar AddImmediatePoints(round == 3 ? 100 : 30).
Analogía para entender al personaje: El Ermitaño es como un pescador con una red especial: su habilidad "Mano Diestra" le permite lanzar un anzuelo extra (robar) para elegir el mejor cebo (descarte). Su red es la Bandera Blanca: normalmente es lo más débil del juego, pero para él es una trampa diseñada específicamente para capturar a los peces más grandes (las cartas Raras).