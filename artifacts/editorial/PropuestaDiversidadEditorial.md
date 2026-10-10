# Propuesta de diversidad editorial · Cuenca Viva

**Estado: propuesta para revisar.** No se cambia el banco aprobado, el código ni la simulación. Este banco se organiza por el estado que activa la pieza y la familia de humor, para que los selectores actuales puedan mantener cada texto en el sector y condición correctos. Las etiquetas de familia son metadatos editoriales, no texto visible.

## Alcance e integración

La meta de cobertura es 20 opciones por banda y sector para Heraldo y para Ver el valle: 400 piezas de cada producto. Se conserva el contrato de selección actual (`sector`, banda, historial de mejora, `turn`, `seed`); la propuesta requiere ampliar los pools elegibles, no alterar umbrales ni resultados. El número de IDs, por sí solo, no garantiza variedad: importan las piezas compatibles, sus familias semánticas y el ledger. La misma semilla y estado deben seguir siendo reproducibles; semillas distintas pueden elegir la misma pieza. Heraldo conserva parejas inseparables de titular y bajada. Ver el valle conserva un cartel breve.

Los rangos son los actuales: Ciudad, Cultivos, Granja y Mina: completa = 100%; casi completa = 80%–<100%; insuficiente = 50%–<80%; grave = <50%. Río Vivo: completa = 100% de su referencia ecológica; casi completa = 75%–<100%; insuficiente = 55%–<75%; grave = <55%. La categoría “mejora relativa” sigue separada y sólo se habilita con historial; nunca reemplaza el estado actual.

Embalse (sube, baja, estable) y calidad del agua (primera medición, mejora, estable, caída, alerta) son temas generales del Heraldo. El selector actual no tiene condiciones equivalentes en Ver el valle; no les asigno carteles de mapa sin una decisión posterior de producto. Calidad, salud del río y caudal ecológico se mantienen como hechos distintos. Ninguna bajada atribuye al agua efectos productivos, sanitarios o ecológicos que el motor no haya registrado.

`ND-H-[sector]-[banda]-NN` y `ND-V-[sector]-[banda]-NN` son IDs de revisión. Deben mapearse a IDs aprobados nuevos sólo después de revisar cada pieza. `ND-GEN-[tema]-NN` identifica noticias generales. Los nombres de familia permiten detectar remates semánticamente parecidos aunque cambie la redacción.

## Heraldo · cobertura completa

### Ciudad

- `ND-H-CIU-C-01` · **Tema de reemplazo:** Ciudad cubrió toda su necesidad y Tito se quedó sin parte meteorológico — Sofía le recordó que el pronóstico no figuraba entre los reclamos pendientes.
- `ND-H-CIU-C-02` · **Orden del día:** El reparto completo dejó a Tito sin punto uno — En el acta escribió «agua» y tuvo que empezar de nuevo.
- `ND-H-CIU-C-03` · **Cierre administrativo:** Ciudad terminó sin faltantes; Sofía archivó el expediente — Tito pidió saber dónde se archivan las felicitaciones.
- `ND-H-CIU-C-04` · **Ronda de preguntas:** La cobertura de Ciudad llegó al total y el barrio agotó las preguntas — La última fue si también había que agradecer por escrito.
- `ND-H-CIU-C-05` · **Cambio de rubro:** Con el agua cubierta, Tito se presentó como crítico de veredas — Sofía le pidió que no abriera otro grupo todavía.
- `ND-H-CIU-C-06` · **Votación:** Ciudad cubrió su necesidad; Tito convocó una votación para elegir el festejo — Ganó «seguir con el día» por mayoría simple.
- `ND-H-CIU-C-07` · **Reclamo sin objeto:** La cobertura completa dejó a Tito con el formulario abierto — Sofía sugirió dejarlo en blanco, una experiencia nueva para ambos.
- `ND-H-CIU-C-08` · **Agenda vacía:** Ciudad tuvo agua para cubrir toda la necesidad — Tito llenó el espacio libre del calendario con una reunión para revisar que no hubiera reunión.
- `ND-H-CIU-C-09` · **Felicitación formal:** El reparto de Ciudad cerró completo y Tito redactó una felicitación — Sofía corrigió tres veces el saludo antes de publicarlo.
- `ND-H-CIU-C-10` · **Prioridades:** Ciudad cubrió su necesidad; Tito ordenó sus asuntos por importancia — El perro quedó primero, aunque nadie se lo había pedido.
- `ND-H-CIU-C-11` · **Borrador:** La cobertura completa de Ciudad dejó sin uso el borrador del reclamo — Tito propuso guardarlo «por si la historia se repite».
- `ND-H-CIU-C-12` · **Reunión breve:** Ciudad terminó sin faltantes y el encuentro barrial duró cinco minutos — Cuatro se fueron en decidir quién cerraba la puerta.
- `ND-H-CIU-C-13` · **Vocería:** El agua alcanzó para Ciudad; Tito se ofreció a dar una declaración — Sofía le recordó que esta vez no había nada que denunciar.
- `ND-H-CIU-C-14` · **Cartelera:** Ciudad cubrió toda su necesidad y el tablón quedó sin avisos de agua — Tito pegó uno que decía «sin novedades».
- `ND-H-CIU-C-15` · **Revisión de rutina:** El reparto completo sorprendió a Tito en mitad de una lista — La dejó como estaba: por una vez, no había nada que agregar.
- `ND-H-CIU-C-16` · **Turno de palabra:** Ciudad tuvo cobertura completa; Tito pidió la palabra para agradecer — Sofía le cedió el turno antes de que lo convirtiera en reclamo.
- `ND-H-CIU-C-17` · **Archivo:** El barrio cerró la estación con la necesidad cubierta — Tito preguntó si el archivo aceptaba documentos sin quejas.
- `ND-H-CIU-C-18` · **Encuesta:** Ciudad cubrió todo lo necesario y Tito lanzó una encuesta — La pregunta era si el resultado merecía una segunda encuesta.
- `ND-H-CIU-C-19` · **Firma:** La cobertura de Ciudad llegó al total; Sofía cerró el informe — Tito pidió firmarlo también, en calidad de testigo del buen resultado.
- `ND-H-CIU-C-20` · **Nueva tarea:** Sin faltantes en Ciudad, Tito encontró tiempo para otra tarea — Sofía le dio una sola instrucción: no inventar una urgencia.

### Cultivos

- `ND-H-CUL-C-01` · **Pausa de cálculo:** Cultivos cubrió toda la necesidad y Jacinto cerró la cuenta — La volvió a abrir para comprobar que realmente podía cerrarla.
- `ND-H-CUL-C-02` · **Agenda:** El reparto completo dejó libre la agenda de Jacinto — La ocupó con una revisión del reparto completo.
- `ND-H-CUL-C-03` · **Pronóstico archivado:** Cultivos terminó sin faltantes; Jacinto guardó el pronóstico — Lo dejó a mano por si el cielo pedía una segunda opinión.
- `ND-H-CUL-C-04` · **Renglón final:** La cobertura de Cultivos llegó al total — Jacinto buscó un renglón para anotar «alcanzó» y no encontró ninguno sin usar.
- `ND-H-CUL-C-05` · **Consulta:** Cultivos tuvo cubierto lo necesario y Jacinto llamó a Marisa — Era para confirmar que la nota podía ser corta.
- `ND-H-CUL-C-06` · **Cuenta cerrada:** Jacinto cerró la libreta: Cultivos recibió lo que necesitaba — La dejó sobre la mesa, lejos de la calculadora.
- `ND-H-CUL-C-07` · **Titular optimista:** El reparto completo de Cultivos le permitió a Jacinto aceptar un título alegre — Igual pidió leer la bajada antes de sonreír.
- `ND-H-CUL-C-08` · **Descanso técnico:** Sin faltantes, Jacinto declaró terminada la consulta sobre agua — Duró hasta que alguien dijo «una última cuenta».
- `ND-H-CUL-C-09` · **Pronóstico sin tarea:** La necesidad de Cultivos quedó cubierta; Jacinto miró el pronóstico — Esta vez sólo para saber si tenía que guardar el celular.
- `ND-H-CUL-C-10` · **Comparación innecesaria:** El reparto alcanzó para Cultivos — Jacinto comparó el resultado con su cálculo y luego comparó su cálculo con el cálculo anterior.
- `ND-H-CUL-C-11` · **Anotación:** Cultivos terminó sin faltantes; Jacinto anotó «sin faltantes» — Marisa le preguntó si no era repetir el título. «Es respaldo», dijo.
- `ND-H-CUL-C-12` · **Mate frío:** La cobertura completa encontró a Jacinto haciendo cuentas — Berta le acercó un mate; él lo aceptó después de terminar la suma.
- `ND-H-CUL-C-13` · **Cosecha de papeles:** Jacinto guardó la planilla del reparto completo — El pronóstico quedó afuera de la carpeta, pero no de su bolsillo.
- `ND-H-CUL-C-14` · **Revisión de unidad:** Cultivos recibió toda su necesidad — Jacinto comprobó la unidad de medida. «El agua está bien; yo reviso por costumbre».
- `ND-H-CUL-C-15` · **Fin de consulta:** La cobertura completa cerró el tema de agua en Cultivos — Jacinto abrió otro archivo para no dejar la computadora sin actividad.
- `ND-H-CUL-C-16` · **Firma:** Jacinto firmó el resultado completo — Marisa guardó el audio: no todos los días firma sin agregar una nota al margen.
- `ND-H-CUL-C-17` · **Lista sin pendientes:** El reparto cubrió la necesidad de Cultivos — Jacinto tachó el único pendiente de agua y dejó intacto el resto de la lista.
- `ND-H-CUL-C-18` · **Márgenes:** Cultivos cerró sin faltantes; Jacinto revisó la planilla — La cuenta daba bien incluso en el margen donde suele escribir «revisar».
- `ND-H-CUL-C-19` · **Consulta meteorológica:** Jacinto recibió cobertura completa para Cultivos — Preguntó por el tiempo igual; la costumbre no figura en el balance.
- `ND-H-CUL-C-20` · **Cierre de edición:** Cultivos cubrió lo que necesitaba — Jacinto aprobó una bajada sin agregar una nota técnica al final.

### Granja

- `ND-H-GRA-C-01` · **Mate caliente:** Granja cubrió toda su necesidad y Berta recuperó el mate — Alcanzó a tomarlo caliente antes de que apareciera la primera consulta.
- `ND-H-GRA-C-02` · **Horario de visita:** Con la cobertura completa, Berta declaró abierta la mañana — Marisa preguntó si podía volver en diez minutos. «No dije eso», aclaró Berta.
- `ND-H-GRA-C-03` · **Parte de tranquilidad:** Granja terminó sin faltantes; Berta dio el parte — Fue tan breve que Marisa tuvo que preguntar si ya había terminado.
- `ND-H-GRA-C-04` · **Silla libre:** El reparto completo dejó a Berta sentada — Cuando le ofrecieron ayuda, señaló la silla vacía: «Eso estoy haciendo».
- `ND-H-GRA-C-05` · **Pausa:** Berta tuvo un rato libre después de cubrirse la necesidad de Granja — Lo anotó en la agenda para que nadie se lo ocupara.
- `ND-H-GRA-C-06` · **Pregunta preventiva:** Granja recibió toda el agua necesaria — Berta pidió que la próxima pregunta fuera después del mate.
- `ND-H-GRA-C-07` · **Respuesta corta:** La cobertura completa sorprendió a Marisa sin una repregunta — Berta aprovechó para terminar la frase antes de que llegara otra.
- `ND-H-GRA-C-08` · **Reloj:** Granja cerró sin faltantes y Berta miró la hora — El reloj también parecía sorprendido de verla sentada.
- `ND-H-GRA-C-09` · **Agenda protegida:** Berta bloqueó un espacio para descansar tras el reparto completo — Marisa quiso agendar una entrevista; recibió el horario del mate.
- `ND-H-GRA-C-10` · **Parte diario:** La necesidad de Granja quedó cubierta — Berta entregó el parte sin agregar «y además» al final.
- `ND-H-GRA-C-11` · **Taza:** Berta pudo dejar la taza en la mesa, no en la mano — «Eso cuenta como novedad», dijo Marisa, que seguía tomando notas.
- `ND-H-GRA-C-12` · **Silencio de trabajo:** Granja terminó con cobertura completa — Berta escuchó el silencio y decidió no interrumpirlo con una reunión.
- `ND-H-GRA-C-13` · **Visita puntual:** Marisa llegó cuando Berta había terminado de ordenar — Por primera vez, no recibió una lista de cosas para mirar.
- `ND-H-GRA-C-14` · **Silla ocupada:** Berta se sentó después de que Granja cubriera su necesidad — La silla quedó ocupada el tiempo suficiente para ser noticia.
- `ND-H-GRA-C-15` · **Pregunta sin apuro:** El reparto completo permitió una entrevista sin urgencias — Berta respondió sin mirar hacia la puerta.
- `ND-H-GRA-C-16` · **Turno de descanso:** Berta marcó su turno para descansar — Nadie pidió cambiarlo; Marisa anotó el hecho con cuidado.
- `ND-H-GRA-C-17` · **Agenda del mate:** Granja cerró sin faltantes y Berta ordenó sus prioridades — El mate quedó primero, por decisión técnica de la entrevistada.
- `ND-H-GRA-C-18` · **Aviso de disponibilidad:** Berta informó que podía atender consultas — «Mañana», precisó, y guardó la libreta.
- `ND-H-GRA-C-19` · **Edición breve:** La cobertura completa dejó una noticia corta sobre Granja — Berta pidió que no le agregaran una urgencia para rellenar.
- `ND-H-GRA-C-20` · **Rato propio:** Berta recuperó un rato propio con la necesidad de Granja cubierta — Marisa preguntó cuánto duraba. «Lo que dure», respondió.

### Mina

- `ND-H-MIN-C-01` · **Informe cerrado:** Mina cubrió toda su necesidad; Rosa cerró el informe — Ferrada preguntó si podía abrirlo para celebrar. Rosa le dio otro papel.
- `ND-H-MIN-C-02` · **Vocabulario:** La cobertura completa dejó a Ferrada sin el término «faltante» — Rosa comprobó que no lo usara por reflejo.
- `ND-H-MIN-C-03` · **Declaración:** Mina recibió lo que necesitaba y Ferrada preparó una declaración — Rosa le recordó que no hacía falta explicar por qué estaba conforme.
- `ND-H-MIN-C-04` · **Carpeta equivocada:** Ferrada llevó la carpeta de reclamos a una nota sin faltantes — Rosa se la cambió por la de resultados.
- `ND-H-MIN-C-05` · **Firma legible:** El reparto de Mina cerró completo — Ferrada firmó el informe sin agregar una condición al pie.
- `ND-H-MIN-C-06` · **Revisión final:** Rosa confirmó que Mina cubrió toda su necesidad — Ferrada revisó la confirmación para confirmar que no faltaba nada.
- `ND-H-MIN-C-07` · **Pausa de Rosa:** La cobertura completa dejó el informe sin pendientes — Rosa aprovechó para terminar su café antes de la próxima revisión.
- `ND-H-MIN-C-08` · **Discurso archivado:** Ferrada guardó el reclamo preparado para Mina — Rosa le señaló que podía reutilizar el papel del reverso.
- `ND-H-MIN-C-09` · **Informe sin tachaduras:** Mina cerró sin faltantes y Rosa entregó la versión limpia — Ferrada buscó una corrección; sólo encontró su firma.
- `ND-H-MIN-C-10` · **Orden de carpetas:** El reparto completo dejó a Ferrada ordenando archivos — Rosa clasificó el informe de reclamos en «no corresponde hoy».
- `ND-H-MIN-C-11` · **Breve institucional:** Mina cubrió toda su necesidad — Ferrada quiso añadir contexto; Rosa dejó el titular hacer su trabajo.
- `ND-H-MIN-C-12` · **Reunión sin objeciones:** El resultado completo de Mina llegó a la reunión — Ferrada levantó la mano para decir que no tenía objeciones.
- `ND-H-MIN-C-13` · **Resumen ejecutivo:** Rosa resumió el reparto de Mina en una línea — Ferrada buscó la segunda página y no la encontró.
- `ND-H-MIN-C-14` · **Papel sobrante:** Mina terminó sin faltantes; Rosa apartó las hojas del reclamo — Ferrada preguntó si podía usarlas para una lista de compras.
- `ND-H-MIN-C-15` · **Acta:** El agua alcanzó para cubrir la necesidad de Mina — Rosa cerró el acta antes de que Ferrada propusiera otro párrafo.
- `ND-H-MIN-C-16` · **Corrección ausente:** La cobertura completa dejó el borrador de Ferrada sin correcciones — Rosa revisó dos veces por si se le había pasado una.
- `ND-H-MIN-C-17` · **Declaración breve:** Ferrada informó que el reparto fue completo — Rosa consiguió que la frase tuviera sujeto, verbo y punto final.
- `ND-H-MIN-C-18` · **Archivo de emergencias:** Mina no tuvo faltantes esta estación — Rosa movió el borrador de reclamo a la carpeta de «por si acaso».
- `ND-H-MIN-C-19` · **Ronda de revisión:** Ferrada recorrió el informe completo — Rosa confirmó que esta vez no necesitaba añadir una aclaración.
- `ND-H-MIN-C-20` · **Párrafo final:** La necesidad de Mina quedó cubierta — Ferrada dejó el último párrafo en blanco; Rosa lo consideró una mejora de edición.

### Río Vivo

- `ND-H-RIO-C-01` · **Referencia completa:** El caudal ecológico alcanzó toda la referencia de Río Vivo — Clara dejó que Marisa escribiera «completo» sin agregar un asterisco.
- `ND-H-RIO-C-02` · **Escucha:** Río Vivo llegó a su referencia ecológica — Clara terminó la explicación y se quedó un momento escuchando el río.
- `ND-H-RIO-C-03` · **Nota de precisión:** El caudal cubrió la referencia ecológica — Clara aprobó la frase después de comprobar que no hablara de calidad.
- `ND-H-RIO-C-04` · **Portada:** Río Vivo alcanzó la referencia; Clara aceptó ir en portada — Marisa preguntó si podía usar el mismo titular en el suplemento. «No exageremos», dijo Clara.
- `ND-H-RIO-C-05` · **Ronda cerrada:** La referencia de caudal ecológico quedó cubierta — Clara cerró la ronda de observaciones sin abrir otra sobre adjetivos.
- `ND-H-RIO-C-06` · **Epígrafe:** Río Vivo llegó a la referencia completa — Clara aprobó el epígrafe a la primera y Marisa pidió que constara en actas.
- `ND-H-RIO-C-07` · **Punto final:** El caudal cubrió toda la referencia ecológica — Clara puso punto final; Marisa no le agregó «por ahora».
- `ND-H-RIO-C-08` · **Comparación:** Río Vivo alcanzó su referencia de caudal — Clara archivó la comparación de esta estación sin llamarla recuperación.
- `ND-H-RIO-C-09` · **Titular sobrio:** El caudal ecológico cubrió la referencia — Clara eligió un titular sobrio. El dato ya tenía suficiente trabajo.
- `ND-H-RIO-C-10` · **Mesa de edición:** Río Vivo llegó a la referencia completa — Clara retiró de la mesa tres borradores que decían «casi».
- `ND-H-RIO-C-11` · **Informe:** El caudal ecológico cubrió toda su referencia — Clara firmó el informe sin convertirlo en una promesa para la estación siguiente.
- `ND-H-RIO-C-12` · **Interrupción:** Clara recibió una noticia poco habitual: la referencia estaba cubierta — Marisa esperó a que terminara de revisar si había una segunda noticia escondida.
- `ND-H-RIO-C-13` · **Vocabulario:** Río Vivo alcanzó su referencia — Clara permitió la palabra «llegó»; «se salvó» quedó fuera del borrador.
- `ND-H-RIO-C-14` · **Lectura:** El caudal ecológico cubrió la referencia — Clara leyó la nota completa y no encontró que alguien hubiera mezclado caudal con calidad.
- `ND-H-RIO-C-15` · **Agenda ecológica:** La referencia de Río Vivo quedó cubierta — Clara dejó libre el espacio de corrección y Marisa lo llenó con la próxima fecha de revisión.
- `ND-H-RIO-C-16` · **Corrección innecesaria:** Marisa entregó el titular de Río Vivo — Clara lo leyó y, por una vez, la reunión terminó antes de la corrección.
- `ND-H-RIO-C-17` · **Cierre:** El caudal ecológico llegó a la referencia — Clara cerró la carpeta de esta medición; no la carpeta del río.
- `ND-H-RIO-C-18` · **Frase completa:** Río Vivo cubrió la referencia ecológica — Clara dejó la frase entera, sin recortarla para que pareciera más optimista.
- `ND-H-RIO-C-19` · **Buena edición:** El caudal alcanzó la referencia — Clara aprobó el titular y Marisa no tuvo que negociar el adjetivo «suficiente».
- `ND-H-RIO-C-20` · **Fin de reunión:** Río Vivo cubrió la referencia ecológica — Clara dio por terminada la reunión; Marisa preguntó si eso también se podía publicar.

## Heraldo · cobertura casi completa

Las piezas describen cobertura alta actual; no afirman una mejora si no existe comparación anterior.

### Ciudad

