# Propuesta editorial completa · Cuenca Viva

**Estado: aprobada para integración por el usuario el 9 de octubre de 2026.** El usuario autorizó integrar el banco completo y corregir después las piezas que no le gusten durante las pruebas. Las condiciones de selección siguen sujetas a comprobación técnica. La versión integrada está en `src/game/ApprovedEditorial.json`.

## Alcance revisado

Revisé los 104 registros actuales de `ApprovedEditorial.json`: 16 escenas heredadas para el mapa, 30 carteles con ID `V-*`, 55 parejas de Heraldo con ID `H-*` y 3 parejas heredadas `A-H-*`. También revisé la selección de `EditorialSelection.ts`, la llamada y el respaldo del mapa en `BasinScene.ts`, y los diagnósticos, portadas y breves de respaldo en `Newspaper.ts` y `NewspaperHeadlines.ts`.

El tono aprobado del resumen se conserva sin cambios. Esta propuesta sólo trata los titulares y bajadas del Heraldo y los carteles de “Ver el valle”. La corrección puntual solicitada para A-MAP-03 es: **«Hoy no me puedo quejar. Mi familia me pidió que lo ponga por escrito»**.

## Condiciones que deben acompañar a cada pieza

La selección editorial usa cuatro bandas reales. Para Ciudad, Cultivos, Granja y Mina: **completa** = 100%; **parcial alta** = 80% a menos de 100%; **faltante relevante** = 50% a menos de 80%; **faltante grave** = menos de 50%. Para Río Vivo, por ser referencia ecológica: **completa** = 100%; **parcial alta** = 75% a menos de 100%; **brecha relevante** = 55% a menos de 75%; **brecha grave** = menos de 55%. “Mejora relativa” es una condición adicional y siempre conserva el faltante cuando la cobertura sigue bajo 100%.

No se debe inferir cobertura completa de una banda parcial, agua limpia del caudal, ni salud alta del río. El porcentaje ya aparece en el encabezado de la tarjeta: las frases no lo repiten. En todos los rangos, el remate debe dejar reconocible qué pasó: alcanzó todo, faltó poco, faltó bastante, el faltante fue grave, hubo una mejora pero sigue pendiente, o la reserva subió/bajó. El humor acompaña el resultado y no lo esconde ni exagera. Si el resumen necesita un porcentaje para explicar la cifra exacta, puede mostrarlo allí; el resumen actual queda sin cambios.

## Huecos comprobados en los selectores y respaldos

1. **Tarjeta del mapa con cobertura parcial sin comparación previa.** `mapStory` sólo agrega `V-*-03` si la cobertura parcial mejoró respecto de la estación anterior. Sin historial, una Ciudad al 91% no tiene pieza elegible y termina en «Quedó una parte de la necesidad por cubrir». Las nuevas piezas `V-*-07` a `V-*-09` de abajo cubren esa banda por sí sola; deberán poder elegirse desde la primera estación.
2. **Heraldo con cobertura parcial sin mejora registrada.** `sectorArticle` tampoco encuentra `H-*-03` si la cobertura parcial no subió, por lo que puede caer al título genérico del veredicto. Añadir piezas para la condición de cobertura actual, sin exigir mejora; reservar las de mejora para cuando exista comparación válida.
3. **Calidad estable o sin estación previa.** `approvedTopic` tiene pieza para alerta, caída y mejora, pero no para calidad estable ni primera edición. El respaldo de breve usa «Calidad del agua» con cierre numérico y la lección repetida «Más caudal no garantiza mejor calidad». La propuesta separa primera medición, estable, alerta, caída y recuperación, sin porcentajes ni gotas.
4. **Salud del río estable o sin comparación.** Hay piezas para alerta y mejora, pero no para estable/primera medición; el respaldo vuelve a la etiqueta y al valor numérico. Agregar esas dos condiciones.
5. **Reserva y otros breves.** La pieza aprobada de recuperación de reserva se elige cuando el saldo sube. Para un saldo estable o menor que no sea el trade-off de portada, el respaldo factual se repite. Proponer breves con el cambio real descrito sin repetir cantidades.
6. **Hechos de opciones.** Los sucesos sin opción elegida llegan a una breve genérica. Los sucesos con opción pueden mostrar el texto técnico de `eventFact`, costos o cambios. La propuesta usa una escena independiente y deja que la bajada factual salga de la opción registrada; si no hay elección, sólo identifica el suceso.
7. **Respaldo del mapa.** Además de faltar material para cobertura parcial inicial, hay carteles heredados demasiado largos para la tarjeta. Acortarlos sin perder el personaje ni convertir el chiste en una conversación.

Estas son necesidades editoriales. Para habilitarlas se requerirían cambios posteriores en las listas de IDs del selector; esta propuesta no los realiza.

### Relación propuesta con los IDs actuales

Las entradas nuevas `P-*` son IDs de revisión estables, todavía no destinados a implementación. Su objetivo de reemplazo por familia es: `H-CIU-01..05` → `P-CIU-*`; `H-CUL-01..05` → `P-CUL-*`; `H-GRA-01..05` → `P-GRA-*`; `H-MIN-01..05` y `A-H-16` → `P-MIN-*`; `H-RIO-01..05` → `P-RIO-*`. `H-GEN-01..20` se reparte por contexto en `P-GEN-01..56`; `H-EVT-01..10` se cubre con 28 bajadas específicas para las opciones reales. A-H-17 y A-H-18 siguen siendo opciones aprobadas y se conservan; P-GEN-17 ofrece variación de reserva. Los IDs `A-MAP-*` y `V-*` se identifican individualmente en su revisión más abajo.

## Heraldo · parejas propuestas

Cada titular y su bajada son una unidad. El titular se escribe como noticia local con remate corto; la bajada agrega un dato o una escena breve. Se omite el diagnóstico técnico repetido y no se agregan consecuencias no simuladas.

### Ciudad

- **P-CIU-01 · Completa:** **Ciudad cubre su necesidad y el barrio cambia de tema** — El grupo dejó el agua por el perro. Sofía pidió que, por una vez, no la etiquetaran.
- **P-CIU-02 · Completa:** **El reparto en Ciudad permite archivar el reclamo del día** — Tito mandó una felicitación y enseguida aclaró que no era costumbre.
- **P-CIU-03 · Parcial alta, incluso sin comparación:** **Ciudad queda cerca de cubrir la demanda; Sofía deja el reclamo abierto** — Tito quiso llamarlo victoria. Sofía guardó la libreta para la próxima estación, no para siempre.
- **P-CIU-04 · Parcial alta, incluso sin comparación:** **El barrio recibe casi todo lo que necesita; el grupo igual no descansa** — Tito empezó a escribir “gracias”. Después vio que había mandado el mensaje al chat equivocado.
- **P-CIU-05 · Faltante relevante:** **El reclamo de Ciudad suma una segunda página** — Tito prometió ordenar los temas por prioridad. Sofía ya le había alcanzado otra hoja.
- **P-CIU-06 · Faltante relevante:** **Ciudad sigue con necesidades pendientes y Tito, con una lista nueva** — Esta vez la trajo abrochada. Sofía reconoció el color de la carpeta.
- **P-CIU-07 · Faltante grave:** **Ciudad enfrenta un faltante grave; el grupo del barrio no necesita convocatoria** — Tito mandó “¿nos juntamos?”. Las respuestas llegaron antes que la ubicación.
- **P-CIU-08 · Faltante grave:** **Muy poca agua en Ciudad; la canilla vuelve a ser noticia** — Sofía pidió una descripción breve para el diario. Tito le mandó una foto y tres audios.
- **P-CIU-09 · Mejora relativa con faltante pendiente:** **Ciudad mejora, pero el reclamo sigue en la mesa** — Sofía tachó “resuelto” del borrador. Tito guardó la lapicera por si hacía falta otra corrección.

### Cultivos

- **P-CUL-01 · Completa:** **Cultivos cierra sin faltantes; Jacinto igual consulta el pronóstico** — Berta le acercó una silla. Él se sentó con el celular en la mano.
- **P-CUL-02 · Completa:** **Buen reparto en Cultivos: Jacinto se queda sin una queja preparada** — Revisó la libreta para estar seguro. En la última página encontró una lista para la estación siguiente.
- **P-CUL-03 · Parcial alta, incluso sin comparación:** **Cultivos queda cerca de cubrir la necesidad; Jacinto reserva el festejo** — «Cuando esté completo, descorcho», dijo. Dejó la botella a mano.
- **P-CUL-04 · Parcial alta, incluso sin comparación:** **Jacinto reconoce una buena cobertura y corrige el “todo” del titular** — «Poné “casi todo”. Después no me hagas aclararlo en la próxima nota».
- **P-CUL-05 · Faltante relevante:** **Cultivos todavía tiene una parte importante sin cubrir; Jacinto llega con la libreta abierta** — Marisa anotó el reclamo en la página que él ya tenía marcada.
- **P-CUL-06 · Faltante relevante:** **Cultivos vuelve a quedar corto; Jacinto ya sabe qué página abrir** — Marisa llegó con el grabador. Él llegó con las cuentas.
- **P-CUL-07 · Faltante grave:** **Jacinto presenta el reclamo de Cultivos en versión extendida** — «La corta no explicaba cuánto falta», dijo. Marisa dejó lugar en la libreta.
- **P-CUL-08 · Faltante grave:** **Cultivos recibe muy poca agua; el pronóstico no completa el reparto** — Jacinto lo revisó igual. «Por lo menos una de las dos cosas tiene que salir bien».
- **P-CUL-09 · Mejora relativa con faltante pendiente:** **Cultivos mejora, pero todavía queda un faltante; Jacinto conserva el reclamo** — «No lo tiro: le cambio la fecha», explicó.

