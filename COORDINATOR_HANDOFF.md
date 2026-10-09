# Traspaso de coordinación — Cuenca Viva

## Actualización vigente — 8 de octubre, revisión modelo 2.4

El coordinador actual es `01a11975-1649-73e0-85d8-5e089ebe3de9`. Las secciones inferiores conservan el traspaso histórico. Se retomaron y cerraron los pendientes de bloqueo (`01a119e0-91a6-7b90-a334-dfd563352f49`), recuperación (`01a119de-677d-7592-b470-547a36ad00de`) y eventos (`01a1199a-6ba9-7c43-90be-324cd62c8db1`), con correcciones enviadas a esos mismos chats e integración sólo desde este coordinador. No recrearlos ni reactivar tareas completadas por su mera antigüedad.

Raíz conserva árbol sucio y trabajo previo, sin commits/reset. Modelo 2.4: compuertas persistentes, bloqueo real DOM/Phaser durante resolución/modales, forecast coherente con riesgo, ampliación contextual y saneamiento separado. Recovery local verificado por replay para nuevas partidas. Eventos sin spoilers, efectos reales después; sólo fugas usa recepción social contextual seeded y opción permanente de renovación a precio de catálogo. Coeficientes nuevos sociales justificados en GAME_RULES y entrega; hidrología sin cambios.

Build y tsc pasan; npm41/41, recovery11/11 y lock7/7 raíz final. QA real IAB: bloqueos, persistencia de pedidos, recargas con pedidos/resolución/evento/cierre anual, inversión anual, reinicio corregido y renovación desde evento con teclado y recuperación exacta del nivel/precio. Detalle y límites en `artifacts/player-review/model24-review.md`, `artifacts/session-recovery/REVIEW.md`, `artifacts/event-decisions/REVIEW.md`. Se añadió dispatch de celebración en handler evento y cierre modalWelcome en Restart; esos cambios finales son posteriores al candidato de eventos. No reaplicar paquetes anteriores sobre raíz final.

HMR desactivado: cambios requieren recarga manual. Partidas con fuentes antiguas pueden ser incompatibles y la copia original se conserva. No se afirmó causa del cierre inesperado, recuperación retroactiva, diversión demostrada ni QA móvil completo. Se analizó la partida suministrada para diagnóstico; guardado local es una mejora separada ante pérdidas. Próximo paso de producto: playtest humano de claridad/diversión, y estudiar valor de ampliar embalse con estrategias representativas (18 referencias actuales sin desborde no prueban inutilidad universal). IAB propio en http://127.0.0.1:3000, no se controló la partida humana en Edge.

Estado al traspaso del 8 de octubre de 2026 (trabajo iniciado el 7). Este documento transmite decisiones del usuario y evidencia conocida; no sustituye leer entregas actuales ni AGENTS.md. El usuario pidió explícitamente un coordinador nuevo porque este chat acumuló demasiado contexto. El coordinador anterior deja de despachar trabajo tras el traspaso.

## Proyecto y método acordado

- Workspace compartido: `D:\hackaton`, proyecto Codex `c2931898-3547-483b-ab6f-0ea99a0d94b3`, host `local`. Coordinador anterior: `01a10d6d-1743-7121-89e5-bd281e7fef06` (Coordinador).
- Usuario: Hector. Quiere colaboración autónoma, pocas preguntas innecesarias y entregas concretas. Autoriza crear chats de implementación distintos y enviarles correcciones. Método: una implementación por chat, leer entrega, revisar código/resultado, corregir en ese mismo chat si hace falta, recién después otro chat para otra implementación. No duplicar chats para retomar una tarea existente.
- Puede ausentarse y dejó autorización de continuar hasta una duda que requiera su decisión. Mensajes durante trabajo son steering, no borran el objetivo anterior.
- Cuidar límite de cinco horas. Astra fue pedido explícitamente con razonamiento bajo y consulta breve; no usarlo para grandes ejecuciones ni dejarlo en ciclos de revisiones.
- No continuar todas las ideas a la vez. Prioridad actual: revisión crítica de comparación, balance estacional y dificultad ANTES de nuevos cambios de gameplay. No hay coeficientes nuevos aprobados o justificados todavía.
- Respetar AGENTS.md: cambio mínimo, preservar working tree, conservación de masa, todas las llamadas gameplay PRNG seeded; efectos UI no deben consumirlo. No simplificar sistemas/sectores. Cambios de balance deben justificarse explícitamente.
- Git tiene MUCHOS cambios sin commit de todos los chats (motor, datos, UI y artefactos); no resetear, sobrescribir ni limpiar. HEAD solo no representa el código ensayado.
- Servidor Vite `localhost:3000` se mantuvo disponible según últimas entregas; verificar si se necesita, arrancar oculto si hace falta, no asumir vivo. El usuario se frustró cuando terminó una tarea y no pudo probar por servidor detenido.

