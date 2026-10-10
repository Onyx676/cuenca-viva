const fs = require('node:fs');
const entries = [];
for (const line of fs.readFileSync('artifacts/editorial/PropuestaRevisionEditorial.md', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^- \*\*((?:P-|V-|A-MAP-)[\w-]+) · (.*?):\*\* (.*)$/);
  if (!m) continue;
  const [, id, condition, body] = m;
  if (id.startsWith('P-')) {
    const pair = body.match(/^\*\*(.*?)\*\* — (.*)$/);
    if (!pair) throw new Error(id);
    entries.push({ id, condition, headline: pair[1], subhead: pair[2], text: '',
      optionId: condition.match(/`([^`]+)`/)?.[1] || '' });
  } else entries.push({ id, condition, headline: '', subhead: '', text: body, optionId: '' });
}
// Dos piezas anteriores expresamente conservadas por la revisión.
for (const row of JSON.parse(fs.readFileSync('src/game/ApprovedEditorial.json', 'utf8'))) {
  if (['A-H-17', 'A-H-18'].includes(row.id)) entries.push({ ...row, text: '', optionId: '' });
}
if (entries.length !== 297 || new Set(entries.map(row => row.id)).size !== entries.length)
  throw new Error(`Revisar conteo o IDs: ${entries.length}`);
const integrated = require('./prepare-diversity.cjs').appendDiversity(entries);
fs.writeFileSync('src/game/ApprovedEditorial.json', JSON.stringify(integrated, null, 2) + '\n');
console.log(`${integrated.length} piezas integradas (297 anteriores + 960 de diversidad)`);