### Granja

- **P-GRA-01 · Completa:** **Granja cubre su necesidad y Berta se sienta con el mate** — El descanso duró hasta que le preguntaron si faltaba algo.
- **P-GRA-02 · Completa:** **Berta consigue una mañana tranquila en la granja** — La primera pregunta fue si todo estaba bien. La segunda, por qué estaba tan callada.
- **P-GRA-03 · Parcial alta, incluso sin comparación:** **Granja queda cerca de cubrir lo necesario; Berta no firma el “listo”** — «Poné “casi” y estamos», le indicó a Marisa.
- **P-GRA-04 · Parcial alta, incluso sin comparación:** **En Granja falta poco para completar la cobertura; Berta no suelta la libreta** — La lista ya tenía lugar para el «casi».
- **P-GRA-05 · Faltante relevante:** **Berta cambia el horario de visitas a la granja** — «Para mirar, temprano. Para decir que está todo bárbaro, no hace falta venir».
- **P-GRA-06 · Faltante relevante:** **La granja recibe otra visita con cámara; Berta pide primero mirar los bebederos** — Marisa bajó la cámara y abrió la libreta.
- **P-GRA-07 · Faltante grave:** **Berta deja el pronóstico fuera de la nota sobre el faltante** — «Del tiempo hablamos después. Hoy vine por el agua».
- **P-GRA-08 · Faltante grave:** **Granja necesita más agua; Berta ya tiene lista la explicación corta** — «No alcanza». Marisa guardó el grabador y anotó la frase.
- **P-GRA-09 · Mejora relativa con faltante pendiente:** **Granja mejora, pero todavía falta agua; Berta no cambia el título a “resuelto”** — «Dejá el borrador como está. Todavía hay algo que contar».

### Mina

- **P-MIN-01 · Completa:** **Ferrada sonríe en la foto del reparto y Rosa alcanza a registrarlo** — La foto salió antes de que él volviera a ponerse serio.
- **P-MIN-02 · Completa:** **El buen reparto en Mina deja a Ferrada sin discurso de reclamo** — Rosa le preguntó si tenía preparado otro. «Por las dudas», dijo él.
- **P-MIN-03 · Parcial alta, incluso sin comparación:** **La Mina queda cerca de cubrir la necesidad; Ferrada pide que no redondeen el título** — Rosa corrigió “completo” por “casi”. Ferrada aprobó la edición.
- **P-MIN-04 · Parcial alta, incluso sin comparación:** **La Mina queda cerca de cubrir su necesidad; Rosa corrige “completo” por “casi”** — Ferrada aprobó la edición sin pedir otra versión.
- **P-MIN-05 · Faltante relevante:** **El tanque de Ferrada está lleno de consejos; el faltante de agua sigue** — «Si alguno sirve para reemplazar el agua, venga y me muestra», dijo.
- **P-MIN-06 · Faltante relevante:** **Rosa reduce el informe de Mina a una frase** — «Falta agua». Ferrada le pidió que no la hiciera más larga.
- **P-MIN-07 · Faltante grave:** **Rosa corrige “situación complicada” por “falta mucha agua”** — Ferrada leyó la frase y dejó el marcador en la mesa.
- **P-MIN-08 · Faltante grave:** **Mina enfrenta un faltante grave y Ferrada se queda sin eufemismos** — Rosa puso el borrador en limpio. Esta vez no hubo correcciones.
- **P-MIN-09 · Mejora relativa con faltante pendiente:** **La Mina mejora su cobertura; Rosa agrega el “todavía falta”** — Ferrada leyó la frase completa antes de firmar.

### Río Vivo

- **P-RIO-01 · Completa:** **Río Vivo cubre su referencia ecológica; Clara deja el mapa sobre la mesa** — Marisa guardó el titular y miró el recorrido del río.
- **P-RIO-02 · Completa:** **Clara pide una foto del río sin carteles en primer plano** — El caudal cubrió la referencia ecológica. «Que también se vea lo que estamos contando».
- **P-RIO-03 · Parcial alta, incluso sin comparación:** **Río Vivo se acerca a su referencia; Clara corrige el titular “resuelto”** — Marisa cambió una palabra. Clara dejó el mapa abierto.
- **P-RIO-04 · Parcial alta, incluso sin comparación:** **El caudal ecológico queda cerca de la referencia, pero todavía no llega** — Clara aceptó «cerca» en el titular y tachó «completo».
- **P-RIO-05 · Brecha relevante:** **El mapa de Clara marca el tramo que todavía necesita caudal** — Marisa guardó el teléfono y abrió la libreta.
- **P-RIO-06 · Brecha relevante:** **Río Vivo sigue por debajo de su referencia ecológica** — Clara llevó el mapa actualizado. El título ya no necesitó explicación.
- **P-RIO-07 · Brecha grave:** **La referencia ecológica queda lejos del caudal registrado** — Clara señaló el tramo en el mapa y pidió que la nota mostrara el recorrido completo.
- **P-RIO-08 · Brecha grave:** **Brecha grave en Río Vivo: Clara lleva el mapa a la portada** — Esta vez pidió espacio para el tramo que falta, no para la foto.
- **P-RIO-09 · Mejora relativa con brecha pendiente:** **Río Vivo mejora, pero Clara deja “recuperado” para otra estación** — El titular conserva el avance y el faltante en la misma noticia.

#### Variantes adicionales para los cinco sectores

Las nuevas piezas llevan hechos actuales, sin necesitar comparación. Se amplían los estados que pueden aparecer muchas veces durante los veinte turnos; las de faltante grave tienen tres opciones por ser menos frecuentes. Las tres variantes de cobertura parcial alta sirven igual en la primera estación.

**Ciudad**

- **P-CIU-10 · Completa:** **Ciudad cubrió toda la necesidad; Tito tardó en encontrar un reclamo** — Mandó un pulgar arriba al grupo. Después agregó la foto del perro.
- **P-CIU-11 · Parcial alta, sin comparación:** **A Ciudad le faltó poco; Sofía dejó “casi” en la portada** — Tito quiso cambiarlo por “listo”. Sofía ya tenía el marcador.
- **P-CIU-12 · Parcial alta, sin comparación:** **El reparto dejó a Ciudad cerca de cubrir todo; el grupo siguió en línea** — Tito dejó de escribir del agua por cinco minutos. El perro pidió renovar la charla.
- **P-CIU-13 · Faltante relevante:** **Ciudad todavía tiene una parte importante de su necesidad pendiente** — Sofía puso el cartel de reclamos al lado de la canilla, para ahorrarle el recorrido a Tito.
- **P-CIU-14 · Faltante grave:** **Muy poca agua para Ciudad; Tito abrió el grupo antes que Sofía** — El reclamo ya tenía lugar, hora y moderador.
- **P-CIU-15 · Mejora relativa, con faltante:** **Ciudad recupera cobertura, no el derecho a cerrar el reclamo** — Sofía dejó las dos cosas en la misma nota.
- **P-CIU-16 · Mejora relativa, con faltante:** **El reparto mejora para Ciudad; Tito cambia “urgente” por “menos urgente”** — Sofía corrigió el título: el faltante sigue.

**Cultivos**

