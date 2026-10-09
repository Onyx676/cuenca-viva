# Expediente para revisión científica externa

Versión examinada originalmente: Cuenca Viva 2.4, revisión documental 2026-10-08. Actualización de implementación: modelo 2.5, infiltración fluvial descrita abajo. Estado: **revisión externa pendiente; no hay aval ni calibración regional concluida**. Este expediente no constituye una validación científica. Su finalidad es permitir una revisión acotada y trazable del entorno educativo. La matriz siguiente conserva el diagnóstico original 2.4; las omisiones fluviales allí señaladas fueron abordadas técnicamente en 2.5, sin sustituir revisión experta.

## Objeto y alcance solicitado

Evaluar si el recorrido modelo → decisión → consecuencia → aprendizaje es conceptualmente correcto para enseñar gestión de agua y recarga subterránea, usando la cuenca del río San Juan y el Valle de Tulum como caso real de referencia. Las gotas, capacidades, demandas y umbrales del juego son unidades y reglas conceptuales. No convertirlas a hm³, niveles freáticos ni probabilidades regionales sin datos y un proceso independiente de calibración.

No se solicita validar un gemelo digital predictivo, recomendar concesiones reales ni certificar una intervención. Tampoco se pretende que una revisión científica sustituya la prueba con estudiantes o equipos escolares.

## Material a enviar al revisor

- Versión exacta del código revisado, hash de commit cuando exista o manifiesto de hashes de archivos de la entrega; no afirmar que la carpeta compartida y cambiante es una versión congelada.
- `src/simulation/WaterSystem.ts`, `RainSystem.ts`, `SnowSystem.ts`, `DemandSystem.ts`, `SimulationEngine.ts`, `src/models/Balance.ts` y `src/data/scenarios.json`; ecuaciones y orden de operaciones en `GAME_RULES.md`.
- Informe territorial y fuentes verificadas: `artifacts/hackathon-readiness/science-review.md`.
- Capturas del caso real y de los balances del juego, consignas de aprendizaje y resultados de la comparación sin/con obra con protocolo reproducible, si ya están disponibles.
- Resultados técnicos ejecutados, sus comandos y limitaciones. La conservación de masa es consistencia interna; un test aprobado no certifica representatividad territorial.

## Matriz para discutir

| Mecanismo | Caso real respaldado | Modelo 2.4 observado | Riesgo pedagógico / revisión requerida |
|---|---|---|---|
| Fuente cordillerana | Nieve y hielo contribuyen al río; IANIGLA documenta reservas sólidas en la cuenca | SnowSystem: reserva nival agregada y deshielo hacia río | No equiparar nieve estacional con glaciar/permafrost ni afirmar su contribución relativa simulada |
| Almacenamiento superficial | Embalses regulan aportes y entregas | Embalse agregado con entradas, evaporación, extracción y desborde | No representa cascada real, cotas operativas, sedimentación ni obras individualizadas |
| Recarga natural subterránea | San Juan/Tulum: infiltración del cauce sobre tramo permeable; además canales y riego | WaterSystem: infiltración de lluvia ×0.85 | Falta causalidad deshielo→río→acuífero; no es sólo ausencia de intercambio bidireccional |
| Recarga gestionada | Una liberación superficial dirigida a zona permeable puede alimentar el acuífero | Obra deriva escorrentía pluvial aún no incorporada al río y cambia partición de lluvia | No representa liberación de Ullum; explicitar origen de cada gota y evitar atribuir beneficio real sin calibración |
| Bombeo y reservas | Extracción superior a entradas reduce reservas; distintos acuíferos tienen comportamiento diferente | Reserva subterránea única, finita; bombeo para cubrir déficit | No calcula energía, subsidencia, salinidad ni confinamiento; porcentajes de estrés son de diseño |
| Descarga subterránea | Informe CIGIAA describe arroyos Tapones/Agua Negra que vuelven al río | Desborde al superar capacidad; caudal base externo independiente | Desborde no equivale a flujo regional por gradiente; el caudal base no prueba conexión con la reserva modelada |
| Demanda, consumo y retornos | Menor extracción bruta no implica igual ahorro neto de cuenca | DemandSystem reduce necesidades; WaterSystem aplica fracciones sectoriales de consumo/retorno | Distinguir demanda, pedido, suministro, extracción, consumo y retorno; canal revestido omite pérdida de recarga útil |
| Continuidad ecológica | Agua en cauce alimenta procesos y humedales aguas abajo | Caudal aguas abajo incluye bypass, desbordes y retornos; calidad se evalúa aparte | Cobertura 100% no certifica estado ecológico real ni calidad suficiente; recarga fluvial aún desconectada |

