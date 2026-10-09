# Evidencia acotada del beneficio de tecnologías — modelo 2.4

El motor permite demostrar cambios de necesidad, cobertura, consumo conceptual y retornos. **No permite identificar la reducción de demanda de una obra con un porcentaje de ahorro de agua de la cuenca.** Comprar una obra conserva los pedidos: el jugador puede usar la misma agua para cubrir más necesidad o modificar las compuertas para reducir extracción. En escasez, también puede repartir el margen entre otros usos.

## Evidencia de código

- `src/simulation/DemandSystem.ts:43–60`: riego N1 reduce demanda agrícola 12% antes de redondeo/piso; renovación urbana N1 10%; recirculación minera N1 20%. No son porcentajes derivados de una cuenca real.
- `src/simulation/SimulationEngine.ts:464–495`: compra actualiza demandas y presupuesto, no cambia los pedidos ni sortea nuevo clima/deshielo. La asignación se modifica por acción explícita (`:426`).
- `src/simulation/WaterSystem.ts:102–136`: el agua entregada procede primero de río, después de embalse y luego acuífero; menor necesidad no cambia por sí sola esa extracción.
- `WaterSystem.ts:203–204`: agricultura consume 70% del agua efectivamente entregada, devuelve el resto. Riego no modifica esa fracción. No están representadas explícitamente evapotranspiración por cultivo, pérdidas recuperables ni infiltración de canales. Por eso no demostrar ahorro agrícola real ni igual producción física con estos coeficientes.
- `WaterSystem.ts:217–230`: recirculación N1/N2 modifica simultáneamente demanda y proporción de retorno; N3 tiene retorno externo cero y clasifica toda entrega fresca como consumo/retención dentro de esta abstracción. El aumento de retornos N1 del ensayo es un efecto del modelo, **no una ley empírica de la recirculación**. Falta revisión experta de estas simplificaciones para aval científico.
- `WaterSystem.ts:252–255`: continuidad ecológica depende de caudal que sigue por el río **más retornos**; aporte extra cero no equivale a río seco. Calidad se calcula por separado.
- `WaterSystem.ts:307–308`: cierre contable incluye lluvia, nieve, aporte externo, reservas, evaporación, consumo y salida aguas abajo. Conservación contable no valida científicamente los coeficientes.
- `SimulationEngine.ts:46` / `EventSystem.ts:26–65`: clima e eventos usan flujos seeded separados; los sorteos del catálogo son fijos, pero elegibilidad cambia con obras, reservas y resultados. Dos partidas normales con misma semilla pueden tener eventos diferentes; sus diferencias no son atribuibles exclusivamente a tecnología.

## Ensayo ejecutado

Comando desde la raíz: `node artifacts/hackathon-readiness/technology/compare.cjs`.

El runner usa las fuentes TypeScript reales y bibliotecas ya instaladas. No cambia archivos del producto. Desactiva el catálogo de eventos **solo en los motores del ensayo**, antes del turno 2 y simétricamente; el turno 1 no dispara eventos. Es una comparación hidrológica controlada, no una partida normal ni una prueba de diversión. Las compras son reales, asequibles y ejecutadas en turno 1 mediante `purchaseUpgrade`, con coste incremental N1 real ($30 riego, $35 minería).

Se comparan riego N1 y recirculación minera N1 en los tres escenarios, semillas `AULA-2026-001` y `HACKATHON-HOLDOUT-01`, veinte estaciones. Para aislar riego, ambos brazos compran Mantenimiento N1 ($20); solo el brazo tratado agrega Riego N1. Esa preparación N1 no reduce demanda. No se comparan paquetes con diferencias ocultas.

Dos políticas explícitas:

1. **Pedidos idénticos por estación.** Se calculan pedidos a partir de necesidades del brazo sin obra y su presupuesto hídrico. Ambos solicitan exactamente las mismas cantidades. Si no alcanza el presupuesto: racionamiento proporcional, restos en orden Ciudad → Cultivos → Granja → Mina. No hay aporte extra al humedal; se mide el caudal que efectivamente llega.
2. **Ajustar pedidos a necesidades.** Ambos aplican la misma regla: satisfacer el 100% de su demanda actual, limitado por su propio presupuesto hídrico, con idéntico racionamiento proporcional. Cambian las cantidades solicitadas y, potencialmente, las reservas y presupuesto de turnos siguientes. No se exige cobertura igual si falta agua: se presenta la cobertura que resulta.

En cada estación se verifica igualdad de clima, ENSO, temperatura, lluvia, nieve, infiltración, escorrentía, aporte externo y estados de PRNG de clima/eventos; preview sin mutación ni sorteos; entrega = consumo + retorno; error de masa cero. Cada par se repite y sus resultados completos se comparan exactamente. Se completa año 5 en cada brazo.

**Resultado técnico: 24 pares, 24 repeticiones, 96 brazos, 1920 resoluciones estacionales; todas las comprobaciones pasan.** `results.json` contiene balances estacionales completos, demandas, pedidos, consumo, retornos, coberturas, extracción por fuente, reservas, desbordes, evaporación, recarga, salida ecológica y SHA-256 de las fuentes. La media de cobertura es media de porcentajes estacionales, no razón de volúmenes acumulados. Las gotas son unidades conceptuales; no m³ reales.

## Ejemplo defendible: Valle Central / AULA-2026-001 / 20 estaciones

