Para implementar al Strategist (Estratega - 1C) en la versión digital, la IA debe gestionar un sistema de "trampas" y una reserva de puntos centralizada que rompe el flujo de puntuación estándar. Este personaje tiene una prioridad 1C, lo que significa que es muy alto en la jerarquía para resolver conflictos.
Aquí tienes la lógica detallada para la IA:
1. Configuración Inicial (Setup)
• Modificación de Mano: Al inicio, el sistema debe añadir el 7 Negro (Black 7) a su mano y obligar al jugador a descartar otra carta.
• Mazo de Trampas (Trap Deck): La IA debe presentar al usuario las 5 cartas de Trampa y permitirle elegir el orden en que se revelarán (una por cada una de las 5 bazas).
• Estado de Inmunidad: El objeto Strategist debe tener una propiedad permanente isImmuneToTraps = true.
2. Lógica de las Trampas (Durante las Bazas)
Esta es la parte más compleja para la IA, ya que debe actuar como un "árbitro" constante:
• Fase de Revelación: Al inicio de cada baza, antes de que nadie juegue, la IA debe revelar la carta de trampa activa para ese turno.
• Validación de "Atrapado": Cada vez que un oponente juegue una carta, la IA debe comprobar si cumple la condición de la trampa activa (ej. "Si juegas un 7, 8 o 9" o "Si juegas una carta negra").
• Gestión del Pozo (Pooled Points):
    ◦ Si un oponente cae en la trampa, la IA debe restar 10 puntos de su reserva y moverlos a un pozo temporal en el centro de la mesa.
    ◦ Importante: Si un jugador tiene 0 puntos, la IA no puede restar puntos negativos, simplemente no se añade nada al pozo.
3. Resolución de la Baza (Victoria)
• Captura del Pozo: Si el Estratega gana la baza (StrategistWins == True), la IA debe transferir todos los puntos acumulados en el pozo directamente a la puntuación del Estratega.
• Persistencia: Si el Estratega no gana la baza, los puntos permanecen en el pozo para la siguiente baza. Si al final de las 5 bazas sobran puntos en el pozo, la IA los elimina (vuelven a la caja).
4. Habilidad Táctica (Tactical Card)
• Ignorar el Palo (Must Follow): Una vez por ronda, la IA debe habilitar un botón especial que permita al Estratega jugar cualquier carta de su mano ignorando la obligación de seguir el palo líder.
5. Puntuación Final y Elección (Fin de Ronda)
La IA debe manejar una tabla de puntos específica:
• 0 victorias: El sistema debe preguntar: ¿Deseas 50 puntos o llevarte una carta Rare para la siguiente ronda?.
• 1 victoria: El sistema debe preguntar: ¿Deseas 30 puntos o llevarte el 7 Negro para la siguiente ronda?.
• 2 victorias: El sistema resta -50 puntos.
• 3 victorias: +50 puntos.
• 4 victorias: +80 puntos.
• 5 victorias: Victoria instantánea de la partida.
Resumen de Lógica para el Desarrollador (IA)
La IA debe tratar al Estratega como un "recaudador de impuestos":
1. Vigila lo que juegan los demás (Trampas).
2. Almacena las multas en una cuenta temporal (Pozo).
3. Transfiere el dinero solo si el Estratega demuestra fuerza (Gana la baza).
4. Gestiona herencias: Permite sacrificar puntos de victoria inmediatos por "heredar" cartas poderosas (Rare o 7 Negro) para la siguiente ronda.
Analogía: El Estratega es como un dueño de casino: él pone las reglas de la mesa (mazo de trampas) y no importa quién pierda el dinero en la jugada, el dinero se queda en la mesa hasta que la "casa" (él) decida ganar la mano y llevárselo todo..