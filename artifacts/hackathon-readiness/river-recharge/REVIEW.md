# Candidata aislada: intercambio río → acuífero

**Estado: experimento aislado; la integración posterior en raíz es decisión del coordinador.** La conservación y el impacto se comprobaron contra el modelo 2.4 preservado en `artifacts/hackathon-readiness/model-2.4-baseline/src`. Los scripts usan siempre esa referencia, aunque el producto pase a 2.5. Ninguna fracción propuesta es una estimación regional ni está validada por especialistas.

## Transferencia propuesta y límites

Se reutiliza `WaterSystem.ts` real de la referencia 2.4 mediante `prepare.cjs`, con un cambio acotado en `candidate/WaterSystem.ts`:

1. Conservar entrada fluvial (deshielo + lluvia directa + aporte externo), captación a usos y retención en embalse actuales.
2. Tomar exclusivamente el caudal `riverBypass` que sigue aguas abajo después de esas captaciones y retención, antes de retornos de usuarios.
3. Tras la recarga natural por lluvia y la recarga gestionada existentes, calcular el espacio restante del acuífero.
4. Transferir `min(riverBypass, round(riverBypass × fracción), espacio restante)`. El constructor recibe una fracción explícita para sensibilidad; el control es cero. Se limita 0–1 y una entrada no finita se toma como cero. No existe mínimo forzado de una gota.
5. Sumar esa cantidad al acuífero antes de su bombeo y restarla del agua limpia que continúa por el río. Registrar `aquiferRiverRecharge` separado de recarga por lluvia y obra.

No cambian coeficientes existentes, orden de PRNG, demanda, extracción preferente ni fracciones de retorno. **No se suma recarga como una nueva entrada externa** al cierre de masa: es transferencia interna. Si el acuífero ya está lleno después de lluvia/obra, la nueva transferencia fluvial vale cero. El desborde de recarga natural/gestionada existente sigue volviendo al río. El agua fluvial retenida puede desbordar en una estación posterior: no se promete almacenamiento permanente.

No infiltrar el embalse ni el agua ya captada evita cobrar dos veces el mismo flujo. Tampoco infiltrar retornos evita inventar aquí otra ruta que requeriría revisión distinta. Se representa un tramo de río perdedor hacia un acuífero conectado. El agua del río mezcla fuentes: no corresponde etiquetar toda la recarga fluvial como deshielo puro.

Simplificaciones fuertes por declarar: no hay gradientes hidráulicos, geología espacial, tiempos de viaje, superficie mojada, cambio entre río perdedor/ganador ni intercambio bidireccional real. Se usa capacidad disponible y prioridad temporal lluvia/obra → río → bombeo. La saturación y el desborde son reglas del modelo, no una descripción calibrada de una cuenca específica. Una recarga antes del bombeo significa que un acuífero inicialmente lleno no recibe transferencia nueva ese turno aunque luego se bombee; cambiar ese orden es otra hipótesis que no se evaluó.

## Protocolo ejecutado

Desde la raíz:

```text
node artifacts/hackathon-readiness/river-recharge/prepare.cjs
node artifacts/hackathon-readiness/river-recharge/run.cjs
npx --no-install tsc --noEmit --target ES2022 --module ESNext --moduleResolution bundler --resolveJsonModule --allowSyntheticDefaultImports artifacts/hackathon-readiness/river-recharge/candidate/WaterSystem.ts
```

Tres escenarios, dos semillas (`AULA-2026-001`, `HACKATHON-HOLDOUT-01`), sin obras y con Captación N1 + Recarga Gestionada N1 compradas realmente en turno 1. Las compras de obra son iguales en los cuatro brazos de cada grupo y tienen coste real; no se compara obra/no obra entre grupos para atribuir efectos a la nueva fracción.

Fracciones 0 / 0,1 / 0,2 / 0,3. Veinte turnos. Eventos desactivados simétricamente **solo en el ensayo** para aislar transferencia; no se afirma que sea partida normal. Cada estación toma pedidos del control de fracción cero: 80% de necesidades sectoriales, aporte extra al humedal cero, limitado proporcionalmente a `availableWater` del control. Se aplican exactamente los mismos pedidos en los cuatro brazos y se comprueba que caben en todos sus presupuestos. Las coberturas ecológicas se miden sobre caudal real aguas abajo.

Comprobaciones: misma lluvia/nieve/clima/ENSO/temperatura y estados PRNG; preview sin mutación; entrega = consumo + retorno; recarga limitada a bypass y espacio; masa cero; finalización de veinte turnos. Cada grupo se repite con igualdad completa. Control cero reproduce exactamente el `WaterSystem` raíz, excluyendo el campo nuevo que vale cero.

**Pasaron 12 grupos, 96 brazos incluyendo repetición, 1920 resoluciones y 49 casos extremos.** TypeScript de la candidata también pasó. Los extremos cubren río cero, nieve cero con lluvia, solo deshielo, acuífero lleno, una gota de espacio, desborde natural, bombeo posterior, fracciones límite/no finitas. En la prueba con acuífero lleno y recarga de lluvia, las 17 gotas de desborde originales vuelven al río y la nueva recarga fluvial es cero. No hubo masa negativa, ficticia ni elevación artificial del caudal ecológico.

