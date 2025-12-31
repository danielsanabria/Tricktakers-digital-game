# 🃏 Tricktakers Digital

Bienvenido a **Tricktakers Digital**, una adaptación digital del aclamado juego de mesa de bazas (trick-taking) japonés. En este juego, no solo importa ganar bazas, sino cumplir los objetivos específicos y caóticos de tu personaje único.

![Version](https://img.shields.io/badge/version-1.0.0-teal)
![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-6-purple)

---

## 🌟 ¿De qué va el juego?

A diferencia de los juegos de bazas tradicionales (como el Bridge o el Tute), en **Tricktakers** cada jugador asume el rol de un personaje con habilidades asimétricas y condiciones de victoria totalmente distintas.

### Mecánicas Principales
- **Bazas Asimétricas**: Algunos personajes quieren ganar muchas bazas (Rey), otros pocas (Ermitaño) y algunos ninguna (Berserker).
- **Habilidades Únicas**: Los personajes pueden alterar las reglas, jugar cartas boca abajo, robar puntos o incluso viajar en el tiempo.
- **3 Rondas de Caos**: Una partida se divide en 3 rondas. El objetivo es acumular la mayor puntuación total o cumplir una condición de victoria instantánea (Corona de Oro).

### Personajes Destacados
- **Rey (King)**: El balance clásico. Su objetivo es ganar bazas y dominar con su carta Rara.
- **Berserker**: ¡Odio las bazas! Su objetivo es perder todas las rondas, pero tiene cartas extremadamente fuertes que debe gestionar con cuidado.
- **Estratega (Strategist)**: Coloca trampas en la mesa que penalizan a los rivales si juegan ciertos números o colores.
- **Aventurero (Adventurer)**: Utiliza un inventario de objetos (espadas, pociones, mapas) para manipular sus cartas.
- **Resistencia (Resistance)**: Especialista en "Rebeliones". Puede invertir la fuerza de las cartas (donde el 1 es lo más fuerte).

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 19 + TypeScript.
- **Estilos**: Tailwind CSS para un diseño limpio y adaptativo.
- **Build Tool**: Vite para un desarrollo ultrarrápido.
- **Iconografía**: FontAwesome 6.
- **Tipografía**: DM Sans.

---

## 🚀 Despliegue Local

Sigue estos pasos para ejecutar el proyecto en tu máquina:

### 1. Prerrequisitos
Asegúrate de tener instalado **Node.js** (versión 18 o superior).

### 2. Clonar e Instalar
```bash
# Instala las dependencias
npm install
```

### 3. Ejecutar en modo desarrollo
```bash
# Inicia el servidor de desarrollo
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`.

### 4. Construir para producción
```bash
# Genera los archivos optimizados en la carpeta /dist
npm run build
```

---

## 📁 Estructura del Proyecto

- `/components`: Componentes reutilizables (Tablero, Cartas, Modales).
- `/logic`: Lógica asimétrica de cada personaje (clases que heredan de `BaseCharacterLogic`).
- `/public/assets`: Imágenes de cartas, personajes y logos.
- `gameLogic.ts`: El "motor" principal que resuelve las bazas y las reglas del juego.
- `App.tsx`: Orquestador principal del estado del juego.

---

## 🎨 Créditos y Diseño
Diseño visual personalizado con paleta de colores `#B9DED1` y tipografía moderna para una experiencia de juego premium.

---
*Desarrollado con ❤️ para los amantes de los juegos de mesa.*
