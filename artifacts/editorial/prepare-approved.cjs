const fs = require('node:fs');
const entries = [];
for (const line of fs.readFileSync('artifacts/editorial/BancoEditorial.md', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^- \*\*([AVH][\w-]+) · (.*?):\*\* (.*)$/);
  if (!m) continue;
  const [, id, condition, body] = m;
  if (id.startsWith('V-') || id.startsWith('A-MAP-')) entries.push({ id, condition, text: body });
  else {
    const pair = body.match(/^\*\*(.*?)\*\* — (.*)$/) || body.match(/^«(.*?)»\. Bajada: (.*)$/);
    if (!pair) throw new Error(id);
    entries.push({ id, condition, headline: pair[1], subhead: pair[2] });
  }
}
if (entries.length !== 104) throw new Error(`Revisar conteo: ${entries.length}`);
fs.writeFileSync('src/game/ApprovedEditorial.json', JSON.stringify(entries, null, 2) + '\n');
