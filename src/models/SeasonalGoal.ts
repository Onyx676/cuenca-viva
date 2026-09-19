import { GameState } from './GameState';
import { SeasonType } from './Season';

export interface SeasonalGoal {
  id: string;
  year: number;
  season: SeasonType;
  title: string;
  description: string;
  hint: string;
  targetCondition: {
    type: 'RESERVOIR_MIN' | 'AQUIFER_MIN' | 'SECTOR_SATISFACTION' | 'PUBLIC_TRUST' | 'BASIN_HEALTH' | 'SURPLUS_WATER';
    threshold: number;
    sectorId?: 'population' | 'agriculture' | 'livestock' | 'mining' | 'ecosystem';
  };
  reward: {
    moneyBonus: number;
    trustBonus: number;
    message: string;
  };
}

export function checkSeasonalGoal(goal: SeasonalGoal, state: GameState): boolean {
  const cond = goal.targetCondition;
  switch (cond.type) {
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
      return sec.allocated >= Math.round(sec.currentDemand * (cond.threshold / 100));
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
