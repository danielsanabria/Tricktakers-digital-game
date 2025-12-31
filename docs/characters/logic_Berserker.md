Para implementar correctamente al Berserker (5A), la IA debe gestionar un mazo exclusivo, una jerarquía de combate con excepciones específicas y una condición de victoria invertida que penaliza ganar pocas bazas a menos que gane ninguna.
Aquí tienes la lógica detallada para su integración:
1. Configuración Inicial (Setup)
Cuando un jugador selecciona al Berserker, la IA debe ejecutar un cambio total en la composición de su mano:
• Descarte Total: El sistema debe descartar las 5 cartas iniciales que se le repartieron al jugador.
• Mazo Exclusivo (Berserker Exclusive Deck): La IA debe generar una mano nueva compuesta por:
    1. La Carta Berserker (Berserker Card).
    2. 4 cartas aleatorias del mazo exclusivo del Berserker (quedando 2 cartas sin usar en ese mazo para posibles intercambios posteriores).
2. Lógica de Combate y Fuerza
El Berserker es la fuerza bruta del juego, pero tiene una debilidad crítica que la IA debe procesar:
• Jerarquía Normal: El Berserker es la carta más fuerte del juego (incluso por encima de las Raras), pero con una excepción vital: cualquier carta con el número "1" vence al Berserker.
• Jerarquía de Revolución (Kakumei): Si hay una Revolución activa, el Berserker se convierte en la carta más débil de la mesa.
    ◦ Anulación: Durante la Revolución, la regla de que el "1" vence al Berserker queda anulada.
• Atributo Incoloro: Las cartas del Berserker son incoloras. La IA debe permitir jugarlas en cualquier momento, pero no definen el palo líder de la baza.
3. Puntuación y Victoria Instantánea
La IA debe monitorizar el contador de bazas ganadas, ya que el Berserker busca los extremos:
• Victoria de Prioridad 1 (Instantánea): Si el Berserker termina la ronda con 0 victorias, gana la partida automáticamente.
    ◦ Nota: Algunas variantes indican que ganar 0 o 1 baza otorga la victoria, pero la carta estándar especifica exactamente 0 bazas para ganar el juego.
• Tabla de Puntos (Si no hay victoria instantánea):
    ◦ 0 bazas: -30 pts (solo si no se activa la victoria instantánea por prioridad).
    ◦ 1 baza: -10 pts.
    ◦ 2 bazas: +30 pts.
    ◦ 3 bazas: +50 pts.
    ◦ 4 bazas: +80 pts.
    ◦ 5 bazas: -50 pts (penalización por exceso).
4. Mecánica de la Última Ronda (Ronda 3)
En la ronda final, la IA debe habilitar una opción de gestión de recursos:
• Gasto de Corona Negra: Si el Berserker posee una Corona Negra, puede gastarla para descartar 1 o 2 cartas de su mano.
• Robo del Mazo Exclusivo: El jugador puede robar nuevas cartas de las 2 que quedaron sin repartir del mazo exclusivo al inicio de la ronda.
• Restricción: El sistema nunca debe permitir descartar la "Carta Berserker" principal mediante este efecto.
Resumen de Lógica para el Desarrollador (IA)
1. Interceptar Setup: if (character == BERSERKER) { hand.clear(); hand.add(BerserkerCard + 4_Random_BerserkerDeck); }
2. Modificar Comparador: if (card.isBerserker && opponentCard.value == 1 && !isRevolt) return LOSE;
3. Validar Fin de Ronda: if (wins == 0) triggerVictory(Priority1);
4. Habilitar Botón R3: if (round == 3 && hasBlackCrown) enableDiscardSwap();
Analogía: El Berserker es como un tanque pesado: es casi invencible y aplasta cualquier defensa normal, pero es tan grande que un pequeño soldado con una lanza (el número "1") puede encontrar el hueco en su armadura y derribarlo. Su objetivo es no destruir a nadie para demostrar que su mera presencia es suficiente para ganar el trono (0 bazas = victoria).