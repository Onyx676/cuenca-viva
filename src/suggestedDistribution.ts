import type { SimulationEngine } from './simulation/SimulationEngine';
import type { SectorId } from './models/Sector';
import type { SeasonalGoal } from './models/SeasonalGoal';
import { firstGoalDistribution } from './models/SeasonalGoal';

const SECTORS = ['population', 'agriculture', 'livestock', 'mining', 'ecosystem'] as const;
const PRODUCTIVE = ['agriculture', 'livestock', 'mining'] as const;
type Distribution = Record<typeof SECTORS[number], number>;

/** Starting policy, not an optimizer or a promise of mission success.
 * City first, productive target 80%; actual downstream flow determines extra eco water.
 * Winter/spring can trade coverage down to 70% for real recovery of low reserves.
 * Every trial restores allocations, including on failure.
 */
export function suggestDistribution(engine: SimulationEngine, goal?: SeasonalGoal): Distribution {
  const state = engine.getState();
  // The larger scenarios retain their previous policy pending a separate calibration.
  if (state.scenarioId !== 'cuenca_central') return legacySuggestDistribution(engine, goal);
  if (state.year === 1 && state.season === 'WINTER' && goal?.id === 'goal_y1_w') return firstGoalDistribution(state);
  const demand = (id: typeof SECTORS[number]) => state.sectors[id].currentDemand;
  const allocation: Distribution = { population: 0, agriculture: 0, livestock: 0, mining: 0, ecosystem: 0 };
  const original = SECTORS.map(id => state.sectors[id].allocated);
  const originalTotal = state.currentAllocatedTotal;
  const originalUnallocated = state.unallocatedWater;
  const total = () => SECTORS.reduce((sum, id) => sum + allocation[id], 0);
  const donors = () => [...PRODUCTIVE].sort((a, b) => allocation[b] / demand(b) - allocation[a] / demand(a));
  try {
    const preview = () => {
      for (const id of SECTORS) engine.setSectorAllocation(id, allocation[id]);
      return engine.previewSeason().balance;
    };
    // Urban presence first; productive minima only within the remaining budget.
    let remaining = Math.max(0, Math.floor(state.availableWater));
    if (remaining > 0 && demand('population') > 0) {
      allocation.population = 1;
      remaining--;
    }
    for (const id of PRODUCTIVE) if (remaining > 0 && demand(id) > 0) {
      allocation[id] = 1;
      remaining--;
    }
    const urbanExtra = Math.min(demand('population') - allocation.population, remaining);
    allocation.population += urbanExtra;
    remaining -= urbanExtra;
    // Fill lowest relative coverage first, fixed sector order for ties.
    while (remaining > 0) {
      const id = [...PRODUCTIVE].sort((a, b) => allocation[a] / demand(a) - allocation[b] / demand(b))
        .find(id => allocation[id] < Math.ceil(demand(id) * 0.8));
      if (!id) break;
      allocation[id]++;
      remaining--;
    }
    let balance = preview();
    // A legal budget alone must not hide requested water that cannot be supplied.
    while (balance.unmetAllocation > 0 && total() > 0) {
      const id = donors().find(id => allocation[id] > 1)
        ?? (allocation.population > 0 ? 'population' : donors().find(id => allocation[id] > 0));
      if (!id) break;
      allocation[id]--;
      balance = preview();
    }
    // Bounded scan: return-flow rounding can cause plateaus. Keep the least tested
    // contribution reaching full flow, or the best partial improvement.
    let best = { ...allocation };
    let bestBalance = balance;
    for (let eco = 1; balance.satisfactions.ecosystem < 1 && eco <= demand('ecosystem'); eco++) {
      if (total() >= state.availableWater) {
        const donor = donors().find(id => allocation[id] > 1);
        if (!donor) break;
        allocation[donor]--;
      }
      allocation.ecosystem++;
      balance = preview();
      if (balance.unmetAllocation > 0) break;
      if (balance.satisfactions.ecosystem > bestBalance.satisfactions.ecosystem) {
        best = { ...allocation };
        bestBalance = balance;
      }
    }
    Object.assign(allocation, best);
    balance = bestBalance;
    // Voluntary savings in replenishment windows, only with basic city/river coverage.
    // Accept cuts only when actual storage increases, not the unallocated counter.
    const recoveryWindow = state.season === 'WINTER' || state.season === 'SPRING';
    const lowReserve = state.reservoirVolume < state.reservoirCapacity * 0.6
      || state.aquiferVolume < state.aquiferCapacity * 0.4;
    if (recoveryWindow && lowReserve && balance.satisfactions.population >= 0.95
      && balance.satisfactions.ecosystem >= 0.9) {
      for (const id of donors()) {
        while (allocation[id] > Math.ceil(demand(id) * 0.7)) {
          allocation[id]--;
          const candidate = preview();
          if (candidate.reservoirEnd <= balance.reservoirEnd || candidate.aquiferEnd < balance.aquiferEnd
            || candidate.satisfactions.ecosystem < balance.satisfactions.ecosystem) {
            allocation[id]++;
            break;
          }
          balance = candidate;
        }
      }
    }
    return allocation;
  } finally {
    SECTORS.forEach((id, index) => { state.sectors[id].allocated = original[index]; });
    state.currentAllocatedTotal = originalTotal;
    state.unallocatedWater = originalUnallocated;
  }
}