- `ND-H-CIU-P-01` · **Asterisco:** Ciudad cubrió casi toda la necesidad; el asterisco quedó en el titular — Sofía pidió que no lo imprimieran tan chico como el faltante.
- `ND-H-CIU-P-02` · **Firma pendiente:** El reparto de Ciudad quedó cerca del total — Tito preparó una felicitación y Sofía agregó una línea para lo que falta.
- `ND-H-CIU-P-03` · **Cierre prematuro:** A Ciudad le faltó poco; Tito quiso cerrar el expediente — Sofía dejó el casillero de «pendiente» sin tachar.
- `ND-H-CIU-P-04` · **Palabra exacta:** Ciudad recibió casi todo lo que necesita — Tito propuso «listo»; Sofía le ofreció elegir entre «casi» y «todavía falta».
- `ND-H-CIU-P-05` · **Titular corto:** El reparto dejó a Ciudad cerca de cubrir la necesidad — La bajada tuvo que explicar por qué «cerca» no era «completo».
- `ND-H-CIU-P-06` · **Reclamo dosificado:** A Ciudad le faltó una parte pequeña — Tito pidió archivar el reclamo; Sofía le asignó una carpeta más fina.
- `ND-H-CIU-P-07` · **Balance de festejo:** Ciudad quedó a poco de cubrir todo — Tito encargó una torta chica; Sofía preguntó si el agua también venía en porciones.
- `ND-H-CIU-P-08` · **Sello:** La cobertura de Ciudad quedó alta, pero incompleta — Tito buscó el sello de «resuelto» y Sofía le alcanzó el de «revisar».
- `ND-H-CIU-P-09` · **Encuesta de redacción:** Ciudad quedó cerca del total — Tito sometió «casi» a votación; Sofía cerró la encuesta antes de que ganara «todo».
- `ND-H-CIU-P-10` · **Cuenta regresiva:** A Ciudad le faltó poco para cubrir la demanda — Tito empezó una cuenta regresiva; Sofía preguntó desde qué número, sin anunciar el final.
- `ND-H-CIU-P-11` · **Sobre abierto:** El reparto de Ciudad cubrió casi todo — Sofía dejó abierto el sobre del reclamo; Tito preguntó si eso contaba como respuesta.
- `ND-H-CIU-P-12` · **Renglón final:** Ciudad quedó cerca de cubrir lo necesario — Tito escribió «fin» al pie; Sofía le mostró el renglón que aún faltaba.
- `ND-H-CIU-P-13` · **Optimismo editorial:** Casi toda la necesidad de Ciudad quedó cubierta — Tito pidió un titular alegre; Sofía pidió que la alegría no borrara el resto.
- `ND-H-CIU-P-14` · **Campanilla:** La cobertura de Ciudad estuvo cerca del total — Tito quiso tocar la campanilla de cierre; Sofía la dejó para cuando no quede faltante.
- `ND-H-CIU-P-15` · **Revisión de escala:** A Ciudad le faltó poco — Tito dibujó una barra casi llena; Sofía pidió que la parte vacía también tuviera tinta.
- `ND-H-CIU-P-16` · **Pausa del reclamo:** Ciudad quedó casi cubierta — Tito dio el reclamo por terminado hasta la próxima estación; Sofía le recordó que la actual todavía no cerró.
- `ND-H-CIU-P-17` · **Ventanilla:** El reparto de Ciudad quedó muy cerca del total — Tito atendió por ventanilla de festejos; Sofía mantuvo abierta la de pendientes.
- `ND-H-CIU-P-18` · **Titular de dos renglones:** A Ciudad le faltó poco, pero le faltó — Sofía pidió conservar las dos partes; Tito dejó de buscar una versión más corta.
- `ND-H-CIU-P-19` · **Papel picado:** Ciudad casi cubrió su necesidad — Tito llevó papel picado; Sofía guardó la escoba para cuando llegue lo que falta.
- `ND-H-CIU-P-20` · **Acta provisional:** La cobertura de Ciudad quedó alta y aún incompleta — Tito escribió «aprobado»; Sofía añadió «con observación».

### Cultivos

- `ND-H-CUL-P-01` · **Margen:** Cultivos quedó cerca de cubrir la necesidad — Jacinto calculó el margen restante antes de aceptar el titular.
- `ND-H-CUL-P-02` · **Tapa de la libreta:** El reparto de Cultivos cubrió casi todo — Jacinto dejó la libreta abierta justo en la cuenta que falta.
- `ND-H-CUL-P-03` · **Brindis reservado:** A Cultivos le faltó poco — Jacinto dejó la botella sin descorchar y anotó la razón en la etiqueta.
- `ND-H-CUL-P-04` · **Pronóstico al margen:** La cobertura de Cultivos quedó alta, aunque incompleta — Jacinto consultó el pronóstico; Marisa le señaló que el titular era sobre el reparto.
- `ND-H-CUL-P-05` · **Término de la cuenta:** Cultivos quedó cerca del total — Jacinto aceptó «casi» después de calcular cuánto significaba «cerca».
- `ND-H-CUL-P-06` · **Renglón abierto:** A Cultivos le faltó una parte menor de su necesidad — Jacinto reservó un renglón para esa parte y otro para verificar el cálculo.
- `ND-H-CUL-P-07` · **Calculadora:** La necesidad de Cultivos quedó casi cubierta — Jacinto apagó la calculadora; la volvió a encender para asegurarse de que estaba apagada.
- `ND-H-CUL-P-08` · **Agenda de riego:** Cultivos recibió casi todo lo necesario — Jacinto mantuvo la próxima revisión en agenda, sin llamarla festejo.
- `ND-H-CUL-P-09` · **Punto y coma:** El reparto de Cultivos fue alto, no completo — Marisa puso punto y coma; Jacinto comprobó que no pareciera un signo de igualdad.
- `ND-H-CUL-P-10` · **Recibo:** A Cultivos le faltó poco para cubrir todo — Jacinto pidió un recibo por lo entregado y dejó aparte la cuenta pendiente.
- `ND-H-CUL-P-11` · **Cálculo a lápiz:** Cultivos quedó cerca del total — Jacinto hizo la cuenta a lápiz, por si la palabra «casi» necesitaba corregirse.
- `ND-H-CUL-P-12` · **Nota al pie:** La cobertura alta dejó un faltante en Cultivos — Jacinto pidió que no lo mandaran a una nota al pie.
- `ND-H-CUL-P-13` · **Etiqueta:** El reparto dejó a Cultivos cerca de cubrir su necesidad — Jacinto pegó «casi» en la libreta y guardó «listo».
- `ND-H-CUL-P-14` · **Revisión del total:** A Cultivos le faltó poco — Jacinto verificó el total sin redondearlo para que entrara en el festejo.
- `ND-H-CUL-P-15` · **Calendario:** Cultivos quedó cerca de la cobertura completa — Jacinto movió la revisión al calendario, no al archivo de asuntos cerrados.
- `ND-H-CUL-P-16` · **Corrección de cuenta:** La cobertura de Cultivos fue alta, pero no total — Jacinto corrigió la suma; Marisa corrigió el entusiasmo del título.
- `ND-H-CUL-P-17` · **Renglones paralelos:** Casi toda la necesidad de Cultivos quedó cubierta — Jacinto abrió dos columnas: «lo que llegó» y «lo que todavía falta».
- `ND-H-CUL-P-18` · **Pronóstico archivado:** A Cultivos le faltó poco — Jacinto guardó el pronóstico y dejó a mano la cuenta del reparto.
- `ND-H-CUL-P-19` · **Revisión breve:** El reparto quedó cerca de cubrir Cultivos — Jacinto aceptó una nota corta con una condición: que no recortaran el faltante.
- `ND-H-CUL-P-20` · **Cierre pendiente:** Cultivos casi cubrió la necesidad — Jacinto cerró la planilla, no la cuenta.

### Granja

- `ND-H-GRA-P-01` · **Mate en pausa:** A Granja le faltó poco para cubrir todo — Berta dejó el mate a mano y la lista a la vista.
- `ND-H-GRA-P-02` · **Horario de cierre:** La necesidad de Granja quedó casi cubierta — Berta aceptó el titular; no el horario de cierre que le propuso Marisa.
- `ND-H-GRA-P-03` · **Lista corta:** Granja quedó cerca de cubrir lo necesario — Berta redujo la lista de pendientes, no la tachó.
- `ND-H-GRA-P-04` · **Visita sin festejo:** El reparto de Granja fue casi completo — Berta recibió a Marisa con una frase preparada: «Casi también lleva trabajo».
- `ND-H-GRA-P-05` · **Pausa con condición:** A Granja le faltó una parte pequeña — Berta aceptó sentarse; dejó la libreta sobre las rodillas.
- `ND-H-GRA-P-06` · **Reloj de cocina:** La cobertura de Granja quedó cerca del total — Berta miró el reloj y decidió que el mate podía esperar al próximo titular.
- `ND-H-GRA-P-07` · **Ronda pendiente:** Granja casi cubrió su necesidad — Berta terminó la ronda de consultas, pero dejó pendiente la pregunta por lo que faltó.
- `ND-H-GRA-P-08` · **Taza a medio tomar:** A Granja le faltó poco — Berta alcanzó a tomar medio mate antes de que Marisa le pidiera una aclaración.
- `ND-H-GRA-P-09` · **Cartel de turno:** El reparto dejó a Granja cerca de cubrir todo — Berta colgó el cartel «casi» en la puerta para ahorrar explicaciones.
- `ND-H-GRA-P-10` · **Pausa anotada:** La cobertura fue alta, aunque incompleta — Berta anotó el faltante antes de anotar el descanso.
- `ND-H-GRA-P-11` · **Mesa despejada:** Granja quedó cerca del total — Berta despejó la mesa para el mate; la libreta de pendientes sobrevivió a la limpieza.
- `ND-H-GRA-P-12` · **Respuesta prevista:** A Granja le faltó poco para cubrir la necesidad — Berta ya tenía preparada la respuesta a «¿entonces está todo?».
- `ND-H-GRA-P-13` · **Silla reservada:** El reparto de Granja quedó casi completo — Berta reservó una silla para descansar y otra para la lista que sigue abierta.
- `ND-H-GRA-P-14` · **Visita medida:** La cobertura de Granja estuvo cerca del total — Berta permitió una visita breve; Marisa anotó «breve» con hora de inicio.
- `ND-H-GRA-P-15` · **Termo:** Granja recibió casi todo lo que necesitaba — Berta llenó el termo y dejó la discusión del faltante para la reunión.
- `ND-H-GRA-P-16` · **Pausa interrumpida:** A Granja le faltó una parte menor — Berta empezó el descanso por el principio; la entrevista volvió a interrumpirlo.
- `ND-H-GRA-P-17` · **Agenda doble:** Granja quedó cerca de cubrir todo — Berta anotó «casi completo» en la agenda de hoy y «revisar faltante» en la de mañana.
- `ND-H-GRA-P-18` · **Etiqueta de la taza:** El reparto de Granja fue alto, no completo — Berta le puso una etiqueta al mate para que Marisa no lo confundiera con el cierre.
- `ND-H-GRA-P-19` · **Visita con motivo:** A Granja le faltó poco — Berta aceptó la visita porque Marisa vino a preguntar también por lo que faltaba.
- `ND-H-GRA-P-20` · **Cierre sin cierre:** La necesidad de Granja quedó casi cubierta — Berta dio por terminada la entrevista y mantuvo abierta la lista.

### Mina

- `ND-H-MIN-P-01` · **Redondeo:** Mina quedó cerca de cubrir toda su necesidad — Rosa le prohibió a Ferrada redondear hacia arriba en el titular.
- `ND-H-MIN-P-02` · **Sello provisional:** El reparto de Mina fue casi completo — Ferrada buscó el sello final; Rosa le alcanzó el de «pendiente».
- `ND-H-MIN-P-03` · **Medida exacta:** A Mina le faltó poco — Ferrada pidió una medida exacta de «poco»; Rosa le mostró el dato, no un adjetivo.
- `ND-H-MIN-P-04` · **Borrador sobrio:** La cobertura de Mina quedó alta, pero incompleta — Rosa sacó «misión cumplida» del borrador; Ferrada dejó de discutir el espacio.
- `ND-H-MIN-P-05` · **Informe en dos partes:** Mina recibió casi todo lo que necesitaba — Rosa separó el informe entre lo cubierto y lo pendiente.
- `ND-H-MIN-P-06` · **Folio abierto:** El reparto dejó a Mina cerca del total — Ferrada cerró la carpeta; Rosa dejó visible el folio que falta.
- `ND-H-MIN-P-07` · **Adjetivo:** A Mina le faltó una parte menor — Ferrada propuso «excelente»; Rosa preguntó si el adjetivo venía con agua.
- `ND-H-MIN-P-08` · **Margen de seguridad:** Mina quedó cerca de la cobertura completa — Ferrada pidió margen de seguridad; Rosa le señaló el faltante del margen.
- `ND-H-MIN-P-09` · **Firma condicionada:** La necesidad de Mina quedó casi cubierta — Ferrada firmó después de que Rosa conservara la palabra «casi».
- `ND-H-MIN-P-10` · **Informe breve:** El reparto de Mina fue alto, no total — Rosa redujo el texto sin reducir el faltante.
- `ND-H-MIN-P-11` · **Control de cambios:** Mina quedó cerca de cubrir todo — Ferrada aceptó la versión final; Rosa guardó el control de cambios por las dudas.
- `ND-H-MIN-P-12` · **Párrafo retenido:** A Mina le faltó poco — Rosa mantuvo el párrafo del faltante aunque Ferrada ya había aprobado el título.
- `ND-H-MIN-P-13` · **Casillero:** La cobertura de Mina quedó incompleta — Ferrada marcó «casi»; Rosa le explicó que el casillero de completo seguía vacío.
- `ND-H-MIN-P-14` · **Expediente:** Mina recibió casi toda su necesidad — Ferrada pidió archivar el asunto; Rosa le mostró el expediente todavía abierto.
- `ND-H-MIN-P-15` · **Aclaración:** Mina quedó cerca del total — Ferrada pidió no agregar aclaraciones; Rosa dejó la más importante: todavía falta.
- `ND-H-MIN-P-16` · **Dos titulares:** El reparto de Mina rozó la cobertura completa — Rosa preparó un titular para lo recibido y otro para lo pendiente.
- `ND-H-MIN-P-17` · **Tamaño de letra:** A Mina le faltó poco para cubrir la necesidad — Ferrada pidió letra grande para «casi»; Rosa reservó la más grande para el faltante.
- `ND-H-MIN-P-18` · **Renglón inferior:** La cobertura de Mina quedó alta y aún incompleta — Rosa dejó el faltante en el mismo renglón, para que no pareciera letra chica.
- `ND-H-MIN-P-19` · **Cierre de carpeta:** Mina quedó cerca del total — Ferrada cerró una carpeta y Rosa abrió otra: la de asuntos pendientes.
- `ND-H-MIN-P-20` · **Titular auditado:** El reparto casi cubrió la necesidad de Mina — Rosa revisó que «casi» no hubiera desaparecido entre el borrador y la imprenta.

### Río Vivo

- `ND-H-RIO-P-01` · **Referencia cercana:** Río Vivo quedó cerca de cubrir la referencia ecológica — Clara mantuvo «cerca» y retiró cualquier promesa de llegada.
- `ND-H-RIO-P-02` · **Dato preciso:** Al caudal ecológico le faltó poco para la referencia — Clara pidió que la nota dijera cuánto falta sin confundirlo con calidad.
- `ND-H-RIO-P-03` · **Verbo prudente:** El caudal quedó próximo a la referencia ecológica — Marisa escribió «se acerca»; Clara descartó «ya llegó».
- `ND-H-RIO-P-04` · **Cierre abierto:** Río Vivo casi cubrió la referencia — Clara dejó abierta la evaluación, no la conclusión.
- `ND-H-RIO-P-05` · **Rótulo:** La brecha ecológica quedó pequeña, no cerrada — Clara cambió «fin» por «sigue» en el rótulo de seguimiento.
- `ND-H-RIO-P-06` · **Escala:** El caudal de Río Vivo quedó cerca de la referencia — Clara pidió que la escala mostrara el tramo restante con el mismo cuidado.
- `ND-H-RIO-P-07` · **Punto de llegada:** Río Vivo avanzó hasta quedar cerca de la referencia — Clara señaló el punto alcanzado y el que todavía falta.
- `ND-H-RIO-P-08` · **Titular corto:** Al caudal ecológico le faltó poco — Clara aceptó el titular breve; Marisa guardó el adjetivo «completo».
- `ND-H-RIO-P-09` · **Nota de seguimiento:** La referencia de Río Vivo quedó casi cubierta — Clara pidió otra revisión en la próxima estación, sin llamarla festejo.
- `ND-H-RIO-P-10` · **Dos columnas:** El caudal quedó cerca de la referencia ecológica — Clara dividió el pizarrón entre «alcanzado» y «pendiente».
- `ND-H-RIO-P-11` · **Lectura en voz alta:** Río Vivo casi llegó a la referencia — Clara escuchó el titular y detuvo a Marisa justo antes de «resuelto».
- `ND-H-RIO-P-12` · **Subtítulo:** La cobertura ecológica quedó alta, pero incompleta — Clara pidió que el subtítulo mantuviera ambas partes de la noticia.
- `ND-H-RIO-P-13` · **Agenda de revisión:** El caudal se acercó a la referencia — Clara reservó un espacio de revisión, no un brindis.
- `ND-H-RIO-P-14` · **Escucha parcial:** Río Vivo quedó cerca de su referencia — Clara escuchó el río y luego volvió a la cuenta del tramo pendiente.
- `ND-H-RIO-P-15` · **Epígrafe:** Al caudal le faltó poco para cubrir la referencia — Marisa redactó el epígrafe; Clara verificó que «poco» no se leyera como «nada».
- `ND-H-RIO-P-16` · **Estado:** Río Vivo quedó en cobertura ecológica parcial alta — Clara pidió conservar «parcial» aunque el resto del título sonara mejor.
- `ND-H-RIO-P-17` · **Mesa de edición:** La referencia quedó cerca de cumplirse — Clara dejó la mesa de edición y el trabajo pendientes.
- `ND-H-RIO-P-18` · **Vocabulario:** El caudal ecológico se acercó a la referencia sin alcanzarla — Clara aprobó «cerca» y rechazó «suficiente».
- `ND-H-RIO-P-19` · **Seguimiento:** Río Vivo quedó cerca del total ecológico — Marisa anotó el faltante como seguimiento, no como nota cerrada.
- `ND-H-RIO-P-20` · **Revisión de título:** El caudal quedó cerca, todavía bajo la referencia — Clara aceptó el título al comprobar que no confundía cercanía con cumplimiento.

## Heraldo · cobertura insuficiente

Estas piezas reflejan una brecha relevante: no la llaman pequeña ni la confunden con la banda grave.

### Ciudad

- `ND-H-CIU-I-01` · **Turnos:** Ciudad mantiene una parte importante de su necesidad pendiente — Tito propuso ordenar los reclamos por turno; Sofía le preguntó quién iba primero.
- `ND-H-CIU-I-02` · **Planilla de seguimiento:** El reparto de Ciudad quedó por debajo de lo necesario — Sofía abrió una planilla nueva; Tito ya tenía una pestaña para comentarios.
- `ND-H-CIU-I-03` · **Ventanilla:** A Ciudad le faltó una parte considerable del agua — Tito abrió la ventanilla de consultas; Sofía atendió primero la pregunta que nadie había hecho.
- `ND-H-CIU-I-04` · **Prioridad:** La necesidad de Ciudad quedó parcialmente sin cubrir — Tito priorizó los reclamos por longitud; Sofía le pidió priorizarlos por tema.
- `ND-H-CIU-I-05` · **Calendario:** Ciudad conserva un faltante relevante — Tito lo agendó para mañana. Sofía le recordó que el faltante era de hoy.
- `ND-H-CIU-I-06` · **Buzón:** El reparto no alcanzó a cubrir una parte importante de Ciudad — Tito puso un buzón de reclamos; Sofía le señaló que ya estaba lleno antes de inaugurarlo.
- `ND-H-CIU-I-07` · **Formulario:** Ciudad quedó con necesidades pendientes — Tito completó el formulario de seguimiento y olvidó el casillero que preguntaba por el agua.
- `ND-H-CIU-I-08` · **Acta vecinal:** El faltante de Ciudad ocupó buena parte de la reunión — Tito pidió un acta breve; Sofía le entregó una hoja por cada tema.
- `ND-H-CIU-I-09` · **Timbre:** La cobertura de Ciudad dejó una brecha importante — Tito instaló un timbre para reclamos; Sofía le sugirió atenderlo él.
- `ND-H-CIU-I-10` · **Turno de exposición:** A Ciudad le faltó una parte importante de su necesidad — Tito se anotó para explicar el problema; el problema ya estaba explicado.
- `ND-H-CIU-I-11` · **Carpeta compartida:** El reparto dejó necesidades pendientes en Ciudad — Tito creó una carpeta compartida y Sofía encontró tres versiones del mismo reclamo.
- `ND-H-CIU-I-12` · **Resumen:** Ciudad no cubrió toda su necesidad — Tito ofreció resumirlo; Sofía pidió que el resumen incluyera lo que todavía falta.
- `ND-H-CIU-I-13` · **Pizarra:** La brecha de Ciudad sigue siendo relevante — Tito escribió «resolver» en la pizarra; Sofía agregó «agua» para aclarar el objeto.
- `ND-H-CIU-I-14` · **Lista de espera:** A Ciudad le faltó una parte considerable — Tito armó una lista de espera. Sofía preguntó quién podía esperar por agua.
- `ND-H-CIU-I-15` · **Punto de agenda:** El reparto dejó una parte importante de Ciudad pendiente — Tito propuso cerrar el punto; Sofía lo devolvió al orden del día.
- `ND-H-CIU-I-16` · **Sillas:** Ciudad sigue con necesidades de agua sin cubrir — Tito agregó sillas a la reunión; Sofía le recordó que la reunión no agregaba agua.
- `ND-H-CIU-I-17` · **Título en revisión:** El faltante relevante de Ciudad llegó a la portada — Tito pidió un título menos serio; Sofía pidió que siguiera siendo cierto.
- `ND-H-CIU-I-18` · **Copia:** Ciudad quedó lejos de cubrir toda su necesidad — Tito hizo una copia del reclamo; Sofía preguntó cuál de las dos iba a resolverlo.
- `ND-H-CIU-I-19` · **Orden del día:** La cobertura de Ciudad dejó un asunto importante abierto — Tito lo pasó al final de la agenda; Sofía lo devolvió al principio.
- `ND-H-CIU-I-20` · **Revisión de horario:** El agua asignada no cubrió toda la necesidad de Ciudad — Tito propuso reunirse más tarde; Sofía señaló que cambiar el horario no cambiaba el faltante.

### Cultivos

