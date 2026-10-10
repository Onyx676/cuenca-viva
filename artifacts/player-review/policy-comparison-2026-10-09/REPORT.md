# Comparación de políticas con motor 2.6

Ejecución: 2026-10-09. Central, cuatro semillas explícitas, 20 estaciones por campaña. No se modificó código fuente, fórmulas, estado interno, eventos ni misiones. No es replay de la partida humana ni demuestra diversión o validación científica externa.

## Método reproducible

Comando desde la raíz: `node artifacts/player-review/policy-comparison-2026-10-09/benchmark.cjs`.

Semillas: AULA-2026-001, AULA-2026-260, POLICY-2026-003 y POLICY-2026-004. Se mantienen eventos pasivos; ante un evento interactivo se elige la primera opción legal en el orden original, antes de comprar. Se registra cada opción y cuáles eran legales.

Políticas:

- **full**: pedir toda la demanda actual de Ciudad, Cultivos, Granja y Mina; aporte adicional al humedal cero. Sin compras.
- **zero**: pedidos cero a los cinco controles. Sin compras. Esto no equivale a río seco: siguen circulando agua natural, bypass y derrames.
- **half_all_requests**: pedir `Math.round(demanda actual × 0.5)` en los cinco controles, incluido aporte adicional al humedal. Sin compras. Son gotas enteras: una demanda impar no tiene un 50% exacto. Tampoco equivale a entregar el 50% del caudal ecológico real, que incluye otros aportes.
- **full_all_requests**: pedir el 100% de la demanda de los cinco controles, incluido aporte adicional al humedal; sin compras. Se distingue de full, que cubre las cuatro demandas humanas y deja el aporte adicional en cero.
- **minimum**: pedir Ciudad 85%, foco de la misión 80%, otros usos productivos 70%, redondeando hacia arriba. En el primer invierno Ciudad 95%. Aumentar el aporte adicional al humedal de cero hasta el primer valor cuya vista previa cubra 80% de la referencia ecológica, o hasta su demanda si no se alcanza. No optimiza reserva, recompensa ni futuro; no modifica el objetivo.
- **full_works**: reparto full, con compras asequibles en orden fijo: Renovación de Red → Mantenimiento de Canales → Riego Tecnificado → Recirculación Minera → Saneamiento. Cada pasada compra como máximo un nivel por obra, respetando requisitos y fondos reales; repite mientras alguna compra es posible. Mantenimiento es requisito real del riego. No compra ampliación, recarga, captación, restauración ni sensores. No reproduce todas las obras de la partida del usuario.

## Resultados

Cada política se repitió completa: 24 configuraciones, 48 campañas, **960 estaciones verificadas**. Pasaron determinismo del resultado entero y snapshot final; conservación de masa; partición de lluvia; nieve/deshielo; suministro = consumo + retorno por uso; vista previa sin mutaciones y concordancia con resolución; resolución/recompensa idempotente; cierre de las 20 estaciones y cinco años.

Los datos completos, decisiones, compras y series están en `results.json`; métricas resumidas y hashes de fuentes en `summary.json`. Los mínimos de reserva incluyen el estado inicial y los cierres de estación; no representan mínimos continuos dentro de una estación.

| Semilla | Política | Misiones /20 | Todos los usos y río al 100% /20 | Embalse final | Acuífero final (mínimo) | Bombeo total | Confianza / salud final | Dinero final |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| 001 | full | 3 | 6 | 2 | 0 (0) | 218 | 10 /34 | 582 |
| 001 | zero | 0 | 0 | 100 | 100 (85) | 0 | 10 /100 | 228 |
| 001 | half_all_requests | 0 | 0 | 3 | 0 (0) | 201 | 10 /83 | 347 |
| 001 | full_all_requests | 2 | 3 | 2 | 0 (0) | 223 | 10 /37 | 465 |
| 001 | minimum | 10 | 0 | 2 | 0 (0) | 209 | 10 /59 | 657 |
| 001 | full_works | 9 | 18 | 4 | 26 (15) | 188 | 100 /100 | 552 |
| 260 | full | 3 | 6 | 2 | 0 (0) | 204 | 10 /38 | 506 |
| 260 | zero | 0 | 0 | 100 | 100 (85) | 0 | 10 /100 | 260 |
| 260 | half_all_requests | 0 | 0 | 2 | 0 (0) | 192 | 10 /77 | 328 |
| 260 | full_all_requests | 2 | 3 | 2 | 0 (0) | 208 | 10 /38 | 412 |
| 260 | minimum | 9 | 0 | 2 | 0 (0) | 196 | 10 /57 | 587 |
| 260 | full_works | 9 | 16 | 2 | 3 (0) | 201 | 90 /97 | 460 |
| 003 | full | 2 | 7 | 2 | 0 (0) | 212 | 10 /25 | 646 |
| 003 | zero | 0 | 0 | 100 | 100 (85) | 0 | 10 /100 | 238 |
| 003 | half_all_requests | 0 | 0 | 2 | 0 (0) | 198 | 10 /84 | 322 |
| 003 | full_all_requests | 2 | 3 | 2 | 0 (0) | 214 | 10 /23 | 528 |
| 003 | minimum | 9 | 0 | 2 | 0 (0) | 201 | 10 /42 | 781 |
| 003 | full_works | 9 | 17 | 3 | 26 (26) | 180 | 100 /100 | 647 |
| 004 | full | 4 | 5 | 2 | 0 (0) | 188 | 10 /22 | 422 |
| 004 | zero | 0 | 0 | 100 | 100 (85) | 0 | 10 /100 | 260 |
| 004 | half_all_requests | 0 | 0 | 2 | 0 (0) | 177 | 10 /61 | 280 |
| 004 | full_all_requests | 1 | 3 | 2 | 0 (0) | 188 | 10 /34 | 331 |
| 004 | minimum | 6 | 0 | 2 | 0 (0) | 183 | 10 /58 | 442 |
| 004 | full_works | 6 | 12 | 2 | 0 (0) | 187 | 10 /85 | 132 |