- **P-CUL-10 · Completa:** **Cultivos cubrió toda su necesidad; Jacinto encontró un renglón sin corregir** — Lo leyó dos veces antes de cerrar la libreta.
- **P-CUL-11 · Parcial alta, sin comparación:** **A Cultivos le faltó poco; Jacinto dejó la palabra “casi” en la cosecha** — «Cuando esté completo, le saco el círculo», dijo, señalando la libreta.
- **P-CUL-12 · Parcial alta, sin comparación:** **Cultivos quedó cerca de cubrir todo; Jacinto igual revisó el reparto** — Berta le preguntó si alguna vez daba por terminado un cálculo.
- **P-CUL-13 · Faltante relevante:** **Cultivos todavía tiene una parte importante de su necesidad pendiente** — Jacinto guardó el pronóstico y dejó abierta la libreta que sí podía reclamar.
- **P-CUL-14 · Faltante grave:** **Muy poca agua para Cultivos; Jacinto llegó con el reclamo foliado** — Marisa preguntó cuántas páginas eran. «Depende de cuánto espacio tengas».
- **P-CUL-15 · Mejora relativa, con faltante:** **Cultivos recupera cobertura; Jacinto conserva la cuenta del faltante** — Anotó el avance en la misma página, abajo de todo.
- **P-CUL-16 · Mejora relativa, con faltante:** **El reparto mejora para Cultivos, pero la libreta no se archiva** — Jacinto cambió la fecha y dejó el reclamo abierto.

**Granja**

- **P-GRA-10 · Completa:** **Granja cubrió toda su necesidad; Berta se tomó el mate antes de contestar** — Marisa tuvo que esperar a que terminara.
- **P-GRA-11 · Parcial alta, sin comparación:** **A Granja le faltó poco; Berta aceptó el “casi” sin soltar la lista** — La lista también tenía lugar para una pausa.
- **P-GRA-12 · Parcial alta, sin comparación:** **Granja quedó cerca de cubrir todo; Berta guardó una sola pregunta** — «¿Y lo que falta?», preguntó cuando Marisa terminó el titular.
- **P-GRA-13 · Faltante relevante:** **A Granja le queda una parte importante de su necesidad sin cubrir** — Berta explicó el problema sin levantarse del bebedero.
- **P-GRA-14 · Faltante grave:** **Muy poca agua para Granja; Berta no necesita que le lean el informe** — «Lo vi antes de que llegaras», le dijo a Marisa.
- **P-GRA-15 · Mejora relativa, con faltante:** **Granja recupera cobertura; Berta deja el reclamo a la vista** — «Mejorar no lo hace desaparecer», aclaró.
- **P-GRA-16 · Mejora relativa, con faltante:** **El reparto mejora para Granja, pero Berta no guarda la lista** — Tachó una línea y dejó el resto.

**Mina**

- **P-MIN-10 · Completa:** **Mina cubrió toda su necesidad; Rosa encontró a Ferrada sin un informe abierto** — Le preguntó si se sentía bien. Él buscó una carpeta.
- **P-MIN-11 · Parcial alta, sin comparación:** **A Mina le faltó poco; Rosa dejó “casi” en la portada** — Ferrada firmó después de comprobar que no decía «completo».
- **P-MIN-12 · Parcial alta, sin comparación:** **La Mina quedó cerca de cubrir todo; Ferrada pidió una foto del titular** — Rosa guardó la cámara hasta leer la bajada.
- **P-MIN-13 · Faltante relevante:** **Mina todavía tiene una parte importante de su necesidad pendiente** — Ferrada recibió una lista de consejos. Esta vez fue Rosa quien la trajo.
- **P-MIN-14 · Faltante grave:** **Muy poca agua para Mina; Rosa devuelve el informe sin eufemismos** — Ferrada leyó «falta mucha agua» y no pidió cambios.
- **P-MIN-15 · Mejora relativa, con faltante:** **Mina recupera cobertura; Rosa deja el faltante en el mismo renglón** — Ferrada leyó la frase completa antes de aprobarla.
- **P-MIN-16 · Mejora relativa, con faltante:** **El reparto mejora para Mina, pero Rosa no retira el reclamo** — El tanque de consejos puede esperar; el faltante, no.

**Río Vivo**

- **P-RIO-10 · Referencia ecológica completa:** **El caudal ecológico cubrió la referencia; Clara tachó “a ver si alcanza” del borrador** — Marisa guardó esa frase para otra estación.
- **P-RIO-11 · Parcial alta, sin comparación:** **A Río Vivo le faltó poco para la referencia ecológica** — Clara aceptó «casi»; la palabra «resuelto» volvió al cajón de Marisa.
- **P-RIO-12 · Parcial alta, sin comparación:** **El caudal quedó cerca de la referencia; Clara no firma el “listo”** — Marisa cambió una palabra y esta vez alcanzó.
- **P-RIO-13 · Brecha relevante:** **Al caudal ecológico le falta una parte importante de la referencia** — Clara pidió que el titular dijera eso antes de buscar una foto.
- **P-RIO-14 · Brecha grave:** **Muy lejos de la referencia: el caudal ecológico no entra en un titular optimista** — Clara dejó el adjetivo para otro día.
- **P-RIO-15 · Mejora relativa, con brecha:** **Río Vivo recupera caudal; la referencia sigue pendiente** — Clara aceptó el avance y dejó «resuelto» fuera de la edición.
- **P-RIO-16 · Mejora relativa, con brecha:** **El caudal mejora respecto de la estación anterior, pero aún queda corto** — Clara pidió que el titular llevara las dos partes.

#### Variantes adicionales para los veinte turnos

Las parejas anteriores dejan entre una y dos opciones por estado. Estas amplían los estados más recurrentes a tres o cuatro opciones por condición, sin usar la mejora como requisito para describir una cobertura parcial actual.

**Ciudad**

- **P-CIU-17 · Completa:** **Ciudad cerró sin faltantes; Sofía archivó el reclamo con fecha de devolución** — Tito pidió prórroga: el grupo todavía debatía el perro.
- **P-CIU-18 · Parcial alta, sin comparación:** **A Ciudad le faltó poco; el barrio fijó “casi” en el grupo** — Sofía corrigió la descripción para que nadie la confundiera con «listo».
- **P-CIU-19 · Parcial alta, sin comparación:** **Ciudad quedó cerca de cubrir todo; Tito dejó el audio para después** — Sofía le recordó que el «casi» también tenía que entrar en el mensaje.
- **P-CIU-20 · Faltante relevante:** **Ciudad sigue con una parte importante sin cubrir; Sofía ordenó los reclamos por turno** — Tito preguntó si su audio también tenía que esperar.
- **P-CIU-21 · Faltante grave:** **Ciudad recibe muy poca agua y el barrio pide lugar en la portada** — Sofía aceptó el título. Tito ya había mandado la foto.
- **P-CIU-22 · Mejora relativa, con faltante:** **Ciudad mejora respecto de la estación anterior; Sofía conserva la palabra “falta”** — Tito propuso borrarla del título. Sofía no le prestó la lapicera.
- **P-CIU-23 · Mejora relativa, con faltante:** **La cobertura de Ciudad se recupera, pero el reclamo no se archiva** — Sofía dejó la carpeta abierta y el chat silenciado.

**Cultivos**

- **P-CUL-17 · Completa:** **Cultivos cubrió toda su necesidad; Jacinto cerró la libreta sin sacar el pronóstico** — Berta alcanzó a servir el mate antes de la próxima consulta.
- **P-CUL-18 · Parcial alta, sin comparación:** **A Cultivos le faltó poco; Jacinto dejó el «casi» en el título** — La botella para el festejo quedó cerrada.
- **P-CUL-19 · Parcial alta, sin comparación:** **Cultivos quedó cerca de cubrir todo; Jacinto reservó un renglón para lo pendiente** — Marisa no necesitó preguntarle dónde iba.
- **P-CUL-20 · Faltante relevante:** **Cultivos todavía tiene una parte importante de la necesidad pendiente** — Jacinto marcó la página del reclamo antes de que Marisa abriera el grabador.
- **P-CUL-21 · Faltante grave:** **Cultivos recibió muy poca agua; Jacinto presentó la cuenta sin redondear** — «La versión optimista la dejé en casa», dijo.
- **P-CUL-22 · Mejora relativa, con faltante:** **Cultivos mejora respecto de la estación anterior, pero Jacinto guarda el reclamo** — Cambió la fecha; no cambió lo que todavía falta.
- **P-CUL-23 · Mejora relativa, con faltante:** **El reparto recupera cobertura en Cultivos, no la libreta de Jacinto** — Esa sigue abierta en la página del faltante.

**Granja**

- **P-GRA-17 · Completa:** **Granja cubrió toda su necesidad; Berta terminó el mate sentada** — La novedad llegó hasta el diario.
- **P-GRA-18 · Parcial alta, sin comparación:** **A Granja le faltó poco; Berta dejó el “casi” en la nota** — Marisa no tuvo que agregar una aclaración al final.
- **P-GRA-19 · Parcial alta, sin comparación:** **Granja quedó cerca de cubrir todo; Berta aceptó el titular con una condición** — Que no dijera «resuelto».
- **P-GRA-20 · Faltante relevante:** **Granja conserva una parte importante de su necesidad sin cubrir** — Berta revisó que la nota no se fuera por las ramas.
- **P-GRA-21 · Faltante grave:** **Granja recibió muy poca agua; Berta fue directa en la portada** — El pronóstico quedó afuera de la conversación.
- **P-GRA-22 · Mejora relativa, con faltante:** **Granja mejora respecto de la estación anterior, pero Berta deja el reclamo abierto** — «Las dos cosas entran en una nota», le recordó a Marisa.
- **P-GRA-23 · Mejora relativa, con faltante:** **El reparto mejora en Granja; la lista de Berta sigue teniendo renglones** — Tachó uno y guardó el resto.

