# 🗺️ Hoja de Ruta (Roadmap) - Simulador de Gestión Hídrica ("Cuenca Viva")

Este documento traza las fases de desarrollo del proyecto, hitos alcanzados y próximas características planificadas para el simulador educativo de gestión hídrica.

## Estado vigente — 8 de octubre de 2026

Las secciones siguientes conservan el historial; sus menciones a diez años, nueve fases de tutorial o auditoría cerrada no describen el producto actual. El juego tiene cinco años, veinte turnos y cuatro pasos de práctica. Esta actualización reemplaza las prioridades antiguas que pedían mantener la dificultad sin estudiar la escala de demanda.

- Revisión reproducible de 108 trayectorias completada: `artifacts/balance-review/report.md`.
- Escenario central introductorio con menor actividad abastecida, sin modificar aportes ni coeficientes hidrológicos; arranque con margen y comparación de candidatos: `artifacts/intro-balance/report.md`.
- Sugerencia central y feedback revisados: recuperación real, reparto productivo y logros parciales con costos explícitos. Los otros escenarios conservan su política anterior: `artifacts/suggestion-review/report.md`.
- Eventos, reconocimientos y catálogo de próximo nivel revisados y aprobados (modelo 2.2): `artifacts/events-economy-review/report.md`. Build, typecheck, 37 tests y prueba UI integrada aprobados; servidor local disponible. El escenario árido conserva dificultad y recibe menos recompensas: requiere prueba humana.
- Playtest humano revisado: pedidos completos por debajo de demanda, confianza final distinta de cobertura histórica y movimientos extraordinarios poco visibles. Diagnóstico conservado en `artifacts/player-review/findings.md`.
- Heraldo con hechos y voces de personajes, avisos de reparto, períodos y reservas del informe aclarados, exportación JSON con decisiones integrados y revisados: `artifacts/player-review/night-work.md`.
- Modelo 2.3: aporte anual visible de Granja, hasta $10 según cobertura; menor candidato positivo ensayado, sin cambiar agua, demandas, confianza ni PRNG. Revisión técnica y visual aprobadas: `artifacts/incentive-review/integration/REPORT.md`.
- Segundo playtest parcial analizado (7 estaciones): todos los pedidos entregados, necesidades productivas incompletas y reservas en descenso pese a metas cumplidas. Diario ampliado, humor en titulares con variantes, flujo Heraldo → resumen centrado → avance, y consejos sólo a pedido; revisión aprobada en `artifacts/player-review/readable-ui-review.md`. Simulación/modelo 2.3 sin cambios.
- Modelo vigente 2.4: pedidos de compuertas conservados entre estaciones; bloqueo del mapa y controles del fondo durante resolución y modales; pista detallada según riesgo real; ampliación del embalse contextualizada y saneamiento separado de la ciudad. Sin cambios de coeficientes hidrológicos.
- Recuperación local integrada: replay verificado del registro antes de continuar, sin mezclar tutorial ni sobrescribir una copia incompatible al arrancar. Pruebas de las 20 estaciones de los tres escenarios y recargas reales de reparto, resolución y evento pendiente; límites y evidencia en `artifacts/session-recovery/REVIEW.md`.
- Eventos sin resultados anticipados y con consecuencias reales después de resolver. Fugas de red incorpora recepción social contextual seeded y alternativa de renovación permanente al precio real del catálogo. Integración revisada; efectos de agua existentes conservados. Protocolo y límites: `artifacts/event-decisions/REVIEW.md`.
- Próxima validación de producto: nuevo playtest humano de claridad y diversión. Los tests y comparaciones no sustituyen esa prueba ni calibración hidrológica regional.

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
* [ ] **P1 — Rediseñar el recorrido visual del agua en el mapa**: hacer legibles cabecera, tomas, embalse, retornos y Río Vivo sin cambiar el modelo hidrológico. Abordar después de feedback estacional, Heraldo y pronóstico.
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

---

## 🧭 Prioridad vigente de producto — Octubre 2026

Esta sección reemplaza prioridades antiguas que contradigan el playtesting actual. Mantener el motor v2 sin cambios de balance hasta contar con evidencia.

### Dirección confirmada

- El mapa es la interfaz principal: operar una red visible, no completar sliders ni leer un dashboard.
- La cadena que debe entenderse sin un panel numérico es: montaña/aportes → río → embalse y tomas → sectores → retornos → Río Vivo; el acuífero funciona como respaldo subterráneo.
- Las compuertas conservan la lógica numérica actual, pero su UI debe distinguir solicitud/apertura, suministro real y cobertura. Río Vivo representa caudal que sigue aguas abajo, no un quinto consumidor.
- El flujo visual usa datos reales del balance. No representar agua inexistente ni hacer pasar por el embalse agua que el modelo capta antes.
- La dificultad puede mantenerse; el objetivo es tensión legible, recuperación posible y reconocimiento de buenas decisiones.

