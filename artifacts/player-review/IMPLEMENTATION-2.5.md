# Cierre de la revisión del jugador — modelo 2.5

## Cambios

- Se mantienen veinte estaciones y Heraldo→resumen. Se ocultan los cuatro indicadores duplicados del resumen; queda cambio de reservas, consecuencia breve y avance. Balance, eventos, obras y explicación numérica se despliegan bajo demanda.
- Heraldo con humor editorial absurdo y hechos breves; no modifica resultados ni consume PRNG.
- Mapa: vecinos/trabajador/hojas y vaca con megáfono responden a cobertura conceptual. Hasta dos reacciones breves por resultado, una por vez, pausadas durante replay/modales/resumen; identifican turno y sector. La posición se corrigió tras comprobar que una burbuja quedaba bajo el pronóstico.
- Descarga JSON: el enlace temporal se inserta dentro del modal activo; el bloqueo de controles de fondo ya no intercepta su click. Botones distintos para copiar y descargar, con estado de éxito/error según la API.
- Infiltración fluvial: transferencia interna río→acuífero después de toma/retención y antes de bombeo/retornos. 10% didáctico, redondeado y limitado por río/espacio, separado de lluvia/obra. Cada gota transferida deja de continuar aguas abajo. Sensibilidad y límites en `../hackathon-readiness/river-recharge/REVIEW.md`.

Archivos de producto: `index.html`, `src/main.ts`, `src/style.css`, `src/game/Newspaper.ts`, `src/game/BasinScene.ts`, `src/models/Balance.ts`, `src/simulation/WaterSystem.ts`, `src/simulation/SimulationEngine.ts`, `src/waterClarity.ts`, `package.json`. Documentación y evidencias actualizadas sin descartar cambios previos.

## Comprobado

- `npm test`: 49/49, incluidos ocho tests nuevos de recarga fluvial.
- `node --test artifacts/player-review/map-reactions.test.cjs artifacts/player-review/session-export-ui.test.cjs artifacts/player-review/newspaper-humor.test.cjs artifacts/interaction-lock/handlers.test.cjs artifacts/hackathon-readiness/technology/preview.test.cjs`: 22/22.
- PowerShell `$env:SESSION_RECOVERY_USE_ROOT='1'; node --test artifacts/session-recovery/session-recovery.test.cjs`: 11/11 contra raíz 2.5. Ejecutar sin esa variable apunta al candidato histórico, no a la aplicación actual; un fallo del candidato no se usa para afirmar un defecto de raíz.
- `npx --no-install tsc --noEmit` y `npm run build`: pasan. Advertencia de bundle grande (~1.73 MB, ~420 KB gzip); no se hizo un refactor de empaquetado ajeno a esta revisión.
- Sensibilidad de recarga: 1920 resoluciones y 49 extremos, control congelado 2.4. Comparación de tecnologías regenerada para 2.5: 1920 resoluciones; resultados 2.4 preservados por versión.
- JSON humano 2.4: replay exacto de las veinte estaciones con fuentes congeladas de la misma versión, sin guardar otra copia del JSON. La aplicación rechaza recuperación incompatible sin sobrescribirla automáticamente.
- Navegador de prueba independiente: veinte turnos, eventos, Heraldo→resumen, cierres de año y final; resumen compacto y posición corregida del mapa comprobados visualmente. Descarga real desde el modal final: archivo 2.5, veinte estaciones, 79 acciones, todos los balances sin error.
- Copiar JSON: la UI confirmó resolución satisfactoria de `navigator.clipboard.writeText` con veinte estaciones; el contenido completo y rechazos se verifican en seis tests del handler real. La lectura del portapapeles del navegador automatizado devolvió vacío, por lo que no se afirma lectura independiente del contenido copiado en esa prueba real.

## Pendiente

Revisión experta de la forma/coeficiente/secuencia y simplificaciones territoriales; piloto con estudiantes y dispositivos escolares. Las referencias científicas justifican representar la conexión, no validan el coeficiente ni avalan el producto. Menor lectura está implementada; duración y diversión deben medirse nuevamente con jugadores.

Capturas: `resumen-simple.png`, `mapa-reacciones.png`, `exportacion-final.png`.