- `ND-H-CUL-I-01` · **Cuaderno de cuentas:** Cultivos conserva una parte importante de su necesidad pendiente — Jacinto anotó el faltante sin redondearlo; la hoja necesitó las dos caras.
- `ND-H-CUL-I-02` · **Márgenes agotados:** El reparto de Cultivos quedó por debajo de lo necesario — Jacinto terminó las cuentas en el margen y pidió otra hoja.
- `ND-H-CUL-I-03` · **Pronóstico aparte:** A Cultivos le faltó una parte considerable — Jacinto consultó el pronóstico y luego volvió a la cuenta, que era la noticia.
- `ND-H-CUL-I-04` · **Columna propia:** Cultivos quedó con una brecha relevante — Jacinto abrió una columna para lo pendiente; Marisa pidió que no la llamara «detalle».
- `ND-H-CUL-I-05` · **Cuenta extendida:** La necesidad de Cultivos superó lo asignado — Jacinto mostró la suma completa, incluida la parte que no entró.
- `ND-H-CUL-I-06` · **Hoja de cálculo:** El reparto dejó bastante por cubrir en Cultivos — Jacinto amplió la columna; el faltante no entró en la vista previa.
- `ND-H-CUL-I-07` · **Agenda de consulta:** Cultivos mantiene una parte importante sin cubrir — Jacinto pidió fecha para revisarlo; Marisa anotó que la fecha no era la solución.
- `ND-H-CUL-I-08` · **Subrayado:** A Cultivos le faltó una porción considerable de su necesidad — Jacinto subrayó la cifra; el lápiz tuvo más trabajo que la impresora.
- `ND-H-CUL-I-09` · **Pronóstico desacoplado:** La cobertura de Cultivos quedó incompleta — Jacinto dejó el pronóstico a un lado para hablar del reparto real.
- `ND-H-CUL-I-10` · **Renglón nuevo:** Cultivos terminó con un faltante relevante — Jacinto agregó otro renglón; esta vez no era para una observación.
- `ND-H-CUL-I-11` · **Suma revisada:** El agua asignada quedó corta para Cultivos — Jacinto verificó la suma y guardó la calculadora sin discutirle el resultado.
- `ND-H-CUL-I-12` · **Parte meteorológico:** La necesidad de Cultivos quedó parcialmente cubierta — Jacinto escuchó el pronóstico y le pidió que no respondiera por el reparto.
- `ND-H-CUL-I-13` · **Cuenta en limpio:** El faltante de Cultivos ocupa una parte importante del balance — Jacinto pasó la cuenta en limpio; la cantidad pendiente no se volvió menor.
- `ND-H-CUL-I-14` · **Etiqueta de carpeta:** Cultivos quedó con una brecha que no cabe en una nota al pie — Jacinto rotuló la carpeta «pendiente» y dejó el pronóstico en otra.
- `ND-H-CUL-I-15` · **Consulta de Marisa:** El reparto no cubrió una parte importante de Cultivos — Marisa preguntó si quedaba algo por agregar; Jacinto señaló la necesidad sin cubrir.
- `ND-H-CUL-I-16` · **Unidad de medida:** Cultivos terminó con un faltante considerable — Jacinto comprobó tres veces la unidad; el faltante seguía en la misma unidad.
- `ND-H-CUL-I-17` · **Calendario de riego:** Una parte importante de la necesidad de Cultivos quedó pendiente — Jacinto revisó el calendario; no lo presentó como agua recibida.
- `ND-H-CUL-I-18` · **Nota sin adorno:** Cultivos quedó lejos de cubrir toda la necesidad — Jacinto pidió que la nota no llevara adornos ni redondeos.
- `ND-H-CUL-I-19` · **Cálculo a mano:** El reparto dejó una brecha relevante en Cultivos — Jacinto hizo la cuenta a mano; Marisa le pidió una versión sin abreviaturas.
- `ND-H-CUL-I-20` · **Punto de control:** El faltante de Cultivos sigue abierto — Jacinto puso un punto de control; el punto no era un punto final.

### Granja

- `ND-H-GRA-I-01` · **Ronda:** Granja conserva una parte importante de su necesidad sin cubrir — Berta dio la ronda y volvió con la misma lista.
- `ND-H-GRA-I-02` · **Agenda de visitas:** El reparto quedó corto para Granja — Berta acomodó las visitas para poder mostrar el faltante sin apurarse.
- `ND-H-GRA-I-03` · **Mate sin pausa:** A Granja le faltó una parte considerable — Berta dejó el mate servido; la lista de pendientes no la dejó sentarse.
- `ND-H-GRA-I-04` · **Recorrido:** Granja quedó con una brecha relevante — Marisa recorrió el lugar antes de escribir; Berta no necesitó inventar una explicación.
- `ND-H-GRA-I-05` · **Orden de tareas:** La cobertura no alcanzó para toda la necesidad de Granja — Berta reordenó las tareas, no el resultado del reparto.
- `ND-H-GRA-I-06` · **Lista plastificada:** Granja mantiene un faltante importante — Berta plastificó la lista para que aguantara otra estación de consultas.
- `ND-H-GRA-I-07` · **Taza fría:** A Granja le faltó una parte importante del agua — Berta encontró el mate frío; la lista, en cambio, no se había movido.
- `ND-H-GRA-I-08` · **Explicación en sitio:** El reparto dejó una brecha visible para Granja — Berta mostró el problema en el recorrido y ahorró el discurso.
- `ND-H-GRA-I-09` · **Tiempo de visita:** Granja no cubrió toda su necesidad — Berta ofreció una visita corta; Marisa entendió por qué no podía ser más larga.
- `ND-H-GRA-I-10` · **Pendiente marcado:** El faltante de Granja sigue siendo relevante — Berta lo marcó con un círculo; Marisa dejó de preguntar qué estaba marcado.
- `ND-H-GRA-I-11` · **Lista de prioridades:** A Granja le quedó una parte importante sin cubrir — Berta puso el agua arriba de la lista, sin discusión sobre el orden.
- `ND-H-GRA-I-12` · **Visita sin guion:** El reparto quedó por debajo de lo necesario en Granja — Berta respondió sin guion; el faltante era lo bastante claro.
- `ND-H-GRA-I-13` · **Horario de mate:** Granja conserva necesidades pendientes — Berta movió el horario del mate para terminar la entrevista, no el faltante.
- `ND-H-GRA-I-14` · **Recorrido de Marisa:** Una parte considerable de Granja quedó sin cubrir — Marisa vio el recorrido; Berta le ahorró una pregunta con la lista.
- `ND-H-GRA-I-15` · **Reunión concreta:** El faltante de Granja ocupó la reunión — Berta pidió terminar con una tarea concreta, no otra reunión.
- `ND-H-GRA-I-16` · **Pizarra:** Granja quedó con una brecha importante — Berta anotó «sigue pendiente»; nadie le pidió que agregara un dibujo.
- `ND-H-GRA-I-17` · **Respuesta preparada:** El agua asignada no cubrió toda la necesidad de Granja — Berta contestó «sí, falta» antes de que Marisa terminara la pregunta.
- `ND-H-GRA-I-18` · **Lista resistente:** Granja conserva un faltante relevante — Berta cambió la hoja de la lista; el encabezado siguió diciendo «pendientes».
- `ND-H-GRA-I-19` · **Tareas pospuestas:** La cobertura de Granja quedó incompleta — Berta anotó qué tarea seguía pendiente y se negó a llamarla resuelta.
- `ND-H-GRA-I-20` · **Sin vueltas:** A Granja le faltó una parte importante de su necesidad — Berta pidió una nota directa; Marisa no tuvo que traducirla.

### Mina

- `ND-H-MIN-I-01` · **Informe conciso:** Mina conservó una brecha relevante de cobertura — Rosa redujo el informe sin borrar lo que todavía falta.
- `ND-H-MIN-I-02` · **Carpeta de pendientes:** El reparto quedó corto para la necesidad de Mina — Ferrada abrió la carpeta; Rosa ya tenía marcada la página correcta.
- `ND-H-MIN-I-03` · **Término preciso:** A Mina le faltó una parte importante — Rosa reemplazó «complicado» por «incompleto» y Ferrada no objetó.
- `ND-H-MIN-I-04` · **Reunión breve:** Mina terminó con una brecha relevante — Ferrada pidió una reunión breve; Rosa llevó una sola hoja con el faltante.
- `ND-H-MIN-I-05` · **Lista de observaciones:** La necesidad de Mina quedó parcialmente cubierta — Ferrada agregó observaciones; Rosa preguntó cuál de ellas traía agua.
- `ND-H-MIN-I-06` · **Página numerada:** El reparto de Mina dejó una parte importante sin cubrir — Rosa numeró las páginas para que el reclamo no se perdiera entre consejos.
- `ND-H-MIN-I-07` · **Resumen sin eufemismos:** Mina recibió menos de lo que necesitaba — Rosa escribió el resumen; Ferrada encontró que no tenía palabras de más.
- `ND-H-MIN-I-08` · **Casillero abierto:** Mina mantiene una brecha importante — Ferrada marcó «revisado»; Rosa dejó vacío el casillero de «cubierto».
- `ND-H-MIN-I-09` · **Aclaración de informe:** El faltante de Mina ocupa una parte relevante — Rosa añadió una aclaración; Ferrada pidió que no fuera más larga que el dato.
- `ND-H-MIN-I-10` · **Revisión de carpeta:** Mina quedó por debajo de su necesidad — Ferrada buscó un informe más alentador; Rosa le mostró el mismo balance.
- `ND-H-MIN-I-11` · **Borrador sin adjetivos:** El reparto dejó una brecha relevante en Mina — Rosa quitó «difícil»; el faltante se entendió igual.
- `ND-H-MIN-I-12` · **Índice:** Una parte importante de la necesidad de Mina quedó pendiente — Rosa agregó un índice al informe; Ferrada preguntó si también podía indexar el agua.
- `ND-H-MIN-I-13` · **Firma informada:** Mina no cubrió toda su necesidad — Ferrada firmó el informe después de leer el renglón del faltante.
- `ND-H-MIN-I-14` · **Versión corta:** El reparto dejó necesidades importantes de Mina sin cubrir — Rosa preparó una versión corta que no acortaba el faltante.
- `ND-H-MIN-I-15` · **Observación principal:** Mina quedó con un faltante relevante — Ferrada pidió poner la observación principal arriba; Rosa ya la había puesto.
- `ND-H-MIN-I-16` · **Anexo:** La cobertura de Mina quedó lejos de ser total — Ferrada solicitó un anexo; Rosa respondió que el informe principal alcanzaba para describirlo.
- `ND-H-MIN-I-17` · **Término técnico:** A Mina le faltó una parte considerable de lo necesario — Rosa evitó un eufemismo; Ferrada dejó de buscar uno.
- `ND-H-MIN-I-18` · **Papel membretado:** Mina conserva necesidades sin cubrir — Ferrada imprimió el informe en papel membretado; Rosa señaló que el membrete no era el dato.
- `ND-H-MIN-I-19` · **Lectura completa:** El balance de Mina mostró una brecha importante — Rosa leyó el informe entero; Ferrada pidió que la próxima vez empezara por el resumen.
- `ND-H-MIN-I-20` · **Casilla de seguimiento:** La necesidad de Mina quedó parcialmente cubierta — Rosa abrió seguimiento; Ferrada preguntó qué parte se podía cerrar hoy.

### Río Vivo

- `ND-H-RIO-I-01` · **Brecha ecológica:** Río Vivo quedó por debajo de su referencia por una parte importante — Clara rechazó que el título la llamara «detalle».
- `ND-H-RIO-I-02` · **Agenda del consejo:** Al caudal ecológico le falta una parte relevante para cubrir la referencia — Clara lo puso en la agenda antes que el debate por el adjetivo.
- `ND-H-RIO-I-03` · **Medición:** La referencia de Río Vivo sigue parcialmente cubierta — Clara separó el dato de caudal de cualquier conclusión sobre calidad.
- `ND-H-RIO-I-04` · **Vocabulario:** El caudal quedó lejos de cubrir toda la referencia — Clara sustituyó «casi» por «brecha importante».
- `ND-H-RIO-I-05` · **Revisión pendiente:** Río Vivo conserva una brecha ecológica relevante — Clara agendó una revisión, no una ceremonia.
- `ND-H-RIO-I-06` · **Margen:** A la referencia ecológica le falta una parte importante — Clara pidió que el margen no escondiera el dato principal.
- `ND-H-RIO-I-07` · **Sección correcta:** Río Vivo no alcanzó toda la referencia de caudal — Clara movió la nota a la sección de seguimiento, no a la de paisaje.
- `ND-H-RIO-I-08` · **Cifra sin adjetivo:** La brecha ecológica de Río Vivo sigue siendo relevante — Clara pidió informar el dato sin un adjetivo tranquilizador.
- `ND-H-RIO-I-09` · **Lectura del balance:** El caudal quedó por debajo de la referencia — Clara leyó el balance y no dejó que lo titularan como calidad.
- `ND-H-RIO-I-10` · **Punto de agenda:** Una parte considerable de la referencia quedó sin cubrir — Clara la mantuvo en agenda hasta que el acta dejó de llamarla «varios».
- `ND-H-RIO-I-11` · **Evaluación:** Río Vivo quedó con una brecha importante frente a la referencia ecológica — Clara evaluó el caudal, sin diagnosticar por él otros indicadores.
- `ND-H-RIO-I-12` · **Nota de seguimiento:** El caudal ecológico no cubrió toda la referencia — Clara escribió «seguir» en vez de «cerrado».
- `ND-H-RIO-I-13` · **Tramo de trabajo:** La brecha de Río Vivo sigue siendo considerable — Clara señaló el trabajo pendiente sin convertir el titular en una predicción.
- `ND-H-RIO-I-14` · **Acta revisada:** El caudal quedó bajo la referencia, con una brecha relevante — Clara corrigió el acta; Marisa corrigió el índice.
- `ND-H-RIO-I-15` · **Título sobrio:** Río Vivo no llegó a cubrir toda la referencia — Clara pidió que el título no llamara «normal» a un dato parcial.
- `ND-H-RIO-I-16` · **Pendiente explícito:** Una parte importante de la referencia ecológica sigue pendiente — Clara añadió «de caudal» para que nadie lo confundiera con calidad.
- `ND-H-RIO-I-17` · **Siguiente reunión:** Río Vivo mantuvo una brecha relevante — Clara pidió reservar tiempo para el tema; Marisa reservó una página también.
- `ND-H-RIO-I-18` · **Balance del tramo:** El caudal cubrió parte, no toda, la referencia ecológica — Clara mantuvo ambas partes en la misma línea.
- `ND-H-RIO-I-19` · **Sin consuelo editorial:** La referencia de Río Vivo quedó lejos de completarse — Clara prefirió el dato a un consuelo de redacción.
- `ND-H-RIO-I-20` · **Observación:** El caudal ecológico quedó por debajo de la referencia — Clara agregó una observación concreta y descartó una conclusión ajena al balance.

## Heraldo · cobertura grave

El titular identifica el faltante como grave sin declarar colapso, daños ni consecuencias no registradas.

### Ciudad

- `ND-H-CIU-G-01` · **Primera línea:** Ciudad recibió muy poca agua frente a su necesidad — Sofía puso el faltante en la primera línea; Tito no pidió bajarlo al final.
- `ND-H-CIU-G-02` · **Reunión convocada:** El faltante de Ciudad quedó en la banda grave — Tito convocó al barrio; esta vez nadie preguntó para qué.
- `ND-H-CIU-G-03` · **Lista de prioridades:** La mayor parte de la necesidad de Ciudad sigue pendiente — Sofía ordenó las prioridades; Tito pidió que el agua no quedara tercera.
- `ND-H-CIU-G-04` · **Título directo:** Ciudad terminó con muy poca cobertura — Tito propuso suavizarlo; Sofía le dio una versión que seguía siendo cierta.
- `ND-H-CIU-G-05` · **Sala completa:** El faltante grave de Ciudad reunió al barrio — Tito buscó una sala más grande; Sofía buscó una respuesta concreta.
- `ND-H-CIU-G-06` · **Acta extensa:** La mayor parte de la necesidad de Ciudad quedó sin cubrir — Tito escribió un acta larga; Sofía resumió el dato en una línea.
- `ND-H-CIU-G-07` · **Pregunta obvia:** Ciudad recibió muy por debajo de lo necesario — Tito preguntó si faltaba mucho; Sofía le señaló el titular.
- `ND-H-CIU-G-08` · **Ventanilla abierta:** Ciudad enfrenta un faltante grave — Tito abrió otra ventanilla de reclamos; Sofía preguntó por la ventanilla de soluciones.
- `ND-H-CIU-G-09` · **Copia fiel:** El reparto dejó muy poca agua para Ciudad — Tito hizo una copia para cada vecino; Sofía le pidió que no copiara también la falta.
- `ND-H-CIU-G-10` · **Pizarrón:** La mayor parte de la necesidad de Ciudad quedó pendiente — Tito llenó el pizarrón de puntos; Sofía dejó uno solo: falta agua.
- `ND-H-CIU-G-11` · **Agenda urgente:** El faltante de Ciudad es grave — Tito lo marcó urgente; Sofía le preguntó si había otra categoría.
- `ND-H-CIU-G-12` · **Resumen oral:** Ciudad recibió muy poca agua para cubrir lo necesario — Tito ensayó la explicación; Sofía ya estaba en la conclusión.
- `ND-H-CIU-G-13` · **Ronda vecinal:** La necesidad de Ciudad quedó mayormente descubierta — Tito organizó una ronda de palabra; Sofía pidió una ronda de propuestas.
- `ND-H-CIU-G-14` · **Tamaño del informe:** El reparto dejó a Ciudad con un faltante grave — Tito pidió un informe corto; Sofía dejó corto sólo el título.
- `ND-H-CIU-G-15` · **Reclamo sostenido:** Ciudad conserva muy poca cobertura — Tito preguntó si podía retirar el reclamo; Sofía le mostró cuánto seguía pendiente.
- `ND-H-CIU-G-16` · **Llamada:** El faltante grave de Ciudad llegó a la portada — Tito llamó para agregar un comentario; Sofía anotó el comentario después del dato.
- `ND-H-CIU-G-17` · **Convocatoria:** La mayor parte de la necesidad de Ciudad no quedó cubierta — Tito mandó una convocatoria; el tema no necesitó aclaración.
- `ND-H-CIU-G-18` · **Punto de partida:** Ciudad terminó con un faltante muy grande — Sofía pidió empezar por el agua; Tito ya tenía preparada la lista de otros temas.
- `ND-H-CIU-G-19` · **Orden de reclamos:** El reparto quedó muy por debajo de la necesidad de Ciudad — Tito ordenó los reclamos; el faltante encabezó la lista.
- `ND-H-CIU-G-20` · **Sin eufemismo:** Ciudad recibió muy poca agua — Sofía dejó el eufemismo afuera; Tito no encontró uno mejor.

### Cultivos

- `ND-H-CUL-G-01` · **Cuenta del faltante:** Cultivos recibió muy por debajo de lo necesario — Jacinto mostró la suma sin redondear ni agregar el pronóstico.
- `ND-H-CUL-G-02` · **Libreta preparada:** La mayor parte de la necesidad de Cultivos quedó pendiente — Jacinto abrió la libreta en la página que ya conocía.
- `ND-H-CUL-G-03` · **Renglón urgente:** El faltante de Cultivos es grave — Jacinto escribió «urgente»; Marisa no pidió una explicación adicional.
- `ND-H-CUL-G-04` · **Cuenta sin margen:** Cultivos terminó con muy poca cobertura — Jacinto hizo la cuenta sin dejar margen para interpretaciones.
- `ND-H-CUL-G-05` · **Pronóstico apartado:** La necesidad de Cultivos quedó mayormente sin cubrir — Jacinto dejó el pronóstico fuera del informe de agua.
- `ND-H-CUL-G-06` · **Página numerada:** Cultivos recibió muy poca agua — Jacinto numeró las páginas del reclamo para que no se perdiera ninguna.
- `ND-H-CUL-G-07` · **Tinta roja:** El reparto dejó un faltante grave en Cultivos — Jacinto usó tinta roja; esta vez no era para corregir una suma.
- `ND-H-CUL-G-08` · **Resumen sin vueltas:** La mayor parte de la necesidad de Cultivos sigue pendiente — Jacinto pidió que el resumen no tuviera una versión optimista.
- `ND-H-CUL-G-09` · **Cálculo confirmado:** Cultivos quedó muy por debajo de lo que necesitaba — Jacinto revisó la cuenta; Marisa anotó que el resultado no cambió.
- `ND-H-CUL-G-10` · **Archivo abierto:** El faltante grave de Cultivos volvió a la libreta — Jacinto no tuvo que buscar la página.
- `ND-H-CUL-G-11` · **Suma principal:** Cultivos recibió sólo una parte pequeña de su necesidad — Jacinto puso la suma al principio, antes de que apareciera el pronóstico.
- `ND-H-CUL-G-12` · **Revisión del titular:** La cobertura de Cultivos quedó muy baja — Jacinto revisó que «baja» no pareciera un pronóstico del tiempo.
- `ND-H-CUL-G-13` · **Cuenta compartida:** La necesidad de Cultivos quedó mayormente pendiente — Jacinto pasó la cuenta; Marisa devolvió la hoja con el dato subrayado.
- `ND-H-CUL-G-14` · **Páginas agotadas:** El reparto cubrió poco de la necesidad de Cultivos — Jacinto terminó la página y siguió el reclamo en la siguiente.
- `ND-H-CUL-G-15` · **Respuesta al almacén:** Cultivos tuvo un faltante grave — Jacinto recibió una pregunta por el tiempo y contestó con la cuenta del agua.
- `ND-H-CUL-G-16` · **Medida correcta:** Cultivos recibió muy por debajo de lo necesario — Jacinto volvió a comprobar la unidad; la distancia seguía siendo la misma.
- `ND-H-CUL-G-17` · **Sin adorno:** La mayor parte de la necesidad de Cultivos quedó sin cubrir — Jacinto pidió imprimir la cifra sin rodearla de explicaciones.
- `ND-H-CUL-G-18` · **Renglón completo:** El faltante de Cultivos ocupó todo el renglón — Jacinto dejó el siguiente para la fecha de revisión.
- `ND-H-CUL-G-19` · **Cuenta en portada:** Cultivos recibió muy poca agua frente a su necesidad — Jacinto aprobó el título; el pronóstico no tuvo derecho a réplica.
- `ND-H-CUL-G-20` · **Cierre contable:** El reparto de Cultivos quedó gravemente corto — Jacinto cerró la cuenta y dejó abierta la libreta.