**Mina**

- **P-MIN-17 · Completa:** **Mina cubrió toda su necesidad; Ferrada guardó el informe de faltantes** — Rosa comprobó que no fuera el de festejos.
- **P-MIN-18 · Parcial alta, sin comparación:** **A Mina le faltó poco; Rosa dejó “casi completo” en la bajada** — Ferrada firmó después de leer las dos palabras.
- **P-MIN-19 · Parcial alta, sin comparación:** **Mina quedó cerca de cubrir toda su necesidad; Ferrada pidió una foto del reparto** — Rosa le mostró primero la bajada, donde decía «cerca».
- **P-MIN-20 · Faltante relevante:** **Mina todavía tiene una parte importante de su necesidad pendiente** — Ferrada recibió una lista de consejos; Rosa comprobó que esta vez fueran sobre agua.
- **P-MIN-21 · Faltante grave:** **Mina recibió muy poca agua; el informe de Ferrada pierde los eufemismos** — Rosa le devolvió el borrador sin marcar una sola corrección.
- **P-MIN-22 · Mejora relativa, con faltante:** **Mina mejora respecto de la estación anterior, pero el faltante queda en tapa** — Rosa no dejó que Ferrada lo mandara a las páginas interiores.
- **P-MIN-23 · Mejora relativa, con faltante:** **La cobertura de Mina se recupera; Ferrada no retira el pedido** — Rosa guardó el informe con el tanque de consejos.

**Río Vivo**

- **P-RIO-17 · Referencia ecológica completa:** **El caudal ecológico cubrió toda la referencia; Clara dejó el titular sin “casi”** — Marisa encontró otra palabra para corregir en el epígrafe.
- **P-RIO-18 · Parcial alta, sin comparación:** **Al caudal ecológico le faltó poco para la referencia** — Clara dejó «casi» en portada y «completo» fuera del diario.
- **P-RIO-19 · Parcial alta, sin comparación:** **Río Vivo quedó cerca de la referencia ecológica** — Clara revisó que la bajada dijera «cerca» y no «llegó».
- **P-RIO-20 · Brecha relevante:** **Al caudal ecológico le falta una parte importante de la referencia** — Clara pidió que la foto no ocupara el lugar del dato.
- **P-RIO-21 · Brecha grave:** **El caudal ecológico quedó muy por debajo de la referencia** — Clara rechazó el titular «el río, como siempre» antes del cierre.
- **P-RIO-22 · Mejora relativa, con brecha:** **Río Vivo mejora respecto de la estación anterior; Clara conserva el faltante en portada** — Marisa pudo usar «mejor», no «resuelto».
- **P-RIO-23 · Mejora relativa, con brecha:** **El caudal ecológico recupera terreno, pero todavía no llega a la referencia** — Clara aprobó la noticia sin soltar el mapa.

### General, reservas, calidad, salud, flujos y sucesos

- **P-GEN-01 · Buen resultado general:** **El reparto sale bien; Jacinto revisa las cuentas antes de admitirlo** — «No desconfío. Me gusta saber por qué estoy contento».
- **P-GEN-02 · Buen resultado general:** **El valle consigue una buena estación y Berta guarda una medialuna** — El equipo compartió el mérito. La última medialuna necesitó mediación.
- **P-GEN-03 · Resultado normal:** **El valle cierra la estación con decisiones para la próxima** — Marisa pidió una prioridad. Los cinco sectores levantaron la mano.
- **P-GEN-04 · Resultado normal:** **La agenda del valle sigue abierta; el café ya se terminó** — El consejo dejó decisiones para la próxima estación. Berta miró la pava.
- **P-GEN-05 · Trade-off, beneficiario con cobertura completa:** **El embalse bancó el reparto y la próxima estación hereda menos reserva** — El sector priorizado cubrió toda su necesidad. El agua salió de lo guardado para después; Berta propuso no gastar toda la portada en el festejo.
- **P-GEN-06 · Trade-off, beneficiario con faltante:** **El embalse bancó el reparto; al sector priorizado igual le faltó agua** — Se usó reserva y la necesidad del sector beneficiado no quedó cubierta del todo. Sofía pidió que el titular no lo vendiera como final feliz.
- **P-GEN-07 · Crisis de Ciudad:** **Ciudad enfrenta un faltante grave; Tito ya armó el grupo** — Sofía leyó el primer mensaje y dejó el teléfono boca arriba.
- **P-GEN-08 · Calidad en alerta:** **Calidad del agua, en zona de alerta; el eslogan queda en pausa** — Clara pidió que la nota se apoyara en el análisis. La campaña puede esperar.
- **P-GEN-09 · Calidad baja respecto de la estación previa:** **La calidad del agua cayó; la foto no pasó el análisis** — La medición bajó respecto de la anterior. Marisa guardó la foto para otra nota.
- **P-GEN-10 · Calidad mejora:** **La calidad del agua se recupera y Clara acepta una buena noticia** — «Poné qué cambió», pidió. La nota salió sin prometer de más.
- **P-GEN-11 · Calidad estable con historial:** **La calidad se mantuvo; la redacción se quedó sin “mejoró” y “empeoró”** — Clara aprobó “estable”. Marisa guardó los otros dos titulares para otra edición.
- **P-GEN-12 · Primera medición de calidad, sin historial:** **La calidad del agua debuta en la portada, sin edición anterior para comparar** — Es la primera medición disponible. Clara pidió que no la llamaran «mejora» hasta tener con qué compararla.
- **P-GEN-13 · Salud del río en alerta:** **La salud del río ocupa la portada; la foto linda queda para el reverso** — Clara pidió que el dato fuera al frente. Marisa cambió la maqueta.
- **P-GEN-14 · Salud del río mejora:** **La salud del río mejora; Clara guarda el mapa para la próxima estación** — «Hoy lo celebro. Mañana lo volvemos a mirar».
- **P-GEN-15 · Salud del río estable con historial:** **La salud del río se mantiene; Clara conserva el mapa a mano** — Marisa preguntó si había otra novedad. «Que siga igual también cuenta», dijo Clara.
- **P-GEN-16 · Primera medición de salud, sin historial:** **La salud del río debuta en el balance; Clara ya tiene una carpeta para la próxima** — Es la primera referencia. Marisa dejó el espacio de comparación en blanco.
- **P-GEN-29 · Salud del río baja pero aún fuera de alerta:** **La salud del río retrocede; Clara actualiza el mapa** — La medición bajó frente a la anterior sin entrar en la banda de alerta. Marisa dejó el paisaje de portada para otra nota.
- **P-GEN-17 · Reserva sube:** **El embalse recupera agua y aparecen planes para gastarla** — Berta propuso dejarla guardada un rato antes de decidir.
- **P-GEN-18 · Reserva baja, fuera del titular de trade-off:** **El embalse prestó agua al reparto; la reserva no se repone con aplausos** — La reserva terminó más baja. Berta guardó el brindis para cuando vuelva a subir.
- **P-GEN-19 · Reserva estable:** **El embalse termina con la misma reserva con la que empezó** — Tito propuso llamarlo “ahorro”. Sofía pidió esperar a ver la próxima estación.
- **P-GEN-20 · Deshielo:** **El deshielo llegó antes que el pronóstico de Jacinto** — La reserva de nieve aportó agua al río esta estación. Jacinto revisó el pronóstico igual.
- **P-GEN-21 · Lluvia e infiltración:** **Parte de la lluvia se infiltra; el balance también la cuenta** — Jacinto miró el pronóstico y guardó el tanque vacío.
- **P-GEN-22 · Lluvia sin infiltración registrada:** **Llovió; “lluvia aprovechada” quedó afuera de la edición** — El balance no registró infiltración al suelo. Marisa cambió el título antes de imprimir.
- **P-GEN-23 · Bombeo del acuífero:** **El reparto echó mano al acuífero; Berta revisa qué reserva se usó** — El balance registró bombeo. Berta abrió la página de reservas, no la de promesas.
- **P-GEN-24 · Sin bombeo ni extracción extraordinaria por evento:** **Esta estación no recurrió al agua subterránea** — El balance no registró bombeo ni extracción extraordinaria del acuífero. Ferrada pidió no anotarlo como aporte al reparto.
- **P-GEN-25 · Retornos al río:** **El agua usada vuelve al río; Clara agrega una posdata al reparto** — Los retornos ya están incluidos en el flujo aguas abajo. Clara escribió la posdata al margen del mapa.
- **P-GEN-26 · Entrega completa con pedido menor a la necesidad:** **El envío llegó entero; la necesidad era más grande que el pedido** — Se entregó todo lo asignado. El sobre decía «completo»; la cuenta, no.
- **P-GEN-27 · Oportunidad elegida:** **Una propuesta del valle pasa del anuncio a una decisión** — La opción elegida queda asentada en la noticia. Berta fue directo a la pregunta del lunes.
- **P-GEN-28 · Evento registrado sin decisión elegida:** **El suceso ocupa la portada; el clima reclama derecho a réplica** — El balance registra el evento junto con el clima y el reparto. La redacción no puede darle un apellido al resultado.

