# Aprendizaje y acceso escolar — revisión independiente

Revisión sólo lectura del código raíz el 2026-10-08. No se realizaron sesiones con estudiantes ni ensayos en equipamiento escolar. No se modifica simulación, PRNG ni interfaz en esta revisión.

## Qué existe y qué demuestra

| Evidencia | Aporte educativo | Límite |
| --- | --- | --- |
| `src/data/tutorial.json`, `src/tutorial/TutorialManager.ts` | Cuatro fases: seguir nieve–río, pedir para Ciudad, aportar al humedal, cerrar práctica. Objetivos verifican acciones de compuerta. | La práctica usa estados preparados (`src/main.ts` 1217), no un experimento de recarga o inversión. Cumplir el tutorial no demuestra comprender hidrología. |
| `index.html` 599–641, Aula | Semilla, escenario y tutorial configurables; advierte que obras/decisiones habilitan distintos conflictos. | No hay profesor conectado, cuentas, sincronización ni evaluación automática del aprendizaje. |
| `src/main.ts` 1610–1720 | Resumen muestra fuentes de abastecimiento, movimientos de reservas, bombeo, recarga y retornos. Comunica efectos registrados de obras. | Recarga natural agregada puede ocultar la trayectoria del agua. No equivale a comparación causal de tecnologías. |
| `src/main.ts` 2490–2535 | Fichas contextuales: embalse no se llena al ampliarlo; acuífero baja si sale más agua de la que entra; río cuenta retornos. | Ficha actual del acuífero sólo menciona lluvia. Deberá acompañar fielmente cualquier revisión científica/modelo; no prometer conexión fluvial que el motor no represente. |
| `index.html` 549–555, informe final | Pregunta por recarga/bombeo y reservas; diferencia datos conceptuales de predicción y aprendizaje. | Preguntas al final de veinte estaciones llegan tarde para una demo breve. No hay respuestas registradas ni evidencia experimental. |
| `src/sessionExport.ts` 45–64, `src/sessionRecovery.ts` | Diagnóstico separa historial completo de práctica y permite conservar decisiones. Recuperación depende de versión, navegador y origen. | JSON no contiene conocimientos, comprensión, movimientos de sliders o intención. No usar partidas como prueba de aprendizaje. |

La experiencia sostiene modelo → decisión → consecuencia; aprendizaje todavía necesita una comprobación breve con personas. El cambio mínimo prioritario es una actividad docente de tres preguntas ligada a un resumen real y a la comparación tecnológica controlada. No hacen falta notas automáticas, plataforma docente ni un tutorial más largo para esta entrega.

## Arquitectura y acceso: hechos del repositorio

- `package.json`: build TypeScript + Vite, Phaser y canvas-confetti; sin backend de juego. Node/npm se necesitan para preparar/servir el paquete, no en cada alumno si accede a un servidor docente.
- `vite.config.ts`: `base: './'`, destino JavaScript `es2022`, servidor de desarrollo `0.0.0.0:3000`; producción es `dist/`. La configuración de desarrollo permite LAN pero no verifica firewall, Wi-Fi ni descubrimiento del servidor.
- `src/main.ts` 68–95: `Phaser.AUTO`, objetivo 60 FPS, preferencia gráfica `high-performance`, resize a ventana; no hay modo gráfico escolar medido. `AUTO` no demuestra rendimiento satisfactorio en toda GPU ni navegador antiguo.
- Búsqueda de `fetch`, URL externa y `serviceWorker` en `src/` e `index.html`: no se encontraron cargas remotas de runtime ni service worker. Sonido sintetizado (`src/audio/SoundFX.ts`). Los enlaces científicos/documentales pueden necesitar Internet cuando se abren.
- Inspección del `dist/` existente: `index-C0ELt1QT.js` 1,719,139 bytes; CSS 56,386 bytes. Gzip calculado localmente con Node/zlib: 416,844 y 11,169 bytes. Son tamaños de archivos y compresión, **no** tiempos de carga, memoria, transferencia de servidor ni garantía del próximo build.
- `index.html` 6 desactiva zoom de usuario (`user-scalable=no`, `maximum-scale=1.0`). Revisar la eliminación de esa restricción para lectura y accesibilidad sin prometer cumplimiento WCAG. Interfaz de mapa también necesita prueba de teclado y lector de pantalla real.

## Imprescindible para una demo defendible

1. Guion corto de clase y prueba pre/post (archivo hermano `school-protocol.md`), enlazado desde documentación/Aula. Referir las rutas de recarga realmente implementadas; señalar límites de resolución y unidades.
2. Preparar paquete estático y ensayo **LAN sin Internet**, con equipo docente que sirva `dist/` por HTTP y clientes escolares. No anunciar offline autónomo: recargar una página cacheada no está garantizado y `file://` no es el procedimiento soportado.
3. Registrar al menos un equipo escolar representativo y condiciones observadas; hasta ejecutarlo, declarar pendiente. El prototipo en el equipo del desarrollador no permite concluir uso a gran escala.
4. Corregir documentación de versión/fases; revisar restricción de zoom. Mantener instrucciones claras de conservar origen, descargar diagnóstico y no actualizar el modelo durante una clase.

Puede esperar: PWA/service worker, cuentas y panel docente, analítica, adaptación curricular completa, soporte a navegadores sin ES2022, modo gráfico reducido o despliegue masivo. Cada uno requiere necesidad observada, no sólo sumar funciones.

## Aceptación verificable

- Alumno puede señalar entrada(s) de recarga en un resumen, comparar entrada y bombeo para explicar cambio de almacenamiento, y distinguir menor demanda de agua nueva. Confirmarlo con preguntas y explicación oral, no con puntuación de juego.
- Comparación sin/con obra declara semilla, versión, horizonte y política; estudiante cita al menos una métrica de cobertura y una de reserva/bombeo y reconoce un trade-off. No exigir que toda obra mejore todos los indicadores.
- Paquete servido por LAN arranca con WAN desconectada en clientes previstos; completar tutorial, cuatro estaciones, evento, resumen, cierre anual y descarga/reapertura compatible. Registrar errores y tiempos. Ensayo de veinte turnos automatizado complementa, no sustituye esta prueba.
- Lectura a 1366×768 y escala del sistema 125%, compuertas operables, modales con acciones visibles; verificar zoom 200%, teclado y touch si esos dispositivos se presentan como compatibles.

Dependencias externas: docente y estudiantes disponibles, autorización institucional aplicable, dispositivos/OS reales, red escolar/firewall, revisión didáctica y revisión científica. Ninguna está resuelta por esta auditoría.