### Granja

- `ND-H-GRA-G-01` · **Respuesta inmediata:** Granja recibió muy poca agua — Berta respondió «falta» antes de que Marisa preguntara cuánto.
- `ND-H-GRA-G-02` · **Ronda suspendida:** La necesidad de Granja quedó mayormente sin cubrir — Berta suspendió la ronda de visitas; el faltante no necesitaba recorrido.
- `ND-H-GRA-G-03` · **Lista a la vista:** El faltante de Granja es grave — Berta dejó la lista donde todos pudieran verla y siguió con su tarea.
- `ND-H-GRA-G-04` · **Mate frío:** Granja recibió muy por debajo de lo necesario — Berta dejó enfriar el mate mientras ordenaba el reclamo.
- `ND-H-GRA-G-05` · **Visita sin rodeos:** La mayor parte de la necesidad de Granja quedó pendiente — Berta recibió a Marisa y fue directo al punto.
- `ND-H-GRA-G-06` · **Horario de entrevista:** Granja tiene un faltante grave — Berta fijó una entrevista corta; no había nada que adornar.
- `ND-H-GRA-G-07` · **Lista priorizada:** La cobertura de Granja quedó muy baja — Berta puso el faltante primero y las visitas después.
- `ND-H-GRA-G-08` · **Tarea a la vista:** Granja recibió muy poca agua para cubrir lo necesario — Berta continuó con la tarea que estaba haciendo; la explicación podía esperar.
- `ND-H-GRA-G-09` · **Silla vacía:** La mayor parte de la necesidad de Granja sigue sin cubrir — La silla de descanso quedó vacía; Berta tenía la lista a mano.
- `ND-H-GRA-G-10` · **Recorrido corto:** El reparto dejó un faltante grave en Granja — Berta acortó el recorrido y alargó el espacio para anotar pendientes.
- `ND-H-GRA-G-11` · **Informe sin portada:** Granja recibió muy poca cobertura — Berta leyó el informe y pidió que no usaran una foto de portada para suavizarlo.
- `ND-H-GRA-G-12` · **Pizarra concreta:** El faltante de Granja quedó claro — Berta escribió el dato en la pizarra; nadie pidió que lo explicara con un dibujo.
- `ND-H-GRA-G-13` · **Mate postergado:** La necesidad de Granja quedó lejos de cubierta — Berta postergó el mate, no la conversación sobre el faltante.
- `ND-H-GRA-G-14` · **Una respuesta:** Granja terminó con un faltante grave — Berta dio una respuesta y Marisa no necesitó otra pregunta.
- `ND-H-GRA-G-15` · **Visita informada:** A Granja le faltó la mayor parte de lo necesario — Berta recibió a Marisa con la lista preparada, no con un guion.
- `ND-H-GRA-G-16` · **Lista resistente:** El reparto quedó muy corto para Granja — Berta cambió de carpeta; la lista de pendientes pasó con ella.
- `ND-H-GRA-G-17` · **Prioridad del día:** Granja recibió muy poca agua — Berta movió el faltante al principio de la jornada y el mate al final.
- `ND-H-GRA-G-18` · **Sin pronóstico:** La brecha de Granja es grave — Berta dejó el pronóstico para otro día y mantuvo el tema del agua en la mesa.
- `ND-H-GRA-G-19` · **Parte breve:** La mayor parte de la necesidad de Granja no quedó cubierta — Berta pidió un parte breve: «Así, directo».
- `ND-H-GRA-G-20` · **Cierre pendiente:** El faltante grave de Granja sigue abierto — Berta cerró la entrevista, no el reclamo.

### Mina

- `ND-H-MIN-G-01` · **Frase precisa:** Mina recibió muy poca agua frente a su necesidad — Rosa escribió «faltante grave»; Ferrada no pidió un sinónimo.
- `ND-H-MIN-G-02` · **Informe sin eufemismos:** La mayor parte de la necesidad de Mina quedó sin cubrir — Rosa quitó el rodeo y dejó el dato.
- `ND-H-MIN-G-03` · **Carpeta señalada:** El reparto dejó un faltante grave en Mina — Ferrada abrió la carpeta; Rosa ya había señalado el renglón principal.
- `ND-H-MIN-G-04` · **Resumen ejecutivo:** Mina quedó muy por debajo de lo necesario — Rosa escribió el resumen en una frase; Ferrada no pidió una segunda página.
- `ND-H-MIN-G-05` · **Término descartado:** La cobertura de Mina fue muy baja — Rosa descartó «situación compleja» por demasiado amplio.
- `ND-H-MIN-G-06` · **Revisión sin cambios:** Mina recibió muy poca agua — Ferrada leyó el informe; Rosa no tuvo que cambiar una palabra.
- `ND-H-MIN-G-07` · **Informe principal:** La mayor parte de la necesidad de Mina quedó pendiente — Rosa dejó el dato en el cuerpo principal, no en un anexo.
- `ND-H-MIN-G-08` · **Sin maquillaje:** El faltante grave de Mina llegó al informe — Ferrada propuso un adjetivo; Rosa prefirió dejar el hecho.
- `ND-H-MIN-G-09` · **Página completa:** Mina terminó muy lejos de cubrir su necesidad — Rosa llenó la página con el estado real y dejó margen para seguimiento.
- `ND-H-MIN-G-10` · **Lectura de Ferrada:** La brecha de Mina es grave — Ferrada empezó una explicación; Rosa le mostró el titular ya escrito.
- `ND-H-MIN-G-11` · **Punto final:** Mina recibió muy por debajo de lo que necesitaba — Rosa puso punto final antes de que el eufemismo volviera a la frase.
- `ND-H-MIN-G-12` · **Carpeta de alertas:** El reparto dejó a Mina con muy poca cobertura — Rosa guardó el informe en la carpeta correcta; Ferrada no preguntó por otra.
- `ND-H-MIN-G-13` · **Borrador limpio:** La necesidad de Mina quedó mayormente sin cubrir — Rosa limpió el borrador; el dato quedó igual de visible.
- `ND-H-MIN-G-14` · **Observación principal:** El faltante de Mina es grave — Rosa puso la observación principal arriba; Ferrada esta vez la encontró.
- `ND-H-MIN-G-15` · **Revisión de frase:** Mina recibió muy poca agua — Rosa propuso una frase sin eufemismos; Ferrada no pidió suavizarla.
- `ND-H-MIN-G-16` · **Sin anexo:** La mayor parte de la necesidad de Mina quedó pendiente — Ferrada pidió contexto; Rosa señaló que el dato ya ocupaba toda la página.
- `ND-H-MIN-G-17` · **Informe legible:** El reparto dejó una brecha muy grande en Mina — Rosa hizo legible el informe sin hacerlo más optimista.
- `ND-H-MIN-G-18` · **Firma:** Mina quedó con un faltante grave — Ferrada firmó el estado; Rosa conservó el informe sin tachar el dato.
- `ND-H-MIN-G-19` · **Vocabulario concreto:** La cobertura de Mina quedó muy por debajo de la necesidad — Rosa reemplazó tres eufemismos por «falta mucha agua».
- `ND-H-MIN-G-20` · **Edición final:** Mina recibió muy poco de lo necesario — Ferrada aprobó la nota en la primera lectura; no había una forma más corta de decirlo.

### Río Vivo

- `ND-H-RIO-G-01` · **Brecha grave:** El caudal ecológico quedó muy por debajo de la referencia — Clara pidió nombrar el faltante sin presentarlo como diagnóstico de calidad.
- `ND-H-RIO-G-02` · **Prioridad de agenda:** La referencia ecológica quedó lejos del caudal registrado — Clara puso el tema primero en la reunión.
- `ND-H-RIO-G-03` · **Título exacto:** Río Vivo quedó con una brecha ecológica grave — Clara descartó «casi normal» antes de que Marisa terminara el borrador.
- `ND-H-RIO-G-04` · **Informe principal:** La mayor parte de la referencia de caudal quedó pendiente — Clara evitó mandar el dato a una nota al pie.
- `ND-H-RIO-G-05` · **Seguimiento prioritario:** El caudal de Río Vivo quedó muy bajo frente a la referencia — Clara solicitó seguimiento sin prometer cuándo se cubrirá.
- `ND-H-RIO-G-06` · **Dato sin paisaje:** La brecha ecológica de Río Vivo es grave — Clara pidió que la noticia dijera el dato antes de describir el paisaje.
- `ND-H-RIO-G-07` · **Aclaración:** El caudal ecológico quedó muy por debajo de la referencia — Clara agregó «de caudal» para que nadie lo confundiera con calidad.
- `ND-H-RIO-G-08` · **Prioridad compartida:** Río Vivo no cubrió la mayor parte de su referencia — Clara llevó el faltante a la mesa común del valle.
- `ND-H-RIO-G-09` · **Sin adjetivo tranquilizador:** El caudal quedó en brecha grave — Clara devolvió el borrador que intentaba llamarla «menor».
- `ND-H-RIO-G-10` · **Acta corregida:** La referencia ecológica quedó muy lejos de cubrirse — Clara corrigió el acta para que «grave» no desapareciera en el resumen.
- `ND-H-RIO-G-11` · **Titular directo:** Río Vivo quedó muy por debajo de su referencia — Marisa escribió el dato; Clara no le agregó un paisaje de consuelo.
- `ND-H-RIO-G-12` · **Espacio de reunión:** El caudal ecológico cubrió sólo una parte pequeña de la referencia — Clara pidió tiempo de reunión proporcional al tema, no al titular.
- `ND-H-RIO-G-13` · **Punto pendiente:** El faltante de caudal ecológico es grave — Clara dejó el punto abierto en el acta, sin inventar un cierre.
- `ND-H-RIO-G-14` · **Sección correcta:** Río Vivo quedó muy por debajo de la referencia — Clara ubicó la nota en seguimiento ecológico, no en calidad.
- `ND-H-RIO-G-15` · **Lectura completa:** La mayor parte de la referencia de Río Vivo sigue sin cubrir — Clara pidió leer el dato completo, sin atenuarlo en el epígrafe.
- `ND-H-RIO-G-16` · **Término preciso:** El caudal quedó en una brecha ecológica grave — Clara cambió «problema general» por «referencia de caudal pendiente».
- `ND-H-RIO-G-17` · **Agenda sin paisaje:** La cobertura ecológica de Río Vivo quedó muy baja — Clara dejó el paisaje para otra página y el faltante en la portada.
- `ND-H-RIO-G-18` · **Minuta:** Río Vivo no alcanzó la mayor parte de la referencia ecológica — Clara dictó una minuta breve; Marisa no necesitó acortarla.
- `ND-H-RIO-G-19` · **Análisis correcto:** La brecha de Río Vivo es grave — Clara se aseguró de que el artículo no afirmara por eso que la calidad también lo fuera.
- `ND-H-RIO-G-20` · **Pendiente visible:** La referencia de caudal quedó muy lejos de cubrirse — Clara pidió que el faltante quedara visible en el seguimiento de la próxima estación.

## Ver el valle · cobertura completa

Carteles breves y visuales. No usan la escena del grupo silenciado ni la foto de Ferrada.

### Ciudad

- `ND-V-CIU-C-01` · **Familia de escena: tito desplegó el formulario de reclamos** · Tito desplegó el formulario de reclamos y descubrió que el casillero de «agua» estaba vacío.
- `ND-V-CIU-C-02` · **Familia de escena: sofía puso el cartel «tema resuelto»** · Sofía puso el cartel «tema resuelto»; Tito le preguntó dónde se guardaban los carteles nuevos.
- `ND-V-CIU-C-03` · **Familia de escena: la carpeta de reclamos de Ciudad** · La carpeta de reclamos de Ciudad quedó cerrada, con un señalador listo para la próxima estación.
- `ND-V-CIU-C-04` · **Familia de escena: tito ensayó una queja y terminó** · Tito ensayó una queja y terminó pidiendo que le devolvieran el tiempo de ensayo.
- `ND-V-CIU-C-05` · **Familia de escena: sofía dejó el renglón de agua** · Sofía dejó el renglón de agua en blanco; Tito lo decoró para que no pareciera abandono.
- `ND-V-CIU-C-06` · **Familia de escena: el tablón de Ciudad no tuvo** · El tablón de Ciudad no tuvo aviso de faltante; Tito pegó uno que decía «se busca asunto».
- `ND-V-CIU-C-07` · **Familia de escena: tito revisó dos veces la agenda** · Tito revisó dos veces la agenda y no encontró una reunión para discutir el agua.
- `ND-V-CIU-C-08` · **Familia de escena: sofía guardó la carpeta de reclamos** · Sofía guardó la carpeta de reclamos; Tito se quedó sujetando el clip.
- `ND-V-CIU-C-09` · **Familia de escena: el formulario volvió sin observaciones** · El formulario volvió sin observaciones; Tito pidió que se lo sellaran por si era histórico.
- `ND-V-CIU-C-10` · **Familia de escena: ciudad cubrió la necesidad y el** · Ciudad cubrió la necesidad y el cartel de «pendientes» quedó sin título.
- `ND-V-CIU-C-11` · **Familia de escena: tito abrió una reunión para cerrar** · Tito abrió una reunión para cerrar el tema del agua. Sofía la cerró antes de que empezara.
- `ND-V-CIU-C-12` · **Familia de escena: la ventanilla de reclamos quedó vacía** · La ventanilla de reclamos quedó vacía; Tito practicó atender una consulta imaginaria.
- `ND-V-CIU-C-13` · **Familia de escena: sofía archivó el expediente** · Sofía archivó el expediente. El índice de Tito todavía lo buscaba.
- `ND-V-CIU-C-14` · **Familia de escena: el renglón «agua» salió de la** · El renglón «agua» salió de la lista; Tito lo extrañó durante unos segundos.
- `ND-V-CIU-C-15` · **Familia de escena: ciudad terminó sin faltantes** · Ciudad terminó sin faltantes. La carpeta siguió abierta porque Tito no encontró el botón de cerrar.
- `ND-V-CIU-C-16` · **Familia de escena: tito llegó con un formulario nuevo** · Tito llegó con un formulario nuevo; Sofía le indicó que hoy no había nada para llenar.
- `ND-V-CIU-C-17` · **Familia de escena: el tablón quedó despejado** · El tablón quedó despejado. Tito agregó una flecha que apuntaba al espacio libre.
- `ND-V-CIU-C-18` · **Familia de escena: sofía terminó el informe antes de** · Sofía terminó el informe antes de que Tito preparara la pregunta de seguimiento.
- `ND-V-CIU-C-19` · **Familia de escena: el sello de «pendiente» quedó guardado** · El sello de «pendiente» quedó guardado; Tito pidió que no lo jubilaran todavía.
- `ND-V-CIU-C-20` · **Familia de escena: la lista de Ciudad terminó en** · La lista de Ciudad terminó en una página. Tito revisó si se había perdido el reverso.

### Cultivos

- `ND-V-CUL-C-01` · **Familia de escena: jacinto cerró la planilla y la** · Jacinto cerró la planilla y la dejó lejos del alcance de la calculadora.
- `ND-V-CUL-C-02` · **Familia de escena: el pronóstico siguió abierto** · El pronóstico siguió abierto; Jacinto lo miró por costumbre y después cerró la libreta.
- `ND-V-CUL-C-03` · **Familia de escena: la suma dio completa** · La suma dio completa. Jacinto guardó la calculadora como si también hubiera terminado su turno.
- `ND-V-CUL-C-04` · **Familia de escena: jacinto encontró una fila sin observaciones** · Jacinto encontró una fila sin observaciones y la dejó tranquila.
- `ND-V-CUL-C-05` · **Familia de escena: la carpeta de pendientes quedó cerrada** · La carpeta de pendientes quedó cerrada; el pronóstico se quedó con la puerta abierta.
- `ND-V-CUL-C-06` · **Familia de escena: jacinto contó la cobertura completa y** · Jacinto contó la cobertura completa y contó de nuevo para despedirse de la cuenta.
- `ND-V-CUL-C-07` · **Familia de escena: la planilla no necesitó una nota** · La planilla no necesitó una nota al margen; Jacinto escribió una igual: «revisado».
- `ND-V-CUL-C-08` · **Familia de escena: el renglón de agua quedó completo** · El renglón de agua quedó completo. Jacinto buscó qué columna se podía cerrar también.
- `ND-V-CUL-C-09` · **Familia de escena: berta acercó el mate** · Berta acercó el mate; Jacinto terminó primero de admirar una suma sin asteriscos.
- `ND-V-CUL-C-10` · **Familia de escena: la libreta quedó cerrada** · La libreta quedó cerrada. El pronóstico, por decisión propia de Jacinto, no.
- `ND-V-CUL-C-11` · **Familia de escena: la cuenta terminó sin faltantes** · La cuenta terminó sin faltantes; Jacinto guardó el lápiz antes de inventarle trabajo.
- `ND-V-CUL-C-12` · **Familia de escena: cultivos cubrió toda su necesidad** · Cultivos cubrió toda su necesidad. Jacinto tachó «consultar reparto» del calendario.
- `ND-V-CUL-C-13` · **Familia de escena: la última fila de la planilla** · La última fila de la planilla quedó completa y Jacinto no agregó una fila nueva.
- `ND-V-CUL-C-14` · **Familia de escena: jacinto verificó el total y dejó** · Jacinto verificó el total y dejó la calculadora boca abajo, para que descansara.
- `ND-V-CUL-C-15` · **Familia de escena: la carpeta de agua cerró con** · La carpeta de agua cerró con una cuenta completa y sin una hoja suelta.
- `ND-V-CUL-C-16` · **Familia de escena: el pronóstico se quedó sin público** · El pronóstico se quedó sin público por un momento: Jacinto miraba el resultado del reparto.
- `ND-V-CUL-C-17` · **Familia de escena: la lista de pendientes no tuvo** · La lista de pendientes no tuvo un renglón de agua para subrayar.
- `ND-V-CUL-C-18` · **Familia de escena: jacinto terminó la cuenta** · Jacinto terminó la cuenta. El lápiz pidió otra operación; nadie lo escuchó.
- `ND-V-CUL-C-19` · **Familia de escena: la necesidad de Cultivos quedó cubierta** · La necesidad de Cultivos quedó cubierta; el celular siguió mostrando el clima.
- `ND-V-CUL-C-20` · **Familia de escena: jacinto cerró la hoja completa sin** · Jacinto cerró la hoja completa sin poner «verificar» debajo.

### Granja

- `ND-V-GRA-C-01` · **Familia de escena: berta tomó el mate antes de** · Berta tomó el mate antes de que se enfriara y lo anotó como un buen horario.
- `ND-V-GRA-C-02` · **Familia de escena: la lista de Granja quedó sin** · La lista de Granja quedó sin faltantes. Berta la usó de posavasos.
- `ND-V-GRA-C-03` · **Familia de escena: berta se sentó** · Berta se sentó; la silla tardó un segundo en entender que era en serio.
- `ND-V-GRA-C-04` · **Familia de escena: el termo quedó sobre la mesa** · El termo quedó sobre la mesa y Berta no tuvo que llevárselo a la entrevista.
- `ND-V-GRA-C-05` · **Familia de escena: berta bloqueó un rato de descanso** · Berta bloqueó un rato de descanso en la agenda. Marisa no pidió ese horario.
- `ND-V-GRA-C-06` · **Familia de escena: la libreta de pendientes cerró** · La libreta de pendientes cerró; el mate abrió la tarde.
- `ND-V-GRA-C-07` · **Familia de escena: berta dejó la taza apoyada en** · Berta dejó la taza apoyada en la mesa, sin levantarse a buscar otra cosa.
- `ND-V-GRA-C-08` · **Familia de escena: la silla de descanso recibió a** · La silla de descanso recibió a Berta y no a una nueva lista.
- `ND-V-GRA-C-09` · **Familia de escena: granja terminó sin faltantes** · Granja terminó sin faltantes; Berta encontró el mate en el lugar donde lo había dejado.
- `ND-V-GRA-C-10` · **Familia de escena: berta tomó el mate caliente** · Berta tomó el mate caliente. El reloj confirmó que ese momento existía.
- `ND-V-GRA-C-11` · **Familia de escena: la agenda tuvo un bloque libre** · La agenda tuvo un bloque libre y Berta no dejó que nadie lo bautizara «reunión».
- `ND-V-GRA-C-12` · **Familia de escena: berta guardó la libreta y se** · Berta guardó la libreta y se acordó dónde había dejado la taza.
- `ND-V-GRA-C-13` · **Familia de escena: el descanso no necesitó explicación** · El descanso no necesitó explicación; Marisa igual tomó nota del fenómeno.
- `ND-V-GRA-C-14` · **Familia de escena: la visita terminó y Berta no** · La visita terminó y Berta no tuvo que seguirla con la lista en la mano.
- `ND-V-GRA-C-15` · **Familia de escena: la mesa quedó despejada salvo por** · La mesa quedó despejada salvo por el mate, que Berta defendió como prioridad.
- `ND-V-GRA-C-16` · **Familia de escena: berta cruzó la mañana sin una** · Berta cruzó la mañana sin una consulta urgente interrumpiendo el descanso.
- `ND-V-GRA-C-17` · **Familia de escena: el mate quedó en el centro** · El mate quedó en el centro de la agenda; por fin la agenda tenía centro.
- `ND-V-GRA-C-18` · **Familia de escena: berta se tomó el último sorbo** · Berta se tomó el último sorbo sin que apareciera una pregunta nueva.
- `ND-V-GRA-C-19` · **Familia de escena: la silla de Berta quedó ocupada** · La silla de Berta quedó ocupada hasta el final de la pausa.
- `ND-V-GRA-C-20` · **Familia de escena: berta guardó la lista de agua** · Berta guardó la lista de agua y dejó la taza al alcance.

### Mina

