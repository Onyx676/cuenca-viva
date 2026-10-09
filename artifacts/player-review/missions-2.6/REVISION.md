# Misiones contextuales 2.6 — revisión para integración

Nuevas partidas de Valle Central conservan el primer invierno y cambian las misiones desde primavera. Las partidas 2.5 recuperadas conservan exactamente las misiones y evaluación anteriores. Árida y Lagos mantienen sus objetivos anteriores también en nuevas partidas: esta iteración no endurece esos escenarios.

## Mecánica exacta

Un PRNG exclusivo de misiones, derivado de semilla/escenario/turno, elige el foco Cultivos, Granja o Mina y una preferencia entre acuífero y embalse. No consume azar meteorológico ni de eventos. El objetivo se selecciona una sola vez al preparar el turno, después de eventos pasivos y antes de decisiones interactivas y compras; queda congelado en el estado, con gotas absolutas. Comprar capacidad o mover compuertas no lo aumenta ni vuelve a sortearlo.

Las misiones mixtas exigen Ciudad ≥85%, foco ≥80%, los demás usos productivos ≥70% y caudal ecológico ≥80%, junto a una reserva al cierre. No permiten cumplir abandonando otros sectores. Las coberturas son necesidades realmente abastecidas, no porcentaje de entrega de pedidos menores que la necesidad.

Se comprueban repartos testigo sin mutar el juego: Ciudad al 85/100%, productivos al 70/80/100% con foco al menos 80%; aporte adicional al humedal de cero a su demanda, evaluando el caudal resultante. Los testigos sólo eligen un objetivo comprobado: no son un reparto aplicado automáticamente ni un optimizador exhaustivo.

La referencia de acuífero preserva su volumen inicial si está al menos al 40% de capacidad; por debajo busca ganar hasta cinco gotas y exige al menos una ganancia real. El embalse usa la referencia de 25 gotas del consejo existente; debajo busca recuperar hasta cinco, exigiendo al menos una. Son metas de diseño educativo, no tasas ni niveles científicos. La meta se limita al máximo alcanzado por los testigos. Si se puede superar el resultado de pedir 100% a todos, se exige al menos una gota más que esa receta, prefiriendo la reserva que realmente obliga a cambiar el reparto. En estaciones abundantes puede haber una misión tranquila sin esa restricción vinculante.

Si ninguna recuperación/preservación pasa estos testigos, la misión dice explícitamente que es de cobertura, sin una reserva cero ni una recuperación ficticia. Mantiene los mínimos anteriores. Si ni esos mínimos pasan los testigos, el consejo y resumen informan la limitación del conjunto comprobado; no afirman imposibilidad matemática ni prometen una inversión asequible. Una decisión de evento posterior puede sacrificar la misión congelada: el objetivo no se ajusta para ocultar la consecuencia.

Los montos de premios de cada turno permanecen iguales, pero cambia cuándo se ganan. Esto cambia la financiación posterior y el calendario de obras. No se modificaron agua, demandas, costes de obras, ingresos anuales, salud ni calidad. La sugerencia existente sigue siendo un punto de partida voluntario y ahora se explicita que no garantiza cumplir la misión.

## Versionado y recuperación

El modelo de nuevas partidas es 2.6 por el cambio de reglas/recompensas. `getModelVersion()` devuelve 2.5 para partidas antiguas y se utiliza en exportación, impresión y recuperación. Recovery acepta 2.5 o 2.6, valida reglas en metadatos/estado inicial, reproduce acciones con el modo correcto y verifica el snapshot completo. No migra silenciosamente recompensas anteriores. El evaluador histórico 2.5 permanece separado, incluidas sus limitaciones; los tests históricos que comparan estados exactos usan el constructor `legacy` explícito.

En 2.6 Central, previews usan reservas y coberturas previstas; un eventual requisito «sin déficit» comprueba necesidades reales de los cinco frentes. La condición antigua `SURPLUS_WATER` no se selecciona en la nueva campaña: el presupuesto de reparto incluye extracción potencial, por lo que no demuestra agua natural ni sostenibilidad.

## Validación ejecutada y límites

`npm test`: 63 tests, incluidos cuatro nuevos de variedad desde primavera, congelación ante evento/sliders/compra real, recompensa única, coberturas/retornos/reservas previstas y replay de 20 turnos en tres escenarios para ambas versiones. Compra de ampliación comprobada exitosa, capacidad aumentada y misión intacta. Alterar las reglas declaradas en el paquete de recuperación se rechaza. El clima y su PRNG coinciden entre modos con las mismas decisiones sin eventos.

`npm run build` y `npx --no-install tsc --noEmit` pasaron; persiste el aviso conocido de tamaño del bundle.

Benchmark: `node artifacts/player-review/missions-2.6/benchmark.cjs`. 54 configuraciones nuevas (tres escenarios, tres semillas, tres políticas, eventos activados/desactivados) más 36 comparaciones legacy. Cada una se repite; 3.600 resoluciones verifican determinismo y conservación. Las 36 partidas legacy también reproducen exactamente las métricas de la auditoría 2.5 previa. `summary.json` incluye versiones reales y hashes de fuentes, incluidas las reglas de misiones. El detalle voluminoso `results.json` queda local.

Las compras usan la misma prioridad fija de la auditoría; el solver de misión prueba repartos tras evento/obras y maximiza cobertura entre los que cumplen, sin anticipar años futuros. Con eventos se elige la primera opción asequible; no es replay exacto de la partida humana ni un experimento con idénticos eventos entre estrategias.

| Central / semilla | Receta 100: premios 2.5 → 2.6 | Mixtas / 19 nuevas | Mixtas que receta100 no cumple tras compras | Solver: premios / acuífero final / mínimo |
|---|---:|---:|---:|---:|
| AULA-2026-001 | 14 → 6 | 12 | 12 | 19/20 · 81 · 40 |
| AULA-2026-260 | 14 → 9 | 10 | 8 | 20/20 · 17 · 8 |
| SEQUIA-2026 | 13 → 6 | 8 | 7 | 17/20 · 0 · 0 |

En 001, solver conserva 81 y mínima40 frente a receta100 final58/mínima23; receta85 logra 12 premios y final90/mínima45. La diferencia se debe a decisiones y financiación, no a nuevas entradas de agua. En 260, el solver cumple todas las misiones pero termina con acuífero17: **cumplir misiones todavía no demuestra gestión sostenible**. Se necesita evaluación de campaña y mejora de salud compuesta; no se presenta la dificultad como resuelta.

Casos que el solver comprobado no cumple: 001 turno12 y SEQUIA turno11 después de la opción de evento elegida; SEQUIA turnos19/20 con reservas agotadas, donde los repartos testigo de cobertura no alcanzan. No se redujeron pisos para premiar ese agotamiento, ni se presentó una compra inexistente como salida garantizada. La selección de misiones mixtas por ruta puede variar con las obras/reservas ganadas: la meta de un turno sí permanece fija.

Pendiente visual: el proveedor de navegador devolvió inventario de apps/browsers vacío durante la QA independiente. No se verificó visualmente el banner de primavera ni el ajuste final de posición del editor. La prueba con estudiantes, valoración humana de diversión y validación científica externa siguen pendientes.
