Para implementar correctamente al Ruler (Gobernante - 5B), la IA debe gestionar un sistema de objetivos externos (tareas asignadas a otros) y una capacidad única para redefinir las reglas de la baza en su propio turno. Su prioridad es 5B, lo que lo sitúa como el último en la jerarquía de resolución de conflictos.
Aquí tienes la lógica detallada para su funcionamiento:
1. Configuración Inicial (Setup): Asignación de Tareas
El Gobernante no juega solo para su beneficio, sino que impone condiciones a los demás:
• Reparto de Tareas: Al inicio de la ronda, la IA debe permitir al Gobernante entregar una carta de Tarea (Task card) a cada uno de los demás jugadores.
• Variante por número de jugadores: En partidas de 3 jugadores, puede entregar 1 o 2 tareas a cada uno; en partidas de 4 a 5 jugadores, entrega exactamente una por oponente.
• Propósito: El Gobernante sumará puntos extra si sus oponentes logran completar las tareas que él les asignó.
2. Habilidad de Turno: Rule Avoidance (Evitar la Regla)
Esta habilidad permite al Gobernante manipular el flujo de la baza:
• Ignorar el "Must Follow": En su turno, el Gobernante puede jugar cualquier carta de su mano, ignorando inicialmente la obligación de seguir el palo líder.
• Redefinición del Palo: Si decide ignorar el palo líder, debe colocar un Token de Color (Color Tile/Lead Token) sobre la carta que acaba de jugar para que esta coincida con el palo líder o incluso para redefinir el palo de la baza en curso.
3. Condición de Victoria Instantánea (Prioridad 1)
La IA debe monitorizar constantemente el inventario de cartas ganadas por el Gobernante, ya que posee una condición de victoria de Prioridad 1:
• La Purga de Colores: Si el Gobernante gana 2 o más bazas sin haber capturado ninguna carta de color (Rojo, Azul o Verde), gana la partida inmediatamente.
• Lógica de validación: Para que esto ocurra, las cartas en las bazas ganadas deben ser exclusivamente Negras, Raras, White Flags o Berserker.
4. Lógica de Puntuación Final
Si la partida no termina por victoria instantánea, la IA calcula los puntos según el éxito de las tareas y el desempeño en las bazas:
Bonos por Tareas:
• Modo Normal: +10 puntos si se completan todas las tareas asignadas.
• Modo Difícil (HARD): +20 puntos si se completan todas las tareas.
• Variante 3-5 jugadores: El bono por completar todas las tareas sube a +30 puntos.
Puntos por Desempeño Propio:
• Captura de cartas: +10 puntos si el Gobernante captura al menos una carta negra durante la ronda.
• Bazas ganadas: +20 puntos si logra ganar exactamente 1 baza.
Resumen de Lógica para el Desarrollador (IA)
1. Setup: foreach(opponent) -> Assign(TaskCard).
2. Durante el Turno: AllowPlayAnyCard() -> if (!FollowsLead) { ApplyColorTile(NewLeadSuit); }.
3. Monitoreo de Victoria: if (Wins >= 2 && CapturedCards.All(c => c.Color == Black || c.IsColorless)) -> TriggerVictory().
4. Fin de Ronda: TotalScore = TaskBonus + BlackCardBonus + SingleWinBonus.
Analogía para la IA: El Gobernante es como un director de orquesta tiránico: al principio les dice a los músicos qué notas deben tocar (tareas). Durante el concierto, si no le gusta el ritmo, puede cambiar la partitura a mitad de una canción (redefinir el palo líder). Su mayor triunfo es lograr que el concierto sea perfecto usando solo los instrumentos más oscuros y pesados (cartas negras), sin que se escuche ni una sola nota ligera de color.