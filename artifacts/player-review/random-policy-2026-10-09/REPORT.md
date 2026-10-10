# Campañas con pedidos aleatorios y evaluación final

2026-10-09. Motor real 2.6, reglas contextual-v1, Central, constructor aula activo como en el benchmark anterior. No hay cambios de fuente, fórmulas ni parámetros. Este ensayo no reproduce una partida humana ni valida aprendizaje/diversión.

## Protocolo

Ejecutar desde la raíz: `node artifacts/player-review/random-policy-2026-10-09/benchmark.cjs`.

Cuatro semillas climáticas: AULA-2026-001, AULA-2026-260, POLICY-2026-003, POLICY-2026-004. Para cada una, diez semillas de política explícitas RANDOM-POLICY-2026-01 a -10. Tres familias de pedidos y dos de compras: **240 campañas ×20 estaciones =4800 turnos**.

Las primeras dos familias usan pedidos enteros uniformes entre cero y la demanda actual inclusive, con un `SeededRandom` externo al motor y semilla de política. Se consumen siempre cinco draws por turno: Ciudad, Cultivos, Granja, Mina, Ecosistema. En la variante sin aporte extra se descarta el quinto resultado y se asigna cero, conservando los mismos draws humanos. Estas familias prueban entre 0 y 100% de necesidad, aproximadamente 50% en promedio, no todo el slider. El aporte adicional al humedal no equivale al caudal total del río.

**La tercera familia sí prueba mover los cinco sliders por su rango completo.** Replica la regla de UI en `src/main.ts:933`, con máximos iniciales de `index.html`: Ciudad45, Cultivos60, Granja30, Mina35, Ecosistema35. Antes de asignar cada turno conserva `max(máximo previo, asignación actual, round(demanda×1.5),30)` y elige uniformemente entre cero y ese máximo. Los máximos persisten durante la campaña, como en la UI; no se reducen al comprar ahorro. Puede pedir más que la necesidad y aumentar extracción sin aumentar cobertura. No incluye decisiones humanas de detener el slider en una marca; es azar uniforme del rango.

Compras fijas, no aleatorias: Red → Mantenimiento → Riego → Recirculación → Saneamiento; una compra asequible por obra y pasada, reiterando hasta no poder comprar. Respeta fondos y requisitos. Eventos: primera opción legal antes de compras; conserva pasivos, registra alternativas permitidas y elección. El azar de política no consume ni modifica el PRNG del motor.

Dieciséis campañas representativas se repitieron completas, añadiendo 320 turnos: **5120 resoluciones verificadas**. Pasaron conservación de masa, lluvia, nieve/deshielo, consumo/retorno por uso, concordancia preview/resolución, preview sin mutación, idempotencia y cierre de campaña. Las dieciséis repeticiones coinciden en series, decisiones, compras y hash final. No se ejecutó build de producto: sólo cambiaron artefactos.

## Resultados

Cada fila reúne 40 campañas. Valores: mediana; entre paréntesis P10–P90, interpolados sobre la muestra, no intervalos de confianza. Rangos completos y métricas por sector están en `summary.json`.

| Política | Cobertura humana media % | Río medio % | Acuífero final | Bombeo acumulado | Misiones /20 | Dinero final |
|---|---:|---:|---:|---:|---:|---:|
| Sin obras, extra aleatorio | 44.35 (39.04–49.11) | 97.2 (92.75–99.21) | 0 (0–8.1) | 180 (168.9–200.1) | 0 (0–1) | 319 (272.9–376.2) |
| Sin obras, extra cero | 47.85 (44.19–50.84) | 94.75 (91.26–97.5) | 42.5 (0–71) | 116.5 (74.7–162.3) | 0 (0–1) | 346 (314.8–398) |
| Obras fijas, extra aleatorio | 48.1 (44.31–50.9) | 98.8 (95.98–100) | 47.5 (5.4–89) | 124 (77.5–164.3) | 0 (0–1) | 57 (37.9–74) |
| Obras fijas, extra cero | 48.15 (44.34–51.18) | 96.5 (91.91–98.36) | 99 (87.9–100) | 16.5 (0–57.8) | 0 (0–1) | 55.5 (36.9–76.1) |
| Sin obras, rango completo sliders | 44.9 (39.8–47.73) | 90.7 (85.6–92.3) | 0 (0–0) | 211 (188–223) | 0 (0–0) | 298.5 (256.4–380.6) |
| Obras fijas, rango completo sliders | 54.4 (48.09–58.17) | 91.85 (87.5–93.4) | 0 (0–0) | 211 (188–223) | 0 (0–0) | 55 (37.9–73.7) |