## Qué es Cuenca Viva

Juego web educativo conceptual, TypeScript/Vite/Phaser, mapa diorama como interfaz principal, compuertas/sliders contextuales. Cinco años, cuatro estaciones, veinte turnos. Sectores: Ciudad, Cultivos, Granja/ganadería, Mina y Río Vivo (caudal ecológico, no quinto consumidor económico). Nieve/deshielo, lluvia/escorrentía/infiltración/evaporación, río, embalse, acuífero, retornos y calidad; obras, pronóstico, eventos, metas, Heraldo, informes estacionales/anuales/finales.

Motor desacoplado. Modelo `SimulationEngine.MODEL_VERSION = '2'`. Constructor escenario/semilla/modo aula; escenario usual `cuenca_central`, semilla `AULA-2026-001`. Clima, pronóstico y eventos tienen RNG separados. Las decisiones pueden cambiar elegibilidad/opciones de eventos sin cambiar secuencia meteorológica. Escenarios también `cuenca_arida` y `cuenca_abundante`.

Abastecimiento real: captación directa del río, después embalse con entrega automática limitada, después acuífero. El agua aguas abajo incluye paso por río y retornos, además de otros flujos registrados por motor. Pedir aporte adicional al humedal cero NO significa río seco. Agua no asignada en el presupuesto NO se almacena automáticamente en igual cantidad: el presupuesto incluye capacidad de extracción, no un montón de agua nueva que entra cada turno.

No convertir gotas a litros de Ullum para corregir balance: discutimos escala y el usuario reconoció confusión. Gotas son abstracción; comparar stock/demanda/aportes/tiempo requiere contexto de cuenca. No afirmar que se validó hidrología regional ni aprendizaje escolar.

## Reclamo principal y dirección actual del usuario

**Última condición explícita (8 de octubre):** si aliviar la dificultad vuelve la simulación fantasiosa o irreal, NO hacerlo. Es educativo y no debe alejarse demasiado de la realidad. La jugabilidad no autoriza inventar agua, garantizar recuperaciones ni falsear el funcionamiento hidrológico. Cada ajuste necesita plausibilidad conceptual, conservación y explicación; separar calibración jugable de validación regional. Si no hay fundamento suficiente, identificar la incertidumbre y solicitar evidencia/asesoría en lugar de afirmar que el ajuste es realista.

Desde el primer invierno el usuario siente que abastecer sectores cotidianos liquida embalse, obliga a restricciones drásticas y castiga continuamente. Inicialmente intentamos mejorar explicación; ahora reconocemos que claridad no resuelve dificultad/desproporción. No culpar al jugador ni asumir que simplemente jugó mal.

Quiere consecuencias proporcionales y comprensibles, no facilidad sin consecuencias ni apocalipsis constante. Gestión razonable en condiciones normales debe tener margen para abastecer, aprender y recuperarse. Sequías prolongadas/consumo excesivo pueden llevar a crisis; aportes suficientes/deshielo deben permitir recuperar reserva. Seeds extremos tipo jefe difícil son aceptables si no son toda la experiencia y se identifican con honestidad. No garantizar llenado tras cada lluvia ni éxito en toda semilla.

Investigar: proporción de demandas frente a entradas, reglas de retiro automático/preferencia embalse, recuperación estacional, crecimiento, sugerencias, metas/confianza y premios. Conservar masa no prueba que relaciones tengan sentido jugable. No remediar con agua gratis, simple multiplicación de todo, textos alegres o castigos extra. No anunciar balance roto o impossibilidad global sin evidencia multi-política/escenario.

Humor amable/sarcástico apto chicos es parte importante del producto. Heraldo y resúmenes deben hacer amenas estaciones ordinarias y dificultades moderadas, con hechos reales, sin humillar al niño ni convertir todo en tragedia. Mostrar logros y valor de obras: ‘ahh esto sirve’. No recetas ‘comprá X para ganar’.

