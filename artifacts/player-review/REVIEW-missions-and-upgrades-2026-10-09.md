# Revisión acotada: misiones, ampliación y sensores

Fecha: 2026-10-09. Motor actual 2.6/contextual-v1. Auditoría de código y sondas cortas; sin modificar reglas ni simulación. El estado exacto de la captura no está disponible: no se presume que su semilla sea AULA-2026-001 ni se afirma haber reproducido su reserva objetivo de 53 gotas.

## Qué explica la experiencia

**La misión puede convertirse en ajustar las compuertas hasta una cifra.** `src/simulation/MissionSystem.ts:25–38` compara pedir toda la necesidad de los cuatro usos, sin aporte ecológico adicional, contra testigos con Ciudad 85%, foco 80%, otros productos 70% y río 80%. En `:55–65` fija la reserva como `min(maxFeasible, max(wanted, fullReserve + 1))` y prefiere una reserva que esa receta del 100% no alcance. Cuando el máximo permite esa cifra, basta preservar una gota adicional respecto a la receta completa. El evaluador acepta igualdad con el objetivo (`src/models/SeasonalGoal.ts:49–56`): no hay error de comparación, pero tampoco una condición de sostenibilidad posterior.

La vista previa calcula el balance real de la estación con clima, lluvia, deshielo y demandas actuales (`SimulationEngine.ts:561–614`); la UI muestra las reservas exactas «Ahora/Quedaría» (`src/main.ts:1058–1082`). Los mínimos de cobertura son comunes a estas misiones, aunque cambien foco y reserva. La combinación favorece encontrar el umbral mediante sliders. Ocultar esa información útil no resolvería la poca profundidad de la decisión.

**Los sensores aportan información futura, pero su utilidad práctica puede ser pequeña.** `ClimateSystem.ts:51–90` eleva la probabilidad de acertar la categoría del próximo clima de 40% a 65/85/95%; no modifica el clima ni predice cantidades concretas de agua o demanda. El pronóstico se emite al entrar en la estación (`SimulationEngine.ts:443–449`). Comprar sensores después no recalcula la pista emitida (`:524–554`); la siguiente emisión aprovecha el nuevo nivel. La UI ya avisa este desfase (`src/main.ts:2662–2695`).

El jugador puede usar esa pista para guardar agua hoy ante un probable período seco. Sin embargo, conoce exactamente el balance actual y puede comprar obras con efecto inmediato cuando el siguiente clima ya se conoce. La misión de una sola estación no evalúa ese uso anticipado. Por tanto, no es correcto afirmar que los sensores no hacen nada; sí es defendible que esta combinación reduce el incentivo para comprarlos o actuar según la pista.

**Ampliar capacidad no agrega agua.** `WaterSystem.ts:112–118` limita almacenamiento y derrame por capacidad; la extracción depende del volumen almacenado, no de la capacidad vacía. Si nunca existe desborde, puede faltar el beneficio principal de almacenamiento. Matiz: la evaporación usa `volumen/capacidad` (`:92–94`, también `:38–45` en presupuesto), por lo que ampliar puede reducir evaporación incluso sin derrames, sujeto al redondeo. No se debe describir como inútil en términos absolutos.

La meta contextual del embalse se fija en gotas, no como porcentaje de capacidad (`MissionSystem.ts:55–62`), y no cambia al comprar ampliación. No existe la supuesta trampa de subir la meta actual al ampliar. La generación de futuras metas sí puede cambiar indirectamente cuando cambian el balance y las reservas. Las metas legadas porcentuales son otro caso y no deben confundirse con la misión contextual de primavera.

## Comprobaciones acotadas ejecutadas

Sondas Node con el motor real, sin archivos nuevos de ejecución ni edición de estado. Para Central, semillas AULA-2026-001 y AULA-2026-260, se resolvió invierno con reparto inicial o con pedidos completos de cuatro usos y aporte ecológico adicional cero; después se entró en primavera. Se compró sensor con fondos disponibles, se eligió la primera opción permitida del evento pendiente y se probaron pedidos redondeados de los mínimos de cobertura, aumentando aporte ecológico sólo si hacía falta.

En 001 la receta mínima cumplió exactamente los objetivos de embalse 56 y 46 gotas, según el reparto previo. En 260 cumplió objetivos 51 y 41, terminando con 60 y 50 tras su evento. Son ejemplos del mecanismo, no reproducción de la captura. La compra real de sensor fue exitosa y dejó el pronóstico emitido y el estado de azar de gameplay sin cambios.

Sonda adicional, 001 con reparto inicial: ampliar de 100 a 125 fue una compra exitosa. En invierno y primavera, derrames 0→0, evaporación 1→1, reserva final 38→38 y 75→75, respectivamente; la meta quedó idéntica. Este ejemplo confirma ausencia de beneficio inmediato en esas dos decisiones, no ausencia de beneficio durante toda la campaña ni en otras semillas.

No se ejecutaron build ni suite completa: no hubo cambios de código. No hay validación científica externa nueva ni prueba de diversión con estudiantes.

## Próxima iteración propuesta y criterios verificables

1. **Evaluar decisiones antes de cambiar números.** Comparar políticas explícitas «cubrir 100%» y «conservar reserva sin abandonar sectores», con financiación real, eventos definidos y las mismas semillas, incluyendo clima extremo. Medir cantidad de repartos válidos, diferencias de cobertura/reservas/bombeo y si hay alternativas con consecuencias distintas. No endurecer mínimos arbitrariamente ni declarar resuelta la dificultad por exigir una gota más.
2. **Dar un motivo de anticipación comprobable.** Explorar una condición de reserva que conecte decisiones entre estaciones, conservando el balance y las obras. Debe poder distinguir una estrategia conservadora de ajustar el umbral actual, sin castigo constante ni objetivos imposibles. Medir cumplimiento y reservas finales de campaña; cumplir misiones no debe confundirse con gestión sostenible. La pista meteorológica sólo ayuda si existe una decisión que deba anticiparse: no prometer que un cambio de texto la vuelve necesaria.
3. **Hacer visible cuándo conviene la ampliación.** Revisar historial de derrames por semilla y estrategia; comparar con/sin capacidad bajo las mismas acciones, separando derrame evitado, evaporación y almacenamiento. Una capacidad vacía no es agua disponible. No recomendar obligatoriamente una obra que no aporta beneficio en esa situación.
4. **Medir utilidad de los sensores con anticipación real.** Mantener clara la fecha de emisión; comparar una política que actúa según la pista con una que espera al clima observado. Medir error de pista, compras, cobertura y reservas con/sin sensores; no inventar ahorros ni beneficio garantizado.

Cambiar selección, umbrales, condiciones o recompensas exige reglas/versionado nuevos y conservar replay 2.6; no editar contextual-v1 silenciosamente. Aclaraciones visuales y de redacción que no cambien decisiones, estado o llamadas al PRNG pueden mantenerse como mejoras de presentación. Esta revisión deja las decisiones de alcance al coordinador.
