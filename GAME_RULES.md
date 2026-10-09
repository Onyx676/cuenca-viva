# Cuenca Viva — reglas y modelo conceptual v2.5

Este documento sustituye la descripción anterior, que contenía porcentajes y beneficios distintos del código. La autoridad de parámetros sigue siendo `src/data` y los sistemas de `src/simulation`. Gotas y dinero son unidades de juego: no hm³, mediciones de potabilidad ni proyecciones profesionales.

Desde v2.1, Valle Central representa menor población, superficie cultivada y actividad ganadera/minera abastecidas: bases 16/23/7/13 en lugar de 25/35/10/20 (65% redondeado). Cada actividad conserva sus necesidades estacionales, calor, obras y pisos mínimos. No es una mejora de eficiencia ni menos agua para la misma actividad. Río Vivo mantiene base15; hidrología, reservas iniciales, extracción y premios conservan sus reglas. La escala es una decisión de diseño sin calibración territorial.

El ensayo reproducible en `artifacts/intro-balance` conserva el modelo 2 previo y todos los candidatos. Bajo la política moderada registrada, el candidato 65% permite recuperación primaveral y cumple las metas orientativas de cobertura en 3/4 semillas normales de auditoría y 2/3 normales nuevas. No garantiza éxito, llenado ni reserva final: la semilla habitual tiene cultivos 68,7% y granja 69,6% medios, embalse final 4/100; la seca nueva baja a 59,2%/61,2%. Esa política de ensayo no es la sugerencia UI: su revisión posterior está en `artifacts/suggestion-review/report.md`. El primer reparto automático y Sugerida se adaptan a la demanda urbana actual; la primera meta conserva Ciudad 95% y 30 gotas absolutas. En AULA-2026-001, el preview inicial sin compras asigna 14/6/4/8/0 y conserva embalse 65→38: esa reserva requiere confirmar el reparto, no se regala agua.

## Partida y decisiones

Cinco años, invierno → primavera → verano → otoño, veinte resoluciones únicas. Cada otoño consolida ingresos e inversiones. No se puede saltar un turno sin resolver ni cobrar dos veces un desafío. Los cinco actores se conservan. Río Vivo representa continuidad aguas abajo; no es otro consumidor económico.

Seleccionar un actor en el mapa abre su slider. El marcador indica demanda/recomendación; la vista previa muestra almacenamiento final y bombeo antes de confirmar, sin consumir azar. “Margen prudente” es oferta menos asignaciones, no agua nueva almacenada. Sobrepasarlo puede usar más acuífero; el límite físico sigue siendo el agua real. Si no alcanza, se raciona proporcionalmente y los restos enteros se distribuyen por orden fijo.

## Entradas climáticas y nieve

Markov y ENSO son abstracciones regionales, no pronósticos. Sus matrices y modificadores permanecen en `climate.json`. El Niño/La Niña no garantizan lluvia local. El pronóstico usa 40/65/85/95% de probabilidad simulada de indicar el estado siguiente; un fallo elige otro estado. Monitoreo no cambia el clima.

| Estación | Cuota lluvia | Cuota nieve | Deshielo base | Evaporación relativa | Caudal base externo |
|---|---:|---:|---:|---:|---:|
| Invierno | .15 | .70 | .05 | .50 | 5 |
| Primavera | .25 | .15 | .55 | 1.00 | 12 |
| Verano | .20 | 0 | .40 | 1.65 | 8 |
| Otoño | .40 | .15 | 0 | .85 | 5 |

Lluvia y nieve son aportes separados del escenario (llanura/cordillera), con ruido seeded entre .90 y 1.10. La nieve acumulada se suma a la reserva antes del deshielo. Anomalía positiva aumenta tasa .05 por grado; negativa la reduce .03. Ola de calor suma .25. Tasa limitada a [0,.95]. Los ceros estacionales ahora se respetan; temperatura puede producir deshielo aunque la base sea cero.

## Destinos de agua y conservación

