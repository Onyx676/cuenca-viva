import bank from './ApprovedEditorial.json';
import { SeededRandom } from '../simulation/RandomSystem';
import type { SectorId } from '../models/Sector';
import type { SeasonResult } from '../models/Balance';
import { unpackEditorialSeed } from './EditorialSession';
export const EDITORIAL_SECTORS = ['population', 'agriculture', 'livestock', 'mining', 'ecosystem'] as const;
export type EditorialSector = typeof EDITORIAL_SECTORS[number];
const codes = { population: 'CIU', agriculture: 'CUL', livestock: 'GRA', mining: 'MIN', ecosystem: 'RIO' };

export interface EditorialLedger {
  used: Map<string, number>;
  families: Map<string, number>;
  choices: Map<string, typeof bank[number]>;
}
export function createEditorialLedger(): EditorialLedger {
  return { used: new Map(), families: new Map(), choices: new Map() };
}
const rejected = new Set(['V-RIO-12']);
// Familias del banco aprobado que cuentan esencialmente el mismo chiste.
// Los nuevos textos pueden declarar family explícitamente.
const relatedFamilies: Record<string, string> = {
  'V-CIU-01': 'grupo-barrio-perro', 'V-CIU-02': 'grupo-barrio-perro',
  'V-CIU-12': 'grupo-barrio-perro', 'A-MAP-01': 'grupo-barrio-perro',
  'V-MIN-02': 'rosa-fotografia-ferrada', 'A-MAP-21': 'rosa-fotografia-ferrada',
  'P-MIN-01': 'rosa-fotografia-ferrada', 'P-MIN-12': 'rosa-fotografia-ferrada', 'P-MIN-19': 'rosa-fotografia-ferrada'
};
function editorialFamily(entry: typeof bank[number]): string {
  return (entry as typeof entry & { family?: string }).family ?? relatedFamilies[entry.id] ?? entry.id;
}
export function pickEditorial(ids: string[], turn: number, seed: string, topic: string, ledger?: EditorialLedger) {
  const entries = bank.filter(entry => ids.includes(entry.id) && !rejected.has(entry.id));
  if (!entries.length) return undefined;
  const key = `${turn}:${topic}`;
  const repeatedQuery = ledger?.choices.get(key);
  if (repeatedQuery) return repeatedQuery;
  const edition = Math.max(0, turn - 1);
  // Azar editorial independiente del generador del motor.
  const presentation = unpackEditorialSeed(seed);
  const rng = new SeededRandom(`${presentation.seed}:approved:${topic}:${Math.floor(edition / entries.length)}`);
  for (let i = entries.length - 1; i > 0; i--) {
    const swap = rng.rangeInt(0, i);
    [entries[i], entries[swap]] = [entries[swap], entries[i]];
  }
  let openingCycle = entries;
  if (seed.startsWith('EDITORIAL_SESSION:')) {
    // Space known near-duplicates in the cyclic opening bag as well: five new
    // games must not put both "Sofía silenció" wordings next to each other.
    const spaced: typeof entries = [], duplicates: typeof entries = [];
    for (const entry of entries) {
      if (spaced.some(row => editorialFamily(row) === editorialFamily(entry))) duplicates.push(entry);
      else spaced.push(entry);
    }
    for (const entry of duplicates) {
      const gap = spaced.findIndex((row, index) => index > 0
        && editorialFamily(row) !== editorialFamily(entry)
        && editorialFamily(spaced[index - 1]) !== editorialFamily(entry));
      spaced.splice(gap < 0 ? spaced.length : gap, 0, entry);
    }
    const groups = [...new Set(entries.map(editorialFamily))].map(family => entries.filter(entry => editorialFamily(entry) === family));
    const dominant = groups.reduce((largest, group) => group.length > largest.length ? group : largest);
    const other = entries.filter(entry => editorialFamily(entry) !== editorialFamily(dominant[0]));
    // The approved City bank contains four dog jokes and only two alternatives.
    // Repeat an alternative when necessary to avoid dog/dog openings, instead
    // of treating four wordings as four genuinely different situations.
    openingCycle = other.length && dominant.length > other.length
      ? dominant.flatMap((entry, index) => [entry, other[index % other.length]]) : spaced;
  }
  // Same gameplay seed, different new game: rotate a common shuffled bag,
  // rather than hash each session independently and risk the same opening draw.
  const first = openingCycle[presentation.rotation % openingCycle.length];
  const rotation = entries.findIndex(entry => entry.id === first.id);
  entries.push(...entries.splice(0, rotation));
  if (!ledger) return entries[edition % entries.length];
  // Otra redacción del mismo chiste no es una alternativa fresca. Evitar
  // familias de la estación anterior cuando exista otra opción compatible.
  const notRecent = entries.filter(entry => (ledger.families.get(editorialFamily(entry)) ?? -1) < turn - 1);
  const compatible = notRecent.length ? notRecent : entries;
  const unused = compatible.filter(entry => !ledger.used.has(entry.id));
  const available = unused.length ? unused : compatible.filter(entry =>
    ledger.used.get(entry.id) === Math.min(...compatible.map(row => ledger.used.get(row.id) ?? -1)));
  const oldestFamily = Math.min(...available.map(entry => ledger.families.get(editorialFamily(entry)) ?? -1));
  const choice = available.find(entry => (ledger.families.get(editorialFamily(entry)) ?? -1) === oldestFamily)!;
  ledger.used.set(choice.id, turn);
  ledger.families.set(editorialFamily(choice), turn);
  ledger.choices.set(key, choice);
  return choice;
}
export function coverageBand(sector: EditorialSector, rate: number) {
  return rate >= 1 ? 'complete' : rate >= (sector === 'ecosystem' ? .75 : .8) ? 'partial'
    : rate < (sector === 'ecosystem' ? .55 : .5) ? 'grave' : 'low';
}
export function editorialCoveragePool(product: 'heraldo' | 'valle', sector: EditorialSector,
  band: ReturnType<typeof coverageBand>, rate: number, previous?: number): string[] {
  return bank.filter(entry => 'reviewId' in entry && entry.product === product && entry.sector === sector && entry.band === band
    && (entry.guard !== 'coverageImproved' || previous !== undefined && rate > previous)
    && (entry.guard !== 'lessThanHalf' || rate < .5)).map(entry => entry.id);
}
export function editorialGeneralPool(topic: string, previousQuality?: number): string[] {
  return bank.filter(entry => 'reviewId' in entry && entry.topic === topic
    && (entry.guard !== 'enteredQualityAlert' || previousQuality !== undefined && previousQuality >= 60)).map(entry => entry.id);
}
export function eventArticle(optionId: string | undefined, turn: number, seed: string, ledger?: EditorialLedger) {
  if (!optionId) return undefined;
  return pickEditorial(bank.filter(entry => entry.optionId === optionId).map(entry => entry.id), turn, seed, `event:${optionId}`, ledger);
}
export function sectorArticle(sector: EditorialSector, rate: number, previous: number | undefined, turn: number, seed: string, receivedMore = false, ledger?: EditorialLedger) {
  const band = coverageBand(sector, rate);
  const improved = previous !== undefined && rate > previous;
  // Las piezas nuevas comparan cobertura, no volumen: no necesitan receivedMore.
  const ids = editorialCoveragePool('heraldo', sector, band, rate, previous);
  if (rate < 1 && improved) ids.push(...['09', '15', '16', '22', '23'].map(suffix => `P-${codes[sector]}-${suffix}`));
  return pickEditorial(ids, turn, seed, `heraldo:${sector}:${band}`, ledger);
}
export function mapStory(sector: SectorId, rate: number, previous: number | undefined, turn: number, seed: string,
  carpinchoEvent = false, receivedMore = false, reservoirRecovered = false, history: readonly SeasonResult[] = []): { text: string; variant: number } {
  const ledger = createEditorialLedger();
  const priorRows = history.filter(row => row.turn < turn).sort((a, b) => a.turn - b.turn);
  for (const row of priorRows) {
    const prior = history.find(item => item.turn === row.turn - 1);
    const carpincho = history.some(item => item.turn <= row.turn && item.events.some(record => record.event.id === 'clara_carpincho'));
    chooseMapStory(sector, row.balance.satisfactions[sector], prior?.balance.satisfactions[sector], row.turn, seed,
      carpincho, !!prior && row.balance.suppliedAllocations[sector] > prior.balance.suppliedAllocations[sector],
      row.balance.reservoirEnd > row.balance.reservoirStart, ledger);
  }
  return chooseMapStory(sector, rate, previous, turn, seed, carpinchoEvent, receivedMore, reservoirRecovered,
    history.length ? ledger : undefined);
}
function chooseMapStory(sector: SectorId, rate: number, previous: number | undefined, turn: number, seed: string,
  carpinchoEvent: boolean, receivedMore: boolean, reservoirRecovered: boolean, ledger?: EditorialLedger): { text: string; variant: number } {
  if (!EDITORIAL_SECTORS.includes(sector as EditorialSector)) return { text: '', variant: 0 };
  const id = sector as EditorialSector, band = coverageBand(id, rate);
  const improved = previous !== undefined && rate > previous;
  const suffixes: string[] = [];
  if (band === 'partial' && improved && (id !== 'mining' || receivedMore)) suffixes.push('03');
  if (rate < 1 && improved) suffixes.push('06', '10', '11');
  const ids = editorialCoveragePool('valle', id, band, rate, previous);
  ids.push(...suffixes.map(suffix => `V-${codes[id]}-${suffix}`));
  // Conservar sólo extras que necesitan un contexto realmente registrado.
  if (id === 'ecosystem' && band === 'complete' && carpinchoEvent) ids.push('A-MAP-08');
  // Escena ficticia contextualizada por la reserva real.
  if (id === 'population' && reservoirRecovered) ids.push('A-MAP-26');
  const choice = pickEditorial(ids, turn, seed, `valle:${id}:${band}`, ledger);
  return choice ? { text: choice.text ?? '', variant: Number(choice.id.slice(-2)) % 3 }
    : { text: 'Quedó una parte de la necesidad por cubrir.', variant: 0 };
}
