# Integración del banco aprobado

**Estado actual:** 1.257 piezas en runtime: las 297 anteriores y la ampliación completa de 960, autorizada por el usuario el 9 de octubre de 2026. Las secciones siguientes conservan el historial de las revisiones; la integración más reciente se describe al final.

Revisión integrada el 9 de octubre de 2026, con autorización del usuario para incorporar el banco y ajustar las frases durante las pruebas. `src/game/ApprovedEditorial.json` contiene 297 piezas: 199 parejas nuevas para Heraldo, 80 carteles V, 16 escenas A-MAP revisadas y dos parejas anteriores expresamente conservadas. R-H-15 se excluye. Titulares y bajadas se seleccionan como parejas. Fuente vigente: `PropuestaRevisionEditorial.md`; regenerador: `prepare-revision.cjs`.

- Cobertura completa exige una tasa de al menos 1. Las bandas editoriales de faltante no cambian fórmulas ni veredictos del motor.
- Los textos que afirman mejora requieren comparación con el resultado anterior. V-MIN-03, que dice «llegó más», requiere además mayor suministro real. La banda parcial tiene variantes propias desde la primera estación, aunque no exista historial.
- Los eventos muestran la decisión registrada. Las instrucciones editoriales de sus bajadas no aparecen como texto al jugador.
- El carpincho en una escena del valle requiere su evento registrado. Caudal suficiente no prueba calidad ni salud alta.
- A-MAP-26 puede aparecer en el cartel de Ciudad cuando el embalse cierra con más reserva que al inicio. La versión abreviada ya no menciona un pedido anterior de Tito.
- Calidad y salud del río separan primer resultado, estabilidad, alerta, caída y mejora. Las opciones reales de eventos seleccionan bajadas propias sin instrucciones editoriales ni costos técnicos agregados. Sin pieza compatible, se omite la breve y los datos quedan disponibles en el resumen.
- La selección editorial tiene PRNG propio, sin llamadas al PRNG del motor. El resumen mantiene su tono e incorpora una fila compacta con las cinco coberturas; el río se identifica como caudal ecológico.

Validación de esta revisión: build y TypeScript; 54 tests generales/editoriales y 9 de mapa e inspección. Incluyen conservación, determinismo y tres escenarios de 20 turnos, contexto de las opciones editoriales y casos parciales sin historial. Servidor Vite levantado y respuesta HTTP comprobada en localhost:3000. No se realizó una nueva inspección visual de esta revisión ni pruebas con estudiantes o dispositivos escolares.

## Variedad entre partidas — 9 de octubre de 2026

Cada partida efectiva recibe ahora un ordinal editorial local, independiente de la semilla de gameplay. El contador avanza al entrar en la partida; abrir Aula, iniciar el tutorial, recargar o continuar no lo incrementa. Si el almacenamiento falla, conserva variedad en memoria durante la sesión de la aplicación. El ordinal se guarda como campo opcional del paquete de recuperación, fuera de `GameState`, snapshot y registro de acciones. Continuar conserva la selección editorial; las copias anteriores sin ese campo usan ordinal cero y siguen siendo compatibles.

Las aperturas rotan una bolsa común para evitar que una nueva partida con la misma semilla empiece siempre con el mismo texto. Se agrupan también las variantes cercanas por familia: los cuatro textos de Ciudad sobre el grupo y el perro alternan con las dos alternativas aprobadas. Por eso algunas alternativas pueden reutilizarse antes que otra redacción del mismo chiste. Dentro de una partida, las elecciones se reconstruyen desde el historial y evitan familias consecutivas cuando existe otra pieza compatible.

En esa revisión el banco de runtime todavía tenía **297 piezas** y la propuesta de ampliación de **960 piezas** (560 de Heraldo y 400 del valle) quedaba pendiente de aprobación. Esa autorización y su integración se registran en la sección siguiente.

