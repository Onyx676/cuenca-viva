# Prueba breve de aprendizaje y acceso escolar

Protocolo propuesto; **no ejecutado**. Piloto formativo, sin inferir eficacia general ni validación científica. Objetivo: detectar si la demo permite explicar recarga, agotamiento e inversión y si funciona en equipos disponibles.

## Preparación docente

Usar una versión congelada del build. Anotar versión del modelo, escenario, semilla y política de comparación. Elegir la cuenca territorial que el equipo pueda respaldar; no presentar los escenarios genéricos como calibrados. Preparar un ejemplo sin/con obra mediante la comparación controlada del proyecto; si todavía no existe, usarlo sólo como discusión cualitativa, sin atribuir causalidad a dos partidas libres.

Piloto: 6–12 estudiantes del público objetivo en parejas, con docente/facilitador; 25–30 minutos. Usar códigos anónimos de pareja, sin nombres ni cuentas. Ajustar autorización institucional y participación a la edad/contexto; no recopilar datos personales para esta prueba. No grabar audio/video sin el procedimiento institucional correspondiente.

## Secuencia

1. **3 minutos, antes de jugar.** Responder las tres preguntas de abajo individualmente en papel. Se admiten dibujos y lenguaje cotidiano.
2. **4 minutos, práctica.** Tutorial de cuatro pasos. El facilitador observa qué acciones requieren ayuda; no revela las respuestas de evaluación.
3. **8 minutos, decisión y consecuencia.** Jugar un año (cuatro estaciones) o la cantidad que realmente alcance el grupo. En al menos un resumen, señalar fuentes y explicar `reserva inicial + entradas − salidas = reserva final`. Abrir acuífero en el mapa y relacionar la ficha con el resumen. Antes de confirmar una estación, predecir si sube/baja la reserva y justificar; luego comprobar.
4. **5 minutos, inversión.** Examinar comparación sin/con obra con clima y política explícitos. Anotar cambio de demanda, extracción/bombeo, consumo/retornos y reservas/cobertura disponibles. Elegir dos indicadores y un posible costo/trade-off. No interpretar gotas como ahorro regional real.
5. **3 minutos, después.** Responder de nuevo las mismas preguntas, con un ejemplo de la partida o comparación; agregar “¿qué todavía no se entiende?” y “¿qué decisión tuvo ganas de probar de nuevo?”.
6. **2 minutos, cierre.** Docente aclara simplificaciones y que el modelo no permite decisiones reales. Descargar diagnóstico con código anónimo de pareja si hace falta revisar dificultades de interacción.

Si sólo hay 15 minutos: demostración docente de práctica y un resumen, comparación controlada, pre/post. Informar que no se ensayó el interés a lo largo de cinco años. Si se busca evaluar progresión completa, organizar otra sesión y registrar duración real; no forzar veinte estaciones dentro del piloto breve.

## Preguntas pre/post y rúbrica formativa

| Pregunta | Respuesta esperada, adaptada al modelo finalmente implementado | Puntuación orientativa |
| --- | --- | --- |
| ¿Cómo llega agua desde la montaña hasta la reserva bajo tierra? Dibujá o nombrá los pasos. ¿Qué entrada representa este juego? | Diferenciar nieve/deshielo, río, infiltración y acuífero; indicar las rutas presentes y la conexión real explicada/omitida. No aceptar “el acuífero fabrica agua” ni describirlo como lago hueco. | 0: no explica; 1: menciona infiltración sin recorrido; 2: recorrido pertinente y distingue modelo de realidad. |
| Hubo recarga, pero el acuífero terminó con menos agua. ¿Cómo puede pasar? | Extracción y otras salidas pueden superar las entradas; analizar números del balance. Una recarga positiva no implica reserva creciente. | 0: lo atribuye a azar sin relación; 1: identifica bombeo; 2: compara entradas y salidas y explica diferencia. |
| Una obra reduce la demanda de Cultivos. ¿Eso asegura más agua guardada y más agua para el río? ¿Qué compararías? | Depende del reparto, fuentes, consumo/retornos y otras salidas; citar cobertura y reservas/bombeo/caudal, mismo clima y política comparable. Ahorrar demanda no crea agua. | 0: asegura mejora universal; 1: reconoce dependencia o un indicador; 2: explica al menos una dependencia y comparación controlada. |

Adaptar la primera pregunta a la revisión científica final: no penalizar a quien detecta una ruta omitida. Dos revisores pueden puntuar una muestra y resolver discrepancias. Registrar diferencias pre/post y respuestas persistentes, sin umbral de “validado”. El mismo grupo pre/post tiene efecto de práctica y mediación docente; no demuestra causalidad ni generaliza. Criterio de siguiente iteración: si varias parejas fallan el mismo concepto o requieren ayuda en el mismo control, corregir texto/flujo antes de ampliar el piloto.

## Protocolo técnico en escuela

1. Anotar equipo cliente (CPU/RAM si disponible, GPU, OS, navegador y versión), resolución/escala, tipo de puntero; máquina docente, número de clientes y red. No publicar identificadores personales ni SSID sensibles.
2. Preparar `dist/` y servidor HTTP estático conocido por la institución, accesible en LAN. Construir/instalar con Internet antes de la sesión. Evitar usar `file://`; no depender de que cada alumno instale Node. `npm run preview -- --host 0.0.0.0` puede servir una **demo local temporal** en equipo preparado; confirmar URL/puerto y firewall con la institución, no tratarlo como servidor productivo.
3. Primer arranque con Internet disponible, registrar tiempo hasta bienvenida interactiva y errores de consola. Medir herramientas del navegador disponibles en el dispositivo; registrar método exacto. No fijar FPS o tiempos basándose en tamaño del bundle.
4. Desconectar sólo acceso WAN conservando LAN, limpiar caché en un cliente de prueba, abrir por HTTP, repetir tutorial, cuatro estaciones, selección de evento, Heraldo, resumen y cierre anual. Comprobar que no se pide recurso externo; enlaces de documentación pueden estar inaccesibles y deben tener material local esencial.
5. Probar cierre/reapertura en mismo origen y navegador, continuar y descargar JSON. Después documentar que cambiar host/puerto o equipo no lleva consigo la copia local y que exportar no equivale a importar/restaurar desde cualquier archivo.
6. Comprobar controles visibles a 1366×768/125%, zoom 200%, teclado (Tab, activación, sliders, cierre modal) y touch si se prevé. Anotar solapamientos, imposibilidad de actuar, falta de foco y legibilidad. No anunciar accesibilidad completa por pasar estas tareas.
7. Repetir con varios clientes simultáneos según disponibilidad real. Anotar carga inicial, fluidez, consumo de memoria si se mide, pérdidas de sesión, errores y duración real. Proponer requisitos mínimos sólo después del registro.

## Registro mínimo

Una fila por pareja/dispositivo: código, build/modelo, configuración, tareas completadas, ayudas del facilitador, incidencias, tiempo observado, pre/post (0–2 por pregunta), concepto pendiente, decisión que querría repetir. Separar resultado técnico, comprensión y disfrute. Estado actual de este protocolo: **pendiente de estudiantes y equipos escolares**.
