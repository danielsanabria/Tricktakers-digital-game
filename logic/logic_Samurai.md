Para implementar al Samurai (3D) en la versión digital, la IA debe gestionar una lógica de "sustitución de palo" y un control estricto sobre el inventario de la mano, ya que este personaje tiene una afinidad absoluta con el color rojo y una prohibición total del negro.
Aquí tienes los pasos detallados para su implementación:
1. Configuración Inicial y Gestión de Mano (Setup)
El Samurai tiene prohibido poseer cartas del palo negro. La IA debe ejecutar estos filtros:
• Filtro de inicio: Al recibir la mano inicial, el sistema debe descartar automáticamente todas las cartas negras y reemplazarlas robando el mismo número de cartas del mazo.
• Mantenimiento permanente: En cualquier momento de la ronda en que el Samurai reciba una carta negra (por ejemplo, mediante la habilidad del Viajero del Tiempo), la IA debe obligar al descarte inmediato de esa carta y robar una nueva para sustituirla.
2. Mecánica Central: Spirit of Red (Espíritu del Rojo)
Esta es la regla que la IA debe aplicar en el comparador de fuerza de las bazas:
• Sustitución de Palo: Cuando el Samurai juega una carta roja, la IA debe tratarla como si fuera una carta negra (el palo de triunfo o trump suit) a efectos de jerarquía.
• Ejemplos de resolución:
    ◦ Un 8 Rojo del Samurai vencerá a un 6 Negro de un oponente, ya que ambos se consideran negros pero el 8 es mayor.
    ◦ Un 1 Rojo del Samurai vencerá a un 10 Negro del rival (siguiendo la regla de que el 1 gana al 10 del mismo palo).
• Condición de Anulación: La IA debe desactivar esta habilidad inmediatamente si ocurre cualquiera de estas dos situaciones:
    1. Hay una White Flag (Bandera Blanca) presente en la mesa en esa baza.
    2. Se ha declarado una Revolución (Kakumei) en ese turno.
3. Habilidad tras Victoria (Trick Victory)
Cuando la IA detecta que el Samurai ha ganado una baza, debe habilitar una acción opcional:
• Robo de carta: El Samurai puede tomar una carta roja que haya sido jugada por cualquier otro jugador en esa baza y añadirla a su propia mano.
• Compensación: Si decide tomar la carta, el Samurai debe descartar otra carta de su mano para no exceder el límite.
4. Puntuación y Victoria Instantánea
La IA debe monitorizar el contador de victorias (wins) del Samurai, ya que su tabla de puntuación es muy volátil:
• 0 victorias: +0 puntos.
• 1 victoria: +30 puntos.
• 2 victorias: +80 puntos.
• 3 victorias: +120 puntos.
• 4 victorias: Victoria instantánea de la partida (Prioridad 1).
• 5 victorias: Penalización por "codicia" de -100 puntos.
Resumen de Lógica para el Desarrollador (IA)
1. Bloquear la entrada de cartas negras en el array hand.
2. Modificar el comparador de fuerza: if (card.color == RED && player == SAMURAI && !whiteFlag && !kakumei) card.color = BLACK.
3. Habilitar TakeRedCardFromTable() solo si SamuraiWinsTrick == true.
4. Disparar MatchEnd() si el contador de victorias llega exactamente a 4.
Analogía: El Samurai es como un maestro de esgrima que solo usa una espada roja. En sus manos, esa espada es tan pesada y poderosa como la gran espada negra de otros guerreros. Sin embargo, si alguien levanta una "bandera de tregua" (Bandera Blanca), su técnica se desvanece y su espada roja vuelve a ser una simple arma ligera. El Samurai busca la perfección (4 victorias), pero si se excede y derrota a demasiados enemigos (5 victorias), pierde su honor y sus puntos.