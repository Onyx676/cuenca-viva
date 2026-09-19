import seasonsData from '../data/seasons.json';
import { SectorId } from '../models/Sector';
import { SeasonType } from '../models/Season';
import { ClimateStateType } from '../models/ClimateState';

export interface UpgradesActiveMap {
  [upgradeId: string]: number; // level 1, 2, 3
}

export class DemandSystem {
  public calculateDemands(
    baseDemands: Record<SectorId, number>,
    season: SeasonType,
    climateState: ClimateStateType,
    tempModifier: number,
    upgrades: UpgradesActiveMap,
    populationGrowthCount: number
  ): Record<SectorId, number> {
    const demands: Record<SectorId, number> = { ...baseDemands };
    const seasonConfig = (seasonsData as any)[season];
    const sMult = seasonConfig.demandMultipliers;

    // 1. Modulador estacional base (curva estacional del año)
    demands.population = Math.round(demands.population * (sMult.population || 1.0));
    demands.agriculture = Math.round(demands.agriculture * (sMult.agriculture || 1.0));
    demands.livestock = Math.round(demands.livestock * (sMult.livestock || 1.0));
    demands.mining = Math.round(demands.mining * (sMult.mining || 1.0));
    demands.ecosystem = Math.round(demands.ecosystem * (sMult.ecosystem || 1.0));

    // 2. Modificador por calor y clima extremo: en verano caluroso o sequía, la demanda sube aún más
    if (tempModifier > 0) {
      const heatFactor = 1.0 + tempModifier * 0.04;
      demands.agriculture = Math.round(demands.agriculture * heatFactor);
      demands.population = Math.round(demands.population * (1.0 + tempModifier * 0.02));
      demands.livestock = Math.round(demands.livestock * (1.0 + tempModifier * 0.03));
    }

    // 3. Crecimiento demográfico acumulado por eventos urbanos
    if (populationGrowthCount > 0) {
      demands.population = Math.round(demands.population * (1 + populationGrowthCount * 0.10));
    }

    // 4. APLICACIÓN DE MEJORAS (3 Niveles por rama):
    // A. Agricultura: Riego tecnificado (L1: -12%, L2: -30%, L3: -45%)
    let agriLevel = upgrades['riego_eficiente'] || 0;
    let agriRed = agriLevel === 1 ? 0.12 : agriLevel === 2 ? 0.30 : agriLevel >= 3 ? 0.45 : 0;
    // Mantenimiento de canales reduce pérdidas de conducción
    if ((upgrades['mantenimiento_canales'] || 0) >= 2) agriRed += 0.08;
    demands.agriculture = Math.max(5, Math.round(demands.agriculture * (1 - agriRed)));

    // B. Ciudad: Renovación de redes (L1: -10%, L2: -25%, L3: -40%)
    let urbanLevel = upgrades['reparacion_red'] || 0;
    let urbanRed = urbanLevel === 1 ? 0.10 : urbanLevel === 2 ? 0.25 : urbanLevel >= 3 ? 0.40 : 0;
    if ((upgrades['planta_saneamiento'] || 0) >= 2) urbanRed += 0.08; // Reúso de agua tratada
    demands.population = Math.max(5, Math.round(demands.population * (1 - urbanRed)));

    // C. Minería: Recirculación y Circuito Cerrado (L1: -20%, L2: -45%, L3: -85%)
    let minLevel = upgrades['recirculacion_minera'] || 0;
    let minRed = minLevel === 1 ? 0.20 : minLevel === 2 ? 0.45 : minLevel >= 3 ? 0.85 : 0;
    demands.mining = Math.max(2, Math.round(demands.mining * (1 - minRed)));

    // D. Ecosistema y Ganadería
    demands.livestock = Math.max(3, Math.round(demands.livestock));
    demands.ecosystem = Math.max(4, Math.round(demands.ecosystem));

    return demands;
  }
}
