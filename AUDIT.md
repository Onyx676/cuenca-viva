# Cuenca Viva — diagnóstico del prototipo

Revisión del 5 de octubre de 2026, anterior a las modificaciones de esta iteración. Se inspeccionaron fuentes, datos, HTML, estilos, configuración, dependencias y documentación. Build y TypeScript iniciales pasan. No existía suite de tests. Había cambios del usuario en BasinScene.ts y style.css, que deben conservarse.

## A. Arquitectura

**Conservar:** Vite + TypeScript + Phaser; motor y sistemas puros separados del DOM; catálogos JSON; frontend estático; sonido procedural; cinco sectores, reservas, retornos y calidad. No se justifica backend, framework nuevo ni reemplazar SimulationEngine.

**Deuda real:** main.ts concentra tutorial, UI, recompensas y navegación; reglas duplicadas de disponibilidad/caudal entre Engine y WaterSystem; efectos de obras definidos en JSON pero implementados por ID; economía duplicada en motor y UI. BasinScene consulta altura del DOM y contiene posiciones repetidas. Es manejable para hackathon; sólo centralizar cálculos realmente divergentes.

**Acoplamientos:** estado mutable expuesto por getState permite que tutorial/UI eviten reglas; Characters importa un tipo desde main (conviene import type). Las zonas de clic se crean con altura completa mientras el dibujo usa altura descontando panel; no se recolocan al cambiar tamaño. terrainGraphics nunca se limpia y acumula geometría. Compras no siempre redibujan infraestructura.

## B. SimulationEngine y agua

### P0 comprobados en código

- Embalse recibe 70% del río antes de captar hasta 65% del mismo río: doble contabilización.
- Engine anuncia deshielo + 45% escorrentía + base 5/12/8; WaterSystem agrega dos veces 45% escorrentía y usa siempre base 5.
- Bombeo no tiene tope físico: acuífero queda en cero pero satisfacción y retornos siguen calculándose sobre agua inexistente.
- Mínimo de disponibilidad de 15 crea una oferta ficticia en sequía.
- `snowShare || .25` reemplaza cero de verano; `snowMeltRate || .25` reemplaza cero de otoño.
- Componentes de lluvia redondeados independientemente pueden no sumar precipitación.
- Mina sin obra consume 75% y retorna 15%: falta destino del 10%.
- Desborde del acuífero y escorrentía no captada desaparecen del balance.
- Dilución usa agua del río ya retirada, omite retornos ganaderos y returnQuality urbano visual nunca se actualiza.
- resolveSeason puede ejecutarse varias veces; advance puede saltar estaciones sin resolver. Recompensas UI se cobran antes de conocer resultados.
- Pronóstico y eventos comparten PRNG climático. Monitoreo cambia cuántas llamadas se hacen; condiciones de eventos cambian secuencias. `sort` con comparador aleatorio no es una mezcla portable.

### Coeficientes y simplificaciones

Físicamente defendibles como relaciones: acumulación/deshielo, separación lluvia/escorrentía/infiltración, evaporación, almacenamiento finito, extracción, retornos y dilución. Los porcentajes exactos son **parámetros de gameplay sin calibración**: no equivalen a mediciones. Las gotas son unidades conceptuales, no hm³.

Markov, ENSO uniforme entre regiones, índice 0–100 de calidad, umbrales de confianza/ecología, captación 65%, retención 70%, recarga 85% y límite prudente 18% son abstracciones. ENSO no garantiza lluvia local. Lluvia y nieve son aportes separados de regiones/altitudes del modelo; no repartir otra vez una misma precipitación.

El caudal base fijo es una entrada externa no representada, no descarga del acuífero simulado. No existe intercambio bidireccional río–acuífero, tiempo de viaje, almacenamiento de suelo persistente, costo automático de bombeo ni subsidencia calculada. El 15% de infiltración no recargada debe explicitarse como evapotranspiración de suelo dentro de la simplificación. Retornos se conducen aguas abajo, no se vuelven a asignar en el mismo turno. El caudal ecológico protege continuidad: no genera ingresos unitarios reales.

## C. Gameplay

**Fortalezas:** estaciones con demandas diferentes, reservas interanuales, obras que compiten por dinero, portavoces, subsidios, desafíos y Heraldo. Ya hay recompensa; no agregar eventos indiscriminadamente.

