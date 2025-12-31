Para implementar al Time Traveler (Viajero del Tiempo - 4C), la IA debe gestionar una de las lógicas más complejas del juego, ya que permite retroceder el estado de la mesa y redistribuir cartas. Su prioridad es 4C, lo que significa que suele actuar tarde en la resolución de desempates.
Aquí tienes la guía lógica para su integración:
1. Configuración Inicial (Setup)
• Predicción Secreta: Al inicio de la ronda, el Viajero debe predecir quién ganará la Corona Dorada (1 jugador) y quiénes las Coronas Negras (2 jugadores). La IA debe permitir que el Viajero se elija a sí mismo si lo desea.
• Recurso de Tiempo: El personaje comienza con 2 Tokens de Viaje Temporal, que limitan el uso de sus habilidades a máximo dos veces por ronda.
2. Habilidad de Turno: Rewind (Rebobinar)
Esta habilidad se activa durante el turno del Viajero gastando 1 Token:
• Efecto de Devolución: Todas las cartas jugadas en la baza actual vuelven a las manos de sus dueños.
• Lo que NO se deshace: La IA no debe revertir acciones ocurridas durante la baza antes del rebobinado: los puntos perdidos por trampas del Estratega, el MP gastado por el Invocador y los elementos colocados en el Círculo Mágico del Alquimista permanecen como están.
• Cancelaciones: Si se usaron ítems (3B), se descartan; si se declaró una Revolución (3A), esta se cancela y puede volver a usarse después.
• Acción Posterior: Tras devolver las cartas, el Viajero roba 2 cartas y descarta 2, y luego elige quién será el nuevo jugador líder para reiniciar la baza.
3. Habilidad de Victoria: Change the Past (Cambiar el Pasado)
Se activa después de que el Viajero gana una baza (excepto en la 5ª baza) gastando 1 Token:
• Captura: El Viajero toma todas las cartas de la baza a su mano.
• Redistribución: Debe entregar una carta de su elección (de las capturadas o de su mano original) a cada uno de los demás jugadores. La IA debe permitir pasar cualquier tipo de carta, incluso bestias del Invocador o cartas exclusivas del Berserker.
• Liderazgo: El Viajero finaliza la acción eligiendo al jugador líder de la siguiente baza.
4. Condición de Victoria Instantánea y Puntuación
• Victoria de Prioridad 1 (Ronda Final): En la ronda 3, el Viajero puede hacer sus predicciones de forma pública. Si acierta los 3 ganadores de coronas (1 dorada y 2 negras), gana la partida inmediatamente.
• Puntuación Estándar: Si la partida no termina, la IA otorga +50 puntos por cada predicción correcta realizada en el Setup.
Resumen de Lógica para el Desarrollador (IA)
El Viajero del Tiempo es un "manipulador de estado". La IA debe validar:
1. Persistencia de Recursos: MP_Spent y Trap_Points no regresan tras un Rewind().
2. Validación de Turno: Rewind() puede cancelar una Revolución (RevoltTrick = false) permitiendo que se declare de nuevo más tarde.
3. Gestión de Inventario: Durante ChangeThePast(), el array de cartas del Viajero crece y luego debe disminuir al repartir a los oponentes.
4. Finalizador: Si en la Ronda 3 PublicPredictions == ActualWinners, disparar InstantVictory().
Analogía: El Viajero del Tiempo es como un editor de video en una transmisión en vivo. Si no le gusta cómo va la escena (la baza), puede darle a "borrar" (Rewind) y pedirle a los actores que repitan la toma, pero no puede recuperar el café que ya se derramó en el set (puntos o MP gastados). Al final, si puede predecir exactamente cómo terminará la película, se queda con todo el éxito.