## Chats prioritarios — consultar directamente por ID

`list_threads` reciente omitió varios chats creados por herramienta: su ausencia NO indica que no existen. Usar read_thread/wait_threads IDs exactos. No recrearlos.

1. **Revisar balance estacional y dificultad** — `01a1196e-c075-7131-b9f9-4874ddce0919`, host local. ACTIVO en último snapshot. Sólo diagnóstico y propuesta, sin tocar coeficientes/UI. Carpeta prevista `artifacts/balance-review`. Última actualización: matriz fijada de108 trayectorias (6semillas ×3escenarios ×6políticas), cada una repetida y replay; clasifica clima por aportes observados con umbrales descriptivos. Leer prompt/entrega para detalles. Debe contrastar realidad con fuentes primarias, separar escasez física/reglas/política, evaluar entrada-retiro-recuperación, premios y proponer mínimos ajustes con criterios de aceptación. Revisar que clasificación/sampling no seleccione resultados convenientes.
2. **Astra: ideas para balance y diversión** — `01a1196f-ce61-75d2-b313-7e44d9377318`, modelo `gpt-6-astra`, thinking low. YA TERMINÓ mientras preparábamos traspaso. Una consulta breve sólo diseño, no implementación ni simulaciones. Entrega aún no leída completa por coordinador anterior: leer final. Inicio: A/B no prueban inviabilidad, C muestra desplazamiento de privaciones; mayor señal es discrepancia entre premios/confianza y sectores sin suministro. Propone máximo4 ajustes existentes, entre ellos reconocimiento de logros parciales sin declarar prosperidad y función estacional del embalse; incluir tradeoffs/aceptación y humor. No asumir aprobación por ser Astra.
3. **Comparar estrategias con registro reproducible** — `01a11918-ec0d-7203-9ce3-f7b7c50ba600`, COMPLETO, incluyendo corrección/control. Artefactos y evidencia abajo. Se puede pedir corrección en mismo chat; usuario autorizó. Motor/UI no modificados.
4. **Restaurar rótulos cartográficos** — `01a11814-1efe-7072-8555-feb9e10e6148`, COMPLETO verificado al traspasar. Placas suaves decorativas seis: Río principal, Toma de agua, Canal al embalse, Embalse, Canal de reparto, Pozo. Sólo main.ts/style.css; móvil oculta secundarios conserva río/embalse; targets físicos y gotas intactos. Reportó visual1920×1080/390×844, build/tsc29tests/diffcheck; capturas `artifacts/labels-desktop.png`, `labels-mobile.png`. Pendiente aceptación visual del usuario; no prometer belleza lograda. Antes otro chat eliminó labels cuando pidió mejorarlos: usuario se molestó, no repetir eliminación como solución.

## Comparación de estrategias: evidencia ya revisada

Carpeta `artifacts/strategy-comparison`: `policies.json`, `run.cjs`, `manifest.json`, `policy-A.json`, `policy-B.json`, `summary.json`, `turns.log`, `exogenous.json`, `report.md`, original separado y validaciones. Corrección exploratoria: `control-suggestion.cjs`, subcarpeta `exploratory-suggestion` con control-C, logs/replay/hash/report. Cada corrida20turnos, misma semilla/escenario/modo. Hash combinado original `18f4c8dc78311600aa6115d2d095f8cedb23b40e7e7079951fae15d2e6674e06`; HEAD `061cc84e1c85ef70b0bf7a4c451eced14e17d977`. Fuentes/datos sin commit incluidas en manifest; no cambiar las políticas tras mirar resultados.

A: pretende cobertura completa, compra ampliación y saneamiento, raciona proporcionalmente si supera presupuesto. B: eficiencia urbana/minera, luego agrícola, prueba factores productivos100→70% para pisos embalse30%/acuífero40%; si falla elige70%. Ambas misma regla prefijada de opciones de eventos.

Resultados A/B: ciudad media41.0/65.8%; río90.9/97.6%; acuífero final50/64; bombeo168/153; calidad final84/68; compras225/335; embalse final2 ambos; confianza10 ambos. B piso incumplido19/20 y factor70%20/20. No son estrategias óptimas ni prueba de imposible supervivencia. A compra capacidad sin excedentes; prioridad urbana deB pierde fuerza al racionar; aporte ecológico se calculó antes de escalado y no se revisó después (limitación runner, NO bug del juego).