Lluvia moderada: 44% infiltra, 32% escorre; intensa: 22/63%; prolongada: 40/45%. El resto es evaporación simplificada y absorbe el residuo de redondeo. Captación mueve 8 puntos de escorrentía a infiltración; recarga gestionada mueve 7 puntos, sólo por presencia de la obra.

1. El río recibe deshielo + 45% de escorrentía redondeada + caudal base externo. Este último no se resta del acuífero: es un aporte de cabecera no representado.
2. Captación directa: como máximo 65% del río y nunca más que lo solicitado. Sólo el río restante se divide: 70% hacia embalse y el resto aguas abajo. No se ofrece la misma gota dos veces.
3. Embalse evapora `round(3 × factor climático × multiplicador estacional × fracción llena)`, limitado al agua inicial. Capacidad excedida es derrame aguas abajo. Se extrae hasta 65% del volumen disponible; remanente queda almacenado.
4. Acuífero recibe 85% de infiltración; el 15% restante es evapotranspiración conceptual de suelo. Recarga gestionada deriva 20/35/50% de escorrentía según nivel, limitada a la fracción que no entró al río. En v2.5, un tramo permeable transfiere al acuífero `min(paso del río, round(0.10 × paso del río), espacio subterráneo tras lluvia y obra)`. Se usa el agua restante después de toma y retención del embalse, antes de bombeo y retornos; cada gota transferida se resta del flujo aguas abajo. Desborde subterráneo vuelve aguas abajo. Bombeo nunca excede agua almacenada más recarga. El 10% es un supuesto didáctico, no una tasa medida en Tulum; el límite por capacidad no representa gradientes ni tiempos de tránsito. Se eligió después de comparar 0/10/20/30% y documentar los efectos en `artifacts/hackathon-readiness/river-recharge/REVIEW.md`.
5. Escorrentía no captada continúa aguas abajo. Retornos no se reasignan durante ese turno.

Oferta prudente = captación directa máxima + extracción máxima de embalse tras evaporación/retención remanente + 18% del acuífero inicial. El 18% es una recomendación de gameplay, no rendimiento sostenible calculado.

Balance comprobable por estación:

`embalse inicial + acuífero inicial + nieve inicial + lluvia + nieve acumulada + caudal base = embalse final + acuífero final + nieve final + evaporación lluvia + evapotranspiración suelo + evaporación embalse + consumos + salida aguas abajo`.

`massBalanceError` debe ser cero. Eventos interactivos previos registran por separado cambios reales de embalse/acuífero y entradas/salidas extraordinarias en `waterAdjustment`; son operaciones fuera del reparto normal, limitadas por almacenamiento/capacidad. El exceso de aporte extraordinario no se almacena: queda fuera del volumen incorporado. Ahorrar una extracción evita usar agua, no genera un aporte positivo.

## Uso, retorno y calidad

| Actor | Consumo conceptual | Retorno |
|---|---:|---:|
| Ciudad | 30% redondeado | Remanente |
| Cultivos | 70% redondeado | Remanente |
| Granja | 75% redondeado | Remanente |
| Mina sin recirculación | Remanente tras retorno | 15% redondeado |
| Mina N1/N2 | 65% redondeado de captación neta | Remanente |
| Mina N3 | Toda captación neta; evap./retención de proceso simplificada | Cero vertido |
| Protección del humedal | 15% redondeado como evapotranspiración | Remanente aguas abajo |

La mina anteriormente dejaba sin destino 10%. Ahora se incluye en uso consuntivo/retención de proceso simplificada (no existe tanque industrial persistente). N3 reduce fuertemente la captación neta: no significa consumir todo el caudal bruto del proceso.

Río Vivo se satisface por caudal total que llega aguas abajo: bypass, derrames, escorrentía remanente, desborde del acuífero y retornos. Puede tener continuidad por retornos aunque el slider de protección sea cero; calidad se evalúa aparte. Es una cuenca agregada: no garantiza mínimos en cada tramo.

