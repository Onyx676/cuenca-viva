# Consecuencias visibles y sátira local

## Cambios integrados

- Heraldo: 105 titulares de siete categorías, 20 de reservas, 64 voces y 40 anécdotas reescritas. Ironía de diario local, hechos separados de ficción editorial. Cambiar el sector de foco ya no reinicia la bolsa de titulares; calidad tiene su propio contador. No se consume PRNG de gameplay.
- Mapa: escenas simbólicas persistentes en los cinco sectores según cobertura registrada. Cultivos muestra cajones ilustrativos; Ciudad, Granja y Mina tienen gestos de celebración/reclamo; Río incorpora calidad y salud además de caudal. Etiqueta del turno del último reparto distingue resultado de previsión. No estima producción ni introduce efectos mecánicos.
- Ver el valle: recorrido opcional desde el resumen, con retorno visible. Durante la inspección permanece bloqueada la modificación de la partida. Modal/replay pausa las escenas. Dos burbujas de nueve segundos, reiniciables; no lectura ni espera obligatoria.
- Resumen: cambios efectivos de confianza y salud capturados después de eventos/compras y antes de resolver. Incluye efecto del desafío; topes y otros factores pueden limitar el cambio. Si se recupera una sesión resuelta sin ese baseline de UI se omiten los deltas, en vez de atribuir cambios históricos al último reparto.
- Controles contextuales explican qué sectores contribuyen a confianza o ingresos y cuándo se cobran. El cierre anual mantiene su desglose existente y usa «Aporte de Cultivos» en lugar de afirmar producción medida.

## Archivos

src/game/BasinScene.ts, src/game/Newspaper.ts, src/game/NewspaperHeadlines.ts, src/main.ts, src/style.css, index.html; pruebas en artifacts/player-review. No cambios de fórmulas, coeficientes, versión de modelo ni semillas de gameplay.

## Validación

- npm test: 49 pruebas, conservación/determinismo y recorridos de 20 turnos incluidos.
- player-review/*.test.cjs: 23 pruebas de editorial, mapa, exportación e inspección.
- Recuperación e interaction-lock: 18 pruebas con SESSION_RECOVERY_USE_ROOT=1, incluidos recorridos de 20 turnos en tres escenarios.
- Build y TypeScript sin errores; aviso existente de bundle grande.
- UI real: dos estaciones y un evento; nuevas portadas; confianza −1 y salud +3 en T1, confianza −5 y salud +3 en T2; inspección/retorno/avance/reanudación. Pantalla 390×844: retorno dentro del viewport y controles sin desborde horizontal. Tab mantiene el retorno accesible. No se confirmó que el foco automático al volver siempre llegue al botón de continuar.
- Capturas locales consecuencias-resumen.png, consecuencias-mapa.png, consecuencias-mapa-mobile.png y heraldo-satira-local.png.

## Pendiente externo

Diversión, tono y comprensión requieren una prueba con estudiantes de la edad objetivo. Las escenas no demuestran aprendizaje ni producción real. Las pruebas científicas/dispositivos escolares pendientes en documentos anteriores siguen pendientes.

El respaldo anterior está en 1774fca, rama codex/cuenca-viva-jugabilidad. Las partidas y capturas locales no se incluyen en Git.
