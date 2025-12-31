Para implementar correctamente al **Adventurer (Aventurero - 3B)** en la versión digital, la IA debe gestionar un sistema de **inventario dinámico** y modificaciones de cartas en tiempo real a través de objetos consumibles. Su prioridad es **3B**, situándose justo en el medio de la jerarquía de resolución.

Aquí tienes la configuración lógica detallada:

### **1. Configuración Inicial (Setup)**
*   **Selección de Equipo:** Al inicio de la ronda, la IA debe presentar al jugador dos listas de ítems iniciales y permitirle elegir **un ítem Rojo** y **un ítem Azul**.
*   **Preparación del Mazo de Ítems:** El resto de los ítems iniciales no elegidos deben barajarse con los ítems regulares para crear el **Mazo de Ítems** de la ronda.

### **2. Estructura del Turno (Acción de Ítem)**
La IA debe habilitar una ventana de decisión adicional durante el turno del Aventurero:
*   **Uso de Ítems:** Antes de jugar su carta, el jugador puede activar **un ítem** de su inventario disponible.
*   **Reposición:** Inmediatamente después de usar un ítem, el sistema debe **robar uno nuevo** del mazo de ítems para reemplazar el espacio vacío.

### **3. Mecánica de "Subir de Nivel" (Trick Victory)**
Esta es la forma en la que el Aventurero expande su capacidad de usar habilidades:
*   **Trigger:** Al ganar una baza (`On Trick Win`).
*   **Lógica:** La pila de cartas ganadas (el *trick pile*) se convierte en un **nuevo espacio (slot)** para un ítem.
*   **Acción:** La IA debe robar un nuevo ítem del mazo y colocarlo sobre esa pila de bazas ganadas, quedando disponible para turnos posteriores.

### **4. Lógica de los Ítems (Modificadores de Combate)**
La IA debe aplicar los efectos de los ítems sobre la carta que el Aventurero juegue en esa misma baza:
*   **Berserker’s Axe (Hacha):** Cambia el valor de la carta a **10** (ojo: sigue perdiendo contra el "1" del mismo color a menos que haya Revolución).
*   **Ruler’s Wand (Varita):** Cambia el color de la carta para que **coincida con el palo líder**.
*   **Miracle Sword (Espada):** Permite sumar o restar exactamente **5 puntos** al valor de la carta (mínimo 1, máximo 9).
*   **Timid Boots (Botas):** Fuerza al Aventurero a **jugar de último** en la baza actual.
*   **Invisibility Potion (Poción):** Permite jugar la carta **boca abajo** (debe seguir cumpliendo el "Must Follow" si es posible).
*   **Map of Destiny (Mapa):** Permite descartar **X cartas** de la mano y robar el mismo número.

### **5. Puntuación Final y Victoria**
La IA debe calcular los puntos al final de las 5 bazas y añadir los bonos/penalizaciones de los ítems **no usados**:

**Tabla de Bazas:**
*   **0 bazas:** +20 pts.
*   **1 baza:** +10 pts.
*   **2 bazas:** +20 pts.
*   **3 bazas:** +40 pts.
*   **4 bazas:** +60 pts.
*   **5 bazas:** **Victoria instantánea de la partida**.

**Bonos por Ítems NO usados (Unused Items):**
La IA debe revisar el inventario restante y aplicar:
*   **Ítems de ayuda (+10 pts cada uno):** Botas, Poción, Mapa.
*   **Ítems de fuerza (-30 pts cada uno):** Hacha, Varita, Espada.

### **Resumen de Lógica para la IA**
El Aventurero es un personaje de **"crecimiento progresivo"**:
1.  **En el Turno:** `If ItemUsed -> ExecuteEffect -> ReplaceItem`.
2.  **Al ganar baza:** `AddSlot -> DrawItem -> StockInPile`.
3.  **Al final:** `TotalScore = TrickPoints + Sum(UnusedItemModifiers)`.

**Analogía para el desarrollador:**
El Aventurero es como un **personaje de RPG en una mazmorra**: empieza con equipo básico, pero cada enemigo derrotado (baza ganada) le da un "cofre" (nuevo ítem) que puede usar para superar desafíos más difíciles. Sin embargo, llevar equipo pesado que no usó (ítems de fuerza) le resta agilidad (puntos) al final de la jornada.