- `ND-V-MIN-C-01` · **Familia de escena: rosa cerró el informe de faltantes** · Rosa cerró el informe de faltantes; Ferrada abrió el de resultados.
- `ND-V-MIN-C-02` · **Familia de escena: ferrada llegó sin carpeta de reclamos** · Ferrada llegó sin carpeta de reclamos y tuvo que cargar las manos en los bolsillos.
- `ND-V-MIN-C-03` · **Familia de escena: el informe de Mina terminó sin** · El informe de Mina terminó sin tachaduras. Rosa revisó que fueran sus hojas.
- `ND-V-MIN-C-04` · **Familia de escena: ferrada leyó «completo» y no buscó** · Ferrada leyó «completo» y no buscó un pie de página que lo contradijera.
- `ND-V-MIN-C-05` · **Familia de escena: la carpeta de pendientes quedó vacía** · La carpeta de pendientes quedó vacía de agua; Rosa no la llenó con consejos.
- `ND-V-MIN-C-06` · **Familia de escena: ferrada ordenó los papeles sin crear** · Ferrada ordenó los papeles sin crear una sección para aclaraciones.
- `ND-V-MIN-C-07` · **Familia de escena: rosa guardó el informe final** · Rosa guardó el informe final; Ferrada no preguntó si había una versión más optimista.
- `ND-V-MIN-C-08` · **Familia de escena: la lista de correcciones de Rosa** · La lista de correcciones de Rosa quedó en blanco y Ferrada la miró con respeto.
- `ND-V-MIN-C-09` · **Familia de escena: mina cubrió toda su necesidad** · Mina cubrió toda su necesidad. Rosa cerró el casillero de seguimiento de esta estación.
- `ND-V-MIN-C-10` · **Familia de escena: ferrada firmó sin pedir otra lectura** · Ferrada firmó sin pedir otra lectura; Rosa comprobó que el papel estuviera del derecho.
- `ND-V-MIN-C-11` · **Familia de escena: el archivo recibió una carpeta sin** · El archivo recibió una carpeta sin reclamos y preguntó si era la sección correcta.
- `ND-V-MIN-C-12` · **Familia de escena: rosa separó las hojas de faltantes** · Rosa separó las hojas de faltantes; ninguna tenía el nombre de esta estación.
- `ND-V-MIN-C-13` · **Familia de escena: ferrada dejó el borrador vacío de** · Ferrada dejó el borrador vacío de observaciones y encontró una mesa despejada.
- `ND-V-MIN-C-14` · **Familia de escena: el informe completo llegó a la** · El informe completo llegó a la carpeta de resultados sin escala por aclarar.
- `ND-V-MIN-C-15` · **Familia de escena: rosa guardó el marcador** · Rosa guardó el marcador. Ferrada no encontró una frase que necesitara subrayado.
- `ND-V-MIN-C-16` · **Familia de escena: la Mina cerró sin faltantes y** · La Mina cerró sin faltantes y la carpeta de Rosa cerró sin anexo.
- `ND-V-MIN-C-17` · **Familia de escena: ferrada buscó la página de reclamos** · Ferrada buscó la página de reclamos; Rosa le mostró el índice de resultados.
- `ND-V-MIN-C-18` · **Familia de escena: el informe quedó listo a la** · El informe quedó listo a la primera, novedad que Rosa registró por separado.
- `ND-V-MIN-C-19` · **Familia de escena: mina cubrió la necesidad completa** · Mina cubrió la necesidad completa; Ferrada dejó el discurso preparado para otro día.
- `ND-V-MIN-C-20` · **Familia de escena: rosa archivó la cuenta completa** · Rosa archivó la cuenta completa. Ferrada no pidió que la archivara con una foto.

### Río Vivo

- `ND-V-RIO-C-01` · **Familia de escena: clara terminó la explicación y dejó** · Clara terminó la explicación y dejó que el río se quedara con el último turno.
- `ND-V-RIO-C-02` · **Familia de escena: la referencia ecológica quedó cubierta** · La referencia ecológica quedó cubierta; Clara cerró la carpeta de medición, no la del río.
- `ND-V-RIO-C-03` · **Familia de escena: marisa anotó «llegó»** · Marisa anotó «llegó». Clara no añadió una nota que dijera «casi».
- `ND-V-RIO-C-04` · **Familia de escena: clara guardó la lista de pendientes** · Clara guardó la lista de pendientes del caudal y dejó el dato completo en primer plano.
- `ND-V-RIO-C-05` · **Familia de escena: el río alcanzó la referencia** · El río alcanzó la referencia; Clara dejó de buscar un verbo más preciso.
- `ND-V-RIO-C-06` · **Familia de escena: clara revisó el cartel y no** · Clara revisó el cartel y no tuvo que separar el caudal de la calidad: ya estaban separados.
- `ND-V-RIO-C-07` · **Familia de escena: río Vivo cubrió la referencia** · Río Vivo cubrió la referencia; Clara dio por terminada la ronda de correcciones.
- `ND-V-RIO-C-08` · **Familia de escena: la nota de Clara llevó un** · La nota de Clara llevó un punto final y no una advertencia entre paréntesis.
- `ND-V-RIO-C-09` · **Familia de escena: marisa terminó el cartel** · Marisa terminó el cartel; Clara no agregó una segunda línea para completar el dato.
- `ND-V-RIO-C-10` · **Familia de escena: el tramo de referencia quedó cubierto** · El tramo de referencia quedó cubierto. Clara dejó el lápiz sobre la mesa.
- `ND-V-RIO-C-11` · **Familia de escena: clara guardó el borrador «pendiente» en** · Clara guardó el borrador «pendiente» en la carpeta de esta estación.
- `ND-V-RIO-C-12` · **Familia de escena: la referencia ecológica quedó cubierta y** · La referencia ecológica quedó cubierta y Clara no pidió achicar el cartel.
- `ND-V-RIO-C-13` · **Familia de escena: marisa dijo «completo»** · Marisa dijo «completo»; Clara dejó la palabra en el cartel.
- `ND-V-RIO-C-14` · **Familia de escena: río Vivo alcanzó su referencia** · Río Vivo alcanzó su referencia. Clara cerró el cuaderno sin agregar un asterisco.
- `ND-V-RIO-C-15` · **Familia de escena: clara apartó los títulos tentativos** · Clara apartó los títulos tentativos; el dato ya daba para un cartel corto.
- `ND-V-RIO-C-16` · **Familia de escena: el caudal cubrió la referencia ecológica** · El caudal cubrió la referencia ecológica; Clara no tuvo que rescatar el verbo del borrador.
- `ND-V-RIO-C-17` · **Familia de escena: clara terminó la revisión antes de** · Clara terminó la revisión antes de que Marisa cambiara el título por tercera vez.
- `ND-V-RIO-C-18` · **Familia de escena: la referencia quedó cubierta** · La referencia quedó cubierta. Clara llevó la lista de pendientes vacía a la siguiente reunión.
- `ND-V-RIO-C-19` · **Familia de escena: el cartel de Río Vivo quedó** · El cartel de Río Vivo quedó sin una nota de «falta» al pie.
- `ND-V-RIO-C-20` · **Familia de escena: clara guardó el lápiz: por hoy,** · Clara guardó el lápiz: por hoy, el dato no necesitó otra corrección.

## Ver el valle · cobertura casi completa

Todas estas piezas sirven sin comparación previa. “Casi” no significa completa.

### Ciudad

- `ND-V-CIU-P-01` · **Familia de escena: tito puso una cinta en el** · Tito puso una cinta en el renglón que falta; Sofía no dejó que la cinta lo tapara.
- `ND-V-CIU-P-02` · **Familia de escena: la lista de Ciudad se hizo** · La lista de Ciudad se hizo más corta; Tito tuvo que usar letra más grande para el resto.
- `ND-V-CIU-P-03` · **Familia de escena: sofía dejó un casillero abierto en** · Sofía dejó un casillero abierto en el formulario. Tito intentó cerrarlo con una sonrisa.
- `ND-V-CIU-P-04` · **Familia de escena: a Tito le faltó poco para** · A Tito le faltó poco para archivar el reclamo; Sofía conservó la llave.
- `ND-V-CIU-P-05` · **Familia de escena: el cartel de «casi» quedó derecho** · El cartel de «casi» quedó derecho. Tito preguntó si podía agregarle un moño.
- `ND-V-CIU-P-06` · **Familia de escena: ciudad quedó cerca del total** · Ciudad quedó cerca del total; Sofía puso el faltante en el margen más ancho.
- `ND-V-CIU-P-07` · **Familia de escena: tito escribió «casi listo» y Sofía** · Tito escribió «casi listo» y Sofía le alcanzó otro color para «todavía falta».
- `ND-V-CIU-P-08` · **Familia de escena: el renglón de agua casi se** · El renglón de agua casi se cerró; Tito se quedó sujetando la carpeta.
- `ND-V-CIU-P-09` · **Familia de escena: sofía dejó una línea punteada donde** · Sofía dejó una línea punteada donde falta cobertura. Tito la siguió hasta el final.
- `ND-V-CIU-P-10` · **Familia de escena: tito llevó una tijera para acortar** · Tito llevó una tijera para acortar la lista; Sofía le mostró el renglón pendiente.
- `ND-V-CIU-P-11` · **Familia de escena: ciudad quedó casi cubierta** · Ciudad quedó casi cubierta; el sello de cierre siguió guardado en el cajón.
- `ND-V-CIU-P-12` · **Familia de escena: sofía puso una etiqueta «casi» en** · Sofía puso una etiqueta «casi» en el expediente; Tito buscó una etiqueta más festejable.
- `ND-V-CIU-P-13` · **Familia de escena: la parte pendiente quedó visible en** · La parte pendiente quedó visible en el tablón, justo donde Tito suele pegar novedades.
- `ND-V-CIU-P-14` · **Familia de escena: tito dibujó una línea de llegada** · Tito dibujó una línea de llegada; Sofía la dejó un poco más adelante.
- `ND-V-CIU-P-15` · **Familia de escena: el formulario de Ciudad casi quedó** · El formulario de Ciudad casi quedó completo. Sofía dejó en blanco el último casillero.
- `ND-V-CIU-P-16` · **Familia de escena: tito abrió el cajón de festejos** · Tito abrió el cajón de festejos y encontró que Sofía había guardado la llave.
- `ND-V-CIU-P-17` · **Familia de escena: la carpeta de reclamos quedó delgada,** · La carpeta de reclamos quedó delgada, aunque todavía no pudo cerrarse.
- `ND-V-CIU-P-18` · **Familia de escena: sofía escribió «falta poco»** · Sofía escribió «falta poco»; Tito quiso borrar la palabra que seguía a «falta».
- `ND-V-CIU-P-19` · **Familia de escena: el renglón pendiente ocupó poco espacio** · El renglón pendiente ocupó poco espacio y toda la atención de Tito.
- `ND-V-CIU-P-20` · **Familia de escena: ciudad quedó cerca de cubrir todo** · Ciudad quedó cerca de cubrir todo; Sofía dejó la lista lista para continuar.

### Cultivos

- `ND-V-CUL-P-01` · **Familia de escena: jacinto marcó la cuenta casi completa** · Jacinto marcó la cuenta casi completa y dejó el último recuadro sin colorear.
- `ND-V-CUL-P-02` · **Familia de escena: la planilla de Cultivos quedó cerca** · La planilla de Cultivos quedó cerca del total; Jacinto hizo espacio para el faltante.
- `ND-V-CUL-P-03` · **Familia de escena: jacinto cerró la libreta hasta la** · Jacinto cerró la libreta hasta la página pendiente, que quedó afuera como señalador.
- `ND-V-CUL-P-04` · **Familia de escena: el renglón de Cultivos llegó casi** · El renglón de Cultivos llegó casi al borde; Jacinto no dibujó el borde como si fuera el final.
- `ND-V-CUL-P-05` · **Familia de escena: jacinto guardó la calculadora y dejó** · Jacinto guardó la calculadora y dejó la cuenta escrita donde podía verla.
- `ND-V-CUL-P-06` · **Familia de escena: la cobertura quedó cerca** · La cobertura quedó cerca; Jacinto puso «casi» en el encabezado de la planilla.
- `ND-V-CUL-P-07` · **Familia de escena: el lápiz de Jacinto llegó al** · El lápiz de Jacinto llegó al último renglón y se quedó ahí, esperando el dato pendiente.
- `ND-V-CUL-P-08` · **Familia de escena: la cuenta de Cultivos casi cerró** · La cuenta de Cultivos casi cerró; Jacinto dejó abierta la tapa de la calculadora.
- `ND-V-CUL-P-09` · **Familia de escena: jacinto puso una pestaña en la** · Jacinto puso una pestaña en la página del faltante, no en la del pronóstico.
- `ND-V-CUL-P-10` · **Familia de escena: la planilla casi quedó llena** · La planilla casi quedó llena. Jacinto dejó una celda vacía para no mentirle al archivo.
- `ND-V-CUL-P-11` · **Familia de escena: jacinto dibujó una barra de cobertura** · Jacinto dibujó una barra de cobertura y dejó el tramo final sin pintar.
- `ND-V-CUL-P-12` · **Familia de escena: el renglón pendiente fue corto** · El renglón pendiente fue corto; Jacinto igual le puso título.
- `ND-V-CUL-P-13` · **Familia de escena: la libreta casi se cerró** · La libreta casi se cerró; la cuenta quedó afuera como una hoja suelta.
- `ND-V-CUL-P-14` · **Familia de escena: jacinto revisó el resultado y dejó** · Jacinto revisó el resultado y dejó el casillero «total» para otra estación.
- `ND-V-CUL-P-15` · **Familia de escena: la asignación quedó cerca de cubrir** · La asignación quedó cerca de cubrir Cultivos; Jacinto anotó «no redondear» en la esquina.
- `ND-V-CUL-P-16` · **Familia de escena: una columna terminó antes que la** · Una columna terminó antes que la necesidad. Jacinto agregó el resto en la columna siguiente.
- `ND-V-CUL-P-17` · **Familia de escena: el pronóstico quedó al dorso** · El pronóstico quedó al dorso; la parte pendiente, en el frente de la hoja.
- `ND-V-CUL-P-18` · **Familia de escena: jacinto hizo una marca junto al** · Jacinto hizo una marca junto al faltante. La marca no se confundía con una suma.
- `ND-V-CUL-P-19` · **Familia de escena: cultivos quedó casi cubierto y Jacinto** · Cultivos quedó casi cubierto y Jacinto dejó la regla sobre la parte sin colorear.
- `ND-V-CUL-P-20` · **Familia de escena: la planilla terminó en «casi»** · La planilla terminó en «casi»; Jacinto no cambió la última palabra por un número redondo.

### Granja

- `ND-V-GRA-P-01` · **Familia de escena: berta dejó el mate en la** · Berta dejó el mate en la mesa y la libreta abierta en el pendiente.
- `ND-V-GRA-P-02` · **Familia de escena: la silla de descanso quedó a** · La silla de descanso quedó a un paso de Berta; la lista, a un paso de cerrarse.
- `ND-V-GRA-P-03` · **Familia de escena: berta movió el mate para hacer** · Berta movió el mate para hacer lugar al renglón que falta.
- `ND-V-GRA-P-04` · **Familia de escena: la cobertura quedó cerca del total** · La cobertura quedó cerca del total; Berta reservó un espacio para el resto.
- `ND-V-GRA-P-05` · **Familia de escena: berta colgó el cartel «casi» en** · Berta colgó el cartel «casi» en la puerta y dejó la lista adentro.
- `ND-V-GRA-P-06` · **Familia de escena: la agenda de Berta tenía un** · La agenda de Berta tenía un bloque libre y un pendiente todavía ocupado.
- `ND-V-GRA-P-07` · **Familia de escena: berta puso la taza en el** · Berta puso la taza en el borde de la mesa: la lista seguía abierta.
- `ND-V-GRA-P-08` · **Familia de escena: la lista de Granja se dobló** · La lista de Granja se dobló por la mitad; el renglón pendiente quedó afuera.
- `ND-V-GRA-P-09` · **Familia de escena: berta acomodó la silla, pero dejó** · Berta acomodó la silla, pero dejó la libreta en el lugar de trabajo.
- `ND-V-GRA-P-10` · **Familia de escena: el mate esperaba el descanso** · El mate esperaba el descanso; Berta esperaba que el «casi» no pasara por «listo».
- `ND-V-GRA-P-11` · **Familia de escena: granja quedó cerca de la cobertura** · Granja quedó cerca de la cobertura total; Berta guardó la escoba y no la lista.
- `ND-V-GRA-P-12` · **Familia de escena: el calendario tuvo un día despejado** · El calendario tuvo un día despejado y un renglón de agua pendiente.
- `ND-V-GRA-P-13` · **Familia de escena: berta tachó una tarea y dejó** · Berta tachó una tarea y dejó el faltante sin tocar.
- `ND-V-GRA-P-14` · **Familia de escena: la libreta casi se cerró** · La libreta casi se cerró; Berta usó el mate para mantenerla abierta.
- `ND-V-GRA-P-15` · **Familia de escena: berta encontró un rato para sentarse,** · Berta encontró un rato para sentarse, con la lista en la otra silla.
- `ND-V-GRA-P-16` · **Familia de escena: la cobertura de Granja quedó cerca** · La cobertura de Granja quedó cerca; el cartel no necesitó ocupar toda la puerta.
- `ND-V-GRA-P-17` · **Familia de escena: berta guardó la taza después de** · Berta guardó la taza después de anotar cuánto sigue pendiente.
- `ND-V-GRA-P-18` · **Familia de escena: la lista quedó más corta, pero** · La lista quedó más corta, pero Berta conservó el encabezado «falta».
- `ND-V-GRA-P-19` · **Familia de escena: berta preparó el mate y dejó** · Berta preparó el mate y dejó la libreta al alcance, por si preguntaban.
- `ND-V-GRA-P-20` · **Familia de escena: granja casi cubrió la necesidad** · Granja casi cubrió la necesidad; Berta no confundió «casi» con horario de salida.

### Mina

- `ND-V-MIN-P-01` · **Familia de escena: rosa dejó sin marcar el casillero** · Rosa dejó sin marcar el casillero «completo» y marcó «casi» con tinta indeleble.
- `ND-V-MIN-P-02` · **Familia de escena: ferrada cerró la carpeta** · Ferrada cerró la carpeta; Rosa dejó afuera la hoja del faltante.
- `ND-V-MIN-P-03` · **Familia de escena: el informe de Mina quedó cerca** · El informe de Mina quedó cerca del total, con una página todavía por revisar.
- `ND-V-MIN-P-04` · **Familia de escena: rosa guardó el sello de cierre** · Rosa guardó el sello de cierre en un cajón distinto al de las correcciones.
- `ND-V-MIN-P-05` · **Familia de escena: ferrada escribió «casi» en el borde** · Ferrada escribió «casi» en el borde; Rosa le hizo lugar para «falta».
- `ND-V-MIN-P-06` · **Familia de escena: la carpeta se cerró con una** · La carpeta se cerró con una hoja sobresaliendo justo por el lado del pendiente.
- `ND-V-MIN-P-07` · **Familia de escena: rosa dejó el casillero final vacío** · Rosa dejó el casillero final vacío; Ferrada no volvió a llenarlo con palabras.
- `ND-V-MIN-P-08` · **Familia de escena: el informe de Mina terminó antes** · El informe de Mina terminó antes que la necesidad; Rosa anotó la diferencia al dorso.
- `ND-V-MIN-P-09` · **Familia de escena: ferrada acomodó los papeles por tamaño** · Ferrada acomodó los papeles por tamaño; Rosa puso primero el dato pendiente.
- `ND-V-MIN-P-10` · **Familia de escena: la barra de cobertura quedó casi** · La barra de cobertura quedó casi llena; Rosa dejó su último tramo sin sombrear.
- `ND-V-MIN-P-11` · **Familia de escena: rosa guardó el borrador, no el** · Rosa guardó el borrador, no el faltante; ese quedó en el seguimiento.
- `ND-V-MIN-P-12` · **Familia de escena: ferrada quiso poner el sello «listo»** · Ferrada quiso poner el sello «listo»; Rosa alcanzó el de «cerca».
- `ND-V-MIN-P-13` · **Familia de escena: la carpeta de Mina tenía menos** · La carpeta de Mina tenía menos páginas, pero todavía no podía archivarse.
- `ND-V-MIN-P-14` · **Familia de escena: rosa dejó una pestaña naranja en** · Rosa dejó una pestaña naranja en la hoja que impedía cerrar el informe.
- `ND-V-MIN-P-15` · **Familia de escena: ferrada firmó junto a «casi»** · Ferrada firmó junto a «casi»; Rosa conservó la palabra en el mismo renglón.
- `ND-V-MIN-P-16` · **Familia de escena: la parte cubierta llenó la primera** · La parte cubierta llenó la primera hoja. La pendiente empezó en la segunda.
- `ND-V-MIN-P-17` · **Familia de escena: rosa alineó los bordes y dejó** · Rosa alineó los bordes y dejó visible la página del faltante.
- `ND-V-MIN-P-18` · **Familia de escena: mina quedó cerca de cubrir todo** · Mina quedó cerca de cubrir todo; Ferrada no encontró el sello de «completo».
- `ND-V-MIN-P-19` · **Familia de escena: el título cupo en una línea** · El título cupo en una línea; Rosa dejó el faltante en la línea siguiente.
- `ND-V-MIN-P-20` · **Familia de escena: rosa marcó el avance en el** · Rosa marcó el avance en el informe y dejó el cierre para después.

### Río Vivo