#### Variantes adicionales para calidad y salud del río

- **P-GEN-30 · Primera medición de calidad:** **La calidad del agua tiene su primera referencia en el Heraldo** — Clara pidió guardar el titular de “mejora” hasta que exista otra medición.
- **P-GEN-31 · Calidad estable:** **Sin cambios en la calidad; Marisa archiva dos titulares** — Clara aprobó “se mantiene”. «El otro decía que subía y el otro que bajaba», explicó Marisa.
- **P-GEN-32 · Calidad en alerta:** **El análisis de calidad le gana la portada al folleto** — Clara dejó el eslogan para después. Esta edición va con el dato disponible.
- **P-GEN-33 · Caída de calidad:** **La calidad baja y la foto del río queda para otra página** — Marisa cambió la imagen principal por la medición.
- **P-GEN-34 · Calidad en recuperación:** **La calidad recupera terreno; Clara revisa que el titular no se apure** — Marisa quitó «resuelta» y dejó la mejora.
- **P-GEN-35 · Primera medición de salud del río:** **La salud del río debuta en el balance; Clara ya guardó el mapa** — Marisa anotó que todavía no hay una estación anterior para comparar.
- **P-GEN-36 · Salud del río estable:** **La salud del río se mantiene; el mapa no necesita una flecha hacia arriba** — Clara lo dejó abierto para la próxima revisión.
- **P-GEN-37 · Salud del río en alerta:** **La alerta del río ocupa la portada sin paisaje de relleno** — Clara pidió que la foto no tapara el dato.
- **P-GEN-38 · Caída de salud del río:** **El río pierde terreno en el balance; Clara saca el mapa** — La medición bajó respecto de la anterior. La redacción cambió el epígrafe.
- **P-GEN-39 · Salud del río en recuperación:** **El río mejora y Clara deja el mapa abierto** — La noticia celebra el avance sin dar por terminado el trabajo.
- **P-GEN-40 · Primera medición de calidad:** **Clara estrena sección de calidad y deja el “mejoró” en borradores** — Todavía no hay una medición anterior para comparar.
- **P-GEN-41 · Calidad estable:** **La calidad se mantiene; por una vez, el titular no necesita flechas** — Marisa archivó las versiones que anunciaban una suba o una caída.
- **P-GEN-42 · Calidad en alerta:** **La calidad del agua está en alerta; el folleto puede esperar** — Clara pidió que primero se publicara el resultado del análisis.
- **P-GEN-43 · Caída de calidad:** **La medición de calidad bajó y Clara pidió corregir la portada** — El paisaje seguía siendo lindo; la noticia era otra.
- **P-GEN-44 · Calidad en recuperación:** **La calidad mejora; Clara acepta el titular con letra chica** — Marisa dejó la recuperación en la nota y evitó anunciar un problema resuelto.
- **P-GEN-45 · Primera medición de salud del río:** **El río estrena ficha propia; Clara reserva espacio para comparar** — La primera referencia ya está registrada.
- **P-GEN-46 · Salud del río estable:** **La salud del río se mantiene y Clara archiva la flecha** — «No subió ni bajó», resumió Marisa, sin inventarle una novedad.
- **P-GEN-47 · Salud del río en alerta:** **La salud del río está en alerta; Clara deja el paisaje para el suplemento** — La portada cuenta el estado del río.
- **P-GEN-48 · Caída de salud del río:** **La salud del río retrocede; esta vez el mapa no trae buenas noticias** — La medición bajó respecto de la estación anterior.
- **P-GEN-49 · Salud del río en recuperación:** **El río mejora y Clara permite un verbo optimista** — Marisa dejó «mejora» en el título y guardó «resuelto».
- **P-GEN-50 · Resultado normal:** **El valle cierra una estación sin ganador de la discusión** — Marisa anotó las prioridades; Berta preguntó quién había apagado la pava.
- **P-GEN-51 · Trade-off, beneficiario con cobertura completa:** **El embalse puso agua para el reparto y perdió reserva para después** — El sector priorizado cubrió toda su necesidad. Berta celebró el resultado y pidió que no gastaran también la reserva en brindis.
- **P-GEN-52 · Trade-off, beneficiario con faltante:** **El embalse cedió reserva; al sector priorizado todavía le faltó agua** — El reparto no cubrió toda su necesidad. Sofía dejó «misión cumplida» fuera de la edición.
- **P-GEN-53 · Reserva baja, sin trade-off de portada:** **El embalse terminó con menos reserva; Berta guardó el brindis** — El saldo bajó esta estación. «Lo descorchamos cuando vuelva», dijo.
- **P-GEN-54 · Reserva estable:** **El embalse conservó la reserva; Tito quiso declararla noticia histórica** — Sofía le recordó que el titular también tenía que contar algo.
- **P-GEN-55 · Reserva en recuperación:** **El embalse juntó reserva y Berta pidió no repartirla en festejos** — El saldo aumentó esta estación; el uso futuro todavía se decide.
- **P-GEN-56 · Oportunidad elegida:** **La propuesta dejó el papel y entró en el acta** — La decisión elegida quedó registrada. Berta preguntó quién llevaba la copia.

### Eventos con opción elegida

Cada subhead de abajo es texto visible completo para su opción real. Los identificadores entre corchetes sólo indican qué opción lo dispara.

