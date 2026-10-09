# Integración del banco aprobado

Se conservan 104 piezas con sus identificadores y redacción aprobada en `src/game/ApprovedEditorial.json`. R-H-15 se excluye. Titulares y bajadas se seleccionan como parejas.

- Cobertura completa exige una tasa de al menos 1. Las bandas editoriales de faltante no cambian fórmulas ni veredictos del motor.
- Los textos que afirman mejora requieren comparación con el resultado anterior. “Llegó más” requiere además mayor volumen recibido; una demanda menor puede mejorar cobertura sin aumentar suministro.
- Los eventos muestran la decisión registrada. Las instrucciones editoriales de sus bajadas no aparecen como texto al jugador.
- El carpincho en una escena del valle requiere su evento registrado. Caudal suficiente no prueba calidad ni salud alta.
- A-MAP-26 puede aparecer en el cartel de Ciudad cuando el embalse cierra con más reserva que al inicio. El usuario autorizó tratar el pedido anterior de Tito como parte del diálogo ficticio, sin convertirlo en una acción registrada ni un efecto del motor.
- Cuando no hay una pieza aprobada compatible, se mantiene una explicación factual breve. Algunas categorías tienen una sola alternativa aprobada; no se añadieron chistes para completar cuotas.

Validación: build y TypeScript; 52 tests generales/editoriales y 16 de mapa, inspección y handlers sobre el código actual. Incluyen conservación, determinismo y tres escenarios de 20 turnos. Comprobación visual en navegador a 1280 × 720 de Heraldo y carteles del valle. No se realizó una nueva prueba con estudiantes ni dispositivos escolares.