Validación final informada por el coordinador: **65 tests de npm, 3 comprobaciones de handlers del valle, build y TypeScript aprobados**. Los tests editoriales comprueban cinco aperturas distintas con igual semilla, ausencia de perro en aperturas consecutivas, recuperación estable, historial de veinte turnos y ausencia de cambios en el estado o PRNG de gameplay. **La inspección visual de esta corrección queda pendiente.**

## Ampliación completa autorizada — 9 de octubre de 2026

Se integraron las **960 piezas de `PropuestaDiversidadEditorial.md`**: 560 parejas inseparables para Heraldo y 400 carteles para Ver el valle. `InventarioDiversidadEditorial.md` define el mapeo de los IDs de revisión a rangos nuevos, sin colisiones. Cada pieza conserva `reviewId` y su texto exacto; ninguna frase fue redactada o reescrita durante la integración. No se excluyó ninguna de las 960 piezas. El banco suma **1.257 piezas**, con las 297 anteriores preservadas; V-RIO-12 sigue excluida del selector por rechazo previo del usuario.

Las cuatro bandas por sector utilizan como base los nuevos pools de veinte piezas. Las piezas antiguas comparativas siguen exigiendo una mejora real; los extras heredados sólo se conservan para contextos registrados de carpincho o reserva recuperada en Ciudad. Los carteles habituales anteriores del perro y la foto de Ferrada ya no forman parte de los pools base. Heraldo utiliza los nuevos pools también en portada: Ciudad para un buen resultado, el sector de menor cobertura productiva para el resultado normal y reserva en descenso para el trade-off cuando el saldo del embalse realmente baja. Calidad conserva prioridad de alerta y comparación con la medición previa; salud del río y eventos mantienen sus rutas independientes.

**Doce piezas tienen guardas adicionales, sin modificar sus textos:**

- Mejora de cobertura: ND-H-RIO-P-03/07/13/18 y ND-V-RIO-P-10 requieren un registro previo y cobertura mayor. Sin ese contexto quedan 16 piezas de Heraldo y 19 del valle para Río Vivo casi completo.
- Mayoría sin cubrir: ND-H-RIO-G-04/08/15/18 y ND-V-RIO-G-02 requieren cobertura menor al 50%. Para una cobertura del río de 50%–<55%, la banda sigue siendo grave, pero quedan 16 piezas de Heraldo y 19 del valle.
- Ingreso en alerta: ND-GEN-QUAL-ALERT-04/13 requieren calidad previa de al menos 60 y calidad actual menor a 60. La alerta inicial o persistente dispone de las otras 18 piezas.

Veinte piezas por pool **no equivalen a veinte gags distintos ni a veinte opciones compatibles con cualquier historial**. Los metadatos de familia agrupan patrones temáticos mediante reglas sobre las bajadas y los carteles, como mate y descanso, cuentas o archivo. Es una clasificación amplia que todavía requiere revisión humana de los remates: por ejemplo, 16 de los 20 carteles completos de Granja giran alrededor del mate y el descanso, y 11 de los 20 de Cultivos alrededor de las cuentas. El ledger evita familias recientes cuando quedan alternativas y puede reutilizar una alternativa antes de volver a una redacción parecida. El contador editorial entre partidas y la recuperación se conservan fuera de la simulación.

Regeneración reproducible desde la raíz del repositorio: `node artifacts/editorial/prepare-approved.cjs`. El regenerador combina la revisión anterior y `prepare-diversity.cjs`; verifica 960 IDs de revisión y 1.257 IDs finales únicos. Los tests comprueban igualdad exacta con las fuentes, veinte piezas por pool con sus condiciones pertinentes, las doce guardas, variedad entre cinco partidas, recuperación, consultas repetidas y ausencia de cambios de gameplay.

Validación final informada por el coordinador: **68 tests de npm, 3 comprobaciones de handlers del valle y build aprobados**; el build incluye la comprobación de TypeScript. **La inspección visual de esta ampliación queda pendiente** y no se ejecutaron pruebas con estudiantes.