- **P-EVT-01-A · Calor en Granja · `agua_fresca_berta`:** **Berta pide que la ola de calor no se lleve también la sombra** — Se eligió renovar los piletones con agua fresca. Berta ya reservó la sombra para la próxima entrevista.
- **P-EVT-01-B · Calor en Granja · `bebederos_sombra`:** **Berta pide que la ola de calor no se lleve también la sombra** — Se eligieron sombra y bebederos térmicos. Berta aprobó la sombra antes que la foto.
- **P-EVT-02-A · Molienda en Mina · `enfriamiento_mina`:** **La molienda suma un turno y Rosa pide leer la letra chica** — Se autorizó agua adicional para la producción. Rosa pidió que el comunicado no se olvidara de la palabra «adicional».
- **P-EVT-02-B · Molienda en Mina · `recirculacion_mina`:** **La molienda suma un turno y Rosa pide leer la letra chica** — Se eligió usar la recirculación instalada. Rosa preguntó si el informe también iba a circular.
- **P-EVT-02-C · Molienda en Mina · `freno_mina`:** **La molienda suma un turno y Rosa pide leer la letra chica** — Se mantuvo la producción normal sin agua extra. Rosa guardó el borrador que anunciaba un cambio.
- **P-EVT-03-A · Aniversario de Ciudad · `fuentes_activas`:** **El aniversario de Ciudad se festeja con una discusión sobre las fuentes** — Se eligió celebrar con las fuentes activas. Tito se ofreció para supervisar; Sofía pidió supervisor para Tito.
- **P-EVT-03-B · Aniversario de Ciudad · `campana_educativa`:** **El aniversario de Ciudad se festeja con una discusión sobre las fuentes** — Se eligió una exposición sobre cuidado del agua. Tito pidió espacio para la muestra y no para otro discurso.
- **P-EVT-03-C · Aniversario de Ciudad · `ahorro_estricto`:** **El aniversario de Ciudad se festeja con una discusión sobre las fuentes** — Se suspendieron los juegos de agua. Tito guardó el silbato para una ocasión más seca.
- **P-EVT-04-A · Festival de Cultivos · `apoyo_jacinto`:** **Jacinto llega al festival con el riego bajo el brazo** — Se autorizó agua extra para la siembra. Jacinto revisó que el calendario no tuviera letra chica.
- **P-EVT-04-B · Festival de Cultivos · `riego_eficiente_jacinto`:** **Jacinto llega al festival con el riego bajo el brazo** — Se eligió exigir riego por goteo. Jacinto pidió que la nota no goteara letras chicas.
- **P-EVT-04-C · Festival de Cultivos · `priorizar_reserva`:** **Jacinto llega al festival con el riego bajo el brazo** — Se mantuvo el cupo para cuidar la reserva. Jacinto guardó el calendario para la próxima siembra.
- **P-EVT-05-A · Carpincho en el humedal · `pulso_ecologico`:** **Un carpincho visita el humedal y Clara intenta recuperar la agenda** — Se eligió liberar un pulso de agua al humedal. Clara corrigió «visita guiada» por «recorrido del agua».
- **P-EVT-05-B · Carpincho en el humedal · `canal_biofiltro`:** **Un carpincho visita el humedal y Clara intenta recuperar la agenda** — Se eligió conectar meandros y totoras. Clara pidió que el plano también mostrara el recorrido.
- **P-EVT-05-C · Carpincho en el humedal · `dejar_ciclo`:** **Un carpincho visita el humedal y Clara intenta recuperar la agenda** — Se eligió dejar continuar el ciclo natural. Clara guardó el plano que había preparado para explicar la otra opción.
- **P-EVT-06-A · Fuga de red en Ciudad · `reparar_canerias`:** **La fuga de Ciudad obliga a elegir entre parche, sensor y obra** — Se eligió reparar la fuga con la cuadrilla. Sofía guardó el plano para que esta vez miraran la cañería.
- **P-EVT-06-B · Fuga de red en Ciudad · `sensores_red`:** **La fuga de Ciudad obliga a elegir entre parche, sensor y obra** — Se eligió sectorizar la red con sensores. Tito preguntó si el mapa venía con flecha; Sofía le mandó la leyenda.
- **P-EVT-06-C · Fuga de red en Ciudad · `postergar_fuga`:** **La fuga de Ciudad obliga a elegir entre parche, sensor y obra** — Se postergó el arreglo. Tito escribió «lo retomamos» y Sofía le pidió que le pusiera fecha.
- **P-EVT-06-D · Fuga de red en Ciudad · `renovar_red`:** **La fuga de Ciudad obliga a elegir entre parche, sensor y obra** — Se eligió renovar la red de forma permanente. Sofía pidió guardar la foto inaugural para cuando haya algo que inaugurar.
- **P-EVT-07-A · Flamencos y turismo · `reserva_protegida`:** **Flamencos y canoas entran en la discusión del humedal** — Se eligió proteger el área como parque natural. Clara pidió que el folleto esperara al plan.
- **P-EVT-07-B · Flamencos y turismo · `paseos_embarcacion`:** **Flamencos y canoas entran en la discusión del humedal** — Se eligieron paseos guiados en canoa. Clara revisó el recorrido antes que el título.
- **P-EVT-08-A · Falla de saneamiento · `reparacion_urgente`:** **La falla de saneamiento deja los eslóganes fuera de servicio** — Se eligió reparar los filtros de inmediato. Clara dejó el eslogan para después de revisar el tratamiento.
- **P-EVT-08-B · Falla de saneamiento · `dilucion_rio`:** **La falla de saneamiento deja los eslóganes fuera de servicio** — Se eligió liberar agua para diluir la suciedad. Clara pidió que la nota dijera «diluir», no «eliminar».
- **P-EVT-09-A · Sequía severa · `restriccion_riego`:** **La sequía lleva el reparto a una decisión de emergencia** — Se eligió riego nocturno y restricciones. Jacinto preguntó si el pronóstico también iba a respetar el horario.
- **P-EVT-09-B · Sequía severa · `agotar_embalse`:** **La sequía lleva el reparto a una decisión de emergencia** — Se eligió usar la reserva superficial de emergencia. Sofía pidió que «de emergencia» no se borrara del titular.
- **P-EVT-09-C · Sequía severa · `bombear_acuifero`:** **La sequía lleva el reparto a una decisión de emergencia** — Se eligió bombeo subterráneo de emergencia. Berta pidió que la reserva también apareciera en la nota.
- **P-EVT-10-A · Lluvia extraordinaria · `liberar_preventivo`:** **La lluvia extraordinaria abre la edición y desordena el pronóstico** — Se eligió liberar agua antes de la crecida. Tito apareció con el paraguas que Sofía le había prestado.
- **P-EVT-10-B · Lluvia extraordinaria · `retener_todo`:** **La lluvia extraordinaria abre la edición y desordena el pronóstico** — Se eligió intentar retener el agua de la crecida. Clara pidió que «intentar» no desapareciera de la nota.
- **P-EVT-10-C · Lluvia extraordinaria · `drenaje_sostenible`:** **La lluvia extraordinaria abre la edición y desordena el pronóstico** — Se eligió usar el drenaje para infiltrar agua. Jacinto revisó el pronóstico por si quería agregar algo.

## Ver el valle · carteles propuestos

### Reemplazos de las 30 entradas V actuales

Cada cartel es una sola escena breve, no una secuencia de diálogo.

- **V-CIU-01 · Completa:** Sofía silenció el grupo. El perro volvió a ser el tema principal.
- **V-CIU-02 · Completa:** Con la necesidad de Ciudad cubierta, Tito felicitó a Sofía. Después aclaró que era por el perro.
- **V-CIU-03 · Parcial alta con mejora:** Ciudad mejoró y quedó cerca de cubrir todo; Sofía aceptó el festejo, pero guardó el reclamo.
- **V-CIU-04 · Faltante relevante:** Faltó agua en Ciudad. Sofía pidió un reclamo concreto; Tito señaló la canilla.
- **V-CIU-05 · Faltante grave:** Faltó mucha agua en Ciudad. El grupo del barrio se organizó y Tito preguntó quién tenía el teléfono de Sofía.
- **V-CIU-06 · Mejora relativa con faltante:** Ciudad mejoró, pero todavía falta agua. Tito propuso un festejo corto; Sofía preguntó si el reclamo también.
- **V-CUL-01 · Completa:** Cultivos cubrió toda su necesidad. Jacinto guardó el pronóstico y lo sacó para comprobarlo.
- **V-CUL-02 · Completa:** Sin faltantes en Cultivos, Jacinto se sentó a descansar con la libreta en la falda.
- **V-CUL-03 · Parcial alta con mejora:** Cultivos mejoró y quedó cerca de cubrir todo. Jacinto anotó «mejoró» y dejó renglones para lo que falta.
- **V-CUL-04 · Faltante relevante:** A Cultivos le faltó una parte importante. Jacinto mostró el surco de la planilla; Marisa miró el de al lado.
- **V-CUL-05 · Faltante grave:** Cultivos recibió muy por debajo de lo necesario. Jacinto cerró la cuenta; esta vez ya sabía el resultado.
- **V-CUL-06 · Mejora relativa con faltante:** Cultivos mejoró, pero sigue faltando agua. Jacinto anotó el avance en la libreta de reclamos, no en la de festejos.
- **V-GRA-01 · Completa:** Granja cubrió toda su necesidad. Berta se sentó con el mate y avisó que estaba descansando.
- **V-GRA-02 · Completa:** Sin faltantes en Granja, Marisa pidió una foto. Berta esperó a que el mate dejara de humear.
- **V-GRA-03 · Parcial alta con mejora:** Granja mejoró y quedó cerca de cubrir todo. Berta aceptó el elogio y señaló lo que faltaba.
- **V-GRA-04 · Faltante relevante:** A Granja le faltó una parte importante del agua. Marisa llegó tarde; Berta ya había explicado por qué convenía llegar temprano.
- **V-GRA-05 · Faltante grave:** A Granja le faltó mucha agua. Berta resumió el reclamo en dos palabras: «Falta agua».
- **V-GRA-06 · Mejora relativa con faltante:** Granja mejoró, aunque sigue faltando agua. Berta anotó ambas cosas en el mismo renglón.
- **V-MIN-01 · Completa:** Mina cubrió toda su necesidad. Ferrada tarareó junto a la planta; Rosa reconoció la canción antes que él.
- **V-MIN-02 · Completa:** Sin faltantes en Mina, Rosa le sacó una foto a Ferrada. Los demás estaban trabajando.
- **V-MIN-03 · Parcial alta con mejora:** Mina mejoró y quedó cerca de cubrir todo. Ferrada dijo «llegó más»; Rosa esperó el «pero».
- **V-MIN-04 · Faltante relevante:** A Mina le faltó una parte importante del agua. Rosa tachó «todo bien» del informe y dejó el resto.
- **V-MIN-05 · Faltante grave:** A Mina le faltó mucha agua. Ferrada empezó con las explicaciones; Rosa le alcanzó el tanque lleno de consejos.
- **V-MIN-06 · Mejora relativa con faltante:** Mina mejoró, pero todavía quedó corta. Rosa felicitó a Ferrada «por la mejora», aclaró.
- **V-RIO-01 · Referencia ecológica completa:** El caudal ecológico cubrió toda la referencia. Clara dejó el mapa a la vista; esta vez no hubo que dibujar lo que faltaba.
- **V-RIO-02 · Referencia ecológica completa:** Río Vivo llegó a la referencia ecológica. Marisa preparó la foto; Clara pidió que el río saliera entero.
- **V-RIO-03 · Parcial alta con mejora:** Río Vivo mejoró, aunque no llegó a cubrir toda la referencia. Clara cambió «resuelto» por «mejor».
- **V-RIO-04 · Brecha relevante:** Al río le faltó una parte importante del caudal ecológico. Clara rechazó el título «casi normal» antes de que Marisa lo terminara.
- **V-RIO-05 · Brecha grave:** El caudal ecológico quedó muy lejos de la referencia. Clara puso el mapa en portada: el paisaje no iba a tapar el faltante.
- **V-RIO-06 · Mejora relativa con brecha:** El caudal ecológico subió respecto de la estación anterior, pero sigue bajo la referencia. Clara dejó «mejor» y tachó «listo».