### Trabajo ya encaminado

- Flujo visible de agua: entrada al embalse, captación directa, río aguas abajo/Río Vivo, retornos por calidad y nivel/margen del embalse, gobernados por el preview o balance resuelto.
- Pronóstico pre-estacional visible antes de operar. Pendiente simplificar lenguaje técnico y explicar riesgo de crecida como consecuencia observable.
- Cierre de estación: replay hídrico breve → Heraldo → resumen → próxima estación con pronóstico.
- Obras persistentes y visibles en el mapa; compras múltiples se presentan al cerrar el catálogo.
- Informe final: primera vista breve con hitos reales; detalles y preguntas de aula opcionales.
- Tutorial reducido de nueve fases a cuatro acciones: seguir agua, abrir Ciudad, proteger caudal aguas abajo y cerrar práctica.

### P1 pendiente de validar o implementar

1. **Lectura de compuertas y Río Vivo.** Explicar en el gesto qué se solicita, qué llega realmente y qué se sacrifica. Cuando aporte ecológico pedido es cero pero existe caudal aguas abajo, mostrar que el agua no se perdió: siguió por el río y/o se sumó a retornos.
2. **Auditoría embalse–acuífero (cerrada, sin bug confirmado).** El reparto automático puede agotar el embalse por abastecer demanda; el acuífero recibe recarga natural inmediata en esta abstracción. Las asignaciones vuelven a calcularse cada estación. No cambiar coeficientes todavía: primero mostrar por turno entradas, retiros, evaporación, recarga y bombeo.
3. **Resumen hídrico estacional explicable.** Tras la auditoría, exponer entradas/salidas de embalse y acuífero en un bloque breve y desplegable, con una frase causal basada en el balance real.
4. **Valor visible de mejoras.** Mostrar en ese resumen sólo contribuciones atribuibles: cantidad cuando el motor permite calcularla; si no, indicar que la obra estuvo activa sin adjudicarle ahorro inventado.
5. **Heraldo del Valle 2.** Diario infantil, cálido y con humor simple/sarcástico sin humillar ni moralizar. Debe tener 15–20 variantes por tipo de situación y breves que aparezcan también en estaciones normales. Quitar jerga como “índice del juego”. El humor se dirige a la situación, no al niño; aun ante crisis debe dejar una pista útil para la próxima decisión.
6. **Lenguaje del pronóstico.** Reemplazar “fiabilidad simulada/sin calibración meteorológica real” por lenguaje claro: el pronóstico puede fallar y monitoreo mejora las próximas previsiones.

### Fuera de alcance por ahora

- Hidroelectricidad/energía, mapas múltiples, nuevas monedas, XP y sistemas grandes.
- Agregar mejoras nuevas antes de poder ver y comprender las existentes.
- Cambiar fórmulas, demandas, economía o PRNG para aliviar frustración sin auditoría.


### Revisión posterior al playtest: Granja — modelo2.3

- [x] Diagnóstico reproducible en artifacts/incentive-review: omisión de ingreso/confianza directos; costo de oportunidad anual e incentivos indirectos separados. Quitar Granja no fue dominante por caja final en los seis casos ensayados.
- [x] Aprobado coeficiente anual10 (menor positivo prefijado0/10/15), por coherencia y recompensa explícita de la actividad abastecida. Media de cuatro estaciones registrada en YearResult y visible en cierre anual, con caudal ecológico correctamente etiquetado y piso20 conciliado. Hidrología, confianza, demandas, precios/eventos/metas y PRNG conservados.
- [ ] QA visual integrada de cierre2.3 por coordinador y nuevo playtest humano. No se afirma mejora medida de diversión/aprendizaje ni balance regional. Más caja puede cambiar compras/elecciones fuera del calendario auditado.
# Prioridad de entrega educativa — revisión 2026-10-08

Diagnóstico y aceptación verificable en `artifacts/hackathon-readiness/DIAGNOSIS.md`. Implementados: ficha territorial San Juan–Tulum y límites, origen de recargas, gotas conceptuales, zoom y comparación pura de próximo nivel en Obras con dos políticas de pedidos. Fórmulas/coeficientes y PRNG del juego preservados.

Modelo 2.5: causalidad río→acuífero implementada como transferencia interna explícita, con sensibilidad 0/10/20/30% y tasa didáctica 10%, sin calibración regional. Sigue pendiente la validación externa de forma, secuencia y simplificaciones con alcance/versión explícitos (`scientific-validation.md`); piloto de aprendizaje y equipos/LAN (`school-protocol.md`). Bibliografía, conservación y tests no acreditan esos requisitos. Más escenarios/mecánicas/PWA pueden esperar. No anunciar gemelo calibrado ni cumplimiento científico total.

