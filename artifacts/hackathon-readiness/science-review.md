# Revisión independiente: territorio y causalidad hidrológica

Fecha: 2026-10-08. Sólo lectura de producto y fuentes primarias; ninguna fórmula, semilla o archivo de simulación modificado. Líneas corresponden a la revisión del modelo 2.4, antes de cambios de esta tanda.

## Diagnóstico comprobado

El proyecto ya representa almacenamiento finito, nieve estacional, deshielo, lluvia, captación, bombeo, consumos, retornos, calidad y continuidad aguas abajo. Hay una identidad de conservación explícita en `src/simulation/WaterSystem.ts:307` y se informa su error en cada balance. Esto permite enseñanza conceptual, pero no aporta por sí mismo calibración ni validación científica externa.

Los nombres y parámetros actuales son genéricos: `src/data/scenarios.json:4` Valle Central, `:38` Oasis Cordillerano Árido, `:72` Lagos del Sur. Ningún escenario identifica una cuenca real. El árido afirma agua proveniente de deshielo y acuíferos profundos (`:39`), pero el código representa una reserva subterránea agregada, sin acuíferos libres/confinados ni profundidades. No hay base para llamar a su partida una simulación del acuífero de Tulum.

El flujo observado es:

1. `SnowSystem.ts:30–49`: nieve acumulada, deshielo y reserva restante; todo el deshielo calculado se dirige al río.
2. `RainSystem.ts:42–75`: lluvia particionada entre suelo, escorrentía y evaporación; 45% de la escorrentía se incorpora al río. Captación y recarga gestionada cambian la partición de lluvia.
3. `SimulationEngine.ts:266–297`: ensambla estos aportes y el caudal base externo de cabecera. `:516–528` los entrega al balance.
4. `WaterSystem.ts:85`: río = deshielo + lluvia directa derivada de escorrentía + caudal base. `:102–108`: toma, retención en embalse y bypass aguas abajo.
5. `WaterSystem.ts:122–128`: recarga natural = 85% de infiltración del suelo; recarga artificial se deriva de escorrentía que todavía NO ingresó al río. El acuífero no recibe deshielo fluvial, pérdidas de canales ni percolación de riego.
6. `WaterSystem.ts:131–135`: recarga, desborde y bombeo; `:251–255`: desborde y retornos suman caudal aguas abajo. El caudal base no se descuenta del acuífero: es entrada externa. El desborde es una representación de descarga agregada, no intercambio bidireccional controlado por gradientes.

Observación adicional: `soilInfiltrationRate`, `surfaceRunoffRate`, `evaporationBase` de scenarios.json sólo aparecen en datos/tipo GameState, no se consumen en los sistemas revisados. No deben presentarse como parámetros territoriales activos ni ajustar esos campos esperando cambiar el balance.

`GAME_RULES.md:94–96` reconoce correctamente falta de calibración regional, ausencia de validación experta y de intercambio bidireccional río–acuífero. La limitación real es más amplia que “sin intercambio bidireccional”: tampoco hay infiltración unidireccional del río hacia el acuífero.

## Caso territorial recomendado y respaldo verificable

Recomiendo **cuenca del río San Juan, con el acuífero del Valle de Tulum como caso educativo**, por pertinencia a la convocatoria y evidencia primaria disponible. No implica renombrar automáticamente un escenario como réplica física. Presentación sugerida: “Caso real de referencia: río San Juan y Valle de Tulum. Juego conceptual, no calibrado; mapa esquemático y actores agregados”.

