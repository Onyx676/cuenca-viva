# Cuenca Viva frente a la consigna — diagnóstico y entrega mínima

Actualización posterior, modelo 2.5: la conexión río→acuífero ya está implementada con transferencia interna, redondeo y capacidad, tasa didáctica 10% tras sensibilidad 0/10/20/30%. Ver `river-recharge/REVIEW.md` y `scientific-validation.md`. La tabla siguiente conserva la auditoría original 2.4. La revisión científica externa y pruebas con estudiantes/equipos continúan pendientes; los tests no las sustituyen.

Revisión del 8 de octubre de 2026, modelo 2.4. Producto: **entorno interactivo educativo conceptual**, no gemelo digital calibrado ni herramienta predictiva. Se preservan escenario, semillas, fórmulas y coeficientes actuales. No hay validación científica externa concluida.

## Diagnóstico breve con evidencia

| Consigna | Evidencia actual | Brecha y prioridad |
|---|---|---|
| Administrar agricultura, municipio y minería | `src/models/Sector.ts`, `DemandSystem.ts`, `SimulationEngine.setSectorAllocation()` y compuertas del mapa en `src/main.ts`. También ganadería y caudal ecológico. | El núcleo ya existe. No agregar sectores ni mecánicas para la entrega. Concesiones se abstraen como pedidos; no hay régimen jurídico real. |
| Comprender recarga y reservas | `SnowSystem.ts` → río; `WaterSystem.ts` calcula almacenamiento finito, recarga de lluvia/escorrentía, bombeo, retornos, desborde y conservación. | **Prioritaria:** no hay infiltración río→acuífero. Debilita el caso San Juan–Tulum. Ficha y origen de recargas corregidos; flujo sigue pendiente, no se da por resuelto. |
| Cuenca emblemática y sustento científico | Escenarios genéricos en `src/data/scenarios.json`. Fuentes primarias INA, CIGIAA/UNSJ e IANIGLA documentan mecanismos regionales. | Caso territorial separado y visible en Aula. Referencias no avalan el código. Imprescindible revisión experta para afirmar que se cumple la validación científica solicitada. |
| Evidencia de tecnologías | `previewUpgrade()` usa DemandSystem; compras mantienen pedidos. Nuevo `previewUpgradeWater()` reutiliza exactamente el balance del turno. | Comparación bajo demanda implementada para cinco obras de eficiencia, próximo nivel, dos políticas explícitas. No porcentajes de ahorro regional. Captación/recarga/capacidad requieren otro contrafactual y quedan fuera del panel. |
| Interés y aprendizaje | Mapa, decisiones, eventos, inversiones, Heraldo y consecuencias; tutorial de cuatro fases. | No se ha medido diversión ni comprensión. Tres preguntas incorporadas en Aula; piloto formativo preparado, pendiente de usuarios reales. |
| Acceso escolar | Build estático, recursos del juego empaquetados, sin llamadas de aplicación a servicios externos; Phaser y navegador. | Posible distribución HTTP en LAN, sin prometer PWA/offline autónomo ni rendimiento masivo. Zoom habilitado. Dispositivos y concurrencia escolar pendientes de prueba. |

Una mejora no equivale automáticamente a menor extracción: en el ensayo Valle Central/AULA, riego N1 baja necesidad agrícola acumulada 454→399, pero con pedidos idénticos el bombeo sigue en 171 y las reservas finales en 2/43. Mejora cobertura agrícola media 62,7→67,6%. En esos mismos pedidos el retorno de minería N1 aumenta por el coeficiente del modelo; no es una ley física de recirculación. Ver metodología y límites en [technology/REVIEW.md](technology/REVIEW.md).

## Plan mínimo por impacto, dependencias y aceptación