Coordinador repitió `node artifacts/strategy-comparison/run.cjs`: misma identidad y resultados, assertions pasaron. Runner registra acciones legales, compras fallidas/exitosas, eventos/elegibilidad/elecciones, demandas/suministros/coberturas, balances/estados por turno, hashes, repeticiones y replay sin previews. Conservación/meteorología iguales.

Control C posterior/exploratorio mantiene compras efectivas y eventRuleB, usa `suggestDistribution(engine, metaActual)` real. Ciudad99.7%, río100%, acuífero96, confianza100, bombeo93; cultivos28.2%, ganadería27.5%, minería23.6%, muchos ceros; embalsefinal2. Calidad64. Presupuesto677 frente179B, por premios/subsidios condicionados adicionales. Esto identifica mejores resultados urbanos/ecológicos a costo productivo, no equilibrio ni prosperidad general. C fue leído en informe pero no repetido por coordinador anterior; chat reportó replay/determinismo/masa y29tests/build/tsc.

## Implementaciones hechas y pendientes de aceptación

- Resumen hídrico por estación muestra inicio, entrada al embalse, retiro abastecimiento, evaporación, final; acuífero recarga/bombeo, aguas abajo/retornos. Usuario confirmó que ahora se entiende y compras correctas. Presupuesto disponible visible en catálogo.
- Primera meta original embalse>40% obligaba restricciones; reemplazada por Ciudad95% + conservar30gotas absolutas. Primer reparto específico22/6/4/8/0 (comprobar archivo actual), no ‘cerrar todo’. Meta no resuelve balance completo. Misión y reservas al ampliar capacidad deben usar criterios explícitos.
- `src/suggestedDistribution.ts`: sugerencia UI pura, corrige sobrante ecológico hacia meta/ciudad sin empeorar reservas/eco/déficit; tests. Aun así C deja productivos sin agua frecuentemente: pendiente evaluación, no declararla óptima.
- Mapa ahora río natural izquierdo, red compartida de abastecimiento derecha cercana a ramas/compuertas, captación antes del embalse, canal al embalse, salida automática física pasiva en presa, pozos respaldo abajo, retornos sectores→río. Compuertas de reparto en ramas son distintas de salida presa. No mover todas a presa por confusión del usuario: aceptó corrección conceptual.
- Quitadas grandes flechas clickables ambiguas en cauces; interacción debe pertenecer a obras físicas/sectores, no etiquetas decorativas. Verificar destinos de targets si user reporta regresión. Línea amarilla hacia humedal era confusa, retirada/corregida en limpieza según entregas (confirmar código antes de explicar).
- Obras progresión visual N1/N2/N3: el usuario pidió explícitamente distinción, implementada reportada, aceptación humana pendiente. Resumen ‘Tus obras este turno’ hasta2 aportes: recarga artificial exacta, saneamiento calidad retorno urbano, circuito cerrado mineríaN3 cuando abastecida y retorno0; no inventar ahorro de riego sin atribución demostrable.
- Heraldo120 titulares (15×8categorías), selección presentación determinista, no consumoPRNGgameplay; calidad grave prioriza portada, caídasleves pueden secundarias; fuera jerga ‘índice del juego’. Usuario seguía queriendo más humor, se pulió pero falta prueba de gusto/diversión. No usar humor para maquillar crisis permanente.
- Tutorial9→4acciones, separado del RNGpartida. Pronóstico simplificado y puede fallar; sensores mejoran previsión sin cambiar clima. Informe final compacto + detalles, semilla/escenario/modelo, coberturas todossectores, reservas/calidad/obras/hitos/preguntas.
- Belleza visual aún pendiente: usuario quiere mapa más agradable quizá Blender/assets, pero sin elección de pipeline. Hidroelectricidad fue idea discutida, NO prioridad ni implementación aprobada; evitar grandes sistemas antes de balance/legibilidad.
- Usuario pospuso prueba humana de almenos1año hasta mapa limpio. Aún no hay validación humana completa20turnos ni aprendizaje medido. No reemplazarla por tests del motor.

## Otros chats de referencia (completos según entregas previas)

