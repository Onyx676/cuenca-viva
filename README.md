# Simulador Educativo de Gestión Hídrica ("Cuenca Viva")

Un videojuego educativo web interactivo diseñado para enseñar los principios de la gestión integrada de recursos hídricos en cuencas hidrográficas a estudiantes de escuelas y público general.

La entrega se presenta como **entorno interactivo educativo conceptual**. El caso real de referencia San Juan–Tulum se explica en Aula, separado de los escenarios genéricos. El modelo 2.5 incorpora infiltración río→acuífero con una tasa didáctica explícita, sin calibración ni validación experta concluida. Ver [diagnóstico y plan de hackathon](artifacts/hackathon-readiness/DIAGNOSIS.md), [sensibilidad de la recarga fluvial](artifacts/hackathon-readiness/river-recharge/REVIEW.md), [evidencia de tecnologías](artifacts/hackathon-readiness/technology/REVIEW.md) y [piloto escolar](artifacts/hackathon-readiness/school-protocol.md).

---

## 🌊 Principios Pedagógicos y Objetivos de Aprendizaje

El simulador busca superar visiones simplistas (como "minería mala" o "agricultura buena"), demostrando que:
1. **La oferta de agua cambia año a año**: La lluvia, la acumulación de nieve cordillerana y la velocidad de deshielo definen la disponibilidad real.
2. **Existen múltiples usuarios legítimos**: Ciudad, cultivos, ganadería y minería comparten la cuenca; Río Vivo representa continuidad y caudal ambiental.
3. **El agua subterránea no es infinita**: El acuífero se recarga y se agota con el bombeo; el juego representa niveles de estrés y efectos ambientales/sociales. No calcula costos de bombeo ni subsidencia.
4. **Cantidad vs. Calidad**: No basta con que haya caudal; el saneamiento urbano y el tratamiento de efluentes determinan si el agua devuelta puede ser aprovechada río abajo.
5. **Inversión y Resiliencia**: Riego eficiente, mantenimiento de canales, saneamiento, recarga y recirculación compiten por presupuesto. Infiltrar también puede ayudar a recargar reservas.
6. **Previsión y Reserva Estratégica**: Guardar agua en embalses y acuíferos en años húmedos es la clave para sortear las sequías severas.

---

## 🚀 Tecnologías y Arquitectura

