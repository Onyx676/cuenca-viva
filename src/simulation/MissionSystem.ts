import goalsData from '../data/seasonalGoals.json';
import type { GameState } from '../models/GameState';
import type { SeasonWaterBalance } from '../models/Balance';
import type { SeasonalGoal } from '../models/SeasonalGoal';
import { SeededRandom } from './RandomSystem';

type Focus = 'agriculture' | 'livestock' | 'mining';
type Requests = Record<'population' | Focus | 'ecosystem', number>;
const FOCI: Focus[] = ['agriculture', 'livestock', 'mining'];
const LABELS = { agriculture: 'Cultivos', livestock: 'Granja', mining: 'Mina' };
export function legacySeasonalGoal(state: GameState): SeasonalGoal | undefined {
  return (goalsData as SeasonalGoal[]).find(g => g.year === state.year && g.season === state.season);
}

/** Called once on entry, before interactive event choices and purchases. This RNG
 * is separate from weather/events; previews use detached state and draw no randomness.
 * Targets are absolute drops, so expanding capacity never moves the target.
 */
export function selectSeasonalGoal(state: GameState, preview: (requests: Requests) => SeasonWaterBalance): SeasonalGoal | undefined {
  const legacy = legacySeasonalGoal(state);
  if (!legacy || state.scenarioId !== 'cuenca_central' || state.turn === 1) return legacy;
  const rng = new SeededRandom(`${state.seed}:missions:v1:${state.scenarioId}:${state.turn}`);
  const focus = rng.pick(FOCI);
  const preferAquifer = rng.next() < .5;
  const baselineRequests = Object.fromEntries(['population', ...FOCI, 'ecosystem'].map(id => [id,
    id === 'ecosystem' ? 0 : state.sectors[id as keyof typeof state.sectors].currentDemand])) as Requests;
  const full = preview(baselineRequests);
  const feasible: SeasonWaterBalance[] = [];
  // Look for witnesses respecting every productive sector. Mission generation
  // does not recommend a distribution or silently apply the witness to the player.
  for (const city of [.85, 1]) for (const productive of [.7, .8, 1]) {
    const requests: Requests = { population: Math.ceil(state.sectors.population.currentDemand * city), agriculture: 0, livestock: 0, mining: 0, ecosystem: 0 };
    for (const id of FOCI) requests[id] = Math.ceil(state.sectors[id].currentDemand * Math.max(productive, id === focus ? .8 : 0));
    for (let eco = 0; eco <= state.sectors.ecosystem.currentDemand; eco++) {
      const b = preview({ ...requests, ecosystem: eco });
      if (b.satisfactions.population >= .85 && b.satisfactions[focus] >= .8
        && FOCI.every(id => b.satisfactions[id] >= .7) && b.satisfactions.ecosystem >= .8) feasible.push(b);
    }
  }
  const coverage = `Ciudad ≥85% · ${LABELS[focus]} ≥80% · otros usos productivos ≥70% · río ≥80%.`;
  const base: SeasonalGoal = { ...legacy, id: `mission-v1-${state.turn}-${focus}`, title: `🤝 ${LABELS[focus]} y el valle`,
    description: coverage, hint: 'Las coberturas son agua realmente recibida. El aporte adicional al humedal no es todo el caudal del río.',
    targetCondition: { type: 'CITY_AND_SECTOR', threshold: 80, cityCoverageThreshold: 85, sectorId: focus,
      riverCoverageThreshold: 80, minimumProductiveCoverage: 70 }, reward: { ...legacy.reward, message: 'Se cumplió el desafío de abastecimiento y cuidado del valle.' } };
  const mixed: SeasonalGoal[] = [];
  for (const aquifer of [preferAquifer, !preferAquifer]) {
    const field = aquifer ? 'aquiferEnd' : 'reservoirEnd';
    const start = aquifer ? state.aquiferVolume : state.reservoirVolume;
    const max = Math.max(-1, ...feasible.map(b => b[field]));
    // Preserve the aquifer's current stock; under its existing 40% attention
    // boundary, seek a visible gain of up to five drops. Reservoir uses the
    // existing 25-drop advice reference, recovering up to five when below it.
    const wanted = aquifer ? (start < state.aquiferCapacity * .4 ? start + 5 : start)
      : (start < 25 ? Math.min(25, start + 5) : 25);
    const lower = aquifer && start >= state.aquiferCapacity * .4 ? start : start < (aquifer ? state.aquiferCapacity * .4 : 25) ? start + 1 : 25;
    if (max < lower || max < 1) continue;
    const target = Math.min(max, Math.max(wanted, full[field] + 1));
    if (target < lower) continue;
    mixed.push({ ...base, id: `${base.id}-${aquifer ? 'aquifer' : 'reservoir'}`, title: aquifer ? `💧 ${LABELS[focus]} y agua bajo tierra` : `🏞️ ${LABELS[focus]} y reserva para después`,
      description: `${coverage} ${aquifer ? 'Acuífero' : 'Embalse'} al cierre: al menos ${target} gotas${target > start ? ` (+${target - start} desde el inicio)` : ''}.`,
      hint: 'La meta se fijó al comenzar la estación. Compará cobertura y reserva final; comprar una obra no aumenta esta meta.',
      targetCondition: { ...base.targetCondition, type: aquifer ? 'COVERAGE_AND_AQUIFER' : 'COVERAGE_AND_RESERVOIR', reserveTarget: target } });
  }
  if (mixed.length) return mixed.find(goal => goal.targetCondition.reserveTarget! >
    full[goal.targetCondition.type === 'COVERAGE_AND_AQUIFER' ? 'aquiferEnd' : 'reservoirEnd']) ?? mixed[0];
  // No invented zero-drop recovery goal. If reserves cannot be protected with
  // these coverages, the explicitly stated challenge is coverage only.
  return { ...base, title: `🤝 ${LABELS[focus]} sin dejar afuera al valle`,
    hint: feasible.length ? 'Esta estación prioriza coberturas; no promete recuperación de reservas.'
      : 'Con las reservas actuales, los repartos comprobados al inicio no alcanzan estas coberturas; revisá la vista previa. No se garantiza que otra inversión sea asequible.' };
}

export function goalProgress(goal: SeasonalGoal, b: SeasonWaterBalance): string {
  const c = goal.targetCondition;
  if (!['COVERAGE_AND_AQUIFER', 'COVERAGE_AND_RESERVOIR', 'CITY_AND_SECTOR'].includes(c.type) || !c.sectorId) return '';
  const names = { population: 'Ciudad', agriculture: 'Cultivos', livestock: 'Granja', mining: 'Mina', ecosystem: 'Río' };
  const checks = [`Ciudad ${Math.floor(b.satisfactions.population * 100)}/85%`,
    `${names[c.sectorId]} ${Math.floor(b.satisfactions[c.sectorId] * 100)}/${c.threshold}%`,
    `otros ${Math.floor(Math.min(...FOCI.filter(id => id !== c.sectorId).map(id => b.satisfactions[id])) * 100)}/70%`,
    `río ${Math.floor(b.satisfactions.ecosystem * 100)}/80%`];
  if (c.type === 'COVERAGE_AND_AQUIFER') checks.push(`acuífero ${b.aquiferEnd}/${c.reserveTarget} gotas`);
  if (c.type === 'COVERAGE_AND_RESERVOIR') checks.push(`embalse ${b.reservoirEnd}/${c.reserveTarget} gotas`);
  return checks.join(' · ');
}