Fuentes primarias principales: [IANIGLA/CONICET, Ansilta](https://bicyt.conicet.gov.ar/fichas/produccion/en/8426231); [Plan provincial, noviembre 2023, p.12](https://hidraulica.sanjuan.gob.ar/Plan%20de%20Gesti%C3%B3n%20Integral%20de%20los%20Recursos%20H%C3%ADdricos.pdf); [INA, Ullum, julio 2023](https://www.argentina.gob.ar/noticias/dique-ullum-el-ina-participo-en-tareas-de-recuperacion-de-volumenes-en-los-acuiferos); [CIGIAA/UNSJ, marzo 2026, pp.1–2](https://exactas.unsj.edu.ar/wp-content/uploads/2026/03/CIGIAA-Sexto-Informe-Tecnico-de-Coyuntura-1.pdf). Son sustento de relaciones conceptuales, no avales del juego ni parámetros de calibración.

## Preguntas concretas

1. ¿Qué relaciones debe poder explicar un alumno al terminar para no llevarse una idea errónea de la recarga en San Juan/Tulum? ¿La transferencia fluvial 2.5 y sus limitaciones visibles alcanzan para enseñar el caso real sin sugerir calibración regional?
2. ¿Un único depósito subterráneo sirve al objetivo de esta demo si se declaran confinamiento, gradientes y tiempos de tránsito omitidos? ¿Qué afirmaciones deberían retirarse?
3. Para representar infiltración fluvial, ¿qué tramo y posición en la secuencia de captación/embalse/bypass son conceptualmente defendibles? ¿Qué condicionantes mínimos deben aparecer, sin simular falsa precisión?
4. ¿Qué forma funcional mínima y qué rango de sensibilidad son razonables como hipótesis didáctica? ¿Qué datos faltarían para convertirlos en parámetros regionales? No pedir al revisor que invente un coeficiente único avalado.
5. ¿Cómo expresar saturación, recarga efectiva y retorno/excedente sin sugerir que acuífero lleno significa que todo intercambio cesa físicamente?
6. ¿La comparación tecnológica distingue apropiadamente reducción de demanda y extracción de reducción de consumo neto? ¿Qué omisiones sobre retornos y recarga por canales invalidan conclusiones específicas?
7. ¿El caudal ecológico y los índices de calidad/salud son suficientemente claros como indicadores conceptuales separados? ¿Qué usos del término “estrés hídrico” exceden lo representado?
8. ¿Qué errores son críticos para entregar y cuáles son simplificaciones admisibles con declaración? Registrar desacuerdos, no forzar una aprobación binaria.

## Diseño mínimo implementado en 2.5: río→acuífero

**Implementado como supuesto didáctico, pendiente de revisión científica externa.** Se mantienen todas las entradas existentes y se registra `aquiferRiverRecharge` como transferencia interna desde un tramo permeable después de la toma y la retención del embalse, antes de bombeo, retornos sectoriales y evaluación ecológica. El coeficiente es 0.10, con redondeo entero y límite por agua remanente y espacio subterráneo tras recarga de lluvia/obra. Esto aproxima un cauce con agua remanente; no replica el orden geográfico exacto de San Juan, ni gradientes, tiempos de tránsito o recarga de canales/riego. El 10% no deriva de una medición regional.

Definir `riverRecharge` como volumen transferido desde ese tramo al acuífero. Debe estar acotado por el agua del cauce elegible; si se modela sólo recarga efectiva a capacidad disponible, también acotarlo por espacio subterráneo después de las otras recargas. Restar exactamente `riverRecharge` del bypass que antes continuaba aguas abajo, sumarlo al acuífero y contabilizarlo separado de infiltración de lluvia/recarga gestionada. Bombeo sucede después de estas entradas. Para exceso o desborde, establecer un destino único; nunca sumar recarga bruta al acuífero y conservarla también en el río. El límite por capacidad es una simplificación del depósito, no una ley de acuíferos reales.

No desviar automáticamente una fracción del deshielo original antes de las tomas, pues escondería la decisión que controla el agua disponible en el tramo y alteraría captación/retención sin evidencia. Tampoco hacer depender la nueva recarga del PRNG. Un parámetro determinista permite sensibilidad sin modificar la secuencia climática. No agregar otra moneda, obra o botón de bombeo para resolver esta brecha.

El efecto no tiene por qué mejorar todos los indicadores: aumenta una entrada subterránea a costa de agua que antes avanzaba por el cauce; puede disminuir caudal aguas abajo y modificar bombeo/reservas. Debe evaluarse ese intercambio, no asegurar “más recarga = mejor partida”.

Revisar conjuntamente allocationBudget/vista previa, Balance, etiquetas de origen de recarga, resumen/replay, registro/exportación y comparador. Un cambio de secuencia puede afectar entregas y requiere nueva versión del modelo e incompatibilidad explícita con copias anteriores. No copiar porcentajes descriptivos de la bibliografía como una tasa estacional del juego.

## Experimento de sensibilidad posterior

Se ejecutó una grilla de supuestos de diseño 0/10/20/30%, sin equivalencia regional, contra fuentes congeladas 2.4. El informe y runner están en `river-recharge/REVIEW.md`: 1920 resoluciones y 49 casos extremos. Para 10%, con pedidos idénticos, hubo 4–6 gotas de recarga fluvial en veinte estaciones, reserva subterránea final +0–6 y agua aguas abajo 0 a −6; bombeo y cobertura productiva no cambiaron. Es una elección conservadora de diseño, no un porcentaje de ahorro ni un coeficiente avalado. Forma, límites y rango deben discutirse con el revisor externo; modificarlo después requiere repetir sensibilidad y pruebas.

Mantener escenarios, semillas, calendario de clima y protocolo de acciones comparables. Dos políticas predeclaradas: pedidos literales idénticos para aislar cambio físico y cobertura objetivo idéntica con cálculo de pedidos explícito para observar adaptación. Mantener eventos exógenos y compras fijos cuando legalmente posible; si una opción deja de ser legal por presupuesto/estado, registrar divergencia y no llamar al caso comparación causal pura. Evaluar cada semilla para todos los candidatos, sin cambiar la muestra al ver resultados.

Registrar 20 estaciones en tres escenarios, semillas de diseño y otras reservadas para comprobación; demanda, pedido y suministro por sector; tomas de río, retiro de embalse, bombeo acumulado; consumo y retornos; recarga por origen; reservas finales/mínimas; caudal y calidad aguas abajo; cobertura; presupuesto y compras. Mostrar distribución y casos extremos, no sólo medias. Acompañar la secuencia de balances para explicar dónde se desplazó cada gota.

## Criterios de aceptación técnica antes de adoptar el flujo

- Igual semilla, escenario, parámetros y acciones produce estado/exportación idénticos. Preview no muta estado ni PRNG; la nueva transferencia no consume sorteos.
- La secuencia climática y de catálogo de eventos permanece igual frente al control pareado, salvo cambios de elegibilidad causalmente documentados.
- Identidad de masa concilia cada estación y acumulado; no hay agua negativa, transferencia superior al cauce elegible ni doble contabilización de excedentes.
- Casos sintéticos: sin río, sin nieve, lluvia cero en entrada de sistema, acuífero vacío/lleno, ninguna asignación, solicitudes excesivas, recarga gestionada simultánea y redondeos pequeños. No confundir lluvia cero sintética con escenario climático del juego, que impone un mínimo.
- Caudal aguas abajo más transferencia coincide con el flujo previo a la división, descontando únicamente salidas ya declaradas. La fuente nival puede contribuir a recarga cuando hay paso de agua; con paso cero, esa transferencia es cero.
- Preview y resolve concilian, replay reproduce la misma partida y se completan los 20 turnos/años/cierre en todos los escenarios. Build, TypeScript y tests pertinentes ejecutados y registrados.
- Las tarjetas separan recarga fluvial de lluvia/obra y explican por qué una reserva o el río cambió. No llamar ahorro a una transferencia de almacenamiento.
- Sensibilidad sin estados imposibles ni avance bloqueado. Cambios de cobertura/dificultad justificados; cumplimiento de metas y diversión requieren observación de usuarios, no quedan validados por completar los turnos.

## Registro pendiente

| Campo | Estado |
|---|---|
| Persona revisora / institución / especialidad | Pendiente; nadie contactado por este expediente |
| Fecha y versión congelada revisada | Pendiente |
| Alcance acordado | Pendiente: causalidad conceptual y simplificaciones, no predicción |
| Objeciones críticas y recomendaciones | Pendiente |
| Decisiones del equipo / cambios y pruebas | Pendiente |
| Resultado y autorización de cita/atribución | Pendiente; no atribuir aval institucional |
| Prueba de aprendizaje con estudiantes | Pendiente; dependencia distinta |

Cierre defendible mientras esto está pendiente: “Entorno interactivo educativo con conservación interna y fundamentos bibliográficos documentados. Validación experta regional pendiente; no apto para decisiones reales”. La transferencia fluvial 2.5 aborda una omisión conceptual del modelo 2.4; **su implementación y pruebas no constituyen validación científica externa**.