- `ND-V-RIO-P-01` · **Familia de escena: clara dibujó la referencia y dejó** · Clara dibujó la referencia y dejó sin pintar el tramo que falta.
- `ND-V-RIO-P-02` · **Familia de escena: el rótulo «casi» quedó en el** · El rótulo «casi» quedó en el cartel; Clara guardó «completo» para otra medida.
- `ND-V-RIO-P-03` · **Familia de escena: marisa llevó dos títulos** · Marisa llevó dos títulos; Clara eligió el que no decía «llegó».
- `ND-V-RIO-P-04` · **Familia de escena: la línea del caudal quedó cerca** · La línea del caudal quedó cerca del final, no encima.
- `ND-V-RIO-P-05` · **Familia de escena: clara dejó un espacio entre el** · Clara dejó un espacio entre el dato y el sello de cierre.
- `ND-V-RIO-P-06` · **Familia de escena: el cartel indicó cercanía** · El cartel indicó cercanía; el lápiz de Clara señaló el tramo pendiente.
- `ND-V-RIO-P-07` · **Familia de escena: río Vivo quedó cerca de la** · Río Vivo quedó cerca de la referencia y Clara no levantó el cartel de «meta».
- `ND-V-RIO-P-08` · **Familia de escena: marisa borró «resuelto»** · Marisa borró «resuelto»; Clara le alcanzó una palabra más corta: «cerca».
- `ND-V-RIO-P-09` · **Familia de escena: clara marcó lo alcanzado y dejó** · Clara marcó lo alcanzado y dejó un margen para lo pendiente.
- `ND-V-RIO-P-10` · **Familia de escena: el caudal se acercó a la** · El caudal se acercó a la referencia; Clara mantuvo abierto el cuaderno de seguimiento.
- `ND-V-RIO-P-11` · **Familia de escena: clara ubicó «casi» al lado del** · Clara ubicó «casi» al lado del dato, no en letra chica.
- `ND-V-RIO-P-12` · **Familia de escena: el cartel dejó visible que la** · El cartel dejó visible que la referencia ecológica aún no se completó.
- `ND-V-RIO-P-13` · **Familia de escena: marisa escribió «cerca» y Clara retiró** · Marisa escribió «cerca» y Clara retiró la etiqueta de «fin».
- `ND-V-RIO-P-14` · **Familia de escena: la línea del caudal quedó a** · La línea del caudal quedó a un tramo de la referencia; Clara dejó el tramo en blanco.
- `ND-V-RIO-P-15` · **Familia de escena: clara agregó una nota de seguimiento** · Clara agregó una nota de seguimiento al cartel; no era una nota de festejo.
- `ND-V-RIO-P-16` · **Familia de escena: el lápiz quedó junto al punto** · El lápiz quedó junto al punto alcanzado, no junto al de llegada.
- `ND-V-RIO-P-17` · **Familia de escena: río Vivo cubrió casi toda la** · Río Vivo cubrió casi toda la referencia; Clara dejó el casillero de «cumplida» vacío.
- `ND-V-RIO-P-18` · **Familia de escena: clara midió el espacio pendiente dos** · Clara midió el espacio pendiente dos veces y no lo llamó cero.
- `ND-V-RIO-P-19` · **Familia de escena: el título quedó corto** · El título quedó corto; la referencia pendiente no desapareció del cartel.
- `ND-V-RIO-P-20` · **Familia de escena: clara guardó el rótulo «completo» y** · Clara guardó el rótulo «completo» y dejó «cerca» en el sitio visible.

## Ver el valle · cobertura insuficiente

Carteles de faltante relevante; no lo llaman grave ni lo esconden detrás de un chiste.

### Ciudad

- `ND-V-CIU-I-01` · **Familia de escena: sofía puso el renglón de agua** · Sofía puso el renglón de agua arriba de la lista; Tito buscó una segunda hoja.
- `ND-V-CIU-I-02` · **Familia de escena: la carpeta de Ciudad tuvo demasiados** · La carpeta de Ciudad tuvo demasiados pendientes para cerrarse con un clip.
- `ND-V-CIU-I-03` · **Familia de escena: tito dobló el formulario para guardarlo** · Tito dobló el formulario para guardarlo; Sofía lo desplegó en la página del agua.
- `ND-V-CIU-I-04` · **Familia de escena: la lista de reclamos quedó larga** · La lista de reclamos quedó larga; Tito intentó leerla como si fuera un menú.
- `ND-V-CIU-I-05` · **Familia de escena: sofía marcó el pendiente con una** · Sofía marcó el pendiente con una pestaña; Tito preguntó si era una promoción.
- `ND-V-CIU-I-06` · **Familia de escena: la pizarra de Ciudad se llenó** · La pizarra de Ciudad se llenó de renglones. El de agua quedó primero.
- `ND-V-CIU-I-07` · **Familia de escena: tito ofreció ordenar los temas** · Tito ofreció ordenar los temas; Sofía le entregó la carpeta completa.
- `ND-V-CIU-I-08` · **Familia de escena: el formulario volvió con más casilleros** · El formulario volvió con más casilleros de los que Tito sabía completar.
- `ND-V-CIU-I-09` · **Familia de escena: sofía separó los pendientes con una** · Sofía separó los pendientes con una regla; Tito midió la lista, no la falta.
- `ND-V-CIU-I-10` · **Familia de escena: la agenda de Ciudad agregó una** · La agenda de Ciudad agregó una reunión y Tito quiso agendar otra para organizarla.
- `ND-V-CIU-I-11` · **Familia de escena: el buzón de reclamos necesitó una** · El buzón de reclamos necesitó una etiqueta nueva: «agua, otra vez».
- `ND-V-CIU-I-12` · **Familia de escena: tito guardó una copia** · Tito guardó una copia; Sofía dejó el original a la vista.
- `ND-V-CIU-I-13` · **Familia de escena: la carpeta quedó abierta en el** · La carpeta quedó abierta en el renglón del faltante, como si tuviera marcador propio.
- `ND-V-CIU-I-14` · **Familia de escena: sofía tachó un tema resuelto** · Sofía tachó un tema resuelto; Tito movió los demás a otra hoja.
- `ND-V-CIU-I-15` · **Familia de escena: la reunión terminó y la lista** · La reunión terminó y la lista no. Tito se llevó ambas a casa.
- `ND-V-CIU-I-16` · **Familia de escena: el tablón de Ciudad recibió otro** · El tablón de Ciudad recibió otro aviso. Tito preguntó si había espacio para el aviso.
- `ND-V-CIU-I-17` · **Familia de escena: sofía señaló el agua pendiente** · Sofía señaló el agua pendiente; Tito dejó de señalar el índice.
- `ND-V-CIU-I-18` · **Familia de escena: la lista de Ciudad llegó al** · La lista de Ciudad llegó al final de la página y siguió en el reverso.
- `ND-V-CIU-I-19` · **Familia de escena: tito puso un separador en la** · Tito puso un separador en la carpeta; Sofía pidió que separara también los temas.
- `ND-V-CIU-I-20` · **Familia de escena: ciudad mantiene una parte importante pendiente** · Ciudad mantiene una parte importante pendiente. La libreta de Tito ya tenía la página abierta.

### Cultivos

- `ND-V-CUL-I-01` · **Familia de escena: jacinto llenó la columna del faltante** · Jacinto llenó la columna del faltante y dejó el pronóstico en la columna de al lado.
- `ND-V-CUL-I-02` · **Familia de escena: la cuenta de Cultivos no entró** · La cuenta de Cultivos no entró en una página; Jacinto dobló la hoja por la mitad.
- `ND-V-CUL-I-03` · **Familia de escena: jacinto agregó una pestaña a la** · Jacinto agregó una pestaña a la planilla. El pronóstico se quedó sin señalador.
- `ND-V-CUL-I-04` · **Familia de escena: la libreta de Cultivos abrió sola** · La libreta de Cultivos abrió sola en el renglón que Jacinto había marcado.
- `ND-V-CUL-I-05` · **Familia de escena: jacinto volvió a sumar** · Jacinto volvió a sumar; el faltante no se confundió con un error de dedo.
- `ND-V-CUL-I-06` · **Familia de escena: la columna pendiente quedó más llena** · La columna pendiente quedó más llena que la columna de observaciones.
- `ND-V-CUL-I-07` · **Familia de escena: jacinto hizo espacio en la hoja** · Jacinto hizo espacio en la hoja; el dato ocupó todo el espacio disponible.
- `ND-V-CUL-I-08` · **Familia de escena: el lápiz de Jacinto encontró el** · El lápiz de Jacinto encontró el faltante antes que la goma.
- `ND-V-CUL-I-09` · **Familia de escena: la planilla quedó abierta sobre la** · La planilla quedó abierta sobre la mesa; Jacinto puso el mate lejos de los números.
- `ND-V-CUL-I-10` · **Familia de escena: jacinto trasladó la cuenta al calendario** · Jacinto trasladó la cuenta al calendario. La cuenta siguió siendo la misma.
- `ND-V-CUL-I-11` · **Familia de escena: la página de Cultivos quedó llena** · La página de Cultivos quedó llena de cifras y sin lugar para el pronóstico.
- `ND-V-CUL-I-12` · **Familia de escena: jacinto subrayó el faltante** · Jacinto subrayó el faltante; la hoja no necesitó que le explicaran por qué.
- `ND-V-CUL-I-13` · **Familia de escena: la suma pasó a limpio y** · La suma pasó a limpio y conservó todos los renglones pendientes.
- `ND-V-CUL-I-14` · **Familia de escena: jacinto cerró la calculadora, no la** · Jacinto cerró la calculadora, no la carpeta de Cultivos.
- `ND-V-CUL-I-15` · **Familia de escena: la lista ocupó una hoja nueva** · La lista ocupó una hoja nueva; Jacinto dejó la vieja como antecedente.
- `ND-V-CUL-I-16` · **Familia de escena: el pronóstico quedó doblado en el** · El pronóstico quedó doblado en el bolsillo y la cuenta abierta en la mano.
- `ND-V-CUL-I-17` · **Familia de escena: jacinto puso una regla bajo la** · Jacinto puso una regla bajo la cifra; el renglón siguió igual de largo.
- `ND-V-CUL-I-18` · **Familia de escena: la planilla pidió una hoja extra** · La planilla pidió una hoja extra. Jacinto ya tenía una preparada.
- `ND-V-CUL-I-19` · **Familia de escena: el faltante de Cultivos ocupó la** · El faltante de Cultivos ocupó la casilla principal; el título de Jacinto fue «pendiente».
- `ND-V-CUL-I-20` · **Familia de escena: jacinto archivó la copia** · Jacinto archivó la copia; dejó el original en la carpeta activa.

### Granja

- `ND-V-GRA-I-01` · **Familia de escena: berta trasladó la lista de pendientes** · Berta trasladó la lista de pendientes al bolsillo que no usaba para el mate.
- `ND-V-GRA-I-02` · **Familia de escena: la libreta quedó abierta sobre la** · La libreta quedó abierta sobre la mesa y el mate en una esquina segura.
- `ND-V-GRA-I-03` · **Familia de escena: berta agregó una línea a la** · Berta agregó una línea a la lista y tachó la idea de acortarla.
- `ND-V-GRA-I-04` · **Familia de escena: la agenda de Berta cambió de** · La agenda de Berta cambió de orden; el faltante no cambió de lugar.
- `ND-V-GRA-I-05` · **Familia de escena: marisa miró la lista** · Marisa miró la lista; Berta le señaló el renglón que no necesitaba presentación.
- `ND-V-GRA-I-06` · **Familia de escena: la hoja de pendientes pasó del** · La hoja de pendientes pasó del bolsillo al tablón para que nadie la perdiera.
- `ND-V-GRA-I-07` · **Familia de escena: berta apoyó el mate sobre un** · Berta apoyó el mate sobre un posavasos, no sobre la libreta que sigue abierta.
- `ND-V-GRA-I-08` · **Familia de escena: la lista de Granja recibió otra** · La lista de Granja recibió otra marca. Berta guardó el lápiz, no la lista.
- `ND-V-GRA-I-09` · **Familia de escena: berta dejó la puerta abierta para** · Berta dejó la puerta abierta para la visita y la carpeta abierta para el seguimiento.
- `ND-V-GRA-I-10` · **Familia de escena: el calendario tuvo una tarea nueva** · El calendario tuvo una tarea nueva; Berta encontró la anterior todavía sin tachar.
- `ND-V-GRA-I-11` · **Familia de escena: la lista quedó en la silla** · La lista quedó en la silla libre; Berta ocupó la otra para revisar el pendiente.
- `ND-V-GRA-I-12` · **Familia de escena: berta preparó el mate antes de** · Berta preparó el mate antes de leer la hoja, para que al menos una cosa empezara a tiempo.
- `ND-V-GRA-I-13` · **Familia de escena: el renglón del agua quedó rodeado** · El renglón del agua quedó rodeado. Berta guardó el círculo para no volver a dibujarlo.
- `ND-V-GRA-I-14` · **Familia de escena: marisa quiso guardar la libreta** · Marisa quiso guardar la libreta; Berta le indicó que todavía estaba en uso.
- `ND-V-GRA-I-15` · **Familia de escena: la lista de Granja se extendió** · La lista de Granja se extendió al reverso; Berta puso la fecha arriba de todo.
- `ND-V-GRA-I-16` · **Familia de escena: berta abrió la agenda en el** · Berta abrió la agenda en el pendiente y cerró la tapa del termo.
- `ND-V-GRA-I-17` · **Familia de escena: la silla quedó libre** · La silla quedó libre; la mesa, ocupada por la lista de agua.
- `ND-V-GRA-I-18` · **Familia de escena: berta anotó el faltante antes de** · Berta anotó el faltante antes de que Marisa preguntara por el título.
- `ND-V-GRA-I-19` · **Familia de escena: la lista de tareas conservó el** · La lista de tareas conservó el punto del agua; Berta no lo confundió con un punto final.
- `ND-V-GRA-I-20` · **Familia de escena: berta se llevó la libreta** · Berta se llevó la libreta. El mate se quedó en la mesa, una decisión difícil.

### Mina

- `ND-V-MIN-I-01` · **Familia de escena: rosa dejó el informe abierto en** · Rosa dejó el informe abierto en la página de faltantes; Ferrada no buscó otra carpeta.
- `ND-V-MIN-I-02` · **Familia de escena: el casillero «cubierto» quedó vacío y** · El casillero «cubierto» quedó vacío y Rosa lo dejó vacío.
- `ND-V-MIN-I-03` · **Familia de escena: ferrada llevó una carpeta** · Ferrada llevó una carpeta; Rosa le agregó el separador «pendiente».
- `ND-V-MIN-I-04` · **Familia de escena: la hoja de Mina pasó a** · La hoja de Mina pasó a limpio sin perder el renglón que faltaba.
- `ND-V-MIN-I-05` · **Familia de escena: rosa escribió el dato antes de** · Rosa escribió el dato antes de que Ferrada encontrara un sinónimo.
- `ND-V-MIN-I-06` · **Familia de escena: el índice de la carpeta mandó** · El índice de la carpeta mandó directo al faltante; Rosa lo había ordenado así.
- `ND-V-MIN-I-07` · **Familia de escena: ferrada puso un papel sobre el** · Ferrada puso un papel sobre el informe; Rosa lo movió para dejar visible el dato.
- `ND-V-MIN-I-08` · **Familia de escena: la carpeta de Mina quedó abierta** · La carpeta de Mina quedó abierta como recordatorio de que no era archivo.
- `ND-V-MIN-I-09` · **Familia de escena: rosa marcó el pendiente** · Rosa marcó el pendiente; Ferrada leyó la marca sin pedir un discurso.
- `ND-V-MIN-I-10` · **Familia de escena: el informe necesitó otra hoja** · El informe necesitó otra hoja. Rosa no llamó «anexo» a lo principal.
- `ND-V-MIN-I-11` · **Familia de escena: ferrada ordenó las páginas** · Ferrada ordenó las páginas; Rosa mantuvo el faltante primero.
- `ND-V-MIN-I-12` · **Familia de escena: la versión corta de Rosa conservó** · La versión corta de Rosa conservó el dato completo.
- `ND-V-MIN-I-13` · **Familia de escena: el marcador de Rosa quedó en** · El marcador de Rosa quedó en la página correcta antes de que llegara Ferrada.
- `ND-V-MIN-I-14` · **Familia de escena: mina mantuvo una brecha importante** · Mina mantuvo una brecha importante; Rosa añadió una pestaña al archivo de seguimiento.
- `ND-V-MIN-I-15` · **Familia de escena: ferrada abrió el informe por la** · Ferrada abrió el informe por la mitad. Rosa le mostró el principio.
- `ND-V-MIN-I-16` · **Familia de escena: la hoja de resultados quedó junto** · La hoja de resultados quedó junto a la de pendientes, sin mezclarse.
- `ND-V-MIN-I-17` · **Familia de escena: rosa imprimió una copia adicional** · Rosa imprimió una copia adicional; Ferrada preguntó si el papel también contaba como cobertura.
- `ND-V-MIN-I-18` · **Familia de escena: el sello «revisado» apareció** · El sello «revisado» apareció; el de «resuelto» se quedó en el cajón.
- `ND-V-MIN-I-19` · **Familia de escena: ferrada anotó una observación** · Ferrada anotó una observación; Rosa le pidió que no la pusiera por encima del faltante.
- `ND-V-MIN-I-20` · **Familia de escena: la carpeta no cerró del todo:** · La carpeta no cerró del todo: una pestaña naranja quedó afuera.

### Río Vivo

- `ND-V-RIO-I-01` · **Familia de escena: clara dejó el tramo pendiente marcado,** · Clara dejó el tramo pendiente marcado, sin llamarlo normal.
- `ND-V-RIO-I-02` · **Familia de escena: la línea de referencia quedó por** · La línea de referencia quedó por encima del caudal; Clara mantuvo ambas visibles.
- `ND-V-RIO-I-03` · **Familia de escena: marisa guardó el adjetivo «tranquilo» y** · Marisa guardó el adjetivo «tranquilo» y dejó el dato de caudal.
- `ND-V-RIO-I-04` · **Familia de escena: clara anotó la brecha en el** · Clara anotó la brecha en el cuaderno de seguimiento, no en el de calidad.
- `ND-V-RIO-I-05` · **Familia de escena: el cartel de Río Vivo señaló** · El cartel de Río Vivo señaló la referencia pendiente sin agregar un paisaje de relleno.
- `ND-V-RIO-I-06` · **Familia de escena: clara dejó un marcador en el** · Clara dejó un marcador en el punto que falta, no en el que ya pasó.
- `ND-V-RIO-I-07` · **Familia de escena: la escala de Río Vivo conservó** · La escala de Río Vivo conservó el tramo pendiente completo.
- `ND-V-RIO-I-08` · **Familia de escena: marisa preguntó si «bastante cerca» servía** · Marisa preguntó si «bastante cerca» servía. Clara señaló la referencia.
- `ND-V-RIO-I-09` · **Familia de escena: el cuaderno de Clara abrió en** · El cuaderno de Clara abrió en «caudal» y no en «calidad».
- `ND-V-RIO-I-10` · **Familia de escena: la referencia ocupó la parte alta** · La referencia ocupó la parte alta del cartel; el dato quedó abajo, sin esconderse.
- `ND-V-RIO-I-11` · **Familia de escena: clara dejó el seguimiento abierto hasta** · Clara dejó el seguimiento abierto hasta que el caudal cubra más referencia.
- `ND-V-RIO-I-12` · **Familia de escena: marisa borró «todo bien»** · Marisa borró «todo bien»; Clara le alcanzó el marcador de caudal.
- `ND-V-RIO-I-13` · **Familia de escena: el cartel mostró una brecha importante** · El cartel mostró una brecha importante y no la convirtió en una flecha decorativa.
- `ND-V-RIO-I-14` · **Familia de escena: clara hizo lugar en la agenda** · Clara hizo lugar en la agenda; la referencia aún tenía lugar en la cuenta.
- `ND-V-RIO-I-15` · **Familia de escena: la marca de caudal quedó por** · La marca de caudal quedó por debajo de la referencia, con espacio para la próxima revisión.
- `ND-V-RIO-I-16` · **Familia de escena: el lápiz de Clara se detuvo** · El lápiz de Clara se detuvo en el dato pendiente; el paisaje siguió en el fondo.
- `ND-V-RIO-I-17` · **Familia de escena: río Vivo quedó bajo la referencia** · Río Vivo quedó bajo la referencia. Clara no cambió el nombre del indicador.
- `ND-V-RIO-I-18` · **Familia de escena: marisa puso el caudal en el** · Marisa puso el caudal en el cartel y Clara guardó la nota de calidad.
- `ND-V-RIO-I-19` · **Familia de escena: la referencia quedó a la vista** · La referencia quedó a la vista; Clara quitó la palabra «normal» del rótulo.
- `ND-V-RIO-I-20` · **Familia de escena: clara dejó la carpeta de seguimiento** · Clara dejó la carpeta de seguimiento sobre la mesa y la de cierre en el estante.

## Ver el valle · cobertura grave

El humor no minimiza la proporción grande que quedó sin cubrir.

### Ciudad

- `ND-V-CIU-G-01` · **Familia de escena: sofía dejó el renglón «agua» ocupando** · Sofía dejó el renglón «agua» ocupando toda la pizarra.
- `ND-V-CIU-G-02` · **Familia de escena: tito abrió una carpeta nueva** · Tito abrió una carpeta nueva; Sofía le alcanzó la que ya estaba llena.
- `ND-V-CIU-G-03` · **Familia de escena: la mayor parte de la lista** · La mayor parte de la lista de Ciudad quedó pendiente; Tito necesitó dos clips.
- `ND-V-CIU-G-04` · **Familia de escena: sofía dejó el formulario sin doblar** · Sofía dejó el formulario sin doblar para que se viera todo lo que falta.
- `ND-V-CIU-G-05` · **Familia de escena: tito buscó el final de la** · Tito buscó el final de la lista; Sofía le mostró el reverso.
- `ND-V-CIU-G-06` · **Familia de escena: el tablón de Ciudad no tuvo** · El tablón de Ciudad no tuvo espacio libre para otro aviso de agua.
- `ND-V-CIU-G-07` · **Familia de escena: sofía marcó el faltante con una** · Sofía marcó el faltante con una línea gruesa; Tito no preguntó si era decorativa.
- `ND-V-CIU-G-08` · **Familia de escena: la carpeta de reclamos no cerró** · La carpeta de reclamos no cerró; Tito dejó de empujar la tapa.
- `ND-V-CIU-G-09` · **Familia de escena: ciudad recibió muy poca agua** · Ciudad recibió muy poca agua. El cartel de «pendiente» quedó sin lugar para la fecha.
- `ND-V-CIU-G-10` · **Familia de escena: tito se ofreció a resumir la** · Tito se ofreció a resumir la lista; Sofía le señaló que ya era el resumen.
- `ND-V-CIU-G-11` · **Familia de escena: la agenda de Sofía se llenó** · La agenda de Sofía se llenó de asuntos de agua antes del primer mate.
- `ND-V-CIU-G-12` · **Familia de escena: la pila de formularios quedó más** · La pila de formularios quedó más alta que el portapapeles de Tito.
- `ND-V-CIU-G-13` · **Familia de escena: tito fue a buscar otro clip** · Tito fue a buscar otro clip y volvió con una caja.
- `ND-V-CIU-G-14` · **Familia de escena: sofía mantuvo el renglón de agua** · Sofía mantuvo el renglón de agua en la primera página; Tito dejó de pasar hojas.
- `ND-V-CIU-G-15` · **Familia de escena: la carpeta no entró en el** · La carpeta no entró en el cajón. Tito la puso al lado, donde seguía a la vista.
- `ND-V-CIU-G-16` · **Familia de escena: ciudad quedó con un faltante grave** · Ciudad quedó con un faltante grave; la lista necesitó un señalador propio.
- `ND-V-CIU-G-17` · **Familia de escena: el espacio libre del tablón desapareció** · El espacio libre del tablón desapareció bajo otra hoja de seguimiento.
- `ND-V-CIU-G-18` · **Familia de escena: sofía colocó tres pestañas en la** · Sofía colocó tres pestañas en la carpeta; Tito preguntó si eran tres listas.
- `ND-V-CIU-G-19` · **Familia de escena: la hoja de Ciudad se acabó** · La hoja de Ciudad se acabó y Sofía siguió en una nueva.
- `ND-V-CIU-G-20` · **Familia de escena: tito sostuvo la carpeta mientras Sofía** · Tito sostuvo la carpeta mientras Sofía añadía otra página al reclamo.