`results.json` conserva cada balance por estación, coberturas, recarga, extracción, reservas, overflow y delta respecto de cero. `source-manifest.json` registra el SHA-256 de WaterSystem que generó la candidata.

## Sensibilidad y redondeo

| Fracción del bypass | Recarga fluvial por partida de 20 estaciones | Estaciones con recarga no cero por partida | No cero total / 240 estaciones | Cambio de acuífero final | Cambio metas de caudal ecológico |
|---|---:|---:|---:|---:|---:|
| 0,1 | 4–6 | 4–6 | 59/240 (24,6%) | +0 a +6 | 0 |
| 0,2 | 7–13 | 5–10 | 94/240 (39,2%) | +0 a +12 | 0 |
| 0,3 | 9–19 | 6–10 | 102/240 (42,5%) | +0 a +17 | −1 a 0 |

Las estaciones sin recarga incluyen dos causas distintas: fracción inferior a media gota antes del redondeo y falta de espacio. Para 10%, bypass inferior a 5 gotas redondea a cero; el bypass observado fue de 1 a 19 según escenario y estación. Saturación impidió una transferencia potencial no cero en 13/240 turnos para 10%, 21/240 para 20% y 24/240 para 30%.

El 10% **no queda siempre invisible**: ocurre en unas cinco de veinte estaciones con esta regla. La reserva al cierre gana 0–6 gotas. En el grupo abundante con obras, puede haber transferencia acumulada pero ninguna ganancia final porque más tarde desborda; eso es un trade-off educativo real dentro del modelo. El rango 20–30% aumenta visibilidad y efecto, pero esos hechos no validan científicamente elegir una cifra mayor.

Ejemplo Valle Central / AULA / sin obras:

| Medida acumulada o final | 0 | 0,1 | 0,2 | 0,3 |
|---|---:|---:|---:|---:|
| Recarga fluvial | 0 | 5 | 10 | 14 |
| Bombeo acumulado | 150 | 150 | 150 | 150 |
| Acuífero final | 53 | 57 | 61 | 65 |
| Embalse final | 3 | 3 | 3 | 3 |
| Caudal aguas abajo acumulado | 421 | 417 | 413 | 409 |
| Metas ecológicas alcanzadas | 17/20 | 17/20 | 17/20 | 17/20 |

No se reduce bombeo ni se eleva cobertura productiva en los 12 grupos: los pedidos son idénticos y todos recibían agua completa respecto de lo solicitado. La transferencia aumenta reserva subterránea a costa de agua aguas abajo, y puede cambiar el estado de estrés del acuífero o las metas ecológicas cuando cruza umbrales. En un grupo árido con 30% cae una meta ecológica. Al adaptar decisiones o mantener eventos normales, las consecuencias indirectas podrían diferir; no se atribuyen aquí resultados futuros no probados.

## Decisión de integración y criterios

No hay fundamento regional en este ensayo para fijar 10%, 20% o 30%. **10% es la candidata de menor impacto del rango y ya produce señal educativa observable**, si la presentación muestra recarga fluvial acumulada y distingue redondeo y saturación. Es defendible evaluarla como parámetro conceptual conservador, con revisión científica pendiente; no declararla tasa real de infiltración ni subirla solo para llenar el acuífero o mejorar puntuaciones.

Antes de integrar, el coordinador debe decidir explícitamente la hipótesis espacial (tramo conectado después de embalse), la fracción conceptual y el orden temporal. Criterios de aceptación:

- `aquiferRiverRecharge` aparece en balance y explicaciones; recarga total por fuentes y cierre al acuífero suma lluvia + obra + río − bombeo − desborde.
- La vista enseña nieve → río → infiltración al acuífero condicional; nieve sola puede recargar y río cero no recarga.
- Transferencia no crea agua; resta exactamente lo transferido del caudal previo a retornos. No «compensar» luego ecosistema con un bonus.
- Acuífero lleno rechaza la nueva transferencia y overflow existente conserva el camino al río.
- No consumes PRNG extra ni cambias orden de sorteos. Misma semilla/escenario/acciones reproducen estado completo en la nueva versión.
- Elegir versión de modelo nueva; exportación/recuperación antigua no se reproduce silenciosamente con nuevas fórmulas. Revisar todos los callers que suman recarga o enseñan identidad contable.
- Verificar políticas reales con eventos y solicitudes UI, límites de ecocaudal, conservación, final de año, veinte turnos, comparación de tecnologías y recuperación/replay.
- Mantener etiqueta de entorno conceptual sin validación externa terminada. Una referencia científica que respalde la ruta no acredita esta fracción, capacidad ni tiempos.

La candidata tiene prueba TypeScript propia y runner ejecutado. El agente no editó simulación raíz; su integración es del coordinador. Después de esa integración, el agente agregó exclusivamente `tests/river-recharge.test.cjs`: ocho pruebas permanentes pasaron contra raíz 2.5, incluyendo ruta de deshielo, ausencia de río/nieve, saturación, overflow, redondeo, recarga gestionada, masa, clima/PRNG contra 2.4 en veinte turnos/tres escenarios, preview pura y recuperación/replay determinista en turnos 1/4/19/20. También se comprobó rechazo no destructivo de recuperación 2.4. Build y checks agregados del producto corresponden al coordinador.
