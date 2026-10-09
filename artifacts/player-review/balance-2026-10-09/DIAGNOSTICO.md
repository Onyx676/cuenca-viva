# Dificultad y lectura de éxito — 9 de octubre de 2026

El reclamo del jugador está respaldado: en Valle Central una receta fija de compras y pedidos completos puede dejar casi todos los sectores abastecidos y los indicadores generales al máximo, aunque el acuífero se vacíe. Las obras aportan beneficios reales; debilitarlas de forma general o reducir el agua arbitrariamente no está justificado por esta auditoría. Los otros escenarios ya pueden resultar muy difíciles.

## Partida recibida

Fuente: `C:/Users/colon/Downloads/cuenca-viva-mis-resultados (3).html`, modelo 2.5, Valle Central, AULA-2026-001. El HTML contiene resultados y decisiones ante eventos, pero no la cronología de compras ni el estado completo necesario para reproducirla exactamente.

18/20 estaciones cubrieron los cinco frentes; 19/20 todos los usos productivos y urbanos. Embalse 65 → 4 (capacidad final 190), acuífero 85 → 35 y mínimo 13 en T13. Bombeo 243 frente a recarga 201 y desbordes 8: 85 + 201 − 243 − 8 = 35. El embalse perdió 61 gotas. Presupuesto anual neto acumulado $600, final $230. Confianza y salud al 100% no describen esta pérdida de reservas.

No hubo derrames: ampliar almacenamiento no incorporó agua. Los porcentajes medios redondeados al 100% también ocultan la brecha inicial. Estas reservas no demuestran disponibilidad sostenible para otros cinco años.

## Experimento reproducible

Ejecutar `node artifacts/player-review/balance-2026-10-09/benchmark.cjs`. `summary.json` contiene métricas de las 72 configuraciones y hashes SHA256 de las fuentes. `results.json`, artefacto local detallado, permite inspeccionar turnos, compras y eventos; no es necesario versionarlo.

Tres escenarios × semillas AULA-2026-001, AULA-2026-260 y SEQUIA-2026 × cuatro políticas × eventos activados/desactivados. La cadena SEQUIA-2026 es sólo una semilla: no obliga a que haya sequía. Cada configuración se ejecutó dos veces y produjo el mismo historial: 2.880 resoluciones con comprobaciones de masa, nieve, lluvia, consumo/retorno, vista previa sin mutación y resolución repetida sin cobrar otra vez. Cada partida cerró 20 turnos y cinco años.

Políticas explícitas:

- `no_discretionary_works`: pedidos iguales a necesidades de Ciudad, Cultivos, Granja y Mina. Aporte adicional al humedal cero; esto NO equivale a caudal ecológico cero. Sin compras voluntarias.
- `works_full_requests`: mismos pedidos, compras asequibles antes de repartir. En cada pasada se intenta un nivel por obra en orden fijo: recirculación minera, red urbana, mantenimiento, riego, saneamiento, captación, recarga, restauración; repetir hasta que ninguna compra sea posible. No se compra embalse ni sensores. Es una receta fija, no optimizada según pronóstico.
- `works_reserve_guard`: mismas compras; conserva el pedido de Ciudad y reduce gradualmente los tres pedidos productivos buscando acuífero ≥40 y embalse ≥10 al cierre. Son reglas del benchmark, no nuevos coeficientes del modelo. Si ni con pedidos productivos cero se cumplen, usa cero. Esta política es deliberadamente conservadora y no constituye una recomendación al jugador.
- `works_85_productive`: mismas compras; Ciudad 100%, otros tres usos `ceil(necesidad × 0,85)`, aporte adicional cero. El redondeo y las demandas pequeñas hacen que la cobertura efectiva supere 85%.

Con eventos, se elige la primera opción permitida, sin leer ni optimizar consecuencias. Esa opción puede financiar o ejecutar una obra: «sin obras» significa sin compras voluntarias; los proyectos de eventos quedan registrados. Eventos elegibles y opciones asequibles pueden diferir entre políticas. No son un experimento con idénticos eventos. La matriz sin eventos aísla las políticas con la misma secuencia meteorológica seeded, sin decisiones de eventos que modifiquen forzantes.

## Hallazgos principales

Valle Central con eventos:

| Semilla / política | Turnos productivos completos | Acuífero final / mínimo | Bombeo | Confianza / salud | Neto anual |
|---|---:|---:|---:|---:|---:|
| 001 sin compras | 6/20 | 0 / 0 | 218 | 10 / 34 | $335 |
| 001 obras, pedir todo | 20/20 | 68 / 33 | 194 | 100 / 100 | $585 |
| 001 obras, pedir 85% productivo | 0/20 | 90 / 58 | 153 | 100 / 100 | $554 |
| 260 sin compras | 6/20 | 0 / 0 | 204 | 10 / 38 | $302 |
| 260 obras, pedir todo | 19/20 | 9 / 0 | 224 | 100 / 98 | $580 |
| 260 obras, pedir 85% productivo | 0/20 | 40 / 30 | 192 | 100 / 100 | $551 |
| SEQUIA obras, pedir todo | 16/20 | 0 / 0 | 204 | 66 / 87 | $501 |
| SEQUIA obras, pedir 85% productivo | 0/20 | 0 / 0 | 200 | 82 / 93 | $524 |

«0/20 completos» no significa desabastecimiento total: la política 85% conserva coberturas agrícolas medias de 88,9–89,8% y mineras de 92,4–97,4%. En 001 mejora reservas finales de 68 a 90 y reduce bombeo de 194 a 153, por $31 menos de ingreso anual. Hay un trade-off existente que actualmente queda mal premiado y comunicado. En SEQUIA ambas recetas agotan el acuífero: ni reducir automáticamente todos los pedidos un poco es una solución universal.