| Medida | Sin riego N1 | Con riego, mismos pedidos | Con riego, ajustar pedidos |
|---|---:|---:|---:|
| Demanda agrícola acumulada | 454 | 399 | 399 |
| Agua entregada a cultivos | 288 | 288 | 270 |
| Agua entregada a todos los usos | 748 | 748 | 747 |
| Consumo conceptual total | 465 | 465 | 463 |
| Retorno total | 283 | 283 | 284 |
| Bombeo acumulado del acuífero | 171 | 171 | 171 |
| Extracción acumulada del embalse | 195 | 195 | 194 |
| Embalse final | 2 | 2 | 2 |
| Acuífero final | 43 | 43 | 43 |
| Cobertura agrícola media | 62,7% | 67,6% | 66,8% |
| Caudal aguas abajo acumulado | 417 | 417 | 418 |
| Estaciones con caudal ecológico recomendado | 14/20 | 14/20 | 16/20 |

Riego ayuda a cubrir necesidades y reasignar agua. En esta secuencia escasa, no reduce el bombeo acumulado ni aumenta las reservas finales. Ocultar este resultado y mostrar «12% de ahorro de cuenca» sería incorrecto. La regla que usa todo el presupuesto disponible cuando falta agua absorbe gran parte del margen de demanda: los otros usos reciben más agua. Un beneficio de servicio es distinto de un beneficio de almacenamiento.

| Medida | Sin recirculación N1 | Con recirculación, mismos pedidos | Con recirculación, ajustar pedidos |
|---|---:|---:|---:|
| Demanda minera acumulada | 260 | 200 | 200 |
| Entrega minera | 152 | 152 | 122 |
| Agua entregada total | 748 | 748 | 746 |
| Consumo conceptual total | 465 | 441 | 444 |
| Retorno total | 283 | 307 | 302 |
| Bombeo acumulado | 171 | 171 | 171 |
| Embalse / acuífero final | 2 / 43 | 2 / 43 | 2 / 43 |
| Cobertura minera media | 58,5% | 68,0% | 61,0% |
| Caudal aguas abajo acumulado | 417 | 441 | 436 |

El brazo de pedidos idénticos demuestra por separado efecto sobre cobertura y efecto del coeficiente de retorno del modelo. El brazo ajustado mejora también otras coberturas al repartir el margen. Tampoco prueba reducción del bombeo en esta semilla.

En los doce pares con ajuste de demanda, la reducción de bombeo acumulado fue **0–3 gotas** y el cambio de acuífero final **0–1 gotas**. No cabe concluir una gran reducción de estrés hídrico solo por instalar N1. No es prueba de inutilidad: se probaron únicamente estas dos obras N1, dos semillas, sin eventos y dos reglas. No se evaluaron otros niveles, combinación de tecnologías, decisiones que priorizan guardar agua ni estrategias óptimas.

## UI mínima y aceptación

Una primera comparación del **turno actual** puede mostrar «necesidad antes/después de esta obra», mismo clima y misma estación. Debe conservar los pedidos y decir «Tus compuertas mantienen su pedido; ajustalas si querés transformar esa menor necesidad en menor extracción». Mostrar demanda antes/después, coste y cobertura esperada no equivale a afirmar ahorro de cuenca.

Para comparar consecuencias de agua, un panel bajo demanda puede ejecutar los dos balances desde **las mismas reservas iniciales** y forcing ya calculado, sin avanzar turno ni consumir PRNG. Dos columnas: sin obra y con obra; política seleccionada y visible: mismos pedidos / reducir pedido al nuevo requerimiento sin repartir el margen. Debe mostrar cambio en toma de río, extracción de embalse, bombeo, consumo conceptual, retornos, reservas finales, caudal ecológico y cobertura de los sectores afectados. Nada de porcentajes de «estrés evitado» sin denominador y definición. Capacidad no es agua almacenada; no llamar reserva a `availableWater - requested`.

Criterios verificables para implementar ese panel sin ampliar el motor arbitrariamente:

- Contrafactual de un turno; no fingir historial alternativo ni atribuir el resultado observado total a una obra.
- Reusar el cálculo real de demandas y `WaterSystem`, con mismos forcing/reservas/contexto. No escribir una segunda fórmula de ahorro en UI.
- Clonar datos, no comprar en el motor vivo ni mutar su estado. Preview repetida deja estado y PRNG exactos.
- Para «sin/con próximo nivel», respetar prerequisitos y comparar incrementos efectivos, no el porcentaje N1 cuando ya hay N2.
- Informar qué pedidos cambian y qué usos mantienen sus pedidos. No permitir que al mejorar una obra se «ahorre» quitando agua a un sector ajeno sin decirlo.
- Verificar masa cero en ambos balances; igual semilla y acciones dan igual resultado; pruebas de escasez y piso/redondeo donde bajar demanda no reduce bombeo.
- Presentar resultados como efectos del modelo conceptual. Prueba con estudiantes y revisión externa de fracciones, tecnologías y aguas de retorno siguen pendientes.

La comparación acumulada de veinte turnos puede permanecer en el paquete docente de evidencia para esta entrega. Convertirla en función interactiva requiere política y tratamiento de eventos/reinversión explícitos; no es prioritario si el panel de un turno y la explicación de pedidos ya permiten defender modelo → decisión → consecuencia.

## Límites y dependencias

No se ejecutó aquí `npm run build`/TypeScript del producto porque solo se agregaron archivos experimentales y un informe; el coordinador ejecuta checks tras su integración. Este ensayo no acredita validez científica, aprendizaje, rendimiento escolar ni diversión. Las cifras dependen del modelo 2.4 y los hashes guardados; si cambia la hidrología o los coeficientes, hay que regenerarlas y actualizar las conclusiones. No se recomienda ajustar balance para producir un resultado de marketing más favorable.
