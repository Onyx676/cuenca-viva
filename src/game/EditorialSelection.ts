import bank from './ApprovedEditorial.json';
import { SeededRandom } from '../simulation/RandomSystem';
import type { SectorId } from '../models/Sector';
export const EDITORIAL_SECTORS = ['population', 'agriculture', 'livestock', 'mining', 'ecosystem'] as const;
export type EditorialSector = typeof EDITORIAL_SECTORS[number];
const codes = { population: 'CIU', agriculture: 'CUL', livestock: 'GRA', mining: 'MIN', ecosystem: 'RIO' };

export function pickEditorial(ids: string[], turn: number, seed: string, topic: string) {
  const entries = bank.filter(entry => ids.includes(entry.id));
  if (!entries.length) return undefined;
  const edition = Math.max(0, turn - 1);
  // Azar editorial independiente del generador del motor.
  const rng = new SeededRandom(`${seed}:approved:${topic}:${Math.floor(edition / entries.length)}`);
  for (let i = entries.length - 1; i > 0; i--) {
    const swap = rng.rangeInt(0, i);
    [entries[i], entries[swap]] = [entries[swap], entries[i]];
  }
  return entries[edition % entries.length];
}
export function coverageBand(sector: EditorialSector, rate: number) {
  return rate >= 1 ? 'complete' : rate >= (sector === 'ecosystem' ? .75 : .8) ? 'partial'
    : rate < (sector === 'ecosystem' ? .55 : .5) ? 'grave' : 'low';
}
export function eventArticle(optionId: string | undefined, turn: number, seed: string) {
  if (!optionId) return undefined;
  return pickEditorial(bank.filter(entry => entry.optionId === optionId).map(entry => entry.id), turn, seed, `event:${optionId}`);
}
export function sectorArticle(sector: EditorialSector, rate: number, previous: number | undefined, turn: number, seed: string, receivedMore = false) {
  const band = coverageBand(sector, rate);
  const improved = previous !== undefined && rate > previous;
  // Las piezas nuevas comparan cobertura, no volumen: no necesitan receivedMore.
  const suffixes = band === 'complete' ? ['01', '02', '10', '17']
    : band === 'partial' ? ['03', '04', '11', '12', '18', '19']
    : band === 'grave' ? ['07', '08', '14', '21'] : ['05', '06', '13', '20'];
  if (rate < 1 && improved) suffixes.push('09', '15', '16', '22', '23');
  const ids = suffixes.map(suffix => `P-${codes[sector]}-${suffix}`);
  return pickEditorial(ids, turn, seed, `heraldo:${sector}:${band}`);
}
export function mapStory(sector: SectorId, rate: number, previous: number | undefined, turn: number, seed: string,
  carpinchoEvent = false, receivedMore = false, reservoirRecovered = false): { text: string; variant: number } {
  if (!EDITORIAL_SECTORS.includes(sector as EditorialSector)) return { text: '', variant: 0 };
  const id = sector as EditorialSector, band = coverageBand(id, rate);
  const improved = previous !== undefined && rate > previous;
  const suffixes = band === 'complete' ? ['01', '02', '12'] : band === 'partial' ? ['07', '08', '09']
    : band === 'grave' ? ['05', '15', '16'] : ['04', '13', '14'];
  if (band === 'partial' && improved && (id !== 'mining' || receivedMore)) suffixes.push('03');
  if (rate < 1 && improved) suffixes.push('06', '10', '11');
  const ids = suffixes.map(suffix => `V-${codes[id]}-${suffix}`);
  const extra = {
    population: band === 'complete' ? ['01', '19', '20'] : band === 'grave' ? ['02'] : ['02', '20'],
    agriculture: band === 'complete' ? ['03', '23'] : ['04'],
    livestock: band === 'complete' ? ['05'] : ['06', '24'],
    mining: band === 'complete' ? ['07', '21'] : ['22'],
    ecosystem: band === 'complete' ? carpinchoEvent ? ['08'] : [] : ['25']
  };
  if (band !== 'partial') ids.push(...extra[id].map(suffix => `A-MAP-${suffix}`));
  // Escena ficticia contextualizada por la reserva real.
  if (id === 'population' && reservoirRecovered) ids.push('A-MAP-26');
  const choice = pickEditorial(ids, turn, seed, `valle:${id}:${band}`);
  return choice ? { text: choice.text ?? '', variant: Number(choice.id.slice(-2)) % 3 }
    : { text: 'Quedó una parte de la necesidad por cubrir.', variant: 0 };
}
