# 📝 Registro de Cambios (Changelog)

Todas las modificaciones notables realizadas en el proyecto **Cuenca Viva** se documentan en este archivo.
El formato sigue las directrices de [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).

---

## [0.5.0] - 2026-09-19
### Añadido (UX, Sliders & Onboarding)
- **Sliders Horizontales con Feedback Visual Inmediato**:
  - Reemplazo de los controles repetitivos `[-]` y `[+]` por sliders continuos horizontales para los 5 sectores (`Ciudad`, `Cultivos`, `Granja`, `Mina`, `Río Vivo`).
  - Actualización en tiempo real durante el arrastre (`input`): el caudal en los canales de Phaser, las partículas de agua y los indicadores de cobertura reaccionan instantáneamente antes de resolver el turno.
  - Indicadores de cobertura en porcentaje con badges cromáticos (`cov-deficit` <70%, `cov-partial` 70-99%, `cov-100` 100%, `cov-over` >100%) y emojis dinámicos según el estado del sector.
  - Ajuste fino $\pm 1$ conservado mediante mini-botones laterales para precisión exacta.
- **Herramientas Didácticas de Reparto**:
  - Botón **[DISTRIBUCIÓN SUGERIDA]**: calcula un reparto de partida equilibrado (priorizando Ciudad hasta el 45% en sequía, Río Vivo caudal de supervivencia y sectores productivos de manera proporcional).
  - Botón **[RESTABLECER]**: revierte al instante la distribución al estado inicial del turno.
  - Visualización automática y fidedigna de la **Reserva**: el agua no asignada se calcula como excedente que entra directamente al embalse; si se asigna más de lo disponible, se advierte con badge rojo de sobregasto bombeado de pozos subterráneos.
- **Modo Tutorial Jugable ("Año 0")**:
  - 9 fases pedagógicas e interactivas basadas en causa $\to$ decisión $\to$ consecuencia:
    1. *Invierno*: acumulación nival en cordillera y concepto de tanque natural.
    2. *Primavera*: primer suministro a la Ciudad (deshielo y tanques urbanos).
    3. *Primavera*: caudal ecológico para preservar humedales y peces.
    4. *Primavera*: concepto de Reserva almacenada en el embalse.
    5. *Verano*: primer evento de ola de calor y mitigación gracias a la reserva previa.
    6. *Verano*: introducción a la agricultura y decisión de riego vs reserva.
    7. *Otoño*: consecuencia diferida real según la decisión de verano.
    8. *Otoño*: toma de decisiones sin solución perfecta (priorizar campo vs río).
    9. *Cierre Año 0*: primera obra de infraestructura visible (Riego Tecnificado o Estación Meteorológica) con impacto inmediato en métricas.
- **Pantalla de Bienvenida y Configuración de Aula**:
  - Modal interactivo inicial "¿Primera vez?" (`[JUGAR TUTORIAL GUIADO]` vs `[COMENZAR PARTIDA DIRECTA]`).
  - Selector de aula en el modal escolar: modo tutorial `Opcional`, `Obligatorio` o `Desactivado`.
  - Aislamiento estricto de semilla determinista: el tutorial del Año 0 no consume números pseudoaleatorios ni contamina el historial del Año 1 al 5.
- **Consejos Contextuales No Intrusivos (Toast Tips)**:
  - Notificaciones flotantes que aparecen una única vez al cruzar umbrales clave (Acuífero <60%, Calidad <60, primera obra construida).
- **Documentación Integral de Fórmulas**:
  - Creación de `GAME_RULES.md` con las fórmulas matemáticas exactas del motor hidrológico, prioridad de captación, curvas de demanda y balance económico.

---

## [0.4.0] - 2026-09-19
### Añadido (Visual Feedback & Game Feel)
- **El Agua como Protagonista Visual Absoluta**:
  - Ampliación del ancho del río principal a 22–34 px con reflejos y oleaje dinámico.
  - Trazado de 5 canales explícitos que bifurcan desde el embalse/río hacia Ciudad, Cultivos, Granja, Mina y Delta.
  - Sistema de partículas fluidas (gotas de agua animadas en desplazamiento continuo): el ancho de cauce, la cantidad y la velocidad de gotas son directamente proporcionales a la asignación real (`allocated`) de cada sector.
