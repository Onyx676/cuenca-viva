# Evidencia acotada del beneficio de tecnologías — modelo 2.5

Informe vigente regenerado después de incorporar transferencia conceptual río → acuífero. `results.json` corresponde a **2.5**; resultados e informe anteriores se preservan en `results-model-2.4.json` y `REVIEW-model-2.4.md`. El runner histórico `compare-model-2.4.cjs` usa exclusivamente las fuentes preservadas de 2.4 y reproduce exactamente sus resultados; escribe un archivo distinto para no reemplazar evidencia actual.

El motor permite demostrar cambios de necesidad, cobertura, consumo conceptual y retornos. **No permite identificar la reducción de demanda de una obra con un porcentaje de ahorro de agua de la cuenca.** Comprar una obra conserva los pedidos: el jugador puede usar la misma agua para cubrir más necesidad o modificar las compuertas para reducir extracción. En escasez, también puede repartir el margen entre otros usos.

## Evidencia de código

- `src/simulation/DemandSystem.ts:43–60`: riego N1 reduce demanda agrícola 12% antes de redondeo/piso; renovación urbana N1 10%; recirculación minera N1 20%. No son porcentajes derivados de una cuenca real.
- `src/simulation/SimulationEngine.ts:509`: compra actualiza demandas y presupuesto, no cambia los pedidos ni sortea nuevo clima/deshielo. La asignación se modifica por acción explícita (`:471`).
- `src/simulation/WaterSystem.ts:105–145`: el agua entregada procede primero de río, después de embalse y luego acuífero; menor necesidad no cambia por sí sola esa extracción.
- `WaterSystem.ts:137–140`: transferencia fluvial usa 10% conceptual del bypass, limitada al espacio disponible. En esta comparación el flujo existe en ambos brazos; no se atribuye su beneficio propio a la tecnología.
- `WaterSystem.ts:212–213`: agricultura consume 70% del agua efectivamente entregada, devuelve el resto. Riego no modifica esa fracción. No están representadas explícitamente evapotranspiración por cultivo, pérdidas recuperables ni infiltración de canales. Por eso no demostrar ahorro agrícola real ni igual producción física con estos coeficientes.
- `WaterSystem.ts:226–239`: recirculación N1/N2 modifica simultáneamente demanda y proporción de retorno; N3 tiene retorno externo cero y clasifica toda entrega fresca como consumo/retención dentro de esta abstracción. El aumento de retornos N1 del ensayo es un efecto del modelo, **no una ley empírica de la recirculación**. Falta revisión experta de estas simplificaciones para aval científico.
- `WaterSystem.ts:260–264`: continuidad ecológica depende de caudal que sigue por el río **más retornos**, después de restar infiltración fluvial; aporte extra cero no equivale a río seco. Calidad se calcula por separado.
- `WaterSystem.ts:316–317`: cierre contable incluye lluvia, nieve, aporte externo, reservas, evaporación, consumo y salida aguas abajo. Conservación contable no valida científicamente los coeficientes.
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
| Agua entregada a cultivos | 291 | 291 | 270 |
| Agua entregada a todos los usos | 751 | 751 | 749 |
| Consumo conceptual total | 467 | 467 | 464 |
| Retorno total | 284 | 284 | 285 |
| Bombeo acumulado del acuífero | 174 | 174 | 173 |
| Extracción acumulada del embalse | 195 | 195 | 194 |
| Embalse final | 2 | 2 | 2 |
| Acuífero final | 44 | 44 | 45 |
| Recarga fluvial acumulada | 5 | 5 | 5 |
| Cobertura agrícola media | 63,5% | 68,4% | 66,8% |
| Caudal aguas abajo acumulado | 414 | 414 | 415 |
| Estaciones con caudal ecológico recomendado | 15/20 | 15/20 | 16/20 |

Riego ayuda a cubrir necesidades y reasignar agua. En esta secuencia escasa, mantener pedidos no reduce bombeo ni aumenta reservas; ajustar pedidos reduce bombeo una gota y deja una gota más en el acuífero. Mostrar «12% de ahorro de cuenca» sería incorrecto. La regla que usa todo el presupuesto disponible cuando falta agua absorbe gran parte del margen de demanda: los otros usos reciben más agua. Un beneficio de servicio es distinto de un beneficio de almacenamiento.

| Medida | Sin recirculación N1 | Con recirculación, mismos pedidos | Con recirculación, ajustar pedidos |
|---|---:|---:|---:|
| Demanda minera acumulada | 260 | 200 | 200 |
| Entrega minera | 152 | 152 | 123 |
| Agua entregada total | 751 | 751 | 748 |
| Consumo conceptual total | 467 | 443 | 446 |
| Retorno total | 284 | 308 | 302 |
| Bombeo acumulado | 174 | 174 | 173 |
| Embalse / acuífero final | 2 / 44 | 2 / 44 | 2 / 45 |
| Recarga fluvial acumulada | 5 | 5 | 5 |
| Cobertura minera media | 58,5% | 68,0% | 61,5% |
| Caudal aguas abajo acumulado | 414 | 438 | 432 |

El brazo de pedidos idénticos demuestra por separado efecto sobre cobertura y efecto del coeficiente de retorno del modelo. El brazo ajustado mejora también otras coberturas al repartir el margen y reduce bombeo una gota. Esto no respalda una gran reducción de estrés ni corresponde al porcentaje nominal de demanda.

En los doce pares con ajuste de demanda, la reducción de bombeo acumulado fue **0–3 gotas** y el cambio de acuífero final **0–1 gotas**. No cabe concluir una gran reducción de estrés hídrico solo por instalar N1. No es prueba de inutilidad: se probaron únicamente estas dos obras N1, dos semillas, sin eventos y dos reglas. No se evaluaron otros niveles, combinación de tecnologías, decisiones que priorizan guardar agua ni estrategias óptimas.

## UI mínima y aceptación

La comparación contextual del **turno actual** ya se implementó mediante `SimulationEngine.previewUpgradeWater` (`:76`): próximo nivel, mismo clima, reservas, coste, demanda, pedidos y balance; dos políticas explícitas. Usa clon independiente y el camino real `previewSeasonForState`. No avanza turno ni consume PRNG. El panel contextual integrado por el coordinador permite mantener pedidos o reducir solo el pedido del uso cuya demanda cae, sin redistribuir el margen. Esta segunda política de un turno es distinta de la política proporcional de veinte turnos de este ensayo.

La aceptación pedagógica del panel requiere mostrar cambio en toma de río, extracción de embalse, bombeo, consumo conceptual, retornos, reservas finales, caudal ecológico y cobertura de los sectores afectados. Nada de porcentajes de «estrés evitado» sin denominador y definición. Capacidad no es agua almacenada; no llamar reserva a `availableWater - requested`.

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

Esta regeneración solo modifica artefactos del ensayo; no repite build/TypeScript del producto. El coordinador ejecuta los checks de la integración 2.5. Pasaron las 1920 resoluciones del ensayo actual, y se reprodujeron exactamente las 1920 resoluciones históricas 2.4 usando fuentes preservadas. `preview.test.cjs` verifica el cálculo contextual; las ocho pruebas permanentes `tests/river-recharge.test.cjs` verifican transferencia, conservación, clima/PRNG y replay 2.5. Este ensayo no acredita validez científica, aprendizaje, rendimiento escolar ni diversión. Las cifras vigentes dependen del modelo **2.5** y los hashes guardados; si cambia la hidrología o los coeficientes, hay que regenerarlas y actualizar las conclusiones. No se recomienda ajustar balance para producir un resultado de marketing más favorable.
