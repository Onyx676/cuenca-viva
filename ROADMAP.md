# 🗺️ Hoja de Ruta (Roadmap) - Simulador de Gestión Hídrica ("Cuenca Viva")

Este documento traza las fases de desarrollo del proyecto, hitos alcanzados y próximas características planificadas para el simulador educativo de gestión hídrica.

---

## 📍 Fase 1: MVP 0.1 - Núcleo de Simulación y Ciclo Anual (Completado ✅)
* [x] **Motor de Simulación Desacoplado**:
  - Semillas deterministas con Mulberry32 (`AULA-2026-001`) para reproducibilidad en clases.
  - Cadenas de Markov para transiciones climáticas (`VERY_DRY`, `DRY`, `NORMAL`, `WET`, `VERY_WET`).
  - Ciclos de El Niño / La Niña (ENSO) con modificadores de precipitación y nieve.
  - Modelo hidrológico: Lluvia (infiltración vs escorrentía), nieve acumulada y deshielo gradual/acelerado.
  - Dinámica de acuíferos con 4 estados de estrés (>70% saludable, 40-70% atención, 20-40% estrés, <20% crítico).
  - Balance de sectores: Población, Agricultura, Ganadería, Minería, Ecosistema (caudal ecológico) y Reserva Estratégica.
  - Retornos de agua y calidad hídrica (saneamiento urbano, dilución y circuito cerrado minero).
* [x] **Árbol de Mejoras en 6 Ramas**:
  - Agua y Reservas, Agricultura, Ciudad y Saneamiento, Minería, Ambiente y Monitoreo Climático.
* [x] **Eventos Condicionales**: Tormentas extremas, sequías severas, colapso de canales, contaminación y subsidios verdes.
* [x] **Interfaz Web Responsiva**: Deslizadores táctiles, informes anuales, informe final a 10 años y preguntas de reflexión pedagógica (Sección 50).

---

## 🎨 Fase 2: Ciclo Estacional, Eventos Interactivos y Gráficos Low-Poly (Completado ✅)
* [x] **Nuevo Game Loop Estacional (5 años x 4 estaciones = 20 turnos)**:
  - Invierno, Primavera, Verano y Otoño con hidrología diferenciada (nieve, deshielo, evaporación estival y recarga otoñal).
  - Cierre anual consolidado al finalizar Otoño con recaudación presupuestaria y fase de inversión.
* [x] **Eventos Interactivos con Decisiones (Dilemas A/B/C)**:
  - Opciones de respuesta con verificación de tecnologías y costos.
* [x] **Árbol de Mejoras Estandarizado a 3 Niveles en 6 Ramas**:
  - Habilitación de capacidades activas de mitigación.
* [x] **Ficha Contextual Flotante No Bloqueante en el Mapa**:
  - Información científica rigurosa y didáctica al tocar cualquier elemento del entorno.

---

## 🌊 Fase 2.5: Cuenca Viva v0.4 — Visual Feedback & Game Feel (Completado ✅)
* [x] **El Agua como Protagonista Visual**:
  - Río ensanchado (22–34 px) con oleaje y reflejos dinámicos.
  - 5 canales explícitos ramificados hacia Ciudad, Cultivos, Granja, Mina y Delta.
  - Partículas fluidas continuas cuyo ancho, velocidad y densidad responden a `sector.allocated`.
  - Canales de retorno visibles (Ciudad -> Saneamiento -> Río, recirculación minera).
  - Ciclo hidrológico visual: nubes con lluvia, deshielo nival, evaporación y percolación al acuífero.
* [x] **Diorama Educativo y Mejoras en el Mapa**:
  - Elementos agrandados (+40%), formas redondeadas amigables y sombras suaves 2.5D.
  - Representación directa de mejoras en el mapa (presa ampliada, aspersores de riego, planta depuradora, radar meteorológico).
* [x] **Progreso y Dinamismo de Juego**:
  - Tracker gráfico permanente de los 20 turnos (`A1` a `A5` con `❄️ 🌱 ☀️ 🍂`).
  - Desafíos estacionales contextuales con recompensas en dinero y confianza ciudadana.
  - Tarjeta ágil de feedback post-estación (notificación animada rápida).
  - Panel inferior de gestión compacto (-40% de altura) dando protagonismo al diorama.

---

## 🎓 Fase 2.8: Cuenca Viva v0.5 — UX, Sliders & Onboarding (Completado ✅)
* [x] **Sliders Horizontales con Feedback Visual Inmediato**:
  - Sustitución de botones repetitivos por controles deslizantes táctiles en tiempo real.
  - Actualización reactiva instantánea de los canales en Phaser durante el arrastre.
  - Indicadores visuales de porcentaje de cobertura y estado de satisfacción.
* [x] **Herramientas Didácticas de Reparto**:
  - Botón `[DISTRIBUCIÓN SUGERIDA]` y botón `[RESTABLECER]`.
  - Visualización honesta de Reserva como excedente natural vs Sobregasto de acuífero.
* [x] **Modo Tutorial Jugable ("Año 0")**:
  - 9 fases pedagógicas basadas en causa $\to$ decisión $\to$ consecuencia.
  - Decisiones de verano con consecuencias diferidas reales en otoño.
  - Cierre con primera obra construida y feedback inmediato.
  - Aislamiento total de semilla y datos respecto de la partida escolar de 5 años.
* [x] **Pantalla de Bienvenida y Configuración de Aula**:
  - Modal "¿Primera vez?" con arranque de tutorial o partida directa.
  - Selector de modo tutorial en aula (`Opcional`, `Obligatorio`, `Desactivado`).
* [x] **Documentación Técnica Rigurosa**:
  - `GAME_RULES.md` con las fórmulas matemáticas y lógicas del motor de simulación.

---

## 📈 Fase 3: Escenarios Avanzados y Datos Reales (Próxima)
* [ ] **Escenarios con Desafíos Específicos**:
  - Escenario "Glaciares en Retirada": disminución progresiva de reservas nivales interanuales.
  - Escenario "Transición Energética": incorporación de hidroelectricidad vs caudal ambiental.
  - Escenario "Boom Agroindustrial": gestión ante duplicación de superficie cultivada.
* [ ] **Integración de API de Datos Abiertos**:
  - Carga de series históricas de precipitación y caudales de cuencas reales de la región.

---

## 🎓 Fase 4: Suite para Docentes y Trabajo Colaborativo en el Aula
* [ ] **Panel del Docente (Teacher Dashboard)**:
  - Generación de código QR para ingreso instantáneo del curso con un clic.
  - Visualización comparativa de las cuencas de todos los alumnos en pantalla gigante al finalizar el año 10.
* [ ] **Exportación de Reportes**:
  - Descarga de resumen pedagógico en PDF con las respuestas de reflexión de cada alumno.
