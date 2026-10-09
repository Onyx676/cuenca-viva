# Pendientes de Cuenca Viva

## Dificultad, reservas y evaluación del éxito

Prioridad: evitar que abastecer todo agotando reservas se presente como gestión integral excelente. La partida recibida el 9 de octubre cubrió cinco frentes en 18/20 estaciones, pero dejó embalse 4 y acuífero 35 (mínimo 13), con confianza y salud 100%. El benchmark del motor reproduce recetas fijas de compras y pedidos completos con resultados similares en Valle Central; no justifica debilitar todas las obras ni endurecer globalmente los otros escenarios.

Evidencia y políticas reproducibles: [diagnóstico](artifacts/player-review/balance-2026-10-09/DIAGNOSTICO.md), [métricas](artifacts/player-review/balance-2026-10-09/summary.json), [benchmark](artifacts/player-review/balance-2026-10-09/benchmark.cjs). 72 configuraciones, dos repeticiones deterministas y 2.880 resoluciones con conservación comprobada. El HTML no permite reconstruir exactamente la cronología de compras del jugador.

Orden propuesto: mostrar cobertura y preservación de reservas por separado; diseñar misiones mixtas de abastecimiento y reservas; revisar cómo salud compuesta permite que caudal/calidad compensen acuífero crítico; luego evaluar si Central debe seguir introductorio o sostener desafío intermedio durante 20 turnos. El candidato de misión anual fue evaluado sólo sobre historiales actuales, no sobre financiación modificada: todavía no está validado como regla universal ni demostrado alcanzable en toda la campaña.

Criterios de aceptación: las obras ayudan, pero pedir todo no domina en abastecimiento, reservas y recompensas; racionar en exceso tampoco representa victoria global; las semillas requieren decisiones distintas; conservar accesibilidad inicial, masa y determinismo. No se cambiaron agua, costes, demandas o recompensas al registrar este pendiente.

## Identidad visual de los escenarios

Representar Valle Central, Oasis Cordillerano Árido y Lagos del Sur con mapas distintos y rasgos territoriales reconocibles. Actualmente los escenarios cambian condiciones hidrológicas, demandas y reservas iniciales, pero comparten el mapa; el selector debe permitir entender esa diferencia.

Criterios de aceptación: distinguir los escenarios visualmente y explicar sus condiciones sin sugerir una cuenca real calibrada; conservar controles contextuales y espacios legibles para las reacciones de los sectores. El cambio visual no debe alterar la simulación ni consumir su PRNG.

## Variación de misiones entre partidas

Revisar la campaña de objetivos: actualmente las misiones dependen sólo del año y la estación, por lo que cambiar semilla o escenario repite las mismas cuatro primeras misiones. El usuario señaló que esto resulta confuso y monótono y dificulta percibir la variedad entre partidas.

Diseñar objetivos variados según escenario, estación y situación de la cuenca, manteniendo una introducción educativa comprensible. Evitar que cambiar el texto o el orden sea la única diferencia y comprobar que los objetivos sean alcanzables y aporten decisiones distintas.

Criterios de aceptación: variación perceptible desde el primer año entre partidas, objetivos claros y coherentes con las condiciones, y reproducibilidad con igual configuración y acciones. Si se usa azar para elegir misiones, definir su secuencia seeded sin alterar accidentalmente el clima y los eventos; verificar recompensas, balance y progresión de los 20 turnos antes de integrar.

## Calidad del agua y salud de la cuenca

Ampliar el sistema conceptual actual y evaluar nuevas mejoras para saneamiento urbano, procesos mineros, agricultura y restauración. Revisar qué efectos permiten decisiones distintas y comprensibles, evitando sumar obras sólo para aumentar el catálogo.

Antes de cambiar el modelo: justificar los procesos y simplificaciones con fuentes primarias y revisión científica; distinguir tratamiento, recirculación, carga contaminante, dilución y salud ecológica. No presentar el índice actual como potabilidad o seguridad sanitaria.

Criterios de aceptación: beneficios y trade-offs explicables al jugador; comparaciones con el mismo clima y política explícita; conservación del agua, determinismo y progresión comprobados. La validación científica externa sigue pendiente. No se modificó la simulación al registrar esta tarea.
