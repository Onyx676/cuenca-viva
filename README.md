# Simulador Educativo de Gestión Hídrica ("Cuenca Viva")

Un videojuego educativo web interactivo diseñado para enseñar los principios de la gestión integrada de recursos hídricos en cuencas hidrográficas a estudiantes de escuelas y público general.

---

## 🌊 Principios Pedagógicos y Objetivos de Aprendizaje

El simulador busca superar visiones simplistas (como "minería mala" o "agricultura buena"), demostrando que:
1. **La oferta de agua cambia año a año**: La lluvia, la acumulación de nieve cordillerana y la velocidad de deshielo definen la disponibilidad real.
2. **Existen múltiples usuarios legítimos**: Población urbana, agricultura, ganadería, minería, industria y el ecosistema fluvial (caudal ambiental).
3. **El agua subterránea no es infinita**: El acuífero se recarga lentamente; su sobreexplotación genera costos de bombeo crecientes y riesgo de estrés hídrico irreversible.
4. **Cantidad vs. Calidad**: No basta con que haya caudal; el saneamiento urbano y el tratamiento de efluentes determinan si el agua devuelta puede ser aprovechada río abajo.
5. **Inversión y Resiliencia**: Obras como riego por goteo, impermeabilización de canales, microreservorios y recirculación minera reducen la presión sobre el recurso sin detener la actividad.
6. **Previsión y Reserva Estratégica**: Guardar agua en embalses y acuíferos en años húmedos es la clave para sortear las sequías severas.

---

## 🚀 Tecnologías y Arquitectura

* **Motor Gráfico**: [Phaser 3](https://phaser.io/) (Renderizado Canvas / WebGL del paisaje pseudoisométrico animado de la cuenca).
* **Entorno Web y Empaquetador**: [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/).
* **UI Responsiva**: HTML5 + CSS con efectos de *glassmorphism*, diseñado tanto para ratón de escritorio como para pantallas táctiles de tablets y móviles escolares.
* **Simulación Desacoplada**:
  - `src/simulation/RandomSystem.ts`: PRNG determinista con algoritmo Mulberry32. Códigos de aula como `AULA-2026-001` generan exactamente la misma secuencia climática para todos los alumnos.
  - `src/simulation/ClimateSystem.ts`: Cadenas de Markov para transiciones climáticas (`VERY_DRY`, `DRY`, `NORMAL`, `WET`, `VERY_WET`) y ciclos ENSO (`NEUTRAL`, `EL_NINO`, `LA_NINA`).
  - `src/simulation/RainSystem.ts`: Descomposición de lluvia en infiltración subterránea, escorrentía rápida y evaporación según intensidad.
  - `src/simulation/SnowSystem.ts`: "Torre de agua" cordillerana: acumulación nival y deshielo en función de temperatura y olas de calor.
  - `src/simulation/WaterSystem.ts`: Balance de masa hídrica, embalses, niveles freáticos del acuífero, retornos sectoriales y dilución de contaminantes.
  - `src/simulation/UpgradeSystem.ts`: Árbol de mejoras en 6 ramas con prerequisitos y costos.
  - `src/simulation/EventSystem.ts`: Eventos climáticos y humanos condicionados con posibilidad de mitigación tecnológica.

---

## 🎮 Cómo Ejecutar el Proyecto

### Requisitos
* Node.js v18+ y npm instalados.

### Instalación y Desarrollo Local
```bash
# 1. Instalar dependencias
npm install

# 2. Ejecutar servidor local de desarrollo
npm run dev
```
Abre la URL indicada (usualmente `http://localhost:3000`) en cualquier navegador web moderno (Chrome, Edge, Firefox, Safari).

### Compilación para Producción (Sitio Estático)
```bash
npm run build
```
Genera la carpeta `dist/` optimizada y lista para desplegar en GitHub Pages, Vercel, Netlify o cualquier servidor estático sin backend.

---

## 🏫 Guía de Uso en el Aula (Modo Clase)

1. El docente propone un código de semilla compartido (por ejemplo: `AULA-2026-001`) y el modo tutorial (`Opcional`, `Obligatorio` o `Desactivado`).
2. Los estudiantes nuevos inician con el **Modo Tutorial (Año 0)** en 9 fases prácticas para experimentar cómo fluye el agua y las consecuencias de sus decisiones.
3. Todos los estudiantes juegan los **5 años (20 estaciones: Invierno, Primavera, Verano, Otoño)**, viviendo el mismo régimen climático y eventos.
4. Con los **sliders horizontales**, reparten el agua disponible en tiempo real observando cómo cambian los caudales de los canales y la reserva en el embalse.
5. Al finalizar cada año (Otoño), reciben el presupuesto anual según la satisfacción de los sectores y deciden en qué obras invertir antes del invierno.
6. Al finalizar el Año 5, se comparan las pantallas del **Informe Final**:
   - ¿Quién logró abastecer a todos los sectores sin secar el acuífero?
   - ¿Cómo influyeron las inversiones en riego tecnificado y saneamiento en la salud ecológica del río y la confianza ciudadana?

---

## 📖 Reglas y Fórmulas de Simulación

Para conocer en detalle las fórmulas matemáticas del balance hidrológico, orden de captación, curvas de demanda y cálculo de presupuesto, consulta el documento [GAME_RULES.md](file:///d:/hackaton/GAME_RULES.md).

---

## 📊 Estructura del Código

```text
src/
├── main.ts                    # Controlador principal, enlace UI / Phaser y sliders
├── style.css                  # Estilos responsivos con gradientes y tarjetas glassmorphism
├── data/
│   ├── climate.json           # Matrices de transición de Markov y ENSO
│   ├── events.json            # Catálogo de eventos con dilemas A/B/C
│   ├── scenarios.json         # Escenarios de cuencas (Valle Central, Árida, Lagos)
│   ├── seasonalGoals.json     # 20 metas estacionales pedagógicas
│   ├── tutorial.json          # Escenario controlado del Año 0 (9 fases)
│   └── upgrades.json          # Catálogo de mejoras en 6 ramas (3 niveles cada una)
├── game/
│   └── BasinScene.ts          # Maqueta 2.5D animada en Phaser (río, 5 canales, partículas, clima)
├── models/
│   ├── Balance.ts             # Balances estacionales y anuales
│   ├── ClimateState.ts        # Tipos climáticos y pronósticos
│   ├── Event.ts               # Estructuras de eventos interactivos
│   ├── GameState.ts           # Estado global de la partida
│   ├── Season.ts              # Modelo estacional (Invierno, Primavera, Verano, Otoño)
│   ├── SeasonalGoal.ts        # Metas y recompensas estacionales
│   ├── Sector.ts              # Sectores de demanda (ciudad, agro, ganadería, mina, río)
│   └── Upgrade.ts             # Definiciones de obras e infraestructura
├── tutorial/
│   └── TutorialManager.ts     # Máquina de estados del tutorial (Año 0, 9 fases)
└── simulation/
    ├── ClimateSystem.ts       # Markov y ENSO
    ├── DemandSystem.ts        # Cálculo dinámico de demandas estacionales
    ├── EventSystem.ts         # Disparador condicional de eventos
    ├── RainSystem.ts          # Modelo de lluvia, infiltración y escorrentía
    ├── RandomSystem.ts        # Generador pseudoaleatorio determinista (Mulberry32)
    ├── SimulationEngine.ts    # Motor hidrológico desacoplado
    ├── SnowSystem.ts          # Acumulación nival y deshielo gradual
    ├── UpgradeSystem.ts       # Validador de compras y niveles
    └── WaterSystem.ts         # Balance hídrico integral, captación y acuífero
```
