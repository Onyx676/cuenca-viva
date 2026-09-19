import { ClimateStateType, EnsoStateType } from './ClimateState';
import { SeasonType } from './Season';
import { SectorId } from './Sector';
import { TriggeredEventRecord } from './Event';

export interface SeasonWaterBalance {
  // Entradas de agua estacionales
  seasonRainfall: number;
  rainfallIntensity: 'MODERATE' | 'INTENSE' | 'PROLONGED';
  soilInfiltration: number;
  surfaceRunoff: number;
  evaporatedRain: number;

  snowReserveStart: number;
  snowAccumulated: number;
  snowMelt: number;
  snowReserveEnd: number;

  riverInflow: number;
  riverFlowTotal: number;

  reservoirStart: number;
  reservoirInflow: number;
  reservoirWithdrawal: number;
  reservoirEvaporation: number;
  reservoirSpill: number;
  reservoirEnd: number;

  aquiferStart: number;
  aquiferNaturalRecharge: number;
  aquiferArtificialRecharge: number;
  aquiferWithdrawal: number;
  aquiferEnd: number;

  // Asignaciones y consumos sectoriales
  allocations: Record<SectorId, number>;
  consumptions: Record<SectorId, number>;
  returns: Record<SectorId, number>;
  satisfactions: Record<SectorId, number>;

  // Balances
  totalWaterAvailable: number;
  totalWaterSupplied: number;
  unallocatedStored: number; // Agua no asignada que permanece en reserva

  waterQuality: number;
  basinHealth: number;
  publicTrust: number;
}

export interface SeasonResult {
  turn: number; // 1 a 20
  year: number; // 1 a 5
  season: SeasonType;
  climateState: ClimateStateType;
  ensoState: EnsoStateType;
  balance: SeasonWaterBalance;
  events: TriggeredEventRecord[];
  adviceMessage: string;
}

export interface YearResult {
  year: number;
  seasons: SeasonResult[];
  avgPopSatisfaction: number;
  avgAgriSatisfaction: number;
  avgMinSatisfaction: number;
  avgEcoSatisfaction: number;
  reservoirEnd: number;
  aquiferEnd: number;
  waterQuality: number;
  basinHealth: number;
  publicTrust: number;
  budgetEarned: number;
  summaryMessage: string;
}