1. **Verdad pedagógica y territorial — implementado.** Quitar conversión gotas/litros sin respaldo; distinguir caso real, modelo y omisiones; nombrar fuentes efectivas en acuífero y resumen. Aceptación: ficha visible bajo demanda, sin nombre de instalación real atribuido al mapa ni calibración/aval; unidades conceptuales y conexión ausente explícitas.
2. **Obra → decisión → consecuencia — implementado.** Panel en Obras, sólo estación abierta y próximo nivel disponible. Aceptación: misma lluvia/nieve/clima y reservas iniciales, coste/prerrequisitos reales, pedidos visibles, demanda/cobertura/extracción/bombeo/consumo/retornos/reservas/caudal comparados; consultar no modifica motor ni PRNG. Políticas: mantener pedidos, o reducir sólo los afectados hasta nueva necesidad sin redistribución. No es trayectoria alternativa de cinco años.
3. **Causalidad regional y validación — imprescindible pendiente.** Revisar mecanismo fluvial y simplificaciones con especialista regional. Dossier [scientific-validation.md](scientific-validation.md) preparado. Antes de incorporar flujo: definir tramo, orden, saturación, destino de excedentes y rango conceptual justificado; restar al río exactamente lo que entra al acuífero. Aceptación técnica: masa, sequía, acuífero lleno/vacío, misma semilla/acciones, PRNG y veinte turnos en tres escenarios, previews/replay/mapa/documentación coherentes. Aceptación externa: revisor, fecha, versión, alcance, objeciones y correcciones registrados. No está bloqueado por falta de autorización de edición: falta fundamento y evaluación para elegir parámetros defendibles.
4. **Aprendizaje y acceso — protocolo listo, validación pendiente.** Piloto de 25–30 minutos, 6–12 estudiantes en parejas, tres preguntas antes/después; prueba con equipos escolares, LAN sin WAN y caché limpia, teclado/zoom, recuperación y clientes simultáneos. Aceptación: registro de tareas, ayudas, comprensión, disfrute e incidencias; separar cada resultado. [school-protocol.md](school-protocol.md).
5. **Puede esperar:** nuevos escenarios, más tecnologías, glaciares persistentes detallados, PWA, optimización por rendimiento supuesto, métricas globales de estrés o nuevas mecánicas. No sustituyen revisión científica ni prueba educativa.

## Cambios del producto y responsabilidades

- `index.html`: ficha territorial, preguntas de aula, unidades y zoom.
- `src/main.ts`: origen de recarga en mapa/resumen, comparación por obra y navegación de foco por desplegables/enlaces.
- `src/style.css`: presentación acotada del contenido educativo y tabla de comparación.
- `src/simulation/SimulationEngine.ts`: preview puro con estado independiente; la simulación jugada conserva el mismo camino y fórmulas.
- `README.md`, `GAME_RULES.md`: alcance, tutorial de cuatro fases y límites precisos.
- Informes/protocolos/tests en `artifacts/hackathon-readiness/`. Revisiones independientes con responsabilidades separadas; integración y decisiones del modelo centralizadas.

## Validación ejecutada

- `npm run build` y `npx --no-install tsc --noEmit`: pasan. Advertencia conocida: bundle JS mayor de 500 kB; no prueba de rendimiento escolar.
- `npm test`: 41/41.
- `node --test artifacts/hackathon-readiness/technology/preview.test.cjs`: 5/5, incluyendo niveles y escenarios, comparación con compra real, conservación, consultas durante veinte turnos y estado/PRNG/eventos idénticos al control.
- Runners de recuperación y bloqueo con `SESSION_RECOVERY_USE_ROOT=1` / `INTERACTION_LOCK_USE_ROOT=1`: 11/11 y 7/7.
- `node artifacts/hackathon-readiness/technology/compare.cjs`: 24 pares repetidos, 96 brazos, 1920 estaciones, clima idéntico, masa cero, determinismo y entrega=consumo+retorno. Eventos desactivados simétricamente **sólo en el experimento**. Results regenerados con fuentes actuales.
- Navegador de pruebas: ficha Aula, comparación de minería, cambio de política y navegación por teclado verificados. No reemplaza prueba escolar ni auditoría completa de accesibilidad.

La demo permite explicar decisiones y efectos internos con más precisión. **La validación científica requerida y la representación jugable de la recarga fluvial no están concluidas.** No anunciar cumplimiento total de la convocatoria hasta resolver esos puntos. Tampoco se probó aprendizaje/diversión con estudiantes ni rendimiento en dispositivos escolares.