### Variantes nuevas para cobertura parcial alta desde la primera estación

Estas piezas no requieren historial ni una mejora relativa. El selector puede alternar entre ellas con la cobertura actual; ninguna dice que la necesidad esté completamente cubierta.

- **V-CIU-07 · Ciudad, 80%–<100%:** Ciudad cubrió casi todo. Sofía aceptó el «casi»; el grupo pidió que lo pusiera por escrito.
- **V-CIU-08 · Ciudad, 80%–<100%:** A Ciudad le faltó poco. Tito quiso cerrar el reclamo; Sofía le mostró el renglón pendiente.
- **V-CIU-09 · Ciudad, 80%–<100%:** A Ciudad le faltó poco para cubrir todo. Tito guardó el audio de agradecimiento para más adelante.
- **V-CUL-07 · Cultivos, 80%–<100%:** A Cultivos le faltó poco. Jacinto aceptó el «casi» y dejó la libreta abierta.
- **V-CUL-08 · Cultivos, 80%–<100%:** Cultivos quedó cerca de cubrir todo. Jacinto revisó la asignación antes de sonreírle al pronóstico.
- **V-CUL-09 · Cultivos, 80%–<100%:** A Cultivos le faltó una parte menor. Berta felicitó a Jacinto; él le mostró cuánto faltaba.
- **V-GRA-07 · Granja, 80%–<100%:** A Granja le faltó poco. Berta aceptó el «casi»; el mate esperaba el «todo».
- **V-GRA-08 · Granja, 80%–<100%:** Granja quedó cerca de cubrir todo. Marisa escribió «mejor»; Berta le alcanzó espacio para lo que faltaba.
- **V-GRA-09 · Granja, 80%–<100%:** A Granja le faltó una parte menor. Berta celebró sin levantarse; todavía faltaba una parte.
- **V-MIN-07 · Mina, 80%–<100%:** Mina cubrió casi todo. Ferrada aprobó el titular; Rosa agregó «todavía falta» en letra grande.
- **V-MIN-08 · Mina, 80%–<100%:** A Mina le faltó poco. Rosa guardó el tanque de consejos, por esta vez.
- **V-MIN-09 · Mina, 80%–<100%:** Mina quedó cerca de cubrir todo. Ferrada dijo «casi» y Rosa lo tradujo al informe.
- **V-RIO-07 · Río Vivo, 75%–<100%:** El caudal cubrió casi toda la referencia ecológica. Clara aceptó «casi» y tachó «resuelto».
- **V-RIO-08 · Río Vivo, 75%–<100%:** Al caudal todavía le faltó una parte de la referencia. Marisa tachó «completo»; Clara dejó el mapa abierto.
- **V-RIO-09 · Río Vivo, 75%–<100%:** El caudal quedó cerca, pero no cubrió la referencia ecológica. Clara corrigió el cartel antes de que secara la tinta.

### Variantes de mejora relativa con faltante o brecha pendiente

Son elegibles sólo si hay historial y la cobertura mejoró; el texto conserva el faltante. Para Cultivos y Mina, se respeta además la condición actual del selector que exige mayor suministro recibido.

- **V-CIU-10 · Mejora relativa, falta agua:** Ciudad recuperó cobertura, pero no llegó al total. Sofía tachó «resuelto» y dejó «mejor».
- **V-CIU-11 · Mejora relativa, falta agua:** El reparto mejoró para Ciudad. Tito mandó «vamos mejor»; Sofía dejó el reclamo abierto.
- **V-CUL-10 · Mejora relativa, falta agua:** Cultivos recuperó cobertura, no la totalidad. Jacinto anotó el avance arriba del faltante.
- **V-CUL-11 · Mejora relativa, falta agua:** El reparto mejoró para Cultivos. Jacinto dejó la libreta abierta, por si alguien confundía «mejor» con «completo».
- **V-GRA-10 · Mejora relativa, falta agua:** Granja recibió una proporción mayor que antes, pero todavía quedó corta. Berta dejó el mate y siguió con la lista.
- **V-GRA-11 · Mejora relativa, falta agua:** El reparto mejoró para Granja. Berta aceptó el titular y guardó la lista para la próxima.
- **V-MIN-10 · Mejora relativa, falta agua:** Mina recuperó cobertura, aunque aún quedó por debajo de lo necesario. Rosa dejó «todavía falta» en el margen.
- **V-MIN-11 · Mejora relativa, falta agua:** El reparto mejoró para Mina. Ferrada aprobó el titular; Rosa revisó que no dijera «resuelto».
- **V-RIO-10 · Mejora relativa, brecha ecológica:** El caudal ecológico subió frente a la estación anterior, pero quedó bajo la referencia. Clara dejó «mejor» en el cartel.
- **V-RIO-11 · Mejora relativa, brecha ecológica:** Río Vivo recuperó parte de la cobertura ecológica; Clara tachó «completo» antes de que Marisa imprimiera.

### Variantes adicionales para cobertura completa y faltantes

Se amplían también los carteles que pueden repetirse turno a turno. Cada pieza conserva el estado visible sin repetir el mismo prefijo.

- **V-CIU-12 · Completa:** Ciudad quedó sin faltantes. Sofía silenció el grupo; el perro siguió con la agenda.
- **V-CIU-13 · Faltante relevante:** En Ciudad todavía falta una parte importante del agua. Tito ya había reservado el renglón para el reclamo.
- **V-CIU-14 · Faltante relevante:** Ciudad quedó lejos de cubrir toda la necesidad. Sofía no necesitó preguntarle a Tito qué había pasado.
- **V-CIU-15 · Faltante grave:** La mayor parte de la necesidad de Ciudad quedó sin cubrir. El reclamo de Tito llegó con índice.
- **V-CIU-16 · Faltante grave:** Ciudad recibió muy poca agua. Sofía dejó el teléfono con sonido; el grupo ya estaba activo.
- **V-CUL-12 · Completa:** Sin faltantes de agua en Cultivos, Jacinto cerró la libreta. El pronóstico quedó abierto.
- **V-CUL-13 · Faltante relevante:** A Cultivos todavía le falta una parte importante del agua. Jacinto llegó con las cuentas hechas.
- **V-CUL-14 · Faltante relevante:** Cultivos quedó lejos de cubrir todo. Marisa sacó el grabador; Jacinto ya tenía la página marcada.
- **V-CUL-15 · Faltante grave:** Cultivos recibió muy por debajo de lo que necesitaba. Jacinto no tuvo que buscar la libreta de reclamos.
- **V-CUL-16 · Faltante grave:** La mayor parte de la necesidad de Cultivos quedó pendiente. Jacinto revisó una vez más, por si la cuenta cambiaba.
- **V-GRA-12 · Completa:** Granja terminó sin faltantes. Berta se sentó a tomar el mate antes de que apareciera otra visita.
- **V-GRA-13 · Faltante relevante:** A Granja le falta una parte importante del agua. Berta no necesitó sacar la lista para acordarse.
- **V-GRA-14 · Faltante relevante:** Granja quedó lejos de cubrir todo lo que necesitaba. Berta le acercó a Marisa el bebedero vacío.
- **V-GRA-15 · Faltante grave:** Granja recibió muy poca agua. Berta fue directo al punto y dejó el mate para después.
- **V-GRA-16 · Faltante grave:** La mayor parte de la necesidad de Granja quedó sin cubrir. Berta no necesitó que le preguntaran por qué estaba reclamando.
- **V-MIN-12 · Completa:** Mina cubrió toda su necesidad. Rosa encontró a Ferrada sin el informe de faltantes.
- **V-MIN-13 · Faltante relevante:** A Mina todavía le falta una parte importante del agua. Rosa tachó «todo bien» antes de que Ferrada lo leyera.
- **V-MIN-14 · Faltante relevante:** Mina quedó lejos de cubrir todo. Ferrada abrió el informe; Rosa dejó el tanque de consejos al lado.
- **V-MIN-15 · Faltante grave:** Mina recibió muy poca agua. Rosa le alcanzó a Ferrada la versión del informe sin eufemismos.
- **V-MIN-16 · Faltante grave:** La mayor parte de la necesidad de Mina quedó pendiente. Ferrada no pidió una segunda opinión a Rosa.
- **V-RIO-12 · Referencia ecológica completa:** El caudal cubrió toda la referencia ecológica. Clara no tuvo que corregir «casi» en el cartel.
- **V-RIO-13 · Brecha relevante:** Al caudal ecológico le falta una parte importante de la referencia. Clara eligió un título sin adjetivos tranquilizadores.
- **V-RIO-14 · Brecha relevante:** Río Vivo quedó lejos de cubrir la referencia de caudal. Marisa guardó «normal» para otra noticia.
- **V-RIO-15 · Brecha grave:** El caudal ecológico quedó muy por debajo de la referencia. Clara pidió que el cartel no achicara el faltante.
- **V-RIO-16 · Brecha grave:** La mayor parte de la referencia ecológica quedó sin cubrir. Clara dejó «todo bien» fuera del vocabulario del día.