Cobertura media sin compras full: Ciudad 57.5–67.3%, Cultivos 55–65.9%, Granja 50.8–61.3%, Mina 51.9–61.9%; río 85.8–92.7%. Pedir el 100% no garantiza recibirlo: esta receta sola agota el acuífero en las cuatro semillas.

Con obras full_works: en 001 y 003 los cuatro usos promedian 100%; en 260 promedian 97.5–99.3%; en 004, 74.3–88.7%. Río medio 94.1–98.3%. Bombeo baja respecto a full en las cuatro semillas, pero quedan reservas subterráneas pequeñas o agotadas. Las cuatro campañas compraron obras por 625 unidades; ingresos anuales netos acumulados 461–600. Calidad final 88–89, frente a 64–69 sin obras full.

Zero conserva reservas, deja los cuatro usos en 0%, acumula 159–270 gotas de derrames y termina con calidad 94, salud 100, confianza 10 y cero misiones. Su presupuesto positivo incluye estado inicial, eventos e ingresos del modelo: no se interpreta como ganancia por abastecer sectores. Confirma que un indicador ecológico alto, por sí solo, no representa buen resultado integral.

Estos derrames son excedentes que siguen aguas abajo en el balance, no rotura del dique ni inundación urbana automática. Una ampliación podría retener parte del excedente mientras haya capacidad libre; esa comparación específica no se ejecutó aquí y no se promete retener todo el derrame acumulado.

Minimum obtiene más misiones que full sin obras, pero también agota el acuífero en todas las semillas. La cobertura media puede quedar bajo el pedido mínimo cuando las reservas no alcanzan; estos mínimos son una regla de pedidos, no satisfacción garantizada. Cumplir varias misiones de una estación tampoco prueba sostenibilidad de campaña.

**Todo al 50% también agota el acuífero en las cuatro semillas**, con bombeo 177–201 y cero misiones. La cobertura media de usos humanos queda entre 41.1% y 51.2%, pero el río promedia 93.4–99.6%. No es una conservación eficaz por el mero hecho de bajar todos los controles: su pedido ecológico adicional todavía se extrae del sistema, aunque el río ya pueda recibir agua natural. Este caso no demuestra cómo se comportaría «cuatro usos al 50%, aporte adicional cero», que no se ensayó; los nombres distinguen esta diferencia.

Todo al 100% de los cinco controles produce sólo 1–2 misiones y tres estaciones completas por semilla; termina también con acuífero cero. En 001 sus coberturas humanas medias son 48.1–54.3%, frente a 60.4–67.3% en full humano sin aporte extra. Pedir aporte adicional ecológico tiene costo de extracción y no equivale a necesitarlo para cubrir la referencia del río.

## Comparabilidad y límites

Dentro de cada semilla coincidieron **clima, ENSO, lluvia total y deshielo** de los 20 turnos entre todas las políticas. Sin embargo, la primera opción legal de eventos cambió en varias campañas al cambiar los fondos y condiciones. Full frente a minimum compartió elecciones en 001 y 003; otras comparaciones no. Por eso son políticas reales comparables bajo el mismo forzamiento climático observado, pero **no una estimación causal aislada del efecto de cada obra**: las consecuencias económicas y opciones disponibles también forman parte de la trayectoria. Los registros permiten revisar esas divergencias.

No se buscó una política óptima ni se eligieron semillas por sus resultados. Los ejemplos no prueban que todos los escenarios/semillas sean fáciles. Sí corroboran la preocupación del usuario: comprar eficiencia siguiendo una receta fija puede dar casi toda la cobertura, mucha salud/confianza y fuertes ingresos aun consumiendo reservas. La semilla 004 también muestra que esa receta no siempre alcanza.

## Implicación para la próxima decisión

Priorizar coherencia entre resultados celebrados, reservas y objetivos de campaña; separar buena cobertura actual de gestión sostenible. No debilitar ahorros auténticos ni subir demandas sin justificar. Estos datos tampoco demuestran que sensores o ampliación sean necesarios: esa evaluación requiere políticas de anticipación y almacenamiento específicas. No cambia hoy ninguna regla 2.6; si se modifican objetivos/recompensas, preservar replay con reglas versionadas nuevas.

No se ejecutó build/TypeScript de producto porque sólo se agregó este harness y los artefactos. El harness fue ejecutado exitosamente; validaciones concretas indicadas arriba.