**Problemas:** reparto automático proporcional invita a confirmar sin decidir; satisfacción se satura al 100% pero personajes celebran 110% (incentivo al desperdicio). Ciudad se recupera +1, pero puede perder hasta 25 por turno. Granja no participa en recaudación anual y casi no afecta confianza. Subsidios frecuentes pueden trivializar presupuesto. Varias elecciones son resultados fijos, no riesgos simulados; no prometer inundación calculada. Costos de eventos sólo se validan en UI. Asignaciones iniciales redondeadas pueden superar oferta.

Obras: captación, canales, restauración tienen niveles sin beneficio marginal implementado. IDs `restauracion_riberas`, `reforestacion_riberas`, `reparacion_fugas` no existen en catálogo. La interfaz promete funciones no implementadas (roturas, recarga de deshielo, porcentajes de daño). Corregir textos/IDs antes de agregar balances nuevos. Reserva anunciada no significa incremento del embalse: oferta incluye almacenamiento existente.

## D. UX

Cinco tarjetas permanentes, reservas, objetivo, timeline y barra compiten con mapa. Sliders útiles; +/- innecesarios. Prioridad: reutilizar las tarjetas como editor de un sector seleccionado, con accesos pequeños y mapa clicable. No duplicar controles.

Falta vista previa honesta de embalse, acuífero, bombeo y déficit. Post-resolución UI sigue habilitando resolución; informe confunde ATTENTION con crítico. Tutorial sí requiere algunas decisiones, pero fases 1/4/5/7 son observación; estados/reservas se imponen y no pasan por motor. Fase 8 admite sobregasto y muestra demandas distintas de su texto. No enseña directamente calidad ni acuífero. Botón superior Tutorial no tiene handler. Mantener Año 0 aislado; una revisión completa del guion merece una iteración propia.

## E. Visual

Se puede mejorar ya: liberar pantalla con editor contextual, unificar coordenadas de clic/dibujo, limpiar capas, visualizar obras al comprarlas, cultivos/vida según decisiones y calidad. Conservar arte procedural personalizado; no hay pipeline ni assets Blender existentes que justifiquen reemplazarlo ahora. Animaciones de aspersores/embalse se dibujan sólo al refrescar; fauna depende únicamente de satisfacción, no salud/calidad. El acuífero rojo puede sugerir contaminación en lugar de nivel bajo: distinguir estos conceptos.

Esperar: sprites low-poly coherentes con tamaño/orientación y variantes seco/sano; Blender como exportador de sprites, no motor 3D. No fabricar imágenes que contradigan canales o posiciones interactivas.

## F. Pedagogía y ciencia

La base enseña interdependencia, reservas y eficiencia. Falta que el texto coincida con el cálculo. Agua no usada no se almacena toda: también sigue aguas abajo. Infiltración puede ser recarga útil, y revestir canales no prueba ahorro a escala de cuenca. Calidad conceptual no mide oxígeno, turbidez ni potabilidad real. No atribuir “río cristalino” a caudal únicamente. No etiquetar jugadores como vampiros ni felicitar equilibrio sin evidencia.

Final existente: promedios de cuatro sectores, confianza, acuífero y diploma; falta granja, calidad, salud, nieve/embalse, economía y bombeo acumulado. Comparación requiere **semilla + escenario + versión del modelo**, con mismas acciones para reproducir resultados. Clima y sorteos externos compartidos; conflictos condicionados por decisiones pueden diferir. Estos indicadores muestran desempeño del juego, **no demuestran aprendizaje**: eso requiere evaluación antes/después con personas.

Fuentes conceptuales revisadas (no validan coeficientes ni constituyen aval científico):
- USGS, ciclo del agua: https://www.usgs.gov/special-topics/water-science-school/water-cycle
- USGS, interacción superficial/subterránea: https://pubs.usgs.gov/circ/circ1139/htdocs/natural_processes_of_ground.htm
- FAO, eficiencia y retornos en canales: https://www.fao.org/4/Y4854E/y4854e07.htm

## G. Prioridades y alcance

