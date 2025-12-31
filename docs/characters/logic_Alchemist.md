Para implementar al **Alchemist (Alquimista - 3C)** en la versión digital, la IA debe gestionar un sistema de juego completamente diferente al resto, basado en la combinación de múltiples cartas para generar un único valor y la recolección de "elementos" en un tablero secundario llamado **Círculo Mágico**.

Aquí tienes la lógica detallada para su implementación:

### **1. Configuración Inicial (Setup)**
*   **Mazo Especial:** La IA debe utilizar el **Alchemist Deck** (Mazo de Alquimista), exclusivo para este personaje.
*   **Modificación de Mano:** Al inicio de la ronda, el sistema debe obligar al jugador a **descartar toda su mano inicial** y robar **6 cartas** del mazo de Alquimista.
*   **Límite de Mano:** El Alquimista tiene un límite estricto de **6 cartas**.

### **2. Mecánica de Turno: Alquimia (Alchemy)**
El Alquimista no juega una carta, sino una combinación:
*   **Acción de Juego:** En cada baza, el jugador debe seleccionar y **jugar 3 cartas** de su mano.
*   **Cálculo del Valor:** La IA debe sumar los números de las 3 cartas jugadas. 
    *   Si el total es **10**, ese es su valor de combate.
    *   Si el total es **11 o más**, el valor de combate es el **último dígito** (ej: 12 = 2).
*   **Reposición:** Inmediatamente después de jugar, la IA debe permitir al jugador **robar 3 cartas** del mazo de Alquimista para volver a tener 6 (excepto en la baza 5, donde se quedará con las 3 restantes).

### **3. Lógica de Colores y Liderazgo**
*   **Color Líder:** El Alquimista siempre se considera que **sigue el palo líder**, sin importar qué colores juegue en su combinación de 3 cartas.
*   **Regla "Must Follow":** Si el Alquimista tiene en su mano cartas del color líder de la baza, la IA debe obligarle a incluir **al menos una** de esas cartas en su combinación de 3.
*   **Cuando el Alquimista Lidera:** Al ser el primero en jugar, debe lanzar sus 3 cartas y **declarar cuál será el color líder** de la baza (puede elegir Rojo, Azul, Verde o incluso **Negro**).
    *   **Excepción del Negro:** Solo puede declarar el color Negro como líder si las 3 cartas jugadas son de **colores diferentes** (una roja, una azul y una verde).

### **4. El Círculo Mágico y los Elementos**
La IA debe monitorizar la obtención de "Elementos" que se colocan en el Círculo Mágico para obtener puntos o coronas al final de la ronda:
*   **Condiciones para ganar un Elemento (+1 Elemento):**
    1.  **Mismo número que el líder:** El valor total de su alquimia coincide con el valor de la carta líder.
    2.  **Tercia (3 of a kind):** Jugar 3 cartas con el mismo número.
    3.  **Color (Flush):** Jugar 3 cartas del mismo color.
    4.  **Corrida (Straight):** Jugar 3 cartas con valores consecutivos.
    5.  **Ganar la baza:** Obtener la victoria en la baza actual.
*   **Uso de Elementos:** Al final de la ronda, la IA comprueba las **formaciones** completadas en el círculo (ej. columnas o triángulos) para otorgar puntos extra (desde 10 hasta 120 pts) o **Coronas Forjadas**.

### **5. Forjado de Coronas y Victoria Instantánea**
*   **Forjar Corona Dorada:** Si el Alquimista completa la formación de **Hexágono** en su círculo y posee una **Corona Negra** (de esta ronda o la anterior), puede gastar esa Corona Negra para forjar una **Corona Dorada**.
*   **Victoria Instantánea:** Si el Alquimista logra obtener **2 Coronas Doradas en la misma ronda** (por ejemplo, ganando la corona por mayoría de bazas y forjando otra en el círculo), gana la partida inmediatamente.

### **Resumen de Lógica para el Desarrollador (IA)**
El Alquimista es un **"gestor de combinaciones"**:
1.  **Validar** el "Must Follow" dentro del array de 3 cartas seleccionadas.
2.  **Calcular** el valor de combate con la fórmula `Suma % 10` (si el resultado es 0 y la suma era >0, el valor es 10; si la suma es >10, es el remanente).
3.  **Registrar** cada condición de Elemento cumplida y "dibujarla" en el tablero del Círculo Mágico.
4.  **Permitir** el sacrificio de Coronas Negras para transformarlas en Doradas si se cumple la geometría del Hexágono.

**Analogía:**
El Alquimista es como un **chef que prepara un plato con tres ingredientes**: no importa el sabor individual de cada ingrediente, lo que cuenta es la **mezcla final** (la suma) y si ha usado el ingrediente obligatorio del día (el palo líder). Si la presentación del plato es perfecta (formaciones en el círculo), puede convertir sus "monedas de cobre" (coronas negras) en "oro puro" (coronas doradas).