* **Motor Gráfico**: [Phaser 3](https://phaser.io/) (Renderizado Canvas / WebGL del paisaje pseudoisométrico animado de la cuenca).
* **Entorno Web y Empaquetador**: [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/).
* **UI**: HTML5 + CSS, mapa como interfaz principal y un slider contextual por sector seleccionado. Reservas desplegables y vista previa de embalse, acuífero y bombeo.
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
2. Los estudiantes nuevos inician con el **Modo Tutorial (Año 0)** en cuatro pasos de práctica para experimentar cómo fluye el agua y las consecuencias de sus decisiones.
3. Todos juegan los **5 años (20 estaciones: Invierno, Primavera, Verano, Otoño)**. Con la misma configuración comparten clima y sorteos externos; sus decisiones y obras pueden habilitar eventos distintos.
4. Desde las compuertas del mapa y sus **sliders contextuales**, reparten agua observando caudales, cobertura y reservas al cierre previsto.
5. Al finalizar cada año (Otoño), reciben el presupuesto anual según la satisfacción de los sectores y deciden en qué obras invertir antes del invierno.
6. Al finalizar el Año 5, se comparan las pantallas del **Informe Final**:
   - ¿Quién logró abastecer a todos los sectores sin secar el acuífero?
   - ¿Cómo influyeron las inversiones en riego tecnificado y saneamiento en la salud ecológica del río y la confianza ciudadana?

---

## 📖 Reglas y Fórmulas de Simulación

Para revisar una partida, **Guardar diagnóstico JSON** está disponible en Aula, Ayuda y el informe final. Las partidas nuevas también guardan una copia local y ofrecen **Continuar partida** al volver a abrir el juego. La recuperación reconstruye las decisiones y verifica el estado completo con el modelo actual; no acepta versiones o registros incompatibles. La copia depende del mismo navegador y origen (host y puerto), y no reemplaza un diagnóstico descargado. El tutorial queda separado. No se recuperan retroactivamente sesiones anteriores a esta función ni se reconstruyen compras antiguas o intenciones a partir de balances.

El modelo 2.4 mantiene los pedidos de las compuertas al cambiar de estación: cambian las necesidades, no la decisión del jugador. **Distribución Sugerida** sigue siendo una acción explícita. Río Vivo cuenta el agua que sigue por el río y los retornos, además del aporte adicional al humedal. El Heraldo aparece primero; desde **Ver resumen** se revisan las consecuencias y se avanza. Mapa y controles del fondo quedan bloqueados durante la resolución y los modales. **Consejo** abre la ayuda de reparto cuando se la necesita.

Los eventos muestran intención, costos y requisitos antes de elegir, y consecuencias reales después. En fugas de red podés reparar el incidente o construir una renovación permanente; la recepción comunitaria tiene variación seeded según contexto, sin cambiar el sorteo climático ni inventar agua.

Durante desarrollo, HMR está desactivado para que una edición no recargue una partida en curso. Recargá manualmente para probar cambios nuevos; la bienvenida ofrece continuar desde la copia compatible. El informe distingue cobertura media de todas las estaciones de indicadores al cierre; el Heraldo informa hechos resueltos y comentarios editoriales de los personajes.

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
│   ├── tutorial.json          # Escenario controlado del Año 0 (4 fases)
│   └── upgrades.json          # Diez obras en seis ramas, con niveles de beneficio implementado
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
│   └── TutorialManager.ts     # Máquina de estados del tutorial (Año 0, 4 fases)
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

## Revisión del modelo y validación

El modelo actual es **v2.3**. Granja aporta hasta $10 anuales según su cobertura media, antes del piso presupuestario $20, con el aporte visible en el cierre anual. Valle Central abastece actividades de menor escala (bases económicas 16/23/7/13 frente a 25/35/10/20); representa menos población/superficie/actividad, sin alterar necesidades de la misma actividad ni crear agua. Hidrología y caudal ecológico permanecen iguales. La escala introductoria es conceptual, sin validación regional; conserva déficits estacionales y no garantiza recuperación ni reservas finales. El reparto introductorio se aplica desde el arranque. El registro antes/después, candidatos y semillas nuevas está en `artifacts/intro-balance/report.md`.

Para comparar en aula usar semilla, escenario, versión y acciones iguales. El clima anterior se conserva, pero las coberturas y eventos condicionados pueden cambiar con la escala. Las condiciones sociales pueden habilitar conflictos distintos; monitoreo/inversiones no desplazan clima ni sorteos externos futuros. No comparar resultados centrales v2 y v2.1 como partidas de igual configuración.

- `AUDIT.md`: diagnóstico A–G y prioridades.
- `GAME_RULES.md`: flujo de agua, parámetros efectivos, balance y simplificaciones.
- `tests/simulation.test.cjs`: regresiones del motor, conservación y partidas completas.

```sh
npm test
npm run build
npx --no-install tsc --noEmit
```

El Año 0 usa ejercicios preparados y reinicia la partida al llegar al Año 1. Todavía faltan ejercicios completos de acuífero/calidad. La documentación conceptual no constituye validación científica regional ni evidencia experimental de aprendizaje.


Desde v2.2, el Premio al Reparto Compartido comprueba cobertura básica en la estación anterior y tiene un intervalo de cuatro turnos. El catálogo muestra nivel siguiente, precio y demanda real antes/después; las compras preservan el reparto. No cambian demandas, precios, hidrología ni sugerencia. La auditoría económica y sus pérdidas observadas (incluido el smoke árido) está en `artifacts/events-economy-review/report.md`; las reglas y limitaciones en GAME_RULES.md.
