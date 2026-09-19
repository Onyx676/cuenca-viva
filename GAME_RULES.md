# 📖 Reglas del Juego y Modelo de Simulación — Cuenca Viva

Este documento detalla **el funcionamiento real y exacto** del motor de simulación de **Cuenca Viva** a partir del código fuente auditado (`SimulationEngine.ts`, `WaterSystem.ts`, `DemandSystem.ts`, `RainSystem.ts`, `SnowSystem.ts`, `ClimateSystem.ts`, `UpgradeSystem.ts`, `EventSystem.ts`).

---

## 1. Ciclo Temporal y Estructura de la Partida

- **Duración total:** 5 años.
- **Estaciones por año:** 4 estaciones fijas:
  1. ❄️ **Invierno (Winter)**
  2. 🌱 **Primavera (Spring)**
  3. ☀️ **Verano (Summer)**
  4. 🍂 **Otoño (Autumn)**
- **Total de turnos:** 20 turnos jugables ($5 \times 4 = 20$).
- **Fase de Consolidación Anual:** Se dispara automáticamente al finalizar el **Otoño** de cada año (turnos 4, 8, 12, 16 y 20).

---

## 2. Origen del Agua y Disponibilidad Estacional

En cada estación, antes de que el jugador decida, el motor calcula la hidrología disponible mediante la siguiente secuencia:

### A. Clima y Temperatura
1. **Estado Climático de Fondo:** Markov de 5 estados (`VERY_DRY`, `DRY`, `NORMAL`, `WET`, `VERY_WET`) con persistencia probabilística.
2. **Ciclo ENSO:** `NEUTRAL` (60%), `EL_NINO` (aumenta lluvias un 20% y temperatura +0.8°C), `LA_NINA` (reduce lluvias un 15% y temperatura -0.5°C).
3. **Temperatura de la Estación:**
   $$\text{Temperatura Anómala} = \text{Modificador Clima} + \text{Modificador ENSO} + \text{Offset Estacional}$$
   - *Invierno:* $-4.0^\circ\text{C}$
   - *Primavera:* $+0.5^\circ\text{C}$
   - *Verano:* $+4.5^\circ\text{C}$
   - *Otoño:* $-1.0^\circ\text{C}$

### B. Precipitación Nival y Manto de Nieve
- **Acumulación de Nieve:** Ocurre en la alta cordillera según la cuota estacional (`rainShare` / `snowShare`):
  - *Invierno:* 55% de la nieve anual.
  - *Primavera:* 20% de la nieve anual.
  - *Verano:* 0%.
  - *Otoño:* 25% de la nieve anual.
- **Deshielo Nival (`SnowMelt`):**
  - Tasa base estacional: Invierno 5%, Primavera 45%, Verano 60%, Otoño 15%.
  - Modulado por temperatura: si hace calor ($\Delta T > 0$), la tasa aumenta $+5\%$ por cada grado; si hay ola de calor estival, se suma un $+25\%$ adicional.
  - El deshielo escurre directamente hacia la cabecera del río principal.

### C. Precipitación Pluvial y Escorrentía
- **Lluvia Estacional:** Lluvia base distribuida según la estación (Otoño concentra el 35%, Primavera 28%, Invierno 20%, Verano 17%).
- **Intensidad de Lluvia (`MODERATE`, `INTENSE`, `PROLONGED`):**
  - *Lluvia Intensa:* Solo 22% infiltra al suelo; 63% se convierte en escorrentía rápida superficial; 15% se evapora.
  - *Lluvia Moderada:* 44% infiltra lentamente; 32% escorrentía; 24% evaporación.
  - Las obras de captación y zanjas de infiltración aumentan hasta un +15% la recarga subterránea.

### D. Caudal del Río Principal
$$\text{Caudal Río} = \text{Deshielo Nival} + (0.45 \times \text{Escorrentía Superficial}) + \text{Caudal Base}$$
*(Caudal base: Primavera 12💧, Verano 8💧, Invierno/Otoño 5💧)*.

### E. Cálculo de Agua Total Disponible para Asignar
El agua que el jugador puede repartir en la estación surge de:
$$\text{Agua Disponible} = \max\Big(15,\; \text{round}(0.70 \times \text{Caudal Río} + 0.45 \times \text{Volumen Embalse}) + \text{round}(0.18 \times \text{Volumen Acuífero})\Big)$$

---

## 3. Demanda de los 5 Sectores

No todos los sectores piden lo mismo en todas las estaciones. Las demandas base se modulan por factores estacionales, calor y obras:

| Sector | Invierno | Primavera | Verano | Otoño | Comportamiento |
| :--- | :---: | :---: | :---: | :---: | :--- |
| 🏙️ **Ciudad** | $\times 0.85$ | $\times 1.00$ | $\times 1.30$ | $\times 0.95$ | Mayor consumo en verano por olas de calor. Penaliza fuertemente la confianza si hay desabastecimiento. |
| 🌾 **Cultivos** | $\times 0.30$ | $\times 1.10$ | $\times 1.60$ | $\times 0.80$ | Casi nula en invierno; máxima en verano. Sensible al calor ($+4\%$ demanda por cada grado de calor). |
| 🐄 **Granja** | $\times 0.85$ | $\times 1.05$ | $\times 1.25$ | $\times 0.95$ | Abrevado animal constante con pico en verano ($+3\%$ por calor). |
| ⛏️ **Mina** | $\times 0.90$ | $\times 1.00$ | $\times 1.05$ | $\times 0.95$ | Demanda industrial constante. Aporta regalías clave para el presupuesto. |
| 🐟 **Río Vivo** | $\times 0.80$ | $\times 1.20$ | $\times 1.10$ | $\times 0.90$ | Caudal ambiental indispensable para la vida de los peces y humedales del delta. |

### Reducción de Demanda por Mejoras (Permanente):
- **Riego Tecnificado (Agricultura):** Nivel 1: $-12\%$, Nivel 2: $-30\%$, Nivel 3: $-45\%$. Canales revestidos: $-8\%$ adicional.
- **Reparación de Red Urbana (Ciudad):** Nivel 1: $-10\%$, Nivel 2: $-25\%$, Nivel 3: $-40\%$. Reúso depuradora: $-8\%$ adicional.
- **Recirculación Minera (Mina):** Nivel 1: $-20\%$, Nivel 2: $-45\%$, Nivel 3: $-85\%$ (circuito cerrado casi total).

---

## 4. Prioridad de Captación y Reglas de Extracción Hidrológica

Cuando el jugador asigna agua a los sectores, el motor retira el recurso en una **secuencia física estricta**:

1. **Prioridad 1 — Toma Directa del Río:** Se toma hasta el 65% del caudal del río.
2. **Prioridad 2 — Extracción del Embalse:** Si falta agua, se retira hasta el 65% del agua guardada en el embalse.
3. **Prioridad 3 — Bombeo del Acuífero Subterráneo:** Si la suma asignada supera lo que el río y el embalse pueden proveer (o si el jugador sobregira el agua disponible), **el déficit se bombea automáticamente del acuífero**.

---

## 5. Dinámica del Embalse y del Acuífero

### A. Embalse (Agua Superficial)
- **Entrada:** Recibe el 70% del caudal fluvial excedente.
- **Evaporación:** En verano y días secos pierde agua por evaporación atmosférica:
  $$\text{Evaporación} = 3 \times \text{Factor Clima} \times \text{Multiplicador Estacional} \times \left(\frac{\text{Volumen Actual}}{\text{Capacidad}}\right)$$
- **Aliviadero / Desborde:** Si el volumen supera la capacidad máxima, el excedente vierte río abajo (`reservoirSpill`).
- **Reserva Natural:** Lo que el jugador no asigna se queda en el embalse hasta el tope de su capacidad.

### B. Acuífero (Agua Subterránea Profunda)
- **Definición científica:** Reside en los poros y fisuras de rocas y sedimentos permeables.
- **Recarga Natural:** Recibe el 85% del agua que se infiltra por el suelo tras las lluvias.
- **Recarga Artificial:** Si se construyen zanjas/pozos de recarga, captura entre un 20% y 50% de la escorrentía superficial.
- **Extracción:** Todo déficit hídrico no cubierto por río o embalse se extrae de aquí.
- **Niveles de Estrés Freático:**
  - `HEALTHY` ($> 70\%$ de capacidad): Seguro y sostenible.
  - `ATTENTION` ($40\% - 70\%$): Comienza el descenso del nivel freático.
  - `STRESSED` ($20\% - 40\%$): Pozos secos en zonas altas; castiga la salud de la cuenca.
  - `CRITICAL` ($< 20\%$): Sobreexplotación grave; genera subsidencia del suelo, pérdida masiva de confianza (-4) y daño ecológico (-5).

---

## 6. Consumos, Retornos y Calidad del Agua

No toda el agua asignada desaparece; una porción retorna al río, pero con distinta calidad:

| Sector | % Consumido (Desaparece) | % Retornado al Río | Calidad de Vertido |
| :--- | :---: | :---: | :--- |
| 🏙️ **Ciudad** | 30% | 70% | 35/100 base. Con Planta de Saneamiento: Nivel 1 = 70, Nivel 2 = 82, Nivel 3 = 94. |
| 🌾 **Cultivos** | 70% | 30% | 65/100 base (fertilizantes). Con Riego Eficiente = 80/100. |
| 🐄 **Granja** | 75% | 25% | 60/100 (carga orgánica). |
| ⛏️ **Mina** | 75% | 15% | 50/100 base. Con recirculación N1 = 75/100. Con N3 = 0% vertido (circuito cerrado). |
| 🐟 **Ecosistema**| 15% | 85% | 100/100 (agua limpia que diluye contaminantes). |

### Fórmula de Calidad del Agua (`WaterQuality` de 0 a 100):
Se calcula ponderando la calidad de los vertidos contra el caudal de dilución del río limpio:
$$\text{Dilución} = \frac{\text{Agua Limpia Río}}{\text{Agua Limpia Río} + \text{Retornos Contaminados}}$$
$$\text{Nueva Calidad} = (0.65 \times \text{Calidad Anterior}) + (0.35 \times \text{Calidad Resultante})$$

---

## 7. Confianza Pública, Salud de la Cuenca y Presupuesto

### A. Confianza Pública (`PublicTrust` 0–100%)
- Si la **Ciudad** recibe menos del 95% de su demanda:
  $$\Delta \text{Confianza} = - \text{round}\Big((1 - \text{Satisfacción}) \times 25\Big)$$
- Si la Ciudad está plenamente abastecida: $+1\%$.
- Castigos adicionales por temporada:
  - Agricultura $< 70\%$: $-3\%$.
  - Minería $< 70\%$: $-2\%$.
  - Calidad del agua $< 55/100$: $-4\%$.
  - Acuífero en nivel `CRITICAL`: $-4\%$.

### B. Salud de la Cuenca (`BasinHealth` 0–100%)
- Si el **Ecosistema** (Río Vivo) recibe $\ge 90\%$: $+2\%$. Si recibe $< 60\%$: $-4\%$.
- Acuífero `HEALTHY`: $+1\%$; `STRESSED`: $-2\%$; `CRITICAL`: $-5\%$.
- Calidad del agua $\ge 80$: $+2\%$; $< 50$: $-3\%$.
- Restauración de riberas: $+1\%$ permanente.

### C. Presupuesto Anual Ganado (Calculado al cierre de Otoño)
$$\text{Presupuesto} = \max\Big(20,\; \text{Tasa Urbana} + \text{Ingresos Agro} + \text{Regalías Mina} + \text{Bono Ambiental} + \text{Bono Confianza} - \text{Mantenimiento}\Big)$$
- Tasa Urbana: hasta $+\$30$ según satisfacción promedio del año.
- Producción Agro: hasta $+\$40$.
- Regalías Mineras: hasta $+\$35$.
- Bono Ambiental: $+\$15$ si la satisfacción del río promedia $\ge 85\%$.
- Bono Ciudadano: $+\$15$ si la Confianza Pública es $\ge 80\%$.
- Costo base de mantenimiento de redes: $-\$25$.
- Mínimo garantizado por año: $\$20$.

---

## 8. Inconsistencias Detectadas entre la UI Anterior y la Simulación Real

1. **La "Reserva" como Sector:** En versiones preliminares existía un control de "Ahorro/Reserva" como si fuera un sector que consumiera agua. **En la simulación real**, el agua no asignada queda automáticamente guardada en el embalse o en el flujo fluvial natural. Por ello, en esta versión los sectores son estrictamente los 5 usuarios reales y la Reserva es un cálculo automático visible (`Disponible - Asignado`).
2. **Sobregasto y Acuífero Oculto:** Cuando el jugador asignaba más de lo disponible, la UI solo mostraba un cartel amarillo, pero el jugador no veía que ese sobregasto **se bombeaba instantáneamente del acuífero subterráneo**. Al sustituir los controles por sliders con límites claros y feedback del acuífero, esta relación causa-efecto se vuelve transparente.
3. **Frecuencia del Presupuesto:** Varios textos hablaban de "ganar dinero cada estación", cuando en realidad el presupuesto se consolida anualmente al finalizar el Otoño.

---

## 9. Conclusión Pedagógica para el Alumno

El simulador enseña tres principios fundamentales:
1. **El agua no es infinita ni constante:** Lluvia, nieve y deshielo varían estación a estación.
2. **Cada decisión tiene costo de oportunidad:** Darle más agua a la agricultura en verano puede vaciar el embalse y dejar desprotegida a la ciudad o secar el río ecológico.
3. **El acuífero es un fondo de emergencia:** Si se gasta más agua de la que llueve, los pozos colapsan y la recuperación tarda décadas.
