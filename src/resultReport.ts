import type { GameState } from './models/GameState';

// Documento autónomo para abrir, imprimir o guardar como PDF desde el navegador.
// No carga recursos externos y los datos dinámicos se escapan como texto.
export function createLearningReport(state: GameState, summaryHTML: string): string {
  const escape = (value: string | number) => String(value).replace(/[&<>"']/g, character =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]!));
  const percent = (value: number) => `${Math.round(value * 100)}%`;
  const seasons = { WINTER: 'Invierno', SPRING: 'Primavera', SUMMER: 'Verano', AUTUMN: 'Otoño' };
  const rows = state.seasonHistory.map(row => {
    const b = row.balance;
    const values = [row.turn, seasons[row.season], percent(b.satisfactions.population), percent(b.satisfactions.agriculture),
      percent(b.satisfactions.livestock), percent(b.satisfactions.mining), percent(b.satisfactions.ecosystem),
      b.reservoirEnd, b.aquiferEnd, b.aquiferWithdrawal];
    return `<tr>${values.map(value => `<td>${escape(value)}</td>`).join('')}</tr>`;
  }).join('');
  const decisions = state.seasonHistory.flatMap(row => row.events.filter(record => record.chosenOptionId).map(record => {
    const option = record.event.options?.find(item => item.id === record.chosenOptionId);
    return `<li>Estación ${row.turn}: ${escape(record.event.name)} — ${escape(option?.label ?? record.chosenOptionId!)}</li>`;
  })).join('');
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Cuenca Viva — resultados de mi partida</title><style>
    body{font:16px/1.5 system-ui,sans-serif;color:#172033;max-width:1100px;margin:32px auto;padding:0 24px}
    h1,h2,h3{line-height:1.25}h1{font-size:28px}h2{margin-top:28px}p{margin:8px 0}
    .final-reserves,.final-milestones,.report-grid,.final-evaluation{display:flex;flex-wrap:wrap;gap:16px;margin:16px 0}
    .final-evaluation>article{flex:1 1 220px;border:1px solid #bac4d0;padding:12px;border-radius:8px}
    .final-reserves>*,.final-milestones>*,.report-stat-box{flex:1 1 140px;border:1px solid #bac4d0;padding:12px;border-radius:8px}
    .final-reserves article{display:flex;flex-direction:column;gap:4px}.final-reserves strong{font-size:20px}
    .report-stat-value{font-weight:700;font-size:20px}.model-note{color:#475569;font-size:14px}
    [style]{color:inherit!important}details>summary{font-weight:700}table{border-collapse:collapse;width:100%;font-size:13px;margin:16px 0}
    th,td{border:1px solid #bac4d0;padding:7px;text-align:left}thead{background:#eef3f8}tr{break-inside:avoid}
    .table-scroll{overflow-x:auto}button{display:none}@page{size:A4 landscape;margin:15mm}
    @media print{body{margin:0;padding:0}h2,h3{break-after:avoid}.table-scroll{overflow:visible}}
    </style></head><body><h1>Cuenca Viva — mi partida</h1><p>${escape(state.scenarioName)} · Semilla ${escape(state.seed)} · ${state.seasonHistory.length} estaciones</p>
    ${summaryHTML}<h2>Resultados, estación por estación</h2><p>Cobertura: agua recibida respecto de la demanda. Río: caudal respecto de la referencia del juego. Reservas y bombeo: gotas conceptuales.</p>
    <div class="table-scroll"><table><thead><tr>${['Turno', 'Estación', 'Ciudad', 'Cultivos', 'Granja', 'Mina', 'Río', 'Embalse al cierre', 'Acuífero al cierre', 'Bombeo'].map(label => `<th>${label}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>
    ${decisions ? `<h2>Mis decisiones ante eventos</h2><ol>${decisions}</ol>` : ''}
    <h2>Para comparar con otra partida</h2><p>Usá el mismo escenario y semilla para comparar condiciones. ¿Qué cambiaste en el reparto o las obras? ¿Cómo cambiaron cobertura, bombeo y reservas? Las diferencias entre partidas no aíslan por sí solas el efecto de una obra.</p>
    <p class="model-note">Resultados dentro de un modelo educativo conceptual, sin calibración regional ni uso para decisiones reales. Abrí este archivo en un navegador y elegí Imprimir para obtener papel o PDF.</p></body></html>`;
}
