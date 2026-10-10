const fs = require('node:fs');
const sectors = { CIU: 'population', CUL: 'agriculture', GRA: 'livestock', MIN: 'mining', RIO: 'ecosystem' };
const bands = { C: 'complete', P: 'partial', I: 'low', G: 'grave' };
const ranges = { H: { C: 24, P: 44, I: 64, G: 84 }, V: { C: 17, P: 37, I: 57, G: 77 } };
const general = { 'QUAL-FIRST': 57, 'QUAL-ALERT': 77, 'QUAL-ST': 97, 'QUAL-DN': 117, 'QUAL-UP': 137,
  'RES-UP': 157, 'RES-DN': 177, 'RES-ST': 197 };
const guard = {
  'ND-H-RIO-P-03': 'coverageImproved', 'ND-H-RIO-P-07': 'coverageImproved',
  'ND-H-RIO-P-13': 'coverageImproved', 'ND-H-RIO-P-18': 'coverageImproved',
  'ND-V-RIO-P-10': 'coverageImproved',
  'ND-H-RIO-G-04': 'lessThanHalf', 'ND-H-RIO-G-08': 'lessThanHalf',
  'ND-H-RIO-G-15': 'lessThanHalf', 'ND-H-RIO-G-18': 'lessThanHalf', 'ND-V-RIO-G-02': 'lessThanHalf',
  'ND-GEN-QUAL-ALERT-04': 'enteredQualityAlert', 'ND-GEN-QUAL-ALERT-13': 'enteredQualityAlert'
};
// Consolidated semantic families, shared across products and characters.
// Descriptors in the proposal are review labels, not 960 distinct gag families.
const families = [
  ['grupo-barrio-perro', /perro/i],
  ['rosa-fotografia-ferrada', /(?:foto[^.]*Ferrada|Rosa[^.]*foto)/i],
  ['pronostico', /pronóst|meteorológ|cielo/i],
  ['mate-y-descanso', /mate|taza|termo|silla|descanso|sentad/i],
  ['revision-de-cuentas', /calculador|planilla|cuenta|suma|cálculo|número|columna|renglón/i],
  ['archivo-de-asuntos', /archiv|carpeta|expediente|cajón|índice/i],
  ['lista-y-agenda', /lista|agenda|calendario|orden del día/i],
  ['correccion-editorial', /titular|bajada|redacci|edici|adjetivo|verbo|palabra|corrigi|corrigió|tach|comillas|epígrafe/i],
  ['reunion-y-consulta', /reuni|asamblea|consulta|pregunta|votaci|turno de|consejo|mesa/i],
  ['papeles-y-formularios', /formulario|hoja|clip|papel|sello|firma|acta|nota|cuaderno|libreta/i],
  ['carteles-y-mapa', /cartel|tablón|pizarrón|mapa|etiqueta|señalador/i],
  ['comunicacion-publica', /audio|mensaje|grupo|declaraci|micrófono|informe|anuncio/i]
];
function family(text, descriptor) {
  return families.find(([, pattern]) => pattern.test(text))?.[0]
    ?? `observacion:${descriptor.toLowerCase().replace(/^familia de escena: /, '').replace(/:$/, '')}`;
}
function parseDiversity(source) {
  const entries = [];
  for (const line of source.split(/\r?\n/)) {
    const match = line.match(/^- `(ND-(?:H|V|GEN)-[\w-]+)` · \*\*(.*?)\*\*(?: ·)? (.*)$/);
    if (!match) continue;
    const [, reviewId, descriptor, body] = match;
    const sector = reviewId.match(/^ND-([HV])-(CIU|CUL|GRA|MIN|RIO)-([CPIG])-(\d+)$/);
    const gen = reviewId.match(/^ND-GEN-(QUAL-(?:FIRST|ALERT|ST|DN|UP)|RES-(?:UP|DN|ST))-(\d+)$/);
    if (!sector && !gen) throw new Error(`ID no reconocido: ${reviewId}`);
    const number = Number((sector ?? gen).at(-1));
    if (number < 1 || number > 20) throw new Error(`Sufijo inválido: ${reviewId}`);
    const id = sector ? `${sector[1] === 'H' ? 'P' : 'V'}-${sector[2]}-${String(ranges[sector[1]][sector[3]] + number - 1).padStart(2, '0')}`
      : `P-GEN-${String(general[gen[1]] + number - 1).padStart(2, '0')}`;
    const pair = sector?.[1] === 'V' ? null : body.match(/^(.*?) — (.*)$/);
    if (sector?.[1] !== 'V' && !pair) throw new Error(`Pareja incompleta: ${reviewId}`);
    entries.push({ id, condition: sector ? bands[sector[3]] : gen[1],
      headline: pair?.[1] ?? '', subhead: pair?.[2] ?? '', text: pair ? '' : body, optionId: '',
      reviewId, family: family(pair ? `${descriptor} ${pair[2]}` : body, descriptor), editorialLabel: descriptor,
      ...(sector ? { sector: sectors[sector[2]], band: bands[sector[3]], product: sector[1] === 'H' ? 'heraldo' : 'valle' }
        : { topic: gen[1], product: 'heraldo' }),
      ...(guard[reviewId] ? { guard: guard[reviewId] } : {}) });
  }
  if (entries.length !== 960 || new Set(entries.map(entry => entry.reviewId)).size !== 960)
    throw new Error(`Conteo de diversidad inválido: ${entries.length}`);
  return entries;
}
function appendDiversity(entries) {
  const additions = parseDiversity(fs.readFileSync('artifacts/editorial/PropuestaDiversidadEditorial.md', 'utf8'));
  const combined = [...entries, ...additions];
  if (combined.length !== 1257 || new Set(combined.map(entry => entry.id)).size !== 1257)
    throw new Error(`IDs finales duplicados o conteo inválido: ${combined.length}`);
  return combined;
}
module.exports = { parseDiversity, appendDiversity };
