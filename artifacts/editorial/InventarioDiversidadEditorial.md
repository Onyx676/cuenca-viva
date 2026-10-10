# Inventario de variedad editorial · Cuenca Viva

Este inventario acompaña [la propuesta de diversidad editorial](PropuestaDiversidadEditorial.md). Todo el contenido es una propuesta; no cambia `ApprovedEditorial.json` ni los selectores.

## Cobertura de esta entrega

| Producto | Condición | Cantidad propuesta | División |
|---|---|---:|---|
| Heraldo | Cobertura completa | 100 parejas | 20 para cada uno de los 5 sectores |
| Heraldo | Casi completa | 100 parejas | 20 por sector, válida desde el primer turno |
| Heraldo | Insuficiente | 100 parejas | 20 por sector |
| Heraldo | Grave | 100 parejas | 20 por sector |
| Heraldo | Embalse sube, baja o estable | 60 parejas | 20 por estado, tema general |
| Heraldo | Calidad inicial, alerta, estable, caída o recuperación | 100 parejas | 20 por estado, tema general |
| Ver el valle | Cobertura completa, casi completa, insuficiente o grave | 400 carteles | 20 por condición y sector |
| **Total** |  | **960 piezas** | **560 parejas de Heraldo + 400 carteles** |

Las condiciones de cobertura son las que usa el juego: Ciudad, Cultivos, Granja y Mina: completa = 100%, casi completa = 80%–<100%, insuficiente = 50%–<80%, grave = <50%. Río Vivo: completa = 100% de la referencia ecológica, casi completa = 75%–<100%, insuficiente = 55%–<75%, grave = <55%.

## Mapeo propuesto de IDs

Los IDs `ND-*` son etiquetas legibles de revisión y no se insertan directamente en los pools. Para evitar colisiones con los IDs actuales, el coordinador puede asignar estos rangos finales:

| Pool | Condición | Sufijos propuestos |
|---|---|---|
| Heraldo por sector (`P-CIU/CUL/GRA/MIN/RIO`) | Completa | 24–43 |
| Heraldo por sector | Casi completa, sin comparación | 44–63 |
| Heraldo por sector | Insuficiente | 64–83 |
| Heraldo por sector | Grave | 84–103 |
| Ver el valle por sector (`V-CIU/CUL/GRA/MIN/RIO`) | Completa | 17–36 |
| Ver el valle por sector | Casi completa, sin comparación | 37–56 |
| Ver el valle por sector | Insuficiente | 57–76 |
| Ver el valle por sector | Grave | 77–96 |
| Heraldo general (`P-GEN`) | Calidad inicial / alerta / estable / caída / recuperación | 57–76 / 77–96 / 97–116 / 117–136 / 137–156 |
| Heraldo general (`P-GEN`) | Reserva sube / baja / estable | 157–176 / 177–196 / 197–216 |

En el mapa, los IDs aprobados terminan con el número que participa en `variant = Number(id.slice(-2)) % 3`; los rangos sugeridos conservan ese cálculo sin reutilizar los IDs actuales `V-*-01..16`. Las categorías de mejora relativa mantienen sus IDs y condiciones comparativas actuales; no se mezclan con estos pools de estado presente.

## Familias de humor

En Heraldo, el descriptor en negrita después del ID y, en el mapa, «Familia de escena» son **etiquetas editoriales provisionales**, no una validación de que cada gag sea distinto. Antes de convertirlas al campo opcional `family`, hay que agrupar las situaciones semánticamente: una misma familia puede abarcar varias redacciones y cambios de personaje. No asignar una familia distinta sólo porque cambia el nombre del objeto o del personaje. Cada pareja debe mantener un solo giro: el titular presenta la situación y la bajada la completa. Los carteles usan una acción u objeto visible como núcleo y una segunda frase sólo cuando hace falta cerrar el remate.

La taxonomía propuesta separa: burocracia y archivo; hábitos personales; clima y pronóstico; rutina de trabajo; objetos; malentendido literal; contraste de escala; observación social; edición periodística; medida ecológica; exageración; anticlímax; y pausa cotidiana. Los IDs con el mismo sufijo en dos sectores no garantizan la misma familia: se deben revisar por el texto, no por el número.

### Familias que requieren revisión humana

- **Formulario, lista, carpeta, reclamo, agenda y reunión:** revisar en conjunto las series de Ciudad (`ND-H-CIU-*`, `ND-V-CIU-*`). Varias redacciones pueden ser el mismo gag administrativo.
- **Planilla, cuenta, pronóstico y cálculo:** revisar Cultivos (`ND-H-CUL-*`, `ND-V-CUL-*`); no contar una planilla, un renglón y una libreta como tres familias si el remate es sólo «sigue pendiente».
- **Mate, descanso, lista y visita:** revisar Granja (`ND-H-GRA-*`, `ND-V-GRA-*`); separar situaciones por giro, no por cambiar taza, agenda o silla.
- **Informe, carpeta, corrección y archivo:** revisar Mina (`ND-H-MIN-*`, `ND-V-MIN-*`) para que «Rosa edita el informe» no cubra la mayoría de las variantes.
- **Mapa, medición, título y corrección:** revisar Río Vivo (`ND-H-RIO-*`, `ND-V-RIO-*`). No repetir la misma corrección editorial con palabras nuevas.
- **Acta, columna, archivo y reunión:** revisar Embalse y Calidad (`ND-GEN-*`) contra los mismos gags administrativos ya usados en sectores.

