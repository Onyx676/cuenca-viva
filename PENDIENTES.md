# Pendientes de Cuenca Viva

## Dificultad, reservas y evaluación del éxito

Prioridad: evitar que abastecer todo agotando reservas se presente como gestión integral excelente. La partida recibida el 9 de octubre cubrió cinco frentes en 18/20 estaciones, pero dejó embalse 4 y acuífero 35 (mínimo 13), con confianza y salud 100%. El benchmark del motor reproduce recetas fijas de compras y pedidos completos con resultados similares en Valle Central; no justifica debilitar todas las obras ni endurecer globalmente los otros escenarios.

Evidencia y políticas reproducibles: [diagnóstico](artifacts/player-review/balance-2026-10-09/DIAGNOSTICO.md), [métricas](artifacts/player-review/balance-2026-10-09/summary.json), [benchmark](artifacts/player-review/balance-2026-10-09/benchmark.cjs). 72 configuraciones, dos repeticiones deterministas y 2.880 resoluciones con conservación comprobada. El HTML no permite reconstruir exactamente la cronología de compras del jugador.

Primera mejora 2.6: misiones mixtas y variables desde primavera en nuevas partidas de Valle Central, con cobertura mínima de Ciudad/foco/otros productivos/río y metas de reservas congeladas. Se comprobó la financiación real y recuperación legacy2.5; [detalle y métricas](artifacts/player-review/missions-2.6/REVISION.md). La receta100 gana menos premios, pero cumplir todas las misiones aún puede terminar con acuífero crítico (17 en AULA-2026-260). La dificultad y la evaluación de sostenibilidad de toda la campaña siguen pendientes.

Próximo orden: revisar cómo salud compuesta permite que caudal/calidad compensen acuífero crítico; evaluar objetivos de conservación acumulada y final de campaña; luego confirmar si Central debe seguir introductorio o sostener desafío intermedio durante 20 turnos. El candidato anterior de misión anual no está validado como regla universal ni demostrado alcanzable en toda la campaña. No endurecer automáticamente Árida o Lagos a partir del resultado de Central.

Incorporado: cierre descriptivo con tres dimensiones (abastecimiento, río y reservas), trayectorias por sector y tres preguntas opcionales con respuestas y pistas basadas en la partida. El documento para guardar/imprimir incluye esas explicaciones. No se añadió nota global, criterio nuevo de victoria ni medición del aprendizaje; el balance de campaña y una evaluación escolar con usuarios siguen pendientes.

Criterios de aceptación: las obras ayudan, pero pedir todo no domina en abastecimiento, reservas y recompensas; racionar en exceso tampoco representa victoria global; las semillas requieren decisiones distintas; conservar accesibilidad inicial, masa y determinismo. En 2.6 cambiaron las condiciones para recibir premios, no sus montos ni agua, costes, demandas o cifras de ingresos anuales. Falta QA visual final de los nuevos banners y evaluación humana de comprensión/diversión.

## Identidad visual de los escenarios

Representar Valle Central, Oasis Cordillerano Árido y Lagos del Sur con mapas distintos y rasgos territoriales reconocibles. Actualmente los escenarios cambian condiciones hidrológicas, demandas y reservas iniciales, pero comparten el mapa; el selector debe permitir entender esa diferencia.

Criterios de aceptación: distinguir los escenarios visualmente y explicar sus condiciones sin sugerir una cuenca real calibrada; conservar controles contextuales y espacios legibles para las reacciones de los sectores. El cambio visual no debe alterar la simulación ni consumir su PRNG.

## Semilla al azar y mapas procedurales

Pendiente solicitado: ofrecer al iniciar una partida la elección entre una semilla conocida y una semilla al azar. Mostrar el código generado y permitir copiarlo para compartir o repetir la partida. Esto reutiliza los escenarios y mapas actuales: igual semilla, escenario, versión del modelo y acciones debe reproducir clima, eventos y las misiones que ya se generan por semilla. No prometer que distintas decisiones activan los mismos eventos condicionales.

Como trabajo posterior separado, evaluar una partida con mapa generado proceduralmente desde la semilla y el escenario, coordinada con la identidad visual de los escenarios. La generación debe conservar conexiones hidrológicas, sectores y oportunidades de aprendizaje; mantener controles accesibles, etiquetas legibles y espacio libre para reacciones, sin obstrucciones. Usar un PRNG visual separado del de gameplay para que variar el mapa no cambie clima, eventos o balance accidentalmente.

Criterios de aceptación: el código queda visible y recuperable; una partida puede repetirse con la misma configuración y acciones; la opción al azar no reemplaza las semillas compartidas del aula. Para mapas procedurales, verificar reproducibilidad visual y accesibilidad en equipos escolares, sin alterar conservación del agua ni progresión. Ambas opciones están documentadas como pendientes: no se implementaron al registrar esta tarea.

## Variación de misiones entre partidas

La primera iteración 2.6 varía foco productivo, tipo de reserva y meta desde primavera en nuevas partidas de Valle Central; el primer invierno conserva la introducción. Partidas recuperadas 2.5, Árida y Lagos todavía usan misiones fijas por año/estación. Falta extender la variedad de forma defendible a esos escenarios y revisar metas de largo plazo, sin endurecerlos automáticamente.

Diseñar objetivos variados según escenario, estación y situación de la cuenca, manteniendo una introducción educativa comprensible. Evitar que cambiar el texto o el orden sea la única diferencia y comprobar que los objetivos sean alcanzables y aporten decisiones distintas.

Criterios de aceptación: variación perceptible desde el primer año entre partidas, objetivos claros y coherentes con las condiciones, y reproducibilidad con igual configuración y acciones. Si se usa azar para elegir misiones, definir su secuencia seeded sin alterar accidentalmente el clima y los eventos; verificar recompensas, balance y progresión de los 20 turnos antes de integrar.

## Calidad del agua y salud de la cuenca

Ampliar el sistema conceptual actual y evaluar nuevas mejoras para saneamiento urbano, procesos mineros, agricultura y restauración. Revisar qué efectos permiten decisiones distintas y comprensibles, evitando sumar obras sólo para aumentar el catálogo.

Antes de cambiar el modelo: justificar los procesos y simplificaciones con fuentes primarias y revisión científica; distinguir tratamiento, recirculación, carga contaminante, dilución y salud ecológica. No presentar el índice actual como potabilidad o seguridad sanitaria.

Criterios de aceptación: beneficios y trade-offs explicables al jugador; comparaciones con el mismo clima y política explícita; conservación del agua, determinismo y progresión comprobados. La validación científica externa sigue pendiente. No se modificó la simulación al registrar esta tarea.