### Cultivos

- `ND-V-CUL-G-01` · **Familia de escena: jacinto pasó la cuenta a una** · Jacinto pasó la cuenta a una hoja nueva y la hoja nueva también quedó llena.
- `ND-V-CUL-G-02` · **Familia de escena: la planilla de Cultivos llegó al** · La planilla de Cultivos llegó al margen; Jacinto encontró el reverso.
- `ND-V-CUL-G-03` · **Familia de escena: jacinto cerró la calculadora y abrió** · Jacinto cerró la calculadora y abrió la carpeta de pendientes.
- `ND-V-CUL-G-04` · **Familia de escena: la mayor parte de la cuenta** · La mayor parte de la cuenta quedó sin cubrir; Jacinto no necesitó un renglón extra para explicarlo.
- `ND-V-CUL-G-05` · **Familia de escena: la libreta de Jacinto recibió otra** · La libreta de Jacinto recibió otra pestaña, esta vez con fecha.
- `ND-V-CUL-G-06` · **Familia de escena: el pronóstico quedó doblado** · El pronóstico quedó doblado; la planilla abierta ocupó la mesa.
- `ND-V-CUL-G-07` · **Familia de escena: jacinto usó una hoja por cara** · Jacinto usó una hoja por cara y todavía quedó un renglón pendiente.
- `ND-V-CUL-G-08` · **Familia de escena: la cuenta de Cultivos llenó la** · La cuenta de Cultivos llenó la página. Jacinto empezó la siguiente sin cambiar el título.
- `ND-V-CUL-G-09` · **Familia de escena: el lápiz de Jacinto quedó corto** · El lápiz de Jacinto quedó corto; la lista no.
- `ND-V-CUL-G-10` · **Familia de escena: jacinto puso una pestaña en cada** · Jacinto puso una pestaña en cada página que todavía necesitaba volver a mirar.
- `ND-V-CUL-G-11` · **Familia de escena: la planilla de pendientes necesitó su** · La planilla de pendientes necesitó su propia carpeta.
- `ND-V-CUL-G-12` · **Familia de escena: jacinto ordenó la cuenta por columnas** · Jacinto ordenó la cuenta por columnas; el faltante ocupó varias.
- `ND-V-CUL-G-13` · **Familia de escena: el pronóstico quedó en la mesa** · El pronóstico quedó en la mesa de al lado; Jacinto siguió con la cuenta de hoy.
- `ND-V-CUL-G-14` · **Familia de escena: la libreta se abrió de par** · La libreta se abrió de par en par y no encontró una página vacía.
- `ND-V-CUL-G-15` · **Familia de escena: jacinto contó la parte cubierta y** · Jacinto contó la parte cubierta y guardó la calculadora antes de contar lo pendiente.
- `ND-V-CUL-G-16` · **Familia de escena: cultivos recibió muy por debajo de** · Cultivos recibió muy por debajo de lo necesario; Jacinto dejó el dato en la portada.
- `ND-V-CUL-G-17` · **Familia de escena: la página de cuentas se terminó** · La página de cuentas se terminó; Jacinto no terminó la lista.
- `ND-V-CUL-G-18` · **Familia de escena: jacinto cambió de lápiz, no de** · Jacinto cambió de lápiz, no de resultado.
- `ND-V-CUL-G-19` · **Familia de escena: la carpeta quedó gruesa de cuentas** · La carpeta quedó gruesa de cuentas y fina de buenas noticias.
- `ND-V-CUL-G-20` · **Familia de escena: jacinto guardó el pronóstico y llevó** · Jacinto guardó el pronóstico y llevó la planilla a la reunión.

### Granja

- `ND-V-GRA-G-01` · **Familia de escena: berta puso la lista en la** · Berta puso la lista en la mesa; el mate tuvo que buscar otro sitio.
- `ND-V-GRA-G-02` · **Familia de escena: la libreta de Granja ocupó la** · La libreta de Granja ocupó la silla que Berta quería usar.
- `ND-V-GRA-G-03` · **Familia de escena: berta guardó el mate hasta terminar** · Berta guardó el mate hasta terminar de señalar lo que falta.
- `ND-V-GRA-G-04` · **Familia de escena: la lista de pendientes llegó al** · La lista de pendientes llegó al reverso; Berta la giró sin levantarse.
- `ND-V-GRA-G-05` · **Familia de escena: berta usó una segunda hoja y** · Berta usó una segunda hoja y dejó la primera como índice.
- `ND-V-GRA-G-06` · **Familia de escena: el calendario de Granja tuvo más** · El calendario de Granja tuvo más marcas de agua que días sin marca.
- `ND-V-GRA-G-07` · **Familia de escena: berta apartó la taza para poder** · Berta apartó la taza para poder desplegar la lista completa.
- `ND-V-GRA-G-08` · **Familia de escena: la libreta no se cerró** · La libreta no se cerró; Berta puso una banda elástica alrededor.
- `ND-V-GRA-G-09` · **Familia de escena: la pila de hojas pendientes necesitó** · La pila de hojas pendientes necesitó otra carpeta, según Berta.
- `ND-V-GRA-G-10` · **Familia de escena: el espacio de descanso quedó ocupado** · El espacio de descanso quedó ocupado por la lista de seguimiento.
- `ND-V-GRA-G-11` · **Familia de escena: berta cambió el mate de mesa** · Berta cambió el mate de mesa; la lista viajó con ella.
- `ND-V-GRA-G-12` · **Familia de escena: el renglón de agua siguió en** · El renglón de agua siguió en primer lugar, incluso en la página siguiente.
- `ND-V-GRA-G-13` · **Familia de escena: berta puso un señalador al final** · Berta puso un señalador al final de la lista; el final todavía no llegó.
- `ND-V-GRA-G-14` · **Familia de escena: la agenda de Granja necesitó un** · La agenda de Granja necesitó un bloque para ordenar otros bloques de pendientes.
- `ND-V-GRA-G-15` · **Familia de escena: berta tachó la tarea de traer** · Berta tachó la tarea de traer una hoja; la tarea de revisar siguió abierta.
- `ND-V-GRA-G-16` · **Familia de escena: la silla libre se convirtió en** · La silla libre se convirtió en mesa auxiliar para la carpeta.
- `ND-V-GRA-G-17` · **Familia de escena: berta pidió una lista corta** · Berta pidió una lista corta; la lista necesitó una hoja corta, no un dato menor.
- `ND-V-GRA-G-18` · **Familia de escena: la taza quedó lejos del borde** · La taza quedó lejos del borde y la libreta llegó hasta el borde.
- `ND-V-GRA-G-19` · **Familia de escena: berta cerró el termo** · Berta cerró el termo; la carpeta de agua siguió abierta.
- `ND-V-GRA-G-20` · **Familia de escena: la lista ocupó la mesa completa** · La lista ocupó la mesa completa y Berta encontró otra superficie.

### Mina

- `ND-V-MIN-G-01` · **Familia de escena: rosa abrió la carpeta de faltantes** · Rosa abrió la carpeta de faltantes en la primera página y no encontró un cierre.
- `ND-V-MIN-G-02` · **Familia de escena: ferrada llevó una hoja** · Ferrada llevó una hoja; Rosa necesitó una carpeta.
- `ND-V-MIN-G-03` · **Familia de escena: el informe de Mina quedó abierto** · El informe de Mina quedó abierto en una página que no entraba en el resumen.
- `ND-V-MIN-G-04` · **Familia de escena: rosa puso una pestaña en cada** · Rosa puso una pestaña en cada hoja pendiente; Ferrada contó las pestañas.
- `ND-V-MIN-G-05` · **Familia de escena: la lista de Mina ocupó dos** · La lista de Mina ocupó dos separadores del archivo.
- `ND-V-MIN-G-06` · **Familia de escena: ferrada cerró la carpeta y la** · Ferrada cerró la carpeta y la pestaña quedó afuera como recordatorio.
- `ND-V-MIN-G-07` · **Familia de escena: rosa retiró una hoja de la** · Rosa retiró una hoja de la impresora; la carpeta todavía necesitó otra.
- `ND-V-MIN-G-08` · **Familia de escena: el informe de faltantes tuvo un** · El informe de faltantes tuvo un índice propio.
- `ND-V-MIN-G-09` · **Familia de escena: ferrada puso el resumen arriba** · Ferrada puso el resumen arriba; Rosa dejó el dato completo debajo.
- `ND-V-MIN-G-10` · **Familia de escena: la carpeta de seguimiento no entró** · La carpeta de seguimiento no entró en el cajón de asuntos cerrados.
- `ND-V-MIN-G-11` · **Familia de escena: rosa ordenó el informe de Mina** · Rosa ordenó el informe de Mina sin ordenar el faltante fuera de la página.
- `ND-V-MIN-G-12` · **Familia de escena: ferrada buscó un separador libre** · Ferrada buscó un separador libre; Rosa señaló la carpeta nueva.
- `ND-V-MIN-G-13` · **Familia de escena: el informe necesitó una copia adicional** · El informe necesitó una copia adicional; el dato no necesitó interpretación.
- `ND-V-MIN-G-14` · **Familia de escena: la pila de hojas superó la** · La pila de hojas superó la altura del sello de «revisado».
- `ND-V-MIN-G-15` · **Familia de escena: rosa dejó la carpeta abierta para** · Rosa dejó la carpeta abierta para que nadie la confundiera con archivo.
- `ND-V-MIN-G-16` · **Familia de escena: ferrada ofreció una explicación** · Ferrada ofreció una explicación; Rosa le alcanzó la lista.
- `ND-V-MIN-G-17` · **Familia de escena: la página de Mina terminó y** · La página de Mina terminó y la carpeta no.
- `ND-V-MIN-G-18` · **Familia de escena: rosa puso el informe arriba de** · Rosa puso el informe arriba de la mesa, lejos del cajón de cierre.
- `ND-V-MIN-G-19` · **Familia de escena: ferrada leyó el primer renglón y** · Ferrada leyó el primer renglón y ya no buscó el final.
- `ND-V-MIN-G-20` · **Familia de escena: la carpeta de faltantes volvió a** · La carpeta de faltantes volvió a la estantería de asuntos activos.

### Río Vivo

- `ND-V-RIO-G-01` · **Familia de escena: clara dibujó la referencia completa y** · Clara dibujó la referencia completa y dejó el caudal registrado muy abajo.
- `ND-V-RIO-G-02` · **Familia de escena: la escala de Río Vivo dejó** · La escala de Río Vivo dejó más espacio pendiente que espacio cubierto.
- `ND-V-RIO-G-03` · **Familia de escena: clara escribió «brecha grave» sin agregar** · Clara escribió «brecha grave» sin agregar un paisaje que la disimulara.
- `ND-V-RIO-G-04` · **Familia de escena: el cartel mostró la distancia a** · El cartel mostró la distancia a la referencia; Clara no achicó la regla.
- `ND-V-RIO-G-05` · **Familia de escena: clara puso el cuaderno de caudal** · Clara puso el cuaderno de caudal encima de la carpeta de titulares tentativos.
- `ND-V-RIO-G-06` · **Familia de escena: la referencia quedó alta en el** · La referencia quedó alta en el gráfico y el caudal lejos debajo.
- `ND-V-RIO-G-07` · **Familia de escena: río Vivo quedó muy por debajo** · Río Vivo quedó muy por debajo de la referencia; Clara dejó visible toda la escala.
- `ND-V-RIO-G-08` · **Familia de escena: marisa buscó un título tranquilizador** · Marisa buscó un título tranquilizador; Clara le mostró la marca del caudal.
- `ND-V-RIO-G-09` · **Familia de escena: el cartel de seguimiento no tuvo** · El cartel de seguimiento no tuvo lugar para «resuelto».
- `ND-V-RIO-G-10` · **Familia de escena: clara dejó el espacio del faltante** · Clara dejó el espacio del faltante completo, sin abreviarlo para decorar.
- `ND-V-RIO-G-11` · **Familia de escena: la línea de referencia quedó lejos** · La línea de referencia quedó lejos; Clara conservó el espacio entre ambas.
- `ND-V-RIO-G-12` · **Familia de escena: el marcador de Clara llegó al** · El marcador de Clara llegó al caudal; la regla continuó hasta la referencia.
- `ND-V-RIO-G-13` · **Familia de escena: marisa propuso recortar el cartel** · Marisa propuso recortar el cartel; Clara le pidió recortar sólo el adjetivo.
- `ND-V-RIO-G-14` · **Familia de escena: la escala mostró una brecha grave** · La escala mostró una brecha grave sin necesitar una flecha roja.
- `ND-V-RIO-G-15` · **Familia de escena: clara anotó el caudal en la** · Clara anotó el caudal en la columna correcta y dejó vacía la de conclusiones inventadas.
- `ND-V-RIO-G-16` · **Familia de escena: el gráfico terminó** · El gráfico terminó; la brecha de Río Vivo siguió ocupando la página.
- `ND-V-RIO-G-17` · **Familia de escena: clara guardó el paisaje para después** · Clara guardó el paisaje para después de mostrar el dato de referencia.
- `ND-V-RIO-G-18` · **Familia de escena: el tramo pendiente no entró en** · El tramo pendiente no entró en una etiqueta pequeña; Clara dejó la etiqueta grande.
- `ND-V-RIO-G-19` · **Familia de escena: la línea del caudal quedó a** · La línea del caudal quedó a distancia de la referencia; Clara no cambió la escala.
- `ND-V-RIO-G-20` · **Familia de escena: el cartel dejó el faltante en** · El cartel dejó el faltante en primer plano y la explicación en segundo.

## Heraldo · embalse

Sólo describir el saldo observado. Las piezas no infieren de dónde vino o a dónde fue el agua.

### Reserva en aumento

- `ND-GEN-RES-UP-01` · **Dato guardado:** El embalse terminó con más reserva — Berta pidió que el informe no la anotara como agua ya repartida.
- `ND-GEN-RES-UP-02` · **Caja fuerte:** La reserva del embalse aumentó — Tito quiso guardar la noticia bajo llave; Sofía le pidió dejar visible el saldo.
- `ND-GEN-RES-UP-03` · **Inventario:** El embalse cerró con más agua almacenada — Marisa agregó una columna de inventario y dejó vacía la de promesas.
- `ND-GEN-RES-UP-04` · **Turno:** El saldo del embalse subió — Berta reservó un turno para decidir su uso; nadie lo llamó «uso» todavía.
- `ND-GEN-RES-UP-05` · **Vocabulario:** La reserva aumentó esta estación — Clara pidió escribir «guardada», no «disponible para todo».
- `ND-GEN-RES-UP-06` · **Revisión del pizarrón:** El embalse terminó con más reserva — Jacinto borró la cuenta anterior y dejó la nueva al lado.
- `ND-GEN-RES-UP-07` · **Pronóstico:** La reserva del embalse cerró por encima del inicio — Jacinto consultó el pronóstico; el saldo igual necesitaba su propio renglón.
- `ND-GEN-RES-UP-08` · **Archivo:** El embalse recuperó parte de su reserva — Rosa guardó el dato en resultados, no en la carpeta de decisiones tomadas.
- `ND-GEN-RES-UP-09` · **Etiqueta:** El saldo almacenado aumentó — Berta puso una etiqueta con la fecha para que nadie confundiera guardado con gastado.
- `ND-GEN-RES-UP-10` · **Acta:** El embalse terminó con una reserva mayor — Tito propuso poner «ahorro» en el acta; Sofía anotó «saldo».
- `ND-GEN-RES-UP-11` · **Cuaderno:** La reserva del embalse subió — Clara añadió la medición al cuaderno y dejó la interpretación para la reunión.
- `ND-GEN-RES-UP-12` · **Calculadora:** El saldo del embalse aumentó — Jacinto cerró la suma y dejó abierta la pregunta sobre la próxima decisión.
- `ND-GEN-RES-UP-13` · **Estante:** La reserva terminó más alta que al comienzo — Rosa guardó el informe en el estante de datos, lejos del de promesas.
- `ND-GEN-RES-UP-14` · **Rótulo:** El embalse cerró con más reserva — Clara actualizó el rótulo sin agregar una fecha de gasto.
- `ND-GEN-RES-UP-15` · **Columna:** El saldo del embalse fue mayor al cierre — Marisa lo puso en la columna de almacenamiento, no en la de distribución.
- `ND-GEN-RES-UP-16` · **Reunión:** La reserva subió durante la estación — Berta llegó con una propuesta; la reunión empezó por el saldo.
- `ND-GEN-RES-UP-17` · **Copia del balance:** El embalse acumuló un saldo mayor — Ferrada pidió una copia; Rosa anotó en ambas que no era asignación sectorial.
- `ND-GEN-RES-UP-18` · **Control de edición:** La reserva del embalse aumentó — Clara borró del borrador la palabra «sobrante».
- `ND-GEN-RES-UP-19` · **Fecha de corte:** El saldo final del embalse superó el inicial — Marisa escribió las dos fechas para que la comparación no pareciera una predicción.
- `ND-GEN-RES-UP-20` · **Cierre contable:** El embalse cerró con mayor reserva — Jacinto comprobó la diferencia y no la convirtió en un pedido.

### Reserva en descenso

Elegibles sólo cuando la selección principal no atribuye la caída al titular de trade-off.

- `ND-GEN-RES-DN-01` · **Saldo usado:** El embalse terminó con menos reserva — Berta dejó el saldo de cierre en la primera línea y no inventó su destino.
- `ND-GEN-RES-DN-02` · **Columna de salida:** La reserva del embalse bajó — Marisa agregó la cifra a la columna de saldo final; no había columna de aplausos.
- `ND-GEN-RES-DN-03` · **Comparación:** El saldo final fue menor que el inicial — Jacinto revisó la resta; esta vez no buscó un redondeo amable.
- `ND-GEN-RES-DN-04` · **Acta:** El embalse cerró con menos reserva — Sofía pidió que el acta registrara la baja sin adjudicarle una causa no confirmada.
- `ND-GEN-RES-DN-05` · **Archivo abierto:** La reserva del embalse descendió — Rosa guardó el parte en asuntos que siguen abiertos.
- `ND-GEN-RES-DN-06` · **Renglón de cierre:** El saldo del embalse terminó más abajo — Berta dejó el renglón visible para la próxima decisión.
- `ND-GEN-RES-DN-07` · **Informe sin moño:** La reserva bajó durante la estación — Clara pidió publicar el saldo sin envolverlo en un adjetivo.
- `ND-GEN-RES-DN-08` · **Revisión de cuenta:** El embalse acabó con menos agua almacenada — Jacinto verificó la cuenta y dejó de revisar el título.
- `ND-GEN-RES-DN-09` · **Inventario:** La reserva final quedó por debajo de la inicial — Rosa actualizó el inventario; la carpeta de explicaciones quedó vacía.
- `ND-GEN-RES-DN-10` · **Pizarra:** El saldo del embalse disminuyó — Tito escribió «bajó» y Sofía pidió que no agregara «se arregla solo».
- `ND-GEN-RES-DN-11` · **Saldo a la vista:** El embalse cerró con una reserva menor — Clara dejó visible la comparación y guardó el borrador optimista.
- `ND-GEN-RES-DN-12` · **Titular preciso:** La reserva del embalse terminó más baja — Marisa quitó «desapareció»; la diferencia estaba en el balance, no fuera de él.
- `ND-GEN-RES-DN-13` · **Reunión siguiente:** El saldo del embalse cayó — Berta pidió que la próxima reunión empezara por la reserva, no por la decoración de la sala.
- `ND-GEN-RES-DN-14` · **Informe final:** El embalse cerró por debajo de su saldo inicial — Ferrada buscó una nota al pie; Rosa puso la comparación en el título.
- `ND-GEN-RES-DN-15` · **Papel carbón:** La reserva final disminuyó — Tito pidió una copia; Sofía se aseguró de que ambas dijeran lo mismo.
- `ND-GEN-RES-DN-16` · **Sin explicación automática:** El saldo del embalse terminó más bajo — Clara separó el dato de cualquier explicación que el balance no confirmara.
- `ND-GEN-RES-DN-17` · **Tendencia no declarada:** La reserva descendió esta estación — Marisa no tituló «tendencia» con una sola comparación.
- `ND-GEN-RES-DN-18` · **Revisión del parte:** El embalse cerró con menos reserva — Berta pidió revisar el parte antes de revisar el mantel.
- `ND-GEN-RES-DN-19` · **Número sin adorno:** La reserva final fue menor — Rosa imprimió el saldo sin adornos y Ferrada no encontró eufemismos que agregar.
- `ND-GEN-RES-DN-20` · **Seguimiento:** El embalse perdió parte de su reserva entre el inicio y el cierre — Clara anotó el saldo para seguirlo en la estación siguiente.