Estas etiquetas no deben pasarse al ledger hasta consolidar las familias. Si dos piezas cuentan la misma situación con otro texto, deben compartir `family` para que el ledger pueda reconocer la repetición.

## Condiciones reales del selector a preservar

- `coverageBand` conserva los límites de arriba; no se modifica balance ni se inventan umbrales.
- `sectorArticle` selecciona exclusivamente el sector y la banda actuales. Para cobertura parcial, las variantes de estado actual no necesitan historial. Las de mejora relativa sólo se añaden cuando hay un turno anterior y la cobertura subió.
- `mapStory` también separa las bandas actuales. Su pieza parcial base funciona sin historial; `V-*-03` tiene las condiciones vigentes para comparar cobertura y suministro, y las piezas de mejora requieren historial. La pieza heredada de Mina mantiene su condición de suministro cuando corresponda. Al mapear cada `ND-V-...-NN` al ID aprobado, se conserva el sufijo numérico final porque `mapStory` lo usa para elegir la variante visual.
- `pickEditorial` recibe IDs, turno, semilla y tema, usa `SeededRandom` propio de editorial y mantiene un ledger de IDs y familias recientes. Las propuestas pueden declarar `family` como campo de metadatos existente; no deben consumir PRNG de gameplay.
- Las parejas del Heraldo deben conservar `headline` y `subhead`, `text` vacío y `optionId` vacío en las piezas que no son eventos. Los carteles V conservan `text` y no requieren titular o bajada. Los IDs `ND-*` de este documento son IDs de revisión, no están en el banco activo.

Veinte IDs propuestos no equivalen necesariamente a veinte gags distintos ni garantizan diez aperturas diferentes entre diez partidas. La elección depende del pool compatible y del ledger; el ledger reduce repeticiones recientes cuando quedan alternativas elegibles, pero puede repetir una familia si no queda otra pieza compatible. La semilla conserva reproducibilidad para el mismo estado; dos semillas distintas pueden producir el mismo texto. Forzar aperturas distintas requeriría coordinación adicional fuera de esta propuesta.

## Huecos que quedan para una integración posterior

1. Los IDs `ND-H-*` y `ND-V-*` aún no tienen formato de ID aprobado. La integración debe convertirlos a IDs aceptados y añadirlos a los pools elegibles sin cambiar los disparadores. Debe llevar también el descriptor de cada pieza al metadato `family`.
2. El banco de Heraldo actual permite cuatro piezas por sector para completa, seis para parcial actual, cuatro para insuficiente, cuatro para grave y cinco de mejora residual. La propuesta amplía las cuatro bandas de estado actual a veinte por sector; las piezas comparativas siguen siendo un pool aparte.
3. `basinHealth` tiene rutas editoriales y es un indicador distinto de calidad del agua y de caudal ecológico. No se amplía aquí; una futura solicitud deberá darle sus estados y variantes propios.
4. Ver el valle no selecciona noticias generales de embalse o calidad. La llamada a `mapStory` incorpora una escena heredada de reserva en aumento sólo para Ciudad; no equivale a un pool general de reserva, ni hay disparador de mapa para calidad. Esos dos temas se proponen sólo para el Heraldo.
5. El banco mantiene alternativas de eventos por `optionId`. Este encargo no amplía esos eventos ni sus hechos; las opciones deben seguir describiéndose sólo cuando estén registradas en el balance.
6. En calidad, la alerta actual tiene prioridad sobre comparación: puede ser el primer registro y no se presenta como caída o recuperación cuando el valor está dentro de la banda de alerta. La pieza de primera medición se usa sin historial cuando no prevalece la alerta; estable, caída y recuperación necesitan comparación válida.
7. La variación entre partidas depende de la semilla y del pool compatible; semillas distintas pueden repetir una pieza. El tamaño del pool sólo aporta alternativas potenciales. El ledger puede reducir repeticiones recientes, no garantizar aperturas distintas.

## Exclusiones editoriales registradas

- No usar como alternativas nuevas la escena del perro con el grupo silenciado de Sofía.
- No reciclar el chiste de Rosa sacándole una foto a Ferrada.
- No usar «Clara no tuvo que corregir “casi” en el cartel» ni una reformulación de ese mismo gag.
- No decir «suficiente», «resuelto», «completo» o «llegó» para una cobertura menor a 100%.
- No tratar una mejora como cobertura completa ni afirmar calidad limpia por tener caudal ecológico.
- No escribir una causa para el saldo del embalse o el cambio de calidad si no la confirma el balance.
- No cambiar la voz aprobada del resumen de la estación.

## Verificación documental

Los conteos de piezas se verificaron contra los IDs ND del banco propuesto. No se ejecutaron build ni tests: la entrega sólo agrega documentos editoriales de revisión.