- **Visualización de Canales de Retorno y Ciclo Hídrico**:
  - Retorno urbano desde la ciudad pasando por la planta de tratamiento hacia el río.
  - Recirculación minera con tuberías circulares activas.
  - Infiltración vertical visible desde la superficie agrícola hacia el corte geológico del acuífero.
  - Deshielo nival bajando de las cumbres en primavera y evaporación sutil elevándose del embalse en verano.
- **Estética de Diorama Educativo**:
  - Elementos más grandes (+40% de escala), formas redondeadas suaves y sombras proyectadas tipo maqueta 2.5D.
  - Visualización directa de mejoras en el mapa: presa reforzada, aspersores de riego girando, planta de tratamiento expandida, torre meteorológica con veleta y bosques más frondosos.
- **Tracker Gráfico Permanente de 20 Turnos**:
  - Barra superior compacta con los 5 años y las 4 estaciones (❄️, 🌱, ☀️, 🍂) indicando turnos completados (`✓`), turno activo (`⭐`) y futuros (`○`).
- **Desafíos Estacionales Contextuales**:
  - 20 desafíos específicos (`seasonalGoals.json`) que orientan al jugador en cada estación con recompensas en fondos y confianza.
- **Tarjeta Ágil de Feedback Post-Estación**:
  - Notificación ágil y animada tras resolver la estación con métricas clave y evaluación rápida sin bloquear con modales densos.
- **Compactación del Panel de Gestión**:
  - Reducción del 40% en la altura del panel inferior para otorgar más del 75% del espacio en pantalla al diorama interactivo.

---

## [0.3.0] - 2026-09-19
### Añadido (Refactorización Estacional y Experiencia Educativa Completa)
- **Nuevo Game Loop Estacional**:
  - Estructura temporal de 5 años x 4 estaciones (Invierno ❄️, Primavera 🌱, Verano ☀️, Otoño 🍂) = 20 turnos jugables.
  - Curvas de demanda estacional específicas por sector (e.g. mayor demanda agrícola y evaporación en verano, menor en invierno; acumulación nival en invierno y deshielo en primavera).
  - Escena Low-Poly en Phaser reactiva a las 4 estaciones (nieve en cumbres en invierno, río crecido en primavera, sol brillante en verano y follaje ámbar en otoño).
- **Eventos Interactivos con Decisiones (Dilemas A/B/C)**:
  - Sistema de eventos con múltiples opciones de resolución, costos, consecuencias diferenciadas y comprobación de mejoras requeridas (e.g. compuertas preventivas, alerta temprana, subsidios).
- **Árbol de Mejoras Estandarizado a 3 Niveles**:
  - Las 6 ramas de mejoras (`upgrades.json`) ahora cuentan con 3 niveles progresivos con costos claros y capacidades activas.
- **Fase de Consolidación Anual y Presupuesto al Cierre de Otoño**:
  - Al terminar cada año (Otoño), pantalla de balance con ingresos generados por satisfacción urbana, agrícola, minera y bonos ambientales, otorgando el presupuesto para realizar obras antes del próximo invierno.
- **Ficha Contextual Flotante No Bloqueante**:
  - Al hacer clic en cualquier elemento del mapa (Presa, Acuífero, Cordillera, Río, Ciudad, Cultivos, Granja, Mina, Ecosistema), se abre un panel lateral contextual sin interrumpir el flujo del juego.
- **Claridad Científica y Pedagógica sobre el Acuífero**:
  - Explicación fidedigna de que el acuífero no es un lago o caverna subterránea abierta, sino agua alojada en diminutos poros y grietas de formaciones de roca y sedimentos, con recarga lenta por infiltración.

---

## [0.2.1] - 2026-09-19
### Corregido
- Solucionado el fallo de inicialización de Phaser donde `gameState` no se cargaba a tiempo en el ciclo de arranque de `BasinScene`, provocando que el lienzo permaneciera oscuro.

