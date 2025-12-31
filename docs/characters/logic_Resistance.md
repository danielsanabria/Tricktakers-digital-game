Para que la IA implemente correctamente a la Resistencia (3A) y resuelva el error de persistencia que mencionas, es fundamental diferenciar entre el personaje (que dura una ronda), la activación de la habilidad (que es puntual) y el efecto de jerarquía (que es temporal).
Aquí tienes la configuración detallada para la lógica de la IA:
1. Duración y Alcance de la Habilidad
El error principal que mencionas ocurre porque la IA asume que el estado de "Kakumei" es permanente. Según las reglas:
• Duración del Personaje: El personaje 3A se elige para una sola ronda de 5 bazas. Al finalizar la quinta baza, el jugador debe devolver el personaje y elegir uno nuevo (o repetir el proceso de selección), por lo que cualquier efecto debe resetearse.
• Activación de la Revolución (Kakumei): La Resistencia puede declarar la Revolución una sola vez por ronda (o dos veces en la Ronda Final/Ronda 3).
• Efecto por Baza (Trick): El cambio de jerarquía (donde el más débil gana) se aplica únicamente a la baza específica en la que se coloca el Token de Kakumei (referida en las reglas como el "Revolt Trick"). Una vez resuelta esa baza, el sistema debe volver inmediatamente a la jerarquía normal.
2. Implementación de la Jerarquía de Revolución
Cuando se activa el "Revolt Trick", la IA debe intercambiar el comparador de cartas por el siguiente modelo de Jerarquía Invertida:
• Orden de Fuerza: Bandera Blanca > Colores (R/A/V) > Negro > Raro > Berserker.
• Anulación de Bonos: Se ignoran todas las reglas de fortalecimiento, como el "1 vence al 10" o la ventaja del palo líder.
• Resolución de Empates: Si los valores son iguales, sigue ganando el primero en haber jugado su carta en esa baza.
3. Lógica de Puntuación y Victoria Instantánea
La IA debe monitorear estos eventos específicos durante la baza de Revolución:
• Victoria con Carta Negra: Si la Resistencia gana la baza de Revolución usando cualquier carta negra, gana la partida automáticamente (Victoria de Prioridad 1).
• Bonos de Puntos: La Resistencia gana +30 puntos por cada baza ganada en la ronda (incluyendo la baza de Revolución).
• Gestión de Coronas Negras: Si la única baza que gana la Resistencia en toda la ronda es la baza de Revolución, el sistema debe tratarlo como "0 victorias" a efectos de otorgarle una Corona Negra.
4. Guía de Flujo para el Desarrollador (IA)
Para corregir el funcional, el código debe seguir este orden lógico:
1. Inicio de Turno (3A): Habilitar botón Declarar Kakumei si el token está disponible.
2. Si se activa: Establecer variable global isRevoltTrick = True.
3. Evaluación de Baza:
    ◦ if isRevoltTrick == True: Usar KakumeiHierarchy.
    ◦ else: Usar NormalHierarchy.
4. Fin de Baza: Resetear isRevoltTrick = False y devolver la jerarquía al estado normal.
5. Fin de Ronda: Resetear todos los estados de 3A y eliminar el personaje de la cuenta del jugador para la nueva fase de selección.
Resumen del concepto para la IA: La Revolución no es un cambio de clima que dura todo el juego, es un "golpe de estado" relámpago que dura solo una baza. Imagina que es un interruptor que se apaga automáticamente en cuanto se decide quién ganó la baza actual; si la IA no lo apaga, el "caos" de la Revolución se queda encendido por error.