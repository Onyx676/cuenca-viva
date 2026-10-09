# Cuenca Viva — Agent Rules

## Trabajo

- Leer sólo los archivos necesarios para la tarea.
- Rastrear callers y efectos secundarios al cambiar lógica compartida.
- Hacer el cambio mínimo razonable; no refactorizar código ajeno a la tarea.
- No agregar dependencias, capas o abstracciones sin necesidad concreta.
- Preservar los cambios existentes del usuario.

## Restricciones críticas

- Mantener la simulación separada de UI/Phaser/DOM cuando sea razonable.
- No cambiar fórmulas, coeficientes, límites o balance silenciosamente; justificar cambios.
- Toda aleatoriedad de gameplay debe usar el PRNG seeded controlado.
- Nunca usar `Math.random()` para estado de simulación o gameplay.
- Cambiar cantidad u orden de llamadas al PRNG afecta reproducibilidad.
- UI y efectos visuales no deben consumir el PRNG de gameplay.

## Modelo del agua

- Preservar nieve/deshielo, lluvia/escorrentía/infiltración y evaporación.
- Preservar río, embalse, acuífero, retornos, calidad y caudal ecológico.
- Agua asignada no desaparece: distinguir consumo, retorno y almacenamiento.
- Respetar conservación de masa dentro de la abstracción del juego.
- No agregar, eliminar o simplificar sistemas de simulación o sectores sin justificación mecánica y pedagógica fuerte.
- Río Vivo representa caudal ecológico, no sólo actividad económica.

## Producto

- Juego educativo conceptual; no es una herramienta profesional de predicción.
- Aplicar `modelo → decisión → consecuencia → aprendizaje`.
- Explicitar simplificaciones científicas; evitar precisión falsa.
- Mostrar trade-offs e interdependencia; no sectores buenos/malos ideológicamente.
- Mapa como interfaz principal; controles contextuales y sliders para asignación.
- Evitar UI tipo dashboard, paneles permanentes enormes y ruido numérico.
- Dar feedback positivo visible; evitar castigo constante sin recompensa.
- Agregar mecánicas sólo con aporte claro a aprendizaje, decisión, consecuencia y diversión.

## Validación

Tras cambios de código, ejecutar checks relevantes. Base:

```sh
npm run build
npx --no-install tsc --noEmit
```

- Ejecutar tests relevantes si existen; no inventar comandos ni cobertura.
- Si cambia simulación: verificar determinismo con igual semilla, escenario y acciones; balances y flujo afectado.
- Si cambia gameplay: verificar el flujo afectado; recorrer los 20 turnos sólo si el cambio puede afectar progresión o transiciones.
- No afirmar validaciones que no se ejecutaron; declarar las pendientes.

## Cierre

- Reportar brevemente qué cambió, por qué, archivos tocados, validaciones y riesgos reales.
