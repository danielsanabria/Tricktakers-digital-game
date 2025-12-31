El Summoner (Invocador - 2C) es un personaje de la expansión que introduce la gestión de un recurso específico: los puntos de magia (MP). Para que una IA gestione este personaje, debe tratarlo como un sistema de "economía de acciones" donde se compran habilidades y cartas de combate temporales.
Aquí tienes la lógica detallada para su implementación:
1. Configuración y Recurso Base (MP)
• Prioridad: 2C (Prioridad media-alta).
• Recurso MP: Al inicio de la ronda (Setup), la IA debe asignar al Summoner 5 MP iniciales.
• Recuperación de MP: Cada vez que el Summoner gana una baza (Trick Victory), la IA debe añadir +1 MP a su reserva.
2. Estructura del Turno (Flujo Lógico)
La IA debe forzar un orden estricto de 4 pasos en el turno del Summoner:
1. Invocación a la Retaguardia (Rear): Puede invocar hasta 2 bestias al tablero de invocación pagando su coste en MP.
2. Comando (Command): Puede usar las habilidades especiales de las bestias que están en la retaguardia tantas veces como pueda pagar en MP.
3. Jugar Carta: Juega una carta normal de su mano a la mesa.
4. Mover al Frente (Front): Puede elegir mover una de sus bestias de la retaguardia al frente para que luche en la baza actual, colocándola encima de la carta jugada en el paso 3.
3. Lógica de las Bestias Invocadas
Cada bestia tiene costes y efectos que la IA debe monitorear:
• EL (Fénix):
    ◦ Coste: 4 MP para invocar.
    ◦ Habilidad en Retaguardia: La IA debe sumar +1 MP al final de cada turno mientras esté en la retaguardia.
    ◦ Al frente: Se trata como una Bandera Blanca (vence a las cartas Raras).
• MIRIA (Dragón):
    ◦ Coste: 3 MP para invocar.
    ◦ Habilidad en Retaguardia: Activa una regla global: los "10" no pierden contra los "1" (anula la regla estándar de que el 1 vence al 10 del mismo color).
    ◦ Al frente: Se trata como una carta de Berserker.
• Bestias de Color (MARU-Rojo, GURU-Azul, NEMU-Verde, OKO-Negro):
    ◦ Coste: 1 MP para invocar.
    ◦ Al frente: Funcionan como un "10" de su respectivo color.
    ◦ Coste de movimiento al frente: Es gratis si el color o valor de la carta jugada en el paso 3 coincide con la bestia. Si no coinciden, cuesta MP adicional (específicamente 2 MP para el Negro/OKO).
4. Habilidades de Comando (Habilidades Activas)
Mientras haya bestias en la retaguardia, el Summoner puede gastar MP en:
• Filtrado de mano: Gastar 1 MP para "descartar 1 carta y robar 1" o "descartar X y robar X" según la bestia activa. La IA debe permitir esto antes de jugar la carta de la mano.
5. Puntuación y Victoria
Al final de la ronda, la IA calcula los puntos según las bazas ganadas:
• 0 victorias: -20 pts.
• 1 victoria: +20 pts.
• 2 victorias: +40 pts.
• 3 victorias: +70 pts.
• 4 victorias: +100 pts.
• 5 victorias: Victoria instantánea de la partida.
Resumen para el Desarrollador (IA)
Para la IA, el Summoner es un personaje de "estado variable". La IA debe validar constantemente:
1. CheckMP(): ¿Tiene el jugador suficiente MP para la acción deseada?
2. OverwriteCard(): Si una bestia va al frente, sus valores (color y fuerza) sobrescriben totalmente la carta que se jugó inicialmente en esa baza.
3. MiriaPassive(): Si Miria está en el array RearBeasts, el comparador de bazas debe ignorar la superioridad de los "1" sobre los "10".
Analogía: El Invocador es como un entrenador de Pokémon: no pelea él mismo, sino que usa su energía (MP) para mantener a sus criaturas listas en el banquillo (retaguardia). Solo cuando ve el momento oportuno, ordena a una criatura saltar al campo para ganar el combate, reemplazando cualquier esfuerzo débil que él hubiera hecho originalmente.