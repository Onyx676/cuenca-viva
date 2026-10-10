# Evaluación final: dimensiones defendibles

Revisión estática de `models/Balance.ts`, `models/GameState.ts`, `models/Event.ts`, `main.ts:2302–2408`, `resultReport.ts` y `waterClarity.ts`. Sin cambios de producción ni benchmark; sin pruebas ejecutadas.

## Cuatro dimensiones, sin puntaje global

1. **A quién abasteciste.** Media y peor cobertura de Ciudad, Cultivos, Granja y Mina; estaciones con demanda cubierta y mayor racha de cobertura incompleta por sector. `satisfactions` lo permite. Mostrar cero abastecimiento separado de pequeñas brechas. No confundir `unmetAllocation` (pedido no entregado) con demanda no cubierta: el pedido puede ser insuficiente y llegar íntegro. Una media alta no borra una racha de abandono.
2. **Qué dejaste en las reservas.** Embalse y acuífero: volumen inicial corregido por eventos del primer turno, final y menor cierre registrado; bombeo acumulado frente a las tres recargas acumuladas (lluvia, río y obra); reboses y evaporación separados. `waterAdjustment` cuenta aportes/usos extraordinarios reales fuera del reparto y ya incluidos en el inicio de la estación. Conservación interna registrada no equivale a sostenibilidad: consumo y caudal aguas abajo son salidas legítimas.
3. **Cómo quedó el río.** Estaciones en que alcanzó la referencia ecológica, peor caudal relativo y racha por debajo de referencia; calidad media/peor/al cierre y salud al cierre. No sumar caudal y calidad en un índice opaco. Un acuífero lleno con caudal ecológico nulo no puede recibir elogio de éxito integral.
4. **Cómo sostuviste la gestión.** Misiones logradas, confianza al cierre y peor valor registrado; presupuesto anual neto acumulado y restante, junto al desglose anual ya disponible. Misiones son objetivos parciales del juego, no certificado de sostenibilidad. Dinero abundante puede coexistir con desabastecimiento; no usarlo como victoria automática.

Todo descriptivo y rotulado como resultados dentro del modelo. Umbrales nuevos requerirían decisión de diseño explícita; la referencia ecológica y demanda completa existentes permiten conteos sin introducir criterios científicos externos. Para una pantalla breve: una tarjeta por dimensión y detalle expandible; no añadir veinte cifras a lectura obligatoria.

## Datos disponibles y límites

- Historial por turno: cinco coberturas (incluido río), pedido, entrega, consumo, retorno, calidad de retornos, entradas/salidas, reservas inicial/final, calidad, salud, confianza, eventos efectivos y misión lograda. Confianza histórica incluye recompensa de misión. Calidad/salud son cierres, no mínimos intraturno.
- Rachas y peores cierres se calculan sin PRNG ni mutación. Etiquetar «menor cierre registrado»: no se conoce el mínimo físico intraturno con sólo el balance.
- Capacidad inicial está en el escenario, final en GameState; no está registrada capacidad por estación. Una ampliación del embalse baja porcentaje de llenado sin perder agua. Evaluar cambios en gotas, no comparar porcentajes inicial/final como conservación. No estimar porcentaje histórico usando capacidad final.
- El inicio de turno 1 es posterior a ajustes de evento: restar la suma de cambios reales del primer turno para recuperar volumen inicial previo. Otros eventos también importan para trayectoria; distinguir aportes extraordinarios y decisiones del jugador.
- Todas las transferencias extraordinarias registran `externalInflow/outflow`; no sumar el flujo río→acuífero como entrada externa de cuenca. Para acuífero sí es recarga interna recibida. Rebose vuelve al río, no equivale a desperdicio sin destino.
- GameState por sí solo no conserva todos los costos de compras ni dinero inicial/final por turno. Las compras y recompensas se pueden estudiar con SessionLog/replay, fuera del alcance mínimo. No deducir eficiencia financiera de dinero final o niveles actuales de obras.
- Semilla y escenario iguales son necesarios para comparar, pero eventos condicionales pueden divergir por decisiones. No prometer clima/eventos idénticos ni superioridad causal universal; narrar exposición a eventos y alternativas elegidas.

## Riesgos actuales concretos

- `main.ts:2386` calcula `reservesFell` con inicio sin corregir eventos, mientras tarjetas en 2342–2343 sí corrigen. Un evento del primer turno puede hacer divergir el título y la comparación visible. Conviene usar el mismo inicio corregido.
- `main.ts:2400` activa fanfarria y confeti si acuífero no está estresado/crítico, independientemente de abandonos sectoriales o caudal ecológico. Puede celebrarse terminar, pero no presentar esa animación como gestión integral exitosa.
- Export HTML actual reproduce informe final y tiene tabla completa de coberturas/reservas/bombeo. Una evaluación añadida a DOM final se trasladaría a impresión automáticamente, sin una segunda fórmula divergente.

## Recomendación mínima

Primero agregar descripción legible de las tres dimensiones materiales (abastecimiento, reservas, río), sin nota ni medalla universal. Mantener gestión/misiones como detalle complementario. Diseñar rúbrica escolar o ranking sólo después de partidas reales y prueba con usuarios; no confundir desempeño del juego con aprendizaje demostrado.