### Mejorado (Experiencia Educativa y Simplicidad)
- **Rediseño Completo de la Experiencia Infantil y Escolar**:
  - Reemplazo de jerga técnica (`hm³`, `ENSO`, términos densos) por el concepto visual e intuitivo de **"gotitas de agua" (💧)**.
  - Tarjetas de sectores con nombres claros (🏙️ Ciudad, 🌾 Cultivos, 🐄 Granja, ⛏️ Mina, 🐟 Río Vivo, 🛡️ Ahorro).
  - Botones grandes `[-]` y `[+]` táctiles para subir o bajar el agua fácilmente en notebooks, tablets y celulares.
  - Caritas y emojis reactivos en tiempo real (😊 contento / 😟 sediento, 🌽 verde / 🍂 marchito, 🐬 río con peces / ⚠️ río seco).
  - Barra de resumen didáctico con totalizador: *"Agua repartida: X / Y 💧 (Sobran Z 💧 para el embalse)"*.
  - Menú de obras y mejoras simplificado con descripciones directas y beneficios claros (*"Gasta menos agua y produce lo mismo"*).
  - Indicadores de Reservas Naturales en la esquina superior derecha (Montaña, Presa, Agua bajo tierra).

## [0.2.0] - 2026-09-19
### Añadido
- **Estética Low-Poly Simpática y Divertida**:
  - Rediseño completo de la escena de Phaser (`BasinScene.ts`) con sombreado plano facetado (*flat shaded low-poly*).
  - Montañas facetadas con caras iluminadas y en sombra, picos geométricos y cumbres nevadas dinámicas.
  - Bosques y pinos low-poly cónicos y facetados que reaccionan a la sequía o verdor de la cuenca.
  - Presa con muro poligonal escalonado, aliviadero y espuma/brillos de agua animados.
  - Casitas, edificios urbanos y escuela con techos a dos aguas, chimeneas y ventanas iluminadas.
  - Ganadería con vaquitas manchadas y ovejas poligonales adorables en los potreros.
  - Minería con cantera escalonada, camión tolva estilizado y conductos de recirculación hídrica.
  - Delta con juncos geométricos y aves voladoras en bandada cuando se respeta el caudal ambiental.
  - Nubes poligonales infladas y sol geométrico facetado.
- Documentos de gestión continua: `ROADMAP.md` y `CHANGELOG.md`.

---

## [0.1.0] - 2026-09-19
### Añadido
- **Motor de Simulación Hidrológica**:
  - Implementación de balance hídrico anual (`WaterSystem.ts`): lluvia, nieve, deshielo, río, embalse y acuífero subterráneo.
  - Soporte de semillas deterministas (`RandomSystem.ts`) para reproducibilidad en aulas (e.g. `AULA-2026-001`).
  - Matriz de Markov para transiciones climáticas y ciclos ENSO (`ClimateSystem.ts`).
  - Lógica de retornos de uso y saneamiento para cálculo de calidad de agua (`waterQuality`).
  - Estrés del acuífero en 4 niveles (>70% saludable, 40-70% atención, 20-40% estrés, <20% crítico).
- **Árbol de Mejoras en 6 Ramas (`upgrades.json`)**:
  - Agua y Reservas, Agricultura, Ciudad y Saneamiento, Minería, Ambiente y Monitoreo Climático.
- **Eventos Condicionales (`events.json`)**:
  - 10+ eventos climáticos y humanos con posibilidad de mitigación tecnológica.
- **Interfaz Web Responsiva**:
  - Deslizadores en tiempo real con totalizador y alertas de sobreexplotación.
  - Modales para mejoras, informes anuales e informe final a 10 años con preguntas de reflexión didáctica y confeti.
  - Escenarios configurables (`cuenca_central`, `cuenca_arida`, `cuenca_abundante`).
- **Verificación Automatizada**:
  - Scripts de test unitario y simulación completa de 10 años en TypeScript.