Sin eventos, 001 con obras logra 18/20 turnos productivos completos, acuífero final 22/mínimo 0, confianza/salud 93/93. No depende exclusivamente de eventos favorables. Árida con obras y pedidos completos consigue sólo 2/20 en las tres semillas; Lagos del Sur 6–12/20 con eventos. El nombre/dificultad declarada «Fácil» de Lagos no coincide con este benchmark. No extrapolar «todo el juego está fácil» desde Valle Central.

## Causas comprobadas en código

1. `WaterSystem.ts:105–146`: faltante de toma fluvial pasa automáticamente a embalse y luego acuífero. El presupuesto visible usa 18% de acuífero, pero el bombeo efectivo puede usar toda la reserva restante. El motor permite pedir de más; no hay coste económico ni decisión separada de bombeo. El 18% no funciona como límite físico. No debe convertirse en límite silenciosamente.
2. `WaterSystem.ts:280–291`: estrés resta 2 de salud, pero caudal suficiente suma 2, calidad ≥80 suma 2 y restauración suma 1. Un acuífero estresado puede sumar 3 de salud cada turno; crítico puede quedar neutral (−5 + 2 + 2 + 1). El índice agregado admite salud excelente con almacenamiento crítico.
3. `SimulationEngine.ts:712–730`: ingresos anuales dependen de cobertura media, caudal y confianza; no de saldo del acuífero ni pérdida de reservas. El resumen anual usa siempre «finalizado con éxito», incluso si se agota la reserva. El ingreso no representa una evaluación integral de sostenibilidad.
4. `DemandSystem.ts:42–65`: reducciones máximas combinadas de demanda fresca de agricultura 53%, Ciudad 48%, Mina 85%, con pisos. Son potentes y justifican mejora del abastecimiento; no equivalen al mismo porcentaje de ahorro neto de cuenca. `UpgradeSystem.ts:32–56` permite varios niveles asequibles seguidos sin tiempo de construcción. El catálogo útil probado cuesta $810 completo. La entrada de $120 permite empezar a invertir inmediatamente y la cobertura sostiene la financiación anual.
5. `scenarios.json`: Valle Central está declarado introductorio, con demandas base 16/23/7/13 frente a Árida 20/45/10/25. `DemandSystem.ts:35` sólo acumula crecimiento demográfico por eventos; no hay crecimiento regular anual ni escalada automática de exigencia. No son necesariamente errores del modelo: sí explican una campaña larga con una receta estable después de invertir.

## Plan mínimo propuesto, sin cambios de simulación integrados

1. **Corregir la evaluación del resultado.** Distinguir «cubrió necesidades» de «preservó reservas». Mostrar estrés con umbrales existentes 40/20, saldo de acuífero y bombeo/recarga sin esconderlo detrás de salud100. El coordinador implementa esta presentación por separado. No vuelve más difícil la receta: evita llamarla excelente sin matices.
2. **Misiones mixtas, antes de nerfear agua u obras.** Mantener una introducción accesible, pero incluir después objetivos explícitos de abastecimiento y reservas con rutas distintas. Evaluar una misión anual de cobertura media Ciudad ≥95%, productivos/caudal ≥85%, acuífero final ≥40% y no menor que al comienzo del año. Esos 95/85 ya se usan en evaluación de coberturas; 40 en estrés. El requisito de saldo anual es una decisión pedagógica propuesta, no un umbral científico. Aplicado OFFLINE al historial actual, sin cambiar financiación, pasan 1/5 años de la receta100 y 2/5 de la receta85 para 001; en 260 pasan 0/5 y 1/5. La regla rechaza también el sacrificio productivo extremo del guard: 0/5. No está validada todavía su alcanzabilidad en todos los años/escenarios ni el efecto de retirar premios: no integrarla como requisito universal. Usarla como candidato de misión contextual; simular después nuevamente con recompensas reales antes de aprobar.
3. **Revisar salud compuesta.** Reservas y caudal/calidad deben seguir visibles por separado. Si se conserva una cifra global, la revisión debe impedir que beneficios no relacionados oculten almacenamiento crítico; no basta bajar la meta numérica de salud ni añadir un castigo mayor. Comparar candidatos con las mismas 72 configuraciones. Criterio: ninguna partida con acuífero crítico sostenido se presenta como salud integral100, y saneamiento/caudal/restauración mantienen reconocimiento visible.
4. **Escala de dificultad de Central.** Confirmar si es tutorial corto o campaña intermedia de 20 turnos. Si es intermedia, comprobar objetivos variados y decisiones de reserva primero. Sólo luego estudiar inversión por etapas, costes de bombeo o exigencias graduadas como propuestas separadas. No cambiar simultáneamente caudal, demanda, costes y premios; no convertir Árida en un castigo constante.

Criterios de aceptación del próximo rebalance: sin obras pierde cobertura y con obras mejora; pedir todo no domina a políticas que preservan agua en abastecimiento + sostenibilidad + recompensa; una estrategia extrema de racionamiento tampoco obtiene victoria global; las semillas requieren respuestas distintas, sin otra receta fija universal; primer año sigue comprensible. Determinismo y balances se conservan, comparaciones de 20 turnos incluyen todas las semillas/escenarios y pruebas manuales escolares quedan pendientes. El presente análisis no altera coeficientes, PRNG, simulación ni catálogo.