### Reserva estable

- `ND-GEN-RES-ST-01` · **Saldo repetido:** El embalse terminó con la misma reserva — Tito preguntó si se publicaba dos veces; Sofía dijo que con una alcanzaba.
- `ND-GEN-RES-ST-02` · **Sin variación:** El saldo de inicio y cierre coincidió — Jacinto buscó una resta y encontró cero novedades en esa cuenta.
- `ND-GEN-RES-ST-03` · **Balance:** La reserva del embalse se mantuvo estable — Marisa dejó el título sin flecha hacia arriba ni hacia abajo.
- `ND-GEN-RES-ST-04` · **Acta sin sorpresa:** El embalse cerró con el mismo saldo — Berta pidió que el acta también conservara la misma letra legible.
- `ND-GEN-RES-ST-05` · **Copia exacta:** La reserva final coincidió con la inicial — Rosa comprobó que no hubiera una página nueva escondida en la carpeta.
- `ND-GEN-RES-ST-06` · **Columna quieta:** El saldo del embalse no varió — Clara dejó la columna de comparación sin flechas.
- `ND-GEN-RES-ST-07` · **Revisión:** La reserva cerró sin cambio neto — Jacinto revisó la cuenta; el total no pidió revisión adicional.
- `ND-GEN-RES-ST-08` · **Titular austero:** El embalse mantuvo su reserva — Marisa quiso añadir «contra todo pronóstico»; Jacinto pidió el pronóstico primero.
- `ND-GEN-RES-ST-09` · **Archivo:** El saldo permaneció igual — Rosa guardó el informe en la carpeta de estabilidad, que por fin tenía contenido.
- `ND-GEN-RES-ST-10` · **Pizarrón:** La reserva del embalse no subió ni bajó — Tito dibujó una línea; Sofía le pidió que no la llamara tendencia.
- `ND-GEN-RES-ST-11` · **Cierre:** El saldo del embalse se mantuvo — Berta cerró el cuaderno y dejó abierta la conversación sobre el próximo reparto.
- `ND-GEN-RES-ST-12` · **Número duplicado:** La reserva inicial y final fue la misma — Marisa sólo tuvo que copiar el dato una vez.
- `ND-GEN-RES-ST-13` · **Sin titular de flecha:** El embalse conservó su saldo — Clara archivó los titulares que buscaban una dirección.
- `ND-GEN-RES-ST-14` · **Reunión breve:** La reserva no cambió en el balance — Tito pidió una reunión; Sofía preguntó qué novedad iba a revisar.
- `ND-GEN-RES-ST-15` · **Firma:** El embalse cerró con el mismo saldo — Ferrada firmó el parte; Rosa no encontró diferencia para señalar.
- `ND-GEN-RES-ST-16` · **Regla:** La reserva se mantuvo estable — Jacinto midió la columna dos veces; las líneas siguieron a la misma altura.
- `ND-GEN-RES-ST-17` · **Neutralidad:** El saldo del embalse permaneció igual — Clara dejó «estable» en el título sin llamarlo recuperación.
- `ND-GEN-RES-ST-18` · **Lectura de cierre:** El embalse acabó con la reserva que tenía al empezar — Berta leyó el parte sin tener que corregir la taza de nadie.
- `ND-GEN-RES-ST-19` · **Cajón de flechas:** El saldo quedó estable — Marisa guardó la flecha ascendente junto a la descendente.
- `ND-GEN-RES-ST-20` · **Registro:** La reserva no registró cambio neto — Rosa anotó «sin variación»; Ferrada preguntó si eso era toda la noticia.

## Heraldo · calidad del agua

La nota nunca equipara caudal, calidad y salud del río. La alerta es estado actual (puede ser primera medición); caída y mejora comparan mediciones y sólo se usan cuando el selector lo permite.

### Primera medición, sin historial

- `ND-GEN-QUAL-FIRST-01` · **Estreno:** La calidad del agua tiene su primera medición — Clara pidió titularla como referencia, no como mejora.
- `ND-GEN-QUAL-FIRST-02` · **Casillero nuevo:** El balance estrena una referencia de calidad — Marisa abrió un casillero para la próxima comparación.
- `ND-GEN-QUAL-FIRST-03` · **Archivo:** La primera medición de calidad ya está registrada — Rosa la guardó en la carpeta «inicio», no «recuperación».
- `ND-GEN-QUAL-FIRST-04` · **Comparación futura:** La calidad del agua tiene un primer dato — Jacinto dejó vacía la columna que todavía no se puede comparar.
- `ND-GEN-QUAL-FIRST-05` · **Primera edición:** Clara revisó la primera nota sobre calidad del agua — Le pidió a Marisa no adelantar el segundo capítulo.
- `ND-GEN-QUAL-FIRST-06` · **Punto de partida:** El balance incorporó su primera referencia de calidad — Tito quiso llamarla tendencia; Sofía le pidió más de un punto.
- `ND-GEN-QUAL-FIRST-07` · **Renglón inaugural:** La calidad del agua aparece por primera vez en el registro — Rosa anotó la fecha antes de abrir otra columna.
- `ND-GEN-QUAL-FIRST-08` · **Línea de base:** El primer dato de calidad quedó asentado — Clara pidió dejar espacio para comparar, sin completar el espacio con imaginación.
- `ND-GEN-QUAL-FIRST-09` · **Carpeta vacía:** La calidad del agua ya tiene una carpeta — Marisa guardó el primer informe y dejó la pestaña de comparación sin llenar.
- `ND-GEN-QUAL-FIRST-10` · **Referencia:** Se registró la primera referencia de calidad — Ferrada preguntó cuánto había cambiado; Clara señaló que recién empezaba el registro.
- `ND-GEN-QUAL-FIRST-11` · **Inicio de serie:** La calidad del agua sumó su primera medición — Jacinto puso «inicio» en la planilla y no una flecha.
- `ND-GEN-QUAL-FIRST-12` · **Fecha de apertura:** Clara abrió el registro de calidad — La primera fecha quedó clara; el titular no se hizo pasar por una comparación.
- `ND-GEN-QUAL-FIRST-13` · **Primera ficha:** La calidad tiene una ficha propia desde esta estación — Marisa dejó en blanco el campo «respecto de la anterior».
- `ND-GEN-QUAL-FIRST-14` · **Sin antes:** La calidad del agua quedó registrada por primera vez — Sofía pidió no escribir «mejor» donde no hay un antes.
- `ND-GEN-QUAL-FIRST-15` · **Nueva columna:** El balance abrió una columna de calidad — Jacinto revisó que el encabezado no tuviera ya una flecha.
- `ND-GEN-QUAL-FIRST-16` · **Número uno:** La primera medición de calidad entró al informe — Rosa la numeró uno; Ferrada preguntó si había una dos.
- `ND-GEN-QUAL-FIRST-17` · **Hoja inicial:** Clara sumó la calidad del agua al registro de esta estación — Marisa archivó la hoja como comienzo, no como conclusión.
- `ND-GEN-QUAL-FIRST-18` · **Punto de partida editorial:** La redacción recibió su primer dato de calidad — Clara pidió esperar otra medición antes de titular un cambio.
- `ND-GEN-QUAL-FIRST-19` · **Referencia para después:** La calidad quedó documentada por primera vez — Berta preguntó qué decía el pronóstico; Jacinto le mostró que era otra columna.
- `ND-GEN-QUAL-FIRST-20` · **Registro abierto:** El agua tiene una primera medición de calidad — Clara dejó el archivo abierto para la comparación futura.

### Calidad en alerta

- `ND-GEN-QUAL-ALERT-01` · **Alerta actual:** La calidad del agua está en zona de alerta — Clara dejó el folleto en pausa y abrió el informe.
- `ND-GEN-QUAL-ALERT-02` · **Titular prioritario:** La calidad del agua está en alerta — Sofía movió el acto de prensa detrás de la lectura del análisis.
- `ND-GEN-QUAL-ALERT-03` · **Adjetivo suspendido:** La medición de calidad está en alerta — Clara retiró «cristalina» del borrador sin discutir tipografía.
- `ND-GEN-QUAL-ALERT-04` · **Informe primero:** La calidad del agua entra en zona de alerta — Rosa puso el resultado arriba; Ferrada dejó el discurso para después.
- `ND-GEN-QUAL-ALERT-05` · **Folleto detenido:** La calidad está en alerta esta estación — Marisa frenó la impresión del folleto hasta revisar el dato.
- `ND-GEN-QUAL-ALERT-06` · **Estado, no promesa:** El indicador de calidad quedó en alerta — Clara pidió describir el estado sin prometer cómo sigue.
- `ND-GEN-QUAL-ALERT-07` · **Lectura técnica:** La calidad del agua marca alerta — Berta guardó su propuesta de eslogan y preguntó qué decía el análisis.
- `ND-GEN-QUAL-ALERT-08` · **Portada sobria:** La calidad está en zona de alerta — Marisa eligió una portada sin adjetivos que taparan el dato.
- `ND-GEN-QUAL-ALERT-09` · **Revisión del comunicado:** La medición de calidad quedó en alerta — Rosa le devolvió el comunicado a Ferrada para corregir «todo bien».
- `ND-GEN-QUAL-ALERT-10` · **Prioridad de redacción:** La calidad del agua está en alerta — Clara pidió el primer turno de lectura y dejó el paisaje para el reverso.
- `ND-GEN-QUAL-ALERT-11` · **Dato principal:** La alerta de calidad ocupó el primer renglón — Tito quiso sumar una explicación; Sofía le pidió no adelantarse al informe.
- `ND-GEN-QUAL-ALERT-12` · **Sin eslogan:** La calidad del agua está en zona de alerta — Clara dejó el eslogan fuera de una nota que debía informar el estado.
- `ND-GEN-QUAL-ALERT-13` · **Tinta roja:** El estado de calidad entró en alerta — Jacinto subrayó el término; Marisa comprobó que no fuera una corrección de suma.
- `ND-GEN-QUAL-ALERT-14` · **Ronda de revisión:** La calidad del agua está en alerta — Clara abrió la ronda de revisión antes que la de titulares.
- `ND-GEN-QUAL-ALERT-15` · **Informe visible:** La medición de calidad requiere atención — Rosa dejó visible el informe; Ferrada no lo reemplazó con una declaración.
- `ND-GEN-QUAL-ALERT-16` · **Edición cuidadosa:** La calidad está en zona de alerta — Marisa quitó un adjetivo optimista y mantuvo el dato sin adornos.
- `ND-GEN-QUAL-ALERT-17` · **Reunión breve:** El indicador de calidad marca alerta — Clara pidió una reunión breve para leer resultados, no para inventar conclusiones.
- `ND-GEN-QUAL-ALERT-18` · **Pausa editorial:** La calidad del agua quedó en alerta — Berta propuso pausar los anuncios y revisar primero la información disponible.
- `ND-GEN-QUAL-ALERT-19` · **Estado confirmado:** La calidad está en zona de alerta — Marisa confirmó el estado; Clara evitó presentarlo como una novedad pasajera.
- `ND-GEN-QUAL-ALERT-20` · **Análisis en portada:** La alerta de calidad desplazó al eslogan — Clara dijo que el análisis ya tenía suficiente título.

### Calidad estable

- `ND-GEN-QUAL-ST-01` · **Sin flecha:** La calidad del agua se mantuvo estable — Marisa archivó las flechas hacia arriba y abajo.
- `ND-GEN-QUAL-ST-02` · **Mismo estado:** La medición de calidad no cambió — Tito propuso «sin novedad»; Clara dijo que estabilidad también se registra.
- `ND-GEN-QUAL-ST-03` · **Verbo sobrio:** La calidad se mantuvo — Rosa dejó «se mantiene» en el título y guardó «mejora» para cuando corresponda.
- `ND-GEN-QUAL-ST-04` · **Columna quieta:** El indicador de calidad permaneció estable — Jacinto revisó que la columna no tuviera una flecha dibujada por costumbre.
- `ND-GEN-QUAL-ST-05` · **Acta:** La calidad del agua cerró sin variación — Sofía pidió una sola anotación; el acta no necesitaba una discusión sobre el verbo.
- `ND-GEN-QUAL-ST-06` · **Archivo de titulares:** La calidad se mantuvo en el mismo estado — Marisa guardó dos títulos que se habían preparado para una suba o una baja.
- `ND-GEN-QUAL-ST-07` · **Revisión:** El dato de calidad se mantuvo estable — Clara revisó el análisis; no encontró una mejora escondida en el adjetivo.
- `ND-GEN-QUAL-ST-08` · **Sin novedad inventada:** La calidad no registró cambios — Berta preguntó si eso era una noticia. Clara respondió que sí, si era lo que pasó.
- `ND-GEN-QUAL-ST-09` · **Cierre de edición:** La medición de calidad se mantuvo — Rosa cerró el borrador sin adjudicarle una causa al resultado.
- `ND-GEN-QUAL-ST-10` · **Cero flechas:** La calidad quedó estable entre mediciones — Tito dibujó una flecha horizontal; Sofía pidió que no la llamara recuperación.
- `ND-GEN-QUAL-ST-11` · **Resumen:** La calidad del agua permaneció igual — Ferrada pidió un resumen; Rosa escribió «se mantuvo» y entregó la hoja.
- `ND-GEN-QUAL-ST-12` · **Dos columnas:** La medición de calidad coincidió con la anterior — Jacinto comprobó las columnas y dejó la calculadora cerrada.
- `ND-GEN-QUAL-ST-13` · **Vocabulario:** La calidad del agua se mantuvo estable — Clara descartó «avanzó» porque el dato no avanzó.
- `ND-GEN-QUAL-ST-14` · **Portada:** La calidad cerró sin cambio respecto de la medición previa — Marisa no necesitó elegir entre los titulares de subida y caída.
- `ND-GEN-QUAL-ST-15` · **Nota simple:** El indicador de calidad se mantuvo — Berta leyó el título y no encontró una sorpresa que el balance no tuviera.
- `ND-GEN-QUAL-ST-16` · **Control de edición:** La calidad permaneció estable — Rosa dejó intacto el verbo «mantener» y revisó otra página.
- `ND-GEN-QUAL-ST-17` · **Comparación cerrada:** La calidad no subió ni bajó — Clara archivó la comparación sin convertirla en una flecha.
- `ND-GEN-QUAL-ST-18` · **Parte de estado:** El registro mostró calidad estable — Marisa puso «estable» en el encabezado para no confundirlo con «resuelto».
- `ND-GEN-QUAL-ST-19` · **Lectura del día:** La calidad se sostuvo en el mismo nivel — Tito preguntó qué había cambiado; Sofía señaló el título: nada.
- `ND-GEN-QUAL-ST-20` · **Firma:** La calidad cerró estable — Ferrada firmó el parte sin pedir una conclusión que el dato no daba.

### Calidad en descenso (sin estar en alerta)

- `ND-GEN-QUAL-DN-01` · **Comparación:** La calidad del agua bajó frente a la medición anterior — Clara puso ambas mediciones en el informe, sin atribuir una causa.
- `ND-GEN-QUAL-DN-02` · **Verbo directo:** La medición de calidad descendió — Rosa reemplazó «cambió» por «bajó»; Ferrada no encontró un eufemismo mejor.
- `ND-GEN-QUAL-DN-03` · **Titular revisado:** La calidad retrocedió respecto de la estación anterior — Marisa guardó la foto y dejó el dato en portada.
- `ND-GEN-QUAL-DN-04` · **Dos mediciones:** El registro de calidad quedó por debajo del anterior — Jacinto comprobó la resta, no una explicación causal.
- `ND-GEN-QUAL-DN-05` · **Análisis primero:** La calidad del agua disminuyó — Clara pidió leer la comparación antes de discutir los adjetivos.
- `ND-GEN-QUAL-DN-06` · **Nota sin diagnóstico extra:** La calidad bajó respecto de la medición previa — Sofía pidió no titular algo que el análisis no había medido.
- `ND-GEN-QUAL-DN-07` · **Renglón comparativo:** El indicador de calidad descendió — Marisa dejó el renglón anterior al lado para que la diferencia se entendiera sola.
- `ND-GEN-QUAL-DN-08` · **Corrección de portada:** La calidad quedó por debajo de la medición anterior — Clara cambió la portada y no inventó el motivo.
- `ND-GEN-QUAL-DN-09` · **Sin paisaje de relleno:** La medición de calidad bajó — Rosa quitó una foto que no aportaba información a la comparación.
- `ND-GEN-QUAL-DN-10` · **Suma aparte:** La calidad disminuyó entre mediciones — Jacinto guardó la calculadora: la comparación no era una cuenta de riego.
- `ND-GEN-QUAL-DN-11` · **Seguimiento:** El indicador de calidad retrocedió — Clara anotó el cambio para seguirlo, sin presentarlo como alerta si no corresponde.
- `ND-GEN-QUAL-DN-12` · **Borrador sin causa:** La calidad del agua bajó — Marisa dejó en blanco la casilla de causa, que el balance no especifica.
- `ND-GEN-QUAL-DN-13` · **Revisión editorial:** La medición de calidad descendió respecto de la previa — Ferrada propuso «bache»; Rosa conservó el dato.
- `ND-GEN-QUAL-DN-14` · **Comparación honesta:** La calidad terminó por debajo de su medición anterior — Clara evitó llamar «crisis» a un descenso fuera de la alerta.
- `ND-GEN-QUAL-DN-15` · **Línea del tiempo:** La calidad bajó desde la última medición — Marisa mostró el orden temporal y no dibujó una causa.
- `ND-GEN-QUAL-DN-16` · **Edición:** El resultado de calidad fue menor que el anterior — Sofía pidió que la bajada del dato no se suavizara en la redacción.
- `ND-GEN-QUAL-DN-17` · **Hoja de control:** La calidad del agua retrocedió — Rosa anotó el descenso en la hoja de control; Ferrada no lo trasladó al pronóstico.
- `ND-GEN-QUAL-DN-18` · **Nota al consejo:** La medición de calidad disminuyó — Clara informó el cambio y dejó la causa como pregunta abierta.
- `ND-GEN-QUAL-DN-19` · **Bajada precisa:** La calidad quedó más baja que en la estación anterior — Marisa añadió «comparada con»; el título ya no parecía una predicción.
- `ND-GEN-QUAL-DN-20` · **Punto de comparación:** El indicador de calidad bajó — Clara conservó la medición anterior junto a la actual; el informe no tenía memoria selectiva.

### Calidad en recuperación (con comparación)

- `ND-GEN-QUAL-UP-01` · **Mejora observada:** La calidad del agua mejoró respecto de la medición anterior — Clara celebró el cambio sin titularlo como problema resuelto.
- `ND-GEN-QUAL-UP-02` · **Verbo permitido:** La medición de calidad subió — Rosa dejó «mejoró» en el titular y guardó «normalizada».
- `ND-GEN-QUAL-UP-03` · **Comparación:** La calidad cerró por encima del registro anterior — Jacinto cotejó las dos mediciones y cerró la calculadora.
- `ND-GEN-QUAL-UP-04` · **Buena noticia medida:** La calidad del agua mejoró — Marisa publicó la buena noticia sin prometer qué ocurrirá después.
- `ND-GEN-QUAL-UP-05` · **Revisión de Clara:** El indicador de calidad se recuperó frente a la medición previa — Clara aprobó «recuperó terreno», no «se resolvió».
- `ND-GEN-QUAL-UP-06` · **Línea ascendente:** La calidad mejoró entre mediciones — Tito dibujó una flecha; Sofía le pidió que no la extendiera más allá del dato.
- `ND-GEN-QUAL-UP-07` · **Edición sobria:** La medición de calidad subió respecto de la anterior — Rosa dejó el cambio en la portada y la promesa fuera.
- `ND-GEN-QUAL-UP-08` · **Comparación archivada:** El registro de calidad mostró una mejora — Clara guardó ambas mediciones, por si alguien confundía mejora con cierre.
- `ND-GEN-QUAL-UP-09` · **Suma no necesaria:** La calidad subió — Jacinto confirmó que la noticia era una comparación, no una asignación.
- `ND-GEN-QUAL-UP-10` · **Parte favorable:** El indicador de calidad mejoró — Ferrada quiso agregar un discurso; Rosa dejó que la comparación hablara.
- `ND-GEN-QUAL-UP-11` · **Cambio registrado:** La calidad quedó por encima de la medición previa — Marisa puso la fecha de ambas para que «mejoró» tuviera contexto.
- `ND-GEN-QUAL-UP-12` · **Titular breve:** La calidad del agua se recuperó — Clara aceptó la frase y mantuvo abierta la revisión futura.
- `ND-GEN-QUAL-UP-13` · **Buen verbo:** La medición de calidad avanzó — Rosa cambió «excelente» por «mejoró»; el dato no necesitaba un adjetivo extra.
- `ND-GEN-QUAL-UP-14` · **Revisión del acta:** La calidad subió respecto de la estación anterior — Sofía corrigió «listo» por «mejor», una palabra más fiel.
- `ND-GEN-QUAL-UP-15` · **Dos hojas:** La calidad mejoró — Clara dejó la medición previa y la actual en dos hojas separadas, para que ninguna borrara a la otra.
- `ND-GEN-QUAL-UP-16` · **Ronda de edición:** La calidad del agua mostró una mejora — Marisa leyó el título; Clara permitió un punto, no un punto final.
- `ND-GEN-QUAL-UP-17` · **Informe comparativo:** El registro actual de calidad superó al anterior — Rosa escribió «recuperación» y no «garantía».
- `ND-GEN-QUAL-UP-18` · **Noticia sin promesa:** La medición de calidad aumentó — Clara aprobó una buena noticia que todavía dejaba lugar al seguimiento.
- `ND-GEN-QUAL-UP-19` · **Fecha y dato:** La calidad subió en esta comparación — Jacinto puso ambas fechas en la planilla; la mejora dejó de parecer una predicción.
- `ND-GEN-QUAL-UP-20` · **Cierre abierto:** La calidad del agua mejoró frente al dato previo — Clara cerró la edición y mantuvo abierto el tema.











