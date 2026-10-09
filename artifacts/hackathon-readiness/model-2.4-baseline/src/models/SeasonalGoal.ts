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
    type: 'CITY_AND_RESERVOIR_MIN' | 'RESERVOIR_MIN' | 'AQUIFER_MIN' | 'SECTOR_SATISFACTION' | 'PUBLIC_TRUST' | 'BASIN_HEALTH' | 'SURPLUS_WATER';
    threshold: number;
    cityCoverageThreshold?: number;
    sectorId?: 'population' | 'agriculture' | 'livestock' | 'mining' | 'ecosystem';
    additionalSectorId?: 'population' | 'agriculture';
    requireNoDeficit?: boolean;
  };
  reward: {
    moneyBonus: number;
    trustBonus: number;
    message: string;
  };
}

export function checkSeasonalGoal(goal: SeasonalGoal, state: GameState, preview?: SeasonWaterBalance): boolean {
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
