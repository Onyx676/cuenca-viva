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
export function sectorArticle(sector: EditorialSector, rate: number, previous: number | undefined, turn: number, seed: string, receivedMore = false) {
  const band = coverageBand(sector, rate);
  const improved = previous !== undefined && rate > previous;
  const suffixes = band === 'complete' ? ['01', '02'] : band === 'partial' && improved && (sector !== 'mining' || receivedMore) ? ['03']
    : band === 'grave' ? ['05'] : band === 'low' ? ['04'] : [];
  const ids = suffixes.map(suffix => `H-${codes[sector]}-${suffix}`);
  if (sector === 'mining' && rate < .8) ids.push('A-H-16');
  return pickEditorial(ids, turn, seed, `heraldo:${sector}:${band}`);
}
export function mapStory(sector: SectorId, rate: number, previous: number | undefined, turn: number, seed: string,
  carpinchoEvent = false, receivedMore = false, reservoirRecovered = false): { text: string; variant: number } {
  if (!EDITORIAL_SECTORS.includes(sector as EditorialSector)) return { text: '', variant: 0 };
  const id = sector as EditorialSector, band = coverageBand(id, rate);
  const improved = previous !== undefined && rate > previous;
  const suffixes = band === 'complete' ? ['01', '02'] : band === 'partial' ? improved && (id !== 'mining' || receivedMore) ? ['03'] : []
    : band === 'grave' ? ['05'] : ['04'];
  if (rate < 1 && improved && (id !== 'agriculture' || receivedMore)) suffixes.push('06');
  const ids = suffixes.map(suffix => `V-${codes[id]}-${suffix}`);
  const extra = {
    population: band === 'complete' ? ['01', '19'] : ['02', '20'],
    agriculture: band === 'complete' ? ['03', '23'] : ['04'],
    livestock: band === 'complete' ? ['05'] : ['06', '24'],
    mining: band === 'complete' ? ['07', '21'] : ['22'],
    ecosystem: band === 'complete' ? carpinchoEvent ? ['08'] : [] : ['25']
  };
  if (band !== 'partial') ids.push(...extra[id].map(suffix => `A-MAP-${suffix}`));
  // Diálogo ficticio de Tito y Sofía, contextualizado por la reserva real.
  if (id === 'population' && reservoirRecovered) ids.push('A-MAP-26');
  const choice = pickEditorial(ids, turn, seed, `valle:${id}:${band}`);
  return choice ? { text: choice.text ?? '', variant: Number(choice.id.slice(-2)) % 3 }
    : { text: 'Quedó una parte de la necesidad por cubrir.', variant: 0 };
}
