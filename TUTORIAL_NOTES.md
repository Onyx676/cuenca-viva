# Iteración del tutorial — coherencia v2

Alcance: textos y presentación de las nueve fases, estados preparados del Año 0 y elección de su obra de práctica. SimulationEngine, WaterSystem, demanda del juego, precios, coeficientes y PRNG permanecen intactos. No se agregan fases ni se calcula nueva hidrología.

| Fase | Corrección |
|---|---|
| 1 | Nieve como reserva que puede derretirse, sin afirmar que nunca sale agua. Cifras visibles leídas del estado del ejercicio. |
| 2 | Acción sobre Ciudad y cobertura de asignación, sin prometer potabilidad, presión ni satisfacción calculada. |
| 3 | Protección explícita distinta del caudal total; retornos y calidad separados. La animación del ejercicio no es validación hidrológica. |
| 4 | Margen no crea agua ni transfiere todo al embalse. Se elimina el salto preparado 35 → 43 que materializaba el falso ahorro de ocho gotas. |
| 5 | Demanda de verano y reservas conservadas, sin afirmar que ocho gotas guardadas salvaron el turno. Embalse permanece en 35; no es el resultado de una resolución de primavera. |
| 6 | Riego, cobertura y margen como elección; no se promete cosecha calculada. |
| 7 | Nivel de otoño identificado como ejemplo preparado, no resultado exacto del motor ni evidencia de comprensión del alumno. |
| 8 | Diez gotas del ejercicio entre demanda agrícola 8 y protección explícita 6. Mostrar reparto real, sin concluir salud total del río o cosecha según cuál número sea mayor. |
| 9 | Antes/después de práctica y fiabilidad simulada; no se garantizan pronósticos. Una elección reemplaza la otra; la obra gratuita no pasa al Año 1. |

Legibilidad: cuerpo 16 px / 1.45, títulos 20 px (19 móvil), secundarios 14 px, botón principal de 44 px. Panel 370 px en escritorio; cuerpo desplazable y acciones visibles en pantalla pequeña. Destino del ejercicio marcado en accesos de mapa; reservas resaltadas en fases correspondientes. En Año 0 se ocultan obras/reparto automático ajenos al ejercicio y se compacta la ficha de actor en móvil; vuelven al salir.

Pendiente pedagógico: para enseñar activamente acuífero y calidad hay que reemplazar estados preparados por ejercicios que utilicen resoluciones reales del motor existente, sin alterar sus fórmulas. Propuesta posterior: un verano donde variar extracción muestre bombeo y reserva final; luego comparar retornos con/sin saneamiento y separar caudal de calidad. Requiere diseñar entradas, acciones y transición reproducibles; no se finge con indicadores modificados a mano en esta iteración.

Validación: recorrido de nueve fases en escritorio, margen 8 → 12 con embalse 35 y paso a verano sin incremento; reparto 6/4; ambas obras de práctica y reinicio limpio. Revisión móvil 390×844, controles y cuerpo desplazable. Build y TypeScript sin errores, suite existente de 15 pruebas pasa. Advertencia previa de bundle Phaser grande conservada.

Ajuste de inspección: guía anclada a la izquierda en escritorio, fichas a la derecha por debajo de reservas desplegadas. El encabezado Práctica permite plegar/reabrir sin perder fase. Hasta 800 px, inspeccionar el mapa pliega automáticamente la guía; reabrirla cierra la ficha. Verificados nieve, embalse y acuífero en escritorio; plegado automático al tocar acuífero y reapertura en 390×844. Build y TypeScript pasan; cambios sólo en index/main/style.

Iteración de claridad para 8–16 años: consignas cotidianas en las nueve fases; Ciudad incluye hogares, escuelas, hospitales, comercios y servicios. Controles muestran «recibe / necesita»; el resumen dice «para repartir / repartiste / sin repartir». Fase 4 comienza con Ciudad 28 y pide bajar a 20: quedan 8 sin repartir, sin aumentar el embalse 35. Fase 5 empieza en 20 y pide subir a la necesidad de verano 24. Las fases 2–5 requieren cumplir la acción indicada; la 6 requiere probar un reparto. Sólo cambian ejercicios del tutorial, no reglas de la partida. Las frases de personajes durante la práctica se refieren a la acción, sin prometer presión o cosechas calculadas. Corregido aviso rojo que persistía después de completar la acción.

Escala educativa revisada: alrededor de 10 millones de litros (10.000 m³) por gota. Aparece en fase 1 y ayuda; 20 gotas representan aproximadamente 200 millones de litros en la cuenca de ejemplo. Reemplaza la referencia arbitraria anterior de un millón. Es una convención didáctica de orden de magnitud, no una calibración física ni una validación de todos los sectores. No se modifican valores, coeficientes ni PRNG.

Fundamento y límites: el [Plan Nacional de Agua Potable y Saneamiento, página impresa 34](https://www.argentina.gob.ar/sites/default/files/interior_agua_plan_agua_saneamiento.pdf) informa 318 L/habitante/día en una muestra histórica de prestadores argentinos. Con 90 días por estación como supuesto, 20 gotas a esta escala equivalen al suministro de aproximadamente 7.000 habitantes. Un embalse de 100 gotas representa 1 hm³; una asignación minera de 20 gotas en 90 días equivale a unos 26 L/s. Son comparaciones de magnitud, no demandas validadas para una explotación o cuenca determinada. Granja incluye pasturas y producción: no convertir su asignación sólo en cantidad de animales según agua de bebida. Queda pendiente comprobar conjuntamente superficies, tipos de producción, reservas y caudal ecológico para una eventual calibración global.

Validación de esta iteración: recorrido de nueve fases en navegador, bloqueo antes de ajustar fases 4/5, margen 8 y embalse 35, verano con demanda 24, riego 10/20, otoño con embalse 20, reparto 6/4, ambas obras y salida al Año 1. Vista 390×844: cuerpo desplazable, botón y control visibles; tocar acuífero pliega la guía, reabrirla cierra la ficha. Build, TypeScript y 16 pruebas pasan. Hashes del motor, WaterSystem, demandas, PRNG y catálogo de obras coinciden con los anteriores a esta iteración. Falta validar comprensión con alumnos reales; la revisión técnica no demuestra comprensión por edad.