Calidad de retornos: ciudad 35 sin saneamiento, 70/82/94 con niveles; agricultura 65 u 80 con riego eficiente; granja 60; mina 50 o 75 con recirculación; flujo limpio 95. Se pondera por volumen y dilución real aguas abajo, se agrega +6 por restauración y se mezcla 65% de calidad anterior con 35% del objetivo. Índice final limitado a 20–100. No modela concentraciones, oxígeno, turbidez, toxicidad, microbiología ni potabilidad. La calidad de retornos ahora se guarda correctamente para la visualización.

## Demandas, obras y resultados

Se conservan bases del escenario, multiplicadores estacionales, aumentos por calor y pisos. Riego reduce demanda agrícola 12/30/45%; canales N2 agrega 8 puntos. Redes urbanas 10/25/40%; saneamiento N2 agrega 8 puntos. Recirculación minera reduce captación neta 20/45/85%. Embalse aumenta capacidad +25/+55/+90; no agrega agua. Precios originales preservados.

Catálogo: diez obras distribuidas en seis ramas. Se limitaron captación/restauración a un nivel y canales a dos porque los niveles adicionales cobraban sin implementar beneficio marginal. Las demás obras conservan sus niveles. Eficiencia/capacidad operan inmediatamente; modificación de partición de lluvia comienza la próxima estación. Monitoreo mejora pronósticos futuros.

Estrés del acuífero: saludable ≥70%, atención ≥40%, estrés ≥20%, crítico <20%. Salud y confianza usan umbrales/bonificaciones/penalizaciones originales: son feedback de juego. No se han agregado costos progresivos de bombeo, subsidencia ni mantenimiento por obra.

Balance anual: ciudad hasta $30, cultivos $40, mina $35 según cobertura media; bono ecológico $15 con ≥85% de continuidad, confianza $15 con ≥80%; mantenimiento base $25 y ingreso neto mínimo $20. Desde v2.3, Granja aporta hasta $10 según su cobertura media anual, sumados antes del piso neto $20. Recompensas estacionales verifican consecuencias resueltas, incluidas metas compuestas.

Final: cobertura de los cinco actores, calidad, salud, confianza, reservas, dinero, obras y bombeo acumulado. Distingue demanda no cubierta de una asignación imposible de entregar. Estos datos permiten comparar estrategias; no son una medición validada de aprendizaje.

## Modo Aula y tutorial

Para reproducir: misma semilla + escenario + versión del modelo + acciones. Mulberry32 se conserva; clima/hidrología, eventos y errores de pronóstico usan flujos separados. Cada estación sortea catálogo completo de eventos con orden portable y cantidad fija de llamadas. Las decisiones pueden habilitar conflictos distintos; no desplazan el clima ni los sorteos externos futuros. Visuales y audio no consumen PRNG de gameplay.

**Modelo 2 no reproduce las partidas históricas del modelo anterior.** Corrige contabilidad y secuencias de azar. No comparar resultados entre versiones.

Año 0 es un ejercicio controlado de cuatro pasos de práctica. Sus reservas son estados preparados, no resultados completos del motor; al comenzar Año 1 se reinicia una partida limpia. La práctica no se registra como una partida reproducible.

## Lectura de resultados y diagnóstico

Pedido, suministro y demanda son magnitudes distintas. Un pedido entregado completo puede cubrir sólo parte de la necesidad; cero aporte adicional al humedal tampoco significa río seco. La vista previa señala sectores sin pedido y brechas de entrega antes de confirmar, sin impedir experimentos deliberados.

El informe final muestra medias de cobertura de las estaciones registradas y valores de confianza, salud, calidad y reservas al cierre. Confianza no es una nota global de abastecimiento: incluye bonos de metas y eventos, con topes por etapa. Los cambios netos de reservas incluyen entradas, abastecimiento normal, desbordes, evaporación y ajustes extraordinarios de eventos; el detalle no cuenta esos eventos dos veces.

Guardar diagnóstico JSON descarga snapshot, historial y, desde una partida nueva, acciones comprometidas de reparto/eventos/compras/resolución/avance. No se guardan todos los movimientos de sliders, previews o intenciones; no hay persistencia automática ni restauración desde JSON. Replay requiere las mismas fuentes y datos, además de semilla/escenario/modelo. El Heraldo narra hechos registrados: sus voces son comentarios editoriales ficticios, no daños físicos ni beneficios de obras medidos.

