import { GameState } from './GameState';
import { SeasonType } from './Season';
import { SeasonWaterBalance } from './Balance';

export const FIRST_GOAL_DISTRIBUTION = { population: 22, agriculture: 6, livestock: 4, mining: 8, ecosystem: 0 } as const;

/** Central's smaller served activity must not request the former city's excess water. */
export function firstGoalDistribution(state: GameState): Record<keyof typeof FIRST_GOAL_DISTRIBUTION, number> {
  if (state.scenarioId !== 'cuenca_central') return { ...FIRST_GOAL_DISTRIBUTION };
  return {
    population: state.sectors.population.currentDemand,
    agriculture: Math.min(6, state.sectors.agriculture.currentDemand),
    livestock: Math.min(4, state.sectors.livestock.currentDemand),
    mining: Math.min(8, state.sectors.mining.currentDemand),
    ecosystem: 0
  };
}

export interface SeasonalGoal {
  id: string;
  year: number;
  season: SeasonType;
  title: string;
  description: string;
  hint: string;
  targetCondition: {
    type: 'CITY_AND_RESERVOIR_MIN' | 'RESERVOIR_MIN' | 'AQUIFER_MIN' | 'SECTOR_SATISFACTION' | 'PUBLIC_TRUST' | 'BASIN_HEALTH' | 'SURPLUS_WATER' | 'COVERAGE_AND_AQUIFER' | 'COVERAGE_AND_RESERVOIR' | 'CITY_AND_SECTOR';
    threshold: number;
    cityCoverageThreshold?: number;
    sectorId?: 'population' | 'agriculture' | 'livestock' | 'mining' | 'ecosystem';
    additionalSectorId?: 'population' | 'agriculture';
    requireNoDeficit?: boolean;
    riverCoverageThreshold?: number;
    reserveTarget?: number;
    minimumProductiveCoverage?: number;
  };
  reward: {
    moneyBonus: number;
    trustBonus: number;
    message: string;
  };
}

export function checkSeasonalGoal(goal: SeasonalGoal, state: GameState, preview?: SeasonWaterBalance): boolean {
  if (state.goalRulesVersion !== 'contextual-v1' || state.scenarioId !== 'cuenca_central') return checkLegacySeasonalGoal(goal, state, preview);
  const b = preview ?? state.seasonHistory.at(-1)?.balance;
  const rate = (id: 'population' | 'agriculture' | 'livestock' | 'mining' | 'ecosystem') => b?.satisfactions[id] ?? state.sectors[id].satisfactionRate;
  const cond = goal.targetCondition;
  if (cond.requireNoDeficit && !(['population', 'agriculture', 'livestock', 'mining', 'ecosystem'] as const).every(id => rate(id) >= 1)) return false;
  const coverage = () => !!cond.sectorId && rate('population') >= (cond.cityCoverageThreshold ?? 85) / 100
    && rate(cond.sectorId) >= cond.threshold / 100
    && rate('ecosystem') >= (cond.riverCoverageThreshold ?? 80) / 100
    && (['agriculture', 'livestock', 'mining'] as const).every(id => rate(id) >= (cond.minimumProductiveCoverage ?? 70) / 100);
  switch (cond.type) {
    case 'COVERAGE_AND_AQUIFER': return coverage() && (b?.aquiferEnd ?? state.aquiferVolume) >= (cond.reserveTarget ?? 0);
    case 'COVERAGE_AND_RESERVOIR': return coverage() && (b?.reservoirEnd ?? state.reservoirVolume) >= (cond.reserveTarget ?? 0);
    case 'CITY_AND_SECTOR': return coverage();
    case 'CITY_AND_RESERVOIR_MIN': return rate('population') >= (cond.cityCoverageThreshold ?? 95) / 100 && (b?.reservoirEnd ?? state.reservoirVolume) >= cond.threshold;
    case 'AQUIFER_MIN': return (b?.aquiferEnd ?? state.aquiferVolume) / state.aquiferCapacity * 100 >= cond.threshold;
    case 'RESERVOIR_MIN': return (b?.reservoirEnd ?? state.reservoirVolume) / state.reservoirCapacity * 100 >= cond.threshold;
    case 'SECTOR_SATISFACTION': return !!cond.sectorId && rate(cond.sectorId) >= cond.threshold / 100 && (!cond.additionalSectorId || rate(cond.additionalSectorId) >= cond.threshold / 100);
    case 'PUBLIC_TRUST': return (b?.publicTrust ?? state.publicTrust) >= cond.threshold;
    case 'BASIN_HEALTH': return (b?.basinHealth ?? state.basinHealth) >= cond.threshold;
    // Budget includes potential extraction; it is not a natural-water/sustainability test.
    case 'SURPLUS_WATER': return !!b && b.aquiferEnd >= b.aquiferStart && rate('population') >= .85 && rate('ecosystem') >= .8;
    default: return false;
  }
}

/** Model 2.5 replay must preserve its rewards, including its historical limitations. */
function checkLegacySeasonalGoal(goal: SeasonalGoal, state: GameState, preview?: SeasonWaterBalance): boolean {
  const cond = goal.targetCondition;
  if (cond.requireNoDeficit && state.seasonHistory.at(-1)?.balance.unmetAllocation !== 0) return false;
  switch (cond.type) {
    case 'CITY_AND_RESERVOIR_MIN':
      return (preview?.reservoirEnd ?? state.reservoirVolume) >= cond.threshold
        && (preview?.satisfactions.population ?? state.sectors.population.satisfactionRate) >= (cond.cityCoverageThreshold ?? 95) / 100;
    case 'RESERVOIR_MIN': {
      const percent = (state.reservoirVolume / state.reservoirCapacity) * 100;
      return percent >= cond.threshold;
    }
    case 'AQUIFER_MIN': {
      const percent = (state.aquiferVolume / state.aquiferCapacity) * 100;
      return percent >= cond.threshold;
    }
    case 'SECTOR_SATISFACTION': {
      if (!cond.sectorId) return false;
      const sec = state.sectors[cond.sectorId];
      const reached = sec.satisfactionRate >= cond.threshold / 100;
      return reached && (!cond.additionalSectorId || state.sectors[cond.additionalSectorId].satisfactionRate >= cond.threshold / 100);
    }
    case 'PUBLIC_TRUST': {
      return state.publicTrust >= cond.threshold;
    }
    case 'BASIN_HEALTH': {
      return state.basinHealth >= cond.threshold;
    }
    case 'SURPLUS_WATER': {
      return state.availableWater >= state.currentAllocatedTotal;
    }
    default:
      return true;
  }
}