// Previous general policy preserved byte-for-byte below (apart from its function name).
/** UI-only starting point. Trial allocations are restored even if a preview fails. */
function legacySuggestDistribution(engine: SimulationEngine, goal?: SeasonalGoal): Distribution {
  const state = engine.getState();
  if (state.year === 1 && state.season === 'WINTER' && goal?.id === 'goal_y1_w') {
    return firstGoalDistribution(state);
  }
  const available = state.availableWater;
  const sectors = state.sectors;

  // 1. Ciudad: satisfacer demanda, con tope de 45% del agua disponible en sequías extremas
  const popDemand = sectors.population.currentDemand;
  const popTarget = Math.min(popDemand, Math.max(1, Math.floor(available * 0.45)));

  let remaining = Math.max(0, available - popTarget);

  // 2. Caudal ecológico del río
  const ecoDemand = sectors.ecosystem.currentDemand;
  const ecoTarget = Math.min(ecoDemand, remaining);
  remaining = Math.max(0, remaining - ecoTarget);

  // 3. Sectores productivos (agri, live, min) de manera equitativa proporcional
  const totalProdDemand =
    sectors.agriculture.currentDemand + sectors.livestock.currentDemand + sectors.mining.currentDemand;
  let agriAlloc = 0;
  let liveAlloc = 0;
  let minAlloc = 0;

  if (totalProdDemand > 0 && remaining > 0) {
    if (remaining >= totalProdDemand) {
      agriAlloc = sectors.agriculture.currentDemand;
      liveAlloc = sectors.livestock.currentDemand;
      minAlloc = sectors.mining.currentDemand;
    } else {
      const ratio = remaining / totalProdDemand;
      agriAlloc = Math.floor(sectors.agriculture.currentDemand * ratio);
      liveAlloc = Math.floor(sectors.livestock.currentDemand * ratio);
      minAlloc = Math.floor(sectors.mining.currentDemand * ratio);

      let rem = remaining - (agriAlloc + liveAlloc + minAlloc);
      if (rem > 0 && agriAlloc < sectors.agriculture.currentDemand) {
        agriAlloc++;
        rem--;
      }
      if (rem > 0 && liveAlloc < sectors.livestock.currentDemand) {
        liveAlloc++;
        rem--;
      }
      if (rem > 0 && minAlloc < sectors.mining.currentDemand) {
        minAlloc++;
        rem--;
      }
    }
  }

  const allocation: Distribution = {
    population: popTarget, agriculture: agriAlloc, livestock: liveAlloc, mining: minAlloc, ecosystem: ecoTarget
  };
  const original = SECTORS.map(id => state.sectors[id].allocated);
  const originalTotal = state.currentAllocatedTotal;
  const originalUnallocated = state.unallocatedWater;
  try {
    const preview = () => {
      for (const id of SECTORS) engine.setSectorAllocation(id, allocation[id]);
      return engine.previewSeason().balance;
    };
    const baseline = preview();
    // Preserve full ecological coverage when present, and never worsen an existing shortfall.
    const ecoFloor = baseline.satisfactions.ecosystem;
    const safe = (balance: typeof baseline) => balance.satisfactions.ecosystem >= ecoFloor
      && balance.reservoirEnd >= baseline.reservoirEnd
      && balance.aquiferEnd >= baseline.aquiferEnd
      && balance.unmetAllocation <= baseline.unmetAllocation;
    let balance = baseline;
    const transfer = (id: Exclude<SectorId, 'reserve' | 'ecosystem'>, target: number) => {
      while (allocation.ecosystem > 0 && balance.satisfactions[id] < target
        && allocation[id] < state.sectors[id].currentDemand) {
        allocation.ecosystem--;
        allocation[id]++;
        const candidate = preview();
        if (!safe(candidate)) {
          allocation.ecosystem++;
          allocation[id]--;
          break;
        }
        balance = candidate;
      }
    };
    const cond = goal?.targetCondition;
    let sectorGoalReachable = true;
    if (cond?.type === 'SECTOR_SATISFACTION' && cond.sectorId && cond.sectorId !== 'ecosystem') {
      const beforeGoal = { ...allocation };
      const beforeGoalBalance = balance;
      transfer(cond.sectorId, cond.threshold / 100);
      if (cond.additionalSectorId) transfer(cond.additionalSectorId, cond.threshold / 100);
      sectorGoalReachable = balance.satisfactions[cond.sectorId] >= cond.threshold / 100
        && (!cond.additionalSectorId || balance.satisfactions[cond.additionalSectorId] >= cond.threshold / 100);
      // If the mission cannot be reached with this donor, keep urban coverage as the fallback.
      if (!sectorGoalReachable && (cond.sectorId !== 'population' || cond.additionalSectorId)) {
        Object.assign(allocation, beforeGoal);
        balance = beforeGoalBalance;
      }
    }
    // City-specific missions stop at their target; other missions aim for full urban coverage.
    const cityTarget = cond?.type === 'CITY_AND_RESERVOIR_MIN' ? (cond.cityCoverageThreshold ?? 95) / 100
      : cond?.type === 'SECTOR_SATISFACTION' && cond.sectorId === 'population' && sectorGoalReachable ? cond.threshold / 100 : 1;
    transfer('population', cityTarget);
    // Do not request extra wetland water when downstream flow already covers its demand.
    while (allocation.ecosystem > 0 && balance.satisfactions.ecosystem >= 1) {
      allocation.ecosystem--;
      const candidate = preview();
      if (!safe(candidate)) {
        allocation.ecosystem++;
        break;
      }
      balance = candidate;
    }
    return allocation;
  } finally {
    SECTORS.forEach((id, index) => { state.sectors[id].allocated = original[index]; });
    state.currentAllocatedTotal = originalTotal;
    state.unallocatedWater = originalUnallocated;
  }
}
