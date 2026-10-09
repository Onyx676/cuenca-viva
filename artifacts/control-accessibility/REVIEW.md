# Controles contextuales: QA real

Cambios limitados a `index.html` y `src/style.css`; sin cambios en simulación ni llamadas al PRNG.

- El nombre del sector permanece visible al ajustar en móvil.
- Cierre de la tarjeta: 44 × 44 px en juego y tutorial.
- Sliders asociados mediante `aria-describedby` a instrucciones de flechas/Escape y a la diferencia entre pedido y cobertura. Esas descripciones están ocultas visualmente, sin líneas permanentes nuevas. Humedal tiene explicación específica sobre aporte adicional, caudal y retornos.
- Consecuencias del tutorial pasan de 11 a 14 px y se ajustan al ancho.
- Las transiciones de tarjeta y slider contextual se desactivan con `prefers-reduced-motion: reduce`.

## Verificado en IAB

Origen independiente `http://127.0.0.1:5184/`, sin abrir ni alterar la partida del usuario en otro origen. Pestaña temporal cerrada; viewport restaurado.

- 390 × 844: Enter sobre compuerta Ciudad abre y enfoca `slider-pop`.
- ArrowRight cambia el pedido 14 → 15 y actualiza la consecuencia visible.
- Escape cierra y devuelve foco a compuerta Ciudad.
- Activación Cultivos por teclado y cierre por clic devuelven foco a su compuerta.
- Tutorial, fase 2: Ciudad y slider visibles; editor de 280 px, ancho interno 278 px sin desborde horizontal, cierre 44 × 44 px; consecuencia con fuente calculada de 14 px.
- Juego: editor de 340 px, ancho interno 338 px sin desborde horizontal; nombre visible y slider dentro de la tarjeta.
- 1440 × 900: inspección visual del tutorial con control contextual y nombre visible.

Capturas: `game-mobile.jpg`, `tutorial-mobile.jpg`, `tutorial-desktop.jpg`.

## Checks ejecutados

`npm run build` y `npx --no-install tsc --noEmit` se ejecutaron durante la edición concurrente de misiones. Ambos fallaron por TS2339 en `src/models/SeasonalGoal.ts` líneas 52–53 (`reserveTarget`), ajeno a estos archivos. El coordinador ejecutará los checks integrados cuando concluya la edición del modelo. No se afirma build aprobado aquí.

No se recorrieron los 20 turnos: no cambió la lógica de gameplay. No se añadió test que duplique CSS. `prefers-reduced-motion` fue implementado e inspeccionado en código; no se emuló esa preferencia en navegador. No se probó lector de pantalla externo: se verificaron atributos y árbol accesible del navegador.

Durante una condición de consecuencia más extensa el editor móvil llegó a solapar 8 px de la previsión. Se informó al responsable de `main.ts` para ajustar el límite superior por los banners visibles sin modificar sus archivos desde esta tarea.

## QA posterior de misión 2.6 pendiente

Se intentó validar nuevamente invierno → primavera, misión contextual móvil, ajuste de posición por banners y flujo Heraldo → Valle → Resumen con explicación de misión fallida, en origen temporal `http://127.0.0.1:5185/`. El navegador dejó de estar disponible: crear pestaña IAB respondió «Browser is not available: iab» y el inventario devolvió `browsers: []`. No se inició esa partida ni se capturó evidencia de ese flujo. El servidor temporal 5185 se detuvo. Las capturas anteriores documentan sólo la accesibilidad y la tipografía verificadas previamente; no prueban las nuevas misiones ni la corrección posterior de posicionamiento.

## Presentación escolar del desafío

Cambios posteriores sólo en `src/main.ts`, `index.html` y `src/style.css`: título de 16 px, descripción de 15 px / 1.45, ancho de 480 px limitado al viewport y recompensa en fila propia. El estado cerrado muestra mínimo del sector foco y reserva en gotas; el desplegable nombra los demás sectores y muestra todas las metas desde los campos guardados. Se conserva abierto al ajustar repartos y se cierra al cambiar de turno/meta. Primer invierno conserva sus mínimos explícitos y ofrece previsión desplegable. Las descripciones antiguas sustituyen el signo ≥ por palabras sin modificar el snapshot.

El resumen de misión fallida enumera sólo requisitos incumplidos: por ejemplo «Faltó: Ciudad 92% (meta: 95%); Embalse 44 gotas (meta: 53)». No modifica condiciones ni recompensas.

Validación final de esta presentación: `npm run build` y `npx --no-install tsc --noEmit` aprobados. `node artifacts/control-accessibility/verify-goal-presentation.cjs` aprobado: verifica campos de metas no estándar, sectores explícitos, exclusión de requisitos cumplidos, misión sin mutaciones y bindings HTML. No se ejecutó validación visual final: inventario IAB volvió a devolver `browsers: []`. Las capturas anteriores no representan esta última tarjeta.
