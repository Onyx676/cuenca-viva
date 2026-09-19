import { ClimateStateType, EnsoStateType, ClimateForecast } from './ClimateState';
import { SeasonType } from './Season';
import { SectorState, SectorId } from './Sector';
import { UpgradeState } from './Upgrade';
import { SeasonResult, YearResult } from './Balance';
import { GameEvent, TriggeredEventRecord } from './Event';

export interface GameScenario {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  years: number;
  initialState: {
    money: number;
    publicTrust: number;
    basinHealth: number;
    waterQuality: number;
    reservoirVolume: number;
    reservoirCapacity: number;
    aquiferVolume: number;
    aquiferCapacity: number;
    snowReserve: number;
    climateState: ClimateStateType;
    ensoState: EnsoStateType;
  };
  climate: {
    baseRainfall: number;
    baseSnowfall: number;
    soilInfiltrationRate: number;
    surfaceRunoffRate: number;
    evaporationBase: number;
  };
  demands: Record<SectorId, number>;
}

export interface GameState {
  scenarioId: string;
  scenarioName: string;
  seed: string;
  isClassroomMode: boolean;

  // Progresión temporal (5 años x 4 estaciones = 20 turnos)
  turn: number; // 1 a 20
  year: number; // 1 a 5
  maxYears: number; // 5
  season: SeasonType; // 'WINTER' | 'SPRING' | 'SUMMER' | 'AUTUMN'

  // Economía y métricas sociales
  money: number;
  publicTrust: number; // 0 - 100
  basinHealth: number; // 0 - 100

  // Clima y pronóstico
  climateState: ClimateStateType;
  ensoState: EnsoStateType;
  temperatureAnomaly: number;
  nextSeasonForecast: ClimateForecast;

  // Variables hidrológicas de la estación
  seasonalRainfall: number;
  rainfallIntensity: 'MODERATE' | 'INTENSE' | 'PROLONGED';
  snowReserve: number;
  snowMelt: number;
  riverFlow: number;

  reservoirVolume: number;
  reservoirCapacity: number;

  aquiferVolume: number;
  aquiferCapacity: number;
  aquiferStressLevel: 'HEALTHY' | 'ATTENTION' | 'STRESSED' | 'CRITICAL';

  waterQuality: number; // 0 - 100

  // Balance de asignación estacional
  availableWater: number;
  currentAllocatedTotal: number;
  unallocatedWater: number; // Reserva resultante

  // Sectores y Mejoras
  sectors: Record<SectorId, SectorState>;
  upgrades: Record<string, UpgradeState>;

  // Eventos activos y decisiones
  currentSeasonEvents: TriggeredEventRecord[];
  activeInteractiveEvent: GameEvent | null;

  // Historial
  seasonHistory: SeasonResult[];
  yearHistory: YearResult[];

  // Estados de control de flujo
  isSeasonResolved: boolean;
  isYearEndPhase: boolean; // Se activa al terminar Otoño para realizar mejoras
  isGameOver: boolean;
}