## Alcance científico

En Obras, la comparación desplegable de riego, red, recirculación, canales y saneamiento muestra el próximo nivel bajo el mismo clima y reservas iniciales del turno abierto. Permite mantener pedidos o reducir únicamente los afectados hasta su nueva necesidad, sin redistribuir. Reutiliza WaterSystem y DemandSystem sin comprar, avanzar ni consumir PRNG. Diferencia necesidad, extracción por fuente, consumo, retorno, cobertura y almacenamiento; no es un porcentaje de ahorro real ni una partida alternativa completa. Se excluyen obras que cambian lluvia o capacidad para evitar un contrafactual incompleto.

Relaciones basadas en física: conservación, almacenamiento finito, acumulación/deshielo, separación de lluvia, infiltración fluvial, evaporación, retornos y dilución. Simplificaciones: resolución estacional, agua instantánea, suelo sin almacenamiento persistente, caudal base externo. No hay recarga de canales/riego, gradientes, capas ni tiempos de tránsito. El deshielo puede llegar al acuífero a través del río si queda agua y espacio; lluvia infiltrada y obra se contabilizan por separado. Gameplay: coeficientes exactos, índices, premios y umbrales. No hay calibración regional ni validación de expertos concluida. Las gotas no tienen conversión validada a litros o m³.

