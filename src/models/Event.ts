import { ClimateStateType } from './ClimateState';
import { SeasonType } from './Season';

export type EventType = 'CLIMATE' | 'HUMAN' | 'HUMAN_CONDITIONAL' | 'OPPORTUNITY';

export interface EventOption {
  id: string;
  label: string;
  description: string;
  requiresUpgrade?: string; // Solo elegible si se posee la mejora
  effects: {
    reservoirDelta?: number;
    aquiferDelta?: number;
    moneyDelta?: number;
    trustDelta?: number;
    basinHealthDelta?: number;
    waterQualityDelta?: number;
    agriDamage?: number;
    floodDamageAvoided?: boolean;
  };
  consequenceText: string;
}

export interface EventConditions {
  seasons?: SeasonType[];
  climateStates?: ClimateStateType[];
  upgradeNotOwned?: string;
  aquiferThreshold?: number;
  minTrust?: number;
  minBasinHealth?: number;
  minYear?: number;
  probability: number;
}

export interface GameEvent {
  id: string;
  name: string;
  type: EventType;
  description: string;
  conditions: EventConditions;
  isInteractive?: boolean;
  options?: EventOption[];
  effects?: {
    rainfallBonus?: number;
    rainfallPenalty?: number;
    snowBonus?: number;
    snowPenalty?: number;
    snowMeltSurge?: number;
    aquiferRechargeBonus?: number;
    runoffSurge?: number;
    moneyBonus?: number;
    moneyPenalty?: number;
    trustBonus?: number;
    trustPenalty?: number;
    basinHealthBonus?: number;
    basinHealthPenalty?: number;
    waterQualityPenalty?: number;
  };
  narrativeMitigated?: string;
  narrativeUnmitigated?: string;
}

export interface TriggeredEventRecord {
  event: GameEvent;
  wasMitigated: boolean;
  impactSummary: string;
  chosenOptionId?: string;
}