| Prioridad | Acción | Criterio |
|---|---|---|
| P0 | Cerrar balance y limitar abastecimiento a fuentes reales | No crear ni perder agua silenciosamente |
| P0 | Respetar ceros, caudal consistente y turnos únicos | Estaciones y final correctos |
| P0 | Separar clima, eventos y pronóstico; mezcla portable | Modo Aula comparable |
| P1 | Vista previa sin RNG, desafíos después de resolver | Decisión → consecuencia verificable |
| P1 | Editor contextual + zonas de mapa alineadas | Mapa protagonista, conservar sliders |
| P1 | Final con todos los sectores/reservas/calidad y versión | Comparar estrategias y repetir |
| P1 | Corregir IDs/textos de obras y feedback engañoso | No vender beneficios inexistentes |
| P2 | Tutorial de acuífero y calidad con balances reales | Aprendizaje activo completo |
| P2 | Balancear confianza, subvenciones, niveles de obras y granja | Requiere playtesting tras P0 |
| P2 | Costos de bombeo, mantenimiento o beneficios diferidos | Sólo con aporte y balance explícitos |
| P3 | Sprites Blender, calibración regional, estudios educativos | Después de asegurar demo |

No modificar matrices climáticas, demandas, precios ni penalizaciones silenciosamente. Las correcciones P0 cambian resultados de semillas históricas: versionar modelo y no comparar partidas de versiones distintas. Medir dificultad después; no esconderla con agua ficticia.

## Implementación y validación de esta revisión

P0 implementados: balance explícito con caudal base/derrames/evapotranspiración, captación sin doble conteo, bombeo finito y suministro real; partición exacta de lluvia; ceros estacionales; turnos/recompensas únicos; validación de eventos en motor; flujos separados de azar y mezcla portable. Entradas/salidas extraordinarias de elecciones quedan registradas fuera del balance normal. Si todas las opciones de un evento son inasequibles, se agrega coordinación de espera gratuita con -2 de confianza: evita bloquear la partida sin regalar beneficios.

P1 implementados: mapa con editor único de slider, vista previa determinista, reservas desplegables, coordenadas de clic compartidas, limpieza de gráficos y actualización de obras/cultivos/vida; metas sobre consecuencias reales; final de cinco sectores, reservas, calidad, obras y bombeo; textos/IDs coherentes y reconocimiento al cumplir demanda. Conservados Phaser, motor, sectores y sistemas existentes; ningún backend, dependencia o fuente aleatoria de gameplay nuevos. Los cambios preexistentes del usuario en BasinScene/style se conservaron.

Cambios explícitos de semántica: Río Vivo usa continuidad total aguas abajo, incluida agua retornada, con calidad separada. Nieve de verano y base de deshielo otoñal cero se respetan. Mina sin obra contabiliza como uso consuntivo/retención el 10% antes perdido. Captación/restauración se limitan a N1 y canales a N2, ya que niveles siguientes no tenían efecto; precios de niveles útiles se mantienen. Error de pronóstico elige un estado distinto para respetar la probabilidad indicada. Esto y separación de PRNG cambian secuencias históricas: modelo **v2**.

Archivos: SimulationEngine, WaterSystem, RainSystem, ClimateSystem, EventSystem; modelos Balance/Event/SeasonalGoal; datos events/upgrades/seasonalGoals; main/index/style y BasinScene/Characters/Newspaper/TutorialManager; package.json y tests; README y GAME_RULES. La cantidad de líneas en el diff de BasinScene/style incluye trabajo previo del usuario y no representa sólo esta revisión.

Validaciones ejecutadas: 15 tests pasando, incluidas partidas deterministas de 20 turnos para los tres escenarios, balance cero, todos los niveles de recarga/recirculación, escasez extrema, eventos, recompensas, vista previa y tutorial. Build y TypeScript sin errores; build conserva advertencia de bundle Phaser grande (~1.66 MB). Navegador: nueve fases del tutorial hasta Año 1, partida completa de 20 turnos con eventos/cinco cierres/informe final; control contextual y revisión de pantallas de escritorio y 390×844.

En recorrido sin inversiones ni ajustes, Valle Central terminó con coberturas medias urbanas/productivas ~34% y confianza 10. No es prueba de balance divertido: confirma que autopiloto es insuficiente y que eliminar agua ficticia exige playtesting. No alterar demandas/penalizaciones ahora sin evaluar estrategias con obras. Río Vivo puede recibir retornos abundantes incluso con poca protección explícita; hace falta validar cuánto desafío aporta su mínimo agregado. Final distingue demanda incompleta de asignación imposible.

Pendiente real: tutorial con motor y ejercicios de acuífero/calidad; calibración regional/validación experta; balance de confianza, premios y granja; costos diferidos; sprites/arte low-poly. No se afirma que estas tareas estén terminadas ni que indicadores finales midan aprendizaje.
