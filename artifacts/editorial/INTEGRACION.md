# Integración del banco aprobado

Revisión integrada el 9 de octubre de 2026, con autorización del usuario para incorporar el banco y ajustar las frases durante las pruebas. `src/game/ApprovedEditorial.json` contiene 297 piezas: 199 parejas nuevas para Heraldo, 80 carteles V, 16 escenas A-MAP revisadas y dos parejas anteriores expresamente conservadas. R-H-15 se excluye. Titulares y bajadas se seleccionan como parejas. Fuente vigente: `PropuestaRevisionEditorial.md`; regenerador: `prepare-revision.cjs`.

- Cobertura completa exige una tasa de al menos 1. Las bandas editoriales de faltante no cambian fórmulas ni veredictos del motor.
- Los textos que afirman mejora requieren comparación con el resultado anterior. V-MIN-03, que dice «llegó más», requiere además mayor suministro real. La banda parcial tiene variantes propias desde la primera estación, aunque no exista historial.
- Los eventos muestran la decisión registrada. Las instrucciones editoriales de sus bajadas no aparecen como texto al jugador.
- El carpincho en una escena del valle requiere su evento registrado. Caudal suficiente no prueba calidad ni salud alta.
- A-MAP-26 puede aparecer en el cartel de Ciudad cuando el embalse cierra con más reserva que al inicio. La versión abreviada ya no menciona un pedido anterior de Tito.
- Calidad y salud del río separan primer resultado, estabilidad, alerta, caída y mejora. Las opciones reales de eventos seleccionan bajadas propias sin instrucciones editoriales ni costos técnicos agregados. Sin pieza compatible, se omite la breve y los datos quedan disponibles en el resumen.
- La selección editorial tiene PRNG propio, sin llamadas al PRNG del motor. El resumen mantiene su tono e incorpora una fila compacta con las cinco coberturas; el río se identifica como caudal ecológico.

Validación de esta revisión: build y TypeScript; 54 tests generales/editoriales y 9 de mapa e inspección. Incluyen conservación, determinismo y tres escenarios de 20 turnos, contexto de las opciones editoriales y casos parciales sin historial. Servidor Vite levantado y respuesta HTTP comprobada en localhost:3000. No se realizó una nueva inspección visual de esta revisión ni pruebas con estudiantes o dispositivos escolares.