**Random no gana según confianza y misiones:** en las primeras 160 campañas la confianza final es 10; en las 80 de rango completo es 10–15. Se cumplen como máximo una misión y normalmente ninguna; las 80 de rango completo no cumplen ninguna. Todas contienen al menos una estación con un uso humano sin cobertura; hay 15–20 estaciones con algún uso bajo 50%. Esos porcentajes se usan aquí como señales de diseño, no como umbrales científicos ni rúbrica final aprobada.

La salud final, por separado, sí puede parecer muy buena: al menos 80 en 23/40, 34/40, 39/40 y 40/40 campañas de las primeras familias respectivamente. Medianas de salud: 81, 100, 100 y 100. En rango completo, salud mediana13.5 sin obras y45 con obras; sólo0/40 y3/40 tienen salud≥80. Ninguna de las240 campañas termina a la vez con salud y confianza ≥80. No conviene describir salud alta como victoria integral ni afirmar que el juego premia todo reparto aleatorio.

Acúiferos agotados al cierre: 29/40, 6/40, 4/40 y 0/40. La calidad final mediana es 74.5, 67, 87 y 86. Las obras ayudan realmente a conservar reservas y mejorar retornos; no convierten pedidos aleatorios bajos en buen abastecimiento. Dinero positivo sin obras tampoco significa buena gestión: conserva presupuesto inicial y puede incluir ingresos ecológicos/eventos con sectores desatendidos.

En rango completo se agotan los80/80 acuíferos; embalse final2 en todos. Las obras mejoran cobertura media y calidad final (mediana74→85), pero no evitan la extracción acumulada que agota reservas: los máximos persistentes permiten sobrepedir aun con demandas reducidas. Es un comportamiento distinto a pedir al azar como máximo lo necesario.

## Comparabilidad

Dentro de cada semilla climática coinciden clima, ENSO, lluvia total y deshielo en sus60 campañas. Los eventos interactivos producen10,33,26 y30 trayectorias distintas de elecciones, respectivamente, por sus condiciones y fondos. Se aplica la misma regla de elección, no necesariamente la misma opción. Son políticas reales con el mismo forzamiento observado, no un experimento causal puro que aísle cada obra. Las demandas cambian con inversiones/eventos; compartir draws no garantiza idénticos pedidos enteros cuando cambia la demanda.

`results.json` conserva localmente todas las series, elecciones y compras; se ignora por volumen y puede regenerarse. `summary.json` incluye fuentes con SHA-256 (también main e index para el rango de sliders), percentiles, mínimos/máximos,240 métricas de campaña y comprobación de forzantes. No se simuló una distribución de estudiantes: diez políticas uniformes son un ensayo mecánico acotado.

## Parámetros propuestos para evaluar el final, sin implementar un score

| Dimensión | Datos a considerar | Interpretación a evitar |
|---|---|---|
| Abastecimiento | Media de cada uno de los cuatro usos; peor estación; frecuencia y duración de déficit, con umbrales de diseño explícitos | Una media global que esconda un sector abandonado |
| Río Vivo | Cobertura media y peor estación de caudal ecológico; cantidad y calidad consideradas separadamente | Confundir slider adicional con caudal real o calidad potable |
| Reservas | Inicio, final, cambio neto, mínimos y tiempo en los niveles de atención existentes; bombeo frente a recarga, desbordes separados | Cubrir todo hoy y celebrar mientras se consume la reserva futura |
| Calidad | Media por estación, mínimo y exposición a calidad baja; límites conceptuales declarados | Sólo la foto final alta o certificación sanitaria inventada |
| Economía | Ingresos, inversiones y remanente, contextualizados con servicios y reservas | Acumular dinero dejando usuarios sin agua como condición de éxito |
| Misiones | Cumplidas y fallidas como objetivos locales secundarios | Usarlas como sustituto de sostenibilidad o aprendizaje |

No asignar pesos ni cortes definitivos sin probar contra estas políticas y estrategias humanas. Una evaluación defendible debe describir por separado «abastecimiento», «estado ambiental» y «reservas para después» cuando divergen, permitiendo trade-offs legítimos. No imponer castigo por cualquier descenso: distinguir una extracción temporal recuperable de agotamiento persistente. La referencia acuífero 40% del motor es de diseño y no un límite medido para Tulum.

Si se agrega una valoración final narrativa sin efectos en dinero, estado o gameplay, puede partir de los historiales existentes. Cambiar recompensas, objetivos o condiciones de victoria requeriría reglas versionadas y preservar replay 2.6. Este informe no implementa ninguno de esos cambios.
