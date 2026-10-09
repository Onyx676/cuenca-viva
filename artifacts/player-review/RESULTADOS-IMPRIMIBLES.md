# Inicio y resultados para aula — 9 de octubre de 2026

El inicio ofrece Continuar, Nueva partida y Aprender a jugar. La información técnica de recuperación sólo aparece si la copia anterior no puede retomarse; se conserva la descarga del original para evitar perder datos. El fondo se actualiza antes de mostrar el menú.

Al terminar, Guardar datos descarga un documento HTML autónomo con el cierre completo, obras, coberturas y reservas por estación, bombeo, decisiones ante eventos y preguntas para comparar partidas. Imprimir resultados abre el mismo documento y solicita el diálogo del navegador. Si se bloquea la ventana, indica usar el archivo descargado. El JSON sigue disponible dentro de Compartir el registro completo y en las herramientas de ayuda, con etiquetas comprensibles.

Archivos de producto: index.html, src/main.ts, src/style.css y src/resultReport.ts. La exportación usa una copia del resumen, abre sus detalles y elimina sus controles; no cambia el resumen visible, el motor ni el PRNG.

Validación ejecutada:

- Build y TypeScript sin errores. Vite conserva el aviso de tamaño del bundle.
- 4 pruebas del documento y handlers: 20 estaciones, escape de texto, ausencia de recursos externos, estado/PRNG intactos, descarga HTML, impresión y alternativa ante bloqueo.
- 6 pruebas de exportación del registro y clipboard; 18 de recuperación e interacción, usando SESSION_RECOVERY_USE_ROOT=1.
- Partida propia recorrida hasta T20 en la interfaz. Descarga real desde el modal final: cuenca-viva-mis-resultados (1).html, con 20 filas y encabezado, sin controles del modal. Continuación de una partida terminada vuelve al informe final.
- Capturas inicio-simple.png y guardar-resultados.png.

Pendiente: apariencia del documento abierto/impreso y prueba en impresora física. El navegador automatizado bloqueó file://; no se sorteó esa restricción. Las llamadas al diálogo de impresión se comprobaron con los handlers reales en pruebas, sin afirmar validación en dispositivos escolares.