Referencias conceptuales (no avalan los coeficientes): [USGS: ciclo del agua](https://www.usgs.gov/special-topics/water-science-school/water-cycle), [USGS: interacción superficial/subterránea](https://pubs.usgs.gov/circ/circ1139/htdocs/natural_processes_of_ground.htm), [FAO: eficiencia y retornos de riego](https://www.fao.org/4/Y4854E/y4854e07.htm). Canal revestido puede reducir una pérdida de distribución y también recarga útil; el modelo actual sólo representa su efecto sobre demanda, no calcula ese intercambio.


## Eventos y reconocimiento v2.2

El Premio al Reparto Compartido requiere un balance de una estación ya resuelta: Ciudad≥95%, Río≥90%, cada actividad productiva≥50% y calidad≥60; además conserva confianza/salud≥75. Se puede recibir como máximo una vez cada cuatro turnos. Son umbrales de diseño para reconocer un avance básico, no criterios científicos de resiliencia, potabilidad o sostenibilidad. No exige reservas mínimas porque reconoce cobertura pasada, sin prometer recuperación. El subsidio conserva su monto y reglas de apoyo a obras. Menos premios puede reducir confianza, subsidios e ingreso anual; no se promete igual presupuesto.

Los eventos siguen usando ajustes extraordinarios independientes del reparto normal: un retiro se contabiliza como uso/descarga externa; no agrega agua a la asignación de un sector. Los aportes están limitados por capacidad. Crecidas y acuerdos representan respuestas simplificadas con efectos fijos, sin cálculo de inundación, transporte de contaminantes, rendimientos de cosecha o producción física. Los textos no deben deducir abastecimiento normal, agua limpia o recuperación de esos efectos.

El catálogo muestra el siguiente nivel, precio real incluso si faltan prerrequisitos, efecto incremental/total y demanda bajo las condiciones de la estación con DemandSystem compartido. Una demanda menor no significa ahorro real si se conserva la asignación. Redondeos y mínimos pueden dejar cero reducción. Ampliar capacidad crea espacio, no agua. Captación/restauración conservan todos sus efectos de nivel único. Las compras mantienen el reparto manual; efectos y tiempos de operación previos se conservan.

El registro pareado de esta fase está en artifacts/events-economy-review/report.md. La versión2.2 cambia elegibilidad de reconocimiento y resultados sociales/económicos; clima externo y cantidad/orden de sorteos de catálogo se mantienen. Es un modelo educativo conceptual sin calibración regional ni medición de diversión/aprendizaje.


## Aporte anual de Granja v2.3

Se incorpora round(media anual de cobertura de Granja ×10) al presupuesto bruto antes del mínimo20. Se registra avgLivestockSatisfaction y se muestra Granja junto a las demás coberturas medias de cuatro estaciones en el cierre. La tarjeta del río representa cobertura del caudal ecológico, no salud de cuenca. El desglose incluye el aporte adicional al presupuesto mínimo cuando el neto previo queda debajo20, para que sus componentes concilien.

El coeficiente10 reconoce positivamente actividad ganadera conceptual abastecida: no es un precio de leche ni una calibración regional. Es el menor candidato positivo fijado y ensayado (0/10/15). La comparación no demostró abandono económicamente dominante: quitar Granja recaudó más por año en5/6casos, pero terminó con menos caja en6/6 por premios/metas perdidos.10 agrega$7–34 en esos cinco años compartidos;15$11–51 sin beneficios adicionales en el calendario de compras. No se midió diversión/aprendizaje ni se garantiza acceso a todas las obras. Registro y fuentes2.2 preservadas en artifacts/incentive-review/report.md.

No cambian confianza, demandas, hidrología, obras/precios, eventos, metas ni PRNG. La mayor caja puede habilitar otras compras/elecciones en una partida distinta; no equivale a agua nueva. Modelo2.3 requiere sus propias fuentes para replay; exports2.2/historia humana se conservan y no se reinterpretan como nuevas partidas.

## Continuidad de decisiones v2.4

El pedido inicial se prepara una vez. Desde la segunda estación, cada compuerta conserva la cantidad solicitada por el jugador, incluso si cambian demanda, clima, reservas u obras. El reparto sugerido requiere una acción explícita. El suministro efectivo sigue sujeto a las mismas reglas de disponibilidad y prioridad; conservar un pedido no garantiza entregarlo ni cubrir una demanda nueva. Esta diferencia justifica cambiar la versión del modelo para comparar y reproducir partidas; no se cambiaron coeficientes hidrológicos ni sorteos de clima.

La ampliación del embalse crea capacidad. El catálogo compara el espacio actual con el desborde previsto y registrado, sin atribuirle recargas ni ahorro retrospectivo. Los consejos de riesgo se corresponden con el nivel de la pista, que sigue siendo incierta.

La copia local guarda el registro de acciones y el estado para verificarlo. Continuar reconstruye el motor con la misma configuración, reproduce las decisiones y exige igualdad completa; no inserta un snapshot en un motor nuevo. Versiones o fuentes incompatibles se rechazan conservando la copia. El tutorial no reemplaza la partida real. La recuperación depende del navegador y origen; las acciones confirmadas se guardan inmediatamente y los cambios continuos de reparto usan hasta 250 ms de debounce.

En todos los eventos, antes de elegir se muestran intención, costos y requisitos; los beneficios y cambios efectivos se informan después. El registro captura los efectos sociales/económicos reales, incluidos los ceros por topes, y conserva los movimientos extraordinarios de agua.

Sólo las fugas de red incorporan recepción comunitaria difícil/habitual/favorable. La probabilidad favorable es clamp(0.35 + 0.10 × nivel de red + 0.10 si el embalse está al menos al 50%, −0.10 si está por debajo del 20%, −0.10 si el clima es seco, 0.20, 0.65). La difícil es clamp(0.25 − 0.05 × nivel + 0.10 si seco + 0.10 si reserva menor al 20%, 0.10, 0.45); habitual es el resto. Se toma un solo sorteo seeded independiente por episodio válido; no cambia el azar climático. Son parámetros de diseño para recepción social conceptual, sin sobrecostos ni agua aleatoria. La reparación puntual da +3/+5/+6 puntos de confianza, sensores +5/+7/+8, postergar −6/−4/−2 y renovar +1/+3/+5, sujetos a los topes. La salida de emergencia conserva −2 y no sortea.

Renovar compra el próximo nivel real de la red a $25/$40/$60 mediante el catálogo existente; su eficiencia permanece. La reparación puntual de $12 atiende el incidente y no construye esa obra. Esta diferencia agrega una decisión entre intervención de una estación e inversión futura. Las probabilidades, comparación pareada y límites están en artifacts/event-decisions/REVIEW.md; no se afirma que los tests midan diversión o aprendizaje.
