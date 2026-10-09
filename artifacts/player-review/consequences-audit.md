# Consecuencias sectoriales — revisión de código, 2026-10-09

Revisión sólo de lectura de producción. No se cambiaron simulación, coeficientes, PRNG ni recuperación. No se ejecutaron pruebas porque no se modificó código.

## Lo que realmente cambia

- `WaterSystem.ts:280–309`: confianza urbana +1 con cobertura >=95%; por debajo, resta `round((1-cobertura)*25)`. Cultivos <70% resta 3; Mina <70% resta 2; calidad <55 resta 4; acuífero crítico resta 4. La confianza final tiene piso 10 y techo 100. Granja no tiene penalidad directa de confianza.
- Salud: río >=90% aporta +2, <60% resta 4; acuífero saludable +1, estresado -2, crítico -5; calidad >=80 +2, <50 -3; restauración +1. Salud final limitada entre 10 y 100. No atribuir el cambio total exclusivamente al río.
- `SimulationEngine.ts:613–682`: la resolución aplica primero hidrología, luego recompensa estacional de misión. La misión suma dinero y confianza, con techo 100. El balance histórico de confianza se sobrescribe con confianza posterior a la misión; el balance de salud conserva el resultado hidrológico. En otoño se acredita además ingreso anual.
- `SimulationEngine.ts:711–744`: ingresos anuales con cobertura media real de cuatro estaciones: Ciudad hasta $30; Cultivos hasta $40; Granja hasta $10; Mina hasta $35. Bono río $15 si promedio >=85%; confianza $15 si confianza al cierre >=80%; mantenimiento -$25; presupuesto neto mínimo $20. Son créditos conceptuales por abastecimiento, no simulación de cosecha, empleo ni ganancias reales.
- Eventos operan antes del reparto y registran `appliedEffects` con cambios reales tras topes; no usar efectos nominales como cambios efectivos. Comparar con estación anterior mezcla esos eventos, obras y misión.

## UI actual y recomendación mínima

El cierre anual (`main.ts:1942–1965`) ya desglosa todos los sectores, bonos, mantenimiento y aporte al presupuesto mínimo. No añadir ese desglose a cada resumen. Cambiar «Producción agrícola» por «Aporte de Cultivos» evita dar a entender una producción agrícola medida.

En el resumen bastan dos consecuencias breves: confianza real y salud real, acompañadas de una frase que identifique sus factores. Las cifras superiores muestran niveles actuales; el resumen debe mostrar cambio y motivo, no repetir niveles. Para actividad productiva puede decir «Este abastecimiento cuenta para el aporte al cierre del año». No presentar dinero anual ficticio por estación ni recompensas adicionales.

El mapa puede representar abastecimiento mediante actividad/reclamos/reanudación, con etiqueta «Reacción al abastecimiento» si hace falta. No afirmar cantidad de cosecha, puestos creados, ingresos de la estación ni causalidad exclusiva. Río Vivo reacciona al caudal ecológico y calidad, no a la asignación extra aislada.

## Baseline y recuperación

Para la partida activa: capturar valores escalares `{turn, publicTrust, basinHealth, money}` inmediatamente antes de `engine.resolveSeason()` (después de eventos y compras). Obtener `engine.previewSeason()` en ese mismo momento es puro: usa clima ya calculado, no dibuja PRNG ni muta estado. Su `newPublicTrust` es confianza antes de misión; compararlo con baseline da cambio hidrológico tras topes. Confianza final menos `preview.newPublicTrust` es bono efectivo de misión, que puede ser cero por techo. El cambio de dinero entre pre/post resolución mezcla misión y, en otoño, cierre anual; no rotularlo como ingreso sectorial de la ronda.

Ese snapshot puede quedarse en UI asociado al turno, sin nuevos campos persistidos ni schema. Tras recuperar una estación resuelta no habrá snapshot; omitir delta y mostrar explicación cualitativa. No usar estación anterior como reemplazo: incluye efectos previos al reparto. Reconstrucción exacta requeriría replay autorizado del registro completo en motor independiente y no merece su complejidad para este cambio.

Si se muestra contribución nominal por factor, distinguir «aporte al cálculo» de «cambio real». Factores pueden cancelarse o recortarse por piso/techo. Es preferible delta agregado exacto con motivos y sin atribución por sector.