- Pulir etiquetas y flujos: `01a1180a-9bd3-76f1-b32b-60a25f7bf981`.
- Pulir el Heraldo del Valle: `01a11796-71db-7b80-a56e-9e2353077d91`.
- Mostrar aporte de mejoras: `01a1178c-b515-7200-b4e0-796f69c09865`.
- Distinguir presa y compuertas: `01a11786-99e3-7bd2-9427-c93ab0757736`.
- Reordenar red hídrica: `01a11743-91cd-75e0-b5f5-4262484ebc12`.
- Preparar borrador de presentación: `01a1173e-a411-7701-8d08-2a10771d894b`: outline completo, PDF esperaba aprobación; no asumir interrupción por límite ni recrear.
- Preparar postulación de Cuenca Viva: `01a11885-507c-75b0-a59c-6062809cbfcf`, cwd mismo proyecto, projectIdnull. Usuario autorizó preguntas a ese chat. Su crítica de comparación motivó esta revisión.

## Concurso y presentación

Registro confirmado por correo del usuario: equipo Enkisatima, postulaciónC038C7, desafío **2. Entorno educativo para la gestión de cuencas**, representante Hector Leonardo Pons Riili, SanJuan. Hubo confusión1/2 y segunda preferencia; ya aclarado, no reabrir tema ni alterar registro. Oct9 cierre inscripción; Oct16 aviso selección; Oct19–Nov8desarrollo/mentorías; Nov9entrega; Nov18pitchCECI8:30; Nov19premiaciónFNS. Correo indica no entregar nada ahora.

Comparación de estrategias defendible exige mismo seed/escenario/modo/código/horizonte + decisiones registradas; no equivale a estudiantes aprendieron ni precisión regional. Fuentes primarias verificadas: https://www.ciclopilares.com.ar/hackathon/desafios ; ORSEP https://www.argentina.gob.ar/sites/default/files/orsep-crecer-junto-al-dique-2024.pdf ; INA Ullum https://www.argentina.gob.ar/node/388203 ; HidráulicaSJ actas https://hidraulica.sanjuan.gob.ar/normativas/Actas/Actas%202026.pdf?ver8= . SanJuan requiere tener en cuenta nieve/deshielo y poca lluvia local; no extrapolar un dique real a todo el modelo sin datos.

## Próximos pasos del nuevo coordinador

1. Leer AGENTS y este documento; consultar entrega completa de Astra y estado/entrega auditoría vigente, sin nuevos duplicados.
2. Revisar evidencia, no sólo finales de chats. Contrastar propuestas de Astra con diagnóstico cuantitativo. Pedir correcciones puntuales al mismo chat si hay conclusiones exageradas, cambios fuera de scope o políticas poco representativas.
3. Dar al usuario síntesis clara: causas demostradas, hipótesis, propuesta mínima de balance/progresión y qué experiencia normal/seca/extrema queremos. No prometer solución por explicación únicamente.
4. Tras propuesta concreta/justificada, continuar implementaciones en chats separados secuenciales; no tocar motor simultáneamente desde dos chats. Registrar versión/cambios, comprobar determinismo/masa/progresión y comparar antes/después, no elegir sólo seeds favorables.
5. Confirmar estética mapa/labels/mejoras y preparar prueba humana. Luego presentación basada en evidencia real.

## Validaciones conocidas y documentación vieja

Scripts reales npmtest29/29, npmrunbuild y npx--no-installtsc--noEmit (usar espacios normales). Chatstrabajo reportaron checks; coordinador ejecutó npmtest y runnerA/B en esta revisión. Build tiene advertencia tamaño bundle, sin error. No inventar validación visual de este coordinador.

ROADMAP/CHANGELOG contienen secciones históricas obsoletas (10años,9fases,agua sobrante almacenada, etc.). Código/entregas actuales mandan. ROADMAP vigente dice dificultad puede mantenerse y auditoría cerrada sin bug: nueva revisión reabre balance con evidencia, no asumir esa frase prohíbe ajuste justificado. Actualizar documentación cuando se concrete decisión, sin repetir todo historial.
# Actualización modelo 2.5

Revisión del jugador cerrada en `artifacts/player-review/IMPLEMENTATION-2.5.md`: resumen sin indicadores duplicados y detalles plegados; Heraldo absurdo; mapa expresivo ligado a resultados; descarga final corregida y probada con veinte estaciones; transferencia fluvial interna 10% didáctica con sensibilidad y conservación. Tests 49+22+11, TypeScript y build pasan. Preservadas fuentes/evidencia 2.4; revisión experta y piloto escolar siguen pendientes.