### Revisión de las 16 escenas heredadas A-MAP

- **A-MAP-01 · Mantener, sólo Ciudad completa:** Sofía: «Alcanzó el agua. En el grupo del barrio están discutiendo por un perro. Volvimos a la normalidad».
- **A-MAP-02 · Mantener, Ciudad con faltante:** Sofía: «Me dijeron “ponete en nuestro lugar”. Bueno, pasame tu agua».
- **A-MAP-03 · Reemplazar con la corrección pedida:** Jacinto: «Hoy no me puedo quejar. Mi familia me pidió que lo ponga por escrito».
- **A-MAP-04 · Mantener, Cultivos:** Jacinto: «Me recomendaron hablarles a las plantas. Les dije que reclamen conmigo».
- **A-MAP-05 · Mantener sólo con cobertura completa de Granja:** Berta: «Las vacas tienen agua y yo tengo un rato libre. Me siguen mirando: no conocen esta versión mía».
- **A-MAP-06 · Acortar, Granja con faltante:** Berta: «Vine a reclamar yo: la vaca no entra en el auto».
- **A-MAP-07 · Mantener sólo con cobertura completa de Mina:** Ferrada: «Preparé un discurso para festejar. Me aplaudieron cuando dije que era corto».
- **A-MAP-08 · Mantener sólo si el evento del carpincho figura en el historial y Río Vivo está completo:** Clara: «Yo explicando lo importante que es el río y un carpincho rascándose. Un poco de apoyo te pido».
- **A-MAP-19 · Acortar, Ciudad completa:** Tito felicitó a Sofía en el grupo. En privado: «No te acostumbres; después me mandan a reclamar a mí».
- **A-MAP-20 · Acortar, Ciudad completa o con faltante no grave:** Sofía pidió una solución. Tito: «Yo marco los problemas. Si también los resuelvo, ¿vos qué hacés?».
- **A-MAP-21 · Reemplazar la escena larga, Mina completa:** Rosa le sacó una foto a Ferrada en el festejo. Los demás estaban trabajando.
- **A-MAP-22 · Acortar, Mina con faltante:** Rosa a Ferrada: «Necesitar agua no se pide perdón».
- **A-MAP-23 · Reemplazar la conversación larga, Cultivos completo:** Marisa grabó a Jacinto admitiendo que salió bien. Guardó el audio por si mañana lo negaba.
- **A-MAP-24 · Acortar, Granja con faltante:** Berta autorizó la nota: «Publicá también lo que dije al irme».
- **A-MAP-25 · Acortar, Río Vivo con brecha:** Clara empezó a decir «pueden repartir mejor». Marisa cerró el cuaderno demasiado pronto.
- **A-MAP-26 · Acortar; sólo si la reserva realmente subió:** Tito propuso ahorrar para cuando hiciera falta. Sofía le pidió que decidieran cuándo sería ese momento.

La tarjeta de Ciudad con **91%** debe seleccionar `V-CIU-07`, `V-CIU-08` o `V-CIU-09` aunque no haya historial. El número permanece en el título de la tarjeta; el texto se ocupa del remate.

## Reemplazos de respaldos y textos de apoyo del Heraldo

Estas cadenas aparecen en rutas que hoy esquivan o no tienen pareja aprobada. Suelen repetirse en notas secundarias, aunque no tengan un ID visible.

- **Calidad · primera estación:** «Primera medición de calidad: queda una referencia para comparar».
- **Calidad · estable con comparación:** «La calidad se mantuvo. Clara pidió guardar el titular de “mejora” para cuando corresponda».
- **Calidad · alerta:** «La calidad sigue en zona de alerta. El folleto espera; primero va el análisis».
- **Calidad · caída:** «La calidad bajó respecto de la medición anterior. Una foto no modifica el resultado».
- **Calidad · recuperación:** «La calidad mejoró respecto de la medición anterior. Clara aceptó la buena noticia sin prometer el final».
- **Salud del río · primera estación:** «Primera referencia de salud del río: Clara ya tiene un mapa para la próxima comparación».
- **Salud del río · estable:** «La salud del río se mantuvo. El mapa sigue en la mesa».
- **Salud del río · alerta:** «La salud del río está en alerta. Clara dejó la foto para después».
- **Salud del río · caída:** «La salud del río retrocedió. Clara cambió el paisaje de portada por el mapa».
- **Salud del río · mejora:** «La salud del río mejoró. Clara celebró y guardó el mapa para la próxima estación».
- **Reserva · recuperación:** «El embalse recuperó reserva. Berta propuso esperar antes de hacer planes con ella».
- **Reserva · uso/baja:** «El reparto recurrió al embalse. La próxima estación también va a necesitar agua».
- **Reserva · estable:** «El embalse cerró con la misma reserva. Tito pidió que no lo contaran dos veces».
- **Retornos:** «Parte del agua usada volvió al río. Clara siguió el recorrido en el mapa».
- **Deshielo:** «La reserva de nieve aportó deshielo al río esta estación».
- **Lluvia con infiltración:** «Una parte de la lluvia se infiltró en el suelo».
- **Lluvia sin infiltración registrada:** «Llovió; el balance no registró infiltración al suelo».
- **Acuífero bombeado:** «Se bombeó agua del acuífero para abastecer el reparto».
- **Acuífero sin bombeo ni extracción de evento:** «El acuífero no registró extracciones esta estación».
- **Pedido completo pero menor que la necesidad:** «Se entregó todo lo asignado. La necesidad del sector era mayor».
- **Sector sin asignación:** «[Sector] quedó fuera del reparto esta estación».

Las variantes de una misma banda comparten el hecho, pero alternan el remate y el personaje para que veinte turnos no repitan el mismo chiste. Ninguna frase debe decir «suficiente» si la tasa es menor a 100%.

## Cambios de selector que deberá evaluar el coordinador después de la aprobación

- Añadir pools para `V-*-07..09` a la banda `partial` sin condición `improved`; hoy esa ruta cae al respaldo aburrido.
- Elegir variantes de `H-*` para banda parcial según la cobertura actual; la comparación previa sólo habilita el matiz de mejora, no la existencia de una nota.
- Separar los temas `waterQuality` en inicial/estable/alerta/caída/recuperación; separar `basinHealth` en inicial/estable/alerta/caída/recuperación. Evitar que un estado estable se convierta en una frase de caída sólo por comparar por error.
- En `tradeoff`, no escribir que el sector beneficiado quedó cubierto si su satisfacción es menor a 1. El titular debe describir el descenso real de reservas y la bajada la cobertura que efectivamente tuvo.
- Mantener a `A-MAP-08` condicionado al evento real del carpincho, y no ampliar la presencia de fauna a otros contextos.
- Quitar o reemplazar los respaldos con «Quedó una parte de la necesidad por cubrir», el rótulo desnudo «Calidad del agua» y la lección repetida sobre caudal/calidad. En resumen, conservar el estilo actual, como pidió el usuario.

## Conteo de propuestas en este documento

- **Heraldo:** 115 parejas sectoriales (23 por sector: 4 completas, 6 parciales altas sin exigir comparación, 4 con faltante relevante, 4 graves y 5 de mejora con faltante); 56 generales/ambientales; 28 bajadas específicas para opciones de sucesos. **199 combinaciones de titular y bajada** pendientes de aprobación. Para cobertura parcial, los textos describen el estado actual; sólo los marcados como mejora necesitan historial.
- **Ver el valle:** 80 carteles V (30 reemplazos y 50 variantes nuevas: por sector, 3 completas, 3 parciales altas desde el primer turno, 3 de faltante relevante, 3 graves y 3 de mejora relativa; además, se conserva una pieza parcial alta condicionada a mejora). 10 cambios entre las 16 escenas A-MAP, con 6 recomendadas para mantener. **90 cambios y agregados propuestos**, pendientes de aprobación. A-MAP-03 conserva exactamente la corrección solicitada: «lo ponga por escrito».
- **Resumen:** sin cambios.
- **Implementación:** ninguna.
