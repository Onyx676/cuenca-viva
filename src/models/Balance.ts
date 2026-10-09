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
  baseFlow: number; // Aporte externo simplificado, no extraído del acuífero modelado
  directRiverIntake: number;
  downstreamFlow: number;
  runoffBypass: number;
  soilEvaporation: number;

  reservoirStart: number;
  reservoirInflow: number;
  reservoirWithdrawal: number;
  reservoirEvaporation: number;
  reservoirSpill: number;
  reservoirEnd: number;

  aquiferStart: number;
  aquiferNaturalRecharge: number;
  aquiferRiverRecharge: number; // Transferencia interna desde el tramo fluvial permeable
  aquiferArtificialRecharge: number;
  aquiferWithdrawal: number;
  aquiferEnd: number;
  aquiferOverflow: number;

  // Asignaciones y consumos sectoriales
  allocations: Record<SectorId, number>;
  suppliedAllocations: Record<SectorId, number>;
  returnQualities: Record<SectorId, number>;
  consumptions: Record<SectorId, number>;
  returns: Record<SectorId, number>;
  satisfactions: Record<SectorId, number>;

  // Balances
  totalWaterAvailable: number;
  totalWaterSupplied: number;
  unallocatedStored: number; // Incrementos positivos netos de almacenamiento, no toda el agua sin asignar
  unmetAllocation: number;
  massBalanceError: number; // Entradas + reservas iniciales − salidas − reservas finales

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
  goalAchieved: boolean;
}

export interface YearResult {
  year: number;
  seasons: SeasonResult[];
  avgPopSatisfaction: number;
  avgAgriSatisfaction: number;
  avgLivestockSatisfaction: number;
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