- [IANIGLA/CONICET, informe inventario de la subcuenca de Ansilta](https://bicyt.conicet.gov.ar/fichas/produccion/en/8426231), autores Gustavo Costa, Lidia Ferri, Mariano Castro y Laura Zalazar; ficha y resumen institucional consultados, no PDF íntegro. Ubica Ansilta dentro de la cuenca del río San Juan y documenta reservas sólidas de glaciares/ambiente periglacial. Respalda anclaje cordillerano y separación entre nieve estacional y hielo persistente; no coeficientes ni aval del juego.
- [Secretaría de Agua y Energía, Plan de Gestión Integral de Recursos Hídricos de San Juan, noviembre 2023](https://hidraulica.sanjuan.gob.ar/Plan%20de%20Gesti%C3%B3n%20Integral%20de%20los%20Recursos%20H%C3%ADdricos.pdf), p.12, AT.2. Incluye recarga del acuífero Tulum desde caudal del río San Juan y erogaciones aguas abajo del derivador Ignacio de la Roza. El esquema de balance incluye infiltraciones. Respalda relevancia de gestionar caudal para reserva subterránea; no porcentaje jugable de infiltración.
- [INA, recuperación de volúmenes por liberación desde Ullum, 19 julio 2023](https://www.argentina.gob.ar/noticias/dique-ullum-el-ina-participo-en-tareas-de-recuperacion-de-volumenes-en-los-acuiferos). Documenta liberación hacia zona de recarga y monitoreo mediante perforaciones. Ejemplo de observación real y evaluación de una intervención; no demuestra una eficacia universal ni valida Cuenca Viva.
- [CIGIAA/UNSJ, Sexto Informe Técnico de Coyuntura, marzo 2026](https://exactas.unsj.edu.ar/wp-content/uploads/2026/03/CIGIAA-Sexto-Informe-Tecnico-de-Coyuntura-1.pdf), pp.1–2, autores Facundo Vita Serman, Maximiliano Battistella, Fernando González Aubone, Juan Jesús Hernández y Lucas Guillen. Explica origen cordillerano, río, embalses, derivación y tramo de infiltración Ullum–RN40; menciona recarga por canales y riego y descarga por arroyos. El documento declara revisión por Consejo Científico del CIGIAA: esa revisión corresponde al informe, NO al juego. No trasladar sus porcentajes a coeficientes del modelo.

## Juicio y mínimo defendible

La omisión de infiltración fluvial **sí debilita un objetivo central** si se presenta el juego como representación del río San Juan/Tulum: el alumno podría inferir que mantener agua en el cauce no ayuda a recargar el acuífero, y que la lluvia local es la única recarga natural representada. Bibliografía y un nombre regional por sí solos no resuelven esta causalidad.

Para esta entrega puede avanzarse sin alterar el balance: ficha territorial visible, esquema separado de “caso real” y “reglas de esta versión”, origen de cada recarga con términos precisos y declaración explícita del flujo ausente. Eso permite una demo honesta, pero debe quedar como **brecha pendiente**, no requisito de conexión causal concluido. Glaciares/permafrost, confinamiento, salinidad, tiempos de tránsito, cotas y derechos de concesión son simplificaciones que deben declararse, sin añadir simuladores apresurados.

Si se decide incorporar infiltración fluvial, la decisión debe centralizarse. Especificar primero tramo, orden de operaciones y volumen disponible después de derivaciones; restar exactamente el agua transferida al río/embalse que antes la recibía y sumar el mismo volumen al acuífero; definir saturación y destino del excedente. No usar la fuente territorial para inventar un porcentaje preciso. Revisar también allocationBudget, vista previa, replay, Balance, gráficos, comparación de obras y tutorial. Medir determinismo, balance de masa, mismo clima/PRNG, casos sin nieve/sin río/acuífero lleno y 20 turnos en tres escenarios. No introducir nueva mecánica de explotación ni PRNG sólo para justificar la transferencia.

## Dependencia externa

Preparar un dossier breve para una persona con competencia en hidrogeología/hidrología regional: flujo y ecuaciones, unidades conceptuales, parámetros de diseño, casos sintéticos de conservación, capturas y preguntas de aprendizaje. Solicitar revisión de causalidad y simplificaciones; registrar revisor, fecha, versión, alcance y objeciones sólo cuando efectivamente exista. No contactar instituciones ni afirmar aval sin autorización y respuesta. La revisión bibliográfica realizada aquí no constituye validación experta, calibración regional ni medición de aprendizaje.

No ejecuté build/tests: esta tarea independiente no modificó producto y no pretendió validar técnicamente la simulación.
